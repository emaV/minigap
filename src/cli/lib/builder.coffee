_ = require("./utils")

class Builder
  constructor: (targets, options) ->
    readBuildConfig = require("./config")
    @config = readBuildConfig()
    args = @_parseBuildArgs(targets, options)
    @targets = args.targets
    @envs = args.envs

  _parseBuildArgs: (targets, options) ->
    envs = null
    if !options.env?
      allEnvs   = @config.getAllEnvironments()
      if allEnvs.length == 0
        _.fatal("There is no environment declared in your configuration.")
      
      firstEnv  = allEnvs[0]
      envs      = [firstEnv]
      _.warn("No environment specified: assuming '#{firstEnv}'")

    else
      envs = options.env.split(",")
      invalidEnvs = @config.findInvalidEnvs(envs)
      if invalidEnvs.length > 0
        _.fatal("Unknown environment#{if invalidEnvs.length > 1 then 's' else ''}: #{invalidEnvs.join(', ')}")
      

    if targets.length == 0
      targets = @config.getAllTargets()
      _.warn("No targets specified: building for all targets..")
    else
      invalidTargets = @config.findInvalidTargets(targets)
      if invalidTargets.length > 0
        _.fatal("Unknown target#{if invalidTargets.length > 1 then 's' else ''}: #{invalidTargets.join(', ')}")

    console.log "\n"
    
    {
      targets: targets, 
      envs: envs
    }

  _touchBuiltAt: (target, env) ->
    if env is "dev"
      built_at = _.path.resolve(@config.getDest(target, env), ".built_at")
      _.touch(built_at)

  _buildFile = (srcf, dstf, target, env) ->

    extensions   = @config.knownExtensions()
    extensionsRe = new RegExp("\\.(#{extensions.join('|')})$")
    builder = @config.getBuilder()
    ctx     = @config.getContext(target, env)
    builder.env = ctx

    try
      if srcf.match(extensionsRe)
        builder.build(srcf, dstf)    
      else if path.extname(srcf) is path.extname(dstf)
        _.copyFileSync(srcf, dstf)
      else
        _.fatal "Your configuration does not define how to build #{srcf} to #{dstf}."

      if typeof @config.fileBuilt is "function"
        @config.fileBuilt(dstf, target, env)

    catch e
      if e.type is "PreprocessorError"
        msg = """

          PreprocessorError: #{e.message}
            at #{e.path}:#{e.line}:#{e.col}

        """
        throw msg
      else
        throw e

  build: (envs, targets) ->
    for target in targets
      for env in envs
        console.log "Building #{target}:#{env}"
        files   = @config.getFiles(target, env)

        for srcf, dstf of files
          @_buildFile(srcf, dstf, target, env)
        
        @_touchBuiltAt(target, env)

        if typeof @config.built is "function"
          @config.built(target, env)
        
        if typeof @config.done is "function"
          @config.done(targets, envs)  

        _.success("Done.\n")

  watch: ->    
    sources      = @config.getSources(@envs, @targets)
    unless options["skip-build"]?
      @build()

    console.log _.clc.green("Watching for changes ..")

    # _.watch sources, (filename) ->
    #   try
    #     @build()
    #     _.success("Rebuilt")
    #   catch e
    #     _.error "#{e}"
    #     _.warn("Aborted.") 

    rebuilt = false
    error = false
    for target in @targets
      if error
        break
      
      for env in @envs
        if @config.hasSource(target, env, filename)
          files = @config.getFiles(target, env)
          srcf = filename
          dstf = files[srcf]
          try
            @_buildFile(srcf, dstf, target, env)
          catch e
            error = true
            console.log _.clc.red("[ERROR] Building: '#{filename}' for '#{target}:#{env}'")
            console.log "Caused by: #{e}"
            _.warn(".built_at is not updated because application may be in unconsistent state.")
            _.warn("Aborted.")
            break 
          rebuilt = true
          @_touchBuiltAt(target, env) 
    if rebuilt and not error
      _.success("Rebuilt #{filename}")

module.exports = new Builder()