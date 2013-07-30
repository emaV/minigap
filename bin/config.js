var Config, coffee, glob, minimatch, path, preproc, readBuildConfig, _, _quoteRe;

preproc = require("preproc");

path = require("path");

coffee = require("coffee-script");

_ = require("underscore");

minimatch = require("minimatch");

glob = require("glob").sync;

_quoteRe = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

Config = (function() {
  function Config() {
    this.targets = {};
    this.envs = {};
    this.deps = {};
    this._builder = new preproc.Builder({
      libs: [path.resolve("./lib")]
    });
  }

  Config.prototype.env = function(name, opts) {
    var _base;
    (_base = this.envs)[name] || (_base[name] = {});
    return _.extend(this.envs[name], opts);
  };

  Config.prototype.builder = function(opts) {
    if (opts) {
      this._builder.config(opts);
    }
    return this._builder;
  };

  Config.prototype.target = function(name, opts) {
    return this.targets[name] = opts;
  };

  Config.prototype.dep = function(name, opts) {
    return this.deps[name] = opts;
  };

  Config.prototype.knownExtensions = function() {
    var exts, self;
    self = this;
    exts = _.keys(this._builder.types.extensions);
    return _.map(exts, function(ext) {
      if (ext.slice(0, 1) === ".") {
        ext = ext.slice(1);
      }
      ext;
      return _quoteRe(ext);
    });
  };

  Config.prototype._context = function(target, env) {
    var ctx, name, opts, _ref, _ref1;
    ctx = {};
    _ref = this.envs;
    for (name in _ref) {
      opts = _ref[name];
      if (minimatch(env, name)) {
        _.extend(ctx, opts);
      }
    }
    _ref1 = this.targets;
    for (name in _ref1) {
      opts = _ref1[name];
      if (minimatch(target, name)) {
        if (opts.env != null) {
          _.extend(ctx, opts.env);
        }
      }
    }
    ctx.target = target;
    ctx.env = env;
    return ctx;
  };

  Config.prototype._files = function(target, env) {
    var base, bn, dest, destBase, destExt, dn, f, files, fixedPartIdx, globres, k, name, noExt, opts, res, v, _i, _len, _ref;
    base = this.targets[target].dest[env];
    if (base == null) {
      return {};
    }
    files = {};
    _ref = this.targets;
    for (name in _ref) {
      opts = _ref[name];
      if (minimatch(target, name)) {
        if (opts.files != null) {
          _.extend(files, opts.files);
        }
      }
    }
    res = {};
    for (k in files) {
      v = files[k];
      if (k.indexOf("*") === -1) {
        res[k] = path.join(base, v);
      } else {
        fixedPartIdx = k.split("*")[0].lastIndexOf(path.sep);
        globres = glob(k);
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
            bn = path.basename(dest);
            dn = path.dirname(dest);
            noExt = bn.slice(0, bn.indexOf("."));
            dest = path.join(dn, "" + noExt + "." + destExt);
          }
          res[f] = path.join(base, destBase, dest);
        }
      }
    }
    return res;
  };

  Config.prototype.build = function(target, env) {};

  return Config;

})();

readBuildConfig = function(p) {
  var config, configPath, readConf;
  configPath = path.resolve(p || "./config");
  readConf = require(configPath);
  config = new Config();
  readConf(config);
  return config;
};

module.exports = readBuildConfig;
