var fs = require('fs'),
    expect = require('chai').expect;

import {JsonApiDataStore} from '../src/jsonapi-datastore.js';

describe('JsonApiDataStore', () => {
  describe('.sync()', () => {
    context('when given a simple payload', () => {
      var store = new JsonApiDataStore();
      var payload = {
            data: {
              type: 'article',
              id: 1337
            }
          };
      var errorPayload = {
        errors: {
          type: 'article',
          status: 'error',
          message: "Article not found",
          code: '404'
        }
      };


      it('should set the id', () => {
        var article = store.sync(payload);
        expect(article.id).to.eq(1337);
      });

      it('should set the _type', () => {
        var article = store.sync(payload);
        expect(article._type).to.eq('article');
      });

      it('should set an empty _relationships', () => {
        var article = store.sync(payload);
        expect(article._relationships).to.deep.eq([]);
      });

      it('should set an empty _attributes', () => {
        var article = store.sync(payload);
        expect(article._relationships).to.deep.eq([]);
      });

      it('should return errors from the payload', () => {
          var articleErrors = store.sync(errorPayload);
          expect(articleErrors).to.have.property('errors');
      });

    });

    context('when given a payload with simple attributes', () => {
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

      it('should set the attributes', () => {
        var article = store.sync(payload);
        expect(article.title).to.eq('Cool article');
        expect(article.author).to.eq('Lucas');
      });

      it('should not duplicate the attributes if the record is processed again', () => {
        var article = store.sync(payload);
        store.sync(payload);
        expect(article._attributes.length).to.eq(2);
      });
    });

    context('when given a payload with multiple resources', () => {
      var store = new JsonApiDataStore(),
          payload = {
            data: [{
              type: 'article',
              id: 1337,
              attributes: {
                title: 'Cool article',
                author: 'Lucas'
              }
            }, {
              type: 'article',
              id: 1338,
              attributes: {
                title: 'Better article',
                author: 'Romain'
              }
            }]
          };

      it('should create as many models', () => {
        var articles = store.sync(payload);
        expect(articles.length).to.eq(2);
      });
    });

    context('when given a payload with relationships', () => {
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
                    id: 1
                  }
                }
              }
            }
          };

      it('should create placeholder models for related resources', () => {
        var article = store.sync(payload);
        expect(article.author._type).to.eq('user');
        expect(article.author.id).to.eq(1);
        expect(article.author._placeHolder).to.eq(true);
      });

      context('when syncing related resources later', () => {
        var authorPayload = {
          data: {
            type: 'user',
            id: 1,
            attributes: {
              name: 'Lucas'
            }
          }
        };

        it('should update relationships', () => {
          var article = store.sync(payload);
          store.sync(authorPayload);
          expect(article.author.name).to.eq('Lucas');
        });

        it('should remove the _placeHolder flag', () => {
          var article = store.sync(payload);
          store.sync(authorPayload);
          expect(article.author._placeHolder).not.to.eq(true);
        });
      });
    });

    context('when given a payload with included relationships', () => {
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
                    id: 1
                  }
                }
              }
            },
            included: [{
              type: 'user',
              id: 1,
              attributes: {
                name: 'Lucas'
              }
            }]
          };

      it('should create and link the related model', () => {
        var article = store.sync(payload);
        expect(article.author.name).to.eq('Lucas');
      });
    });

    context('when given a payload with mutual references', () => {
      var store = new JsonApiDataStore(),
          payload = {
            data: [{
              type: 'article',
              id: 1337,
              attributes: {
                title: 'Cool article'
              },
              relationships: {
                related_article: {
                  data: {
                    type: 'article',
                    id: 1338
                  }
                }
              }
            }, {
              type: 'article',
              id: 1338,
              attributes: {
                title: 'Better article'
              },
              relationships: {
                related_article: {
                  data: {
                    type: 'article',
                    id: 1337
                  }
                }
              }
            }]
          };

      it('should create and link both models', () => {
        var articles = store.sync(payload);
        expect(articles[0].related_article.id).to.eq(1338);
        expect(articles[1].related_article.id).to.eq(1337);
      });
    });
  });

  describe('.syncWithMeta()', () => {
    context('when given a simple payload with meta', () => {
      var store = new JsonApiDataStore(),
          payload = {
            data: {
              type: 'article',
              id: 1337
            },
            meta: {
              test: 'abc'
            }
          };

      it('should return the meta data', () => {
        var result = store.syncWithMeta(payload);
        expect(result.meta.test).to.eq('abc');
      });

      it('should return the data', () => {
        var result = store.syncWithMeta(payload);
        expect(result.data.id).to.eq(1337);
        expect(result.data._type).to.eq('article');
      });
    });

    context('when given a simple payload without meta', () => {
      var store = new JsonApiDataStore(),
          payload = {
            data: {
              type: 'article',
              id: 1337
            }
          };

      it('should return empty meta data', () => {
        var result = store.syncWithMeta(payload);
        expect(result.meta).to.deep.eq(null);
      });

      it('should return the data', () => {
        var result = store.syncWithMeta(payload);
        expect(result.data.id).to.eq(1337);
        expect(result.data._type).to.eq('article');
      });

      context('when given a simple payload with meta as different key', () => {
        var store = new JsonApiDataStore(),
            payload = {
              data: {
                type: 'article',
                id: 1337
              },
              metadata: {
                test: 'abc'
              }
            };

        it('should return empty meta data when not setting meta key', () => {
          var result = store.syncWithMeta(payload);
          expect(result.meta).to.deep.eq(null);
        });

      });
    });
  });

  describe('.reset()', () => {
    var store = new JsonApiDataStore(),
        payload = {
          data: {
            type: 'article',
            id: 1337
          }
        };

    it('should empty the store', () => {
      store.sync(payload);
      store.reset();
      expect(store.graph).to.deep.eq({});
    });

    it('should not invalidate previous references', () => {
      var article = store.sync(payload);
      store.reset();
      expect(article.id).to.eq(1337);
    });
  });

  describe('.find()', () => {
    var store = new JsonApiDataStore(),
        payload = {
          data: [
            {
              type: 'article',
              id: 1337
            },
            {
              type: 'article',
              id: 1338
            }
          ]
        };

    it('should find an existing model', () => {
      store.sync(payload);
      var article = store.find('article', 1337);
      expect(article.id).to.eq(1337);
    });

    it('should not find a non-existing model', () => {
      store.sync(payload);
      var article = store.find('article', 9999);
      expect(article).to.eq(null);
    });

    it('should not find a non-existing model type', () => {
      store.sync(payload);
      var article = store.find('bad', 1337);
      expect(article).to.eq(null);
    });
  });

  describe('.findAll()', () => {
    var store = new JsonApiDataStore(),
        payload = {
          data: [
            {
              type: 'article',
              id: 1337
            },
            {
              type: 'article',
              id: 1338
            }
          ]
        };

    it('should find all existing models', () => {
      store.sync(payload);
      var articles = store.findAll('article');
      expect(articles.length).to.eq(2);
      expect(articles[0].id).to.eq(1337);
      expect(articles[1].id).to.eq(1338);
    });

    it('should not find a non-existing model', () => {
      store.sync(payload);
      var articles = store.findAll('bad');
      expect(articles.length).to.eq(0);
    });
  });

  describe('.destroy()', () => {
    var store = new JsonApiDataStore(),
        payload = {
          data: {
            type: 'article',
            id: 1337
          }
        };

    it('should destroy an existing model', () => {
      store.sync(payload);
      store.destroy(store.find('article', 1337));
      var article = store.find('article', 1337);
      expect(article).to.eq(null);
    });
  });
});
