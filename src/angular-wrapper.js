angular
  .module('beauby.jsonApiDataStore', [])
  .factory('JsonApiDataStore', function() {
    <%= contents %>
    return {
      store: new JsonApiDataStore(),
      Model: JsonApiDataStoreModel
    };
  });
