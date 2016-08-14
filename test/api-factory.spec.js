/* global require, describe, it, beforeEach */

import {Observable} from 'rx';
import assert from 'assert';
import sinon from 'sinon';
import {createObserver, assertCalledWith} from './utils';
import apiFactory from '../src/index';
import {lazyObservableFactory, error$Factory, fetching$Factory} from '../src/observable-api';

describe('API', () => {
  let observer, client, api;

  beforeEach(() => {
    observer = createObserver();
    client = sinon.stub();
    api = apiFactory(client);
  });

  it('has property request$: Observable', () => {
    assert(
      api.request$ instanceof Observable
    );
  });

  it('has method createEndpoint()', () => {
    assert.equal(
      typeof api.createEndpoint,
      'function',
      'api does not have createEndpoint function'
    );
  });

  describe('Endpoint', () => {
    const URI = 'uri';
    const METHOD = 'method';
    let endpoint;

    beforeEach(() => {
      endpoint = api.createEndpoint(URI, METHOD);
    });

    it('has property request$: Observable', () => {
      assert(
        api.request$ instanceof Observable
      );
    });

    it('has property response$: Observable', () => {
      assert(
        endpoint.response$ instanceof Observable
      );
    });

    it('has property fetching$: Observable', () => {
      assert(
        endpoint.fetching$ instanceof Observable
      );
    });

    it('has method fetch()', () => {
      assert(
        typeof endpoint.fetch === 'function'
      );
    });

    describe('provided URI is function', () => {
      it('calls URI function with params, data', () => {
        const urlFactory = sinon.spy();
        endpoint = api.createEndpoint(urlFactory, METHOD, 'params', 'data');

        endpoint.fetch('params', 'data');

        assertCalledWith(
          urlFactory,
          ['params', 'data']
        )
      });

      it('defaultParams & defaultData is used', () => {
        const urlFactory = sinon.spy();
        endpoint = api.createEndpoint(urlFactory, METHOD, 'params', 'data');

        endpoint.fetch();

        assertCalledWith(
          urlFactory,
          ['params', 'data']
        )
      });

      it('return value is api url', () => {
        const urlFactory = sinon.stub().returns('new_url');

        endpoint = api.createEndpoint(urlFactory, METHOD);

        endpoint.request$.subscribe(observer);

        assertCalledWith(
          observer.onNext,
          [{
            url: 'new_url',
            method: METHOD,
            params: undefined,
            data: undefined,
            response: undefined
          }]
        );
      });


    });

    describe('fetch(params, data)', () => {
      it('calls XHR client with url, method, params, data', () => {
        endpoint.fetch('params', 'data');

        assert(
          client.calledWith('uri', 'method', 'params', 'data')
        );
      });

      it('always forces new request', () => {
        endpoint.request$.subscribe(observer);

        endpoint.fetch();

        assert.equal(client.callCount, 2);

      });
    });

    describe('request$', () => {

      describe('first subscription', () => {

        it('invokes fetch(defaultParam, defaultData)', () => {
          endpoint.request$.subscribe(observer);

          assert(
            client.called
          );
        });

      });

      describe('later subscriptions', () => {

        it('does not invoke fetch()', () => {
          endpoint.request$.subscribe(() => {});
          endpoint.request$.subscribe(() => {});

          assert(
            client.callCount === 1
          );
        });

      });

      describe('subscribers count 1 => 0 => 1', () => {

        it('does not calls fetch() again', () => {
          endpoint.request$.take(1).subscribe(() => {});
          endpoint.request$.subscribe(() => {});

          assert.equal(client.callCount, 1);
        });

        it('new observer receives latest request', () => {
          client.returns('response');

          endpoint.request$.take(1).subscribe(() => {});
          endpoint.request$.subscribe(observer);

          assert.equal(
            observer.onNext.firstCall.args[0].response,
            'response'
          );
        });

      });

      it('error should not terminate request$', done => {
        const errorsObserver = createObserver();

        client.returns(Observable.throw('error'));

        endpoint.response$.subscribe(observer);
        endpoint.error$.subscribe(errorsObserver);

        setTimeout(() => {
          assert.equal(observer.onError.callCount, 0);
          assert.equal(errorsObserver.onNext.callCount, 1);
          done();
        }, 10);
      });

      describe('observer', () => {

        it('receives request: {url, method, params, data, response}', () => {
          client.returns('response');

          endpoint.request$.subscribe(observer);

          assertCalledWith(
            observer.onNext,
            [{
              url: URI,
              method: METHOD,
              params: undefined,
              data: undefined,
              response: 'response'
            }]
          );
        });

      });

    });

    describe('response$', () => {

      describe('observer', () => {

        it('invokes request if it\'s first', () => {
          endpoint.response$.subscribe(observer);

          assert(
            client.called
          );
        });

        it('receives response onNext', () => {
          client.returns(Observable.of('response'));

          endpoint.response$.subscribe(observer);

          assertCalledWith(
            observer.onNext,
            ['response']
          );
        });

        it('receives only latest request response', done => {
          const slowResponse = Observable.of('first request').delay(20);
          const fastResponse = Observable.of('later request');

          client.onCall(0).returns(slowResponse);
          client.onCall(1).returns(fastResponse);

          endpoint.response$.subscribe(observer);

          endpoint.fetch();

          setTimeout(() => {
            assert.equal(observer.onNext.callCount, 1);
            assert.equal(observer.onNext.calledWith('later request'), true);
            done();
          }, 30);
        });

        it('does not receive errors', () => {
          client.returns(Observable.throw('error'));

          endpoint.response$.subscribe(observer);

          assert(
            !observer.onNext.called
          );
        });
      });
    });

    describe('fetching$', () => {

      describe('observer', () => {

        it('invokes request if it\'s first', () => {
          endpoint.fetching$.subscribe(observer);

          assert(
            client.called
          );
        });

        it('receives bool onNext', () => {
          client.returns(Observable.of('response'));

          endpoint.fetching$.subscribe(observer);

          assertCalledWith(
            observer.onNext,
            [true]
          );
        });
      });
    });
  });

  describe('private methods', () => {

    describe('lazyObservableFactory', () => {

      it('should call fetch if there was no request before', () => {
        const behaviorSubject = {
          value: undefined,
          onNext: sinon.spy()
        };
        const fetch = sinon.stub().returns('req');
        const observable = lazyObservableFactory(Observable, behaviorSubject, fetch);

        observable.subscribe(observer);

        assert.equal(fetch.called, true);
        assert.equal(behaviorSubject.onNext.calledWith('req'), true);

        assert.equal(observer.onNext.called, false);
        assert.equal(observer.onError.called, false);
        assert.equal(observer.onCompleted.called, true);
      });

    });

    describe('error$Factory', () => {

      it('should skip next values', () => {
        const request$ = Observable.of('request1', 'req2');
        const error$ = error$Factory(Observable, request$);

        error$.subscribe(observer);

        assert.equal(observer.onNext.called, false);
      });

      it('should onNext latest errors', () => {
        const request$ = Observable.of(
          {response: Observable.throw('error')}
        );
        const error$ = error$Factory(Observable, request$);

        error$.subscribe(observer);

        assert.equal(observer.onNext.callCount, 1);

        assertCalledWith(
          observer.onNext,
          ['error']
        );
      });

      it('should not terminate on error', () => {
        const request$ = Observable.of(
          {response: Observable.throw('error1')},
          {response: Observable.throw('error2')}
        );
        const error$ = error$Factory(Observable, request$);

        error$.subscribe(observer);

        assert.equal(
          observer.onNext.callCount,
          2,
          'onNext was not called 2 times!'
        );

        assertCalledWith(observer.onNext, ['error1'], 0);
        assertCalledWith(observer.onNext, ['error2'], 1);
      });
    });

    describe('error$Factory', () => {

      it('should skip next values', () => {
        const request$ = Observable.of('request1', 'req2');
        const error$ = error$Factory(Observable, request$);

        error$.subscribe(observer);

        assert.equal(observer.onNext.called, false);
      });

      it('should onNext latest errors', () => {
        const request$ = Observable.of(
          {response: Observable.throw('error')}
        );
        const error$ = error$Factory(Observable, request$);

        error$.subscribe(observer);

        assert.equal(observer.onNext.callCount, 1);

        assertCalledWith(
          observer.onNext,
          ['error']
        );
      });

      it('should not terminate on error', () => {
        const request$ = Observable.of(
          {response: Observable.throw('error1')},
          {response: Observable.throw('error2')}
        );
        const error$ = error$Factory(Observable, request$);

        error$.subscribe(observer);

        assert.equal(
          observer.onNext.callCount,
          2,
          'onNext was not called 2 times!'
        );

        assertCalledWith(observer.onNext, ['error1'], 0);
        assertCalledWith(observer.onNext, ['error2'], 1);
      });
    });


    describe('fetching$Factory', () => {

      it('Should return true when new request is received', () => {
        const response = Observable.never();
        const request$ = Observable.of({response});

        const fetching$ = fetching$Factory(Observable, request$);

        fetching$.subscribe(observer);

        assert.equal(observer.onNext.calledWith(true), true);
        assert.equal(observer.onCompleted.called, false);
        assert.equal(observer.onError.called, false);
      });

      it('Should return false when request response is OK', () => {
        const response = Observable.of('response');
        const request$ = Observable.of({response});

        const fetching$ = fetching$Factory(Observable, request$);

        fetching$.subscribe(observer);

        assert.equal(observer.onNext.getCall(0).calledWith(true), true);
        assert.equal(observer.onNext.getCall(1).calledWith(false), true);
      });

      it('Should return false when response is error', () => {
        const response = Observable.throw('error');
        const request$ = Observable.of({response});

        const fetching$ = fetching$Factory(Observable, request$);

        fetching$.subscribe(observer);

        assert.equal(observer.onNext.getCall(0).calledWith(true), true);
        assert.equal(observer.onNext.getCall(1).calledWith(false), true);
      });

      it('should onNext only when status changed', () => {
        const request$ = Observable.of(
          {response: Observable.never()},
          {response: Observable.of('response')}
        );

        const fetching$ = fetching$Factory(Observable, request$);

        fetching$.subscribe(observer);

        assert.equal(observer.onNext.callCount, 2);
      });
    });

  });
});