const $ = x => document.querySelector(x), $$ = x => document.querySelectorAll(x);

window.useDefault = false;

function parseInput() {
    $$('style').forEach(item => item.remove());
    let cssContent = $('#input').value;
    let parsedContent = parseNovaSheets(cssContent);
    $('#output').innerHTML = parsedContent.replace(/}(?!\s*$)/g, '}\n');
    parseNovaSheets();
    $('head').innerHTML += `<style data-custom>${parsedContent}</style>`;
}

function toggleDefault() {
    useDefault = !useDefault;
    document.getElementById('use-default').innerHTML = useDefault;
    $('#import').setAttribute('rel', $('#import').getAttribute('rel') === 'novasheet' ? '!' : '' + 'novasheet');
    parseInput();
}

document.addEventListener("DOMContentLoaded", function () {
    $('#input').value = `
        @var shading = linear-gradient($[1]deg, #55f, #5ff);
        @var solid border = 1px solid $[color]
        // body {color: blue;}
        .shaded {background: $(shading|90); color: white;} // basic shading
        .title {margin-left: 2em; color: #e55; border-bottom: $(solid border|color=#ff7711);}
    `.replace(/^\s+/gm, '');
    parseInput();
});
