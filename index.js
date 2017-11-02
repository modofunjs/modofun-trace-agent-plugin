/*!
 * modofun-trace-agent-plugin
 * Copyright (c) 2017 Filipe Tavares
 * MIT Licensed
 */
var SUPPORTED_VERSIONS = '<2.0.0';

function createMiddleware(api) {
  var labels = api.labels;
  return function middleware(req, res, next) {
    var options = {
      name: req.path,
      traceContext: req.get(api.constants.TRACE_CONTEXT_HEADER_NAME),
      url: req.originalUrl,
      skipFrames: 3
    };
    api.runInRootSpan(options, function(rootSpan) {
      // Set response trace context.
      var responseTraceContext =
        api.getResponseTraceContext(options.traceContext, !!rootSpan);
      if (responseTraceContext) {
        res.set(api.constants.TRACE_CONTEXT_HEADER_NAME, responseTraceContext);
      }

      if (!rootSpan) {
        next();
        return;
      }

      api.wrapEmitter(req);
      api.wrapEmitter(res);

      var url = req.protocol + '://' + req.hostname + req.originalUrl;
      rootSpan.addLabel(labels.HTTP_METHOD_LABEL_KEY, req.method);
      rootSpan.addLabel(labels.HTTP_URL_LABEL_KEY, url);
      rootSpan.addLabel(labels.HTTP_SOURCE_IP, req.connection.remoteAddress);

      // wrap end
      var originalEnd = res.end;
      res.end = function() {
        res.end = originalEnd;
        var returned = res.end.apply(this, arguments);

        if (req.route && req.route.path) {
          rootSpan.addLabel('modofun/request.route.path', req.route.path);
        }
        rootSpan.addLabel(labels.HTTP_RESPONSE_CODE_LABEL_KEY, res.statusCode);
        rootSpan.endSpan();
        return returned;
      };

      next();
    });
  };
}

function modofunWrap(method, middleware) {
  return function methodTrace(handlers, options) {
    if (!options) {
      options = [middleware];
    } else if (Array.isArray(options)) {
      options.unshift(middleware);
    } else if (options.middleware && Array.isArray(options.middleware)) {
      options.middleware.unshift(middleware);
    } else {
      options.middleware = [middleware];
    }
    return method.apply(this, [handlers, options]);
  };
}

module.exports = [
  {
    file: '',
    versions: SUPPORTED_VERSIONS,
    intercept: function(modofun, api) {
      var middleware = createMiddleware(api);
      var newMF = modofunWrap(modofun, middleware);
      newMF.gcloud = modofunWrap(modofun.gcloud, middleware);
      newMF.aws = modofun.aws;
      newMF.arity = modofun.arity
      return newMF;
    }
  }
];
