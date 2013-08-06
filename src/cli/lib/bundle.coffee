_         = require "./utils"
preproc   = require 'preproc'

class Bundle

  constructor: (@config, @target, @env)->
    @_reset()
    @deps = @_dependentMap()


  _reset: () ->
    t1 = new Date()
    options =
      copy: @config.getFiles("copy", @target, @env)
      build: @config.getFiles("build", @target, @env)
      env: @config.getContext(@target, @env)
      dest: @config.getDestination(@target, @env)
      builderConfig: @config.builderConfig

    @filesToBeCopied = options.copy
    @filesToBeBuilt  = options.build
    @context         = options.env
    @dest            = options.dest    
    @builder         = new preproc.Builder(libs: [_.path.resolve("./lib")])
    @builder.config(options.builderConfig)
    @builder.env     = @context
    t2 = new Date()

    dif = t1.getTime() - t2.getTime()
    Seconds_from_T1_to_T2 = dif / 1000
    Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2)
    
    console.log "Reset takes: #{Seconds_Between_Dates} s"

  build: () ->
    for srcf, dstf of @filesToBeCopied
      @_copyFile(srcf, dstf)

    for srcf, dstf of @filesToBeBuilt
      @_buildFile(srcf, dstf)
    
  changed: (filename) ->
    
    filename = _.path.resolve(filename)
    if !_.fs.existsSync(filename)
      console.log "Deleted #{filename}"
    
    else
      @_reset()
      
      if _.has(@filesToBeCopied, filename)
        console.log "Need to be re-copied: #{filename}"

      else if _.has(@deps, filename)
        console.log "Need to be rebuilt: #{@deps[filename]}"    
        
        # remap dependencies
        @deps = @_dependentMap()

      else
        console.log "Noting to do with #{filename}"


  _dependentMap: () ->
    if not @_dmap?
      @_dmap = {}
      for src in _.keys(@filesToBeBuilt)
        deps = @builder.dependenciesOf(src)
        dt = @builder.dependencyTree(src)

        deps.push(src)

        for dep in deps
          @_dmap[dep] ?= []
          @_dmap[dep].push(src)


      for k, v of @_dmap
        @_dmap[k] = _.uniq(v)
    
    @_dmap

  _buildFile: (srcf, dstf) ->
    try
      @builder.build(srcf, dstf)
    catch e
      msg = e
      
      if e.type is "PreprocessorError"
        msg = """

          PreprocessorError: #{e.message}
            at #{e.path}:#{e.line}:#{e.col}

        """
      
      _.fatal msg
  
  _copyFile: (srcf, dstf) ->
    _.copyFileSync(srcf, dstf)

  # constructor: (@config, @target, @env) ->
  #   @dest = @config.targets[target].dest[env]
  #   watch: ->   
  #     sources      = @config.getSources(@envs, @targets)
  #     unless options["skip-build"]?
  #       @build()

  #     console.log _.clc.green("Watching for changes ..")

  #     _.watch sources, (filename) ->
  #       try
  #         @build()
  #         _.success("Rebuilt")
  #       catch e
  #         _.error "#{e}"
  #         _.warn("Aborted.") 

  #     # rebuilt = false
  #     # error = false
  #     # for target in @targets
  #     #   if error
  #     #     break
        
  #     #   for env in @envs
  #     #     if @config.hasSource(target, env, filename)
  #     #       files = @config.getFiles(target, env)
  #     #       srcf = filename
  #     #       dstf = files[srcf]
  #     #       try
  #     #         @_buildFile(srcf, dstf, target, env)
  #     #       catch e
  #     #         error = true
  #     #         console.log _.clc.red("[ERROR] Building: '#{filename}' for '#{target}:#{env}'")
  #     #         console.log "Caused by: #{e}"
  #     #         _.warn(".built_at is not updated because application may be in unconsistent state.")
  #     #         _.warn("Aborted.")
  #     #         break 
  #     #       rebuilt = true
  #     #       @_touchBuiltAt(target, env) 
  #     # if rebuilt and not error
  #     #   _.success("Rebuilt #{filename}")


module.exports = Bundle