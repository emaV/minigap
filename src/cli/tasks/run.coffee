_ = require("../lib/utils")

module.exports = (runner) ->
  runner.task "run", "Run a defined runnable", {}, {}, (runnable) ->
    @h.check()
    if !runnable?
      _.fatal "You must provide a runnable."

    config  = @h.readBuildConfig()
    cmd = config.runnables[runnable]

    exitOnChildError = ->
      _.fatal("Exiting due to errors in child process.")

    spawn = (cmd, args, opts) ->

      child = _.spawn(cmd, args, opts)
      child.on "exit", (c) ->
        if c != 0
          exitOnChildError()

      child.on "error", (e) ->
        exitOnChildError()

    if !cmd?
      _.fatal "There is no runnable named '#{runnable}' in your configuration."
    
    cmd(_.spawn)
