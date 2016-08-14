'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = factory;
exports.lazyObservableFactory = lazyObservableFactory;
exports.response$Factory = response$Factory;
exports.error$Factory = error$Factory;
exports.fetching$Factory = fetching$Factory;
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

function fetching$Factory(Observable, request$) {
  return request$.flatMapLatest(function (req) {
    return req.response.catch(function () {
      return Observable.of(false);
    }).map(function () {
      return false;
    }).startWith(true);
  }).distinctUntilChanged();
}

function endpointFactory(Observable, BehaviorSubject, apiRequest$, client) {
  return function createEndpoint(urlFactory) {
    var method = arguments.length <= 1 || arguments[1] === undefined ? 'GET' : arguments[1];
    var defaultParams = arguments[2];
    var defaultData = arguments[3];

    var uri = typeof urlFactory === 'string' ? function () {
      return urlFactory;
    } : urlFactory;
    var behaviorSubject = new BehaviorSubject();
    var hotRequest$ = behaviorSubject.skip(1);

    var coldRequest$ = lazyObservableFactory(Observable, behaviorSubject, function () {
      return _fetch(defaultParams, defaultData);
    });

    var createRequest = function createRequest(response, params, data) {
      var url = uri(params, data);

      return { url: url, method: method, params: params, data: data, response: response };
    };

    var _fetch = function _fetch() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? defaultParams : arguments[0];
      var data = arguments.length <= 1 || arguments[1] === undefined ? defaultData : arguments[1];

      var url = uri(params, data);

      var response = client(url, method, params, data);

      return createRequest(response, params, data);
    };

    var request$ = Observable.merge(hotRequest$, coldRequest$)
    // Pushing new request to global api request observable
    .do(apiRequest$.onNext.bind(apiRequest$));

    return {
      fetch: function fetch(params, data) {
        behaviorSubject.onNext(_fetch(params, data));

        return this;
      },

      request$: request$,
      response$: response$Factory(Observable, request$),
      fetching$: fetching$Factory(Observable, hotRequest$),
      error$: error$Factory(Observable, hotRequest$)
    };
  };
}