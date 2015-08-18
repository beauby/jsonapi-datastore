# jsonapi-datastore
[![Build Status](https://travis-ci.org/beauby/jsonapi-datastore.svg)](https://travis-ci.org/beauby/jsonapi-datastore)

JavaScript client-side [JSON API](http://jsonapi.org) data handling made easy.

Current version is v0.1.1-alpha. It is still a work in progress, but should do what it says.

## Installing

Install jsonapi-datastore by running:
```
$ bower install jsonapi-datastore
```

## Parsing data

Just call the `.sync()` method of your store.
```javascript
var store = new JsonApiDataStore();
store.sync(data);
```
This parses the data and incorporates it in the store, taking care of already existing records (by updating them) and relationships.

## Retrieving models

Just call the `.find(type, id)` method of your store.
```javascript
var article = store.find('article', 123);
```
All the attributes *and* relationships are accessible through the model as object properties.
```javascript
console.log(article.author.name);
```
In case a related resource has not been fetched yet (either as a primary resource or as an included resource), the corresponding property on the model will contain only the `type` and `id` (and the `._placeHolder` property will be set to `true`). However, the models are *updated in place*, so you can fetch a related resource later, and your data will remain consistent.

## Serializing data

Just call the `.serialize()` method on the model.
```javascript
console.log(article.serialize());
```

## Examples

Starting by creating a store:
```javascript
var store = new JsonApiDataStore();
```
and given the following payload, containing two `articles`, with a related `user` who is the author of both:
```javascript
var payload = {
  data: [{
    type: 'article',
    id: 1337,
    attributes: {
      title: 'Cool article'
    },
    relationships: {
      author: {
        data: {
          type: 'user',
          id: 1
        }
      }
    }
  }, {
    type: 'article',
    id: 300,
    attributes: {
      title: 'Even cooler article'
    },
    relationships: {
      author: {
        data: {
          type: 'user',
          id: 1
        }
      }
    }
  }]
};
```
we can sync it:
```javascript
var articles = store.sync(payload);
```
which will return the list of synced articles.

Later, we can retrieve one of those:
```javascript
var article = store.find('article', 1337);
```
If the author resource has not been synced yet, we can only access its id:
```javascript
console.log(article.author);
// { id: 1 }
```
If we do sync the author resource later:
```javascript
var authorPayload = {
  data: {
    type: 'user',
    id: 1,
    attributes: {
      name: 'Lucas'
    }
  }
};

store.sync(authorPayload);
```
we can then access the author's name through our old `article` reference:
```javascript
console.log(article.author.name);
// 'Lucas'
```
We can also serialize any whole model in a JSONAPI-compliant way:
```javascript
console.log(article.serialize());
// ...
```
or just a subset of its attributes/relationships:
```javascript
console.log(article.serialize({ attributes: ['title'], relationships: []}));
// ...
```

## API

`JsonApiDataStoreModel`
- `.serialize(opts)`: serialize a model

`JsonApiDataStore`
- `.sync(payload)`: syncs the models described by the payload with the store, and returns the synched models
- `.find(type, id)`: retrieve a model by `type` and `id`
- `.destroy(model)`: remove a model from the store
- `.reset()`: empties the store

## What's missing

Currently, the store does not handle `links` and `meta` attributes.

## Notes

### AngularJS

In order to use jsonapi-datastore inside an AngularJS project, simply require the plugin in your `index.html` and then make a factory:
```javascript
angular
  .module('myApp')
  .factory('JsonApiDataStore', function() {
    return new JsonApiDataStore();
  });
```

## Contributing

All pull-requests welcome!
