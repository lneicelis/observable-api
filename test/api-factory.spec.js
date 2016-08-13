/* global require, describe, it, beforeEach */

import {Observable} from 'rx';
import assert from 'assert';
import sinon from 'sinon';
import apiFactory, {lazyObservableFactory, error$Factory} from '../src/observable-api';

describe('apiFactory', () => {
  let observer;

  beforeEach(() => {
    observer = createObserver();
  });

  it('should have createEndpoint method', () => {
    const api = apiFactory(() => {
    });

    assert.equal(
      typeof api.createEndpoint,
      'function',
      'api does not have createEndpoint function'
    );
  });

  it('should have request$property which is Observable', () => {
    const api = apiFactory(() => {
    });

    assert.equal(
      typeof api.request$.subscribe,
      'function',
      'api does not have request$ observable'
    );
  });

  describe('createEndpoint', () => {
    const URI = 'uri';
    const METHOD = 'method';
    let client, api, endpoint;

    beforeEach(() => {
      client = sinon.stub();
      api = apiFactory(client);
      endpoint = api.createEndpoint(URI, METHOD);
    });

    it('should have fetch method', () => {
      assert.equal(
        typeof endpoint.fetch,
        'function',
        'endpoint does not have fetch method'
      )
    });

    it('should have request$ observable', () => {
      assert.equal(
        typeof endpoint.request$.subscribe,
        'function',
        'endpoint does not have fetch method'
      )
    });

    it('should have response$ observable', () => {
      assert.equal(
        typeof endpoint.request$.subscribe,
        'function',
        'endpoint does not have fetch method'
      )
    });

    it('fetch method should call XHR client', () => {
      endpoint.fetch('params', 'data');

      assert.equal(
        client.calledWith('uri', 'method', 'params', 'data'),
        true,
        'XHR client was called with wrong params'
      )
    });

    it('request$ subscription should invoke request', () => {
      endpoint.request$.subscribe(observer);

      assert.equal(
        client.called,
        true,
        'subscription to request$ did not invoke request'
      )
    });

    it('request object should contain uri, method, params, data & response', () => {
      client.returns('response');

      endpoint.request$.subscribe(observer);

      assertCalledWith(
        observer.onNext,
        [{
          uri: URI,
          method: METHOD,
          params: null,
          data: null,
          response: 'response'
        }]
      );
    });

    it('should receive request on subscription to request$', () => {
      client.returns('response');

      endpoint.request$.subscribe(observer);
      
      assert.equal(
        observer.onNext.firstCall.args[0].response,
        'response',
        'observer did not received request after subscription'
      )
    });

    it('subscription to response$', done => {
      client.returns(Promise.resolve('response'));

      endpoint.response$.subscribe(res => {
        assert.equal(res, 'response');
        done();
      });
    });

    it('should not make new request after getting new subscription', () => {
      endpoint.request$.subscribe(() => {
      });
      endpoint.request$.subscribe(() => {
      });

      assert.equal(client.callCount, 1);
    });

    it('should not make request after subscribers count 1 => 0 => 1', () => {
      endpoint.request$.take(1).subscribe(() => {});
      endpoint.request$.subscribe(() => {});

      assert.equal(client.callCount, 1);
    });

    it('should push latest value when subscribers count 0 => 1', () => {
      client.returns('response');

      endpoint.request$.take(1).subscribe(() => {});
      endpoint.request$.subscribe(observer);

      assert.equal(
        observer.onNext.firstCall.args[0].response,
        'response'
      );
    });

    it('fetch should force new request', () => {
      endpoint.request$.subscribe(observer);

      endpoint.fetch();

      assert.equal(client.callCount, 2);

    });

    it('pending response should be omitted when new request comes', done => {
      const slowResponse = Observable.of('first request').delay(10);
      const fastResponse = Observable.of('later request').delay(20);

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

    it('should handle observable returned from a client', () => {
      client.returns(Observable.of('res'));

      endpoint.response$.subscribe(observer);

      assert.equal(observer.onNext.calledWith('res'), 1);
    });

    it('prev not completed response should be disposed', done => {
      const response = Observable.create(() => done);

      client.onCall(0).returns(response);
      client.onCall(1).returns(Observable.of('later'));

      endpoint.response$.subscribe(observer);

      endpoint.fetch();
    });
  });

  describe('lazyObservableFactory', () => {
    it('should call fetch if there was no request before', () => {
      const behaviorSubject = {
        value: undefined,
        onNext: sinon.spy()
      };
      const fetch = sinon.stub().returns('req');
      const observable = lazyObservableFactory(behaviorSubject, fetch);

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
      const error$ = error$Factory(request$);

      error$.subscribe(observer);

      assert.equal(observer.onNext.called, false);
    });

    it('should onNext latest errors', () => {
      const request$ = Observable.of(
        {response: Observable.throw('error')}
      );
      const error$ = error$Factory(request$);

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
      const error$ = error$Factory(request$);

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
});

function createObserver() {
  return {
    onNext: sinon.spy(),
    onError: sinon.spy(),
    onCompleted: sinon.spy()
  };
}

function assertCalledWith(spy, expectedArgs, callIndex = 0) {
  assert.deepEqual(
    spy.getCall(callIndex).args,
    expectedArgs,
    'Observer first call was with wrong params!'
  );
}