
//= require "../ns.js"
;
Minigap.Origin = (function() {
  function Origin(domain, base) {
    this.domain = domain != null ? domain : "";
    this.base = base != null ? base : "/";
    this._urlbase = this._url_join(this.domain, this.base);
  }

  Origin.prototype.request = function(context, path, params, options, func) {
    var args, self;
    args = this._normalizeRequestArguments(path, params, options, func);
    self = this;
    return this.doRequest(args.url, args.params, args.options, function(response) {
      if (typeof args.func === 'function') {
        return args.func.call(context, self.processResponse(response));
      }
    });
  };

  Origin.prototype.requests = function(context, requests, func) {
    var req, requestDone, responses, self, _i, _len, _results;
    responses = [];
    self = this;
    requestDone = function(req, resp) {
      responses.push({
        request: req,
        response: resp
      });
      if (responses.length === requests.length) {
        return func.call(self.app, self.doMerge(responses));
      }
    };
    _results = [];
    for (_i = 0, _len = requests.length; _i < _len; _i++) {
      req = requests[_i];
      _results.push(this.request(context, req.path, req.params, req.options, function(resp) {
        return requestDone(req, resp);
      }));
    }
    return _results;
  };

  Origin.prototype.doRequest = function(url, params, options, func) {
    throw "NotImplemented";
  };

  Origin.prototype.doMerge = function(responses) {
    throw "NotImplemented";
  };

  Origin.prototype.processResponse = function(response) {
    return response;
  };

  Origin.prototype._normalizeRequestArguments = function(path, params, options, func) {
    var cb;
    cb = void 0;
    if (typeof params === 'function') {
      cb = params;
      options = {};
      params = {};
    } else if (typeof options === 'function') {
      cb = options;
      options = {};
    } else if (typeof func === 'function') {
      cb = func;
    }
    if (params == null) {
      params = {};
    }
    if (options == null) {
      options = {};
    }
    return {
      url: this._buildRequestUrl(path),
      params: params,
      options: options,
      func: cb
    };
  };

  Origin.prototype._url_join = function(p1, p2) {
    if (p1[p1.length - 1] === "/") {
      p1 = p1.slice(0, p1.length - 1);
    }
    if (p2[0] === "/") {
      p2 = p2.slice(1);
    }
    return "" + p1 + "/" + p2;
  };

  Origin.prototype._buildRequestUrl = function(path) {
    return this._url_join(this._urlbase, path);
  };

  return Origin;

})();
