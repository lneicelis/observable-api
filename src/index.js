import Rx from 'rx';
import observableAPIFactory from './observable-api';
import jQuery from './adapters/jquery';

const createObservableAPI = observableAPIFactory(Rx);

export default createObservableAPI;

export const createAPI = createObservableAPI;

export const jQueryAdapter = jQuery;