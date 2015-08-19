/**
 * @class JsonApiDataStoreModel
 */
/**
 * @method constructor
 * @param {string} type The type of the model.
 * @param {string} id The id of the model.
 */
function JsonApiDataStoreModel(type, id) {
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
JsonApiDataStoreModel.prototype.serialize = function(opts) {
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

/**
 * Set/add an attribute to a model.
 * @method setAttribute
 * @param {string} attrName The name of the attribute.
 * @param {object} value The value of the attribute.
 */
JsonApiDataStoreModel.prototype.setAttribute = function(attrName, value) {
  if (this[attrName] === undefined) this._attributes.push(attrName);
  this[attrName] = value;
};

/**
 * Set/add a relationships to a model.
 * @method setRelationship
 * @param {string} relName The name of the relationship.
 * @param {object} models The linked model(s).
 */
JsonApiDataStoreModel.prototype.setRelationship = function(relName, models) {
  if (this[relName] === undefined) this._relationships.push(relName);
  this[relName] = models;
};
