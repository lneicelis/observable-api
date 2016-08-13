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

function endpointFactory(Observable, BehaviorSubject, apiRequest$, client) {
  return function createEndpoint(uri, method, defaultParams, defaultData) {
    const subject = new BehaviorSubject();

    const lazyObservable = lazyObservableFactory(
      Observable,
      subject,
      () => fetch(defaultParams, defaultData)
    );

    const createRequest = (response, params = null, data = null) => {
      return {uri, method, params, data, response};
    };

    const fetch = (params = defaultParams, data = defaultData) => {
      const response = client(uri, method, params, data);

      return createRequest(response, params, data)
    };

    const request$ = Observable
      .merge(
        // Skipping initial value of behavior subject
        subject.skip(1),
        // subscribing to lazy observable when subscriptions goes 0 to 1
        lazyObservable
      )
      // Pushing new request to global api request observable
      .do(apiRequest$.onNext.bind(apiRequest$));

    return {
      fetch(params, data) {
        subject.onNext(fetch(params, data));

        return this;
      },
      request$: request$,
      response$: response$Factory(Observable, request$),
      error$: error$Factory(Observable, request$)

    }
  }
}