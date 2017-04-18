(function() {
  /**
   * @class JsonApiDataStoreModel
   */
  "use strict";

  var _createClass = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var JsonApiDataStoreModel = (function() {
    /**
     * @method constructor
     * @param {string} type The type of the model.
     * @param {string} id The id of the model.
     */

    function JsonApiDataStoreModel(type, id) {
      _classCallCheck(this, JsonApiDataStoreModel);

      this.id = id;
      this._type = type;
      this._attributes = [];
      this._relationships = [];
    }

    /**
     * @class JsonApiDataStore
     */

    /**
     * Serialize a model.
     * @method serialize
     * @param {object} opts The options for serialization.  Available properties:
     *
     *  - `{array=}` `attributes` The list of attributes to be serialized (default: all attributes).
     *  - `{array=}` `relationships` The list of relationships to be serialized (default: all relationships).
     * @return {object} JSONAPI-compliant object
     */

    _createClass(JsonApiDataStoreModel, [{
      key: "serialize",
      value: function serialize(opts) {
        var self = this,
          res = {
            data: {
              type: this._type
            }
          },
          key;

        opts = opts || {};
        opts.attributes = opts.attributes || this._attributes;
        opts.relationships = opts.relationships || this._relationships;

        if (this.id !== undefined) res.data.id = this.id;
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
          if (!self[key]) {
            res.data.relationships[key] = {
              data: null
            };
          } else if (self[key].constructor === Array) {
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
      }

      /**
       * Set/add an attribute to a model.
       * @method setAttribute
       * @param {string} attrName The name of the attribute.
       * @param {object} value The value of the attribute.
       */
    }, {
      key: "setAttribute",
      value: function setAttribute(attrName, value) {
        if (this[attrName] === undefined) this._attributes.push(attrName);
        this[attrName] = value;
      }

      /**
       * Set/add a relationships to a model.
       * @method setRelationship
       * @param {string} relName The name of the relationship.
       * @param {object} models The linked model(s).
       */
    }, {
      key: "setRelationship",
      value: function setRelationship(relName, models) {
        if (this[relName] === undefined) this._relationships.push(relName);
        this[relName] = models;
      }
    }]);

    return JsonApiDataStoreModel;
  })();

  var JsonApiDataStore = (function() {
    /**
     * @method constructor
     */

    function JsonApiDataStore() {
      _classCallCheck(this, JsonApiDataStore);

      this.graph = {};
      this.order = {};
    }

    /**
     * Remove a model from the store.
     * @method destroy
     * @param {object} model The model to destroy.
     */

    _createClass(JsonApiDataStore, [{
      key: "destroy",
      value: function destroy(model) {
        delete this.graph[model._type][model.id];
        this.order[model._type].splice(this.order[model._type].indexOf(model.id), 1);
      }

      /**
       * Retrieve a model by type and id. Constant-time lookup.
       * @method find
       * @param {string} type The type of the model.
       * @param {string} id The id of the model.
       * @return {object} The corresponding model if present, and null otherwise.
       */
    }, {
      key: "find",
      value: function find(type, id) {
        if (!this.graph[type] || !this.graph[type][id]) return null;
        return this.graph[type][id];
      }

      /**
       * Retrieve all models by type.
       * @method findAll
       * @param {string} type The type of the model.
       * @return {object} Array of the corresponding model if present, and empty array otherwise.
       */
    }, {
      key: "findAll",
      value: function findAll(type) {
        var self = this;

        if (!this.graph[type]) return [];
        return self.order[type].map(function(modelId) {
          return self.graph[type][modelId];
        });
      }

      /**
       * Empty the store.
       * @method reset
       */
    }, {
      key: "reset",
      value: function reset() {
        this.graph = {};
        this.order = {};
      }
    }, {
      key: "initModel",
      value: function initModel(type, id) {
        this.graph[type] = this.graph[type] || {};
        this.order[type] = this.order[type] || [];
        this.graph[type][id] = this.graph[type][id] || new JsonApiDataStoreModel(type, id);
        var currentOrderIndex = this.order[type].indexOf(id);
        if (currentOrderIndex === -1) {
          this.order[type].push(id);
        } else {
          // remove the id from the current order and add it to the bottom
          this.order[type].splice(currentOrderIndex, 1);
          this.order[type].push(id);
        }
        return this.graph[type][id];
      }
    }, {
      key: "syncRecord",
      value: function syncRecord(rec) {
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
          if (model._attributes.indexOf(key) === -1) {
            model._attributes.push(key);
          }
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
      }

      /**
       * Sync a JSONAPI-compliant payload with the store and return any metadata included in the payload
       * @method syncWithMeta
       * @param {object} data The JSONAPI payload
       * @return {object} The model/array of models corresponding to the payload's primary resource(s) and any metadata.
       */
    }, {
      key: "syncWithMeta",
      value: function syncWithMeta(payload) {
        var primary = payload.data,
          syncRecord = this.syncRecord.bind(this);
        if (!primary) return [];
        if (payload.included) payload.included.map(syncRecord);
        return {
          data: primary.constructor === Array ? primary.map(syncRecord) : syncRecord(primary),
          meta: "meta" in payload ? payload.meta : null
        };
      }

      /**
       * Sync a JSONAPI-compliant payload with the store.
       * @method sync
       * @param {object} data The JSONAPI payload
       * @return {object} The model/array of models corresponding to the payload's primary resource(s).
       */
    }, {
      key: "sync",
      value: function sync(payload) {
        return this.syncWithMeta(payload).data;
      }
    }]);

    return JsonApiDataStore;
  })();

  if ('undefined' !== typeof module) {
    module.exports = {
      JsonApiDataStore: JsonApiDataStore,
      JsonApiDataStoreModel: JsonApiDataStoreModel
    };
  }

  exports.JsonApiDataStore = JsonApiDataStore;
  exports.JsonApiDataStoreModel = JsonApiDataStoreModel;
})();