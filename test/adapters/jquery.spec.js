/* global require, describe, it, beforeEach */

import {Observable} from '@reactivex/rxjs';
import assert from 'assert';
import sinon from 'sinon';
import {createObserver, assertCalledWith} from '../utils';
import jQueryAdapterFactory from '../../src/adapters/jquery';

describe('axiosAdapter', () => {
  let adapter, jQuery, client, observer;

  beforeEach(() => {
    adapter = jQueryAdapterFactory(Observable);
    jQuery = {
      ajax: sinon.stub()
    };
    observer = createObserver();
  });

  it('should return createAdapterFunction', () => {
    assert(adapter instanceof Function);
  });

  it('should return client function', () => {
    const client = adapter(jQuery);

    assert(client instanceof Function);
  });

  it('client should return response wrapped in Observable', () => {
    const client = adapter(jQuery);

    jQuery.ajax.returns(Promise.resolve('response'));

    const response = client('uri', 'method', 'params', 'data');

    response.subscribe(observer);

    assertCalledWith(
      jQuery.ajax,
      [{
        url: 'uri',
        method: 'method',
        params: 'params',
        data: 'data',
      }]
    )
  });

  it('client should return response wrapped in Observable', done => {
    const client = adapter(jQuery);

    jQuery.ajax.returns(Promise.resolve('response'));

    const response = client('uri', 'method', 'params', 'data');

    response.subscribe(observer);

    setTimeout(() => {
      assert(observer.next.calledWith('response'));
      assert(observer.complete.called);
      done();
    }, 10);
  });

  it('client should return error wrapped in Observable', done => {
    const client = adapter(jQuery);

    jQuery.ajax.returns(Promise.reject('error'));

    const response = client('uri', 'method', 'params', 'data');

    response.subscribe(observer);

    setTimeout(() => {
      assert(observer.error.calledWith('error'));
      done();
    }, 10);
  });
});