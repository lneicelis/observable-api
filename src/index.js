import Rx from 'rx';
import observableAPIFactory from './observable-api';
import jQueryAdapterFactory from './adapters/jquery';
import axiosAdapterFactory from './adapters/axios';

const createObservableAPI = observableAPIFactory(Rx);

export default createObservableAPI;

export const createAPI = createObservableAPI;

export const jQueryAdapter = jQueryAdapterFactory(Rx.Observable);

export const axiosAdapter = axiosAdapterFactory(Rx.Observable);