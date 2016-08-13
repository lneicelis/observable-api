import axiosAdapterFactory from '../adapters/axios';

if (typeof window !== 'undefined') {
  if (!window.Rx) {
    throw new Error('Rx library must be included before axios adapter!')
  }

  window.ObservableAPI = window.ObservableAPI || {};
  window.ObservableAPI.axiosAdapter =  axiosAdapterFactory(window.Rx.Observable);
}