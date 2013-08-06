module.exports = (runner) ->
  runner.task "watch", "Watch for changes on the source code and rebuild the changed sources only", {}, {}, (targets...)->
    @h.check()
    
    envs    = if @options.env then options.env.split(",") else []
    config  = @h.readBuildConfig()
    targets = @h.parseTargets(config, targets)
    envs    = @h.parseEnvs(config, envs)

    console.log @h.clc.green("Watching for changes ..")
    @h.watch ".", (filename) ->
      for target in targets
        for env in envs
          bundle = config.getBundle(target, env)
          bundle.changed(filename)
