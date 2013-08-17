var __slice = [].slice;

module.exports = function(runner) {
  return runner.task("build", "Build application", {}, {}, function() {
    var bundle, config, e, env, envs, target, targets, _i, _j, _len, _len1;
    targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.h.check();
    envs = this.options.env ? options.env.split(",") : [];
    config = this.h.readBuildConfig();
    targets = this.h.parseTargets(config, targets);
    envs = this.h.parseEnvs(config, envs);
    for (_i = 0, _len = targets.length; _i < _len; _i++) {
      target = targets[_i];
      for (_j = 0, _len1 = envs.length; _j < _len1; _j++) {
        env = envs[_j];
        console.log(this.h.clc.yellow("Building " + target + ":" + env));
        bundle = config.getBundle(target, env);
        try {
          bundle.build();
        } catch (_error) {
          e = _error;
          runner.h.error(e);
          if (e.type === "PreprocessorError") {
            runner.h.error("  @" + e.path + ", L=" + e.line + " C=" + e.column);
          }
          process.exit();
        }
      }
    }
    return this.h.success("Done.");
  });
};
