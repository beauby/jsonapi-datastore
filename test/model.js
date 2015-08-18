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
      expect(serializedArticle.data.attributes.title).to.be.undefined;
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
      expect(serializedArticle.data.relationships.tags).to.be.undefined;
    });

    it('should not serialize the id on fresh models', function() {
      var article = new JsonApiDataStoreModel('article');
      var serializedArticle = article.serialize();
      expect(serializedArticle.data.id).to.be.undefined;
    });
  });

  describe('.setAttribute()', function() {
    context('when attribute is not set', function() {
      it('should add a new attribute', function() {
        var article = new JsonApiDataStoreModel('article');
        article.setAttribute('title', 'Cool article');
        expect(article.title).to.eq('Cool article');
      });

      it('should add the new attribute to the list of attributes', function() {
        var article = new JsonApiDataStoreModel('article');
        article.setAttribute('title', 'Cool article');
        expect(article._attributes).to.include('title');
      });
    });

    context('when attribute is set', function() {
      it('should modify existing attribute', function() {
        var article = new JsonApiDataStoreModel('article');
        article.setAttribute('title', 'Cool article');
        article.setAttribute('title', 'Cooler article');
        expect(article.title).to.eq('Cooler article');
      });

      it('should not duplicate attribute in the list of attributes', function() {
        var article = new JsonApiDataStoreModel('article');
        article.setAttribute('title', 'Cool article');
        article.setAttribute('title', 'Cooler article');
        expect(article._attributes.filter(function(val) { return val == 'title'; }).length).to.eq(1);
      });
    });
  });

  describe('.setRelationship()', function() {
    context('when relationship is not set', function() {
      it('should add a new relationship', function() {
        var user = new JsonApiDataStoreModel('user', 13);
        user.setAttribute('name', 'Lucas');
        var article = new JsonApiDataStoreModel('article');
        article.setRelationship('author', user);
        expect(article.author.name).to.eq('Lucas');
      });

      it('should add the new relationship to the list of relationships', function() {
        var user = new JsonApiDataStoreModel('user', 13);
        user.setAttribute('name', 'Lucas');
        var article = new JsonApiDataStoreModel('article');
        article.setRelationship('author', user);
        expect(article._relationships).to.include('author');
      });
    });

    context('when relationship is set', function() {
      it('should modify existing relationship', function() {
        var user1 = new JsonApiDataStoreModel('user', 13),
            user2 = new JsonApiDataStoreModel('user', 14);
        var article = new JsonApiDataStoreModel('article');
        article.setRelationship('author', user1);
        article.setRelationship('author', user2);
        expect(article.author.id).to.eq(14);
      });

      it('should not duplicate relationship in the list of relationships', function() {
        var user1 = new JsonApiDataStoreModel('user', 13),
            user2 = new JsonApiDataStoreModel('user', 14);
        var article = new JsonApiDataStoreModel('article');
        article.setRelationship('author', user1);
        article.setRelationship('author', user2);
        expect(article._relationships.filter(function(val) { return val == 'author'; }).length).to.eq(1);
      });
    });
  });
});
