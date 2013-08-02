var Bundle, preproc, _;

_ = require("./utils");

preproc = require('preproc');

Bundle = (function() {
  function Bundle(options) {
    this.filesToBeCopied = options.copy;
    this.filesToBeBuilt = options.build;
    this.context = options.env;
    this.dest = options.dest;
    this.builder = new preproc.Builder({
      libs: [_.path.resolve("./lib")]
    });
    this.builder.config(options.builderConfig);
    this.builder.env = this.context;
  }

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
    throw "Not implemented yet";
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
