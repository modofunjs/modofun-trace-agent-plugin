/*!
 * modofun-trace-agent-plugin
 * Copyright (c) 2017 Filipe Tavares
 * MIT Licensed
 */
var SUPPORTED_VERSIONS = '0.x';

function createMiddleware(api) {
  return function middleware(req, res, next) {
    var options = {
      name: req.path,
      url: req.originalUrl || req.path,
      traceContext: req.headers[api.constants.TRACE_CONTEXT_HEADER_NAME.toLowerCase()],
      skipFrames: 3
    };
    api.runInRootSpan(options, function(root) {
      // Set response trace context.
      var responseTraceContext =
        api.getResponseTraceContext(options.traceContext, !!root);
      if (responseTraceContext) {
        res.setHeader(api.constants.TRACE_CONTEXT_HEADER_NAME, responseTraceContext);
      }

      if (!root) {
        return next();
      }

      api.wrapEmitter(req);
      api.wrapEmitter(res);

      var url = req.originalUrl || req.path;

      // we use the path part of the url as the span name and add the full
      // url as a label
      root.addLabel(api.labels.HTTP_METHOD_LABEL_KEY, req.method);
      root.addLabel(api.labels.HTTP_URL_LABEL_KEY, url);
      if (req.connection) {
        root.addLabel(api.labels.HTTP_SOURCE_IP, req.connection.remoteAddress);
      }

      // wrap end
      var originalEnd = res.end;
      res.end = function() {
        res.end = originalEnd;
        var returned = res.end.apply(this, arguments);

        if (req.route && req.route.path) {
          root.addLabel('modofun/request.route.path', req.route.path);
        }

        root.addLabel(api.labels.HTTP_RESPONSE_CODE_LABEL_KEY, res.statusCode);
        root.endSpan();

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
      newMF.aws = modofunWrap(modofun.aws, middleware);
      newMF.arity = modofun.arity
      return newMF;
    }
  }
];
