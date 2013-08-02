module.exports = (runner) ->
  runner.task "build", "Build application", {}, {}, (targets...)->
    @h.check()
    
    envs    = if @options.env then options.env.split(",") else []
    config  = @h.readBuildConfig()
    targets = @h.parseTargets(config, targets)
    envs    = @h.parseEnvs(config, envs)
    
    for target in targets
      for env in envs
        console.log @h.clc.yellow("Building #{target}:#{env}")
        bundle = config.getBundle(target, env)
        bundle.build()

    @h.success "Done."