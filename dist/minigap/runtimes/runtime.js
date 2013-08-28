
//= require "../ns.js"
;
var ContextualizedOrigin,
  __slice = [].slice;

Minigap.Runtime = (function() {
  function Runtime() {
    this.origins = {};
    this.templates = {};
    this.mainFrame = "body";
    this.defaultLocale = "en";
    this.locales = {};
    this._global = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : void 0;
    this._session = {};
  }

  Runtime.prototype.origin = function(name, origin) {
    this.origins[name] = origin;
    if (typeof origin.install === "function") {
      return origin.install(this);
    }
  };

  Runtime.prototype.controller = function(obj) {};

  Runtime.prototype.locale = function(localeId, obj) {
    var k, l, v, _base, _results;
    if ((_base = this.locales)[localeId] == null) {
      _base[localeId] = {};
    }
    l = this.locales[localeId];
    _results = [];
    for (k in obj) {
      v = obj[k];
      _results.push(l[k] = v);
    }
    return _results;
  };

  Runtime.prototype.global = function(key, value) {
    if (typeof key === "undefined") {
      return this._global;
    } else {
      if (typeof value !== "undefined") {
        this._global[key] = value;
      }
      return this._global[key];
    }
  };

  Runtime.prototype.session = function(key, value) {
    if (typeof key === "undefined") {
      return this._session;
    } else {
      if (typeof value !== "undefined") {
        this._session[key] = value;
      }
      return this._session[key];
    }
  };

  Runtime.prototype.setMainFrame = function(selector) {
    return this.mainFrame = selector;
  };

  Runtime.prototype.getMainFrame = function() {
    return this.mainFrame;
  };

  Runtime.prototype.setDefaultLocale = function(locale) {
    return this.defaultLocale = locale;
  };

  Runtime.prototype.getDefaultLocale = function() {
    return this.defaultLocale;
  };

  Runtime.prototype.ajax = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  };

  Runtime.prototype.start = function() {};

  return Runtime;

})();

ContextualizedOrigin = (function() {
  function ContextualizedOrigin(context, origin) {
    this.context = context;
    this.origin = origin;
  }

  ContextualizedOrigin.prototype.request = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    args.unshift(this.context);
    return this.origin.request.apply(this.origin, args);
  };

  ContextualizedOrigin.prototype.requests = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    args.unshift(this.context);
    return this.origin.requests.apply(this.origin, args);
  };

  return ContextualizedOrigin;

})();

Minigap.ActionContext = (function() {
  function ActionContext() {
    var k, v, _ref;
    _ref = Minigap.origins;
    for (k in _ref) {
      v = _ref[k];
      this[k] = new ContextualizedOrigin(this, v);
    }
  }

  ActionContext.prototype.setMeta = function(name, content) {
    var nameAttr;
    nameAttr = "name";
    if (name.indexOf(":") !== -1) {
      nameAttr = "property";
    }
    if (this.document("meta[" + nameAttr + "='" + name + "']").length) {
      return this.document("meta[" + nameAttr + "='" + name + "']").attr("content", content);
    } else {
      return this.document("head").append("<meta " + nameAttr + "='" + name + "' content='" + content + "'/>");
    }
  };

  ActionContext.prototype.render = function(template, context, selector, mode) {
    var content;
    if (mode == null) {
      mode = "content";
    }
    content = this._renderTemplate(template, context);
    if (selector == null) {
      selector = Minigap.getMainFrame();
    }
    switch (mode) {
      case "replace":
        return this.document(selector).replace(content);
      case "content":
        return this.document(selector).empty().append(content);
      case "append":
        return this.document(selector).append(content);
    }
  };

  ActionContext.prototype._renderTemplate = function(template, context) {
    var t;
    t = Minigap.templates[template];
    if (t == null) {
      throw "Template '" + template + "' not found.";
    } else {
      return t.call(null, context);
    }
  };

  return ActionContext;

})();
