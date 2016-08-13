'use strict';

var _observableApi = require('../observable-api');

var _observableApi2 = _interopRequireDefault(_observableApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (typeof window !== 'undefined') {
  if (!window.Rx) {
    throw new Error('Rx library must be included before ObservableAPI!');
  }

  window.ObservableAPI = window.ObservableAPI || {};
  window.ObservableAPI.create = (0, _observableApi2.default)(window.Rx);
} // Define globally in case AMD is not available or unused.