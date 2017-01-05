import {Observable} from "@reactivex/rxjs";

declare module 'observable-api' {

    export function createAPI(adapter): API

    export function jQueryAdapter(client): (urlFactory, method, params, data) => Observable<Request>

    export function axiosAdapter(client): (urlFactory, method, params, data) => Observable<Request>

    interface Request {
        url: string,
        method: string,
        params?: Object,
        data?: Object,
        response?: Observable<any>
    }

    // response object structure is defined by the http client you are using jQuery/axios/etc
    interface Response extends Object {}

    // error object structure is defined by the http client you are using jQuery/axios/etc
    interface Error extends Object {}

    interface Endpoint {
        request$: Observable<Request>

        response$: Observable<Response>

        error$: Observable<Error>

        fetching$: Observable<boolean>

        fetch(params?: Object, data?: Object): Endpoint
    }

    interface API {
        request$: Observable<Request>

        createEndpoint(uri: string, method: string, defaultParams?: Object, defaultData?: Object): Endpoint
    }
}