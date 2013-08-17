
//= require "./runtime.js"
;
var OPTIONS, ServerActionContext, app, cheerio, express, fs, layout, nopt, path, port, toobusy,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

global.Handlebars = require('handlebars');

express = require("express");

fs = require("fs");

path = require("path");

toobusy = require("toobusy");

nopt = require("nopt");

app = express();

app.configure(function() {
  app.disable("x-powered-by");
  app.use(function(req, res, next) {
    if (toobusy()) {
      return res.send(503, "Sorry, too busy");
    } else {
      return next();
    }
  });
  app.use(express["static"](path.join(__dirname, "public")));
  return app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

OPTIONS = nopt({}, {}, process.argv, 2);


//= if env == "dev" or env == "test"
;

port = OPTIONS.port || 3000;


//= else
;

port = OPTIONS.port || 80;


//= end
;

layout = fs.readFileSync("app.html");

cheerio = require('cheerio');

ServerActionContext = (function(_super) {
  __extends(ServerActionContext, _super);

  function ServerActionContext(impl) {
    this.impl = impl != null ? impl : {};
    ServerActionContext.__super__.constructor.call(this);
    this.document = cheerio.load(layout);
  }

  ServerActionContext.prototype.setMeta = function(name, content) {
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

  ServerActionContext.prototype.render = function(template, context, selector, mode) {
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
        this.document(selector).replace(content);
        break;
      case "content":
        this.document(selector).empty().append(content);
        break;
      case "append":
        this.document(selector).append(content);
    }
    return this.impl.response.send(this.document.html());
  };

  return ServerActionContext;

})(Minigap.ActionContext);

Minigap.ServerRuntime = (function(_super) {
  __extends(ServerRuntime, _super);

  function ServerRuntime() {
    this.start = __bind(this.start, this);
    this.impl = {};
    this.impl.app = app;
    ServerRuntime.__super__.constructor.call(this);
  }

  ServerRuntime.prototype.ajax = require("najax");

  ServerRuntime.prototype.controller = function(controller) {
    var action, name, self, _results;
    self = this;
    _results = [];
    for (name in controller) {
      action = controller[name];
      if (name.slice(0, 1) === "/") {
        _results.push((function(routePath, routeAction) {
          return app.get(routePath, function(req, res) {
            var ctx;
            req.action = routePath;
            ctx = new ServerActionContext({
              request: req,
              response: res
            });
            return routeAction.apply(ctx, [req]);
          });
        })(name, action));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  ServerRuntime.prototype.start = function() {
    return app.listen(port, function() {
      return console.log("Server listening on port: " + port);
    });
  };

  return ServerRuntime;

})(Minigap.Runtime);

Minigap.setRuntime(new Minigap.ServerRuntime());
