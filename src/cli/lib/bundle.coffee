_         = require "./utils"
preproc   = require 'preproc'

class Bundle

  constructor: (options)->
    @filesToBeCopied = options.copy
    @filesToBeBuilt  = options.build
    @context         = options.env
    @dest            = options.dest
    @builder         = new preproc.Builder(libs: [_.path.resolve("./lib")])

    @builder.config(options.builderConfig)
    @builder.env = @context


  build: () ->
    for srcf, dstf of @filesToBeCopied
      @_copyFile(srcf, dstf)

    for srcf, dstf of @filesToBeBuilt
      @_buildFile(srcf, dstf)
    
  changed: (filename) ->
    throw "Not implemented yet"

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