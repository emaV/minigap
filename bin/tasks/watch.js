var __slice = [].slice;

module.exports = function(runner) {
  return runner.task("watch", "Watch for changes on the source code and rebuild the changed sources only", {}, {}, function() {
    var buildDir, bundle, config, develPath, env, envs, rebuildLapse, t, target, targets, toBeWatched, watchDevel, watchDir, ws, _i, _j, _len, _len1;
    targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.h.check();
    envs = this.options.env ? options.env.split(",") : [];
    config = this.h.readBuildConfig();
    targets = this.h.parseTargets(config, targets);
    envs = this.h.parseEnvs(config, envs);
    if (this.options.build) {
      console.log(this.h.clc.green("Building .."));
      for (_i = 0, _len = targets.length; _i < _len; _i++) {
        target = targets[_i];
        for (_j = 0, _len1 = envs.length; _j < _len1; _j++) {
          env = envs[_j];
          console.log(this.h.clc.yellow("Building " + target + ":" + env));
          bundle = config.getBundle(target, env);
          bundle.build();
        }
      }
    }
    console.log(this.h.clc.green("Watching for changes .."));
    t = null;
    rebuildLapse = 300;
    watchDir = "src";
    buildDir = this.h.path.resolve(watchDir, "app");
    ws = this.h.fork(this.h.path.resolve(__dirname, "../lib/websocket.js"), [4000]);
    watchDevel = this.options.dev;
    toBeWatched = [watchDir];
    develPath = this.h.path.resolve(__dirname, "../../dist/");
    if (watchDevel) {
      toBeWatched.push(develPath);
    }
    return this.h.watch(toBeWatched, function(filename) {
      console.log(runner.h.clc.yellow("Changed: " + filename));
      if (t) {
        clearTimeout(t);
      }
      return t = setTimeout((function() {
        var copyDir, e, t1, t2, _k, _l, _len2, _len3;
        try {
          for (_k = 0, _len2 = targets.length; _k < _len2; _k++) {
            target = targets[_k];
            copyDir = runner.h.path.resolve(watchDir, "bases", target);
            for (_l = 0, _len3 = envs.length; _l < _len3; _l++) {
              env = envs[_l];
              bundle = config.getBundle(target, env);
              if (runner.h.isSubpath(copyDir, filename)) {
                t1 = runner.h.mark();
                bundle.build({
                  skipBuild: true
                });
                t2 = runner.h.mark(t1);
                console.log("" + target + ":" + env + " base mirrored in " + t2);
              } else if (runner.h.isSubpath(buildDir, filename) || (watchDevel && runner.h.isSubpath(develPath, filename))) {
                t1 = runner.h.mark();
                bundle.build({
                  skipCopy: true
                });
                t2 = runner.h.mark(t1);
                console.log("" + target + ":" + env + " rebuilt in " + t2);
              }
            }
          }
          ws.send({
            channel: "/builder/built",
            message: {
              builtAt: (new Date()).toString()
            }
          });
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
