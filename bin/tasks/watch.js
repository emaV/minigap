var __slice = [].slice;

module.exports = function(runner) {
  return runner.task("watch", "Watch for changes on the source code and rebuild the changed sources only", {}, {}, function() {
    var config, envs, rebuildLapse, t, targets;
    targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.h.check();
    envs = this.options.env ? options.env.split(",") : [];
    config = this.h.readBuildConfig();
    targets = this.h.parseTargets(config, targets);
    envs = this.h.parseEnvs(config, envs);
    console.log(this.h.clc.green("Watching for changes .."));
    t = null;
    rebuildLapse = 2000;
    return this.h.watch(["app", "lib"], function(filename) {
      console.log(runner.h.clc.yellow("Changed: " + filename));
      if (t) {
        clearTimeout(t);
      }
      return t = setTimeout((function() {
        var bundle, e, env, target, _i, _j, _len, _len1;
        try {
          for (_i = 0, _len = targets.length; _i < _len; _i++) {
            target = targets[_i];
            for (_j = 0, _len1 = envs.length; _j < _len1; _j++) {
              env = envs[_j];
              console.log("Building " + target + ":" + env);
              bundle = config.getBundle(target, env);
              bundle.build();
            }
          }
        } catch (_error) {
          e = _error;
          runner.h.error(e);
        }
        return runner.h.success("Done.");
      }), rebuildLapse);
    });
  });
};
