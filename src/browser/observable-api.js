// Define globally in case AMD is not available or unused.

import observableAPIFactory from '../observable-api';

if (typeof window !== 'undefined') {
  if (!window.Rx) {
    throw new Error('Rx library must be included before ObservableAPI!')
  }

  window.ObservableAPI = window.ObservableAPI || {};
  window.ObservableAPI.create =  observableAPIFactory(window.Rx);
}