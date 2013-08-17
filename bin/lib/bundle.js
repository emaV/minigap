var Bundle, preproc, _;

_ = require("./utils");

preproc = require('preproc');

Bundle = (function() {
  function Bundle(config, target, env) {
    this.config = config;
    this.target = target;
    this.env = env;
  }

  Bundle.prototype._reset = function() {
    var options;
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
    this.builder = new preproc.Builder;
    this.builder.config(options.builderConfig);
    return this.builder.env = this.context;
  };

  Bundle.prototype.build = function(options) {
    var dstf, srcf, _ref, _ref1, _results;
    if (options == null) {
      options = {};
    }
    this._reset();
    if (options.skipCopy == null) {
      _ref = this.filesToBeCopied;
      for (srcf in _ref) {
        dstf = _ref[srcf];
        this._copyFile(srcf, dstf);
      }
    }
    if (options.skipBuild == null) {
      _ref1 = this.filesToBeBuilt;
      _results = [];
      for (srcf in _ref1) {
        dstf = _ref1[srcf];
        _results.push(this._buildFile(srcf, dstf));
      }
      return _results;
    }
  };

  Bundle.prototype._buildFile = function(srcf, dstf) {
    return this.builder.build(srcf, dstf);
  };

  Bundle.prototype._copyFile = function(srcf, dstf) {
    return _.copyFileSync(srcf, dstf);
  };

  return Bundle;

})();

module.exports = Bundle;
