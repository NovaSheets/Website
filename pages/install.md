---
layout: base
permalink: /install/
title: Install
description: Install NovaSheets using npm or from the browser
keywords: "nixinova,novasheets,install novasheets"
js: headings
js2: colouring
---

# Installing NovaSheets

Once NovaSheets is successfully installed, see the [docs](/docs/#usage) for usage.

## Command-line usage

For command-line usage, install [NovaSheets on npm](https://npmjs.org/package/novasheets) globally via the command line using `npm install -g novasheets`, and then get started using `novasheets --help`.

## Node usage

For use in [Node.js](https://nodejs.org/), install the NovaSheets npm package locally via the command line using `npm install novasheets`.

## Browser

NovaSheets is installed simply by embedding a JavaScript file into your HTML.
This file can be downloaded and hosted locally by you (see [§&nbsp;Downloading](#downloading))
or you can link directly to the source code (see [§&nbsp;Importing](#importing)).
That's it!

### Downloading

See the [Versions](/versions/) page to choose a version to download.
Once you have done this, you can download one of the files given and add them to your project, or embed NovaSheets into your project directly using the code provided.

### Importing

The latest version is **{{version.latest}}** and can be imported using the code below:
```html
<script src="https://novasheets.js.org/src/{{version.latest}}/min"></script>
```

While the minified version above is recommended for general use, you can also choose to use the more verbose regular version, which includes comments and indentation:
```html
<script src="https://novasheets.js.org/src/{{version.latest}}"></script>
```

#### Wildcards

Additionally, you can choose to use a wildcard version, where you will always receive the latest patch:
```html
<script src="https://novasheets.js.org/src/1.x"></script>
<script src="https://novasheets.js.org/src/1.x/min"></script>
```

#### Latest

You can choose to always import the latest stable version of NovaSheets (**{{version.stable}}**) using the code below, but be warned it may contain breaking changes in an update:
```html
<script src="https://novasheets.js.org/src/stable"></script>
<script src="https://novasheets.js.org/src/stable/min"></script>
```
<!--
You may instead choose to opt-in to receive development versions of NovaSheets, but be warned these are even more likely to contain breaking changes:
```html
<script src="https://novasheets.js.org/src/latest"></script>
<script src="https://novasheets.js.org/src/latest/min"></script>
```
-->
### Browser support

NovaSheets is supported in all major browsers, including Chrome, Edge (Chromium), Firefox, Opera, and Safari.
NovaSheets does not work in older browsers such as Internet Explorer as it is written using features from ECMAScript versions up to ES2018.
