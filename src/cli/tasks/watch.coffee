module.exports = (runner) ->
  runner.task "watch", "Watch for changes on the source code and rebuild the changed sources only", {}, {}, (targets...)->
    @h.check()
    
    envs    = if @options.env then options.env.split(",") else []
    config  = @h.readBuildConfig()
    targets = @h.parseTargets(config, targets)
    envs    = @h.parseEnvs(config, envs)

    console.log @h.clc.green("Watching for changes ..")
    t = null
    rebuildLapse = 2000 # Awaits 2 seconds between file change and rebuild

    @h.watch ["app", "lib"], (filename) ->     
      console.log runner.h.clc.yellow("Changed: #{filename}")
      if t
        clearTimeout(t)

      t = setTimeout (->
        try
          for target in targets
            for env in envs
              console.log "Building #{target}:#{env}"
              bundle = config.getBundle(target, env)              
              bundle.build()

        catch e
          runner.h.error(e)

        runner.h.success("Done.")
              

      ), rebuildLapse


