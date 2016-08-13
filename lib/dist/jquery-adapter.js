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

	var _jquery = __webpack_require__(2);

	var _jquery2 = _interopRequireDefault(_jquery);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	if (typeof window !== 'undefined') {
	  if (!window.Rx) {
	    throw new Error('Rx library must be included before jQuery adapter!');
	  }

	  window.ObservableAPI = window.ObservableAPI || {};
	  window.ObservableAPI.jQueryAdapter = (0, _jquery2.default)(window.Rx.Observable);
	}

/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = factory;
	function factory(Observable) {
	  return function jQueryAdapter(jQuery) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    return function client(uri, method, params, data) {
	      options.url = uri;
	      options.method = method;
	      options.params = params;
	      options.data = data;

	      var response = jQuery.ajax(options);

	      return Observable.fromPromise(response);
	    };
	  };
	}

/***/ }
/******/ ]);
//# sourceMappingURL=jquery-adapter.js.map