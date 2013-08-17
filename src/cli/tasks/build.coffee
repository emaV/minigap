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
        try
          bundle.build()    
        catch e
          runner.h.error(e)
          if e.type is "PreprocessorError"
            runner.h.error("  @#{e.path}, L=#{e.line} C=#{e.column}")
          process.exit()        

    @h.success "Done."