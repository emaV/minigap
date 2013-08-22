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
    var declEnv, decls, path;
    decls = this.targets[target].dests || {};
    for (declEnv in decls) {
      path = decls[declEnv];
      if (_.minimatch(env, declEnv)) {
        return path;
      }
    }
    return null;
  };

  Config.prototype.getSrc = function(target, env) {
    var declEnv, decls, path;
    decls = this.targets[target].sources || {};
    for (declEnv in decls) {
      path = decls[declEnv];
      if (_.minimatch(env, declEnv)) {
        return path;
      }
    }
    return null;
  };

  Config.prototype.getBases = function(target, env) {
    var bases, declEnv, decls, path;
    decls = this.targets[target].bases || {};
    bases = [];
    for (declEnv in decls) {
      path = decls[declEnv];
      if (_.minimatch(env, declEnv)) {
        bases.push(_.path.resolve(path));
      }
    }
    return _.uniq(bases);
  };

  Config.prototype.runnable = function(name, obj) {
    return this.runnables[name] = obj;
  };

  Config.prototype.getFilesToBuild = function(target, env) {
    var declEnv, decls, dstFile, files, res, src, srcFile;
    decls = this.targets[target].build || {};
    src = this.getSrc(target, env);
    if (!src) {
      throw "Source path not defined for " + target + ":" + env;
    }
    res = {};
    for (declEnv in decls) {
      files = decls[declEnv];
      if (_.minimatch(env, declEnv)) {
        for (srcFile in files) {
          dstFile = files[srcFile];
          res[_.path.join(src, srcFile)] = dstFile;
        }
      }
    }
    return res;
  };

  Config.prototype.getFiles = function(mode, target, env) {
    var base, bases, bn, dest, destBase, destExt, destinationRoot, dn, f, files, fixedPartIdx, globres, k, name, noExt, opts, res, v, _i, _j, _len, _len1, _ref;
    destinationRoot = this.getDestination(target, env);
    if (destinationRoot == null) {
      throw "Destination root not defined for " + target + ":" + env;
    }
    files = {};
    if (mode === "copy") {
      bases = this.getBases(target, env);
      for (_i = 0, _len = bases.length; _i < _len; _i++) {
        base = bases[_i];
        files["" + base + "/**/*"] = "";
      }
    } else if (mode === "build") {
      _ref = this.targets;
      for (name in _ref) {
        opts = _ref[name];
        _.extend(files, this.getFilesToBuild(target, env));
      }
    }
    res = {};
    for (k in files) {
      v = files[k];
      if (k.indexOf("*") === -1) {
        res[_.path.resolve(k)] = _.path.resolve(_.path.join(destinationRoot, v));
      } else {
        fixedPartIdx = k.split("*")[0].lastIndexOf(_.path.sep);
        globres = _.glob(k);
        destBase = v;
        destExt = null;
        if (_.isArray(destBase)) {
          destBase = v[0];
          destExt = v[1];
        }
        for (_j = 0, _len1 = globres.length; _j < _len1; _j++) {
          f = globres[_j];
          dest = f.slice(fixedPartIdx);
          if (destExt != null) {
            bn = _.path.basename(dest);
            dn = _.path.dirname(dest);
            noExt = bn.slice(0, bn.indexOf("."));
            dest = _.path.join(dn, "" + noExt + "." + destExt);
          }
          res[_.path.resolve(f)] = _.path.resolve(_.path.join(destinationRoot, destBase, dest));
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
  readConf = require(_.path.resolve(path || "./src/config"));
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
          coffeescript: function(content, srcPath) {
            var handlebars, res, template, templateName;
            handlebars = require("handlebars");
            path = require("path");
            templateName = path.basename(srcPath, ".hbs");
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
