/* global require, describe, it, beforeEach */

import {Observable, Subject, BehaviorSubject} from '@reactivex/rxjs';
import assert from 'assert';
import sinon from 'sinon';
import {createObserver, assertCalledWith} from './utils';
import {createObservableFactoryFn, error$Factory, fetching$Factory} from '../src/observable-api';

describe('Observables factories', () => {
  let observer;

  beforeEach(() => {
    observer = createObserver();
  });

  describe('createObservableFactoryFn', () => {
    let hot$, behavior$, fetch, create$;

    beforeEach(() => {
      hot$ = new Subject();
      behavior$ = new BehaviorSubject();
      fetch = sinon.stub();
      create$ = createObservableFactoryFn(Observable, hot$, behavior$, fetch);
    });

    it('returns create$ function', () => {
      assert(
        typeof create$ === 'function'
      );
    });

    describe('create$()', () => {
      it('returns observable', () => {
        assert(
          create$() instanceof Observable
        );
      });
    });

    describe('create$(true).subscribe()', () => {
      it('calls fetch()', () => {
        create$(true).subscribe(observer);

        assert(
          fetch.called
        );
      });

      it('is merged with hot$', () => {
        create$(true).subscribe(observer);

        hot$.next('val');

        assert(
          fetch.called
        );
      });
    });

    describe('create$().subscribe()', () => {
      it('calls fetch() if not behavior$ does not have value', () => {
        create$().subscribe(observer);

        assert(
          fetch.called
        );
      });

      it('does not call fetch() if behavior$ has value', () => {
        behavior$.next('val');

        create$().subscribe(observer);

        assert(
          !fetch.called
        );
      });
    });

    describe('create$(false).subscribe()', () => {
      it('does not call fetch() if behavior$ has value', () => {
        create$(false).subscribe(observer);

        assert(
          !fetch.called
        );
      });

      it('does not call fetch() if behavior$ has value', () => {
        behavior$.next('val');

        create$(false).subscribe(observer);

        assert(
          !fetch.called
        );
      });
    });

    // TODO: test case with initial value = true/false
    describe('create$(false, true).subscribe()', () => {

      describe('previous value exists', () => {
        it('calls observer with last value', () => {
          behavior$.next('prev_val');

          create$(false, true).subscribe(observer);

          assertCalledWith(
            observer.next,
            ['prev_val']
          );
        });
      });

      describe('previous value does not exist', () => {
        it('does not call observer', () => {
          create$(false, true).subscribe(observer);

          assert(
            !observer.next.called
          );
        });
      });

    });

    describe('create$(false, false).subscribe()', () => {

      describe('previous value exists', () => {
        it('does not call observer', () => {
          behavior$.next('prev_val');

          create$(false, false).subscribe(observer);

          assert(
            !observer.next.called
          );
        });
      });

      describe('previous value does not exist', () => {
        it('does not call observer', () => {
          create$(false, false).subscribe(observer);

          assert(
            !observer.next.called
          );
        });
      });

    });

  });

  describe('error$Factory', () => {

    it('should skip next values', () => {
      const request$ = Observable.of('request1', 'req2');
      const error$ = error$Factory(Observable, request$);

      error$.subscribe(observer);

      assert.equal(observer.next.called, false);
    });

    it('should onNext latest errors', () => {
      const request$ = Observable.of(
        {response: Observable.throw('error')}
      );
      const error$ = error$Factory(Observable, request$);

      error$.subscribe(observer);

      assert.equal(observer.next.callCount, 1);

      assertCalledWith(
        observer.next,
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
        observer.next.callCount,
        2,
        'onNext was not called 2 times!'
      );

      assertCalledWith(observer.next, ['error1'], 0);
      assertCalledWith(observer.next, ['error2'], 1);
    });
  });

  describe('error$Factory', () => {

    it('should skip next values', () => {
      const request$ = Observable.of('request1', 'req2');
      const error$ = error$Factory(Observable, request$);

      error$.subscribe(observer);

      assert.equal(observer.next.called, false);
    });

    it('should onNext latest errors', () => {
      const request$ = Observable.of(
        {response: Observable.throw('error')}
      );
      const error$ = error$Factory(Observable, request$);

      error$.subscribe(observer);

      assert.equal(observer.next.callCount, 1);

      assertCalledWith(
        observer.next,
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
        observer.next.callCount,
        2,
        'onNext was not called 2 times!'
      );

      assertCalledWith(observer.next, ['error1'], 0);
      assertCalledWith(observer.next, ['error2'], 1);
    });
  });


  describe('fetching$Factory', () => {

    it('Should return true when new request is received', () => {
      const response = Observable.never();
      const request$ = Observable.of({response});

      const fetching$ = fetching$Factory(Observable, request$);

      fetching$.subscribe(observer);

      assert.equal(observer.next.calledWith(true), true);
      assert.equal(observer.complete.called, false);
      assert.equal(observer.error.called, false);
    });

    it('Should return false when request response is OK', () => {
      const response = Observable.of('response');
      const request$ = Observable.of({response});

      const fetching$ = fetching$Factory(Observable, request$);

      fetching$.subscribe(observer);

      assert.equal(observer.next.getCall(0).calledWith(true), true);
      assert.equal(observer.next.getCall(1).calledWith(false), true);
    });

    it('Should return false when response is error', () => {
      const response = Observable.throw('error');
      const request$ = Observable.of({response});

      const fetching$ = fetching$Factory(Observable, request$);

      fetching$.subscribe(observer);

      assert.equal(observer.next.getCall(0).calledWith(true), true);
      assert.equal(observer.next.getCall(1).calledWith(false), true);
    });

    it('should onNext only when status changed', () => {
      const request$ = Observable.of(
        {response: Observable.never()},
        {response: Observable.of('response')}
      );

      const fetching$ = fetching$Factory(Observable, request$);

      fetching$.subscribe(observer);

      assert.equal(observer.next.callCount, 2);
    });
  });

});