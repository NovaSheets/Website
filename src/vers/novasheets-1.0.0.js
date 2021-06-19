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
},{"../constants/Units.js":4,"../lib/makeEnum.js":7}],4:[function(require,module,exports){
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
},{"../lib/makeEnum.js":7}],5:[function(require,module,exports){
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
},{"./constants/MathParser.js":3,"./constants/Units.js":4,"./models/MathFilter.js":8}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{"./keyHandler.js":6}],8:[function(require,module,exports){
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
},{"../constants/MathParser.js":3,"../constants/Units.js":4,"./Token.js":10}],9:[function(require,module,exports){
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
},{"../constants/MathParser.js":3,"../constants/Units.js":4}],10:[function(require,module,exports){
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
},{"../constants/MathParser.js":3,"../models/Operator.js":9}],11:[function(require,module,exports){
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
},{"_process":12}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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
    const { stylesheetContents, sources } = prepare(rawInput);
    for (let i in stylesheetContents) {
        const cssOutput = parse_1.default(stylesheetContents[i], novasheets);
        if (document.querySelectorAll(`[data-hash="${hashCode(cssOutput)}"]`).length)
            return; // prevent duplicate outputs
        let styleElem = document.createElement('style');
        styleElem.innerHTML = '\n' + cssOutput.trim() + '\n';
        styleElem.dataset.hash = hashCode(cssOutput);
        styleElem.dataset.source = sources[i];
        (document.head || document.body).appendChild(styleElem);
    }
}
window.prepare = prepare;
function prepare(rawInput = '') {
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
    ;
    for (let i in fileNames.full) {
        //await fetch(fileNames.full[i]).then(data => data.text()).then(text => stylesheetContents.push(text)).catch(err => console.warn(`<NovaSheets> File '${fileNames.rel[i]}' is inacessible.`, err));
        let req = new XMLHttpRequest();
        req.open("GET", fileNames.full[i], false);
        req.send();
        stylesheetContents.push(req.responseText);
        sources.push(fileNames.rel[i]);
    }
    for (let contents of inlineSheets) {
        let content = (contents instanceof HTMLInputElement && contents.value) || contents.innerHTML || contents.innerText;
        stylesheetContents.push(content.replace(/^\s*`|`\s*$/, ''));
        sources.push('inline');
    }
    ;
    return { stylesheetContents, sources };
}

},{"./index":16,"./parse":18}],14:[function(require,module,exports){
(function (process){(function (){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
const path = require('path');
const fs = require('fs');
const isNode = typeof process !== "undefined" && ((_a = process === null || process === void 0 ? void 0 : process.versions) === null || _a === void 0 ? void 0 : _a.node);
const glob = isNode && require('glob');
const parse_1 = __importDefault(require("./parse"));
async function compileNovaSheets(source, outPath, novasheets) {
    outPath = outPath.replace(/[/\\]/g, path.sep);
    const compile = async (inputFiles) => {
        for (let input of inputFiles) {
            await fs.readFile(input, 'utf8', async (err, contents) => {
                if (err)
                    throw `FS_ReadError: Input file '${input}' not found.\n` + err.message;
                let output = outPath;
                const folder = output.includes(path.sep) ? output.replace(/[/\\][^/\\]+$/, '') : '';
                if (folder) {
                    fs.mkdir(folder, { recursive: true }, (err) => {
                        if (err)
                            throw `FS_MkDirError: Could not create directory '${folder}'.\n` + err.message;
                    });
                }
                const filename = input.replace(/.+[/\\]([^/\\]+)$/, '$1'); // 'foo/bar.ext' -> 'bar.ext'
                if (!output) {
                    if (hasGlobs)
                        output = input.replace(/[/\\][^/\\]+$/, path.sep); // 'foo.ext' -> 'foo/'
                    else
                        output = input.replace(/\.\w+$/, '.css'); // 'foo.ext' -> 'foo.css'
                }
                if (output.endsWith(path.sep))
                    output += filename; // 'foo.nvss bar/' -> 'bar/foo.nvss'
                else if (hasGlobs)
                    output += path.sep + filename; // '*.nvss bar' -> 'bar/$file.nvss'
                else if (!output.match(/\.\w+$/))
                    output += '.css'; // 'foo.nvss bar' -> 'bar.css'
                output = output.replace(/\.\w+$/, '.css'); // force .css extension
                await fs.writeFile(output, parse_1.default(contents, novasheets), (err) => {
                    if (err)
                        throw `FS_WriteError: Cannot write to file '${output}'.\n` + err.message;
                    console['log'](`<NovaSheets> Wrote file '${input}' to '${output}'`);
                });
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
},{"./parse":18,"_process":12,"fs":2,"glob":undefined,"path":11}],15:[function(require,module,exports){
"use strict";
// Default built-in functions
function addBuiltInFunctions({ constants }) {
    const novasheets = new (require('./novasheets'))();
    // const novasheets: NovaSheets = new NovaSheets();
    const escapeRegex = (str) => str.replace(/[.*+?^/${}()|[\]\\]/g, '\\$&');
    const strim = (str) => str.toString().replace(/^\s*(.+?)\s*$/, '$1').replace(/\s+/g, ' ');
    const r = String.raw;
    /// Loop functions
    novasheets.addFunction('@each', (_, a = '', b = '', c = '', ...rest) => {
        let d = rest.join('|');
        let [items, splitter, joiner, content] = d ? [a, b, c, d] : (c ? [a, b, b, c] : [a, ',', ',', b]);
        let arr = strim(items).split(strim(splitter));
        let output = [];
        for (let i in arr) {
            let parsed = strim(content)
                .replace(/\$i/gi, String(+i + 1))
                .replace(/\$v\[([0-9]+)([-+*/][0-9]+)?\]/g, (_, a, b) => arr[+a - 1 + (b || 0)])
                .replace(/.?\s*undefined/g, '')
                .replace(/\$v/gi, arr[i]);
            output.push(parsed);
        }
        return output.join(joiner);
    }, { trim: false, allArgs: true });
    novasheets.addFunction('@repeat', (_, a, ...b) => {
        let [delim, content] = b[1] ? [b[0], b.slice(1).join('|')] : ['', b.join('|')];
        let output = '';
        for (let i = 0; i < +a; i++) {
            output += (i > 0 ? delim : '') + content.replace(/\$i/gi, (+i + 1).toString());
        }
        return output;
    }, { trim: false, allArgs: true });
    /// Math functions
    const number = r `(?:[0-9]*\.?[0-9]+)`;
    const basedNumber = r `(?:0x[0-9a-f]*\.?[0-9a-f]+|0b[01]*\.?[01]+|0o[0-7]*\.?[0-7]+|${number})`;
    const toNum = (val) => constants.KEEP_NAN ? +val : (Number.isNaN(val) ? 0 : parseFloat(val + ""));
    const testNaN = (arg, def) => {
        let test = !arg || arg === Infinity || Number.isNaN(arg);
        if (test && constants.KEEP_NAN)
            return 'NaN';
        else if (test && !constants.KEEP_NAN)
            return def || 0;
        else if (Math.abs(+arg) <= 1e-7)
            return 0;
        else
            return +arg;
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
    }, { trim: false, allArgs: true });
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
                parts[i] = "0";
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
                .replace(/(?!=)(!?)=(==)?(?!=)/g, '$1$2==') // normalise equality signs
            ;
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
                .replace(RegExp(r `(?:~|!|not)\s*([+-]?${bracketedNumber})`), (_, a) => eval('~' + toNum(a))) // bitwise not
                .replace(logicRegex('or|\\|'), (_, a, b) => eval(`(${toNum(a)}) | (${toNum(b)})`)) // bitwise or
                .replace(logicRegex('nor'), (_, a, b) => eval(`~ (${toNum(a)}) | (${toNum(b)})`)) // bitwise nor
                .replace(logicRegex('and|&'), (_, a, b) => eval(`(${toNum(a)}) & (${toNum(b)})`)) // bitwise and
                .replace(logicRegex('nand'), (_, a, b) => eval(`~ (${toNum(a)}) & (${toNum(b)})`)) // bitwise nand
                .replace(logicRegex('xor'), (_, a, b) => eval(`(${toNum(a)}) ^ (${toNum(b)})`)) // bitwise xor
                .replace(logicRegex('xnor'), (_, a, b) => eval(`~ (${toNum(a)}) ^ (${toNum(b)})`)) // bitwise xnor
            ;
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

},{"./novasheets":17}],16:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const novasheets_1 = __importDefault(require("./novasheets"));
module.exports = novasheets_1.default;

},{"./novasheets":17}],17:[function(require,module,exports){
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
     * @returns `[{name1, body1, options1}, ...]`
     */
    getFunctions() {
        return __classPrivateFieldGet(this, _NovaSheets_functions, "f");
    }
}
_NovaSheets_functions = new WeakMap();
module.exports = NovaSheets;

},{"./compile":14,"./parse":18}],18:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const balanced = require('balanced-match');
const { MathParser } = require('math-and-unit-parser');
const index_1 = __importDefault(require("./index"));
const functions_1 = __importDefault(require("./functions"));
function parse(content, novasheets = new index_1.default()) {
    var _a;
    const r = String.raw;
    const strim = (str) => str.replace(/^\s*(.+?)\s*$/, '$1').replace(/\s+/g, ' ');
    const escapeRegex = (str) => str.replace(/[.*+?^/${}()|[\]\\]/g, '\\$&');
    const number = r `(?:\d*\.?\d+|\d+\.)`;
    const basedNumber = r `(?:-?(?:0x[0-9a-f]*\.?[0-9a-f]+|0b[01]*\.?[01]+|0o[0-7]*\.?[0-7]+|${number}))`;
    const numberUnit = r `\s*(?:em|rem|en|ex|px|pt|pc|ft|in|s|ms|cm|mm|m)\b`;
    const mathChecker = (() => {
        const o = r `\(\s*`, c = r `\s*\)`; // open and close brackets
        const numberValue = r `(?:-?${basedNumber}(?:${numberUnit})?)`;
        const optBracketedNumber = `(?:${o}${numberValue}${c}|${numberValue})`;
        const operators = r `(?:(?:[-^*/+]+\s*)+(?=\d|\.))`;
        const unbracketed = r `(?:(?:${optBracketedNumber}\s*${operators}\s*)+${numberValue})`;
        return r `\(\s*${unbracketed}\s*\)|${unbracketed}`;
    })();
    const parseFunction = (name, func, opts = {}) => {
        if (RegExp(mathChecker).test(cssOutput))
            return; // only run after math is parsed
        const match = Array.from(cssOutput.match(RegExp(r `\$\(\s*(?:${name})\b`, 'i')) || []);
        if (match.length === 0)
            return;
        const searchString = cssOutput.substr(cssOutput.indexOf(match[0]));
        let segment = '';
        let brackets = 0;
        let hasBrackets = false;
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
            if (i === searchString.length - 1 && brackets > 0)
                return; // prevent overflow
        }
        if (!segment.trim())
            return;
        const replacer = opts.trim === false ? /^\$\(|\)$/ : /^\$\(\s*|\s*\)$/g;
        const splitter = opts.trim === false ? '|' : /\s*\|\s*/;
        let parts = segment.replace(replacer, '').split(splitter); // [name, arg1, arg2, ...]
        for (let i = 0; i < constants.MAX_ARGUMENTS; i++) {
            if (!parts[i])
                parts[i] = '';
        }
        if (!opts.allArgs) {
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
    const ESC = {
        OPEN_BRACE: Math.random().toString(36).substr(2),
        CLOSE_BRACE: Math.random().toString(36).substr(2),
        SLASH: Math.random().toString(36).substr(2),
    };
    // Prepare stylesheet for parsing //
    let styleContents = content
        .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&') // fix html
        .replace(/(?<![a-z]:)\n?\/\/.*$/gm, '') // remove single-line comments
        .replace(/(?:@var.+?=.*$|@var\s*[^=]*(?=\n\s*@var\s.))(?!\n\s*@endvar)/gm, '$& @endvar') // single-line @var declarations
        .replace(/@(var|const|endvar)/g, '\n$&') // put each declarator on its own line for parsing
        .replace(/@option\s*[A-Z_]+\s*(true|false|[0-9]+)|@endvar/g, '$&\n') // put each const on its own line
        .replace(/}}/g, '} }') // ensure the second brace is not skipped over
        .replace(/;(\s*)@/g, ';$1&@'); // implicit parent selector for simple breakpoints
    let commentedContent = [];
    let staticContent = [];
    let lines = styleContents.split('\n');
    let cssOutput = styleContents
        .replace(/\s*(?:@var.*?((?=@var)|@endvar)|@endvar|@option\s*[A-Z_]+\s*(true|false|[0-9]+))/gms, ' ') // remove syntactic declarations
        .replace(/\/\*(.+?)\*\//gs, (_, content) => {
        if (_.startsWith('/*[') && _.endsWith(']*/'))
            return _.replace(/^\/\*\[(.+)\]\*\/$/, '/*$1*/'); // parsed comment
        if (_.startsWith('/*/') || _.endsWith('/*/'))
            return _; // static comment; skip
        if (commentedContent.indexOf(content) < 0)
            commentedContent.push(content);
        return '/*COMMENT#' + commentedContent.indexOf(content) + '*/';
    }) // store commented content for replacement at end
        .replace(/\/\*\/(.+?)\/\*\//gs, (_, a) => {
        if (staticContent.indexOf(a) < 0)
            staticContent.push(a);
        return '/*STATIC#' + staticContent.indexOf(a) + '*/';
    }); // store static content for replacement at end
    let customVars = {};
    let constants = {
        BUILTIN_FUNCTIONS: true,
        DECIMAL_PLACES: false,
        KEEP_UNPARSED: false,
        MAX_ARGUMENTS: 10,
        MAX_RECURSION: 50,
    };
    // Generate a list of lines that start variable declarations //
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
            const variables = new RegExp(r `\$\(\s*${varName}\s*\)`, 'g');
            let varContent = (inlineContent + blockContent).trim().replace(variables, customVars[varName] || '');
            customVars[varName] = varContent.replace('{', ESC.OPEN_BRACE).replace('}', ESC.CLOSE_BRACE);
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
                case 'KEEP_UNPARSED':
                    constants.KEEP_UNPARSED = isNotFalse(val);
                    break;
                case 'MAX_ARGUMENTS':
                    constants.MAX_ARGUMENTS = parseInt(val);
                    break;
                case 'MAX_RECURSION':
                    constants.MAX_RECURSION = parseInt(val);
                    break;
            }
        }
    }
    // Compile NovaSheets styles //
    const hasNovaSheetsStyles = () => cssOutput.includes('$(') || RegExp(mathChecker).test(cssOutput);
    for (let loop = 0, lastCssOutput; loop < 1 || loop < constants.MAX_RECURSION && hasNovaSheetsStyles(); loop++) {
        if (lastCssOutput === cssOutput)
            break;
        lastCssOutput = cssOutput;
        // Parse math //
        cssOutput = cssOutput
            // convert exponential notation
            .replace(RegExp(r `(?<!#|\w)(${number})\s*e\s*([+-]?${number})`, 'gi'), (_, a, b) => String(+a * 10 ** +b))
            // fix edge case of slashes in CSS functions
            .replace(/((?:rgba?|hsla?)\(.+?[\s\d%]+)\/([\s\d%]+\))/g, (_, before, after) => before + ESC.SLASH + after)
            // compile math
            .replace(RegExp(mathChecker, 'g'), _ => {
            if (/\d[a-z]{0,2}\s+-\d/.test(_))
                return _; // delimited values, not subtraction
            let unit = '';
            let content = _
                .replace(/\*\*/g, '^')
                .replace(RegExp(r `(${number})\s*(${numberUnit})`, 'g'), (_, num, u) => {
                switch (u) {
                    case 'mm':
                    case 'ms':
                        unit = u[1];
                        return String(+num / 1000);
                    case 'cm':
                        unit = 'm';
                        return String(+num / 100);
                    case 'in':
                        unit = 'm';
                        return String(+num * 0.0254);
                    case 'ft':
                        unit = 'm';
                        return String(+num * 0.3048);
                    default:
                        unit = u;
                        return num;
                }
            });
            try {
                return MathParser(content) + unit;
            }
            catch {
                return _;
            }
        });
        // Parse variable contents //
        for (let name in customVars) {
            parseFunction(name, (_, ...paramArgs) => {
                let content = customVars[name];
                for (const i in paramArgs) {
                    if (!paramArgs[i])
                        continue;
                    const parts = paramArgs[i].split('=');
                    const param = parts[1] ? strim(parts[0]) : (+i + 1).toString();
                    const arg = parts[1] ? strim(parts.slice(1).join('=')) : strim(parts[0]);
                    content = content.replace(RegExp(r `\$\[${param}[^\]]*\]`, 'g'), arg);
                }
                content = content.replace(/\$\[.*?(?:\|([^\]]*))?\]/g, '$1'); // default args
                return content;
            });
        }
        // Parse functions //
        let allFunctions = [];
        if (constants.BUILTIN_FUNCTIONS)
            allFunctions.push(...functions_1.default({ constants }));
        allFunctions.push(...((_a = novasheets === null || novasheets === void 0 ? void 0 : novasheets.getFunctions()) !== null && _a !== void 0 ? _a : []));
        for (const obj of allFunctions) {
            parseFunction(obj.name, obj.body);
        }
        // Parse nesting //
        let compiledOutput = '';
        const check = (s) => balanced('{', '}', s);
        function unnest(css, parent) {
            var _a;
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
            let endStylesMatch = ((_a = data.body.match(/(?<=})[^{}]+?$/g)) === null || _a === void 0 ? void 0 : _a[0]) || '';
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
            let fullSelector = data.pre.includes('&') ? data.pre.replace(/&/g, parent) : parent + ' ' + data.pre;
            // write selector if the block has styles
            if (!/}\s*$/.test(data.body))
                compiledOutput += fullSelector;
            // add empty styles if selector has no styles
            if (parent && !data.pre)
                compiledOutput += '{}';
            // parse children
            unnest(data.body, fullSelector.trim());
            // continue to next block
            unnest(data.post, parent.trim());
        }
        unnest(cssOutput, '');
        const mediaRegex = r `@media[^{}]+(?:\([^()]+?\))+`;
        cssOutput = compiledOutput
            .replace(RegExp(r `(${mediaRegex})\s*(?:{})?(?=\s*@media)`, 'g'), '')
            .replace(RegExp(r `(${mediaRegex})\s*([^{}]+){([^{}]+)}`, 'g'), '$1 { $2 {$3} }');
        // Parse CSS block substitutions //
        //save CSS declarations as variables
        cssOutput = cssOutput.replace(ESC.OPEN_BRACE, '{').replace(ESC.CLOSE_BRACE, '}'); // unescape
        const cssBlocks = {};
        compiledOutput.replace(/([^{}]+)({.+?})/gms, (_, selector, css) => {
            if (selector.includes('$(') || selector.startsWith('@'))
                return '';
            selector = selector.replace(/\$(<.+?>){1,2}/g, '');
            const selectorVal = escapeRegex(strim(selector));
            cssBlocks[selectorVal] = css;
            return '';
        });
        //substitute blocks
        for (let name in cssBlocks) {
            cssOutput = cssOutput.replace(new RegExp(r `\$<\s*${name}\s*>`), cssBlocks[name] || '{}');
        }
        cssOutput = cssOutput.replace(/\$<.+?>/g, '{}');
        //parse object notation
        cssOutput = cssOutput.replace(/{([^{}]*?)}\s*<([^[\]]*?)>/gm, (_, css, item) => {
            const statements = css.split(/\s*;\s*/);
            for (const statement of statements) {
                const [attr, val] = statement.split(/\s*:\s*/);
                if (attr.trim() === item.trim())
                    return val || '';
            }
            return '';
        });
        cssOutput = cssOutput.replace(/{([^{}]*?)}\s*!/gm, (_, css) => css);
        // Parse simple breakpoints //
        cssOutput = cssOutput.replace(/([^{};]*?)\s*@\s*(?:(\d+px)(?:\s*\.{2,})?(\s*\d+px)?|(\d+px)?(?:\s*\.{2,})?(\s*\d+px))([^{}]*?){(.*?)}/gms, (_, sel, min1, max1, min2, max2, selAfter, block) => {
            let [min, max] = [min1 || min2, max1 || max2];
            let simpleBreakpoint = r `@\s*(\d+px)?\s*(?:\.{2,})?\s*(\d+px)?`;
            let selMatch = selAfter.match(RegExp(simpleBreakpoint, 'g'));
            if (selMatch)
                [, min, max] = selMatch[selMatch.length - 1].match(RegExp(simpleBreakpoint));
            let selector = (sel + selAfter).replace(RegExp(simpleBreakpoint, 'g'), '');
            let query = [];
            if (min)
                query.push(`(min-width: ${min})`);
            if (max)
                query.push(`(max-width: ${max.replace(/\d+/, (d) => +d - 1)})`);
            return `@media ${query.join(' and ')} { ${selector} { ${block} } }`;
        });
    }
    // Remove unparsed variables //
    if (!constants.KEEP_UNPARSED) {
        cssOutput = cssOutput.replace(/@endvar/g, '');
        let unparsedContent = cssOutput.match(/\$[[(](.+?)[\])]/g) || [];
        for (const val of unparsedContent) {
            let nssVarName = strim(val.replace(/\$[[(](.*?)(\|.*)?[\])]/, '$1'));
            cssOutput = cssOutput.replace(val, '');
            let type = val.includes('$(') ? 'variable' : 'argument';
            console.log(`<NovaSheets> Instances of unparsed ${type} '${nssVarName}' have been removed from the output.`);
        }
    }
    // Cleanup output //
    cssOutput = cssOutput
        // remove redundant chars
        .replace(/(\s*;)+/g, ';')
        .replace(/(?<!^ *) +/gm, ' ')
        .replace(/}\s*/g, '}\n').replace(/}\s*}/g, '} }')
        // clean up length units
        .replace(/(?<![1-9]+)(0\.\d+)\s*(m|s)/, (_, n, u) => +n * 1000 + 'm' + u)
        .replace(/(?<=\d)0\s*mm/g, 'cm')
        .replace(/(?<=\d)(000\s*mm|00\s*cm)/g, 'm')
        // fix floating point errors
        .replace(/\.?0{10,}\d/g, '')
        .replace(/((\d)\2{9,})\d/g, '$1')
        .replace(/(\d+)([5-9])\2{10,}\d?(?=\D)/g, (_, a) => String(+a + 1))
        .replace(/\d*\.?\d+e-(?:7|8|9|\d{2,})/, '0')
        // cleanup decimal places
        .replace(RegExp(r `((\d)\.\d{0,${constants.DECIMAL_PLACES}})(\d?)\d*`), (_, val, pre, after) => {
        const roundsUp = /[5-9]$/.test(after);
        if (constants.DECIMAL_PLACES === 0)
            return roundsUp ? parseInt(pre) + 1 : pre;
        else
            return roundsUp ? val.replace(/.$/, '') + (parseInt(val.substr(-1)) + 1) : val;
    })
        // fix calc() output
        .replace(/calc(\d)/g, '$1')
        // restore characters
        .replace(new RegExp(ESC.SLASH, 'g'), '/');
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

},{"./functions":15,"./index":16,"balanced-match":1,"math-and-unit-parser":5}]},{},[13]);
