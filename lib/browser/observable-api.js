'use strict';

var _observableApi = require('../observable-api');

var _observableApi2 = _interopRequireDefault(_observableApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
if (typeof define === 'function' && define.amd) {
  define(['rx'], function (Rx) {
    return {
      ObservableAPI: (0, _observableApi2.default)(Rx)
    };
  });
} // Define globally in case AMD is not available or unused.

if (typeof window !== 'undefined') {
  if (!window.Rx) {
    throw new Error('Rx library must be included before ObservableAPI!');
  }

  window.ObservableAPI = (0, _observableApi2.default)(window.Rx);
}