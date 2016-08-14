'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.axiosAdapter = exports.jQueryAdapter = exports.createAPI = undefined;

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _observableApi = require('./observable-api');

var _observableApi2 = _interopRequireDefault(_observableApi);

var _jquery = require('./adapters/jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _axios = require('./adapters/axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createObservableAPI = (0, _observableApi2.default)(_rx2.default);

var createAPI = exports.createAPI = createObservableAPI;

var jQueryAdapter = exports.jQueryAdapter = (0, _jquery2.default)(_rx2.default.Observable);

var axiosAdapter = exports.axiosAdapter = (0, _axios2.default)(_rx2.default.Observable);