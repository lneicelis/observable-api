/* global require, describe, it, beforeEach */

import Promise from 'bluebird';
import assert from 'assert';
import sinon from 'sinon';
import apiFactory, {lazyObservableFactory} from '../src/index';


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
    let client, api, endpoint;

    beforeEach(() => {
      client = sinon.stub();
      api = apiFactory(client);
      endpoint = api.createEndpoint('uri', 'method');
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

    it('should receive request on subscription to request$', () => {
      client.returns('request');

      endpoint.request$.subscribe(observer);

      assert.equal(
        observer.onNext.calledWith('request'),
        true,
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

    it('subscription to response$', done => {
      client.returns(Promise.resolve('response'));

      endpoint.response$.subscribe(res => {
        assert.equal(res, 'response');
        done();
      });
    });

    it('should not make new request after getting new subscription', () => {
      client.returns('request');

      endpoint.request$.subscribe(() => {
      });
      endpoint.request$.subscribe(() => {
      });

      assert.equal(client.callCount, 1);
    });

    it('should not make request after subscribers count 1 => 0 => 1', () => {
      client.returns('request');

      endpoint.request$.take(1).subscribe(() => {
      });
      endpoint.request$.subscribe(() => {
      });

      assert.equal(client.callCount, 1);
    });

    it('should push latest value when subscribers count 0 => 1', () => {
      client.returns('request');

      endpoint.request$.take(1).subscribe(() => {
      });
      endpoint.request$.subscribe(observer);

      assert.equal(observer.onNext.calledWith('request'), true);
    });

    it('fetch should force new request', () => {
      endpoint.request$.subscribe(observer);

      endpoint.fetch();

      assert.equal(client.callCount, 2);

    });

    it('pending response should be omitted when new request comes', done => {
      const slowResponse = Promise.resolve('first request').delay(10);
      const fastResponse = Promise.resolve('later request').delay(20);

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

      client.returns(Promise.reject('error'));

      endpoint.response$.subscribe(observer);
      endpoint.error$.subscribe(errorsObserver);

      setTimeout(() => {
        assert.equal(observer.onError.callCount, 0);
        assert.equal(errorsObserver.onNext.callCount, 1);
        done();
      }, 10);
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
});

function createObserver() {
  return {
    onNext: sinon.spy(),
    onError: sinon.spy(),
    onCompleted: sinon.spy()
  };
}