var _;

_ = require("../lib/utils");

module.exports = function(runner) {
  return runner.task("run", "Run a defined runnable", {}, {}, function(runnable) {
    var cmd, config, exitOnChildError, spawn;
    this.h.check();
    if (runnable == null) {
      _.fatal("You must provide a runnable.");
    }
    config = this.h.readBuildConfig();
    cmd = config.runnables[runnable];
    exitOnChildError = function() {
      return _.fatal("Exiting due to errors in child process.");
    };
    spawn = function(cmd, args, opts) {
      var child;
      child = _.spawn(cmd, args, opts);
      child.on("exit", function(c) {
        if (c !== 0) {
          return exitOnChildError();
        }
      });
      return child.on("error", function(e) {
        return exitOnChildError();
      });
    };
    if (cmd == null) {
      _.fatal("There is no runnable named '" + runnable + "' in your configuration.");
    }
    return cmd(_.spawn);
  });
};
