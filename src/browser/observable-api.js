// Define globally in case AMD is not available or unused.

import observableAPIFactory from '../observable-api';

// Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
if (typeof define === 'function' && define.amd) {
  define(['rx'], function (Rx) {
    return {
      ObservableAPI: observableAPIFactory(Rx)
    };
  });
} else if (typeof window !== 'undefined') {
  if (!window.Rx) {
    throw new Error('Rx library must be included before ObservableAPI!')
  }

  window.ObservableAPI = observableAPIFactory(window.Rx);
}