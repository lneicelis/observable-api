[![Build Status](https://travis-ci.org/luknei/observable-api.svg)](https://travis-ci.org/luknei/observable-api)
[![GitHub version](https://img.shields.io/github/tag/luknei/observable-api.svg)](https://github.com/luknei/observable-api)
[![NPM version](https://img.shields.io/npm/v/observable-api.svg)](https://www.npmjs.com/package/observable-api)

# observable-api
API client based on Observables (RxJS)

## Prerequisites

* Npm: You have to have RxJS installed if using as npm package.
* Bower & CDN: You have to have RxJS library loaded before observable-api if using as bower component or from CDN.

## Installing

Using cdn:

```html
<script src="https://npmcdn.com/observable-api/lib/dist/observable-api.js"></script>
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

### Use latest results with ease [jsbin](https://jsbin.com/kelusu/edit?html,js,output)

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
