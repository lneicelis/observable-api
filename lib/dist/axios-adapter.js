/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _axios = __webpack_require__(1);

	var _axios2 = _interopRequireDefault(_axios);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	if (typeof window !== 'undefined') {
	  if (!window.Rx) {
	    throw new Error('Rx library must be included before axios adapter!');
	  }

	  window.ObservableAPI = window.ObservableAPI || {};
	  window.ObservableAPI.axiosAdapter = (0, _axios2.default)(window.Rx.Observable);
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = factory;
	function factory(Observable) {
	  return function axiosAdapter(axios) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    return function client(uri, method, params, data) {
	      options.url = uri;
	      options.method = method;
	      options.params = params;
	      options.data = data;

	      var response = axios.create(options);

	      return Observable.fromPromise(response);
	    };
	  };
	}

/***/ }
/******/ ]);
//# sourceMappingURL=axios-adapter.js.map