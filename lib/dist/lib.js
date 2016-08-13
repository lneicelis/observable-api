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

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	var _observableApi = __webpack_require__(1);

	var _observableApi2 = _interopRequireDefault(_observableApi);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
	if (true) {
	  !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Rx) {
	    return {
	      ObservableAPI: (0, _observableApi2.default)(Rx)
	    };
	  }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} // Define globally in case AMD is not available or unused.

	if (typeof window !== 'undefined') {
	  if (!window.Rx) {
	    throw new Error('Rx library must be included before ObservableAPI!');
	  }

	  window.ObservableAPI = (0, _observableApi2.default)(window.Rx);
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = factory;
	exports.lazyObservableFactory = lazyObservableFactory;
	exports.response$Factory = response$Factory;
	exports.error$Factory = error$Factory;
	function factory(Rx) {
	  var Observable = Rx.Observable;
	  var Subject = Rx.Subject;
	  var BehaviorSubject = Rx.BehaviorSubject;


	  return function (client) {
	    var request$ = new Subject();
	    var createEndpoint = endpointFactory(Observable, BehaviorSubject, request$, client);

	    return {
	      request$: request$,
	      createEndpoint: createEndpoint
	    };
	  };
	}

	function lazyObservableFactory(Observable, subject, fetch) {
	  return Observable.create(function (observer) {
	    subject.onNext(subject.value || fetch());
	    observer.onCompleted();
	  });
	}

	function response$Factory(Observable, request$) {
	  return request$.flatMapLatest(function (req) {
	    return req.response.catch(function () {
	      return Observable.never();
	    });
	  });
	}

	function error$Factory(Observable, request$) {
	  return request$.flatMapLatest(function (req) {
	    return req.response.skipWhile(function () {
	      return false;
	    }).catch(function (err) {
	      return Observable.of(err);
	    });
	  });
	}

	function endpointFactory(Observable, BehaviorSubject, apiRequest$, client) {
	  return function createEndpoint(uri, method, defaultParams, defaultData) {
	    var subject = new BehaviorSubject();

	    var lazyObservable = lazyObservableFactory(Observable, subject, function () {
	      return _fetch(defaultParams, defaultData);
	    });

	    var createRequest = function createRequest(response) {
	      var params = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	      var data = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	      return { uri: uri, method: method, params: params, data: data, response: response };
	    };

	    var _fetch = function _fetch() {
	      var params = arguments.length <= 0 || arguments[0] === undefined ? defaultParams : arguments[0];
	      var data = arguments.length <= 1 || arguments[1] === undefined ? defaultData : arguments[1];

	      var response = client(uri, method, params, data);

	      return createRequest(response, params, data);
	    };

	    var request$ = Observable.merge(
	    // Skipping initial value of behavior subject
	    subject.skip(1),
	    // subscribing to lazy observable when subscriptions goes 0 to 1
	    lazyObservable)
	    // Pushing new request to global api request observable
	    .do(apiRequest$.onNext.bind(apiRequest$));

	    return {
	      fetch: function fetch(params, data) {
	        subject.onNext(_fetch(params, data));

	        return this;
	      },

	      request$: request$,
	      response$: response$Factory(Observable, request$),
	      error$: error$Factory(Observable, request$)

	    };
	  };
	}

/***/ },
/******/ ]);
//# sourceMappingURL=lib.js.map
