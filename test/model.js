var fs = require('fs'),
    expect = require('chai').expect;

eval(fs.readFileSync('dist/jsonapi-datastore.js', 'utf-8'));

describe('JsonApiDataModel', function() {
  describe('.serialize()', function() {
    it('should serialize a bare model', function() {
      var serializedModel = new JsonApiDataStoreModel('datatype', 1337).serialize();
      expect(serializedModel).to.deep.eq({
        data: {
          id: 1337,
          type: 'datatype'
        }
      });
    });

    it('should serialize a model with attributes', function() {
      var store = new JsonApiDataStore(),
          payload = {
            data: {
              type: 'article',
              id: 1337,
              attributes: {
                title: 'Cool article',
                author: 'Lucas'
              }
            }
          };

      var article = store.sync(payload);
      var serializedArticle = article.serialize();
      expect(serializedArticle).to.deep.eq(payload);
    });

    it('should serialize a model with relationships', function() {
      var store = new JsonApiDataStore(),
          payload = {
            data: {
              type: 'article',
              id: 1337,
              attributes: {
                title: 'Cool article'
              },
              relationships: {
                author: {
                  data: {
                    type: 'user',
                    id: 3
                  }
                }
              }
            }
          };

      var article = store.sync(payload);
      var serializedArticle = article.serialize();
      expect(serializedArticle).to.deep.eq(payload);
    });
  });
});
