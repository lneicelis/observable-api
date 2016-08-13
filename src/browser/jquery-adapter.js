import jQueryAdapterFactory from '../adapters/jquery';

if (typeof window !== 'undefined') {
  if (!window.Rx) {
    throw new Error('Rx library must be included before jQuery adapter!')
  }

  window.ObservableAPI = window.ObservableAPI || {};
  window.ObservableAPI.jQueryAdapter =  jQueryAdapterFactory(window.Rx.Observable);
}