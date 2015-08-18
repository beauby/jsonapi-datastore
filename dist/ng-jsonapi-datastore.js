angular
  .module('beauby.jsonApiDataStore', [])
  .factory('JsonApiDataStore', function() {
    function JsonApiDataStoreModel(type, id) {
      this.id = id;
      this._type = type;
      this._attributes = [];
      this._relationships = [];
    }

    JsonApiDataStoreModel.prototype.serialize = function(opts) {
      var self = this,
        res,
        key;

      opts || (opts = {});
      opts.attributes || (opts.attributes = this._attributes);
      opts.relationships || (opts.relationships = this._relationships);

      res = {
        data: {
          type: this._type,
          id: this.id
        }
      };

      if (opts.attributes.length !== 0) res.data.attributes = {};
      if (opts.relationships.length !== 0) res.data.relationships = {};

      opts.attributes.forEach(function(key) {
        res.data.attributes[key] = self[key];
      });

      opts.relationships.forEach(function(key) {
        function relationshipIdentifier(model) {
          return {
            type: model._type,
            id: model.id
          };
        }
        if (self[key].constructor === Array) {
          res.data.relationships[key] = {
            data: self[key].map(relationshipIdentifier)
          };
        } else {
          res.data.relationships[key] = {
            data: relationshipIdentifier(self[key])
          };
        }
      });

      return res;
    };

    function JsonApiDataStore() {
      this.graph = {};
    }

    JsonApiDataStore.prototype.reset = function() {
      this.graph = {};
    };

    JsonApiDataStore.prototype.find = function(type, id) {
      if (!this.graph[type] || !this.graph[type][id]) return null;
      return this.graph[type][id];
    };

    JsonApiDataStore.prototype.destroy = function(model) {
      delete this.graph[model._type][model.id];
    };

    JsonApiDataStore.prototype.initModel = function(type, id) {
      this.graph[type] || (this.graph[type] = {});
      this.graph[type][id] || (this.graph[type][id] = new JsonApiDataStoreModel(type, id));

      return this.graph[type][id];
    };

    JsonApiDataStore.prototype.syncRecord = function(rec) {
      var self = this,
        model = this.initModel(rec.type, rec.id),
        key;

      function findOrInit(resource) {
        if (!self.find(resource.type, resource.id)) {
          var placeHolderModel = self.initModel(resource.type, resource.id);
          placeHolderModel._placeHolder = true;
        }
        return self.graph[resource.type][resource.id];
      }

      delete model._placeHolder;

      for (key in rec.attributes) {
        model._attributes.push(key);
        model[key] = rec.attributes[key];
      }

      if (rec.relationships) {
        for (key in rec.relationships) {
          var rel = rec.relationships[key];
          if (rel.data !== undefined) {
            model._relationships.push(key);
            if (rel.data === null) {
              model[key] = null;
            } else if (rel.data.constructor === Array) {
              model[key] = rel.data.map(findOrInit);
            } else {
              model[key] = findOrInit(rel.data);
            }
          }
          if (rel.links) {
            console.log("Warning: Links not implemented yet.");
          }
        }
      }

      return model;
    };

    JsonApiDataStore.prototype.sync = function(data) {
      var self = this;

      function sync(data) {
        if (!data) return null;
        if (data.constructor === Array) {
          return data.map(self.syncRecord.bind(self));
        } else {
          return self.syncRecord(data);
        }
      };
      sync(data.included);
      return sync(data.data);
    };


    return new JsonApiDataStore();
  });