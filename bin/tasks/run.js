var _;

_ = require("../lib/utils");

module.exports = function(runner) {
  return runner.task("run", "Run a defined runnable", {}, {}, function(runnable) {
    var cmd, config;
    this.h.check();
    if (runnable == null) {
      _.fatal("You must provide a runnable.");
    }
    config = this.h.readBuildConfig();
    cmd = config.runnables[runnable];
    if (cmd == null) {
      _.fatal("There is no runnable named '" + runnable + "' in your configuration.");
    }
    return _.runCmd(cmd.command, cmd.args, {
      cwd: cmd.cwd
    }, function(code) {
      if (code === 0) {
        return runner.h.success("Done.");
      } else {
        return runner.h.error("'" + cmd.command + "' exited with error code " + code + ".");
      }
    });
  });
};
