---
layout: layouts/base.njk
permalink: /install/
title: Install
description: Install NovaSheets using npm or from the browser
keywords: "nixinova,novasheets,install novasheets"
js: headings
js2: colouring
---
{% capture version %}{% include templates/version.txt %}{% endcapture -%}
{% capture domain %}https://novasheets.nixinova.com{% endcapture -%}

# Installing NovaSheets

## npm
Install [NovaSheets on npm](https://npmjs.org/package/novasheets) via the command line using `npm install -g novasheets`, and then get started using `novasheets --help`.
You must have [Node.js](https://nodejs.org/) installed to do this.

## Browser
NovaSheets is installed simply by embedding a JavaScript file into your HTML.
This file can be downloaded and hosted locally by you (see [§&nbsp;Downloading](#downloading))
or you can link directly to the source code (see [§&nbsp;Importing](#importing)).
That's it!

### Downloading
See the [Versions](/versions/) page to choose a version to download.
Once you have done this, you can download one of the files given and add them to your project, or embed NovaSheets into your project directly using the code provided.

### Importing
The latest version is <strong>{{version}}</strong> and can be imported using the code below:
```html
<script src="{{domain}}/src/{{version}}/min"></script>
```

While the minified version above is recommended for general use, you can also choose to use the more verbose regular version, which includes comments and indentation:
```html
<script src="{{domain}}/src/{{version}}"></script>
```

#### Wildcards

Additionally, you can choose to use a wildcard version, where you will always receive the latest patch:
```html
<script src="{{domain}}/src/{{version | replace(r/\.\d+$/, '.x')}}"></script>
<script src="{{domain}}/src/{{version | replace(r/\.\d+$/, '.x')}}/min"></script>
```

#### Latest

You can choose to always import the latest stable version of NovaSheets using the code below, but be warned it may contain breaking changes in an update:
```html
<script src="{{domain}}/src/stable"></script>
<script src="{{domain}}/src/stable/min"></script>
```

Alternatively, you can choose to import the main live source code directly, but be warned that it is continually updated and may contain incomplete or buggy features, so use it at your own risk:
```html
<script src="{{domain}}/src/latest"></script>
```

### Browser support

NovaSheets is supported in all major browsers, including Chrome, Edge (Chromium), Firefox, Opera, and Safari.
NovaSheets does not work in older browsers such as Internet Explorer, as it is written using the following features from ECMAScript versions up to ES2018:

- Arrow functions (`=>`)
- `let` and `const` declarations
- Rest operator (`...`)
- Nullish coalescing operator (`??`)
- Optional chaining (`?.`)
- RegEx lookbehinds (`(?<!.)` and `(?<=.)`)
