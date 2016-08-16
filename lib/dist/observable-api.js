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

	var _observableApi = __webpack_require__(3);

	var _observableApi2 = _interopRequireDefault(_observableApi);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	if (typeof window !== 'undefined') {
	  if (!window.Rx) {
	    throw new Error('Rx library must be included before ObservableAPI!');
	  }

	  window.ObservableAPI = window.ObservableAPI || {};
	  window.ObservableAPI.create = (0, _observableApi2.default)(window.Rx);
	} // Define globally in case AMD is not available or unused.

/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = factory;
	exports.response$Factory = response$Factory;
	exports.error$Factory = error$Factory;
	exports.fetching$Factory = fetching$Factory;
	exports.createObservableFactoryFn = createObservableFactoryFn;
	function factory(Rx) {
	  var Observable = Rx.Observable;
	  var Subject = Rx.Subject;
	  var BehaviorSubject = Rx.BehaviorSubject;


	  return function (client) {
	    var request$ = new Subject();
	    var createEndpoint = endpointFactory(Observable, BehaviorSubject, request$, client);

	    return {
	      request$: request$.asObservable(),
	      createEndpoint: createEndpoint
	    };
	  };
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
	    return req.response.ignoreElements().catch(function (err) {
	      return Observable.of(err);
	    });
	  });
	}

	function fetching$Factory(Observable, request$) {
	  return request$.flatMapLatest(function (req) {
	    return req.response.catch(function () {
	      return Observable.of(false);
	    }).map(function () {
	      return false;
	    }).startWith(true);
	  }).distinctUntilChanged();
	}

	function createObservableFactoryFn(Observable, hot$, behavior$, fetch) {

	  return function (callSubscribe, includeLastValue) {
	    var cold$ = Observable.create(function (observer) {
	      fetch();

	      observer.onCompleted();
	    });

	    var hotOrCold$ = function hotOrCold$() {
	      switch (true) {
	        case callSubscribe === true:
	          return hot$.merge(cold$);
	        case callSubscribe === false:
	          return hot$;
	        case !behavior$.value:
	          return hot$.merge(cold$);
	        case !!behavior$.value:
	          return hot$;
	      }
	    };

	    var startWithLast = function startWithLast(source$) {
	      if (!includeLastValue || !behavior$.value) {
	        return source$;
	      }

	      return source$.startWith(behavior$.value);
	    };

	    return Observable.create(function (observer) {
	      observer.onNext(startWithLast(hotOrCold$()));
	    }).flatMap(function (observable) {
	      return observable;
	    });
	  };
	}

	function endpointFactory(Observable, BehaviorSubject, apiRequest$, client) {
	  var defaultOptions = {
	    defaultParams: undefined,
	    defaultData: undefined
	  };

	  return function createEndpoint(urlFactory) {
	    var method = arguments.length <= 1 || arguments[1] === undefined ? 'GET' : arguments[1];
	    var options = arguments.length <= 2 || arguments[2] === undefined ? defaultOptions : arguments[2];
	    var defaultParams = options.defaultParams;
	    var defaultData = options.defaultData;

	    var uri = typeof urlFactory === 'string' ? function () {
	      return urlFactory;
	    } : urlFactory;
	    var behaviorSubject = new BehaviorSubject();
	    var hotRequest$ = behaviorSubject.skip(1);

	    var createRequest = function createRequest(response, params, data) {
	      var url = uri(params, data);

	      return { url: url, method: method, params: params, data: data, response: response };
	    };

	    var _fetch = function _fetch() {
	      var params = arguments.length <= 0 || arguments[0] === undefined ? defaultParams : arguments[0];
	      var data = arguments.length <= 1 || arguments[1] === undefined ? defaultData : arguments[1];

	      var url = uri(params, data);
	      var response = client(url, method, params, data);
	      var request = createRequest(response, params, data);

	      apiRequest$.onNext(request);
	      behaviorSubject.onNext(request);

	      return createRequest(response, params, data);
	    };

	    var create$ = createObservableFactoryFn(Observable, hotRequest$, behaviorSubject, _fetch);

	    return {
	      fetch: function fetch(params, data) {
	        _fetch(params, data);

	        return this;
	      },

	      request$: create$(null, true),
	      response$: response$Factory(Observable, create$(null, true)),
	      fetching$: fetching$Factory(Observable, create$(false, false)),
	      error$: error$Factory(Observable, create$(false, false))
	    };
	  };
	}

/***/ }
/******/ ]);
//# sourceMappingURL=observable-api.js.map