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

  opts = opts || {};
  opts.attributes = opts.attributes || this._attributes;
  opts.relationships = opts.relationships || this._relationships;

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
