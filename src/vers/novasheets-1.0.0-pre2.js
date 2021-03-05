// NovaSheets 1.0.0-pre2 //

function run(rawInput = '', novasheets) {
    return parse(prepare(rawInput), novasheets);
}
function prepare(rawInput = '') {
    // Generate list of NovaSheet files and get the contents of each stylesheet
    let stylesheetContents = [];
    let sources = [];
    let externalSheets;
    let inlineSheets;
    if (rawInput) {
        stylesheetContents = [rawInput.toString()];
        sources = ['raw'];
    }
    else {
        externalSheets = Array.from(document.querySelectorAll('link[rel="novasheet" i], link[rel="novasheets" i]'));
        inlineSheets = Array.from(document.querySelectorAll('[type="novasheet" i], [type="novasheets" i]'));
        let fileNames = { full: [], rel: [] };
        for (let sheet of externalSheets) {
            fileNames.full.push(sheet.href);
            fileNames.rel.push(sheet.href);
        }
        ;
        for (let i in fileNames.full) {
            /*const response = fetch(fileNames.full[i])
              .then(data => data)
              .catch(err => console.warn(`<NovaSheets> File '${fileNames.rel[i]}' cannot be accessed.`, err));*/
            let req = new XMLHttpRequest();
            req.open("GET", fileNames.full[i], false);
            req.send();
            if (req.status == 404)
                throw 404;
            let response = req.responseText;
            stylesheetContents.push(response);
            sources.push(fileNames.rel[i]);
        }
        for (let contents of inlineSheets) {
            let content = (contents instanceof HTMLInputElement && contents.value) || contents.innerHTML || contents.innerText;
            stylesheetContents.push(content.replace(/^\s*`|`\s*$/, ''));
            sources.push('inline');
        }
        ;
    }
    return { rawInput, stylesheetContents, sources };
}
function parse({ rawInput, stylesheetContents, sources }, NovaSheets) {
    const r = String.raw;
    const strim = (str) => str.replace(/^\s*(.+?)\s*$/, '$1').replace(/\s+/g, ' ');
    const hashCode = (str, length = 8) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++)
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
        return Math.abs(hash).toString(16).substring(0, length).padStart(length, '0');
    };
    const escapeRegex = (str) => str.replace(/[.*+?^/${}()|[\]\\]/g, '\\$&');
    // Loop through each sheet, parsing the NovaSheet styles
    for (let s in stylesheetContents) {
        // Functions for later use
        const number = r `(?:[0-9]*\.?[0-9]+)`;
        const basedNumber = r `(?:-?(?:0x[0-9a-f]*\.?[0-9a-f]+|0b[01]*\.?[01]+|0o[0-7]*\.?[0-7]+|${number}))`;
        const numberUnit = r `\s*(?:em|rem|en|ex|px|pt|pc|cm|mm|m(?![ms])|ft|in|s|ms)`;
        const mathChecker = () => {
            const o = r `\(\s*`, c = r `\s*\)`; // open and close brackets
            const numberValue = r `(?:-?${basedNumber}(?:${numberUnit})?)`;
            const optBracketedNumber = `(?:${o}${numberValue}${c}|${numberValue})`;
            const operators = r `(?:[-^*/+]+\s*(?=\d|\.))`;
            let unbracketed = r `(?:(?:${optBracketedNumber}\s*${operators}\s*)+${numberValue})`;
            return r `\(\s*${unbracketed}\s*\)|${unbracketed}`;
        };
        const toNumber = (val) => constants.KEEP_NAN ? Number(val) : (isNaN(Number(val)) ? '' : Number(val));
        const parseFunction = function (name, func, { nonest, notrim, allargs } = {}) {
            const match = cssOutput.match(RegExp(r `\$\(\s*(?:${name})\b`));
            if (!match)
                return;
            const searchString = cssOutput.substr(cssOutput.indexOf(match[0]));
            let segment = '', brackets = 0, hasBrackets;
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
                if (i == searchString.length - 1 && brackets > 0)
                    return; // prevent overflow
            }
            if (!segment.trim() || (nonest && segment.match(/.+\$\(/)))
                return;
            const replacer = r `^\$\(${notrim ? '|' : r `\s*|\s*`}\)$`;
            const splitter = notrim ? '|' : /\s*\|\s*/;
            let parts = segment.replace(RegExp(replacer, 'g'), '').split(splitter); // [name, arg1, arg2, ...]
            for (let i = 0; i < constants.MAX_ARGUMENTS; i++) {
                if (parts[i] == undefined)
                    parts[i] = '';
            }
            if (!allargs) {
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
        // Prepare stylesheet for parsing
        stylesheetContents[s] = stylesheetContents[s]
            .replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<') // fix html
            .replace(/(?<![a-z]+:)\n?\/\/.*$/gm, '') // remove single-line comments
            .replace(/(?:@var.+?=.*$|@var\s*[^=]*(?=\n\s*@var\s.))(?!\n\s*@endvar)/gm, '$& @endvar') // single-line @var declarations
            .replace(/@(var|const|endvar)/g, '\n$&') // put each declarator on its own line for parsing
            .replace(/@option\s*[A-Z_]+\s*(true|false|[0-9]+)|@endvar/g, '$&\n') // put each const on its own line
        ;
        let lines = stylesheetContents[s].split('\n');
        let cssOutput = '';
        let commentedContent = [];
        let staticContent = [];
        for (let i in lines) {
            lines[i] = lines[i].replace(/[\r\n]/g, ' '); // remove whitespace
            cssOutput += '\n' + lines[i];
        }
        cssOutput = cssOutput
            .replace(/\s*(?:@var.*?((?=@var)|@endvar)|@option\s*[A-Z_]+\s*(true|false|[0-9]+))/gms, ' ') // remove NSS declarations
            .replace(/\/\*(.+?)\*\//gs, (_, a) => {
            if (_.startsWith('/*[') && _.endsWith(']*/'))
                return _.replace(/^\/\*\[(.+)\]\*\/$/, '/*$1*/');
            if (_.startsWith('/*/') || _.endsWith('/*/'))
                return _;
            if (commentedContent.indexOf(a) < 0)
                commentedContent.push(a);
            return '/*COMMENT#' + commentedContent.indexOf(a) + '*/';
        }) // store commented content for later use
            .replace(/\/\*\/(.+?)\/\*\//gs, (_, a) => {
            if (staticContent.indexOf(a) < 0)
                staticContent.push(a);
            return '/*STATIC#' + staticContent.indexOf(a) + '*/';
        }) // store static content for later use
        ;
        let customVars = {};
        let cssBlocks = {};
        const constants = {
            BUILTIN_FUNCTIONS: true,
            DECIMAL_PLACES: false,
            KEEP_NAN: false,
            KEEP_UNPARSED: false,
            MAX_ARGUMENTS: 10,
            MAX_MATH_RECURSION: 5,
            MAX_RECURSION: 50,
        };
        // Generate a list of lines that start variable declarations
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
                const varRegex = new RegExp(r `\$\(\s*${varName}\s*\)`, 'g');
                let varContent = (inlineContent + blockContent).trim().replace(varRegex, customVars[varName] || '');
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
        // Save CSS declarations as variables
        cssOutput.replace(/([^{}]+)({.+?})/gms, (_, selector, css) => {
            if (selector.includes('$(') || selector.startsWith('@'))
                return '';
            cssBlocks[escapeRegex(selector.trim().replace(/>/g, ':GT:'))] = css;
            return '';
        });
        // Compile NovaSheets styles
        const hasNovaSheetsStyles = (content) => (content.includes('$(')
            || RegExp(mathChecker()).test(content)
            || /&%</.test(content));
        for (let loop = 0, lastCssOutput; loop < 1 || loop < constants.MAX_RECURSION && hasNovaSheetsStyles(cssOutput); loop++) {
            if (lastCssOutput === cssOutput)
                break;
            lastCssOutput = cssOutput;
            // Parse CSS block substitutions
            for (let name in cssBlocks) {
                cssOutput = cssOutput.replace(new RegExp(r `\$<\s*${name.replace(/:GT:/g, '>')}\s*>`), cssBlocks[name] || '{}');
            }
            cssOutput = cssOutput.replace(/\$<.+?>/g, '{}');
            /*/ Parse nesting
            const last = (arr, i=1) => arr[arr.length-i]
            let selectors = [['', '']];
            for (let i = 0; i < cssOutput.length; i++) {
                const c = cssOutput[i];
                if (c === '{') {
                    selectors.push(['', '']);
                    let [rawSelector, selector] = last(selectors,1);
                    let parsedSelector = selector.replace(/&/g, last(selectors,1)?.[1] || '');
                    cssOutput = cssOutput.replace(rawSelector, parsedSelector);
                }
                else if (c === '}') {
                    for (let i = selectors.length - 1; i >= 0; i--) {
                        let [rawSelector, selector] = selectors[i];
                        let parsedSelector = selector.replace(/&/g, selectors[i - 1]?.[1] || '');
                        cssOutput = cssOutput.replace(rawSelector, parsedSelector);
                    }
                    selectors.pop();
                }
                else {
                    if (selectors.length > 0) {
                        last(selectors,1)[0] += c;
                        last(selectors,1)[1] += c.replace(/&/g, last(selectors,2)?.[1] || '');
                    }
                }
            }//*/
            // Parse math
            cssOutput = cssOutput.replace(/(?<!#)\b(\d+)\s*[Ee]\s*(-?\d+)/g, (_, a, b) => String(+a * 10 ** +b));
            for (let i = 0; i < constants.MAX_MATH_RECURSION; i++) {
                if (!cssOutput.match(RegExp(mathChecker())))
                    break;
                cssOutput = cssOutput.replace(RegExp(mathChecker(), 'g'), mathMatch => {
                    let matchesOnlyBrackets = !mathMatch.match(/[-+Ee^*/]/);
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
                        .replace(/\^/g, '**') // '^' is xor operator in js
                    ;
                    try {
                        return eval(content) + unit;
                    }
                    catch {
                        return content + unit;
                    }
                });
            }
            // Parse variable contents
            for (let name in customVars) {
                parseFunction(name, (_, ...paramArgs) => {
                    let content = customVars[name];
                    for (let i in paramArgs) {
                        if (!paramArgs[i])
                            continue;
                        let parts = paramArgs[i].split('=');
                        let param = parts[1] ? strim(parts[0]) : +i + 1;
                        let arg = parts[1] ? strim(parts[1]) : strim(parts[0]);
                        content = content.replace(RegExp(r `\$\[${param}[^\]]*\]`, 'g'), arg);
                    }
                    content = content.replace(/\$\[.*?(?:\|([^\]]*))?\]/g, '$1'); // default args
                    return content;
                });
            }
            // Parse prev selectors
            for (let i = 0, lastOutput; cssOutput.indexOf('%') > -1 && i++ < constants.MAX_RECURSION; i++) { // % takes the prev
                if (cssOutput === lastOutput)
                    break;
                lastOutput = cssOutput;
                const selector = /([^{}|()]+?){[^{}]*?}[^{}]*?%[^{}]*?{/g;
                if (!cssOutput.match(selector))
                    break;
                cssOutput = cssOutput.replace(selector, (_, a) => {
                    if (a.includes('%'))
                        return _; // for next pass
                    return _.replace(/(?<!\d)%/g, strim(a));
                });
            }
            for (let i = 0, lastOutput; cssOutput.indexOf('&') > -1 && i++ < constants.MAX_RECURSION; i++) { // & takes the prev parent
                if (cssOutput === lastOutput)
                    break;
                lastOutput = cssOutput;
                const selector = /([^{}|()]+?){[^{}]*?}([^{}]*?&[^{}?]*?{[^{}]*})+/g;
                if (!cssOutput.match(selector))
                    break;
                cssOutput = cssOutput.replace(selector, (_, a) => {
                    if (a.includes('&'))
                        return _; // for next pass
                    return _.replace(/&/g, strim(a) + (a.match(/(?<!\d)%/) ? '<' : ''));
                });
            }
            for (let i = 0, lastOutput; cssOutput.indexOf('<') > -1 && i++ < constants.MAX_RECURSION; i++) {
                if (cssOutput === lastOutput)
                    break;
                lastOutput = cssOutput;
                const selector = /[>+~\s]\s*[^&%{}>+~\s<]+\s*</g;
                if (!cssOutput.match(selector))
                    break;
                cssOutput = cssOutput.replace(selector, '');
            }
            // Parse object notation
            cssOutput = cssOutput.replace(/{([^{}]*?)}\s*<([^[\]]*?)>/gm, (_, css, item) => {
                const statements = css.split(/\s*;\s*/);
                for (let i in statements) {
                    const [attr, val] = statements[i].split(/\s*:\s*/);
                    if (attr.trim() === item.trim())
                        return val || '';
                }
                return '';
            });
            cssOutput = cssOutput.replace(/{([^{}]*?)}\s*!/gm, (_, css) => css);
            // Parse simple breakpoints
            cssOutput = cssOutput.replace(/([^{}]*?)\s*@\s*(?:(\d+px)(?:\s*\.{2,})?(\s*\d+px)?|(\d+px)?(?:\s*\.{2,})?(\s*\d+px))([^{}]*?){(.*?)}/gm, (_, sel, min1, max1, min2, max2, selAfter, block) => {
                let [min, max] = [min1 || min2, max1 || max2];
                let simpBrkpRegex = r `@\s*(\d+px)?\s*(?:\.{2,})?\s*(\d+px)?`;
                let selMatch = selAfter.match(RegExp(simpBrkpRegex, 'g'));
                if (selMatch)
                    [, min, max] = selMatch[selMatch.length - 1].match(RegExp(simpBrkpRegex));
                let selector = (sel + selAfter).replace(RegExp(simpBrkpRegex, 'g'), '');
                let query = 'only screen';
                if (min)
                    query += ` and (min-width: ${min})`;
                if (max)
                    query += ` and (max-width: ${max}-1px)`;
                return `@media ${query} { ${selector} { ${block} } }`;
            });
            // Parse functions
            let allFunctions = [];
            if (constants.BUILTIN_FUNCTIONS) {
                const builtinFunctions = addBuiltInFunctions({ constants });
                allFunctions.push(...builtinFunctions);
            }
            const customFunctions = NovaSheets?.getFunctions() || [];
            allFunctions.push(...customFunctions);
            for (let obj of allFunctions) {
                parseFunction(obj.name, obj.body);
            }
        }
        // Remove unparsed variables
        if (!constants.KEEP_UNPARSED) {
            cssOutput = cssOutput.replace(/@endvar/g, '');
            let unparsedContent = cssOutput.match(/\$[[(](.+?)[\])]/g);
            if (unparsedContent)
                for (let val of unparsedContent) {
                    let nssVarName = strim(val.replace(/\$[[(](.*?)(\|.*)?[\])]/, '$1'));
                    cssOutput = cssOutput.replace(val, '');
                    let type = val.includes('$(') ? 'variable' : 'argument';
                    console['log'](`<NovaSheets> Instances of unparsed ${type} "${nssVarName}" have been removed from the output.`);
                }
        }
        // Cleanup output
        cssOutput = cssOutput
            // remove redundant chars
            .replace(/(\s*;)+/g, ';')
            .replace(/(?<!^ *) +/gm, ' ')
            // clean up length units
            .replace(/(?<![1-9]+)(0\.\d+)(?=m|s)/, (_, n) => Number(n) * 1000 + 'm')
            .replace(/(?<=\d)0mm/g, 'cm')
            .replace(/(?<=\d)(000mm|00cm)/g, 'm')
            // fix floating point errors
            .replace(/\.?0{10,}\d/g, '').replace(/((\d)\2{9,})\d/g, '$1').replace(/(\d+)([5-9])\2{10,}\d?(?=\D)/g, (_, a) => String(+a + 1))
            // cleanup decimal places
            .replace(RegExp(r `((\d)\.\d{0,${constants.DECIMAL_PLACES}})(\d?)\d*`), (_, val, pre, after) => {
            const roundsUp = /[5-9]$/.test(after);
            console.log(384, [_, val, roundsUp, pre, after]);
            if (constants.DECIMAL_PLACES === 0) {
                return roundsUp ? parseInt(pre) + 1 : pre;
            }
            else {
                return roundsUp ? val.replace(/.$/, '') + (parseInt(val.substr(-1)) + 1) : val;
            }
        })
            // cleanup media query endings
            .replace(/}\s*}/g, '}\n}');
        // Readd comments to the output
        for (let i in staticContent) {
            cssOutput = cssOutput.replace(RegExp(r `\/\*STATIC#${i}\*\/`, 'g'), strim(staticContent[i]));
        }
        for (let i in commentedContent) {
            cssOutput = cssOutput.replace(RegExp(r `\/\*COMMENT#${i}\*\/`, 'g'), '/*' + commentedContent[i] + '*/');
        }
        // Output: return (node) or add to page (browser)
        if (rawInput) {
            return cssOutput.trim();
        }
        else {
            if (document.querySelectorAll(`[data-hash="${hashCode(cssOutput)}"]`).length)
                break; // prevent duplicate outputs
            let styleElem = document.createElement('style');
            styleElem.innerHTML = '\n' + cssOutput.trim() + '\n';
            styleElem.dataset.hash = hashCode(cssOutput);
            styleElem.dataset.source = sources[s];
            (document.head || document.body).appendChild(styleElem);
        }
    }
    return;
}
const parseNovaSheets = run;

function addBuiltInFunctions({ constants }) {
    const novasheets = new (typeof require !== 'undefined' ? require('./novasheets') : NovaSheets)();
    const escapeRegex = str => str.replace(/[.*+?^/${}()|[\]\\]/g, '\\$&');
    const strim = str => str.toString().replace(/^\s*(.+?)\s*$/, '$1').replace(/\s+/g, ' ');
    const r = String.raw;

    /// Loop functions

    novasheets.addFunction('@each', (_, a = '', b = '', c = '', ...d) => {
        d = d.join('|');
        let [items, splitter, joiner, content] = d ? [a, b, c, d] : (c ? [a, b, b, c] : [a, ',', ',', b]);
        let arr = strim(items).split(strim(splitter));
        let output = [];
        for (let i in arr) {
            let parsed = strim(content)
                .replace(/\$i/gi, Number(i) + 1)
                .replace(/\$v\[([0-9]+)([-+*/][0-9]+)?\]/g, (_, a, b) => arr[eval(Number(a - 1) + (b || 0))])
                .replace(/.?\s*undefined/g, '')
                .replace(/\$v/gi, arr[i])
                ;
            output.push(parsed);
        }
        return output.join(joiner);
    }, { notrim: true });

    novasheets.addFunction('@repeat', (_, a, ...b) => {
        let num = a, delim, content;
        if (b[1]) [delim, content] = [b[0], b.slice(1).join('|')];
        else[delim, content] = ['', b.join('|')];
        let output = '';
        for (let i = 0; i < Number(num); i++) output += (i > 0 ? delim : '') + content.replace(/\$i/gi, Number(i) + 1);
        return output;
    });


    /// Math functions

    const number = r`(?:[0-9]*\.?[0-9]+)`;
    const basedNumber = r`(?:0x[0-9a-f]*\.?[0-9a-f]+|0b[01]*\.?[01]+|0o[0-7]*\.?[0-7]+|${number})`;
    const toNumber = val => constants.KEEP_NAN ? Number(val) : (isNaN(Number(val)) ? '' : Number(val));
    const testNaN = (arg, def) => {
        let test = !arg || arg === Infinity || Number.isNaN(arg);
        if (test && constants.KEEP_NAN) return 'NaN';
        else if (test && !constants.KEEP_NAN) return def || 0;
        else return arg;
    };

    novasheets.addFunction('@e', () => Math.E);
    novasheets.addFunction('@pi', () => Math.PI);
    novasheets.addFunction('@mod', (_, a, b) => testNaN(a % b, _));
    novasheets.addFunction('@sin', (_, a) => testNaN(Math.sin(a), _));
    novasheets.addFunction('@asin', (_, a) => testNaN(Math.asin(a), _));
    novasheets.addFunction('@cos', (_, a) => testNaN(Math.cos(a), _));
    novasheets.addFunction('@acos', (_, a) => testNaN(Math.acos(a), _));
    novasheets.addFunction('@tan', (_, a) => testNaN(Math.tan(a), _));
    novasheets.addFunction('@atan', (_, a) => testNaN(Math.atan(a), _));
    novasheets.addFunction('@abs', (_, a) => testNaN(Math.abs(a), _));
    novasheets.addFunction('@floor', (_, a) => testNaN(Math.floor(a), _));
    novasheets.addFunction('@ceil', (_, a) => testNaN(Math.ceil(a), _));
    novasheets.addFunction('@percent', (_, a) => testNaN(toNumber(a) * 100 + '%', _));
    novasheets.addFunction('@log', (_, base, num) => testNaN(Math.log(num) / (base ? Math.log(base) : 1), _));
    novasheets.addFunction('@root', (_, a, b) => testNaN(Math.pow(b ? b : a, 1 / (b ? a : 2)), _));

    novasheets.addFunction('@round', (_, a, b) => {
        let num = toNumber(a) + Number.EPSILON;
        let dp = Math.pow(10, b || 0);
        return testNaN(Math.round(num * dp) / dp, _);
    });

    novasheets.addFunction('@min|@max', (_, ...a) => {
        let nums = [];
        for (let item of a) if (item) nums.push(item);
        let output = Math[_.includes('@min') ? 'min' : 'max'](...nums);
        return testNaN(output, _);
    });

    novasheets.addFunction('@clamp', (_, a, b, c) => {
        let val = Number(a), min = Number(b), max = Number(c);
        if (max < min) [min, max] = [max, min];
        let output = val <= min ? min : (val >= max ? max : val);
        return testNaN(output, _);
    });

    novasheets.addFunction('@degrees', (_, a) => {
        let [num, type] = [a.replace(/[a-z]+/, ''), a.replace(RegExp(number), '')];
        if (type === 'grad') return num * 0.9;
        let output = num / Math.PI * 180; // default to radians
        return testNaN(output, _);
    });

    novasheets.addFunction('@radians', (_, a) => {
        let [num, type] = [a.replace(/[a-z]+/, ''), a.replace(RegExp(number), '')];
        if (type === 'grad') return num * Math.PI / 200;
        let output = num * Math.PI / 180; // default to degrees
        return testNaN(output, _);
    });

    novasheets.addFunction('@gradians', (_, a) => {
        let [num, type] = [a.replace(/[a-z]+/, ''), a.replace(RegExp(number), '')];
        if (type === 'rad') return num / Math.PI * 200;
        let output = num / 0.9; // default to degrees
        return testNaN(output, _);
    });


    /// Text functions

    novasheets.addFunction('@lowercase', (_, a) => a.toLowerCase());
    novasheets.addFunction('@uppercase', (_, a) => a.toUpperCase());
    novasheets.addFunction('@titlecase', (_, a) => a.replace(/\b\w/g, a => a.toUpperCase()));
    novasheets.addFunction('@capitali[sz]e', (_, a) => a[0].toUpperCase() + a.substr(1));
    novasheets.addFunction('@uncapitali[sz]e', (_, a) => a[0].toLowerCase() + a.substr(1));
    novasheets.addFunction('@extract', (_, a, b, c) => a.split(c ? b : ',')[toNumber(c ? c : b) - 1] || '');
    novasheets.addFunction('@encode', (_, a) => encodeURIComponent(a));
    novasheets.addFunction('@length', (_, a) => strim(a).length);

    novasheets.addFunction('@replace', (_, ...args) => {
        if (args.length < 3) args = [args[0], args[1] || '', args[2] || ''];
        args = args.slice(0, args.indexOf('') <= 3 ? 3 : args.indexOf(''));
        let text = strim(args[0]);
        let finder = strim(args.slice(1, -1).join('|'));
        let replacer = strim(args.slice(-1)[0]);
        let isRegex = finder.startsWith('/');
        if (isRegex) {
            let parts = strim(finder).match(/\/(.+?)\/([gimusy]*)/).slice(1);
            finder = RegExp(parts[0], parts[1] || 's');
        }
        return text.replace(isRegex ? finder : RegExp(escapeRegex(finder), 'g'), replacer);
    }, { notrim: true, allargs: true });


    /// Colour functions

    const toPercent = val => Math.floor(Number(val) / 255 * 100);
    const fromPercent = val => Math.ceil(Number(val.replace('%', '')) * 255 / 100);
    const toHex = val => Number(val).toString(16).padStart(2, '0');
    const rgbFromHex = (hex, alpha) => {
        let num = parseInt(hex.replace(/#?(.{0,8})$/, '$1'), 16);
        let r = (num >> 16) & 255;
        let g = (num >> 8) & 255;
        let b = num & 255;
        let a = alpha ? toPercent(parseInt(alpha, 16)) : null;
        if (a === null) return `rgb(${r}, ${g}, ${b})`;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    };
    const parseHex = val => {
        let a = val.replace('#', '');
        switch (a.length) {
            case 0: return rgbFromHex('000000', '00');
            case 1: return rgbFromHex(a.repeat(6));
            case 2: return rgbFromHex(a[0].repeat(6), a[1].repeat(2));
            case 3: return rgbFromHex(a[0] + a[0] + a[1] + a[1] + a[2] + a[2]);
            case 4: return rgbFromHex(a[0] + a[0] + a[1] + a[1] + a[2] + a[2], a[3] + a[3]);
            default: return rgbFromHex(a.substr(0, 6).padEnd(6, '0'), a.substr(6, 2) || null);
        }
    };
    const getRawColorParts = col => col.replace(/^\s*\w{3}a?\s*\(\s*|\s*\)$/g, '').split(/,\s*/);
    const getColorParts = color => {
        let parts = getRawColorParts(color.startsWith('#') ? parseHex(color) : color);
        for (let i in parts) {
            let num = parts[i];
            if (!parts[i]) parts[i] = 0;
            else if (parts[i].includes('%')) {
                num = num.replace('%', '');
                if (color.includes('hsl')) parts[i] = '' + Math.round(num / 100 * (i === 0 ? 360 : 100));
                else parts[i] = '' + fromPercent(num);
            }
            else if (i === 3) parts[i] = Math.round(color.includes('rgb') ? num / 255 : num / 100);
        }
        return parts;
    };
    const hexFromRgb = (rgb) => {
        let [r, g, b, a] = Array.isArray(rgb) ? rgb : getColorParts(rgb);
        return '#' + toHex(r) + toHex(g) + toHex(b) + (a > 0 ? toHex(a) : '');
    };
    const blendColors = (color1, color2, amt) => {
        if (!color2) return color1 || '';
        let type = color1.match(/^[a-z]{3}a?|^#/).toString();
        let amount = Math.abs(amt.toString().includes('%') ? amt.replace('%', '') / 100 : amt);
        amount = amount > 1 ? 1 : amount;
        const blendVal = (a, b) => Math.floor((toNumber(a) * (1 - amount) + toNumber(b) * (amount)));
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
        if (!color1.includes('hsl')) return blendColors(color1, color2, amt || 0.5);
        let [h, s, l, a] = getColorParts(color1);
        let amount = amt.replace('%', '');
        let sNew = toNumber(s) - toNumber(amount);
        let lNew = toNumber(l) + toNumber(amount) * (type === 'darken' ? -1 : 1);
        let sl = type === 'desat' ? `${sNew}%, ${l}%` : `${s}%, ${lNew < 0 ? 0 : lNew}%`;
        return `${color1.match(/^hsla?/)}(${h % 360}, ${sl}${a ? `, ${a}` : ''})`;
    };

    novasheets.addFunction('@colou?r', (_, type, a = '0', b = '0', c = '0', d = '') => {
        if (/#|rgba?|hsla?/i.test(a)) {
            if (a.includes('#')) a = parseHex(a);
            if (/rgba?|hsla?/.test(a)) [a, b, c, d] = getColorParts(a);
        } else[a, b, c, d] = getColorParts(`${type}(${a}, ${b}, ${c}, ${d})`);

        switch (type = type.toLowerCase()) {
            case '#': case 'hash': case 'hex': case 'hexadecimal': return '#' + toHex(a) + toHex(b) + toHex(c) + (d ? toHex(fromPercent(d)) : '');
            case 'rgb': return `rgb(${a}, ${b}, ${c})`;
            case 'rgba': return `rgba(${a}, ${b}, ${c}, ${d || d === 0 ? 100 : ''}%)`;
            case 'hsl': return `hsl(${a % 360}, ${b}%, ${c}%)`;
            case 'hsla': return `hsla(${a % 360}, ${b}%, ${c}%, ${d || d === 0 ? 100 : ''}%)`;
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
        let newHue = (toNumber(oldHue) + toNumber(amount || 0)) % 360;
        return color.replace(oldHue, newHue);
    });

    novasheets.addFunction('@blend', (_, color1, color2, amount = 0.5) => blendColors(color1, color2, amount));
    novasheets.addFunction('@tint|@lighten', (_, color, amount = 0.5) => blendGrayscaleHsl('lighten', color, '#fff', amount));
    novasheets.addFunction('@shade|@darken', (_, color, amount = 0.5) => blendGrayscaleHsl('darken', color, '#000', amount));
    novasheets.addFunction('@tone|@desaturate', (_, color, amount = 0.5) => blendGrayscaleHsl('desat', color, '#808080', amount));

    const parseLuma = (arg, rgb) => {
        if (!(arg.startsWith('rgb') || arg.startsWith('#'))) return arg;
        let [r, g, b] = rgb ? [...rgb] : getColorParts(arg);
        const adjustGamma = a => ((a + 0.055) / 1.055) ** 2.4;
        const getLuma = a => a <= 0.03928 ? a / 12.92 : adjustGamma(a);
        return 0.2126 * getLuma(r / 255) + 0.7152 * getLuma(g / 255) + 0.0722 * getLuma(b / 255); // ITU-R BT.709
    };

    novasheets.addFunction('@luma', (_, color) => parseLuma(color));

    novasheets.addFunction('@contrast', (_, color, light = '', dark = '') => (parseLuma(color) < 0.5/*'is dark?':*/) ? light : dark);

    novasheets.addFunction('@gr[ae]yscale', (_, color) => {
        if (color.startsWith('hsl')) return color.replace(/^(hsla?)\s*\(\s*(\d+),\s*(\d+)/, '$1($2, 0');
        let gray = Math.round(parseLuma(color) * 255);
        let newColor = `rgb(${Array(3).fill(gray).join(', ')})`;
        if (color.startsWith('#')) return hexFromRgb(newColor);
        else return newColor;
    });


    /// Logical functions

    const bracketedNumber = r`(?:\(\s*${basedNumber}\s*\)|${basedNumber})`;
    const parseLogic = arg => {
        for (let i = 0; i < constants.MAX_ARGUMENTS / 10; i++) {
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
        if (arg.match(/(<|<=|>|>=|==|!=|&|\||!)/)) arg = eval(arg);
        if (['false', 'undefined', 'null', 'NaN', ''].includes(arg)) arg = false;
        return arg;
    };
    const logicRegex = arg => RegExp(r`([+-]?${bracketedNumber})\s*(?:${arg})\s*([+-]?${bracketedNumber})`);

    novasheets.addFunction('@bitwise', (_, a) => {
        let arg = a.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<'); // fix html
        for (let i = 0; i < constants.MAX_ARGUMENTS / 10; i++) {
            arg = arg
                .replace(RegExp(r`(?:~|!|not)\s*([+-]?${bracketedNumber})`), (_, a) => eval('~' + toNumber(a))) // bitwise not
                .replace(logicRegex('or|\\|'), (_, a, b) => eval(`(${toNumber(a)}) | (${toNumber(b)})`)) // bitwise or
                .replace(logicRegex('nor'), (_, a, b) => eval(`~ (${toNumber(a)}) | (${toNumber(b)})`)) // bitwise nor
                .replace(logicRegex('and|&'), (_, a, b) => eval(`(${toNumber(a)}) & (${toNumber(b)})`)) // bitwise and
                .replace(logicRegex('nand'), (_, a, b) => eval(`~ (${toNumber(a)}) & (${toNumber(b)})`)) // bitwise nand
                .replace(logicRegex('xor'), (_, a, b) => eval(`(${toNumber(a)}) ^ (${toNumber(b)})`)) // bitwise xor
                .replace(logicRegex('xnor'), (_, a, b) => eval(`~ (${toNumber(a)}) ^ (${toNumber(b)})`)) // bitwise xnor
                ;
        }
        return arg;
    });

    novasheets.addFunction('@boolean', (_, a) => parseLogic(a));
    novasheets.addFunction('@if', (_, a, b = '', c = '') => parseLogic(a) ? b : c);


    /// CSS functions

    novasheets.addFunction('@breakpoint', (_, a = 0, b = '', c = '', d = '') => {
        if (!a) return _;
        const makeQuery = (type, width, content) => {
            return `@media (${type}-width: ${width.trim()}${type === 'max' ? '-1px' : ''}) { ${content}}`;
        };
        let isBlock = (b + c).includes('{');
        let content = isBlock ? [b, c] : [`${b} {${c}} `, `${b} {${d}} `];
        let ltContent = (isBlock ? b : c).trim() ? makeQuery('max', a, content[0]) : '';
        let gtContent = (isBlock ? c : d).trim() ? makeQuery('min', a, content[1]) : '';
        return ltContent + (ltContent && gtContent ? '\n' : '') + gtContent;
    }, { notrim: true });

    novasheets.addFunction('@prefix', (_, a, b) => {
        return `-webkit-${a}: ${b}; -moz-${a}: ${b}; -ms-${a}: ${b}; -o-${a}: ${b}; ${a}: ${b};`;
    }, { nonest: true });

    // Return
    return novasheets.getFunctions();

}

class NovaSheets {
    constructor() {
        this.functions = [];
    }
    static parse(rawInput = '', novasheets) {
        return parse_1.default(rawInput, novasheets);
    }
    static compile(input, output = '', novasheets = new NovaSheets()) {
        return compile_1.default(input, output, novasheets);
    }
    addFunction(name, body, options) {
        this.functions.push({ name, body, options });
        return this;
    }
    getFunctions() {
        return this.functions;
    }
}

function compileNovaSheets() { /* Not for browser */ }
const parse_1 = {default: parse}
const compile_1 = {default: compileNovaSheets}

document.addEventListener('DOMContentLoaded', () => parseNovaSheets());
