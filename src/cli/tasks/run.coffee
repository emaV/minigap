_ = require("../lib/utils")

module.exports = (runner) ->
  runner.task "run", "Run a defined runnable", {}, {}, (runnable) ->
    @h.check()
    if !runnable?
      _.fatal "You must provide a runnable."

    config  = @h.readBuildConfig()
    cmd = config.runnables[runnable]
    if !cmd?
      _.fatal "There is no runnable named '#{runnable}' in your configuration."
    
    _.runCmd cmd.command, cmd.args, {cwd: cmd.cwd}, (code) ->
      if code == 0
        runner.h.success "Done."
      else
        runner.h.error "'#{cmd.command}' exited with error code #{code}."
