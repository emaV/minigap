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
    var hbsOptions, options;
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
    hbsOptions = {
      types: {
        handlebars: {
          delimiters: ["<!--=", "-->"],
          extensions: ['.hbs'],
          to: {
            coffeescript: function(content, filename) {
              var handlebars, path, res, template, templateName;
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
    this.builder.config(_.extend({}, hbsOptions, options.builderConfig || {}));
    return this.builder.env = this.context;
  };

  Bundle.prototype.build = function() {
    var dstf, srcf, _ref, _ref1, _results;
    this._reset();
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
