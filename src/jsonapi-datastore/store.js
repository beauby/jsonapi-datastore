/**
 * @class JsonApiDataStore
 */
/**
 * @method constructor
 */
function JsonApiDataStore() {
  this.graph = {};
}

/**
 * Remove a model from the store.
 * @method destroy
 * @param {object} model The model to destroy.
 */
JsonApiDataStore.prototype.destroy = function(model) {
  delete this.graph[model._type][model.id];
};

/**
 * Retrieve a model by type and id. Constant-time lookup.
 * @method find
 * @param {string} type The type of the model.
 * @param {string} id The id of the model.
 * @return {object} The corresponding model if present, and null otherwise.
 */
JsonApiDataStore.prototype.find = function(type, id) {
  if (!this.graph[type] || !this.graph[type][id]) return null;
  return this.graph[type][id];
};

/**
 * Empty the store.
 * @method reset
 */
JsonApiDataStore.prototype.reset = function() {
  this.graph = {};
};

JsonApiDataStore.prototype.initModel = function(type, id) {
  this.graph[type] = this.graph[type] || {};
  this.graph[type][id] = this.graph[type][id] || new JsonApiDataStoreModel(type, id);

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

/**
 * Sync a JSONAPI-compliant payload with the store.
 * @method sync
 * @param {object} data The JSONAPI payload
 * @return {object} The models corresponding to the primary resources of the payload.
 */
JsonApiDataStore.prototype.sync = function(data) {
  var self = this;
  function sync(data) {
    if (!data) return null;
    if (data.constructor === Array) {
      return data.map(self.syncRecord.bind(self));
    } else {
      return self.syncRecord(data);
    }
  }
  sync(data.included);
  return sync(data.data);
};
