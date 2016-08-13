
export default function factory(Observable) {
  return function axiosAdapter(axios, options = {}) {
    return function client(uri, method, params, data) {
      options.url = uri;
      options.method = method;
      options.params = params;
      options.data = data;

      const response = axios.create(options);

      return Observable.fromPromise(response);
    };
  };
}
