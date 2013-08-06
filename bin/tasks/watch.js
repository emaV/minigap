var __slice = [].slice;

module.exports = function(runner) {
  return runner.task("watch", "Watch for changes on the source code and rebuild the changed sources only", {}, {}, function() {
    var config, envs, targets;
    targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.h.check();
    envs = this.options.env ? options.env.split(",") : [];
    config = this.h.readBuildConfig();
    targets = this.h.parseTargets(config, targets);
    envs = this.h.parseEnvs(config, envs);
    console.log(this.h.clc.green("Watching for changes .."));
    return this.h.watch(".", function(filename) {
      var bundle, env, target, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = targets.length; _i < _len; _i++) {
        target = targets[_i];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = envs.length; _j < _len1; _j++) {
            env = envs[_j];
            bundle = config.getBundle(target, env);
            _results1.push(bundle.changed(filename));
          }
          return _results1;
        })());
      }
      return _results;
    });
  });
};
