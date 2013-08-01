var Watcher;

Watcher = (function() {
  function Watcher(config, targets, options) {}

  Watcher.prototype.watch = function() {
    var args, config, sources;
    config = readBuildConfig();
    args = parseBuildArgs(config, targets, OPTIONS);
    sources = config.getSources(args.envs, args.targets);
    if (options["skip-build"] == null) {
      build(config, args.envs, args.targets);
    }
    console.log(clc.green("Watching for changes .."));
    return watch(".", function(filename) {
      var e;
      try {
        build(config, args.envs, args.targets);
        return success("Rebuilt");
      } catch (_error) {
        e = _error;
        console.log(clc.red("[ERROR]") + ("" + e));
        return warn("Aborted.");
      }
    });
  };

  return Watcher;

})();

module.exports = Watcher;
