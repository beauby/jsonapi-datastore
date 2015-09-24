var fs = require('fs'),
    expect = require('chai').expect;

import {JsonApiDataStore, JsonApiDataStoreModel} from '../src/jsonapi-datastore.js';

describe('JsonApiDataModel', () => {
  describe('.serialize()', () => {
    it('should serialize a bare model', () => {
      let serializedModel = new JsonApiDataStoreModel('datatype', 1337).serialize();
      expect(serializedModel).to.deep.eq({
        data: {
          id: 1337,
          type: 'datatype'
        }
      });
    });

    it('should serialize all attributes by default', () => {
      let store = new JsonApiDataStore(),
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

    it('should serialize all relationships by default', () => {
      let store = new JsonApiDataStore(),
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

      let article = store.sync(payload);
      let serializedArticle = article.serialize();
      expect(serializedArticle).to.deep.eq(payload);
    });

    it('should serialize only specified attributes', () => {
      let store = new JsonApiDataStore(),
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

      let article = store.sync(payload);
      let serializedArticle = article.serialize({ attributes: [ 'author' ] });
      expect(serializedArticle.data.attributes.title).to.be.undefined;
    });

    it('should serialize only specified relationships', () => {
      let store = new JsonApiDataStore(),
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

      let article = store.sync(payload);
      let serializedArticle = article.serialize({ relationships: [ 'author' ] });
      expect(serializedArticle.data.relationships.tags).to.be.undefined;
    });

    it('should not serialize the id on fresh models', () => {
      let article = new JsonApiDataStoreModel('article');
      let serializedArticle = article.serialize();
      expect(serializedArticle.data.id).to.be.undefined;
    });
  });

  describe('.setAttribute()', () => {
    context('when attribute is not set', () => {
      it('should add a new attribute', () => {
        let article = new JsonApiDataStoreModel('article');
        article.setAttribute('title', 'Cool article');
        expect(article.title).to.eq('Cool article');
      });

      it('should add the new attribute to the list of attributes', () => {
        let article = new JsonApiDataStoreModel('article');
        article.setAttribute('title', 'Cool article');
        expect(article._attributes).to.include('title');
      });
    });

    context('when attribute is set', () => {
      it('should modify existing attribute', () => {
        let article = new JsonApiDataStoreModel('article');
        article.setAttribute('title', 'Cool article');
        article.setAttribute('title', 'Cooler article');
        expect(article.title).to.eq('Cooler article');
      });

      it('should not duplicate attribute in the list of attributes', () => {
        let article = new JsonApiDataStoreModel('article');
        article.setAttribute('title', 'Cool article');
        article.setAttribute('title', 'Cooler article');
        expect(article._attributes.filter(function(val) { return val == 'title'; }).length).to.eq(1);
      });
    });
  });

  describe('.setRelationship()', () => {
    context('when relationship is not set', () => {
      it('should add a new relationship', () => {
        let user = new JsonApiDataStoreModel('user', 13);
        user.setAttribute('name', 'Lucas');
        let article = new JsonApiDataStoreModel('article');
        article.setRelationship('author', user);
        expect(article.author.name).to.eq('Lucas');
      });

      it('should add the new relationship to the list of relationships', () => {
        let user = new JsonApiDataStoreModel('user', 13);
        user.setAttribute('name', 'Lucas');
        let article = new JsonApiDataStoreModel('article');
        article.setRelationship('author', user);
        expect(article._relationships).to.include('author');
      });
    });

    context('when relationship is set', () => {
      it('should modify existing relationship', () => {
        let user1 = new JsonApiDataStoreModel('user', 13),
            user2 = new JsonApiDataStoreModel('user', 14);
        let article = new JsonApiDataStoreModel('article');
        article.setRelationship('author', user1);
        article.setRelationship('author', user2);
        expect(article.author.id).to.eq(14);
      });

      it('should not duplicate relationship in the list of relationships', () => {
        let user1 = new JsonApiDataStoreModel('user', 13),
            user2 = new JsonApiDataStoreModel('user', 14);
        let article = new JsonApiDataStoreModel('article');
        article.setRelationship('author', user1);
        article.setRelationship('author', user2);
        expect(article._relationships.filter(function(val) { return val == 'author'; }).length).to.eq(1);
      });
    });
  });
});
