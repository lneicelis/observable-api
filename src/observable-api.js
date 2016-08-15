export default function factory(Rx) {
  const {Observable, Subject, BehaviorSubject} = Rx;

  return function (client) {
    const request$ = new Subject();
    const createEndpoint = endpointFactory(Observable, BehaviorSubject, request$, client);

    return {
      request$: request$.asObservable(),
      createEndpoint
    };
  };
}

export function response$Factory(Observable, request$) {
  return request$
    .flatMapLatest(req => {
      return req.response.catch(() => Observable.never())
    });
}

export function error$Factory(Observable, request$) {
  return request$
    .flatMapLatest(req => {
      return req.response.ignoreElements().catch(err => Observable.of(err));
    });
}

export function fetching$Factory(Observable, request$) {
  return request$
    .flatMapLatest(req => {
      return req.response
        .catch(() => Observable.of(false))
        .map(() => false)
        .startWith(true);
    })
    .distinctUntilChanged();
}

function createObservableFactoryFn(Observable, hot$, behavior$, fetch) {

  return (callSubscribe, includeLastValue) => {
    const cold$ = Observable.create(observer => {
      fetch();

      observer.onCompleted();
    });

    const hotOrCold$ = () => {
      switch (true) {
        case callSubscribe === true:
          return hot$.merge(cold$);
        case callSubscribe === null && !behavior$.value:
          return hot$.merge(cold$);
        case callSubscribe === null && !!behavior$.value:
          return hot$;
        case callSubscribe === false:
          return hot$;
      }
    };

    const startWithLast = source$ => {
      if (!includeLastValue || !behavior$.value) {
        return source$;
      }

      return source$.startWith(behavior$.value);
    };

    return Observable.create(observer => {
      observer.onNext(startWithLast(hotOrCold$()));
    }).flatMap(observable => observable);
  }
}

function endpointFactory(Observable, BehaviorSubject, apiRequest$, client) {
  const defaultOptions = {
    defaultParams: undefined,
    defaultData: undefined
  };

  return function createEndpoint(urlFactory, method = 'GET', options = defaultOptions) {
    const {defaultParams, defaultData} = options;
    const uri = typeof urlFactory === 'string' ? () => urlFactory : urlFactory;
    const behaviorSubject = new BehaviorSubject();
    const hotRequest$ = behaviorSubject.skip(1);

    const createRequest = (response, params, data) => {
      const url = uri(params, data);

      return {url, method, params, data, response};
    };

    const fetch = (params = defaultParams, data = defaultData) => {
      const url = uri(params, data);
      const response = client(url, method, params, data);
      const request = createRequest(response, params, data);

      apiRequest$.onNext(request);
      behaviorSubject.onNext(request);

      return createRequest(response, params, data)
    };

    const create$ = createObservableFactoryFn(Observable, hotRequest$, behaviorSubject, fetch);

    return {
      fetch(params, data) {
        fetch(params, data);

        return this;
      },
      request$: create$(null, true),
      response$: response$Factory(Observable, create$(null, true)),
      fetching$: fetching$Factory(Observable, create$(false, false)),
      error$: error$Factory(Observable, create$(false, false))
    }
  }
}