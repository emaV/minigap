this.Minigap = {};

Minigap.helpers = [];

Minigap.controllers = [];

Minigap.controller = function(controller) {
  return Minigap.controllers.push(controller);
};

Minigap.helpers = function(helpers) {
  return Minigap.helpers.push(helpers);
};

this.Minigap.DomHelper = (function() {
  function DomHelper() {}

  DomHelper.prototype.click2tap = function(selector) {};

  DomHelper.prototype.documentReady = function(func) {};

  DomHelper.prototype.deviceReady = function(func) {};

  return DomHelper;

})();

this.Minigap.Frame = (function() {
  function Frame(selector) {
    this.selector = selector;
  }

  Frame.prototype.replaceContent = function(html) {};

  Frame.prototype.append = function(html) {};

  Frame.prototype.prepend = function(html) {};

  return Frame;

})();

this.Minigap.Origin = (function() {
  function Origin(domain, base) {
    this.domain = domain != null ? domain : "";
    this.base = base != null ? base : "/";
    this._urlbase = this._url_join(this.domain, this.base);
    this.app = null;
  }

  Origin.prototype.setApp = function(app) {
    this.app = app;
  };

  Origin.prototype.request = function(path, params, options, func) {
    var args, self;
    args = this._normalizeRequestArguments(path, params, options, func);
    self = this;
    return this.doRequest(args.url, args.params, args.options, function(response) {
      if (typeof args.func === 'function') {
        return args.func.call(self.app, self.processResponse(response));
      }
    });
  };

  Origin.prototype.requests = function(requests, func) {
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
      _results.push(this.request(req.path, req.params, req.options, function(resp) {
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

this.Minigap.TemplateEngine = (function() {
  function TemplateEngine(app) {
    this.app = app;
  }

  TemplateEngine.prototype.applyTemplate = function(template, context, cb) {};

  return TemplateEngine;

})();

this.Minigap.Emitter = {
  callbacks: {},
  next_uid: 0,
  on: function(types_str, context, fn) {
    var t, types, _base, _i, _len, _ref;
    if (typeof context === 'function') {
      fn = context;
      context = {};
    }
    types = [];
    this.next_uid += 1;
    _ref = types_str.replace(/\s+/, '').split(",");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      if ((_base = this.callbacks)[t] == null) {
        _base[t] = [];
      }
      this.callbacks[t].push({
        fn: fn,
        context: context,
        uid: this.next_uid
      });
    }
    return this.next_uid;
  },
  off: function(types_str, uid) {
    var ary, cb, found, i, type, _i, _j, _len, _len1, _ref, _ref1;
    _ref = types_str.replace(/\s+/, '').split(",");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      type = _ref[_i];
      if (this.callbacks[type]) {
        found = void 0;
        i = 0;
        _ref1 = this.callbacks[type];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          cb = _ref1[_j];
          if (cb.uid === uid) {
            found = i;
            break;
          } else {
            i += 1;
          }
        }
        if (found != null) {
          ary = this.callbacks[type];
          if (ary.length === 1) {
            delete this.callbacks[type];
          } else {
            ary.splice(found, 1);
          }
        }
      }
    }
    return true;
  },
  emit: function(type, params) {
    var cb, _i, _len, _ref;
    if (params == null) {
      params = {};
    }
    if (this.callbacks[type]) {
      _ref = this.callbacks[type];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cb = _ref[_i];
        cb.fn.call(cb.context, params);
      }
    }
    return true;
  }
};

this.Minigap.Router = (function() {
  function Router(app, routes) {
    this.app = app;
    this.routes = routes;
  }

  Router.prototype.goto = function(path) {
    return window.location.hash = "#!" + path;
  };

  Router.prototype.start = function() {
    var self;
    self = this;
    window.addEventListener("hashchange", (function() {
      return self._doRoute();
    }), false);
    return this.goto('/');
  };

  Router.prototype._doRoute = function() {
    var hash, params, parts, path;
    hash = window.location.hash;
    if (hash === "") {
      hash = "#!/";
    }
    if (hash.slice(0, 2) === "#!") {
      parts = window.location.hash.split("?");
      path = parts[0].substr(2);
      params = this._parseQueryString(parts[1]);
      return Minigap.Emitter.emit(path, params);
    }
  };

  Router.prototype._parseQueryString = function(a) {
    var b, i, p;
    if (a == null) {
      return {};
    }
    a = a.split("&");
    b = {};
    i = 0;
    while (i < a.length) {
      p = a[i].split("=");
      if (p.length !== 2) {
        continue;
      }
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
      ++i;
    }
    return b;
  };

  return Router;

})();

this.Minigap.App = (function() {
  function App(options) {
    var name, origin, selector, _ref, _ref1;
    if (options == null) {
      options = {};
    }
    this.router = new Minigap.Router();
    this.template_engine = new Minigap.DefaultTemplateEngine(this);
    this.dom_helper = new Minigap.DomHelper();
    this.frames = {};
    if (options.frames != null) {
      _ref = options.frames;
      for (name in _ref) {
        selector = _ref[name];
        this.frames[name] = new Minigap.Frame(selector);
      }
    }
    this.origins = {};
    if (options.origins != null) {
      _ref1 = options.origins;
      for (name in _ref1) {
        origin = _ref1[name];
        this.origins[name] = origin;
        this.origins[name].setApp(this);
      }
    }
    if (options.origin != null) {
      this.origins.main = options.origin;
      this.origins.main.setApp(this);
    }
    this.origin = this.origins.main;
    this.globals = {};
  }

  App.prototype.on = function(events, func) {
    return Minigap.Emitter.on(events, this, func);
  };

  App.prototype.off = function(events, uid) {
    return Minigap.Emitter.off(events, uid);
  };

  App.prototype.emit = function(event, params) {
    if (params == null) {
      params = {};
    }
    return Minigap.Emitter.emit(event, params);
  };

  App.prototype.goto = function(path) {
    return this.router.goto(path);
  };

  App.prototype.request = function(path, params, options, func) {
    return this.origin.request(path, params, options, func);
  };

  App.prototype.start = function() {
    var self;
    self = this;
    return this.dom_helper.deviceReady(function() {
      return this.dom_helper.documentReady(function() {
        return self._doStart;
      });
    });
  };

  App.prototype._doStart = function() {
    var controller, evt, func, _i, _len, _ref;
    _ref = Minigap.controllers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      controller = _ref[_i];
      for (evt in controller) {
        func = controller[evt];
        this.on(evt, func);
      }
    }
    this.router.start();
    return this.emit("app.started");
  };

  App.prototype.render = function(template, context, options, func) {
    var cb, frame, method, templateApplyed;
    cb = void 0;
    if (typeof context === 'function') {
      cb = context;
      options = {};
      context = {};
    } else if (typeof options === 'function') {
      cb = options;
      options = {};
    } else if (typeof func === 'function') {
      cb = func;
    }
    if (options == null) {
      options = {};
    }
    if (cb == null) {
      cb = function() {};
    }
    frame = this.frames[options.frame || "main"];
    method = frame[options.method || "replaceContent"];
    templateApplyed = function(html) {
      method.call(frame, html);
      this.dom_helper.click2tap(frame.selector);
      return cb.call(this);
    };
    return this.template_engine.applyTemplate(template, context, this.utils.proxy(templateApplyed, this));
  };

  return App;

})();

var _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Minigap.HandlebarsTemplateEngine = (function(_super) {
  __extends(HandlebarsTemplateEngine, _super);

  function HandlebarsTemplateEngine() {
    _ref = HandlebarsTemplateEngine.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  HandlebarsTemplateEngine.prototype.applyTemplate = function(template, context, cb) {
    return cb.call(this.app, JST[template](context));
  };

  return HandlebarsTemplateEngine;

})(Minigap.TemplateEngine);

Minigap.DefaultTemplateEngine = Minigap.HandlebarsTemplateEngine;

var _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Minigap.JsonOrigin = (function(_super) {
  __extends(JsonOrigin, _super);

  function JsonOrigin() {
    _ref = JsonOrigin.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  JsonOrigin.prototype.doRequest = function(url, params, options, func) {
    var req, type;
    type = (options.type || "GET").toUpperCase();
    req = new XMLHttpRequest();
    req.open(type, url, true);
    req.setRequestHeader('Accept', 'application/json');
    req.onload = function() {
      var resp;
      resp = req.response;
      if (typeof resp === 'string') {
        resp = JSON.parse(resp);
      }
      return func(resp);
    };
    return req.send();
  };

  JsonOrigin.prototype.doMerge = function(responses) {
    var r, res, _i, _len;
    res = {};
    for (_i = 0, _len = responses.length; _i < _len; _i++) {
      r = responses[_i];
      res[r.request.name] = r.response;
    }
    return res;
  };

  return JsonOrigin;

})(Minigap.Origin);

var _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Minigap.JSendOrigin = (function(_super) {
  __extends(JSendOrigin, _super);

  function JSendOrigin() {
    _ref = JSendOrigin.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  JSendOrigin.prototype.processResponse = function(response) {
    if (response.status === "success") {
      return response.data;
    } else {
      return {};
    }
  };

  JSendOrigin.prototype.doMerge = function(responses) {
    var obj, prop, r, res, _i, _len, _ref1;
    res = {};
    for (_i = 0, _len = responses.length; _i < _len; _i++) {
      r = responses[_i];
      _ref1 = r.response;
      for (prop in _ref1) {
        obj = _ref1[prop];
        res[prop] = obj;
      }
    }
    return res;
  };

  return JSendOrigin;

})(Minigap.JsonOrigin);


