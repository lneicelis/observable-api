import {Observable, Subject, BehaviorSubject} from 'rx';

export default function apiFactory(client) {
  const apiRequest$ = new Subject();

  function createEndpoint(uri, method, defaultParams, defaultData) {
    const subject = new BehaviorSubject();
    const fetch = (params = defaultParams, data = defaultData) => {
      return client(uri, method, params, data);
    };
    const lazyObservable = lazyObservableFactory(
      subject,
      () => fetch(defaultParams, defaultData)
    );

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
      response$: response$Factory(request$),
      error$: error$Factory(request$)

    }
  }

  return {
    request$: apiRequest$,
    createEndpoint
  };
}

export function lazyObservableFactory(subject, fetch) {
  return Observable.create(observer => {
    subject.onNext(subject.value || fetch());
    observer.onCompleted();
  });
}

export function response$Factory(request$) {
  return request$
    .flatMapLatest(req => req.catch(() => {}))
    .filter(req => !!req);
}

export function error$Factory(request$) {
  return request$
    .flatMapLatest(req => req.then(() => {}, err => err))
    .filter(err => !!err);
}

export function createRequest(uri, method, params, data, response) {
  return {
    uri,
    method,
    params,
    data,
    response
  };
}