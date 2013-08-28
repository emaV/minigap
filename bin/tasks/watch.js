var __slice = [].slice;

module.exports = function(runner) {
  return runner.task("watch", "Watch for changes on the source code and rebuild the changed sources only", {}, {}, function() {
    var config, develPath, env, envs, rebuildLapse, srcDir, srcDirToTarget, srcDirs, t, target, targets, targetsFor, toBeWatched, _i, _len;
    targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.h.check();
    envs = this.options.env ? [this.options.env] : [];
    config = this.h.readBuildConfig();
    targets = this.h.parseTargets(config, targets);
    envs = this.h.parseEnvs(config, envs);
    env = envs[0];
    srcDirs = [];
    srcDirToTarget = {};
    for (_i = 0, _len = targets.length; _i < _len; _i++) {
      target = targets[_i];
      srcDir = config.getSrc(target, env);
      if (!srcDir) {
        this.h.fatal("Source root not specified for " + target + ":" + env);
      } else {
        srcDir = this.h.path.resolve(srcDir);
        srcDirToTarget[srcDir] || (srcDirToTarget[srcDir] = []);
        srcDirToTarget[srcDir].push(target);
        srcDirs.push(srcDir);
      }
    }
    toBeWatched = this.h.uniq(srcDirs);
    if (this.options.dev) {
      develPath = this.h.path.resolve(__dirname, "../../dist/");
      srcDirToTarget[develPath] = targets;
      toBeWatched.push(develPath);
    }
    targetsFor = function(filename) {
      var dir, res;
      res = [];
      for (dir in srcDirToTarget) {
        targets = srcDirToTarget[dir];
        if (runner.h.isSubpath(dir, runner.h.path.resolve(filename))) {
          res = res.concat(targets);
        }
      }
      return res;
    };
    console.log(this.h.clc.green("Watching for changes in " + (toBeWatched.join(', ')) + " .."));
    t = null;
    rebuildLapse = 300;
    return this.h.watch(toBeWatched, function(filename) {
      console.log(runner.h.clc.yellow("Changed: " + filename));
      if (t) {
        clearTimeout(t);
      }
      return t = setTimeout((function() {
        var bundle, e, t1, t2, _j, _len1;
        try {
          targets = targetsFor(filename);
          console.log("Targets that need to be rebuilt: ", targets.join(", "));
          for (_j = 0, _len1 = targets.length; _j < _len1; _j++) {
            target = targets[_j];
            bundle = config.getBundle(target, env);
            t1 = runner.h.mark();
            bundle.build({
              skipCopy: true
            });
            t2 = runner.h.mark(t1);
            console.log("" + target + ":" + env + " rebuilt in " + t2);
          }
        } catch (_error) {
          e = _error;
          runner.h.error(e);
          if (e.type === "PreprocessorError") {
            runner.h.error("  @" + e.path + ", L=" + e.line + " C=" + e.column);
          }
        }
        return runner.h.success("Done.");
      }), rebuildLapse);
    });
  });
};
