_         = require "./utils"
preproc   = require 'preproc'

class Bundle

  constructor: (@config, @target, @env)->

  _reset: () ->

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
    @builder         = new preproc.Builder
    @builder.config(options.builderConfig)
    @builder.env     = @context

  build: (options = {}) ->
    @_reset()

    unless options.skipCopy?
      for srcf, dstf of @filesToBeCopied
        @_copyFile(srcf, dstf)

    unless options.skipBuild?    
      for srcf, dstf of @filesToBeBuilt
        @_buildFile(srcf, dstf)

      

  _buildFile: (srcf, dstf) ->
    @builder.build(srcf, dstf)    

  _copyFile: (srcf, dstf) ->
    _.copyFileSync(srcf, dstf)


module.exports = Bundle
