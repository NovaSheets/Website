---
layout: docs
permalink: /docs/class/
title: NovaSheets Class
---
# NovaSheets Class

Add custom functions to the NovaSheets parser using the `NovaSheets` class, which is the default import of `require('novasheets')` (in Node) or the script import (in a browser).

## Initialize

Use `new NovaSheets()` to instantiate the class and set it to a variable, ready for functions to be added:

<pre class="code-styles">
<span class="js-keyword">const</span> <span class="js-variable">sheet</span> = <span class="js-keyword">new</span> <span class="js-class">NovaSheets</span>();
</pre>

## Adding functions

Use the `addFunction` method to register functions with the NovaSheets parser, using the syntax `addFunction(name, function)`, where `function` has its first argument being the whole function match (`$(...)`) and the remainder being each individual argument.

## Examples

1.  Register `$(#one`) as a function that returns `1`:
    <pre class="code-styles">
    <span class="js-keyword">const</span> <span class="js-variable">sheet</span> = <span class="js-keyword">new</span> <span class="js-class">NovaSheets</span>();
    <span class="js-variable">sheet</span>.<span class="js-function">addFunction</span>(<span class="js-string">'#one'</span>, () => 1); <span class="comment">// set '$(#one)' to return '1'</span>
    <span class="js-class">NovaSheets</span>.<span class="js-function">parse</span>(<span class="js-string">'@one'</span>, <span class="js-variable">sheet</span>); <span class="comment">// '1'</span>
    </pre>
2.  Register `$(add squares`) as a function that returns the sum of the squares of two numbers:
    <pre class="code-styles">
    <span class="js-keyword">const</span> <span class="js-variable">sheet</span> = <span class="js-keyword">new</span> <span class="js-class">NovaSheets</span>();
    <span class="js-variable">sheet</span>.<span class="js-function">addFunction</span>(<span class="js-string">'add squares'</span>, (<span class="js-variable">match</span>, <span class="js-variable">num1</span>, <span class="js-variable">num1</span>) => {
        <span class="js-keyword">return</span> <span class="js-variable">num1</span> * <span class="js-variable">num1</span> + <span class="js-variable">num2</span> * <span class="js-variable">num2</span>;
    });
    <span class="js-class">NovaSheets</span>.<span class="js-function">parse</span>(<span class="js-string">'$(add squares | 20 | 4)'</span>, <span class="js-variable">sheet</span>); <span class="comment">// 416</span>
    </pre>
