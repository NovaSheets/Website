---
layout: docs
permalink: /docs/constants/
title: Parser Constants
js: colouring
---
# NovaSheets Parser Constants

```nvss
@option <name> <value>
```

The parser contains a few constants which effect how NovaSheets code is parsed.
These constants can be modified by using the `@option` keyword anywhere in the document.
The following parser constants are available:

- `@option BUILTIN_FUNCTIONS <boolean>`
  - Controls whether or not built-in functions should be implemented; defaults to `true`.
- `@option DECIMAL_PLACES {<integer>|false}`
  - Controls how many decimal places numbers are outputted with. Has no effect when set to `false` (default).
- `@option KEEP_UNPARSED <boolean>`
  - Controls whether or not undeclared variables should be kept in the output CSS; defaults to `false`.
- `@option MAX_RECURSION <integer>`
  - Controls how many times variable nesting etc will be iterated over; defaults to `50`.
- `@option MAX_ARGUMENTS <integer>`
  - Controls the maximum number of arguments a variable can have; defaults to `10`.
