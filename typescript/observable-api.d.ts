import {Observable} from 'rx';

declare module 'observable-api' {

    export function create(adapter): API

    export function jQueryAdapter(client): (uri, method, params, data) => Observable<Request>

    export function axiosAdapter(client): (uri, method, params, data) => Observable<Request>

    interface Request {
        uri: string,
        method: string,
        params: Object,
        data: Object,
        response: Observable<any>
    }

    // response object structure is defined by the http client you are using jQuery/axios/etc
    interface Response extends Object {}

    // error object structure is defined by the http client you are using jQuery/axios/etc
    interface Error extends Object {}

    interface Endpoint {
        request$: Observable<Request>

        response$: Observable<Response>

        error$: Observable<Error>

        fetch(params: Object, data: Object): Endpoint
    }

    interface API {
        request$: Observable<Request>

        createEndpoint(uri: string, method: string, defaultParams: Object, defaultData: Object): Endpoint
    }
}