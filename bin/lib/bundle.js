var Bundle, preproc, _;

_ = require("./utils");

preproc = require('preproc');

Bundle = (function() {
  function Bundle(config, target, env) {
    this.config = config;
    this.target = target;
    this.env = env;
    this._reset();
    this.deps = this._dependentMap();
  }

  Bundle.prototype._reset = function() {
    var Seconds_Between_Dates, Seconds_from_T1_to_T2, dif, options, t1, t2;
    t1 = new Date();
    options = {
      copy: this.config.getFiles("copy", this.target, this.env),
      build: this.config.getFiles("build", this.target, this.env),
      env: this.config.getContext(this.target, this.env),
      dest: this.config.getDestination(this.target, this.env),
      builderConfig: this.config.builderConfig
    };
    this.filesToBeCopied = options.copy;
    this.filesToBeBuilt = options.build;
    this.context = options.env;
    this.dest = options.dest;
    this.builder = new preproc.Builder({
      libs: [_.path.resolve("./lib")]
    });
    this.builder.config(options.builderConfig);
    this.builder.env = this.context;
    t2 = new Date();
    dif = t1.getTime() - t2.getTime();
    Seconds_from_T1_to_T2 = dif / 1000;
    Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
    return console.log("Reset takes: " + Seconds_Between_Dates + " s");
  };

  Bundle.prototype.build = function() {
    var dstf, srcf, _ref, _ref1, _results;
    _ref = this.filesToBeCopied;
    for (srcf in _ref) {
      dstf = _ref[srcf];
      this._copyFile(srcf, dstf);
    }
    _ref1 = this.filesToBeBuilt;
    _results = [];
    for (srcf in _ref1) {
      dstf = _ref1[srcf];
      _results.push(this._buildFile(srcf, dstf));
    }
    return _results;
  };

  Bundle.prototype.changed = function(filename) {
    filename = _.path.resolve(filename);
    if (!_.fs.existsSync(filename)) {
      return console.log("Deleted " + filename);
    } else {
      this._reset();
      if (_.has(this.filesToBeCopied, filename)) {
        return console.log("Need to be re-copied: " + filename);
      } else if (_.has(this.deps, filename)) {
        console.log("Need to be rebuilt: " + this.deps[filename]);
        return this.deps = this._dependentMap();
      } else {
        return console.log("Noting to do with " + filename);
      }
    }
  };

  Bundle.prototype._dependentMap = function() {
    var dep, deps, dt, k, src, v, _base, _i, _j, _len, _len1, _ref, _ref1;
    if (this._dmap == null) {
      this._dmap = {};
      _ref = _.keys(this.filesToBeBuilt);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        src = _ref[_i];
        deps = this.builder.dependenciesOf(src);
        dt = this.builder.dependencyTree(src);
        deps.push(src);
        for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
          dep = deps[_j];
          if ((_base = this._dmap)[dep] == null) {
            _base[dep] = [];
          }
          this._dmap[dep].push(src);
        }
      }
      _ref1 = this._dmap;
      for (k in _ref1) {
        v = _ref1[k];
        this._dmap[k] = _.uniq(v);
      }
    }
    return this._dmap;
  };

  Bundle.prototype._buildFile = function(srcf, dstf) {
    var e, msg;
    try {
      return this.builder.build(srcf, dstf);
    } catch (_error) {
      e = _error;
      msg = e;
      if (e.type === "PreprocessorError") {
        msg = "PreprocessorError: " + e.message + "\n  at " + e.path + ":" + e.line + ":" + e.col + "\n";
      }
      return _.fatal(msg);
    }
  };

  Bundle.prototype._copyFile = function(srcf, dstf) {
    return _.copyFileSync(srcf, dstf);
  };

  return Bundle;

})();

module.exports = Bundle;
