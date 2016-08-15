/* global require, describe, it, beforeEach */

import {Observable} from 'rx';
import assert from 'assert';
import sinon from 'sinon';
import {createObserver, assertCalledWith} from './utils';
import {createAPI} from '../src/index';

describe('API', () => {
  let observer, client, api;

  beforeEach(() => {
    observer = createObserver();
    client = sinon.stub();
    api = createAPI(client);
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
        endpoint = api.createEndpoint(urlFactory, METHOD, {
          defaultParams: 'params',
          defaultData: 'data'
        });

        endpoint.fetch('params', 'data');

        assertCalledWith(
          urlFactory,
          ['params', 'data']
        )
      });

      it('defaultParams & defaultData is used', () => {
        const urlFactory = sinon.spy();
        endpoint = api.createEndpoint(urlFactory, METHOD, {
          defaultParams: 'params',
          defaultData: 'data'
        });

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

          assert(
             client.callCount === 1
          );

          assert.equal(
            observer.onNext.firstCall.args[0].response,
            'response'
          );
        });

      });

      it('error should not terminate request$', done => {
        const errorsObserver = createObserver();

        client.returns(Observable.throw('error'));

        endpoint.error$.subscribe(errorsObserver);
        endpoint.response$.subscribe(observer);

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

    describe('error$', () => {

      describe('observer', () => {

        it('does not invoke new request', () => {
          endpoint.error$.subscribe(observer);

          assert(
            !client.called
          );
        });

        it('receives error onNext', () => {
          client.returns(Observable.throw('error'));

          endpoint.error$.subscribe(observer);

          endpoint.fetch();

          assertCalledWith(
            observer.onNext,
            ['error']
          );
        });

      });

    });

    describe('fetching$', () => {

      describe('observer', () => {

        it('does not invoke request', () => {
          endpoint.fetching$.subscribe(observer);

          assert(
            !client.called
          );
        });

        it('receives bool onNext', () => {
          client.returns(Observable.of('response'));

          endpoint.fetching$.subscribe(observer);

          endpoint.fetch();

          assertCalledWith(
            observer.onNext,
            [true]
          );
        });

      })

    });

  });
});