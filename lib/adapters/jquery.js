"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = factory;
function factory(Observable) {
  return function jQueryAdapter(jQuery) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return function client(uri, method, params, data) {
      options.url = uri;
      options.method = method;
      options.params = params;
      options.data = data;

      var response = jQuery.ajax(options);

      return Observable.fromPromise(response);
    };
  };
}