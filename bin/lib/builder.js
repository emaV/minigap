var Builder, _;

_ = require("./utils");

Builder = (function() {
  var _buildFile;

  function Builder(targets, options) {
    var args, readBuildConfig;
    readBuildConfig = require("./config");
    this.config = readBuildConfig();
    args = this._parseBuildArgs(targets, options);
    this.targets = args.targets;
    this.envs = args.envs;
  }

  Builder.prototype._parseBuildArgs = function(targets, options) {
    var allEnvs, envs, firstEnv, invalidEnvs, invalidTargets;
    envs = null;
    if (options.env == null) {
      allEnvs = this.config.getAllEnvironments();
      if (allEnvs.length === 0) {
        _.fatal("There is no environment declared in your configuration.");
      }
      firstEnv = allEnvs[0];
      envs = [firstEnv];
      _.warn("No environment specified: assuming '" + firstEnv + "'");
    } else {
      envs = options.env.split(",");
      invalidEnvs = this.config.findInvalidEnvs(envs);
      if (invalidEnvs.length > 0) {
        _.fatal("Unknown environment" + (invalidEnvs.length > 1 ? 's' : '') + ": " + (invalidEnvs.join(', ')));
      }
    }
    if (targets.length === 0) {
      targets = this.config.getAllTargets();
      _.warn("No targets specified: building for all targets..");
    } else {
      invalidTargets = this.config.findInvalidTargets(targets);
      if (invalidTargets.length > 0) {
        _.fatal("Unknown target" + (invalidTargets.length > 1 ? 's' : '') + ": " + (invalidTargets.join(', ')));
      }
    }
    console.log("\n");
    return {
      targets: targets,
      envs: envs
    };
  };

  Builder.prototype._touchBuiltAt = function(target, env) {
    var built_at;
    if (env === "dev") {
      built_at = _.path.resolve(this.config.getDest(target, env), ".built_at");
      return _.touch(built_at);
    }
  };

  _buildFile = function(srcf, dstf, target, env) {
    var builder, ctx, e, extensions, extensionsRe, msg;
    extensions = this.config.knownExtensions();
    extensionsRe = new RegExp("\\.(" + (extensions.join('|')) + ")$");
    builder = this.config.getBuilder();
    ctx = this.config.getContext(target, env);
    builder.env = ctx;
    try {
      if (srcf.match(extensionsRe)) {
        builder.build(srcf, dstf);
      } else if (path.extname(srcf) === path.extname(dstf)) {
        _.copyFileSync(srcf, dstf);
      } else {
        _.fatal("Your configuration does not define how to build " + srcf + " to " + dstf + ".");
      }
      if (typeof this.config.fileBuilt === "function") {
        return this.config.fileBuilt(dstf, target, env);
      }
    } catch (_error) {
      e = _error;
      if (e.type === "PreprocessorError") {
        msg = "PreprocessorError: " + e.message + "\n  at " + e.path + ":" + e.line + ":" + e.col + "\n";
        throw msg;
      } else {
        throw e;
      }
    }
  };

  Builder.prototype.build = function(envs, targets) {
    var dstf, env, files, srcf, target, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = targets.length; _i < _len; _i++) {
      target = targets[_i];
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = envs.length; _j < _len1; _j++) {
          env = envs[_j];
          console.log("Building " + target + ":" + env);
          files = this.config.getFiles(target, env);
          for (srcf in files) {
            dstf = files[srcf];
            this._buildFile(srcf, dstf, target, env);
          }
          this._touchBuiltAt(target, env);
          if (typeof this.config.built === "function") {
            this.config.built(target, env);
          }
          if (typeof this.config.done === "function") {
            this.config.done(targets, envs);
          }
          _results1.push(_.success("Done.\n"));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  Builder.prototype.watch = function() {
    var dstf, e, env, error, files, rebuilt, sources, srcf, target, _i, _j, _len, _len1, _ref, _ref1;
    sources = this.config.getSources(this.envs, this.targets);
    if (options["skip-build"] == null) {
      this.build();
    }
    console.log(_.clc.green("Watching for changes .."));
    rebuilt = false;
    error = false;
    _ref = this.targets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      target = _ref[_i];
      if (error) {
        break;
      }
      _ref1 = this.envs;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        env = _ref1[_j];
        if (this.config.hasSource(target, env, filename)) {
          files = this.config.getFiles(target, env);
          srcf = filename;
          dstf = files[srcf];
          try {
            this._buildFile(srcf, dstf, target, env);
          } catch (_error) {
            e = _error;
            error = true;
            console.log(_.clc.red("[ERROR] Building: '" + filename + "' for '" + target + ":" + env + "'"));
            console.log("Caused by: " + e);
            _.warn(".built_at is not updated because application may be in unconsistent state.");
            _.warn("Aborted.");
            break;
          }
          rebuilt = true;
          this._touchBuiltAt(target, env);
        }
      }
    }
    if (rebuilt && !error) {
      return _.success("Rebuilt " + filename);
    }
  };

  return Builder;

})();

module.exports = new Builder();
