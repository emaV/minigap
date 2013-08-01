class Watcher
  constructor: (config, targets, options) ->
  
  watch: ->
    config       = readBuildConfig()
    args         = parseBuildArgs(config, targets, OPTIONS)
    sources      = config.getSources(args.envs, args.targets)

    unless options["skip-build"]?
      build(config, args.envs, args.targets)

    console.log clc.green("Watching for changes ..")
    watch ".", (filename) ->
      try
        build(config, args.envs, args.targets)
        success("Rebuilt")
      catch e
        console.log clc.red("[ERROR]") + "#{e}"
        warn("Aborted.")


    # watch sources, (filename) ->
    #   rebuilt = false
    #   error = false
    #   for target in args.targets
    #     if error
    #       break
        
    #     for env in args.envs
    #       if config.hasSource(target, env, filename)
    #         files = config.getFiles(target, env)
    #         srcf = filename
    #         dstf = files[srcf]
    #         try
    #           buildFile(srcf, dstf, config, target, env)
    #         catch e
    #           error = true
    #           console.log clc.red("[ERROR] Building: '#{filename}' for '#{target}:#{env}'")
    #           console.log "Caused by: #{e}"
    #           warn(".built_at is not updated because application may be in unconsistent state.")
    #           warn("Aborted.")
    #           break

    #         rebuilt = true
    #         touchBuiltAt(config, target, env)

    #   if rebuilt and not error
    #     success("Rebuilt #{filename}")

module.exports = Watcher
  
