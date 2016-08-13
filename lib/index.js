'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jQueryAdapter = undefined;

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _observableApi = require('./observable-api');

var _observableApi2 = _interopRequireDefault(_observableApi);

var _jquery = require('./adapters/jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _observableApi2.default)(_rx2.default);
var jQueryAdapter = exports.jQueryAdapter = _jquery2.default;