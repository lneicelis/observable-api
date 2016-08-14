export default function factory(Rx) {
  const {Observable, Subject, BehaviorSubject} = Rx;

  return function (client) {
    const request$ = new Subject();
    const createEndpoint = endpointFactory(Observable, BehaviorSubject, request$, client);

    return {
      request$,
      createEndpoint
    };
  };
}

export function lazyObservableFactory(Observable, subject, fetch) {
  return Observable.create(observer => {
    subject.onNext(subject.value || fetch());
    observer.onCompleted();
  });
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
      return req.response.skipWhile(() => false).catch(err => Observable.of(err));
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

function endpointFactory(Observable, BehaviorSubject, apiRequest$, client) {
  return function createEndpoint(urlFactory, method = 'GET', defaultParams, defaultData) {
    const uri = typeof urlFactory === 'string' ? () => urlFactory : urlFactory;
    const behaviorSubject = new BehaviorSubject();
    const hotRequest$ = behaviorSubject.skip(1);

    const coldRequest$ = lazyObservableFactory(
      Observable,
      behaviorSubject,
      () => fetch(defaultParams, defaultData)
    );

    const createRequest = (response, params, data) => {
      const url = uri(params, data);

      return {url, method, params, data, response};
    };

    const fetch = (params = defaultParams, data = defaultData) => {
      const url = uri(params, data);

      const response = client(url, method, params, data);

      return createRequest(response, params, data)
    };

    const request$ = Observable
      .merge(
        hotRequest$,
        coldRequest$
      )
      // Pushing new request to global api request observable
      .do(apiRequest$.onNext.bind(apiRequest$));

    return {
      fetch(params, data) {
        behaviorSubject.onNext(fetch(params, data));

        return this;
      },
      request$: request$,
      response$: response$Factory(Observable, request$),
      fetching$: fetching$Factory(Observable, hotRequest$),
      error$: error$Factory(Observable, hotRequest$)
    }
  }
}