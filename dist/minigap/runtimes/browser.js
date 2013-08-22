
//= require "../lib/handlebars.runtime.js" --skip
//= require "../lib/jquery2.js" --skip
//= require "../lib/davis.js" --skip
//= require "../lib/form-serializer.js" --skip
//= require "./runtime.js"
;
var BrowserActionContext,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

BrowserActionContext = (function(_super) {
  __extends(BrowserActionContext, _super);

  function BrowserActionContext(impl) {
    this.impl = impl != null ? impl : {};
    BrowserActionContext.__super__.constructor.call(this);
    this.document = $;
  }

  return BrowserActionContext;

})(Minigap.ActionContext);

Minigap.BrowserRuntime = (function(_super) {
  var eventsTimeouts, parseEventName;

  __extends(BrowserRuntime, _super);

  function BrowserRuntime() {
    this.start = __bind(this.start, this);
    this.controllers = [];
    this.app = null;
    BrowserRuntime.__super__.constructor.call(this);
  }

  BrowserRuntime.prototype.ajax = $.ajax;

  BrowserRuntime.prototype.controller = function(controller) {
    return this.controllers.push(controller);
  };

  BrowserRuntime.prototype.redirect = function(name, params) {
    if (params == null) {
      params = {};
    }
    if (name.slice(0, 1) === "/") {
      return Davis.location.replace(new Davis.Request({
        method: 'get',
        fullPath: name,
        title: name
      }, params));
    }
  };

  eventsTimeouts = {};

  BrowserRuntime.prototype.start = function() {
    var controllers, doc,
      _this = this;
    controllers = this.controllers;
    doc = $(document);
    doc.on("submit", function(e) {
      var evt, form;
      if (e._minigapHandled == null) {
        form = $(e.target);
        evt = $.Event("submit");
        evt._minigapHandled = true;
        evt.object = form.serializeObject();
        form.trigger(evt);
        e.stopPropagation();
        return false;
      }
    });
    this.app = Davis(function() {
      var action, controller, davis, name, _i, _len, _results;
      davis = this;
      _results = [];
      for (_i = 0, _len = controllers.length; _i < _len; _i++) {
        controller = controllers[_i];
        _results.push((function() {
          var _results1;
          _results1 = [];
          for (name in controller) {
            action = controller[name];
            _results1.push((function(routePath, routeAction) {
              var args, callback, e;
              e = parseEventName(routePath);
              callback = function(evt) {
                return routeAction.apply(new BrowserActionContext(), [evt]);
              };
              switch (e.type) {
                case "route":
                  return davis.get(e.route, callback);
                case "dom":
                  args = [e.events];
                  if (e.selector != null) {
                    args.push(e.selector);
                  }
                  if (e.timeout != null) {
                    args.push(function(evt) {
                      clearTimeout(eventsTimeouts[e]);
                      return eventsTimeouts[e] = setTimeout((function() {
                        return callback(evt);
                      }), e.timeout);
                    });
                  } else {
                    args.push(callback);
                  }
                  return doc.on.apply(doc, args);
              }
            })(name, action));
          }
          return _results1;
        })());
      }
      return _results;
    });
    return $(document).ready(function() {
      return _this.app.start();
    });
  };

  parseEventName = function(e) {
    var m, res, split;
    res = {};
    if (e.slice(0, 1) === "/") {
      res.type = "route";
      res.route = e;
    } else {
      res.type = "dom";
      m = e.match(/\s+([1-9][0-9]*)$/);
      res.events = "";
      res.selector = "";
      res.timeout = null;
      if (m) {
        res.timeout = parseInt(m[1]);
        e = e.replace(/\s+[1-9][0-9]*$/, "");
      }
      e = e.replace(/\s*,\s*/g, ",").replace(/\s+/g, " ");
      split = e.indexOf(" ");
      if (split === -1) {
        res.events = e;
      } else {
        res.events = e.slice(0, split) || "";
        res.selector = e.slice(split + 1) || "";
      }
    }
    return res;
  };

  return BrowserRuntime;

})(Minigap.Runtime);

Minigap.setRuntime(new Minigap.BrowserRuntime());
