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
    @builder         = new preproc.Builder #(libs: [_.path.resolve("./lib")])
    hbsOptions =
      types:
        handlebars:
          delimiters: ["<!--=", "-->"]
          extensions: ['.hbs']
          to:
            coffeescript: (content, filename) ->
              handlebars = require("handlebars")
              path = require("path")
              templateName = path.basename(filename, ".hbs")
              template = handlebars.precompile(content)
              res = if templateName.slice(0,1) is "_"
                templateName = templateName.replace(/^_/, "")
                'Handlebars.partials[\'' + templateName + '\'] = Handlebars.template(`' + template + '`)\n'
              else
                'Minigap.templates[\'' + templateName + '\'] = Handlebars.template(`' + template + '`)\n'
              res

    @builder.config(_.extend({}, hbsOptions, options.builderConfig or {}))
    @builder.env     = @context


  build: () ->
    @_reset()

    for srcf, dstf of @filesToBeCopied
      @_copyFile(srcf, dstf)

    for srcf, dstf of @filesToBeBuilt
      @_buildFile(srcf, dstf)

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


module.exports = Bundle
