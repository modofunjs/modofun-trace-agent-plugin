const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const plugin = require('../index');

const originalMofodun = require('modofun');

function applyPlugin(onPluginMiddleware) {
  return plugin[0].intercept(originalMofodun, {
    constants: {
      TRACE_CONTEXT_HEADER_NAME: 'TRACE_CONTEXT_HEADER_NAME'
    },
    labels: {},
    runInRootSpan: (options, callback) => {
      onPluginMiddleware && onPluginMiddleware();
      callback({
        addLabel: () => {},
        endSpan: () => {}
      });
    },
    getResponseTraceContext: () => {},
    wrapEmitter: () => {}
  });
}

function createRequest(url) {
  const request = httpMocks.createRequest({ method: 'GET', url });
  request.connection = {
    remoteAddress: 'remoteAddress'
  };
  return request;
}

describe('Module wrapper', function() {
  const modofun = applyPlugin();

  function testAPI(apiMethod) {
    return function(done) {
      const request = createRequest('/test');
      const response = httpMocks.createResponse();

      apiMethod({
        test: () => done()
      }, { type: 'gcloud', mode: 'reqres', errorHandler: done })(request, response);
    }
  }

  it('should expose modofun()', testAPI(modofun));
  it('should expose modofun.gcloud()', testAPI(modofun.gcloud));

  function testArityMethod() {
    return function(done) {
      const request = createRequest('/test/123');
      const response = httpMocks.createResponse();

      modofun.gcloud({
        test: (param) => done()
      }, {
        moddleware: [ modofun.arity(1) ],
        errorHandler: done
      })(request, response);
    };
  }

  it('should expose modofun.arity()', testArityMethod());
});

describe('Middleware', function() {
  const mwCounter = {};
  const pluginCounter = {};

  const mwIncr = function({path}, res, next) {
    expect(pluginCounter[path]).to.equal(1);
    mwCounter[path]++;
    next();
  }

  function testOptions(id, options, mwHits) {
    const path = '/test/' + id;
    mwCounter[path] = 0;
    pluginCounter[path] = 0;

    return function(done) {
      let pluginMiddlewareCalls = 0;
      const modofun = applyPlugin(() => {
        expect(mwCounter[path]).to.equal(0);
        pluginCounter[path]++;
      });
      const request = createRequest(path);
      const response = httpMocks.createResponse();

      modofun.gcloud({
        test: (id) => {
          expect(mwCounter[path]).to.equal(mwHits);
          expect(pluginCounter[path]).to.equal(1);
          done();
        }
      }, options)(request, response);
    }
  }

  it('should support no options', testOptions(1, undefined, 0));
  it('should support middleware array instead of options', testOptions(2, [ mwIncr ], 1));
  it('should support options but no middleware', testOptions(3, { type: 'gcloud' }, 0));
  it('should support options with middleware', testOptions(4, { middleware: [ mwIncr ] }, 1));
});
