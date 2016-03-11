/**
 * @class JsonApiDataStoreModel
 */
 class JsonApiDataStoreModel {
  /**
   * @method constructor
   * @param {string} type The type of the model.
   * @param {string} id The id of the model.
   */
  constructor(type, id) {
    this.id = id;
    this._type = type;
    this._attributes = [];
    this._relationships = [];
  }

  /**
   * Serialize a model.
   * @method serialize
   * @param {object} opts The options for serialization.  Available properties:
   *
   *  - `{array=}` `attributes` The list of attributes to be serialized (default: all attributes).
   *  - `{array=}` `relationships` The list of relationships to be serialized (default: all relationships).
   * @return {object} JSONAPI-compliant object
   */
  serialize(opts) {
    var self = this,
        res = { data: { type: this._type } },
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
        return { type: model._type, id: model.id };
      }
      if (!self[key]) {
        res.data.relationships[key] = { data: null };
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
  setAttribute(attrName, value) {
    if (this[attrName] === undefined) this._attributes.push(attrName);
    this[attrName] = value;
  }

  /**
   * Set/add a relationships to a model.
   * @method setRelationship
   * @param {string} relName The name of the relationship.
   * @param {object} models The linked model(s).
   */
  setRelationship(relName, models) {
    if (this[relName] === undefined) this._relationships.push(relName);
    this[relName] = models;
  }
}

/**
 * @class JsonApiDataStore
 */
class JsonApiDataStore {
  /**
   * @method constructor
   */
  constructor() {
    this.graph = {};
  }

  /**
   * Remove a model from the store.
   * @method destroy
   * @param {object} model The model to destroy.
   */
  destroy(model) {
    delete this.graph[model._type][model.id];
  }

  /**
   * Retrieve a model by type and id. Constant-time lookup.
   * @method find
   * @param {string} type The type of the model.
   * @param {string} id The id of the model.
   * @return {object} The corresponding model if present, and null otherwise.
   */
  find(type, id) {
    if (!this.graph[type] || !this.graph[type][id]) return null;
    return this.graph[type][id];
  }

  /**
   * Retrieve all models by type.
   * @method findAll
   * @param {string} type The type of the model.
   * @return {object} Array of the corresponding model if present, and empty array otherwise.
   */
  findAll(type) {
    var self = this;

    if (!this.graph[type]) return [];
    return Object.keys(self.graph[type]).map(function(v) { return self.graph[type][v]; });
  }

  /**
   * Empty the store.
   * @method reset
   */
  reset() {
    this.graph = {};
  }

  initModel(type, id) {
    this.graph[type] = this.graph[type] || {};
    this.graph[type][id] = this.graph[type][id] || new JsonApiDataStoreModel(type, id);

    return this.graph[type][id];
  }

  syncRecord(rec) {
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

    if (rec.links) {
      model._links = rec.links;
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
          model._links = model._links || {};
          model._links[key] = rel.links;
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
  syncWithMeta(payload) {
    var primary = payload.data,
        syncRecord = this.syncRecord.bind(this);
    if (!primary) return [];
    if (payload.included) payload.included.map(syncRecord);
    return {
      data: (primary.constructor === Array) ? primary.map(syncRecord) : syncRecord(primary),
      meta: ("meta" in payload) ? payload.meta : null
    };
  }

  /**
   * Sync a JSONAPI-compliant payload with the store.
   * @method sync
   * @param {object} data The JSONAPI payload
   * @return {object} The model/array of models corresponding to the payload's primary resource(s).
   */
  sync(payload) {
    return this.syncWithMeta(payload).data;
  }
}

if ('undefined' !== typeof module) {
  module.exports = {
    JsonApiDataStore: JsonApiDataStore,
    JsonApiDataStoreModel: JsonApiDataStoreModel
  };
}
