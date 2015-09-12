var fs = require('fs'),
    expect = require('chai').expect;

eval(fs.readFileSync('dist/jsonapi-datastore.js', 'utf-8'));

describe('JsonApiDataStore', function() {
  describe('.sync()', function() {
    context('when given a simple payload', function() {
      var store = new JsonApiDataStore(),
          payload = {
            data: {
              type: 'article',
              id: 1337
            }
          };

      it('should set the id', function() {
        var article = store.sync(payload);
        expect(article.id).to.eq(1337);
      });

      it('should set the _type', function() {
        var article = store.sync(payload);
        expect(article._type).to.eq('article');
      });

      it('should set an empty _relationships', function() {
        var article = store.sync(payload);
        expect(article._relationships).to.deep.eq([]);
      });

      it('should set an empty _attributes', function() {
        var article = store.sync(payload);
        expect(article._relationships).to.deep.eq([]);
      });
    });

    context('when given a payload with simple attributes', function() {
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

      it('should set the attributes', function() {
        var article = store.sync(payload);
        expect(article.title).to.eq('Cool article');
        expect(article.author).to.eq('Lucas');
      });
    });

    context('when given a payload with multiple resources', function() {
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

      it('should create as many models', function() {
        var articles = store.sync(payload);
        expect(articles.length).to.eq(2);
      });
    });

    context('when given a payload with relationships', function() {
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

      it('should create placeholder models for related resources', function() {
        var article = store.sync(payload);
        expect(article.author._type).to.eq('user');
        expect(article.author.id).to.eq(1);
        expect(article.author._placeHolder).to.eq(true);
      });

      context('when syncing related resources later', function() {
        var authorPayload = {
          data: {
            type: 'user',
            id: 1,
            attributes: {
              name: 'Lucas'
            }
          }
        };

        it('should update relationships', function() {
          var article = store.sync(payload);
          store.sync(authorPayload);
          expect(article.author.name).to.eq('Lucas');
        });

        it('should remove the _placeHolder flag', function() {
          var article = store.sync(payload);
          store.sync(authorPayload);
          expect(article.author._placeHolder).not.to.eq(true);
        });
      });
    });

    context('when given a payload with included relationships', function() {
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

      it('should create and link the related model', function() {
        var article = store.sync(payload);
        expect(article.author.name).to.eq('Lucas');
      });
    });

    context('when given a payload with mutual references', function() {
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

      it('should create and link both models', function() {
        var articles = store.sync(payload);
        expect(articles[0].related_article.id).to.eq(1338);
        expect(articles[1].related_article.id).to.eq(1337);
      });
    });
  });

  describe('.reset()', function() {
    var store = new JsonApiDataStore(),
        payload = {
          data: {
            type: 'article',
            id: 1337
          }
        };

    it('should empty the store', function() {
      store.sync(payload);
      store.reset();
      expect(store.graph).to.deep.eq({});
    });

    it('should not invalidate previous references', function() {
      var article = store.sync(payload);
      store.reset();
      expect(article.id).to.eq(1337);
    });
  });

  describe('.find()', function() {
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

    it('should find an existing model', function() {
      store.sync(payload);
      var article = store.find('article', 1337);
      expect(article.id).to.eq(1337);
    });

    it('should not find a non-existing model', function() {
      store.sync(payload);
      var article = store.find('article', 9999);
      expect(article).to.eq(null);
    });

    it('should not find a non-existing model type', function() {
      store.sync(payload);
      var article = store.find('bad', 1337);
      expect(article).to.eq(null);
    });
  });

  describe('.findAll()', function() {
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

    it('should find all existing models', function() {
      store.sync(payload);
      var articles = store.findAll('article');
      expect(articles.length).to.eq(2);
      expect(articles[0].id).to.eq(1337);
      expect(articles[1].id).to.eq(1338);
    });

    it('should not find a non-existing model', function() {
      store.sync(payload);
      var articles = store.findAll('bad');
      expect(articles.length).to.eq(0);
    });
  });

  describe('.destroy()', function() {
    var store = new JsonApiDataStore(),
        payload = {
          data: {
            type: 'article',
            id: 1337
          }
        };

    it('should destroy an existing model', function() {
      store.sync(payload);
      store.destroy(store.find('article', 1337));
      var article = store.find('article', 1337);
      expect(article).to.eq(null);
    });
  });
});
