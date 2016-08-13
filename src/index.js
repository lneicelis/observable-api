import {Observable, Subject, BehaviorSubject} from 'rx';

export default function apiFactory(client) {
  const apiRequest$ = new Subject();

  function createEndpoint(uri, method, defaultParams, defaultData) {
    const subject = new BehaviorSubject();
    
    const lazyObservable = lazyObservableFactory(
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
    .flatMapLatest(req => {
      return req.response.catch(() => Observable.never())
    });
}

export function error$Factory(request$) {
  return request$
    .flatMapLatest(req => {
      return req.response.skipWhile(() => false).catch(err => Observable.of(err));
    });
}