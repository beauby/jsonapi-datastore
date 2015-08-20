(function() {
  angular
    .module('beauby.jsonApiDataStore', [])
    .factory('JsonApiDataStore', function() {
      return {
        store: new JsonApiDataStore(),
        Model: JsonApiDataStoreModel
      };
    });
  <%= contents %>
})();
