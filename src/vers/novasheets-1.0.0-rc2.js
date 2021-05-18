// NovaSheets 1.0.0-rc2 //

function parse(content, novasheets = new novasheets_1.default()) {
    const r = String.raw;
    const strim = (str) => str.replace(/^\s*(.+?)\s*$/, '$1').replace(/\s+/g, ' ');
    const escapeRegex = (str) => str.replace(/[.*+?^/${}()|[\]\\]/g, '\\$&');
    const number = r `(?:\d*\.?\d+|\d+\.)`;
    const basedNumber = r `(?:-?(?:0x[0-9a-f]*\.?[0-9a-f]+|0b[01]*\.?[01]+|0o[0-7]*\.?[0-7]+|${number}))`;
    const numberUnit = r `\s*(?:em|rem|en|ex|px|pt|pc|ft|in|s|ms|cm|mm|m)\b`;
    const mathChecker = (() => {
        const o = r `\(\s*`, c = r `\s*\)`; // open and close brackets
        const numberValue = r `(?:-?${basedNumber}(?:${numberUnit})?)`;
        const optBracketedNumber = `(?:${o}${numberValue}${c}|${numberValue})`;
        const operators = r `(?:[-^*/+]+\s*(?=\d|\.))`;
        const unbracketed = r `(?:(?:${optBracketedNumber}\s*${operators}\s*)+${numberValue})`;
        return r `\(\s*${unbracketed}\s*\)|${unbracketed}`;
    })();
    const toNumber = (val) => constants.KEEP_NAN ? +val : (isNaN(+val) ? 0 : +val);
    const parseFunction = (name, func, opts = {}) => {
        if (RegExp(mathChecker).test(cssOutput))
            return; // only run after math is parsed
        const match = Array.from(cssOutput.match(RegExp(r `\$\(\s*(?:${name})\b`)) || []);
        if (match.length === 0)
            return;
        const searchString = cssOutput.substr(cssOutput.indexOf(match[0]));
        let segment = '';
        let brackets = 0;
        let hasBrackets = false;
        for (let i = 0; i < searchString.length; i++) {
            // search until the initial bracket is matched
            segment += searchString[i];
            if (brackets > 0)
                hasBrackets = true;
            if (searchString[i] === '(')
                brackets++;
            if (searchString[i] === ')')
                brackets--;
            if (hasBrackets && brackets === 0)
                break;
            if (i === searchString.length - 1 && brackets > 0)
                return; // prevent overflow
        }
        if (!segment.trim())
            return;
        const replacer = opts.trim === false ? /^\$\(|\)$/ : /^\$\(\s*|\s*\)$/g;
        const splitter = opts.trim === false ? '|' : /\s*\|\s*/;
        let parts = segment.replace(replacer, '').split(splitter); // [name, arg1, arg2, ...]
        for (let i = 0; i < constants.MAX_ARGUMENTS; i++) {
            if (!parts[i])
                parts[i] = '';
        }
        if (!opts.allArgs) {
            for (let i = +constants.MAX_ARGUMENTS; i > 0; i--) {
                if (parts[+i]) {
                    parts = parts.slice(0, i + 1);
                    break;
                }
            }
        }
        parts[0] = segment;
        cssOutput = cssOutput.replace(segment, func(...parts));
    };
    // Prepare stylesheet for parsing //
    let styleContents = content
        .replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<') // fix html
        .replace(/(?<![a-z]:)\n?\/\/.*$/gm, '') // remove single-line comments
        .replace(/(?:@var.+?=.*$|@var\s*[^=]*(?=\n\s*@var\s.))(?!\n\s*@endvar)/gm, '$& @endvar') // single-line @var declarations
        .replace(/@(var|const|endvar)/g, '\n$&') // put each declarator on its own line for parsing
        .replace(/@option\s*[A-Z_]+\s*(true|false|[0-9]+)|@endvar/g, '$&\n') // put each const on its own line
        .replace(/}}/g, '} }') // ensure the second brace is not skipped over
        .replace(/calc\(.+?\)/g, '/*/$&/*/'); // skip parsing of calc()
    let commentedContent = [];
    let staticContent = [];
    let lines = styleContents.split('\n');
    let cssOutput = styleContents
        .replace(/\s*(?:@var.*?((?=@var)|@endvar)|@option\s*[A-Z_]+\s*(true|false|[0-9]+))/gms, ' ') // remove syntactic declarations
        .replace(/\/\*(.+?)\*\//gs, (_, a) => {
        if (_.startsWith('/*[') && _.endsWith(']*/'))
            return _.replace(/^\/\*\[(.+)\]\*\/$/, '/*$1*/'); // parsed comment
        if (_.startsWith('/*/') || _.endsWith('/*/'))
            return _; // static comment; skip
        if (commentedContent.indexOf(a) < 0)
            commentedContent.push(a);
        return '/*COMMENT#' + commentedContent.indexOf(a) + '*/';
    }) // store commented content for replacement at end
        .replace(/\/\*\/(.+?)\/\*\//gs, (_, a) => {
        if (staticContent.indexOf(a) < 0)
            staticContent.push(a);
        return '/*STATIC#' + staticContent.indexOf(a) + '*/';
    }); // store static content for replacement at end
    let customVars = {};
    let constants = {
        BUILTIN_FUNCTIONS: true,
        DECIMAL_PLACES: false,
        KEEP_NAN: false,
        KEEP_UNPARSED: false,
        MAX_ARGUMENTS: 10,
        MAX_MATH_RECURSION: 5,
        MAX_RECURSION: 50,
    };
    // Generate a list of lines that start variable declarations //
    for (let i in lines) {
        let matcher;
        if (lines[i].match(/^\s*@var\s/)) {
            let varDeclParts = lines[i].replace(/^\s*@var\s/, '').split('=');
            let linesAfter = lines.slice(+i);
            let varEnding;
            for (let j in linesAfter) {
                if (linesAfter[j].match(/^\s*@endvar\s*$|^\s*@var\s/) && +j !== 0) {
                    varEnding = +j;
                    break;
                }
            }
            let varName = varDeclParts[0].trim().split('|')[0].trim();
            const inlineContent = varDeclParts.slice(1).join('=') || '';
            const blockContent = linesAfter.slice(1, varEnding).join('\n');
            const variables = new RegExp(r `\$\(\s*${varName}\s*\)`, 'g');
            let varContent = (inlineContent + blockContent).trim().replace(variables, customVars[varName] || '');
            customVars[varName] = varContent;
        }
        else if (lines[i].match(matcher = /^\s*@option\s+/)) {
            let [name, val] = lines[i].replace(matcher, '').split(/\s+/);
            const isNotFalse = (val) => val !== '0' && val !== 'false';
            switch (name.toUpperCase()) {
                case 'BUILTIN_FUNCTIONS':
                    constants.BUILTIN_FUNCTIONS = isNotFalse(val);
                    break;
                case 'DECIMAL_PLACES':
                    constants.DECIMAL_PLACES = val !== 'false' && +val;
                    break;
                case 'KEEP_NAN':
                    constants.KEEP_NAN = isNotFalse(val);
                    break;
                case 'KEEP_UNPARSED':
                    constants.KEEP_UNPARSED = isNotFalse(val);
                    break;
                case 'MAX_ARGUMENTS':
                    constants.MAX_ARGUMENTS = parseInt(val);
                    break;
                case 'MAX_MATH_RECURSION':
                    constants.MAX_MATH_RECURSION = parseInt(val);
                    break;
                case 'MAX_RECURSION':
                    constants.MAX_RECURSION = parseInt(val);
                    break;
            }
        }
    }
    // Compile NovaSheets styles //
    const hasNovaSheetsStyles = () => cssOutput.includes('$(') || RegExp(mathChecker).test(cssOutput);
    for (let loop = 0, lastCssOutput; loop < 1 || loop < constants.MAX_RECURSION && hasNovaSheetsStyles(); loop++) {
        if (lastCssOutput === cssOutput)
            break;
        lastCssOutput = cssOutput;
        // Parse math //
        cssOutput = cssOutput.replace(RegExp(r `(?<!#|\w)(${number})\s*e\s*([+-]?${number})`, 'gi'), (_, a, b) => String(+a * 10 ** +b));
        for (let i = 0; i < constants.MAX_MATH_RECURSION; i++) {
            if (!cssOutput.match(RegExp(mathChecker)))
                break;
            cssOutput = cssOutput.replace(RegExp(mathChecker, 'g'), mathMatch => {
                let matchesOnlyBrackets = !/[-+^*/]/.test(mathMatch);
                let containsUnitList = mathMatch.match(RegExp(r `${numberUnit}\s-?${basedNumber}`));
                if (matchesOnlyBrackets || containsUnitList)
                    return mathMatch;
                let numMatch = mathMatch.match(RegExp(numberUnit, 'g')) || [];
                let unit = numMatch.pop() || '';
                let content = mathMatch
                    .replace(RegExp(r `(${number})\s*(${numberUnit})`, 'g'), (_, num, u) => {
                    switch (u) {
                        case 'mm':
                        case 'ms':
                            unit = u[1];
                            return String((toNumber(num) || 0) / 1000);
                        case 'cm':
                            unit = 'm';
                            return String((toNumber(num) || 0) / 100);
                        case 'in':
                            unit = 'm';
                            return String((toNumber(num) || 0) * 0.0254);
                        case 'ft':
                            unit = 'm';
                            return String((toNumber(num) || 0) * 0.3048);
                        default: return _;
                    }
                })
                    .replace(RegExp(numberUnit, 'g'), '')
                    .replace(/--|\+\+/g, '+') // double operators don't work in js
                    .replace(/\^/g, '**'); // '^' is xor operator in js
                try {
                    return eval(content) + unit;
                }
                catch (_a) {
                    return content + unit;
                }
            });
        }
        // Parse variable contents //
        for (let name in customVars) {
            parseFunction(name, (_, ...paramArgs) => {
                let content = customVars[name];
                for (const i in paramArgs) {
                    if (!paramArgs[i])
                        continue;
                    const parts = paramArgs[i].split('=');
                    const param = parts[1] ? strim(parts[0]) : (+i + 1).toString();
                    const arg = parts[1] ? strim(parts[1]) : strim(parts[0]);
                    content = content.replace(RegExp(r `\$\[${param}[^\]]*\]`, 'g'), arg);
                }
                content = content.replace(/\$\[.*?(?:\|([^\]]*))?\]/g, '$1'); // default args
                return content;
            });
        }
        // Parse functions //
        let allFunctions = [];
        if (constants.BUILTIN_FUNCTIONS)
            allFunctions.push(...functions_1.default({ constants }));
        allFunctions.push(...((novasheets === null || novasheets === void 0 ? void 0 : novasheets.getFunctions()) || []));
        for (const obj of allFunctions) {
            parseFunction(obj.name, obj.body);
        }
        let content = '';
        let tokenTree = [{ name: 'Root', content: '', body: [] }];
        let selectorTree = [];
        let rawAtRules = '';
        cssOutput = cssOutput.replace(/@(import|charset|namespace)(.+?);/g, (m) => { rawAtRules += m; return ''; });
        // loop through stylesheet and create a token tree
        for (let i = 0; i < cssOutput.length; i++) {
            const char = cssOutput[i];
            const stylesMatch = /[\w-]+:[^;]+;/g;
            const trailingSelectorMatch = /[^;]+$/;
            let currentToken = tokenTree[tokenTree.length - 1];
            if (char === '{') {
                if (!content)
                    continue;
                let selector = content.replace(stylesMatch, '').trim();
                let styles = content.replace(trailingSelectorMatch, '').trim();
                if (styles) {
                    currentToken.body.push({ name: 'Style', content: styles, body: [] });
                }
                const parentSelector = selectorTree[selectorTree.length - 1] || '';
                const explicitParent = selector.includes('&');
                selector = explicitParent ? selector.replace(/&/g, parentSelector).trim() : parentSelector + ' ' + selector;
                selectorTree.push(selector.trim());
                let newToken = { name: 'Block', content: selector, body: [] };
                currentToken.body.push(newToken);
                currentToken = newToken;
                tokenTree.push(currentToken);
                content = '';
            }
            else if (char === '}') {
                if (tokenTree.length < 1 || !content)
                    continue;
                selectorTree.pop();
                currentToken = tokenTree.pop();
                if (content.trim()) {
                    currentToken.body.push({ name: 'Style', content: content.trim(), body: [] });
                }
                content = '';
            }
            else {
                content += char;
            }
        }
        // clear parsed blocks
        const blockRegex = /[^{}]+{[^{}]*}/gs;
        while (blockRegex.test(cssOutput)) {
            cssOutput = cssOutput.replace(blockRegex, '');
        }
        // move all sub-blocks to root
        let blocks = [];
        const flatten = (obj) => {
            if (!obj)
                return;
            for (const o of obj.body) {
                if (o.name === 'Style')
                    blocks.push({ name: obj.name, content: obj.content, body: [o] });
                else
                    flatten(o);
            }
        };
        flatten(tokenTree[0]);
        // create unnested CSS
        let flattenedOutput = '';
        for (const block of blocks) {
            flattenedOutput += block.content + ' {' + block.body[0].content + '}';
        }
        let compiledOutput = rawAtRules + flattenedOutput + cssOutput;
        const mediaRegex = r `@media[^{}]+(?:\([^()]+?\))+`;
        cssOutput = compiledOutput
            .replace(RegExp(r `(${mediaRegex})\s*(?:{})?(?=\s*@media)`, 'g'), '')
            .replace(RegExp(r `(${mediaRegex})\s*([^{}]+){([^{}]+)}`, 'g'), '$1 { $2 {$3} }');
        // Parse CSS block substitutions //
        //save CSS declarations as variables
        let cssBlocks = {};
        flattenedOutput.replace(/([^{}]+)({.+?})/gms, (_, selector, css) => {
            if (selector.includes('$(') || selector.startsWith('@'))
                return '';
            selector = selector.replace(/\$(<.+?>){1,2}/g, '');
            cssBlocks[escapeRegex(selector.trim())] = css;
            return '';
        });
        //substitute blocks
        for (let name in cssBlocks) {
            cssOutput = cssOutput.replace(new RegExp(r `\$<\s*${name}\s*>`), cssBlocks[name] || '{}');
        }
        cssOutput = cssOutput.replace(/\$<.+?>/g, '{}');
        //parse object notation
        cssOutput = cssOutput.replace(/{([^{}]*?)}\s*<([^[\]]*?)>/gm, (_, css, item) => {
            const statements = css.split(/\s*;\s*/);
            for (const statement of statements) {
                const [attr, val] = statement.split(/\s*:\s*/);
                if (attr.trim() === item.trim())
                    return val || '';
            }
            return '';
        });
        cssOutput = cssOutput.replace(/{([^{}]*?)}\s*!/gm, (_, css) => css);
        // Parse simple breakpoints //
        cssOutput = cssOutput.replace(/([^{}]*?)\s*@\s*(?:(\d+px)(?:\s*\.{2,})?(\s*\d+px)?|(\d+px)?(?:\s*\.{2,})?(\s*\d+px))([^{}]*?){(.*?)}/gms, (_, sel, min1, max1, min2, max2, selAfter, block) => {
            let [min, max] = [min1 || min2, max1 || max2];
            let simpleBreakpoint = r `@\s*(\d+px)?\s*(?:\.{2,})?\s*(\d+px)?`;
            let selMatch = selAfter.match(RegExp(simpleBreakpoint, 'g'));
            if (selMatch)
                [, min, max] = selMatch[selMatch.length - 1].match(RegExp(simpleBreakpoint));
            let selector = (sel + selAfter).replace(RegExp(simpleBreakpoint, 'g'), '');
            let query = 'only screen';
            if (min)
                query += ` and (min-width: ${min})`;
            if (max)
                query += ` and (max-width: ${max}-1px)`;
            return `@media ${query} { ${selector} { ${block} } }`;
        });
        const dupedMediaQuery = /(@media.+?\s*){(.+?)}\s*\1\s*{/gms;
        while (dupedMediaQuery.test(cssOutput)) {
            cssOutput = cssOutput.replace(dupedMediaQuery, '$1{$2');
        }
    }
    // Remove unparsed variables //
    if (!constants.KEEP_UNPARSED) {
        cssOutput = cssOutput.replace(/@endvar/g, '');
        let unparsedContent = cssOutput.match(/\$[[(](.+?)[\])]/g) || [];
        for (const val of unparsedContent) {
            let nssVarName = strim(val.replace(/\$[[(](.*?)(\|.*)?[\])]/, '$1'));
            cssOutput = cssOutput.replace(val, '');
            let type = val.includes('$(') ? 'variable' : 'argument';
            console.log(`<NovaSheets> Instances of unparsed ${type} '${nssVarName}' have been removed from the output.`);
        }
    }
    // Cleanup output //
    cssOutput = cssOutput
        // remove redundant chars
        .replace(/(\s*;)+/g, ';')
        .replace(/(?<!^ *) +/gm, ' ')
        .replace(/}\s*/g, '}\n').replace(/}\s*}/g, '} }')
        // clean up length units
        .replace(/(?<![1-9]+)(0\.\d+)\s*(m|s)/, (_, n, u) => +n * 1000 + 'm' + u)
        .replace(/(?<=\d)0\s*mm/g, 'cm')
        .replace(/(?<=\d)(000\s*mm|00\s*cm)/g, 'm')
        // fix floating point errors
        .replace(/\.?0{10,}\d/g, '')
        .replace(/((\d)\2{9,})\d/g, '$1')
        .replace(/(\d+)([5-9])\2{10,}\d?(?=\D)/g, (_, a) => String(+a + 1))
        .replace(/\d*\.?\d+e-(?:7|8|9|\d{2,})/, '0')
        // cleanup decimal places
        .replace(RegExp(r `((\d)\.\d{0,${constants.DECIMAL_PLACES}})(\d?)\d*`), (_, val, pre, after) => {
        const roundsUp = /[5-9]$/.test(after);
        if (constants.DECIMAL_PLACES === 0)
            return roundsUp ? parseInt(pre) + 1 : pre;
        else
            return roundsUp ? val.replace(/.$/, '') + (parseInt(val.substr(-1)) + 1) : val;
    });
    // re-add comments to output
    for (const i in staticContent) {
        cssOutput = cssOutput.replace(RegExp(r `\/\*STATIC#${i}\*\/`, 'g'), strim(staticContent[i]));
    }
    for (const i in commentedContent) {
        cssOutput = cssOutput.replace(RegExp(r `\/\*COMMENT#${i}\*\/`, 'g'), '/*' + commentedContent[i] + '*/');
    }
    // Return output //
    return cssOutput.trim();
}

function addBuiltInFunctions({ constants }) {
    const novasheets = new (typeof require !== 'undefined' ? require('./novasheets') : novasheets_1.default)();
    const escapeRegex = (str) => str.replace(/[.*+?^/${}()|[\]\\]/g, '\\$&');
    const strim = (str) => str.toString().replace(/^\s*(.+?)\s*$/, '$1').replace(/\s+/g, ' ');
    const r = String.raw;
    /// Loop functions
    novasheets.addFunction('@each', (_, a = '', b = '', c = '', ...rest) => {
        let d = rest.join('|');
        let [items, splitter, joiner, content] = d ? [a, b, c, d] : (c ? [a, b, b, c] : [a, ',', ',', b]);
        let arr = strim(items).split(strim(splitter));
        let output = [];
        for (let i in arr) {
            let parsed = strim(content)
                .replace(/\$i/gi, String(+i + 1))
                .replace(/\$v\[([0-9]+)([-+*/][0-9]+)?\]/g, (_, a, b) => arr[+a - 1 + (b || 0)])
                .replace(/.?\s*undefined/g, '')
                .replace(/\$v/gi, arr[i]);
            output.push(parsed);
        }
        return output.join(joiner);
    }, { trim: false, allArgs: true });
    novasheets.addFunction('@repeat', (_, a, ...b) => {
        let [delim, content] = b[1] ? [b[0], b.slice(1).join('|')] : ['', b.join('|')];
        let output = '';
        for (let i = 0; i < +a; i++) {
            output += (i > 0 ? delim : '') + content.replace(/\$i/gi, (+i + 1).toString());
        }
        return output;
    }, { trim: false, allArgs: true });
    /// Math functions
    const number = r `(?:[0-9]*\.?[0-9]+)`;
    const basedNumber = r `(?:0x[0-9a-f]*\.?[0-9a-f]+|0b[01]*\.?[01]+|0o[0-7]*\.?[0-7]+|${number})`;
    const toNum = (val) => constants.KEEP_NAN ? +val : (Number.isNaN(val) ? 0 : parseFloat(val + ""));
    const testNaN = (arg, def) => {
        let test = !arg || arg === Infinity || Number.isNaN(arg);
        if (test && constants.KEEP_NAN)
            return 'NaN';
        else if (test && !constants.KEEP_NAN)
            return def || 0;
        else if (Math.abs(+arg) <= 1e-7)
            return 0;
        else
            return +arg;
    };
    novasheets.addFunction('@e', () => Math.E);
    novasheets.addFunction('@pi', () => Math.PI);
    novasheets.addFunction('@mod', (_, a, b) => testNaN(toNum(a) % toNum(b), a));
    novasheets.addFunction('@sin', (_, a) => testNaN(Math.sin(toNum(a)), a));
    novasheets.addFunction('@asin', (_, a) => testNaN(Math.asin(toNum(a)), a));
    novasheets.addFunction('@cos', (_, a) => testNaN(Math.cos(toNum(a)), a));
    novasheets.addFunction('@acos', (_, a) => testNaN(Math.acos(toNum(a)), a));
    novasheets.addFunction('@tan', (_, a) => testNaN(Math.tan(toNum(a)), a));
    novasheets.addFunction('@atan', (_, a) => testNaN(Math.atan(toNum(a)), a));
    novasheets.addFunction('@abs', (_, a) => testNaN(Math.abs(toNum(a)), a));
    novasheets.addFunction('@floor', (_, a) => testNaN(Math.floor(toNum(a)), a));
    novasheets.addFunction('@ceil', (_, a) => testNaN(Math.ceil(toNum(a)), a));
    novasheets.addFunction('@percent', (_, a) => testNaN(toNum(a) * 100, a) + '%');
    novasheets.addFunction('@log', (_, base, num) => testNaN(Math.log(+num) / (base ? Math.log(+base) : 1), num));
    novasheets.addFunction('@root', (_, a, b) => testNaN(Math.pow(toNum(b) ? toNum(b) : toNum(a), 1 / (toNum(b) ? toNum(a) : 2)), b));
    novasheets.addFunction('@round', (_, a, b) => {
        let num = toNum(a) + Number.EPSILON;
        let dp = Math.pow(10, toNum(b) || 0);
        return testNaN(Math.round(num * dp) / dp, a);
    });
    novasheets.addFunction('@min|@max', (_, ...a) => {
        let nums = [];
        for (let item of a)
            if (item)
                nums.push(+item);
        let output = Math[_.includes('@min') ? 'min' : 'max'](...nums);
        return testNaN(output, '0');
    });
    novasheets.addFunction('@clamp', (_, a, b, c) => {
        let [val, min, max] = [toNum(a), toNum(b), toNum(c)];
        if (max < min)
            [min, max] = [max, min];
        let output = val <= min ? min : (val >= max ? max : val);
        return testNaN(output, a);
    });
    novasheets.addFunction('@degrees|@radians|@gradians', (_, a) => {
        let num = +a.replace(/[a-z]+/, '');
        let type = a.replace(RegExp(number), '');
        let output = toNum(a);
        if (_.includes('@degrees')) {
            if (type === 'grad')
                output = num * 0.9;
            else
                output = num / Math.PI * 180; // default to radians
        }
        else if (_.includes('@radians')) {
            if (type === 'grad')
                output = num * Math.PI / 200;
            else
                output = +num * Math.PI / 180; // default to degrees
        }
        else if (_.includes('@gradians')) {
            if (type === 'rad')
                output = num / Math.PI * 200;
            else
                output = num / 0.9; // default to degrees
        }
        return testNaN(output, a);
    });
    /// Text functions
    novasheets.addFunction('@lowercase', (_, a) => a.toLowerCase());
    novasheets.addFunction('@uppercase', (_, a) => a.toUpperCase());
    novasheets.addFunction('@titlecase', (_, a) => a.replace(/\b\w/g, a => a.toUpperCase()));
    novasheets.addFunction('@capitali[sz]e', (_, a) => a[0].toUpperCase() + a.substr(1));
    novasheets.addFunction('@uncapitali[sz]e', (_, a) => a[0].toLowerCase() + a.substr(1));
    novasheets.addFunction('@extract', (_, a, b, c) => a.split(c ? b : ',')[Number(c ? c : b) - 1] || '');
    novasheets.addFunction('@encode', (_, a) => encodeURIComponent(a));
    novasheets.addFunction('@length', (_, a) => strim(a).length);
    novasheets.addFunction('@replace', (_, ...args) => {
        var _a;
        if (args.length < 3)
            args = [args[0], args[1] || '', args[2] || ''];
        args = args.slice(0, args.indexOf('') <= 3 ? 3 : args.indexOf(''));
        let text = strim(args[0]);
        let finder = strim(args.slice(1, -1).join('|'));
        let replacer = strim(args.slice(-1)[0]);
        let isRegex = finder.startsWith('/');
        let regexFinder = RegExp('');
        if (isRegex) {
            let parts = ((_a = strim(finder).match(/\/(.+?)\/([gimusy]*)/)) === null || _a === void 0 ? void 0 : _a.slice(1)) || [];
            regexFinder = RegExp(parts[0], parts[1] || 's');
        }
        return text.replace(isRegex ? regexFinder : RegExp(escapeRegex(finder), 'g'), replacer);
    }, { trim: false, allArgs: true });
    /// Colour functions
    const toPercent = (val) => Math.floor(+val / 255 * 100);
    const fromPercent = (val) => Math.ceil(Number(val.replace('%', '')) * 255 / 100);
    const toHex = (val) => Number(val).toString(16).padStart(2, '0');
    const rgbFromHex = (hex, alpha) => {
        let num = parseInt(hex.replace(/#?(.{0,8})$/, '$1'), 16);
        let r = (num >> 16) & 255;
        let g = (num >> 8) & 255;
        let b = num & 255;
        let a = alpha ? toPercent(parseInt(alpha, 16)) : null;
        if (a === null)
            return `rgb(${r}, ${g}, ${b})`;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    };
    const parseHex = (val) => {
        let a = val.replace('#', '');
        switch (a.length) {
            case 0: return rgbFromHex('000000', '00');
            case 1: return rgbFromHex(a.repeat(6));
            case 2: return rgbFromHex(a[0].repeat(6), a[1].repeat(2));
            case 3: return rgbFromHex(a[0] + a[0] + a[1] + a[1] + a[2] + a[2]);
            case 4: return rgbFromHex(a[0] + a[0] + a[1] + a[1] + a[2] + a[2], a[3] + a[3]);
            default: return rgbFromHex(a.substr(0, 6).padEnd(6, '0'), a.substr(6, 2) || undefined);
        }
    };
    const getRawColorParts = (col) => col.replace(/^\s*\w{3}a?\s*\(\s*|\s*\)$/g, '').split(/,\s*/);
    const getColorParts = (color) => {
        let parts = getRawColorParts(color.startsWith('#') ? parseHex(color) : color);
        for (let i in parts) {
            let num = parts[i];
            if (!parts[i]) {
                parts[i] = "0";
            }
            else if (parts[i].includes('%')) {
                num = num.replace('%', '');
                if (color.includes('hsl'))
                    parts[i] = Math.round(+num / 100 * (+i === 0 ? 360 : 100)).toString();
                else
                    parts[i] = fromPercent(num).toString();
            }
            else if (+i === 3) {
                parts[i] = Math.round(color.includes('rgb') ? +num / 255 : +num / 100).toString();
            }
        }
        return parts;
    };
    const hexFromRgb = (rgb) => {
        let [r, g, b, a] = Array.isArray(rgb) ? rgb : getColorParts(rgb);
        return '#' + toHex(r) + toHex(g) + toHex(b) + (toNum(a) > 0 ? toHex(a) : '');
    };
    const blendColors = (color1, color2, amt) => {
        var _a;
        if (!color2)
            return color1 || '';
        let type = ((_a = color1.match(/^[a-z]{3}a?|^#/)) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        let amount = amt.includes('%') ? +amt.replace('%', '') / 100 : +amt;
        amount = Math.min(Math.abs(amount), 1);
        const blendVal = (a, b) => Math.floor((toNum(a) * (1 - amount) + toNum(b) * (amount)));
        let [[r1, g1, b1, a1], [r2, g2, b2, a2]] = [getColorParts(color1), getColorParts(color2)];
        let [r, g, b, a] = [blendVal(r1, r2), blendVal(g1, g2), blendVal(b1, b2), blendVal(a1, a2)];
        switch (type) {
            case 'rgba': return `rgba(${r}, ${g}, ${b}, ${a})`;
            case 'rgb': return `rgb(${r}, ${g}, ${b})`;
            case 'hsla': return `hsla(${r % 360}, ${g / 100}%, ${b / 100}%, ${a})`;
            case 'hsl': return `hsla(${r % 360}, ${g / 100}%, ${b / 100}%)`;
            case '#': return hexFromRgb([r, g, b, a]);
            default: return `${type}(${r}, ${g}, ${b})`;
        }
    };
    const blendGrayscaleHsl = (type, color1, color2, amt) => {
        var _a;
        if (!color1.includes('hsl'))
            return blendColors(color1, color2, amt || '50%');
        let [h, s, l, a] = getColorParts(color1);
        let amount = +amt.replace('%', '');
        let sNew = +s - amount;
        let lNew = +l + amount * (type === 'darken' ? -1 : 1);
        let sl = type === 'desat' ? `${sNew}%, ${l}%` : `${s}%, ${lNew < 0 ? 0 : lNew}%`;
        return `${((_a = color1.match(/^hsla?/)) === null || _a === void 0 ? void 0 : _a.toString()) || 'hsl'}(${+h % 360}, ${sl}${a ? `, ${a}` : ''})`;
    };
    novasheets.addFunction('@colou?r', (_, type, a = '0', b = '0', c = '0', d = '') => {
        if (/#|rgba?|hsla?/i.test(a)) {
            if (a.includes('#'))
                a = parseHex(a);
            if (/rgba?|hsla?/.test(a))
                [a, b, c, d] = getColorParts(a);
        }
        else {
            [a, b, c, d] = getColorParts(`${type}(${a}, ${b}, ${c}, ${d})`);
        }
        switch (type = type.toLowerCase()) {
            case '#':
            case 'hash':
            case 'hex':
            case 'hexadecimal': return '#' + toHex(a) + toHex(b) + toHex(c) + (d ? toHex(fromPercent(d)) : '');
            case 'rgb': return `rgb(${a}, ${b}, ${c})`;
            case 'rgba': return `rgba(${a}, ${b}, ${c}, ${d || +d === 0 ? 100 : ''}%)`;
            case 'hsl': return `hsl(${toNum(a) % 360}, ${b}%, ${c}%)`;
            case 'hsla': return `hsla(${toNum(a) % 360}, ${b}%, ${c}%, ${d || +d === 0 ? 100 : ''}%)`;
            default: return `${type}(${a} ${b} ${c}${d ? ` / ${d}` : ''})`;
        }
    });
    novasheets.addFunction('@colou?rpart', (_, a = '', b = '') => {
        let [part, color] = [a.toLowerCase(), b.toLowerCase()];
        let parts = getColorParts(color);
        const obj = { r: parts[0], h: parts[0], g: parts[1], s: parts[1], b: parts[2], l: parts[2], a: parts[3] };
        return obj[part[0]] || color;
    });
    novasheets.addFunction('@spin', (_, color, amount) => {
        let oldHue = color.replace(/^hsla?\s*\((\d+),\s*.+\s*\)\s*$/g, '$1');
        let newHue = ((+oldHue + +amount) % 360).toString();
        return color.replace(oldHue, newHue);
    });
    novasheets.addFunction('@blend', (_, color1, color2, amount) => blendColors(color1, color2, amount || '50%'));
    novasheets.addFunction('@tint|@lighten', (_, color, amount) => blendGrayscaleHsl('lighten', color, '#fff', amount || '50%'));
    novasheets.addFunction('@shade|@darken', (_, color, amount) => blendGrayscaleHsl('darken', color, '#000', amount || '50%'));
    novasheets.addFunction('@tone|@desaturate', (_, color, amount) => blendGrayscaleHsl('desat', color, '#808080', amount || '50%'));
    const parseLuma = (arg, rgb) => {
        if (!(arg.startsWith('rgb') || arg.startsWith('#')))
            return +arg;
        let [r, g, b] = rgb ? [...rgb] : getColorParts(arg);
        const adjustGamma = (a) => ((a + 0.055) / 1.055) ** 2.4;
        const getLuma = (a) => a <= 0.03928 ? a / 12.92 : adjustGamma(a);
        return 0.2126 * getLuma(+r / 255) + 0.7152 * getLuma(+g / 255) + 0.0722 * getLuma(toNum(b) / 255); // ITU-R BT.709
    };
    novasheets.addFunction('@luma', (_, color) => parseLuma(color));
    novasheets.addFunction('@contrast', (_, color, light = '', dark = '') => {
        const isDark = parseLuma(color) < 0.5;
        return isDark ? light : dark;
    });
    novasheets.addFunction('@gr[ae]yscale', (_, color) => {
        if (color.startsWith('hsl'))
            return color.replace(/^(hsla?)\s*\(\s*(\d+),\s*(\d+)/, '$1($2, 0');
        let gray = Math.round(parseLuma(color) * 255);
        let newColor = `rgb(${Array(3).fill(gray).join(', ')})`;
        if (color.startsWith('#'))
            return hexFromRgb(newColor);
        else
            return newColor;
    });
    /// Logical functions
    const bracketedNumber = r `(?:\(\s*${basedNumber}\s*\)|${basedNumber})`;
    const logicRegex = (arg) => RegExp(r `([+-]?${bracketedNumber})\s*(?:${arg})\s*([+-]?${bracketedNumber})`);
    const parseLogic = (arg) => {
        if (!/^([<>=!&|()-\d\s]|true|false|undefined|null|NaN|x?n?or|n?and)+$/.test(arg))
            return arg;
        for (let i = 0; i < constants.MAX_ARGUMENTS; i++) {
            arg = strim(arg)
                .replace(/(?:'(.+?)'|"(.+?)")+/, '$1$2') // remove quotes
                .replace(/\bor\b/gi, '||').replace(/\band\b/gi, '&&').replace(/\bnot\b/gi, '!') // default logical operators
                .replace(/(.+?)\bnor\b(.+)?/gi, '!($1) && !($2)') // 'nor' logical operator
                .replace(/(.+?)\bnand\b(.+)?/gi, '!($1) || !($2)') // 'nand' logical operator
                .replace(/(.+?)\bxor\b(.+)?/gi, '($1 && !($2)) || (!($1) && $2)') // 'xor' logical operator
                .replace(/(.+?)\bxnor\b(.+)?/gi, '$1 == $2') // 'xnor' logical operator
                .replace(/(?!=)(!?)=(==)?(?!=)/g, '$1$2==') // normalise equality signs
            ;
        }
        if (/(<|<=|>|>=|==|!=|&|!|\|)/.test(arg))
            arg = eval(arg);
        if (['false', 'undefined', 'null', 'NaN', ''].includes(arg))
            arg = 'false';
        return arg;
    };
    novasheets.addFunction('@bitwise', (_, a) => {
        let arg = a;
        for (let i = 0; i < constants.MAX_ARGUMENTS; i++) {
            arg = arg
                .replace(RegExp(r `(?:~|!|not)\s*([+-]?${bracketedNumber})`), (_, a) => eval('~' + toNum(a))) // bitwise not
                .replace(logicRegex('or|\\|'), (_, a, b) => eval(`(${toNum(a)}) | (${toNum(b)})`)) // bitwise or
                .replace(logicRegex('nor'), (_, a, b) => eval(`~ (${toNum(a)}) | (${toNum(b)})`)) // bitwise nor
                .replace(logicRegex('and|&'), (_, a, b) => eval(`(${toNum(a)}) & (${toNum(b)})`)) // bitwise and
                .replace(logicRegex('nand'), (_, a, b) => eval(`~ (${toNum(a)}) & (${toNum(b)})`)) // bitwise nand
                .replace(logicRegex('xor'), (_, a, b) => eval(`(${toNum(a)}) ^ (${toNum(b)})`)) // bitwise xor
                .replace(logicRegex('xnor'), (_, a, b) => eval(`~ (${toNum(a)}) ^ (${toNum(b)})`)) // bitwise xnor
            ;
        }
        return arg;
    });
    novasheets.addFunction('@boolean', (_, ...a) => parseLogic(a.join('|')));
    novasheets.addFunction('@if', (_, a, b = '', c = '') => parseLogic(a) ? b : c);
    /// CSS functions
    novasheets.addFunction('@breakpoint', (_, a = '0', b = '', c = '', d = '') => {
        if (!a)
            return _;
        const makeQuery = (type, width, content) => {
            return `@media (${type}-width: ${width.trim()}${type === 'max' ? '-1px' : ''}) { ${content}}`;
        };
        let isBlock = (b + c).includes('{');
        let content = isBlock ? [b, c] : [`${b} {${c}} `, `${b} {${d}} `];
        let ltContent = (isBlock ? b : c).trim() ? makeQuery('max', a, content[0]) : '';
        let gtContent = (isBlock ? c : d).trim() ? makeQuery('min', a, content[1]) : '';
        return ltContent + (ltContent && gtContent ? '\n' : '') + gtContent;
    }, { trim: false });
    novasheets.addFunction('@prefix', (_, a, b) => {
        return `-webkit-${a}: ${b}; -moz-${a}: ${b}; -ms-${a}: ${b}; -o-${a}: ${b}; ${a}: ${b};`;
    });
    // Return
    return novasheets.getFunctions();
}

class NovaSheets {
    constructor() {
        this.functions = [];
    }
    static parse(rawInput = '', novasheets = new NovaSheets()) {
        return parse_1.default(rawInput, novasheets);
    }
    static compile(input, output = '', novasheets = new NovaSheets()) {
        return compile_1.default(input, output, novasheets);
    }
    addFunction(name, body, options = {}) {
        this.functions.push({ name, body, options });
        return this;
    }
    getFunctions() {
        return this.functions;
    }
}

function parseNovaSheets(rawInput = '', novasheets) {
    if (rawInput)
        return parse_1.default(rawInput, novasheets);
    const hashCode = (str, length = 8) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++)
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
        return Math.abs(hash).toString(16).substring(0, length).padStart(length, '0');
    };
    const { stylesheetContents, sources } = prepare(rawInput);
    for (let i in stylesheetContents) {
        const cssOutput = parse_1.default(stylesheetContents[i], novasheets);
        if (document.querySelectorAll(`[data-hash="${hashCode(cssOutput)}"]`).length)
            return; // prevent duplicate outputs
        let styleElem = document.createElement('style');
        styleElem.innerHTML = '\n' + cssOutput.trim() + '\n';
        styleElem.dataset.hash = hashCode(cssOutput);
        styleElem.dataset.source = sources[i];
        (document.head || document.body).appendChild(styleElem);
    }
}
function prepare(rawInput = '') {
    // Generate list of NovaSheet files and get the contents of each stylesheet
    if (rawInput)
        return { stylesheetContents: [rawInput], sources: ['raw'] };
    let stylesheetContents = [];
    let sources = [];
    let externalSheets = Array.from(document.querySelectorAll('link[rel="novasheet" i], link[rel="novasheets" i]'));
    let inlineSheets = Array.from(document.querySelectorAll('[type="novasheet" i], [type="novasheets" i]'));
    let fileNames = { full: [], rel: [] };
    for (let sheet of externalSheets) {
        fileNames.full.push(sheet.href);
        fileNames.rel.push(sheet.href);
    }
    ;
    for (let i in fileNames.full) {
        //await fetch(fileNames.full[i]).then(data => data.text()).then(text => stylesheetContents.push(text)).catch(err => console.warn(`<NovaSheets> File '${fileNames.rel[i]}' is inacessible.`, err));
        let req = new XMLHttpRequest();
        req.open("GET", fileNames.full[i], false);
        req.send();
        stylesheetContents.push(req.responseText);
        sources.push(fileNames.rel[i]);
    }
    for (let contents of inlineSheets) {
        let content = (contents instanceof HTMLInputElement && contents.value) || contents.innerHTML || contents.innerText;
        stylesheetContents.push(content.replace(/^\s*`|`\s*$/, ''));
        sources.push('inline');
    }
    ;
    return { stylesheetContents, sources };
}

function compileNovaSheets() { /* Not for browser */ }
const parse_1 = {default: parse}
const compile_1 = {default: compileNovaSheets}
const functions_1 = {default: addBuiltInFunctions}
const novasheets_1 = {default: NovaSheets}

document.addEventListener('DOMContentLoaded', () => parseNovaSheets());
