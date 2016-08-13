import Rx from 'rx';
import observableAPIFactory from './observable-api';
import jQuery from './adapters/jquery';

export default observableAPIFactory(Rx);

export const jQueryAdapter = jQuery;