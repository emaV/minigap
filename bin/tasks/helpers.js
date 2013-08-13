module.exports = function(runner) {
  runner.helper("parseTargets", function(config, envs) {
    var availableTargets, invalidTargets, targets;
    availableTargets = config.availableTargets();
    if (this.h.isEmpty(targets)) {
      targets = availableTargets;
      this.h.warn("No targets specified: building for all targets..");
    }
    invalidTargets = this.h.difference(this.h.union(availableTargets, targets), availableTargets);
    if (invalidTargets.length > 0) {
      this.h.fatal("Unknown target" + (invalidTargets.length > 1 ? 's' : '') + ": " + (invalidTargets.join(', ')));
    }
    return targets;
  });
  runner.helper("parseEnvs", function(config, envs) {
    var availableEnvs, invalidEnvs;
    availableEnvs = config.availableEnvironments();
    if (this.h.isEmpty(envs)) {
      if (this.h.isEmpty(availableEnvs)) {
        this.h.fatal("There is no environment declared in your configuration.");
      } else {
        envs = [availableEnvs[0]];
        this.h.warn("No environment specified: assuming '" + envs[0] + "'");
      }
    }
    invalidEnvs = this.h.difference(this.h.union(availableEnvs, envs), availableEnvs);
    if (invalidEnvs.length > 0) {
      this.h.fatal("Unknown environment" + (invalidEnvs.length > 1 ? 's' : '') + ": " + (invalidEnvs.join(', ')));
    }
    return envs;
  });
  runner.helper("check", function() {
    if (!this.h.fs.existsSync(".minigap")) {
      return this.h.fatal("This is not a minigap project root");
    } else {
      return true;
    }
  });
  return runner.helper("readBuildConfig", function() {
    var e, readBuildConfig;
    try {
      readBuildConfig = require("../lib/config");
      return readBuildConfig();
    } catch (_error) {
      e = _error;
      return this.h.fatal("An error occurred trying to read your configuration:\n\t" + e + ".");
    }
  });
};
