angular
  .module('beauby.jsonApiDataStore', [])
  .factory('JsonApiDataStore', function() {
    <%= contents %>

    return new JsonApiDataStore();
  });
