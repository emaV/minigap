module.exports = (runner) ->
  runner.task "watch", "Watch for changes on the source code and rebuild the changed sources only", {}, {}, (targets...)->
    @h.check()
    
    envs    = if @options.env then options.env.split(",") else []
    config  = @h.readBuildConfig()
    targets = @h.parseTargets(config, targets)
    envs    = @h.parseEnvs(config, envs)

    if @options.build
      console.log @h.clc.green("Building ..")

      for target in targets
        for env in envs
          console.log @h.clc.yellow("Building #{target}:#{env}")
          bundle = config.getBundle(target, env)
          bundle.build()

    console.log @h.clc.green("Watching for changes ..")
    t = null
    rebuildLapse = 300 # Waits 300 ms between file change and rebuild
 
    watchDir = "src"
    buildDir = @h.path.resolve(watchDir, "app")

    ws = @h.fork(@h.path.resolve(__dirname, "../lib/websocket.js"), [4000])

    watchDevel = @options.dev
    toBeWatched = [watchDir]
    develPath = @h.path.resolve(__dirname, "../../dist/")
    if watchDevel
      toBeWatched.push(develPath)
    

    @h.watch toBeWatched, (filename) ->
      console.log runner.h.clc.yellow("Changed: #{filename}")
      if t
        clearTimeout(t)

      t = setTimeout (->
        try
          for target in targets
            copyDir = runner.h.path.resolve(watchDir, "bases", target)
            for env in envs
              bundle = config.getBundle(target, env)
              
              if runner.h.isSubpath(copyDir, filename)
                t1 = runner.h.mark()
                bundle.build(skipBuild: true)
                t2 = runner.h.mark(t1)
                console.log "#{target}:#{env} base mirrored in #{t2}"

              else if runner.h.isSubpath(buildDir, filename) or (watchDevel and runner.h.isSubpath(develPath, filename))
                t1 = runner.h.mark()
                bundle.build(skipCopy: true)
                t2 = runner.h.mark(t1)
                console.log "#{target}:#{env} rebuilt in #{t2}"

          ws.send 
            channel: "/builder/built"
            message:
              builtAt: (new Date()).toString()

        catch e
          runner.h.error(e)
          if e.type is "PreprocessorError"
            runner.h.error("  @#{e.path}, L=#{e.line} C=#{e.column}")

        runner.h.success("Done.")
              

      ), rebuildLapse


