preproc   = require "preproc"
path      = require "path"
coffee    = require "coffee-script"
_         = require "underscore"
minimatch = require "minimatch"
glob      = require("glob").sync


_quoteRe = (str) ->
  str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

class Config
  constructor: () ->
    @targets = {}
    @envs = {}
    @deps = {}
    @_builder = new preproc.Builder(libs: [path.resolve("./lib")])

  env:     (name, opts) ->
    @envs[name] ||= {}
    _.extend(@envs[name], opts)

  builder: (opts) ->
    if opts
      @_builder.config(opts)
    
    @_builder

  target:  (name, opts) ->
    @targets[name] = opts

  dep:    (name, opts) ->
    @deps[name] = opts

  knownExtensions: ->
    self = @
    exts = _.keys(@_builder.types.extensions)
    _.map exts, (ext) ->
      if ext.slice(0,1) is "."
        ext = ext.slice(1)
      ext
      
      _quoteRe(ext)

  _context: (target, env) ->
    ctx = {}

    for name, opts of @envs
      if minimatch(env, name)
        _.extend(ctx, opts)

    for name, opts of @targets
      if minimatch(target, name)
        if opts.env?
          _.extend(ctx, opts.env)

    ctx.target = target
    ctx.env = env
    ctx

  _files: (target, env) ->
    base = @targets[target].dest[env]
    return {} if !base?
    files = {}

    # collects target+env related files decl
    for name, opts of @targets
      if minimatch(target, name)
        if opts.files?
          _.extend(files, opts.files)
    
    # resolves globs
    res = {}
    for k, v of files
      if k.indexOf("*") == -1
        res[k] = path.join(base, v)
      else
        fixedPartIdx = k.split("*")[0].lastIndexOf(path.sep)
        globres = glob(k)
        
        destBase = v
        destExt = null
        if _.isArray(destBase)
          destBase = v[0]
          destExt = v[1]
        
        for f in globres
          dest = f.slice(fixedPartIdx)
          if destExt?
            bn = path.basename(dest)
            dn = path.dirname(dest)

            noExt = bn.slice(0, bn.indexOf("."))
            dest =  path.join dn, "#{noExt}.#{destExt}"
          res[f] = path.join(base, destBase, dest)
 
    res

  build: (target, env) ->
    # if targets.length == 0
    #   targets = getAllTargets()
    
    # if OPTIONS["dist"]
    #   builder.env.production  = true
    #   builder.env.development = false
    #   dir = "dist"
    # else
    #   builder.env.development = true
    #   builder.env.production  = false
    #   dir = "dev"

    # error = false
    # for target in targets
    #   if error
    #     break
      
    #   for srcfile, dstfile of files
    #     srcf = path.resolve("www", srcfile)
    #     dstf = path.resolve("targets", target, dir, "www", dstfile)
    #     builder.env.target = target
    #     try
    #       builder.build(srcf, dstf)
    
    #     catch e
    #       if e.type is "PreprocessorError"
    #         console.log ""
    #         console.log "PreprocessorError: #{e.message}"
    #         console.log "  at #{e.path}:#{e.line}:#{e.col}"
    #         console.log ""
    #         error = true
    #         break
    
    #       else
    #         throw e

readBuildConfig = (p)->
  configPath = path.resolve(p or "./config")
  readConf = require(configPath)
  config = new Config()
  readConf(config)
  config

module.exports = readBuildConfig