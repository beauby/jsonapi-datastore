function JsonApiDataStoreModel(type, id) {
  this.id = id;
  this._type = type;
  this._attributes = [];
  this._relationships = [];
}

JsonApiDataStoreModel.prototype.serialize = function() {
  var self = this,
      res,
      key;

  res = {
    data: {
      type: this._type,
      id: this.id
    }
  };

  if (this._attributes.length !== 0) res.data.attributes = {};
  if (this._relationships.length !== 0) res.data.relationships = {};

  this._attributes.forEach(function(key) {
    res.data.attributes[key] = self[key];
  });

  this._relationships.forEach(function(key) {
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
