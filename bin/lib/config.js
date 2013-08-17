var Bundle, Config, coffee, readBuildConfig, _;

coffee = require("coffee-script");

_ = require("./utils");

Bundle = require("./bundle");

Config = (function() {
  function Config() {
    this.bundles = {};
    this.targets = {};
    this.envs = {};
    this.deps = {};
    this.builderConfig = {};
    this.runnables = {};
  }

  Config.prototype.env = function(name, opts) {
    var _base;
    (_base = this.envs)[name] || (_base[name] = {});
    return _.extend(this.envs[name], opts);
  };

  Config.prototype.builder = function(opts) {
    return _.extend(this.builderConfig, opts);
  };

  Config.prototype.target = function(name, opts) {
    return this.targets[name] = opts;
  };

  Config.prototype.dep = function(name, opts) {
    return this.deps[name] = opts;
  };

  Config.prototype.getDestination = function(target, env) {
    return this.targets[target].dest[env];
  };

  Config.prototype.runnable = function(name, obj) {
    return this.runnables[name] = obj;
  };

  Config.prototype.getFiles = function(mode, target, env) {
    var base, bn, dest, destBase, destExt, dn, f, files, fixedPartIdx, globres, k, name, noExt, opts, res, v, _i, _len, _ref;
    base = this.getDestination(target, env);
    if (base == null) {
      throw "Destination root not defined for " + target + ":" + env;
    }
    files = {};
    if (mode === "copy") {
      files["src/bases/" + target + "/**/*"] = "";
    } else {
      _ref = this.targets;
      for (name in _ref) {
        opts = _ref[name];
        if (_.minimatch(target, name)) {
          if (opts[mode] != null) {
            _.extend(files, opts[mode]);
          }
        }
      }
    }
    res = {};
    for (k in files) {
      v = files[k];
      if (k.indexOf("*") === -1) {
        res[_.path.resolve(k)] = _.path.resolve(_.path.join(base, v));
      } else {
        fixedPartIdx = k.split("*")[0].lastIndexOf(_.path.sep);
        globres = _.glob(k);
        destBase = v;
        destExt = null;
        if (_.isArray(destBase)) {
          destBase = v[0];
          destExt = v[1];
        }
        for (_i = 0, _len = globres.length; _i < _len; _i++) {
          f = globres[_i];
          dest = f.slice(fixedPartIdx);
          if (destExt != null) {
            bn = _.path.basename(dest);
            dn = _.path.dirname(dest);
            noExt = bn.slice(0, bn.indexOf("."));
            dest = _.path.join(dn, "" + noExt + "." + destExt);
          }
          res[_.path.resolve(f)] = _.path.resolve(_.path.join(base, destBase, dest));
        }
      }
    }
    return res;
  };

  Config.prototype.getContext = function(target, env) {
    var context, name, opts, _ref, _ref1;
    context = {};
    _ref = this.envs;
    for (name in _ref) {
      opts = _ref[name];
      if (_.minimatch(env, name)) {
        _.extend(context, opts);
      }
    }
    _ref1 = this.targets;
    for (name in _ref1) {
      opts = _ref1[name];
      if (_.minimatch(target, name)) {
        if (opts.env != null) {
          _.extend(context, opts.env);
        }
      }
    }
    context.target = target;
    context.env = env;
    return context;
  };

  Config.prototype.availableTargets = function() {
    return _.reject(_.keys(this.targets), function(t) {
      return t.indexOf("*") !== -1;
    });
  };

  Config.prototype.availableEnvironments = function() {
    return _.reject(_.keys(this.envs), function(t) {
      return t.indexOf("*") !== -1;
    });
  };

  Config.prototype.getBundle = function(target, env) {
    var bid;
    bid = "" + target + ":" + env;
    if (this.bundles[bid] == null) {
      this.bundles[bid] = new Bundle(this, target, env);
    }
    return this.bundles[bid];
  };

  return Config;

})();

readBuildConfig = function(path) {
  var conf, configDsl, hbsOptions, readConf, srcPath;
  readConf = require(_.path.resolve(path || "./config"));
  configDsl = new Config();
  readConf(configDsl);
  conf = configDsl;
  srcPath = _.path.resolve(__dirname, "../../dist");
  hbsOptions = {
    libs: [srcPath],
    types: {
      handlebars: {
        delimiters: ["<!--=", "-->"],
        extensions: ['.hbs'],
        to: {
          coffeescript: function(content, filename) {
            var handlebars, res, template, templateName;
            handlebars = require("handlebars");
            path = require("path");
            templateName = path.basename(filename, ".hbs");
            template = handlebars.precompile(content);
            res = templateName.slice(0, 1) === "_" ? (templateName = templateName.replace(/^_/, ""), 'Handlebars.partials[\'' + templateName + '\'] = Handlebars.template(`' + template + '`)\n') : 'Minigap.templates[\'' + templateName + '\'] = Handlebars.template(`' + template + '`)\n';
            return res;
          }
        }
      }
    }
  };
  conf.builderConfig = _.extend(hbsOptions, conf.builderConfig);
  return conf;
};

module.exports = readBuildConfig;
