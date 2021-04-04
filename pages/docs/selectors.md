---
layout: docs
permalink: /docs/selectors/
title: Selectors
js: colouring
---
# NovaSheets Selectors

## Nesting

```less
.class {
  color: red;
  a {color: blue;}
  div & {color: green;}
}
/* becomes */
.class {color: red;}
.class a {color: blue;}
div .class {color: green;}
```

NovaSheets includes CSS nesting. If an ampersand `&` is not used, the parent selector is prepended to the child, separated by a space. Otherwise, the ampersand is replaced with the content of the parent selector.

## Simple breakpoints

```less
h2 @ ..300px       {width: 99%;} // max width 299px
h2 @ 400px         {width: 80%;} // min width 400px
h2 @ 500px...      {width: 75%;} // min width 500px
h2 @ 600px..800px  {width: 50%;} // min width 600px and max width 799px
```

In addition to the `$(@breakpoint)` function for more complex breakpoint blocks, simple breakpoint widths can be added after a CSS selector, separated with an at sign (`@`). If only one width is set, it is parsed as the minimum width. Add a maximum width by separating the two with a space (` `) or ellipsis (`...`/`..`/etc).
