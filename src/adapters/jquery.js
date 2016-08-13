import {Observable} from 'rx';

export default function jQueryAdapter(jQuery, options = {}) {
  return function client(uri, method, params, data) {
    options.url = uri;
    options.method = method;
    options.params = params;
    options.data = data;

    const response = jQuery.ajax(options);

    return Observable.fromPromise(response);
  }
}