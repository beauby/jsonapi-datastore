

<!-- Start src/jsonapi-datastore.js -->

## JsonApiDataStoreModel

## constructor(type, id)

### Params:

* **string** *type* The type of the model.
* **string** *id* The id of the model.

## serialize(opts)

Serialize a model.

### Params:

* **object** *opts* The options for serialization. Available properties: 
 - `{array=}` `attributes` The list of attributes to be serialized (default: all attributes).
 - `{array=}` `relationships` The list of relationships to be serialized (default: all relationships).

### Return:

* **object** JSONAPI-compliant object

## setAttribute(attrName, value)

Set/add an attribute to a model.

### Params:

* **string** *attrName* The name of the attribute.
* **object** *value* The value of the attribute.

## setRelationship(relName, models)

Set/add a relationships to a model.

### Params:

* **string** *relName* The name of the relationship.
* **object** *models* The linked model(s).

## JsonApiDataStore

## constructor()

## destroy(model)

Remove a model from the store.

### Params:

* **object** *model* The model to destroy.

## find(type, id)

Retrieve a model by type and id. Constant-time lookup.

### Params:

* **string** *type* The type of the model.
* **string** *id* The id of the model.

### Return:

* **object** The corresponding model if present, and null otherwise.

## findAll(type)

Retrieve all models by type.

### Params:

* **string** *type* The type of the model.

### Return:

* **object** Array of the corresponding model if present, and empty array otherwise.

## reset()

Empty the store.

## syncWithMeta(data)

Sync a JSONAPI-compliant payload with the store and return any metadata included in the payload

### Params:

* **object** *data* The JSONAPI payload

### Return:

* **object** The model/array of models corresponding to the payload's primary resource(s) and any metadata.

## sync(data)

Sync a JSONAPI-compliant payload with the store.

### Params:

* **object** *data* The JSONAPI payload

### Return:

* **object** The model/array of models corresponding to the payload's primary resource(s).

<!-- End src/jsonapi-datastore.js -->

