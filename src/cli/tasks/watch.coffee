module.exports = (runner) ->
  runner.task "watch", "Watch for changes on the source code and rebuild the changed sources only", {}, {}, (targets...)->
    @h.check()
    
    envs    = if @options.env then [@options.env] else []
    config  = @h.readBuildConfig()
    targets = @h.parseTargets(config, targets)
    envs    = @h.parseEnvs(config, envs)
    env     = envs[0]

    srcDirs = []
    srcDirToTarget = {}
    for target in targets
      srcDir = config.getSrc(target, env)
      if not srcDir
        @h.fatal "Source root not specified for #{target}:#{env}"
      else
        srcDir = @h.path.resolve(srcDir)
        srcDirToTarget[srcDir] ||= []
        srcDirToTarget[srcDir].push(target)
        srcDirs.push(srcDir)

    toBeWatched = @h.uniq(srcDirs)

    if @options.dev
      develPath = @h.path.resolve(__dirname, "../../dist/")
      toBeWatched.push(develPath)

    targetsFor = (filename) ->
      res = []
      for dir, targets of srcDirToTarget
        if runner.h.isSubpath(dir, runner.h.path.resolve(filename))
          res = res.concat(targets)
      res

    console.log @h.clc.green("Watching for changes in #{toBeWatched.join(', ')} ..")
    t = null
    rebuildLapse = 300 # Waits 300 ms between file change and rebuild

    @h.watch toBeWatched, (filename) ->
      console.log runner.h.clc.yellow("Changed: #{filename}")
      if t
        clearTimeout(t)

      t = setTimeout (->
        try
          targets = targetsFor(filename)
          console.log "Targets that need to be rebuilt: ", targets.join(", ")
          for target in targets
            bundle = config.getBundle(target, env)
            t1 = runner.h.mark()
            bundle.build(skipCopy: true)
            t2 = runner.h.mark(t1)
            console.log "#{target}:#{env} rebuilt in #{t2}"

        catch e
          runner.h.error(e)
          if e.type is "PreprocessorError"
            runner.h.error("  @#{e.path}, L=#{e.line} C=#{e.column}")

        runner.h.success("Done.")
              

      ), rebuildLapse


