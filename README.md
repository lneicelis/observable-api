[![Build Status](https://travis-ci.org/luknei/observable-api.svg)](https://travis-ci.org/luknei/observable-api)
[![bitHound Overall Score](https://www.bithound.io/github/luknei/observable-api/badges/score.svg)](https://www.bithound.io/github/luknei/observable-api)
[![GitHub version](https://img.shields.io/github/tag/luknei/observable-api.svg)](https://github.com/luknei/observable-api)
[![NPM version](https://img.shields.io/npm/v/observable-api.svg)](https://www.npmjs.com/package/observable-api)

# Observable-API
API client based on Observables (RxJS)

* Stateless
* Well tested
* Framework agonistic
* Can use HTTP client of your choice - axios, jQuery.ajax, request, superagent, $http or any other
* App size performance penality free approach

## Problem

You can easily use observables to abstract your API yourself to take advantage of the benefits observables offers: efortless retry on error, avoiding race conditions, wide range of useful operators etc. The problem arises when multiple components needs to use the same endpoind data. In case every component of your application makes individual request to an endpoint, they end up with inconsistent data. There are few common ways keep data insync:
* Stateless way. **Push** new data to the observers/subscribers directly
  * Create Subject that receives all of the requests and share it with observers.
  * Create pub/sub that emits events with new requests.
* Stateful way. Notifying components when to **pull** data from the state
  * Build your own state machine. e.g.: AngularJS service that holds latest data from endpoint and notifies components that change occured via $rootScope.
  * Use state management libraries like Redux, Flux.

However when choosing stateless approach you still need some sort of state management involved. Common ways the endpoint data is consumed:
* Observer always wants the **new data** from the endpoint when it subscribes (new subscription will always issues new request)
* Observer want only the **latest data** from the endpoint (observer receives latest data, if it is first subscription request will be made)
* Component only wants to **observe data** comming from the endpoint without ever making a request (wants to observe only error if some occurs)

## Solution
Observable-API solves this problem in a stateless way using observables offering some nice out features of the box:
* Every endpoint has requests, responses, errors, fetching status observables
* First subscription to the requests/responses triggers http request to the endpoint
* Subsequent subscriptions will receive latest request/response
* Race conditions free
* Observable for tracking requests to all of the endpoints

## Prerequisites

* Npm: You have to have RxJS installed if using as npm package.
* Bower & CDN: You have to have RxJS library loaded before observable-api if using as bower component or from CDN.

## Installing

Using cdn:

```html
<script src="https://unpkg.com/observable-api/lib/dist/observable-api.js"></script>
```

Using npm:

```bash
$ npm install observable-api
```

Using bower:

```bash
$ bower install observable-api
```

## Example

### Creating API

```js

import {createAPI, jQueryAdapter} from 'observable-api';

const adapter = jQueryAdapter(jQuery);
const API = createAPI(adapter);

```

### Creating API endpoint

```js

const usersEndpoint = API.createEndpoint('/users', 'GET');

```

### Selecting data from endpoint

```js

const users$ = usersEndpoint.response$.map(res => res.data);

```

### Making requests and using the data

```js

// Request to the endpoint is made on the first subscription
users$.subscribe(users => {
  console.log(users);
});

// Subsequent subscriptions will use data from the latest request
users$.subscribe(users => {
  console.log(users);
});

// To force new request to the endpoint
usersEndpoint.fetch();

// Fetch can receive optional parameters and data
usersEndpoint.fetch(params, data); // returns usersEndpoint instance

```

### Combining the data [jsbin](https://jsbin.com/xasiduf/edit?html,js,console)

```js

// Using jQuery.ajax for making XHR requests
const adapter = ObservableAPI.jQueryAdapter(jQuery);
const api = ObservableAPI.create(adapter)
// Fake data base url
const baseURL = 'https://jsonplaceholder.typicode.com';

// Creating endpoints
const postsEndpoint = api.createEndpoint(`${baseURL}/posts`, 'GET');
const posts$ = postsEndpoint.response$;

const usersEndpoint = api.createEndpoint(`${baseURL}/users`, 'GET');
const users$ = usersEndpoint.response$;

// Creating custom data selectors
const usersById$ = users$.scan((byId, users) => {
  users.forEach(user => byId[user.id] = user);
  
  return byId;
}, {});

const postsWithUsers$ = Rx.Observable.combineLatest(
  usersById$,
  posts$,
  (usersById, posts) => {
    return posts.map(post => Object.assign({}, post, {
      user: usersById[post.userId]
    }));
  }
);

// Printing the result
postsWithUsers$.subscribe(posts => {
  console.log(posts[0]);
});

```

### Use latest results & fetching/loading indication [jsbin](https://jsbin.com/qugokav/edit?html,js,output)

```js

// Using jQuery.ajax for making XHR requests
const adapter = ObservableAPI.jQueryAdapter(jQuery, {
  dataType: 'jsonp',
  jsonp: 'callback'
});
const api = ObservableAPI.create(adapter);

// creating endpoint
const endpointURL = ({term}) => `https://en.wikipedia.org/w/api.php?action=opensearch&search=${term}&limit=3`;

// Creating endpoints
const searchEndpoint = api.createEndpoint(endpointURL, 'POST');
const searchResuls$ = searchEndpoint.response$;
const search = term => searchEndpoint.fetch({term});

const term$ = Rx.Observable
  .fromEvent(document.querySelector('#search-input'), 'keyup')
  .map(event => event.target.value)
  .debounce(250)
  .filter(term => term.length > 2)
  .do(search);

searchEndpoint.fetching$
  .subscribe(fetching => {
    if (fetching)
      $('#search-results').css({opacity: 0.3});
    else
      $('#search-results').css({opacity: 1});
  });

term$
  .flatMap(() => searchResuls$)
  .subscribe(displayResults);
  
function displayResults([term, suggestions, descriptions, links]) {
	const $results = $('#search-results').empty();

  $nodes = Rx.Observable
  	.zip(
      Rx.Observable.from(suggestions),
      Rx.Observable.from(descriptions),
      Rx.Observable.from(links),
      (sugg, desc, link) => $(`<ul><a href="${link}">${sugg}</a><p>${desc}</p></ul>`)
  	)
    .subscribe($node => $results.append($node))
}

```

## [API reference](https://github.com/luknei/observable-api/blob/master/typescript/observable-api.d.ts)
