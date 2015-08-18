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

    it('should serialize all attributes by default', function() {
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

    it('should serialize all relationships by default', function() {
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

    it('should serialize only specified attributes', function() {
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
      var serializedArticle = article.serialize({ attributes: [ 'author' ] });
      expect(serializedArticle.data.attributes.title).to.eq(undefined);
    });

    it('should serialize only specified relationships', function() {
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
                },
                tags: {
                  data: [
                    { type: 'tag', id: 12 },
                    { type: 'tag', id: 74 }
                  ]
                }
              }
            }
          };

      var article = store.sync(payload);
      var serializedArticle = article.serialize({ relationships: [ 'author' ] });
      expect(serializedArticle.data.relationships.tags).to.eq(undefined);
    });
  });
});
