/* global require, describe, it, beforeEach */

import {Observable} from 'rx';
import assert from 'assert';
import sinon from 'sinon';
import {createObserver, assertCalledWith} from '../utils';
import axiosAdapterFactory from '../../src/adapters/axios';

describe('axiosAdapter', () => {
  let adapter, axios, client, observer;

  beforeEach(() => {
    adapter = axiosAdapterFactory(Observable);
    axios = {
      create: sinon.stub()
    };
    observer = createObserver();
  });

  it('should return createAdapterFunction', () => {
    assert(adapter instanceof Function);
  });

  it('should return client function', () => {
    const client = adapter(axios);

    assert(client instanceof Function);
  });

  it('client should return response wrapped in Observable', () => {
    const client = adapter(axios);

    axios.create.returns(Promise.resolve('response'));

    const response = client('uri', 'method', 'params', 'data');

    response.subscribe(observer);

    assertCalledWith(
      axios.create,
      [{
        url: 'uri',
        method: 'method',
        params: 'params',
        data: 'data',
      }]
    )
  });

  it('client should return response wrapped in Observable', done => {
    const client = adapter(axios);

    axios.create.returns(Promise.resolve('response'));

    const response = client('uri', 'method', 'params', 'data');

    response.subscribe(observer);

    setTimeout(() => {
      assert(observer.onNext.calledWith('response'));
      assert(observer.onCompleted.called);
      done();
    }, 10);
  });

  it('client should return error wrapped in Observable', done => {
    const client = adapter(axios);

    axios.create.returns(Promise.reject('error'));

    const response = client('uri', 'method', 'params', 'data');

    response.subscribe(observer);

    setTimeout(() => {
      assert(observer.onError.calledWith('error'));
      done();
    }, 10);
  });
});