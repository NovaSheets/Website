function wrap(val, name) {
    return `§${name}¶${val}¶${name}§`;
}

function wrapRaw(val, name) {
    return `<span class="${name}">${val}</span>`;
}

function colouriseCode() {
    const elements = document.querySelectorAll('code, .code');
    for (let element of [...elements]) {
        element.classList.add('code')
        let content = element.innerHTML

            // HTML fixing
            .replace(/&(amp|lt|gt|nbsp);/g, '↑$1↓')

            // CSS content
            .replace(/@media[^{}\n]+?(?=\{)/gm, wrap('$&', 'css-query')) // media
            //.replace(/https?:\/\/[^"]*/gm, wrap('$&', 'css-value')) // URLs
            .replace(/(?<!(?:\/\/|\/\*).*)[^\/|{}:;\n]+?(?=\{)/gm, wrap('$&', 'css-selector')) // selector
            .replace(/(?<!(?:\/\/|\/\*).*)[^\/|{}():;\n]+?(?=:(?!\/))/gm, wrap('$&', 'css-property')) // property
            .replace(/(?<!(?:\/\/|\/\*).*)(?<=:\s*)[^\/|{}:;\n]+?(?=;)/gm, wrap('$&', 'css-value')) // value

            // NovaSheets declarations
            .replace(/^\s*(@var)\s*(.+?)(?==.*$|$)/gm, wrap('$1', 'nvss-char') + wrap(' $2', 'nvss-var')) // var decl
            .replace(/(?<!(?:\/\/|\/\*).*)\$\[([^<]*?)(?:(\|)(.*?))?\]/gm, wrap('$[', 'nvss-char') + wrap('$1', 'nvss-arg') + wrap('$2', 'nvss-char') + wrap('$3', 'nvss-arg-default') + wrap(']', 'nvss-char')) // param decl
            .replace(/@endvar/g, wrap('$&', 'nvss-char')) // endvar
            .replace(/(@const)\s+(\S*)\s+(\S*)?/gi, wrap('$1', 'nvss-char') + wrap(' $2', 'nvss-var') + wrap(' $3', 'nvss-arg')) // const

            // NovaSheets substitutions
            .replace(/(?<!(?:\/\/|\/\*).*)\$\(([^<]*?)(\|.*)?\)/gm, wrap('$(', 'nvss-char') + wrap('$1', 'nvss-var') + '$2' + wrap(')', 'nvss-char')) // var subst
            .replace(/\|([^<]*?)=([^|]*?)/gm, wrap('|', 'nvss-char') + wrap('$1', 'nvss-var-param') + wrap('=', 'nvss-char') + wrap('$2', 'nvss-var-arg')) // arg decl
            .replace(/\$(↑lt↓)([\w.:+~>()]+)(↑gt↓)/g, wrap('$<', 'nvss-char') + wrap('$2', 'css-selector') + wrap('>', 'nvss-char')) // decl block subst
            .replace(/(↑lt↓)(\w*?)(↑gt↓)/g, wrap('$1', 'nvss-char') + wrap('$2', 'css-property') + wrap('$3', 'nvss-char')) // obj getter
            .replace(/!/g, wrap('$&', 'nvss-char')) // obj subster

            // NovaSheets other
            .replace(/\$v|\$i/g, wrap('$&', 'nvss-var')) // $v, $i
            .replace(/↑amp↓(↑lt↓)*|%(↑lt↓)*/g, wrap('$&', 'nvss-selector')) // prev selectors
            .replace(/[|]/g, wrap('$&', 'nvss-char'))

            // HTML
            .replace(/(↑lt↓\/?)(\w+)(↑gt↓)?/gm, wrap('$&', 'html-tag'))
            .replace(/([\w-]+)=(".*?")(↑gt↓)?/gm, wrap('$1', 'html-attr-name') + '=' + wrap('$2', 'html-attr-val') + wrap('$3', 'html-tag'))
            //.replace(/(?<!(?:\/\/|\/\*).*)(\||\$|\(|\)|\[|\])/g, wrap('$&', 'nvss-char'))
            .replace(/[{}]/g, wrap('$&', 'css-char')) // brackets

            // String
            .replace(/(['"]).+?\1/g, val => wrap(val.replace(/§([\w-]+)¶([^¶§]+?)¶\1§/g,'$2'), 'js-string'))

            // HTML re-fixing
            .replace(/↑(amp|lt|gt|nbsp)↓/g, '&$1;')
            .replace(/\\n/g, '\n<br>')

            // Comments
            .replace(/(?<!https?:)\/\/.*$/gm, wrapRaw('$&', 'comment')) // inline
            .replace(/(\/\*[^\/])(.*?)([^\/]?\*\/)/gm, wrapRaw('$&', 'comment')) // block
            .replace(/(\/\*\/)(.*?)(\/\*\/)/gm, wrapRaw('$1', 'comment') + '$2' + wrapRaw('$3', 'comment')) // static

        content = content.replace(/§([\w-]+)¶([^¶§]+?)¶\1§/g, '<span class="$1">$2</span>').replace(/[§¶].+?[§¶]/g, '');
        element.innerHTML = content;
    }
}

document.addEventListener("DOMContentLoaded", colouriseCode);
