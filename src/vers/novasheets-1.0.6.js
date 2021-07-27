(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'
module.exports = balanced
function balanced (a, b, str) {
  if (a instanceof RegExp) a = maybeMatch(a, str)
  if (b instanceof RegExp) b = maybeMatch(b, str)

  const r = range(a, b, str)

  return (
    r && {
      start: r[0],
      end: r[1],
      pre: str.slice(0, r[0]),
      body: str.slice(r[0] + a.length, r[1]),
      post: str.slice(r[1] + b.length)
    }
  )
}

function maybeMatch (reg, str) {
  const m = str.match(reg)
  return m ? m[0] : null
}

balanced.range = range
function range (a, b, str) {
  let begs, beg, left, right, result
  let ai = str.indexOf(a)
  let bi = str.indexOf(b, ai + 1)
  let i = ai

  if (ai >= 0 && bi > 0) {
    if (a === b) {
      return [ai, bi]
    }
    begs = []
    left = str.length

    while (i >= 0 && !result) {
      if (i === ai) {
        begs.push(i)
        ai = str.indexOf(a, i + 1)
      } else if (begs.length === 1) {
        result = [begs.pop(), bi]
      } else {
        beg = begs.pop()
        if (beg < left) {
          left = beg
          right = bi
        }

        bi = str.indexOf(b, i + 1)
      }

      i = ai < bi && ai >= 0 ? ai : bi
    }

    if (begs.length) {
      result = [left, right]
    }
  }

  return result
}

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
'use strict';


var loader = require('./lib/loader');
var dumper = require('./lib/dumper');


function renamed(from, to) {
  return function () {
    throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' +
      'Use yaml.' + to + ' instead, which is now safe by default.');
  };
}


module.exports.Type                = require('./lib/type');
module.exports.Schema              = require('./lib/schema');
module.exports.FAILSAFE_SCHEMA     = require('./lib/schema/failsafe');
module.exports.JSON_SCHEMA         = require('./lib/schema/json');
module.exports.CORE_SCHEMA         = require('./lib/schema/core');
module.exports.DEFAULT_SCHEMA      = require('./lib/schema/default');
module.exports.load                = loader.load;
module.exports.loadAll             = loader.loadAll;
module.exports.dump                = dumper.dump;
module.exports.YAMLException       = require('./lib/exception');

// Re-export all types in case user wants to create custom schema
module.exports.types = {
  binary:    require('./lib/type/binary'),
  float:     require('./lib/type/float'),
  map:       require('./lib/type/map'),
  null:      require('./lib/type/null'),
  pairs:     require('./lib/type/pairs'),
  set:       require('./lib/type/set'),
  timestamp: require('./lib/type/timestamp'),
  bool:      require('./lib/type/bool'),
  int:       require('./lib/type/int'),
  merge:     require('./lib/type/merge'),
  omap:      require('./lib/type/omap'),
  seq:       require('./lib/type/seq'),
  str:       require('./lib/type/str')
};

// Removed functions from JS-YAML 3.0.x
module.exports.safeLoad            = renamed('safeLoad', 'load');
module.exports.safeLoadAll         = renamed('safeLoadAll', 'loadAll');
module.exports.safeDump            = renamed('safeDump', 'dump');

},{"./lib/dumper":5,"./lib/exception":6,"./lib/loader":7,"./lib/schema":8,"./lib/schema/core":9,"./lib/schema/default":10,"./lib/schema/failsafe":11,"./lib/schema/json":12,"./lib/type":14,"./lib/type/binary":15,"./lib/type/bool":16,"./lib/type/float":17,"./lib/type/int":18,"./lib/type/map":19,"./lib/type/merge":20,"./lib/type/null":21,"./lib/type/omap":22,"./lib/type/pairs":23,"./lib/type/seq":24,"./lib/type/set":25,"./lib/type/str":26,"./lib/type/timestamp":27}],4:[function(require,module,exports){
'use strict';


function isNothing(subject) {
  return (typeof subject === 'undefined') || (subject === null);
}


function isObject(subject) {
  return (typeof subject === 'object') && (subject !== null);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];

  return [ sequence ];
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
}


module.exports.isNothing      = isNothing;
module.exports.isObject       = isObject;
module.exports.toArray        = toArray;
module.exports.repeat         = repeat;
module.exports.isNegativeZero = isNegativeZero;
module.exports.extend         = extend;

},{}],5:[function(require,module,exports){
'use strict';

/*eslint-disable no-use-before-define*/

var common              = require('./common');
var YAMLException       = require('./exception');
var DEFAULT_SCHEMA      = require('./schema/default');

var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;

var CHAR_BOM                  = 0xFEFF;
var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_EQUALS               = 0x3D; /* = */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';

var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];

var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (map === null) return {};

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }
    type = schema.compiledTypeMap['fallback'][tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}


var QUOTING_TYPE_SINGLE = 1,
    QUOTING_TYPE_DOUBLE = 2;

function State(options) {
  this.schema        = options['schema'] || DEFAULT_SCHEMA;
  this.indent        = Math.max(1, (options['indent'] || 2));
  this.noArrayIndent = options['noArrayIndent'] || false;
  this.skipInvalid   = options['skipInvalid'] || false;
  this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys      = options['sortKeys'] || false;
  this.lineWidth     = options['lineWidth'] || 80;
  this.noRefs        = options['noRefs'] || false;
  this.noCompatMode  = options['noCompatMode'] || false;
  this.condenseFlow  = options['condenseFlow'] || false;
  this.quotingType   = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes   = options['forceQuotes'] || false;
  this.replacer      = typeof options['replacer'] === 'function' ? options['replacer'] : null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';

  this.duplicates = [];
  this.usedDuplicates = null;
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;

    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
  return  (0x00020 <= c && c <= 0x00007E)
      || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
      || ((0x0E000 <= c && c <= 0x00FFFD) && c !== CHAR_BOM)
      ||  (0x10000 <= c && c <= 0x10FFFF);
}

// [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// Including s-white (for some reason, examples doesn't match specs in this aspect)
// ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
function isNsCharOrWhitespace(c) {
  return isPrintable(c)
    && c !== CHAR_BOM
    // - b-char
    && c !== CHAR_CARRIAGE_RETURN
    && c !== CHAR_LINE_FEED;
}

// [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
//                             c = flow-in   ⇒ ns-plain-safe-in
//                             c = block-key ⇒ ns-plain-safe-out
//                             c = flow-key  ⇒ ns-plain-safe-in
// [128] ns-plain-safe-out ::= ns-char
// [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
// [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
//                            | ( /* An ns-char preceding */ “#” )
//                            | ( “:” /* Followed by an ns-plain-safe(c) */ )
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    inblock ? // c = flow-in
      cIsNsCharOrWhitespace
      : cIsNsCharOrWhitespace
        // - c-flow-indicator
        && c !== CHAR_COMMA
        && c !== CHAR_LEFT_SQUARE_BRACKET
        && c !== CHAR_RIGHT_SQUARE_BRACKET
        && c !== CHAR_LEFT_CURLY_BRACKET
        && c !== CHAR_RIGHT_CURLY_BRACKET
  )
    // ns-plain-char
    && c !== CHAR_SHARP // false on '#'
    && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
    || (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) // change to true on '[^ ]#'
    || (prev === CHAR_COLON && cIsNsChar); // change to true on ':[^ ]'
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
  return isPrintable(c) && c !== CHAR_BOM
    && !isWhitespace(c) // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    && c !== CHAR_MINUS
    && c !== CHAR_QUESTION
    && c !== CHAR_COLON
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    && c !== CHAR_SHARP
    && c !== CHAR_AMPERSAND
    && c !== CHAR_ASTERISK
    && c !== CHAR_EXCLAMATION
    && c !== CHAR_VERTICAL_LINE
    && c !== CHAR_EQUALS
    && c !== CHAR_GREATER_THAN
    && c !== CHAR_SINGLE_QUOTE
    && c !== CHAR_DOUBLE_QUOTE
    // | “%” | “@” | “`”)
    && c !== CHAR_PERCENT
    && c !== CHAR_COMMERCIAL_AT
    && c !== CHAR_GRAVE_ACCENT;
}

// Simplified test for values allowed as the last character in plain style.
function isPlainSafeLast(c) {
  // just not whitespace or colon, it will be checked to be plain character later
  return !isWhitespace(c) && c !== CHAR_COLON;
}

// Same as 'string'.codePointAt(pos), but works in older browsers.
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 0xDC00 && second <= 0xDFFF) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }
  return first;
}

// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}

var STYLE_PLAIN   = 1,
    STYLE_SINGLE  = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED  = 4,
    STYLE_DOUBLE  = 5;

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth,
  testAmbiguousType, quotingType, forceQuotes, inblock) {

  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly
  var plain = isPlainSafeFirst(codePointAt(string, 0))
          && isPlainSafeLast(codePointAt(string, string.length - 1));

  if (singleLineOnly || forceQuotes) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ');
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '));
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}

// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function () {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? ('"' + string + '"') : ("'" + string + "'");
      }
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.
    var lineWidth = state.lineWidth === -1
      ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

    // Without knowing if keys are implicit/explicit, assume implicit for safety.
    var singleLineOnly = iskey
      // No block styles in flow mode.
      || (state.flowLevel > -1 && level >= state.flowLevel);
    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth,
      testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {

      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string, lineWidth) + '"';
      default:
        throw new YAMLException('impossible error: invalid scalar style');
    }
  }());
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

  // note the special case: the string '\n' counts as a "trailing" empty line.
  var clip =          string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : (clip ? '' : '-');

  return indentIndicator + chomp + '\n';
}

// (See the note for writeScalar.)
function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g;

  // first line (possibly an empty line)
  var result = (function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }());
  // If we haven't reached the first content line yet, don't add an extra \n.
  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented;

  // rest of the lines
  var match;
  while ((match = lineRe.exec(string))) {
    var prefix = match[1], line = match[2];
    moreIndented = (line[0] === ' ');
    result += prefix
      + (!prevMoreIndented && !moreIndented && line !== ''
        ? '\n' : '')
      + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line;

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
  var match;
  // start is an inclusive index. end, curr, and next are exclusive.
  var start = 0, end, curr = 0, next = 0;
  var result = '';

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index;
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next; // derive end <= length-2
      result += '\n' + line.slice(start, end);
      // skip the space that was output as \n
      start = end + 1;                    // derive start <= length-1
    }
    curr = next;
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n';
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString(string) {
  var result = '';
  var char = 0;
  var escapeSeq;

  for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];

    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 0x10000) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level, value, false, false) ||
        (typeof value === 'undefined' &&
         writeNode(state, level, null, false, false))) {

      if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level + 1, value, true, true, false, true) ||
        (typeof value === 'undefined' &&
         writeNode(state, level + 1, null, true, true, false, true))) {

      if (!compact || _result !== '') {
        _result += generateNextLine(state, level);
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-';
      } else {
        _result += '- ';
      }

      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {

    pairBuffer = '';
    if (_result !== '') pairBuffer += ', ';

    if (state.condenseFlow) pairBuffer += '"';

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';

    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new YAMLException('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || _result !== '') {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (state.tag !== null && state.tag !== '?') ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      if (explicit) {
        if (type.multi && type.representName) {
          state.tag = type.representName(object);
        } else {
          state.tag = type.tag;
        }
      } else {
        state.tag = '?';
      }

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);
  var inblock = block;
  var tagStr;

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level);
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type === '[object Object]') {
      if (block && (Object.keys(state.dump).length !== 0)) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      if (block && (state.dump.length !== 0)) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type === '[object Undefined]') {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new YAMLException('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      // Need to encode all characters except those allowed by the spec:
      //
      // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
      // [36] ns-hex-digit    ::=  ns-dec-digit
      //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
      // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
      // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
      // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
      //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
      //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
      //
      // Also need to encode '!' because it has special meaning (end of tag prefix).
      //
      tagStr = encodeURI(
        state.tag[0] === '!' ? state.tag.slice(1) : state.tag
      ).replace(/!/g, '%21');

      if (state.tag[0] === '!') {
        tagStr = '!' + tagStr;
      } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
        tagStr = '!!' + tagStr.slice(18);
      } else {
        tagStr = '!<' + tagStr + '>';
      }

      state.dump = tagStr + ' ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;

  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList,
      index,
      length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump(input, options) {
  options = options || {};

  var state = new State(options);

  if (!state.noRefs) getDuplicateReferences(input, state);

  var value = input;

  if (state.replacer) {
    value = state.replacer.call({ '': value }, '', value);
  }

  if (writeNode(state, 0, value, true, true)) return state.dump + '\n';

  return '';
}

module.exports.dump = dump;

},{"./common":4,"./exception":6,"./schema/default":10}],6:[function(require,module,exports){
// YAML error class. http://stackoverflow.com/questions/8458984
//
'use strict';


function formatError(exception, compact) {
  var where = '', message = exception.reason || '(unknown reason)';

  if (!exception.mark) return message;

  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" ';
  }

  where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

  if (!compact && exception.mark.snippet) {
    where += '\n\n' + exception.mark.snippet;
  }

  return message + ' ' + where;
}


function YAMLException(reason, mark) {
  // Super constructor
  Error.call(this);

  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || '';
  }
}


// Inherit from Error
YAMLException.prototype = Object.create(Error.prototype);
YAMLException.prototype.constructor = YAMLException;


YAMLException.prototype.toString = function toString(compact) {
  return this.name + ': ' + formatError(this, compact);
};


module.exports = YAMLException;

},{}],7:[function(require,module,exports){
'use strict';

/*eslint-disable max-len,no-use-before-define*/

var common              = require('./common');
var YAMLException       = require('./exception');
var makeSnippet         = require('./snippet');
var DEFAULT_SCHEMA      = require('./schema/default');


var _hasOwnProperty = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function _class(obj) { return Object.prototype.toString.call(obj); }

function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C/* , */ ||
         c === 0x5B/* [ */ ||
         c === 0x5D/* ] */ ||
         c === 0x7B/* { */ ||
         c === 0x7D/* } */;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  /*eslint-disable no-bitwise*/
  lc = c | 0x20;

  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  /* eslint-disable indent */
  return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(
    ((c - 0x010000) >> 10) + 0xD800,
    ((c - 0x010000) & 0x03FF) + 0xDC00
  );
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || DEFAULT_SCHEMA;
  this.onWarning = options['onWarning'] || null;
  // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
  // if such documents have no explicit %YAML directive
  this.legacy    = options['legacy']    || false;

  this.json      = options['json']      || false;
  this.listener  = options['listener']  || null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  // position of first leading tab in the current line,
  // used to make sure there are no tabs in the indentation
  this.firstTabInLine = -1;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  var mark = {
    name:     state.filename,
    buffer:   state.input.slice(0, -1), // omit trailing \0
    position: state.position,
    line:     state.line,
    column:   state.position - state.lineStart
  };

  mark.snippet = makeSnippet(mark);

  return new YAMLException(message, mark);
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}


var directiveHandlers = {

  YAML: function handleYamlDirective(state, name, args) {

    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = (minor < 2);

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },

  TAG: function handleTagDirective(state, name, args) {

    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, 'tag prefix is malformed: ' + prefix);
    }

    state.tagMap[handle] = prefix;
  }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 0x09 ||
              (0x20 <= _character && _character <= 0x10FFFF))) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode,
  startLine, startLineStart, startPos) {

  var index, quantity;

  // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);

    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys');
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]';
      }
    }
  }

  // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)
  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]';
  }


  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json &&
        !_hasOwnProperty.call(overridableKeys, keyNode) &&
        _hasOwnProperty.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, 'duplicated mapping key');
    }

    // used for this specific key only because Object.defineProperty is slow
    if (keyNode === '__proto__') {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }
    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A/* LF */) {
    state.position++;
  } else if (ch === 0x0D/* CR */) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23/* # */) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20/* Space */) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
      ch === state.input.charCodeAt(_position + 1) &&
      ch === state.input.charCodeAt(_position + 2)) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)      ||
      is_FLOW_INDICATOR(ch) ||
      ch === 0x23/* # */    ||
      ch === 0x26/* & */    ||
      ch === 0x2A/* * */    ||
      ch === 0x21/* ! */    ||
      ch === 0x7C/* | */    ||
      ch === 0x3E/* > */    ||
      ch === 0x27/* ' */    ||
      ch === 0x22/* " */    ||
      ch === 0x25/* % */    ||
      ch === 0x40/* @ */    ||
      ch === 0x60/* ` */) {
    return false;
  }

  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A/* : */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (ch === 0x23/* # */) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27/* ' */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27/* ' */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x27/* ' */) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22/* " */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22/* " */) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (ch === 0x5C/* \ */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);

        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _lineStart,
      _pos,
      _tag     = state.tag,
      _result,
      _anchor  = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = Object.create(null),
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D;/* ] */
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D;/* } */
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    } else if (ch === 0x2C/* , */) {
      // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
      throwError(state, "expected the node content, but found ','");
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F/* ? */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line; // Save the current line.
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C/* , */) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (ch === 0x23/* # */) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (ch !== 0));
    }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (ch === 0x20/* Space */)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        // except for the first content line (cf. Example 8.1)
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (ch !== 0)) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _anchor   = state.anchor,
      _result   = [],
      following,
      detected  = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    if (ch !== 0x2D/* - */) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }
  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _keyLine,
      _keyLineStart,
      _keyPos,
      _tag          = state.tag,
      _anchor       = state.anchor,
      _result       = {},
      overridableKeys = Object.create(null),
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

      if (ch === 0x3F/* ? */) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;

      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        // Neither implicit nor explicit notation.
        // Reading is done. Go to the epilogue.
        break;
      }

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A/* : */) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }

      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x21/* ! */) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C/* < */) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (ch === 0x21/* ! */) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (ch !== 0 && ch !== 0x3E/* > */);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {

      if (ch === 0x21/* ! */) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, 'tag name is malformed: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;

  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x26/* & */) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x2A/* * */) return false;

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!_hasOwnProperty.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
      atNewLine  = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      typeList,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }

  } else if (state.tag === '?') {
    // Implicit resolving is not allowed for non-scalar types, and '?'
    // non-specific tag is only automatically assigned to plain scalars.
    //
    // We only need to check kind conformity in case user explicitly assigns '?'
    // tag, for example like this: "!<?> [0]"
    //
    if (state.result !== null && state.kind !== 'scalar') {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }

    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type = state.implicitTypes[typeIndex];

      if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
        state.result = type.construct(state.result);
        state.tag = type.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== '!') {
    if (_hasOwnProperty.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag];
    } else {
      // looking for multi type
      type = null;
      typeList = state.typeMap.multi[state.kind || 'fallback'];

      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type = typeList[typeIndex];
          break;
        }
      }
    }

    if (!type) {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }

    if (state.result !== null && type.kind !== state.kind) {
      throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
    }

    if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
      throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
    } else {
      state.result = type.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }
  return state.tag !== null ||  state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (ch !== 0 && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) break;

      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 &&
      state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {

    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
      input += '\n';
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State(input, options);

  var nullpos = input.indexOf('\0');

  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, 'null byte is not allowed in input');
  }

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll(input, iterator, options) {
  if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
    options = iterator;
    iterator = null;
  }

  var documents = loadDocuments(input, options);

  if (typeof iterator !== 'function') {
    return documents;
  }

  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new YAMLException('expected a single document in the stream, but found more');
}


module.exports.loadAll = loadAll;
module.exports.load    = load;

},{"./common":4,"./exception":6,"./schema/default":10,"./snippet":13}],8:[function(require,module,exports){
'use strict';

/*eslint-disable max-len*/

var YAMLException = require('./exception');
var Type          = require('./type');


function compileList(schema, name) {
  var result = [];

  schema[name].forEach(function (currentType) {
    var newIndex = result.length;

    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag &&
          previousType.kind === currentType.kind &&
          previousType.multi === currentType.multi) {

        newIndex = previousIndex;
      }
    });

    result[newIndex] = currentType;
  });

  return result;
}


function compileMap(/* lists... */) {
  var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {},
        multi: {
          scalar: [],
          sequence: [],
          mapping: [],
          fallback: []
        }
      }, index, length;

  function collectType(type) {
    if (type.multi) {
      result.multi[type.kind].push(type);
      result.multi['fallback'].push(type);
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}


function Schema(definition) {
  return this.extend(definition);
}


Schema.prototype.extend = function extend(definition) {
  var implicit = [];
  var explicit = [];

  if (definition instanceof Type) {
    // Schema.extend(type)
    explicit.push(definition);

  } else if (Array.isArray(definition)) {
    // Schema.extend([ type1, type2, ... ])
    explicit = explicit.concat(definition);

  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);

  } else {
    throw new YAMLException('Schema.extend argument should be a Type, [ Type ], ' +
      'or a schema definition ({ implicit: [...], explicit: [...] })');
  }

  implicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }

    if (type.loadKind && type.loadKind !== 'scalar') {
      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }

    if (type.multi) {
      throw new YAMLException('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
    }
  });

  explicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }
  });

  var result = Object.create(Schema.prototype);

  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);

  result.compiledImplicit = compileList(result, 'implicit');
  result.compiledExplicit = compileList(result, 'explicit');
  result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);

  return result;
};


module.exports = Schema;

},{"./exception":6,"./type":14}],9:[function(require,module,exports){
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, Core schema has no distinctions from JSON schema is JS-YAML.


'use strict';


module.exports = require('./json');

},{"./json":12}],10:[function(require,module,exports){
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)


'use strict';


module.exports = require('./core').extend({
  implicit: [
    require('../type/timestamp'),
    require('../type/merge')
  ],
  explicit: [
    require('../type/binary'),
    require('../type/omap'),
    require('../type/pairs'),
    require('../type/set')
  ]
});

},{"../type/binary":15,"../type/merge":20,"../type/omap":22,"../type/pairs":23,"../type/set":25,"../type/timestamp":27,"./core":9}],11:[function(require,module,exports){
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  explicit: [
    require('../type/str'),
    require('../type/seq'),
    require('../type/map')
  ]
});

},{"../schema":8,"../type/map":19,"../type/seq":24,"../type/str":26}],12:[function(require,module,exports){
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.


'use strict';


module.exports = require('./failsafe').extend({
  implicit: [
    require('../type/null'),
    require('../type/bool'),
    require('../type/int'),
    require('../type/float')
  ]
});

},{"../type/bool":16,"../type/float":17,"../type/int":18,"../type/null":21,"./failsafe":11}],13:[function(require,module,exports){
'use strict';


var common = require('./common');


// get snippet for a single line, respecting maxLength
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = '';
  var tail = '';
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

  if (position - lineStart > maxHalfLength) {
    head = ' ... ';
    lineStart = position - maxHalfLength + head.length;
  }

  if (lineEnd - position > maxHalfLength) {
    tail = ' ...';
    lineEnd = position + maxHalfLength - tail.length;
  }

  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
    pos: position - lineStart + head.length // relative position
  };
}


function padStart(string, max) {
  return common.repeat(' ', max - string.length) + string;
}


function makeSnippet(mark, options) {
  options = Object.create(options || null);

  if (!mark.buffer) return null;

  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent      !== 'number') options.indent      = 1;
  if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
  if (typeof options.linesAfter  !== 'number') options.linesAfter  = 2;

  var re = /\r?\n|\r|\0/g;
  var lineStarts = [ 0 ];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;

  while ((match = re.exec(mark.buffer))) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);

    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }

  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;

  var result = '', i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n' + result;
  }

  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
    ' | ' + line.str + '\n';
  result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n';
  }

  return result.replace(/\n$/, '');
}


module.exports = makeSnippet;

},{"./common":4}],14:[function(require,module,exports){
'use strict';

var YAMLException = require('./exception');

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'multi',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'representName',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.options       = options; // keep original options in case user wants to extend this type later
  this.tag           = tag;
  this.kind          = options['kind']          || null;
  this.resolve       = options['resolve']       || function () { return true; };
  this.construct     = options['construct']     || function (data) { return data; };
  this.instanceOf    = options['instanceOf']    || null;
  this.predicate     = options['predicate']     || null;
  this.represent     = options['represent']     || null;
  this.representName = options['representName'] || null;
  this.defaultStyle  = options['defaultStyle']  || null;
  this.multi         = options['multi']         || false;
  this.styleAliases  = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

module.exports = Type;

},{"./exception":6}],15:[function(require,module,exports){
'use strict';

/*eslint-disable no-bitwise*/


var Type = require('../type');


// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  if (data === null) return false;

  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) continue;

    // Fail on illegal characters
    if (code < 0) return false;

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4) * 6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  return new Uint8Array(result);
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(obj) {
  return Object.prototype.toString.call(obj) ===  '[object Uint8Array]';
}

module.exports = new Type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});

},{"../type":14}],16:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlBoolean(data) {
  if (data === null) return false;

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

module.exports = new Type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});

},{"../type":14}],17:[function(require,module,exports){
'use strict';

var common = require('../common');
var Type   = require('../type');

var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
  // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
  // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' +
  // .nan
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data) ||
      // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === '_') {
    return false;
  }

  return true;
}

function constructYamlFloat(data) {
  var value, sign;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = value[0] === '-' ? -1 : 1;

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if (value === '.nan') {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}


var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase': return '.nan';
      case 'uppercase': return '.NAN';
      case 'camelcase': return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '.inf';
      case 'uppercase': return '.INF';
      case 'camelcase': return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '-.inf';
      case 'uppercase': return '-.INF';
      case 'camelcase': return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10);

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return (Object.prototype.toString.call(object) === '[object Number]') &&
         (object % 1 !== 0 || common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});

},{"../common":4,"../type":14}],18:[function(require,module,exports){
'use strict';

var common = require('../common');
var Type   = require('../type');

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  if (data === null) return false;

  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) return false;

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'o') {
      // base 8
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }
  }

  // base 10 (except 0)

  // value should not start with `_`;
  if (ch === '_') return false;

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  // Should have digits and should not end with `_`
  if (!hasDigits || ch === '_') return false;

  return true;
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch;

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
    if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return (Object.prototype.toString.call(object)) === '[object Number]' &&
         (object % 1 === 0 && !common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
    octal:       function (obj) { return obj >= 0 ? '0o'  + obj.toString(8) : '-0o'  + obj.toString(8).slice(1); },
    decimal:     function (obj) { return obj.toString(10); },
    /* eslint-disable max-len */
    hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});

},{"../common":4,"../type":14}],19:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {}; }
});

},{"../type":14}],20:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

module.exports = new Type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});

},{"../type":14}],21:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlNull(data) {
  if (data === null) return true;

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

module.exports = new Type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; },
    empty:     function () { return '';     }
  },
  defaultStyle: 'lowercase'
});

},{"../type":14}],22:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _toString       = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;

  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if (_toString.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }

    if (!pairHasKey) return false;

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

module.exports = new Type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});

},{"../type":14}],23:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _toString = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if (_toString.call(pair) !== '[object Object]') return false;

    keys = Object.keys(pair);

    if (keys.length !== 1) return false;

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

module.exports = new Type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});

},{"../type":14}],24:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return data !== null ? data : []; }
});

},{"../type":14}],25:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

module.exports = new Type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});

},{"../type":14}],26:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : ''; }
});

},{"../type":14}],27:[function(require,module,exports){
'use strict';

var Type = require('../type');

var YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9])'                    + // [2] month
  '-([0-9][0-9])$');                   // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:[Tt]|[ \\t]+)'                 + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (match === null) throw new Error('Date resolve error');

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) date.setTime(date.getTime() - delta);

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

module.exports = new Type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});

},{"../type":14}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConversionError = exports.EvaluationError = exports.ParsingError = exports.MathParserError = exports.TokenIdToOperatorMap = exports.TokenMap = exports.TokensMap = exports.UnaryOperatorFunctionMap = exports.OperatorMap = exports.TokenId = exports.TokenType = exports.OperatorId = exports.Associativity = exports.ErrorTypes = exports.ConversionErrorType = exports.EvaluationErrorType = exports.ParsingErrorType = undefined;

var _OperatorsMap, _UnaryOperatorFunctio, _TokenIdsToOperatorMa;

var _changeCase = {constantCase: val => (val || '').toUpperCase()}

var _makeEnum = require("../lib/makeEnum.js");

var _makeEnum2 = _interopRequireDefault(_makeEnum);

var _Units = require("../constants/Units.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ParsingErrorType = exports.ParsingErrorType = (0, _makeEnum2.default)({
  EMPTY: null,
  MISMATCHED_PARENS: null,
  SYNTAX_ERROR: null
});

var EvaluationErrorType = exports.EvaluationErrorType = (0, _makeEnum2.default)({
  DIVIDE_BY_ZERO: null,
  EXPECTED_CURRENT_VALUE: null,
  EXPECTED_MORE_ARGUMENTS: null,
  IMAGINARY_NUMBER: null,
  UNEXPECTED_TOKEN: null
});

var ConversionErrorType = exports.ConversionErrorType = (0, _makeEnum2.default)({
  INCOMPATIBLE_MEASURES: null,
  EXPECTED_PIXELS_OR_INCHES_OR_CENTIMETERS: null,
  RESOLUTION_LESS_THAN_ONE: null,
  PIXELS_LESS_THAN_ONE: null
});

var ErrorTypes = exports.ErrorTypes = {
  ParsingErrorType: ParsingErrorType,
  EvaluationErrorType: EvaluationErrorType,
  ConversionErrorType: ConversionErrorType
};

var Associativity = exports.Associativity = (0, _makeEnum2.default)({
  NONE: null,
  LEFT: null,
  RIGHT: null
});

var OperatorIds = {
  NONE: null,
  ADD: null,
  COSINE: null,
  COSECANT: null,
  COTANGENT: null,
  DIVIDE: null,
  E: null,
  EXPONENT: null,
  MULTIPLY: null,
  PAREN_L: null,
  PAREN_R: null,
  PERCENTAGE: null,
  PI: null,
  SECANT: null,
  SINE: null,
  SUBTRACT: null,
  TANGENT: null,
  TAU: null,
  TIMES: null,
  UNARY_MINUS: null,
  UNARY_PLUS: null
};

var OperatorId = exports.OperatorId = (0, _makeEnum2.default)(Object.assign({}, OperatorIds, _Units.Unit));

var TokenType = exports.TokenType = (0, _makeEnum2.default)({
  NONE: null,
  NUMBER: null,
  OPERATOR: null
});

var TokenIds = {
  NONE: null,
  ASTERISK: null,
  CARET: null,
  COS: null,
  COT: null,
  CSC: null,
  E: null,
  MINUS: null,
  PAREN_L: null,
  PAREN_R: null,
  PERCENT: null,
  PI: null,
  PLUS: null,
  SEC: null,
  SIN: null,
  SLASH: null,
  TAN: null,
  TAU: null,
  X: null,
  PRIME: null,
  DOUBLE_PRIME: null
};

var UnitTokenIds = Object.keys(_Units.UnitMap).map(function (k) {
  return _Units.UnitMap[k];
}).reduce(function (result, item) {
  if (item.abbreviation) result[(0, _changeCase.constantCase)(item.abbreviation)] = null;
  return result;
}, {});

var TokenId = exports.TokenId = (0, _makeEnum2.default)(Object.assign({}, TokenIds, UnitTokenIds));

/* eslint key-spacing: 0 */
/* eslint no-multi-spaces: 0 */
var OperatorsMap = (_OperatorsMap = {}, _defineProperty(_OperatorsMap, OperatorId.PAREN_L, { associativity: Associativity.NONE, precedence: 0, degree: 0, name: "(" }), _defineProperty(_OperatorsMap, OperatorId.PAREN_R, { associativity: Associativity.NONE, precedence: 0, degree: 0, name: ")" }), _defineProperty(_OperatorsMap, OperatorId.ADD, { associativity: Associativity.LEFT, precedence: 10, degree: 2, name: "add" }), _defineProperty(_OperatorsMap, OperatorId.SUBTRACT, { associativity: Associativity.LEFT, precedence: 10, degree: 2, name: "sub" }), _defineProperty(_OperatorsMap, OperatorId.DIVIDE, { associativity: Associativity.LEFT, precedence: 20, degree: 2, name: "div" }), _defineProperty(_OperatorsMap, OperatorId.MULTIPLY, { associativity: Associativity.LEFT, precedence: 20, degree: 2, name: "mul" }), _defineProperty(_OperatorsMap, OperatorId.PERCENTAGE, { associativity: Associativity.LEFT, precedence: 30, degree: 1, name: "%" }), _defineProperty(_OperatorsMap, OperatorId.TIMES, { associativity: Associativity.LEFT, precedence: 30, degree: 1, name: "x" }), _defineProperty(_OperatorsMap, OperatorId.COSECANT, { associativity: Associativity.RIGHT, precedence: 40, degree: 1, name: "csc" }), _defineProperty(_OperatorsMap, OperatorId.COSINE, { associativity: Associativity.RIGHT, precedence: 40, degree: 1, name: "cos" }), _defineProperty(_OperatorsMap, OperatorId.COTANGENT, { associativity: Associativity.RIGHT, precedence: 40, degree: 1, name: "cot" }), _defineProperty(_OperatorsMap, OperatorId.SECANT, { associativity: Associativity.RIGHT, precedence: 40, degree: 1, name: "sec" }), _defineProperty(_OperatorsMap, OperatorId.SINE, { associativity: Associativity.RIGHT, precedence: 40, degree: 1, name: "sin" }), _defineProperty(_OperatorsMap, OperatorId.TANGENT, { associativity: Associativity.RIGHT, precedence: 40, degree: 1, name: "tan" }), _defineProperty(_OperatorsMap, OperatorId.EXPONENT, { associativity: Associativity.RIGHT, precedence: 90, degree: 2, name: "exp" }), _defineProperty(_OperatorsMap, OperatorId.UNARY_MINUS, { associativity: Associativity.RIGHT, precedence: 100, degree: 1, name: "neg" }), _defineProperty(_OperatorsMap, OperatorId.UNARY_PLUS, { associativity: Associativity.RIGHT, precedence: 100, degree: 1, name: "pos" }), _defineProperty(_OperatorsMap, OperatorId.E, { associativity: Associativity.LEFT, precedence: 200, degree: 0, name: "e" }), _defineProperty(_OperatorsMap, OperatorId.PI, { associativity: Associativity.LEFT, precedence: 200, degree: 0, name: "pi" }), _defineProperty(_OperatorsMap, OperatorId.TAU, { associativity: Associativity.LEFT, precedence: 200, degree: 0, name: "tau" }), _OperatorsMap);

var UnitOperatorsMap = Object.keys(_Units.Unit).reduce(function (result, key) {
  result[key] = { associativity: Associativity.LEFT, precedence: 30, degree: 1, name: _Units.UnitMap[key].abbreviation };
  return result;
}, {});

var OperatorMap = exports.OperatorMap = Object.assign({}, OperatorsMap, UnitOperatorsMap);

var UnaryOperatorFunctionMap = exports.UnaryOperatorFunctionMap = (_UnaryOperatorFunctio = {}, _defineProperty(_UnaryOperatorFunctio, OperatorId.COSECANT, function (x) {
  return 1 / Math.sin(x);
}), _defineProperty(_UnaryOperatorFunctio, OperatorId.COSINE, Math.cos), _defineProperty(_UnaryOperatorFunctio, OperatorId.COTANGENT, function (x) {
  return 1 / Math.tan(x);
}), _defineProperty(_UnaryOperatorFunctio, OperatorId.SECANT, function (x) {
  return 1 / Math.cos(x);
}), _defineProperty(_UnaryOperatorFunctio, OperatorId.SINE, Math.sin), _defineProperty(_UnaryOperatorFunctio, OperatorId.TANGENT, Math.tan), _UnaryOperatorFunctio);

var TokensMap = exports.TokensMap = {
  "'": TokenId.PRIME,
  '"': TokenId.DOUBLE_PRIME,
  "%": TokenId.PERCENT,
  "(": TokenId.PAREN_L,
  ")": TokenId.PAREN_R,
  "*": TokenId.ASTERISK,
  "+": TokenId.PLUS,
  "-": TokenId.MINUS,
  "/": TokenId.SLASH,
  "^": TokenId.CARET,
  "cos": TokenId.COS,
  "cot": TokenId.COT,
  "csc": TokenId.CSC,
  "e": TokenId.E,
  "pi": TokenId.PI,
  "sec": TokenId.SEC,
  "sin": TokenId.SIN,
  "tan": TokenId.TAN,
  "tau": TokenId.TAU,
  "x": TokenId.X
};

var UnitTokensMap = Object.keys(_Units.UnitMap).map(function (k) {
  return _Units.UnitMap[k];
}).reduce(function (result, item) {
  if (item.abbreviation) {
    result[item.abbreviation] = TokenId[(0, _changeCase.constantCase)(item.abbreviation)];
  }
  return result;
}, {});

var TokenMap = exports.TokenMap = Object.assign({}, TokensMap, UnitTokensMap);

// [1]: Check if leftIsEdge when creating operator to differentiate between unary and binary operators.
var TokenIdsToOperatorMap = (_TokenIdsToOperatorMa = {}, _defineProperty(_TokenIdsToOperatorMa, TokenId.ASTERISK, OperatorId.MULTIPLY), _defineProperty(_TokenIdsToOperatorMa, TokenId.CARET, OperatorId.EXPONENT), _defineProperty(_TokenIdsToOperatorMa, TokenId.CSC, OperatorId.COSECANT), _defineProperty(_TokenIdsToOperatorMa, TokenId.COS, OperatorId.COSINE), _defineProperty(_TokenIdsToOperatorMa, TokenId.COT, OperatorId.COTANGENT), _defineProperty(_TokenIdsToOperatorMa, TokenId.DOUBLE_PRIME, OperatorId.INCHES), _defineProperty(_TokenIdsToOperatorMa, TokenId.E, OperatorId.E), _defineProperty(_TokenIdsToOperatorMa, TokenId.NONE, OperatorId.NONE), _defineProperty(_TokenIdsToOperatorMa, TokenId.MINUS, OperatorId.SUBTRACT), _defineProperty(_TokenIdsToOperatorMa, TokenId.PAREN_L, OperatorId.PAREN_L), _defineProperty(_TokenIdsToOperatorMa, TokenId.PAREN_R, OperatorId.PAREN_R), _defineProperty(_TokenIdsToOperatorMa, TokenId.PRIME, OperatorId.FEET), _defineProperty(_TokenIdsToOperatorMa, TokenId.PERCENT, OperatorId.PERCENTAGE), _defineProperty(_TokenIdsToOperatorMa, TokenId.PI, OperatorId.PI), _defineProperty(_TokenIdsToOperatorMa, TokenId.PLUS, OperatorId.ADD), _defineProperty(_TokenIdsToOperatorMa, TokenId.SEC, OperatorId.SECANT), _defineProperty(_TokenIdsToOperatorMa, TokenId.SIN, OperatorId.SINE), _defineProperty(_TokenIdsToOperatorMa, TokenId.SLASH, OperatorId.DIVIDE), _defineProperty(_TokenIdsToOperatorMa, TokenId.TAN, OperatorId.TANGENT), _defineProperty(_TokenIdsToOperatorMa, TokenId.TAU, OperatorId.TAU), _defineProperty(_TokenIdsToOperatorMa, TokenId.X, OperatorId.TIMES), _TokenIdsToOperatorMa);

var UnitTokenIdToOperatorMap = Object.keys(_Units.Unit).reduce(function (result, key) {
  result[(0, _changeCase.constantCase)(_Units.UnitMap[key].abbreviation)] = key;
  return result;
}, {});

var TokenIdToOperatorMap = exports.TokenIdToOperatorMap = Object.assign({}, TokenIdsToOperatorMap, UnitTokenIdToOperatorMap);

var MathParserError = exports.MathParserError = function (_Error) {
  _inherits(MathParserError, _Error);

  function MathParserError(errorType, filteredExpression, errorPosition, errorLength) {
    _classCallCheck(this, MathParserError);

    var _this = _possibleConstructorReturn(this, (MathParserError.__proto__ || Object.getPrototypeOf(MathParserError)).call(this));

    _this.errorType = errorType;
    _this.filteredExpression = filteredExpression;
    _this.errorPosition = errorPosition;
    _this.errorLength = errorLength;
    return _this;
  }

  return MathParserError;
}(Error);

var ParsingError = exports.ParsingError = function (_MathParserError) {
  _inherits(ParsingError, _MathParserError);

  function ParsingError(errorType) {
    var filteredExpression = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    var errorPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var errorLength = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    _classCallCheck(this, ParsingError);

    return _possibleConstructorReturn(this, (ParsingError.__proto__ || Object.getPrototypeOf(ParsingError)).call(this, errorType, filteredExpression, errorPosition, errorLength));
  }

  return ParsingError;
}(MathParserError);

var EvaluationError = exports.EvaluationError = function (_MathParserError2) {
  _inherits(EvaluationError, _MathParserError2);

  function EvaluationError(errorType) {
    var filteredExpression = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    var errorPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var errorLength = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    _classCallCheck(this, EvaluationError);

    return _possibleConstructorReturn(this, (EvaluationError.__proto__ || Object.getPrototypeOf(EvaluationError)).call(this, errorType, filteredExpression, errorPosition, errorLength));
  }

  return EvaluationError;
}(MathParserError);

var ConversionError = exports.ConversionError = function (_MathParserError3) {
  _inherits(ConversionError, _MathParserError3);

  function ConversionError(errorType) {
    var filteredExpression = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    var errorPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var errorLength = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    _classCallCheck(this, ConversionError);

    return _possibleConstructorReturn(this, (ConversionError.__proto__ || Object.getPrototypeOf(ConversionError)).call(this, errorType, filteredExpression, errorPosition, errorLength));
  }

  return ConversionError;
}(MathParserError);
},{"../constants/Units.js":29,"../lib/makeEnum.js":32}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnitMap = exports.MeasureMap = exports.Measure = exports.System = exports.Unit = undefined;

var _anchors, _Measure$ANGLE, _System$METRIC, _System$IMPERIAL, _anchors2, _Measure$LENGTH, _Measure$SCALAR, _Measure$SCREEN, _MeasureMap, _UnitMap;

var _makeEnum = require("../lib/makeEnum.js");

var _makeEnum2 = _interopRequireDefault(_makeEnum);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Unit = exports.Unit = (0, _makeEnum2.default)({
  // Length
  // Imperial
  INCHES: null,
  FEET: null,
  YARDS: null,
  MILES: null,
  // Metric
  PICOMETERS: null,
  NANOMETERS: null,
  MICROMETERS: null,
  MILLIMETERS: null,
  CENTIMETERS: null,
  DECIMETERS: null,
  METERS: null,
  DEKAMETERS: null,
  HECTOMETERS: null,
  KILOMETERS: null,

  // Screen
  PIXELS: null,

  // Angle
  DEGREES: null,
  RADIANS: null,

  NONE: null
});

var System = exports.System = (0, _makeEnum2.default)({
  IMPERIAL: null,
  METRIC: null,

  SI: null,
  NON_SI: null,

  NONE: null
});

var Measure = exports.Measure = (0, _makeEnum2.default)({
  ANGLE: null,
  LENGTH: null,
  SCALAR: null,
  SCREEN: null
});

var MeasureMap = exports.MeasureMap = (_MeasureMap = {}, _defineProperty(_MeasureMap, Measure.ANGLE, (_Measure$ANGLE = {}, _defineProperty(_Measure$ANGLE, System.SI, _defineProperty({}, Unit.RADIANS, 1)), _defineProperty(_Measure$ANGLE, System.NON_SI, _defineProperty({}, Unit.DEGREES, 1)), _defineProperty(_Measure$ANGLE, "anchors", (_anchors = {}, _defineProperty(_anchors, System.SI, {
  unit: Unit.RADIANS,
  conversion: 180 / Math.PI
}), _defineProperty(_anchors, System.NON_SI, {
  unit: Unit.DEGREES,
  conversion: Math.PI / 180
}), _anchors)), _Measure$ANGLE)), _defineProperty(_MeasureMap, Measure.LENGTH, (_Measure$LENGTH = {}, _defineProperty(_Measure$LENGTH, System.METRIC, (_System$METRIC = {}, _defineProperty(_System$METRIC, Unit.PICOMETERS, 1 / 1e-12), _defineProperty(_System$METRIC, Unit.NANOMETERS, 1 / 1e-9), _defineProperty(_System$METRIC, Unit.MICROMETERS, 1 / 1e-6), _defineProperty(_System$METRIC, Unit.MILLIMETERS, 1 / 1000), _defineProperty(_System$METRIC, Unit.CENTIMETERS, 1 / 100), _defineProperty(_System$METRIC, Unit.DECIMETERS, 1 / 10), _defineProperty(_System$METRIC, Unit.METERS, 1), _defineProperty(_System$METRIC, Unit.DEKAMETERS, 10), _defineProperty(_System$METRIC, Unit.HECTOMETERS, 100), _defineProperty(_System$METRIC, Unit.KILOMETERS, 1000), _System$METRIC)), _defineProperty(_Measure$LENGTH, System.IMPERIAL, (_System$IMPERIAL = {}, _defineProperty(_System$IMPERIAL, Unit.INCHES, 1 / 12), _defineProperty(_System$IMPERIAL, Unit.FEET, 1), _defineProperty(_System$IMPERIAL, Unit.YARDS, 3), _defineProperty(_System$IMPERIAL, Unit.MILES, 5280), _System$IMPERIAL)), _defineProperty(_Measure$LENGTH, "anchors", (_anchors2 = {}, _defineProperty(_anchors2, System.METRIC, {
  unit: Unit.METERS,
  conversion: 3.28084
}), _defineProperty(_anchors2, System.IMPERIAL, {
  unit: Unit.FEET,
  conversion: 1 / 3.28084
}), _anchors2)), _Measure$LENGTH)), _defineProperty(_MeasureMap, Measure.SCALAR, (_Measure$SCALAR = {}, _defineProperty(_Measure$SCALAR, System.NONE, _defineProperty({}, Unit.NONE, 1)), _defineProperty(_Measure$SCALAR, "anchors", _defineProperty({}, System.NONE, {
  unit: Unit.NONE,
  conversion: 1
})), _Measure$SCALAR)), _defineProperty(_MeasureMap, Measure.SCREEN, (_Measure$SCREEN = {}, _defineProperty(_Measure$SCREEN, System.NONE, _defineProperty({}, Unit.PIXELS, 1)), _defineProperty(_Measure$SCREEN, "anchors", _defineProperty({}, System.NONE, {
  unit: Unit.PIXELS,
  conversion: 1
})), _Measure$SCREEN)), _MeasureMap);

var UnitMap = exports.UnitMap = (_UnitMap = {}, _defineProperty(_UnitMap, Unit.INCHES, { measure: Measure.LENGTH, system: System.IMPERIAL, abbreviation: "in", shorthand: '"' }), _defineProperty(_UnitMap, Unit.FEET, { measure: Measure.LENGTH, system: System.IMPERIAL, abbreviation: "ft", shorthand: "'" }), _defineProperty(_UnitMap, Unit.YARDS, { measure: Measure.LENGTH, system: System.IMPERIAL, abbreviation: "yd" }), _defineProperty(_UnitMap, Unit.MILES, { measure: Measure.LENGTH, system: System.IMPERIAL, abbreviation: "mi" }), _defineProperty(_UnitMap, Unit.PICOMETERS, { measure: Measure.LENGTH, system: System.METRIC, abbreviation: "pm" }), _defineProperty(_UnitMap, Unit.NANOMETERS, { measure: Measure.LENGTH, system: System.METRIC, abbreviation: "nm" }), _defineProperty(_UnitMap, Unit.MICROMETERS, { measure: Measure.LENGTH, system: System.METRIC, abbreviation: "um" }), _defineProperty(_UnitMap, Unit.MILLIMETERS, { measure: Measure.LENGTH, system: System.METRIC, abbreviation: "mm" }), _defineProperty(_UnitMap, Unit.CENTIMETERS, { measure: Measure.LENGTH, system: System.METRIC, abbreviation: "cm" }), _defineProperty(_UnitMap, Unit.DECIMETERS, { measure: Measure.LENGTH, system: System.METRIC, abbreviation: "dm" }), _defineProperty(_UnitMap, Unit.METERS, { measure: Measure.LENGTH, system: System.METRIC, abbreviation: "m" }), _defineProperty(_UnitMap, Unit.DEKAMETERS, { measure: Measure.LENGTH, system: System.METRIC, abbreviation: "dam" }), _defineProperty(_UnitMap, Unit.HECTOMETERS, { measure: Measure.LENGTH, system: System.METRIC, abbreviation: "hm" }), _defineProperty(_UnitMap, Unit.KILOMETERS, { measure: Measure.LENGTH, system: System.METRIC, abbreviation: "km" }), _defineProperty(_UnitMap, Unit.PIXELS, { measure: Measure.SCREEN, system: System.NONE, abbreviation: "px" }), _defineProperty(_UnitMap, Unit.DEGREES, { measure: Measure.ANGLE, system: System.NON_SI, abbreviation: "deg" }), _defineProperty(_UnitMap, Unit.RADIANS, { measure: Measure.ANGLE, system: System.SI, abbreviation: "rad" }), _defineProperty(_UnitMap, Unit.NONE, { measure: Measure.SCALAR, system: System.NONE, abbreviation: undefined }), _UnitMap);
},{"../lib/makeEnum.js":32}],30:[function(require,module,exports){
"use strict";

var _MathFilter = require("./models/MathFilter.js");

var _MathFilter2 = _interopRequireDefault(_MathFilter);

var _Units = require("./constants/Units.js");

var _MathParser = require("./constants/MathParser.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  MathParser: _MathFilter2.default,
  Unit: _Units.Unit,
  ErrorTypes: _MathParser.ErrorTypes
};
},{"./constants/MathParser.js":28,"./constants/Units.js":29,"./models/MathFilter.js":33}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/** keyHandler: a handler for use with a Proxy, (eg, new Proxy({}, keyHandler);)
* This handler checks to see if a key exists in an object and throws an error if it
* does not.
*/

var keyHandler = {
  get: function get(target, name) {
    if (name in target) {
      return target[name];
    }
    throw new Error("No key named " + name + " in " + target);
  },
  has: function has(target, name) {
    return name in target;
  }
};

exports.default = keyHandler;
},{}],32:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = makeEnum;

var _keyHandler = require("./keyHandler.js");

var _keyHandler2 = _interopRequireDefault(_keyHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EnumDefinition = function () {
  function EnumDefinition(description) {
    var _this = this;

    _classCallCheck(this, EnumDefinition);

    var values = {};
    Object.keys(description).forEach(function (name) {
      var value = description[name];
      if (value === null) value = name;
      if (values[value] !== undefined) throw new Error("Duplicate key " + value);
      if (_this.hasOwnProperty(name)) throw new Error("Illegal enum name " + name);
      values[value] = true;
      _this[name] = value;
    });
  }

  _createClass(EnumDefinition, [{
    key: "toString",
    value: function toString(value) {
      var _this2 = this;

      var result = Object.keys(this).find(function (k) {
        return _this2[k] === value;
      });
      if (result === undefined) throw new Error("Value is not a valid part of this enum");
      return result;
    }
  }]);

  return EnumDefinition;
}();

function makeEnum(description) {
  var enumInstance = new Proxy(new EnumDefinition(description), _keyHandler2.default);
  return enumInstance;
}
},{"./keyHandler.js":31}],33:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = evaluateExpression;

var _Token = require("./Token.js");

var _Token2 = _interopRequireDefault(_Token);

var _MathParser = require("../constants/MathParser.js");

var _Units = require("../constants/Units.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var PATTERN_SPACES = "(?:\\s+)";
var PATTERN_NUMBER = "((?:\\d*[.]?\\d+)(?:e[+\\-]?\\d+)";
// Create the operator pattern programatically from the list of accepted tokens.
var PATTERN_OPERATOR = Object.keys(_MathParser.TokenMap).reduce(function (result, item, index, array) {
  result += "(?:";

  // Escape regex operator characters.
  if (["(", ")", "\\", "^", "|", "*", "+", "?", ".", "$"].indexOf(item) > -1) result += "\\";
  result += item + ")";

  // Avoid an Unterminated Group error.
  if (item === "(") result += ")";

  // Add an 'or' if it is not the last item.
  if (index !== array.length - 1) result += "|";

  // e.g. (?:\\+)
  return result;
}, "");
var PATTERN_NUMBER_OR_OPERATOR = PATTERN_NUMBER + "?|" + PATTERN_OPERATOR;
var PATTERN_NUMBER_OR_OPERATOR_OR_SPACES = PATTERN_NUMBER + "?|" + PATTERN_OPERATOR + "|" + PATTERN_SPACES;
var PATTERN_FEET_AND_INCHES = "(?:([0-9]+)(?:'|ft))(?=(?:(?: +?)?(?:[0-9]+)(?:\"|in)?))";
var PATTERN_DEGREE_SYMBOL = "\xB0";
var PATTERN_STARTS_WITH_OPERATOR_FOR_CURRENT_VALUE = "^(\\+|\\+ |\\*|- |\\/|\\^)";

// Uses Edsger Dijkstra's "shunting-yard" algorithm to parse math expression.
// https://en.wikipedia.org/wiki/Shunting-yard_algorithm
// Expects expression to be formatted with infix notation.
// Converts into postfix notation and evaluates in place.
function evaluateExpression(expression, currentValue) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$useDegrees = _ref.useDegrees,
      useDegrees = _ref$useDegrees === undefined ? true : _ref$useDegrees,
      _ref$unit = _ref.unit,
      unit = _ref$unit === undefined ? _Units.Unit.CENTIMETERS : _ref$unit,
      _ref$resolution = _ref.resolution,
      resolution = _ref$resolution === undefined ? 1 : _ref$resolution,
      _ref$delimiters = _ref.delimiters,
      delimiters = _ref$delimiters === undefined ? { decimal: ".", group: "," } : _ref$delimiters;

  var patternSpaces = new RegExp(PATTERN_SPACES, "g");
  var patternNumberOrOperator = new RegExp(PATTERN_NUMBER_OR_OPERATOR, "g");
  var patternNumberOrOperatorOrSpaces = new RegExp(PATTERN_NUMBER_OR_OPERATOR_OR_SPACES, "g");
  var patternFeetAndInches = new RegExp(PATTERN_FEET_AND_INCHES, "g");
  var patternDegreeSymbol = new RegExp(PATTERN_DEGREE_SYMBOL, "g");
  var patternStartsWithOperatorForCurrentValue = new RegExp(PATTERN_STARTS_WITH_OPERATOR_FOR_CURRENT_VALUE, "g");

  var indexOfCurrentValueOperator = expression.search(patternStartsWithOperatorForCurrentValue);

  if (indexOfCurrentValueOperator > -1 && currentValue) {
    expression = "" + currentValue + expression;
  }

  var groupReplacement = /(\b\d{1,3}),(?=\d{3}(\D|$))/g;
  // strange whitespace character for french thousands separator
  if (delimiters.group === " " || delimiters.group === " ") {
    groupReplacement = /(\b\d{1,3})\s(?=\d{3}(\D|$))/g;
  } else if (delimiters.group === ".") {
    groupReplacement = /(\b\d{1,3})\.(?=\d{3}(\D|$))/g;
  }

  var decimalReplacement = /(\b\d+)\.(?=\d+(\D|$))/g;
  if (delimiters.decimal === ",") {
    decimalReplacement = /(\b\d+),(?=\d+(\D|$))/g;
  } else if (delimiters.decimal === " ") {
    decimalReplacement = /(\b\d+)\s(?=\d+(\D|$))/g;
  }

  var input = expression.replace(groupReplacement, "$1");

  input = input.replace(decimalReplacement, "$1.");

  // Compress whitespace.
  input = input.replace(patternSpaces, " ");

  if (input.length === 0) {
    throw new _MathParser.ParsingError(_MathParser.ParsingErrorType.EMPTY, input, 0, 0);
  }

  // Convert to lower case
  input = input.toLowerCase();

  // Change 90° to 90deg
  input = input.replace(patternDegreeSymbol, "deg");

  // Handle 5'6", 5'6, 5ft6in, 5ft6
  // Find all matches of ' or ft preceeded by a number and followed by a number
  var footMatches = void 0;
  var footIndices = [];
  while ((footMatches = patternFeetAndInches.exec(input)) !== null) {
    footIndices.push(patternFeetAndInches.lastIndex);
  }
  // Insert '+' after every foot index, increasing the index based on the number of previous insertions.
  for (var i = 0; i < footIndices.length; i++) {
    var footIndex = footIndices[i];
    input = input.slice(0, footIndex + i) + "+" + input.slice(footIndex + i);
  }

  var lastIndex = -1;
  // Verify input by matching against valid operators, numbers, or spaces.
  var matches = void 0;
  while ((matches = patternNumberOrOperatorOrSpaces.exec(input)) !== null) {
    if (lastIndex === patternNumberOrOperatorOrSpaces.lastIndex) {
      var position = patternNumberOrOperatorOrSpaces.lastIndex;
      throw new _MathParser.ParsingError(_MathParser.ParsingErrorType.SYNTAX_ERROR, input, position, 0);
    }
    lastIndex = patternNumberOrOperatorOrSpaces.lastIndex;
  }

  if (lastIndex < 0) {
    throw new _MathParser.ParsingError(_MathParser.ParsingErrorType.SYNTAX_ERROR, input, 0, 0);
  }

  if (lastIndex !== input.length) {
    throw new _MathParser.ParsingError(_MathParser.ParsingErrorType.SYNTAX_ERROR, input, lastIndex, 0);
  }

  // Info about prior token to disambiguate unary vs binary operators.
  // If the token to the left is the edge of a statement (i.e. left paren, operator, or no token).
  var leftIsEdge = true;

  // Output value stack.
  var output = [];

  // Operator stack.
  var stack = [];
  var token = void 0;
  // Algorithm starts.
  while ((matches = patternNumberOrOperator.exec(input)) !== null) {
    token = new _Token2.default(matches[0], leftIsEdge);
    token.position = matches.index;

    var leftIsEdgeOperatorExceptions = [_MathParser.OperatorId.PAREN_R, _MathParser.OperatorId.PERCENTAGE, _MathParser.OperatorId.TIMES].concat(_toConsumableArray(Object.keys(_Units.Unit).map(function (k) {
      return _Units.Unit[k];
    })));

    leftIsEdge = token.type === _MathParser.TokenType.NONE || token.type === _MathParser.TokenType.OPERATOR && leftIsEdgeOperatorExceptions.indexOf(token.op.type) === -1;

    switch (token.type) {
      case _MathParser.TokenType.NUMBER:
        {
          output.push(token.value);
          break;
        }

      case _MathParser.TokenType.OPERATOR:
        {
          switch (token.op.type) {
            default:
              while (stack.length !== 0) {
                var t = stack[stack.length - 1];
                // assert(token.op.associativity !== Associativity.NONE);
                if (token.op.associativity === _MathParser.Associativity.LEFT && token.op.precedence <= t.op.precedence || token.op.associativity === _MathParser.Associativity.RIGHT && token.op.precedence < t.op.precedence) {
                  try {
                    stack[stack.length - 1].op.eval(output, { useDegrees: useDegrees, unit: unit, resolution: resolution }, currentValue);
                  } catch (err) {
                    err.input = input;
                    err.errorPosition = token.position;
                    err.errorLength = token.string.length;
                    throw err;
                  }
                  stack.pop();
                } else {
                  break;
                }
              }

              stack.push(token);
              break;

            case _MathParser.OperatorId.PAREN_L:
              stack.push(token);break;

            case _MathParser.OperatorId.PAREN_R:
              if (stack.length === 0) {
                throw new _MathParser.ParsingError(_MathParser.ParsingErrorType.MISMATCHED_PARENS, input, token.position, token.string.length);
              }
              while (stack.length !== 0) {
                if (stack[stack.length - 1].op.type === _MathParser.OperatorId.PAREN_L) {
                  stack.pop();
                  break;
                } else {
                  try {
                    stack[stack.length - 1].op.eval(output, { useDegrees: useDegrees, unit: unit, resolution: resolution }, currentValue);
                  } catch (err) {
                    err.input = input;
                    err.errorPosition = token.position;
                    err.errorLength = token.string.length;
                    throw err;
                  }
                  stack.pop();
                }

                if (stack.length === 0) {
                  throw new _MathParser.ParsingError(_MathParser.ParsingErrorType.MISMATCHED_PARENS, input, token.position, token.string.length);
                }
              }
              break;
          }
          break;
        }

      case _MathParser.TokenType.NONE:
        // Should not get here since tokens have already been verified via regular expression.
        throw new _MathParser.EvaluationError(_MathParser.EvaluationErrorType.UNEXPECTED_TOKEN, input, token.position, token.string.length);
    }
  }
  while (stack.length !== 0) {
    var _token = stack[stack.length - 1];
    if (_token.op.type === _MathParser.OperatorId.PAREN_L || _token.op.type === _MathParser.OperatorId.PAREN_L) {
      throw new _MathParser.ParsingError(_MathParser.ParsingErrorType.MISMATCHED_PARENS, input, _token.string.length);
    }
    try {
      _token.op.eval(output, { useDegrees: useDegrees, unit: unit, resolution: resolution }, currentValue);
    } catch (err) {
      err.input = input;
      err.errorPosition = _token.position;
      err.errorLength = _token.string.length;
      throw err;
    }
    stack.pop();
  }

  if (output.length === 0) {
    var _position = token ? token.position : 0;
    var length = token ? token.string.length : expression.length;
    throw new _MathParser.ParsingError(_MathParser.ParsingErrorType.EMPTY, input, _position, length);
  } else if (output.length === 1) {
    return output[output.length - 1];
  } else {
    var _position2 = token ? token.position : -1;
    var _length = token ? token.string.length : -1;
    throw new _MathParser.ParsingError(_MathParser.ParsingErrorType.SYNTAX_ERROR, input, _position2, _length);
  }
}
},{"../constants/MathParser.js":28,"../constants/Units.js":29,"./Token.js":35}],34:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MathParser = require("../constants/MathParser.js");

var _Units = require("../constants/Units.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function degToRad(deg) {
  return deg * Math.PI / 180;
}

var Unit = function Unit(unitId, system, measure, abbreviation, shorthand) {
  _classCallCheck(this, Unit);

  if (_Units.UnitMap.hasOwnProperty(unitId)) {
    this.unitId = unitId;
    var unitSettings = _Units.UnitMap[unitId];
    this.measure = unitSettings.measure;
    this.system = unitSettings.system;
    this.abbreviation = unitSettings.abbreviation;
    this.shorthand = unitSettings.shorthand;
  } else {
    this.unitId = unitId;
    this.measure = measure;
    this.system = system;
    this.abbreviation = abbreviation;
    this.shorthand = shorthand;
    this.name = name;
  }
  this.anchorConversionFactor = _Units.MeasureMap[this.measure][this.system][this.unitId];
};

var Operator = function () {
  function Operator() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _MathParser.OperatorId.NONE;
    var associativity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _MathParser.Associativity.NONE;
    var precedence = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
    var degree = arguments[3];
    var name = arguments[4];

    _classCallCheck(this, Operator);

    if (_MathParser.OperatorMap.hasOwnProperty(type)) {
      var operatorSettings = _MathParser.OperatorMap[type];
      this.associativity = operatorSettings.associativity;
      this.type = type;
      this.precedence = operatorSettings.precedence;
      this.degree = operatorSettings.degree;
      this.name = operatorSettings.name;
    } else {
      this.associativity = associativity;
      this.type = type;
      this.precedence = precedence;
      this.degree = degree;
      this.name = name;
    }
  }

  _createClass(Operator, [{
    key: "eval",
    value: function _eval() {
      var values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var config = arguments[1];
      var currentValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : NaN;

      // Check if we have enough arguments for the operator type.
      if (values.length < this.degree) {
        throw new _MathParser.EvaluationError(_MathParser.EvaluationErrorType.EXPECTED_MORE_ARGUMENTS);
      }

      switch (this.type) {
        case _MathParser.OperatorId.NONE:
        case _MathParser.OperatorId.PAREN_L:
        case _MathParser.OperatorId.PAREN_R:
          throw new _MathParser.EvaluationError(_MathParser.EvaluationErrorType.UNEXPECTED_TOKEN);

        // Handle constants.
        case _MathParser.OperatorId.E:
          values.push(Math.E);
          break;
        case _MathParser.OperatorId.PI:
          values.push(Math.PI);
          break;
        case _MathParser.OperatorId.TAU:
          values.push(2 * Math.PI);
          break;

        case _MathParser.OperatorId.INCHES:
        case _MathParser.OperatorId.FEET:
        case _MathParser.OperatorId.YARDS:
        case _MathParser.OperatorId.MILES:
        case _MathParser.OperatorId.PICOMETERS:
        case _MathParser.OperatorId.NANOMETERS:
        case _MathParser.OperatorId.MICROMETERS:
        case _MathParser.OperatorId.MILLIMETERS:
        case _MathParser.OperatorId.CENTIMETERS:
        case _MathParser.OperatorId.DECIMETERS:
        case _MathParser.OperatorId.METERS:
        case _MathParser.OperatorId.DEKAMETERS:
        case _MathParser.OperatorId.HECTOMETERS:
        case _MathParser.OperatorId.KILOMETERS:
        case _MathParser.OperatorId.PIXELS:
        case _MathParser.OperatorId.DEGREES:
        case _MathParser.OperatorId.RADIANS:
        case _MathParser.OperatorId.COSECANT:
        case _MathParser.OperatorId.COSINE:
        case _MathParser.OperatorId.COTANGENT:
        case _MathParser.OperatorId.PERCENTAGE:
        case _MathParser.OperatorId.SECANT:
        case _MathParser.OperatorId.SINE:
        case _MathParser.OperatorId.TANGENT:
        case _MathParser.OperatorId.TIMES:
        case _MathParser.OperatorId.UNARY_MINUS:
        case _MathParser.OperatorId.UNARY_PLUS:
          {
            // Handle unary operators.
            var value = values[values.length - 1];
            values.pop();
            switch (this.type) {
              default:
                throw new _MathParser.EvaluationError(_MathParser.EvaluationErrorType.UNEXPECTED_TOKEN);

              case _MathParser.OperatorId.INCHES:
              case _MathParser.OperatorId.FEET:
              case _MathParser.OperatorId.YARDS:
              case _MathParser.OperatorId.MILES:
              case _MathParser.OperatorId.PICOMETERS:
              case _MathParser.OperatorId.NANOMETERS:
              case _MathParser.OperatorId.MICROMETERS:
              case _MathParser.OperatorId.MILLIMETERS:
              case _MathParser.OperatorId.CENTIMETERS:
              case _MathParser.OperatorId.DECIMETERS:
              case _MathParser.OperatorId.METERS:
              case _MathParser.OperatorId.DEKAMETERS:
              case _MathParser.OperatorId.HECTOMETERS:
              case _MathParser.OperatorId.KILOMETERS:
              case _MathParser.OperatorId.PIXELS:
              case _MathParser.OperatorId.DEGREES:
              case _MathParser.OperatorId.RADIANS:
                value = this.convert(value, new Unit(_Units.Unit[this.type]), new Unit(config.unit), config.resolution);
                break;

              case _MathParser.OperatorId.COSECANT:
              case _MathParser.OperatorId.COSINE:
              case _MathParser.OperatorId.COTANGENT:
              case _MathParser.OperatorId.SECANT:
              case _MathParser.OperatorId.SINE:
              case _MathParser.OperatorId.TANGENT:
                {
                  var trigFunction = _MathParser.UnaryOperatorFunctionMap[this.type];
                  value = config.useDegrees ? trigFunction(degToRad(value)) : trigFunction(value);
                  break;
                }

              case _MathParser.OperatorId.PERCENTAGE:
                if (Number.isNaN(currentValue)) {
                  throw new _MathParser.EvaluationError(_MathParser.EvaluationErrorType.EXPECTED_CURRENT_VALUE);
                }
                value = value * currentValue / 100.0;
                break;

              case _MathParser.OperatorId.TIMES:
                if (Number.isNaN(currentValue)) {
                  throw new _MathParser.EvaluationError(_MathParser.EvaluationErrorType.EXPECTED_CURRENT_VALUE);
                }
                value = value * currentValue;
                break;

              case _MathParser.OperatorId.UNARY_MINUS:
                value *= -1.0;
                break;
              case _MathParser.OperatorId.UNARY_PLUS:
                // no-op
                break;
            }
            values.push(value);
            break;
          }

        case _MathParser.OperatorId.ADD:
        case _MathParser.OperatorId.DIVIDE:
        case _MathParser.OperatorId.EXPONENT:
        case _MathParser.OperatorId.MULTIPLY:
        case _MathParser.OperatorId.SUBTRACT:
          {
            // Handle binary operators.
            var b = values.pop();

            var a = values.pop();
            switch (this.type) {
              default:
                throw new _MathParser.EvaluationError(_MathParser.EvaluationErrorType.UNEXPECTED_TOKEN);
              case _MathParser.OperatorId.ADD:
                values.push(a + b);
                break;
              case _MathParser.OperatorId.SUBTRACT:
                values.push(a - b);
                break;
              case _MathParser.OperatorId.DIVIDE:
                if (b === 0.0) {
                  throw new _MathParser.EvaluationError(_MathParser.EvaluationErrorType.DIVIDE_BY_ZERO);
                }
                values.push(a / b);
                break;
              case _MathParser.OperatorId.MULTIPLY:
                values.push(a * b);
                break;
              case _MathParser.OperatorId.EXPONENT:
                {
                  var d = void 0;
                  if (a < 0 && b % 1 > 0) {
                    throw new _MathParser.EvaluationError(_MathParser.EvaluationErrorType.IMAGINARY_NUMBER);
                  } else {
                    values.push(Math.pow(a, b));
                  }
                  break;
                }
            }
          }
      }
    }
  }, {
    key: "round",
    value: function round(v, decimalPlaces) {
      if (decimalPlaces === undefined) {
        decimalPlaces = 0;
      }

      var multiplicator = Math.pow(10, decimalPlaces);
      v = parseFloat((v * multiplicator).toFixed(11));
      return Math.round(v) / multiplicator;
    }
  }, {
    key: "convert",
    value: function convert(value, from, to) {
      var resolution = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      if (resolution < 1) {
        throw new _MathParser.ConversionError(_MathParser.ConversionErrorType.RESOLUTION_LESS_THAN_ONE);
      }
      // If the base unit and desitination unit are the same, just return the value.
      if (from === to || from.unitId === to.unitId) {
        return value;
      }

      if (to.unitId === "PIXELS") {
        // resolution assumed to be in pixels per inch
        if (from.unitId === "INCHES") {
          var v = this.round(value * resolution, 4);
          if (v < 1) {
            throw new _MathParser.ConversionError(_MathParser.ConversionErrorType.PIXELS_LESS_THAN_ONE);
          }
          return v;
        } else if (from.unitId === "CENTIMETERS") {
          var _v = this.round(value / 2.54 * resolution, 4);
          if (_v < 1) {
            throw new _MathParser.ConversionError(_MathParser.ConversionErrorType.PIXELS_LESS_THAN_ONE);
          }
          return _v;
        } else {
          throw new _MathParser.ConversionError(_MathParser.ConversionErrorType.EXPECTED_PIXELS_OR_INCHES_OR_CENTIMETERS);
        }
      }

      if (from.unitId === "PIXELS" && (to.unitId === "INCHES" || to.unitId === "CENTIMETERS")) {
        if (value < 1) {
          throw new _MathParser.ConversionError(_MathParser.ConversionErrorType.PIXELS_LESS_THAN_ONE);
        }
        // resolution assumed to be in pixels per inch
        if (to.unitId === "INCHES") {
          return this.round(value / resolution, 4);
        } else {
          return this.round(value * 2.54 / resolution, 4);
        }
      }

      if (from.measure !== to.measure) {
        throw new _MathParser.ConversionError(_MathParser.ConversionErrorType.INCOMPATIBLE_MEASURES);
      }

      // Convert to system anchor unit
      value = value * from.anchorConversionFactor;

      // Convert from one system to another by multiplying by the conversion factor.
      if (from.system !== to.system) {
        value *= _Units.MeasureMap[from.measure].anchors[from.system].conversion;
      }

      return value / to.anchorConversionFactor;
    }
  }]);

  return Operator;
}();

exports.default = Operator;
},{"../constants/MathParser.js":28,"../constants/Units.js":29}],35:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MathParser = require("../constants/MathParser.js");

var _Operator = require("../models/Operator.js");

var _Operator2 = _interopRequireDefault(_Operator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Token = function () {
  function Token() {
    var string = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var leftIsEdge = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, Token);

    this.string = string;
    this.id = this.stringToId(string);
    this.type = this.id === _MathParser.TokenId.NONE ? _MathParser.TokenType.NUMBER : _MathParser.TokenType.OPERATOR;
    this.op = this.idToOperator(this.id, leftIsEdge);
    this.position = -1;
    this.value = NaN;
    if (this.type === _MathParser.TokenType.NUMBER) this.value = +this.string;
  }

  _createClass(Token, [{
    key: "stringToId",
    value: function stringToId(string) {
      if (_MathParser.TokenMap.hasOwnProperty(string)) {
        return _MathParser.TokenMap[string];
      }
      return _MathParser.TokenId.NONE;
    }

    /* eslint no-multi-spaces: 0 */

  }, {
    key: "idToOperator",
    value: function idToOperator(id) {
      var leftIsEdge = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var type = void 0;
      if (id === _MathParser.TokenId.MINUS && leftIsEdge) {
        type = _MathParser.OperatorId.UNARY_MINUS;
      } else if (id === _MathParser.TokenId.PLUS && leftIsEdge) {
        type = _MathParser.OperatorId.UNARY_PLUS;
      } else {
        type = _MathParser.TokenIdToOperatorMap[id];
      }
      return new _Operator2.default(type);
    }
  }]);

  return Token;
}();

exports.default = Token;
},{"../constants/MathParser.js":28,"../models/Operator.js":34}],36:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":37}],37:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],38:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parse_1 = __importDefault(require("./parse"));
const index_1 = __importDefault(require("./index"));
window.NovaSheets = index_1.default;
const hashCode = (str, length = 8) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++)
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
    return Math.abs(hash).toString(16).substring(0, length).padStart(length, '0');
};
window.parseNovaSheets = parseNovaSheets;
function parseNovaSheets(rawInput = '', novasheets) {
    if (rawInput)
        return parse_1.default(rawInput, novasheets);
    prepare(rawInput).then((data) => data.stylesheetContents.forEach((content, i) => {
        const cssOutput = parse_1.default(content, novasheets);
        if (document.querySelectorAll(`[data-hash="${hashCode(cssOutput)}"]`).length)
            return; // prevent duplicate outputs
        let styleElem = document.createElement('style');
        styleElem.innerHTML = '\n' + cssOutput.trim() + '\n';
        styleElem.dataset.hash = hashCode(cssOutput);
        styleElem.dataset.source = data.sources[i];
        (document.head || document.body).appendChild(styleElem);
    }));
}
window.prepare = prepare;
async function prepare(rawInput = '') {
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
    for (let i in fileNames.full) {
        await fetch(fileNames.full[i])
            .then(data => data.text()).then(text => { stylesheetContents.push(text), sources.push(fileNames.rel[i]); })
            .catch(err => console.warn(`<NovaSheets> File '${fileNames.rel[i]}' is inacessible.`, err));
    }
    for (const contents of inlineSheets) {
        const content = (contents instanceof HTMLInputElement && contents.value) || contents.innerText;
        stylesheetContents.push(content);
        sources.push('inline');
    }
    return { stylesheetContents, sources };
}

},{"./index":41,"./parse":43}],39:[function(require,module,exports){
(function (process){(function (){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const isNode = typeof process !== 'undefined' && ((_a = process === null || process === void 0 ? void 0 : process.versions) === null || _a === void 0 ? void 0 : _a.node);
const glob = isNode && require('glob');
const parse_1 = __importDefault(require("./parse"));
async function compileNovaSheets(source, outPath, novasheets) {
    const compile = async (inputFiles) => {
        for (const inputPath of inputFiles) {
            const input = /\.\w+/.test(inputPath) ? inputPath : inputPath + '.nvss';
            const contents = await fs_1.promises.readFile(input, { encoding: 'utf8' }).catch(err => {
                throw `ReadError: Input file '${input}' not found.\n` + err.message;
            });
            let output = outPath.replace(/[/\\]/g, path_1.default.sep);
            const folder = output.includes(path_1.default.sep) ? output.replace(/[/\\][^/\\]+$/, '') : '';
            if (folder) {
                await fs_1.promises.mkdir(folder, { recursive: true }).catch(err => {
                    if (err)
                        throw `MkDirError: Could not create directory '${folder}'.\n` + err.message;
                });
            }
            const filename = input.replace(/.+[/\\]([^/\\]+)$/, '$1'); // 'foo/bar.ext' -> 'bar.ext'
            if (!output) {
                if (hasGlobs)
                    output = input.replace(/[/\\][^/\\]+$/, path_1.default.sep); // 'foo.ext' -> 'foo/'
                else
                    output = input.replace(/\.\w+$/, '.css'); // 'foo.ext' -> 'foo.css'
            }
            if (output.endsWith(path_1.default.sep))
                output += filename; // 'foo.nvss bar/' -> 'bar/foo.nvss'
            else if (hasGlobs)
                output += path_1.default.sep + filename; // '*.nvss bar' -> 'bar/$file.nvss'
            else if (!output.match(/\.\w+$/))
                output += '.css'; // 'foo.nvss bar' -> 'bar.css'
            output = output.replace(/\.\w+$/, '.css'); // force .css extension
            await fs_1.promises.writeFile(output, parse_1.default(contents, novasheets)).catch(err => {
                if (err)
                    throw `WriteError: Cannot write to file '${output}'.\n` + err.message;
                console.log(`<NovaSheets> Wrote file '${input}' to '${output}'`);
            });
        }
    };
    const hasGlobs = glob === null || glob === void 0 ? void 0 : glob.hasMagic(source);
    if (hasGlobs) {
        glob === null || glob === void 0 ? void 0 : glob(source, {}, async (err, files) => {
            if (err)
                throw err;
            await compile(files);
        });
    }
    else {
        await compile([source]);
    }
}
module.exports = compileNovaSheets;

}).call(this)}).call(this,require('_process'))
},{"./parse":43,"_process":37,"fs":2,"glob":undefined,"path":36}],40:[function(require,module,exports){
"use strict";
// Default built-in functions
function addBuiltInFunctions({ constants }) {
    const novasheets = new (require('./index'))(); // ???
    // const novasheets: NovaSheets = new NovaSheets();
    const escapeRegex = (str) => str.replace(/[.*+?^/${}()|[\]\\]/g, '\\$&');
    const strim = (str) => str.toString().replace(/^\s*(.+?)\s*$/, '$1').replace(/\s+/g, ' ');
    const r = String.raw;
    /// Loop functions
    novasheets.addFunction('@each', (_, a = '', b = '', c = '', ...rest) => {
        let d = rest.join('|');
        const [items, splitter, joiner, content] = d ? [a, b, c, d] : (c ? [a, b, b, c] : [a, ',', ',', b]);
        const arr = strim(items).split(splitter === ' ' ? splitter : splitter.trim());
        let output = [];
        for (let i in arr) {
            let parsed = strim(content)
                .replace(/\$i/gi, (+i + 1).toString())
                .replace(/\$v\[([0-9]+)([-+*/][0-9]+)?\]/g, (_, a, b) => arr[+a - 1 + (b || 0)])
                .replace(RegExp(r `${escapeRegex(joiner)}\s*undefined`, 'g'), '')
                .replace(/\$v/gi, arr[i]);
            output.push(parsed);
        }
        return output.join(joiner === ' ' ? joiner : joiner.trim());
    }, { trim: false });
    novasheets.addFunction('@repeat', (_, a, ...b) => {
        const delim = b[1] ? b[0] : '';
        const content = b.slice(b[1] ? 1 : 0).join('|');
        let output = '';
        for (let i = 0; i < +a; i++) {
            output += (i > 0 ? delim : '') + content.replace(/\$i/gi, (+i + 1).toString());
        }
        return output;
    }, { trim: false });
    /// Math functions
    const number = r `(?:[0-9]*\.?[0-9]+)`;
    const basedNumber = r `(?:0x[0-9a-f]*\.?[0-9a-f]+|0b[01]*\.?[01]+|0o[0-7]*\.?[0-7]+|${number})`;
    const toNum = (val) => constants.KEEP_NAN ? +val : (Number.isNaN(val) ? 0 : parseFloat(val + ''));
    const testNaN = (arg, def) => {
        const invalid = arg === Infinity || Number.isNaN(arg);
        if (invalid && constants.KEEP_NAN)
            return 'NaN';
        else if (invalid && !constants.KEEP_NAN)
            return def || 0;
        else if (Math.abs(arg) <= 1e-7)
            return 0;
        else
            return arg;
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
    }, { trim: false });
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
                parts[i] = '0';
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
    /// Logic functions
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
                .replace(/(?!=)(!?)=(==)?(?!=)/g, '$1$2=='); // normalise equality signs
        }
        if (/(<|<=|>|>=|==|!=|&|!|\|)/.test(arg))
            arg = eval('!!' + arg);
        if (['false', 'undefined', 'null', 'NaN', ''].includes(arg))
            arg = 'false';
        return arg;
    };
    novasheets.addFunction('@bitwise', (_, a) => {
        let arg = a;
        for (let i = 0; i < constants.MAX_ARGUMENTS; i++) {
            arg = arg
                .replace(RegExp(r `(?:~|!|not)\s*([+-]?${bracketedNumber})`), (_, a) => (~toNum(a)).toString()) // bitwise not
                .replace(logicRegex('or|\\|'), (_, a, b) => (toNum(a) | toNum(b)).toString()) // bitwise or
                .replace(logicRegex('nor'), (_, a, b) => (~(toNum(a) | toNum(b))).toString()) // bitwise nor
                .replace(logicRegex('and|&'), (_, a, b) => (toNum(a) & toNum(b)).toString()) // bitwise and
                .replace(logicRegex('nand'), (_, a, b) => (~toNum(a) & toNum(b)).toString()) // bitwise nand
                .replace(logicRegex('xor'), (_, a, b) => (toNum(a) ^ toNum(b)).toString()) // bitwise xor
                .replace(logicRegex('xnor'), (_, a, b) => (~toNum(a) ^ toNum(b)).toString()); // bitwise xnor
        }
        return arg;
    });
    novasheets.addFunction('@boolean', (_, ...a) => parseLogic(a.join('|')));
    novasheets.addFunction('@if', (_, a, b = '', c = '') => parseLogic(a) ? b : c);
    /// CSS functions
    novasheets.addFunction('@breakpoint', (_, px = '0', a = '', b = '', c = '') => {
        if (!px)
            return _;
        const makeQuery = (type, width, [sel, val]) => {
            const brkp = type === 'min' ? `${width}..` : `..${width}`;
            return `${sel} @ ${brkp} { ${val} }`;
        };
        let isBlock = !c;
        let content = isBlock ? [['', a], ['', b]] : [[a, b], [a, c]];
        let ltContent = (isBlock ? a : b).trim() ? makeQuery('max', px, content[0]) : '';
        let gtContent = (isBlock ? b : c).trim() ? makeQuery('min', px, content[1]) : '';
        return ltContent + gtContent;
    }, { trim: false });
    novasheets.addFunction('@prefix', (_, a, b) => {
        return `-webkit-${a}: ${b}; -moz-${a}: ${b}; -ms-${a}: ${b}; -o-${a}: ${b}; ${a}: ${b};`;
    });
    // Return
    return novasheets.getFunctions();
}
module.exports = addBuiltInFunctions;

},{"./index":41}],41:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const novasheets_1 = __importDefault(require("./novasheets"));
module.exports = novasheets_1.default;

},{"./novasheets":42}],42:[function(require,module,exports){
"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _NovaSheets_functions;
const parse_1 = __importDefault(require("./parse"));
const compile_1 = __importDefault(require("./compile"));
class NovaSheets {
    constructor() {
        _NovaSheets_functions.set(this, void 0);
        __classPrivateFieldSet(this, _NovaSheets_functions, [], "f");
    }
    /**
     * Parse raw NovaSheets content.
     * @param rawInput Raw NovaSheets input.
     * @param novasheets An instance of the NovaSheets class, for registering custom functions.
     * @returns {string} Compiled CSS output.
     */
    static parse(rawInput = '', novasheets = new NovaSheets()) {
        return parse_1.default(rawInput, novasheets);
    }
    /**
     * Compile NovaSheets source files.
     * @async
     * @param source Source file or file glob.
     * @param outPath Output file or folder path.
     * @param novasheets An instance of the NovaSheets class, for registering custom functions.
     * @void
     */
    static async compile(source, outPath = '', novasheets = new NovaSheets()) {
        return compile_1.default(source, outPath, novasheets);
    }
    /**
     * Registers a custom NovaSheets function for parsing.
     * @param name The name of the function (e.g., `@pi` for use as `$(@pi)`).
     * @param body The body content of the function. Signature: `(match: string, ...args: string[]): void`.
     * @param options Boolean options given to the function parser: `trim` (default `true`) and `allArgs` (default `false`).
     * @example addFunction('#is-true', (_match, val) => val === 'true') // NovaSheets: $(#is-true|true) // 'true'
     */
    addFunction(name, body, options = {}) {
        __classPrivateFieldGet(this, _NovaSheets_functions, "f").push({ name, body, options });
        return this;
    }
    /**
     * Return a list of all registered custom functions.
     * @returns `[{name, body, options}, ...]`
     */
    getFunctions() {
        return __classPrivateFieldGet(this, _NovaSheets_functions, "f");
    }
}
_NovaSheets_functions = new WeakMap();
module.exports = NovaSheets;

},{"./compile":39,"./parse":43}],43:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const balanced = require('balanced-match');
const { MathParser } = require('math-and-unit-parser');
const index_1 = __importDefault(require("./index"));
const functions_1 = __importDefault(require("./functions"));
const regex_1 = require("./regex");
function parse(content, novasheets = new index_1.default()) {
    var _a, _b;
    const r = String.raw;
    const strim = (str) => str.trim().replace(/\s+/g, ' ');
    const escapeRegex = (str) => str.replace(/[.*+?^/${}()|[\]\\]/g, '\\$&');
    const replaceAll = (src, a, b) => src.replace(new RegExp(escapeRegex(a), 'g'), b);
    const mathOperation = regex_1.regexes.mathChecker().source;
    const parseFunction = (name, func, opts = {}) => {
        if (new RegExp(mathOperation).test(cssOutput))
            return; // only run after math is parsed
        const match = cssOutput.match(RegExp(r `\$\(\s*(?:${name})\b`, 'i'));
        if (!match)
            return;
        const searchString = cssOutput.substr(cssOutput.indexOf(match[0]));
        const segment = balanced('(', ')', searchString).body;
        const fullSegment = '$(' + segment + ')';
        let parts = segment.split('|'); // [name, arg1, arg2, ...]
        if (opts.trim !== false)
            parts = parts.map(part => part.trim());
        cssOutput = replaceAll(cssOutput, fullSegment, func(fullSegment, ...parts.slice(1)).toString());
    };
    const ESC = {
        OPEN_BRACE: Math.random().toString(36).substr(2),
        CLOSE_BRACE: Math.random().toString(36).substr(2),
        SLASH: Math.random().toString(36).substr(2),
    };
    // Prepare stylesheet for parsing //
    let styleContents = content
        .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&') // fix html
        .replace(regex_1.regexes.singleLineComment('gm'), '') // remove single-line comments
        .replace(/@(var|const|endvar)/g, '\n$&') // put each declarator on its own line for parsing
        .replace(/}}/g, '} }') // ensure the second brace is not skipped over
        .replace(regex_1.regexes.implicitParentSelector('g'), ';$1&@'); // implicit parent selector for simple breakpoints
    let commentedContent = [];
    let staticContent = [];
    let cssOutput = styleContents;
    let customVars = {};
    let constants = {
        BUILTIN_FUNCTIONS: true,
        DECIMAL_PLACES: false,
        KEEP_UNPARSED: false,
        MAX_ARGUMENTS: 10,
    };
    // Parse and store comments //
    cssOutput = cssOutput
        // store commented content for substitution when done
        .replace(regex_1.regexes.blockComment('gs'), (_, content) => {
        if (_.startsWith('/*[') && _.endsWith(']*/'))
            return _.replace(/^\/\*\[/, '/*').replace(/\]\*\/$/, '*/'); // parsed comment
        if (_.startsWith('/*/') || _.endsWith('/*/'))
            return _; // static comment; skip
        if (commentedContent.indexOf(content) < 0)
            commentedContent.push(content);
        return '/*COMMENT#' + commentedContent.indexOf(content) + '*/';
    })
        // store static content for substitution when done
        .replace(regex_1.regexes.staticComment('gs'), (_, a) => {
        if (staticContent.indexOf(a) < 0)
            staticContent.push(a);
        return '/*STATIC#' + staticContent.indexOf(a) + '*/';
    });
    // Parse and store variable declarations //
    cssOutput = cssOutput
        .replace(regex_1.regexes.variableDeclaration('gm'), (_, name, inline = '', block = '') => {
        const value = (inline + block).trim().replace('{', ESC.OPEN_BRACE).replace('}', ESC.CLOSE_BRACE);
        customVars[name.trim()] = value;
        return '';
    })
        .replace(/@endvar/g, '')
        .replace(regex_1.regexes.parserOption('g'), (_, name, val) => {
        var _a;
        const options = {
            'BUILTIN_FUNCTIONS': () => constants.BUILTIN_FUNCTIONS = val !== '0' && val !== 'false',
            'KEEP_UNPARSED': () => constants.KEEP_UNPARSED = val !== '0' && val !== 'false',
            'DECIMAL_PLACES': () => constants.DECIMAL_PLACES = val !== 'false' && +val,
            'MAX_ARGUMENTS': () => constants.MAX_ARGUMENTS = +val,
        };
        (_a = options[name.toUpperCase()]) === null || _a === void 0 ? void 0 : _a.call(options);
        return '';
    });
    // Compile NovaSheets styles //
    let lastCssOutput = '';
    do {
        if (lastCssOutput === cssOutput)
            break;
        lastCssOutput = cssOutput;
        // Parse math //
        cssOutput = cssOutput
            // convert exponential notation
            .replace(regex_1.regexes.exponential('gi'), (_, a, b) => (+a * 10 ** +b).toString())
            // fix slash edge cases
            .replace(regex_1.regexes.slashEdgeCaseFunction('g'), '$1' + ESC.SLASH + '$2')
            .replace(regex_1.regexes.slashEdgeCaseAttribute('g'), '$1' + ESC.SLASH + '$2')
            // compile math
            .replace(new RegExp(mathOperation, 'g'), _ => {
            if (regex_1.regexes.edgeCaseDelimited('g').test(_))
                return _; // delimited values, not subtraction
            let unit = '';
            const content = _
                .replace(/\*\*/g, '^')
                .replace(regex_1.regexes.numberWithUnit('g'), (_, num, u) => {
                const multipliers = { 'mm': 0.001, 'ms': 0.001, 'cm': 0.01, 'in': 0.0254, 'ft': 0.3048 };
                const value = u in multipliers ? +num * multipliers[u] : +num;
                unit = u === 'ms' ? 's' : (u in multipliers ? 'm' : u);
                return value.toString();
            });
            try {
                return MathParser(content) + unit;
            }
            catch {
                return _;
            }
        });
        // Parse variable contents //
        for (const name in customVars) {
            parseFunction(name, (_, ...paramArgs) => {
                let content = customVars[name];
                for (const i in paramArgs) {
                    if (!paramArgs[i])
                        continue;
                    const parts = paramArgs[i].split('=');
                    const param = parts[1] ? strim(parts[0]) : (+i + 1).toString();
                    const arg = parts[1] ? strim(parts.slice(1).join('=')) : strim(parts[0]);
                    content = content.replace(new RegExp(r `\$\[${escapeRegex(param)}[^\]]*\]`, 'g'), arg);
                }
                content = content.replace(regex_1.regexes.defaultArguments('g'), '$1');
                return content;
            });
        }
        // Parse built-in functions //
        let allFunctions = [];
        if (constants.BUILTIN_FUNCTIONS)
            allFunctions.push(...functions_1.default({ constants }));
        allFunctions.push(...novasheets.getFunctions());
        for (const obj of allFunctions) {
            parseFunction(obj.name, obj.body, obj.options);
        }
        // Parse nesting //
        let compiledOutput = '';
        const check = (s) => balanced('{', '}', s);
        const unnest = (css, parent) => {
            var _a, _b;
            // early return if block has no parent (is an object literal)
            if (!parent && /^\s*{/.test(css)) {
                compiledOutput += css;
                return;
            }
            // parse data
            const data = check(css);
            // check if block has no children
            if (!data) {
                // write styles if there are any
                let styleContent = css.trim();
                if (styleContent)
                    compiledOutput += parent ? `{${styleContent}}` : styleContent;
                return;
            }
            // move any trailing styles to front of block
            let endStylesMatch = (_b = (_a = data.body.match(/(?<=})[^{}]+?$/g)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '';
            if (endStylesMatch) {
                let endStyles = endStylesMatch;
                if (endStyles.trim() && !/}\s*$/.test(data.body))
                    endStyles += ';';
                data.body = data.body.replace(endStylesMatch, '').replace(/[^;]+{/, endStyles + '$&');
            }
            // check if block has both styles and children
            let styles = data.pre.split(';');
            if (styles.length) {
                // remove styles from child selector content
                data.pre = styles.pop();
                // add selectors to parent selector if applicable
                if (styles.length) {
                    let styleContent = styles.join(';') + ';';
                    compiledOutput += parent ? `${parent} {${styleContent}}` : styleContent;
                }
            }
            // create selector
            let fullSelector = '';
            if (data.pre.includes('@media'))
                fullSelector = data.pre + parent.replace(regex_1.regexes.mediaQuery('g'), '');
            else if (data.pre.includes('&'))
                fullSelector = data.pre.replace(/&/g, parent);
            else
                fullSelector = parent + ' ' + data.pre;
            fullSelector = strim(fullSelector).replace(regex_1.regexes.blockComment('g'), '');
            // write selector if the block has styles
            if (!/}\s*$/.test(data.body))
                compiledOutput += fullSelector;
            // add empty styles if selector has no styles
            if (!data.body)
                compiledOutput += '{}';
            // parse children
            unnest(data.body, fullSelector);
            // continue to next block
            unnest(data.post, strim(parent));
        };
        unnest(cssOutput, '');
        cssOutput = compiledOutput
            .replace(regex_1.regexes.mediaQueryBlock('gs'), '$1 { $2 }')
            .replace(regex_1.regexes.emptyMediaQueryBlock('g'), '')
            .replace(regex_1.regexes.nonEmptyMediaQueryBlock('g'), '$1 { $2 {$3} }');
        // Parse CSS block substitutions //
        // save CSS declarations as variables
        cssOutput = replaceAll(cssOutput, ESC.OPEN_BRACE, '{');
        cssOutput = replaceAll(cssOutput, ESC.CLOSE_BRACE, '}');
        const cssBlocks = {};
        compiledOutput.replace(/([^{}]+)({.+?})/gms, (_, selector, css) => {
            if (selector.includes('$(') || selector.startsWith('@'))
                return '';
            selector = selector.replace(/\$(<.+?>){1,2}/g, '');
            cssBlocks[strim(selector)] = css;
            return '';
        });
        // substitute blocks
        for (const name in cssBlocks) {
            cssOutput = cssOutput.replace(new RegExp(r `\$<\s*${escapeRegex(name)}\s*>`, 'g'), (_a = cssBlocks[name]) !== null && _a !== void 0 ? _a : '{}');
        }
        // substitute leftovers
        cssOutput = cssOutput.replace(/\$<.+?>/g, '{}');
        // parse object notation
        cssOutput = cssOutput.replace(regex_1.regexes.objectNotation('gm'), (_, css, item) => {
            const statements = css.split(';');
            for (const statement of statements) {
                const [attr, val] = statement.trim().split(':');
                if (attr.trim() === item.trim())
                    return val !== null && val !== void 0 ? val : '';
            }
            return '';
        });
        cssOutput = cssOutput.replace(regex_1.regexes.blockSubstitutions('gm'), (_, css) => css);
        // Parse simple breakpoints //
        cssOutput = cssOutput.replace(regex_1.regexes.simpleBreakpoint('gms'), (_, sel, min1, max1, min2, max2, selAfter, block) => {
            var _a, _b;
            let [min, max] = [min1 !== null && min1 !== void 0 ? min1 : min2, max1 !== null && max1 !== void 0 ? max1 : max2];
            let selMatch = (_a = selAfter.match(regex_1.regexes.simpleBreakpointValue('g'))) !== null && _a !== void 0 ? _a : [];
            if (selMatch.length > 0) {
                const matches = (_b = selMatch[selMatch.length - 1].match(regex_1.regexes.simpleBreakpointValue(''))) !== null && _b !== void 0 ? _b : [];
                [, min, max] = matches;
            }
            let selector = (sel + selAfter).replace(regex_1.regexes.simpleBreakpointValue('g'), '');
            let query = [];
            if (min)
                query.push(`(min-width: ${min})`);
            if (max)
                query.push(`(max-width: ${max.replace(/\d+/, (d) => (+d - 1).toString())})`);
            return `@media ${query.join(' and ')} { ${selector} { ${block} } }`;
        });
    } while (cssOutput.includes('$(') || new RegExp(mathOperation).test(cssOutput));
    // Remove unparsed variables //
    if (!constants.KEEP_UNPARSED) {
        const unparsedContent = (_b = cssOutput.match(regex_1.regexes.unparsedContent('g'))) !== null && _b !== void 0 ? _b : [];
        for (const val of unparsedContent) {
            cssOutput = cssOutput.replace(val, '');
            const varName = strim(val.replace(regex_1.regexes.variableName(''), '$1'));
            const type = val.includes('$(') ? 'variable' : 'argument';
            console.log(`<NovaSheets> Instances of unparsed ${type} '${varName}' have been removed from the output.`);
        }
    }
    // Cleanup output //
    cssOutput = cssOutput
        // cleanup whitespace
        .replace(/(?<!^ *) +/gm, ' ') // remove redundant whitespace
        .replace(/\*\/\s*/g, '$&\n') // newline after block comment
        .replace(/}\s*/g, '}\n').replace(/}\s*}/g, '} }') // space after braces
        .replace(/\s*{/g, ' {') // space before braces
        .replace(/^([ \t])\1+/gm, '$1') // single indent
        .replace(/^([ \t].+)}/gm, '$1\n}') // newline before indented block ending
        .replace(/{\s*(.+\r?\n)([ \t])/g, '{\n$2$1$2') // newline after indent block start
        // remove extra punctutation
        .replace(/(\s*;)+/g, ';')
        // clean up length units
        .replace(/(?<![1-9]+)(0\.\d+)\s*(m|s)/, (_, n, u) => +n * 1000 + 'm' + u)
        .replace(/(?<=\d)0\s*mm/g, 'cm')
        .replace(/(?<=\d)(000\s*mm|00\s*cm)/g, 'm')
        // fix floating point errors
        .replace(/\.?0{10,}\d/g, '')
        .replace(/((\d)\2{9,})\d/g, '$1')
        .replace(/(\d+)([5-9])\2{10,}\d?(?=\D)/g, (_, a) => (+a + 1).toString())
        .replace(/\d*\.?\d+e-(?:7|8|9|\d{2,})/, '0')
        // cleanup decimal places
        .replace(/\d\.\d+/g, (val) => constants.DECIMAL_PLACES === false ? val : (+val).toFixed(+constants.DECIMAL_PLACES))
        // fix calc() output
        .replace(/calc(\d)/g, '$1')
        // restore characters
        .replace(RegExp(ESC.SLASH, 'g'), '/');
    // remove duplicate media queries
    while (regex_1.regexes.duplicateMediaQueries('gs').test(cssOutput)) {
        cssOutput = cssOutput.replace(regex_1.regexes.duplicateMediaQueries('gs'), `$1 {$2 $3}`);
    }
    // re-add comments to output
    for (const i in staticContent) {
        cssOutput = cssOutput.replace(RegExp(r `\/\*STATIC#${i}\*\/`, 'g'), strim(staticContent[i]));
    }
    for (const i in commentedContent) {
        cssOutput = cssOutput.replace(RegExp(r `\/\*COMMENT#${i}\*\/`, 'g'), '/*' + commentedContent[i] + '*/');
    }
    // Return output //
    return cssOutput.trim() + '\n';
}
module.exports = parse;

},{"./functions":40,"./index":41,"./regex":44,"balanced-match":1,"math-and-unit-parser":30}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regexes = void 0;

const yaml = require('js-yaml');
const re = (regex, flags = '') => RegExp(regex.replace(/( |^)#.+$|\s+?/gm, ''), flags);
const parseVars = (val) => {
    return val.replace(/\{\{(.+?)\}\}/g, (_, name) => {
        const newContent = parsedYaml[name];
        if (!newContent)
            throw new Error(`YAML variable '${name}' is undefined`);
        return '(?:' + parseVars(newContent) + ')';
    });
};
const yamlFile = "# Headings\r\n#: General\r\n#: Numbers\r\n#: Comments\r\n#: Declarations\r\n#: Substitutions\r\n#: Selectors\r\n#: Object notation\r\n#: Simple breakpoints\r\n#: Edge cases Media queries\r\n\r\n# General\r\n\r\nopenBracket: \\(\\s*\r\ncloseBracket: \\s*\\)\r\n\r\n# Numbers\r\n\r\nnumber: |\r\n    (?: \\d*\\. )?\\d+\r\n    |\r\n    \\d+\\.\r\n\r\nbasedNumber: |\r\n    -?\r\n    (?:\r\n        0x [0-9a-f]* \\.? [0-9a-f]+\r\n        |\r\n        0b [01]* \\.? [01]+\r\n        |\r\n        0o [0-7]* \\.? [0-7]+\r\n    |\r\n    {{number}}\r\n    )\r\n\r\nnumberUnit: |\r\n    \\s*\r\n    (?:\r\n        em|rem|en|ex|px|pt|pc|ft|in|s|ms|cm|mm|m\r\n    )\r\n    \\b\r\n\r\nnumberWithUnit: |\r\n    ( {{number}} )\r\n    \\s*\r\n    ( {{numberUnit}} )\r\n\r\nnumberValue: |\r\n    (?:\r\n        -? {{basedNumber}}\r\n        (?: {{numberUnit}} )?\r\n    )\r\n\r\nexponential: |\r\n    (?<! [#\\w] )\r\n    ( {{number}} ) # Group 1 used\r\n    \\s* e \\s*\r\n    ( [+-]? {{number}} ) # Group 2 used\r\n\r\noptBracketedNumber: |\r\n    (?:\r\n        {{openBracket}}\r\n        {{numberValue}}\r\n        {{closeBracket}}\r\n        |\r\n        {{numberValue}}\r\n    )\r\n\r\noperators: |\r\n    (?:\r\n        (?: [-^*/+]+ \\s* )+\r\n        (?= \\d | \\. )\r\n    )\r\n\r\nunbracketedMath: |\r\n    (?:\r\n        (?:\r\n            {{optBracketedNumber}} \\s*\r\n            {{operators}} \\s*\r\n        )+\r\n        {{numberValue}}\r\n    )\r\n\r\nmathChecker: |\r\n    {{openBracket}}\r\n    {{unbracketedMath}}\r\n    {{closeBracket}}\r\n    |\r\n    {{unbracketedMath}}\r\n\r\n# Comments\r\n\r\nsingleLineComment: |\r\n    (?<![a-z]:) # Exclude e.g. \"http://\"\r\n    \\/\\/ # Double slash\r\n    .*$ # Content until end of lint\r\n\r\nblockComment: |\r\n    \\/\\*\r\n    (.*?)\r\n    \\*\\/\r\n\r\nstaticComment: |\r\n    \\/\\*\\/\r\n    (.*?)\r\n    \\/\\*\\/\r\n\r\n# Declarations\r\n\r\nvariableDeclaration: |\r\n    @var\\s\r\n    ([^=|\\n]+) # Name # Group 1 used\r\n    (?: \\| [^=\\n]+ )* # Explicit arguments\r\n    (?:\r\n        # Inline\r\n        =\r\n        (.+?) # Content # Group 2 used\r\n        (?: @endvar | $ )\r\n    |\r\n        # Block\r\n        $\\s+\r\n        ([^]*?) # Content # Group 3 used\r\n        (?:\r\n            @endvar # Explcit ending\r\n        |\r\n            (?=@var) # Followed by other variable\r\n        )\r\n    |\r\n        # Void\r\n        $\r\n    )\r\n\r\nvariableDeclarationInline: |\r\n    @var\\s\r\n    (.+)\r\n    =\r\n    (.+)\r\n    $\r\n\r\nvariableDeclarationBlock: |\r\n    @var\\s\r\n    (.+)\r\n    $\\s+\r\n    ([^]+)\r\n    @endvar\r\n\r\nparserOption: |\r\n    @option\r\n    \\s+\r\n    (\\w+)\r\n    \\s+\r\n    (true|false|[0-9]+)\r\n\r\n# Substitutions\r\n\r\nunparsedContent: |\r\n    \\$\r\n    [\\[(]\r\n    (.+?)\r\n    [\\])]\r\n\r\nvariableName: |\r\n    \\$\r\n    [\\[(]\r\n    (.*?) # Name # Group 1 used\r\n    (\\|.*)? # Arguments\r\n    [\\])]\r\n\r\ndefaultArguments: |\r\n    \\$\\[\r\n    .*?\r\n    (?:\r\n        \\|\r\n        ( [^\\]]* ) # Group 1 used\r\n    )?\r\n    \\]\r\n\r\n# Selectors\r\n\r\nimplicitParentSelector: |\r\n    ;\r\n    (\\s*) # Group 1 used\r\n    @(?!\\w)\r\n\r\n# Object notation\r\n\r\nblock: |\r\n    {\r\n    ( [^{}]*? )\r\n    }\r\n\r\nobjectNotation: |\r\n    {{block}}\r\n    \\s*\r\n    <\r\n    ( [^[\\]]*? )\r\n    >\r\n\r\nblockSubstitutions: |\r\n    {{block}}\r\n    \\s* !\r\n\r\n# Simple breakpoints\r\n\r\nsimpleBreakpointValue: |\r\n    \\s* @ \\s*\r\n    ( \\d+ px )?\r\n    \\s*\r\n    (?: \\.{2,} )?\r\n    \\s*\r\n    ( \\d+ px )?\r\n\r\nsimpleBreakpoint: |\r\n    ( [^{};/*]*? ) # Group 1: sel\r\n    \\s* @ \\s*\r\n    (?:\r\n        ( \\d+ px ) # Group 2: min1\r\n        \\s*\r\n        (?: \\.{2,} )?\r\n        \\s*\r\n        ( \\d+ px )? # Group 3: max1\r\n    |\r\n        ( \\d+ px )? # Group 4: min2\r\n        \\s*\r\n        (?: \\.{2,} )?\r\n        \\s*\r\n        ( \\d+ px ) # Group 5: max2\r\n    )\r\n    ( [^{}]*? ) # Group 6: rest of selector\r\n    {( .*? )} # Group 7: block content\r\n\r\n# Edge cases\r\n\r\nslashEdgeCaseFunction: |\r\n    (\r\n        (?:rgba?|hsla?)\r\n        \\(\r\n        .+?\r\n        [\\s\\d%]+\r\n    )\r\n    \\/\r\n    ([\\s\\d%]+\\))\r\n\r\nslashEdgeCaseAttribute: |\r\n    (\r\n        (?:grid|font)\r\n        (?:-\\w+)?\r\n        :\r\n        [^;]+?\r\n        \\d\\w*\r\n    )\r\n    \\s*\\/\\s*\r\n    (\\d)\r\n\r\nslashEdgeCases: |\r\n    {{slashEdgeCaseFunction}}\r\n    |\r\n    {{slashEdgeCaseAttribute}}\r\n\r\nedgeCaseDelimited: |\r\n    \\d[a-z]{0,2} # Unit value\r\n    \\s+ # Space\r\n    -\\d # Unspaced negative value\r\n\r\n# Media queries\r\n\r\nmediaQuery: |\r\n    @media\r\n    (?:\r\n        [\\s\\w]+ # Words\r\n        \\([^()]+?\\) # Parentherical values\r\n    )+\r\n\r\nmediaQueryBlock: |\r\n    ( {{mediaQuery}} ) # Group 1 used\r\n    ( # Group 2 used\r\n        [^{}]+\r\n        { .+? } # Block content\r\n    )\r\n\r\nmediaQueryBody: |\r\n    [^{}]*?\r\n    { [^{}]*? }\r\n    \\s*\r\n\r\nemptyMediaQueryBlock: |\r\n    ( {{mediaQuery}} ) # Group 1 used\r\n    \\s*\r\n    (?:{})? # Empty block\r\n    \\s*\r\n    (?= @media )\r\n\r\nnonEmptyMediaQueryBlock: |\r\n    ( {{mediaQuery}} ) # Group 1 used\r\n    \\s*\r\n    ( [^{}]+ ) # Group 2 used\r\n    {\r\n    ( [^{}]+ ) # Group 3 used\r\n    }\r\n\r\nduplicateMediaQueries: |\r\n    ( {{mediaQuery}} ) # Group 1 used\r\n    \\s*\r\n    { ( {{mediaQueryBody}} ) } # Group 2 used\r\n    \\s* \\1 \\s*\r\n    { ( {{mediaQueryBody}} ) } # Group 3 used\r\n";
const parsedYaml = yaml.load(yamlFile);
const outputObj = {};
for (const entry in parsedYaml) {
    const content = parseVars(parsedYaml[entry]);
    outputObj[entry] = (flags = '') => re(content, flags);
}
exports.regexes = outputObj;

},{"js-yaml":3}]},{},[38]);
