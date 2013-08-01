var Config, coffee, path, preproc, readBuildConfig, _;

preproc = require('preproc');

path = require("path");

coffee = require("coffee-script");

_ = require("utils");

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
    var exts;
    if (this._knownExtensions == null) {
      exts = _.keys(this._builder.types.extensions);
      this._knownExtensions = _.map(exts, function(ext) {
        if (ext.slice(0, 1) === ".") {
          ext = ext.slice(1);
        }
        ext;
        return _quoteRe(ext);
      });
    }
    return this._knownExtensions;
  };

  Config.prototype.findInvalidTargets = function(ts) {
    var invalidTs, t, validTs, _i, _len;
    validTs = this.getAllTargets();
    invalidTs = [];
    for (_i = 0, _len = ts.length; _i < _len; _i++) {
      t = ts[_i];
      if (!_.contains(validTs, t)) {
        invalidTs.push(t);
      }
    }
    return invalidTs;
  };

  Config.prototype.findInvalidEnvs = function(es) {
    var e, invalidEs, validEs, _i, _len;
    validEs = this.getAllEnvironments();
    invalidEs = [];
    for (_i = 0, _len = es.length; _i < _len; _i++) {
      e = es[_i];
      if (!_.contains(validEs, e)) {
        invalidEs.push(e);
      }
    }
    return invalidEs;
  };

  Config.prototype.getAllEnvironments = function() {
    return _.reject(_.keys(this.envs), function(t) {
      return t.indexOf("*") !== -1;
    });
  };

  Config.prototype.getAllTargets = function() {
    return _.reject(_.keys(this.targets), function(t) {
      return t.indexOf("*") !== -1;
    });
  };

  Config.prototype.getDest = function(target, env) {
    return this.targets[target].dest[env];
  };

  Config.prototype.getBuilder = function() {
    return this._builder;
  };

  Config.prototype.getContext = function(target, env) {
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

  Config.prototype.getFiles = function(target, env) {
    var base, bn, dest, destBase, destExt, dn, f, files, fixedPartIdx, globres, k, name, noExt, opts, res, v, _i, _len, _ref;
    if (this._files == null) {
      this._files = {};
    }
    base = this.targets[target].dest[env];
    if (base == null) {
      throw "Destination path not defined for " + target + ":" + env;
    }
    if (!this._files["" + target + ":" + env]) {
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
      this._files["" + target + ":" + env] = res;
    }
    return this._files["" + target + ":" + env];
  };

  Config.prototype.getSources = function(envs, targets) {
    var e, ret, t, _i, _j, _len, _len1;
    ret = {};
    for (_i = 0, _len = targets.length; _i < _len; _i++) {
      t = targets[_i];
      for (_j = 0, _len1 = envs.length; _j < _len1; _j++) {
        e = envs[_j];
        _.extend(ret, this.getFiles(t, e));
      }
    }
    return _.keys(ret);
  };

  Config.prototype.hasSource = function(target, env, filename) {
    return _.has(this.getFiles(target, env), filename);
  };

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
