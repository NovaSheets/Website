---
layout: docs
permalink: /docs/
title: Documentation
description: "Documentation for NovaSheets syntax"
js: colouring
js2: headings
---
# NovaSheets Documentation <!-- omit in toc -->

<div id="toc"></div>

- [Usage](#usage)
  - [Node](#node)
    - [Command-line](#command-line)
    - [Commands](#commands)
  - [Browser](#browser)
    - [Importing](#importing)
    - [Embedding](#embedding)
- [Syntax](#syntax)
  - [Variables](#variables)
  - [Operators](#operators)
  - [Selectors](#selectors)
  - [Objects](#objects)
  - [Comments](#comments)
  - [Parser constants](#parser-constants)

## Usage

### Node

<pre class="code-styles">
<span class="js-keyword">const</span> { <span class="js-function">parse</span>, <span class="js-function">compile</span> } = <span class="js-function">require</span>(<span class="js-string">'novasheets'</span>);
<span class="js-function">parse</span>(<span class="js-string">'@var color = #fff @endvar $(@shade | $(color) | 50% )'</span>); <span class="comment">// "#7f7f7f"</span>
<span class="js-function">compile</span>(<span class="js-string">'stylesheet.nvss'</span>, <span class="js-string">'output.css'</span>); <span class="comment">// void</span>
</pre>

NovaSheets contains two functions, `parse` and `compile`.
After installing NovaSheets using `npm install novasheets`, import these using `const { parse, compile } = require('novasheets');`.
See [Commands](#commands) for usage.

#### Command-line

The command-line mode of NovaSheets gives you four console commands: `--parse`, `--compile`, `--help`, and `--version`.
The latter two are meta-commands. When installed globally, run commands using `novasheets ...`; when installed locally, use `npx novasheets ...`.

#### Commands

- Node: `parse(input)`<br>
  CLI: `novasheets (-p|--parse) <input>`
  - Parses the NovaSheets code given as its input and returns the parsed CSS content as a string.
  - Example:<br>
    &emsp;Node: `parse("@var foo = bar=$[baz] @endvar $(foo|baz=qux)")`<br>
    &emsp;CLI: `novasheets -p "@var foo = bar=$[baz] @endvar $(foo|baz=qux)"`
    - Returns string `bar=qux`.
- Node: `compile(<input>, [<output>])`<br>
  CLI: `novasheets [(-c|--compile)] <input> [<output>]`
  - Compiles the files matching the input [glob](https://www.npmjs.com/package/glob#glob-primer) into the output. 
    If the output is not set, or it is a folder path (ending with `/`), the input filename (replaced with a `.css` extension) is used. Has no return value but logs console messages for each successful compilation.
  - Example:<br>
    &emsp;Node: `compile('css/*.nvss', '_site/css/')`<br>
    &emsp;CLI: `novasheets -c css/*.nvss _site/css/`
    - Compiles the NovaSheets syntax of all `.nvss` files in the `css` folder and places the outputted files (all now with extension `.css`) in the `_site/css` folder.
- CLI only: `novasheets (-h|--help)`
  - Displays a help message showing all commands.
- CLI only: `novasheets (-v|--version)`
  - Outputs the latest version of NovaSheets ({{version}}).

### Browser

After the NovaSheets source code is added to the web page (see [Install](/install/)), stylesheets can be either be imported from external files or embedded locally.

#### Importing

Simply link to external NovaSheets files in the header of the page using `<link>` tags with the `rel` attribute set to `"novasheet"` (or `"novasheets"`).

```html
<link rel="novasheet" href="example.nvss">
```

#### Embedding

Inline stylesheets can be created by simply setting the `type` attribute of an element to `"novasheet"` (or `"novasheets"`) and putting NovaSheets content inside. Note that HTML may interfere with NovaSheet styles if they are placed inside regular block elements, so `<style>` or `<script>` tags are recommended. When using `<script>` tags, surround the entire stylesheet content in backticks (\`) to avoid JavaScript errors in the console.

```html
<style type="novasheets">
    .element {display: inline-block;}
    % .child {font-size: 2/3em;}
</style>
```
```html
<script type="novasheets">`
    div {background-color: brown;}
    & p, & img {border: 2px solid;}
`</script>
```

## Syntax

### Variables
*More info: [Variables](/docs/variables)*

NovaSheets variables are created by starting a line with `@var`. Anything after that space will be the name of the variable. The contents of a variable are found either on the lines beneath it, all the way up until either another variable declaration or the keyword `@endvar`, or as the content to the right of the first equals sign on the declaration line.

Variables are referenced using a dollar sign (`$`) followed by the variable name in parentheses (`(...)`). Arguments are passed by listing parameter names followed by the argument contents, with each one prefixed with a pipe.
Parameters of a variable are referenced similar to variables but using square brackets instead of parentheses (`$[...]`). The default contents of an argument can be set by adding a pipe following by the default argument content to its name.

### Operators
*More info: [Operators](/docs/operators)*

NovaSheets supports manipulating numerals using raw mathematical operators. These operators are orders of magnitude (`e`), exponentation (`^` or `**`), multiplication (`*`), division (`/`), addition (`+`), and subtraction (`-`). Order of operations applies in that order; parentheses (`( )`) can be used to force a change in the order of operations.

### Selectors
*More info: [Selectors](/docs/selectors)*

NovaSheets adds previous element selectors, which copy the content of a previous CSS selector. Ampersands (`&`) take the previous *raw* selector (i.e., the last selector that does not contain an ampersand), while percent signs (`%`) take the previous selector.
Less-than signs (`<`) can be used to slice the last item off the selector; characters treated as item delimiters are `:`, `>`, `+`, `~`, and whitespace. For example, `.item>div {} &< p {} %~img {}` outputs `.item>div {} .item p {} .item p~img {}`.

### Objects
*More info: [Objects](/docs/objects)*

NovaSheets treats all CSS declaration blocks as objects, and the values of each CSS property can be accessed using the format `{attr: val;}<attr>`. Declaration blocks can be substituted using the format `$<selector>`, where the content inside refers to the full selector identifier attached to that declaration block. These two can be combined, forming `$<selector><attr>`. All of the block's content can be dumped using `$<selector>!`.

### Comments
*More info: [Comments](/docs/comments)*

NovaSheets implements single-line comments (`// ...`), multi-line unparsed comments (`/* ... */`), static comments (`/*/ ... /*/`), and parsed comments (`/*[ ... ]*/`).

### Parser constants
*More info: [Parser constants](/docs/constants)*

The parser contains a few constants which affect how NovaSheets code is parsed.
These constants can be modified by using the `@const` keyword on its own line anywhere in the document.
