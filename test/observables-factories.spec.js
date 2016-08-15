/* global require, describe, it, beforeEach */

import {Observable} from 'rx';
import assert from 'assert';
import sinon from 'sinon';
import {createObserver, assertCalledWith} from './utils';
import {lazyObservableFactory, error$Factory, fetching$Factory} from '../src/observable-api';

describe('Observables factories', () => {
  let observer;

  beforeEach(() => {
    observer = createObserver();
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