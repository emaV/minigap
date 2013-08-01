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

  findInvalidTargets: (ts) ->
    validTs = @getAllTargets()
    invalidTs = []
    for t in ts
      if not _.contains(validTs, t)
        invalidTs.push(t)

    invalidTs
  
  findInvalidEnvs:(es)->
    validEs = @getAllEnvironments()
    invalidEs = []
    for e in es
      if not _.contains(validEs, e)
        invalidEs.push(e)

    invalidEs
  
  getAllEnvironments: () ->
    _.reject _.keys(@envs), (t) ->
      t.indexOf("*") != -1

  getAllTargets: () ->
    _.reject _.keys(@targets), (t) ->
      t.indexOf("*") != -1

  getDest: (target, env) ->
    @targets[target].dest[env]

  getBuilder: () ->
    @_builder

  getContext: (target, env) ->
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

  getFiles: (target, env) ->
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

  getSources: (envs, targets) ->
    ret = {}
    for t in targets
      for e in envs
        _.extend(ret, @getFiles(t,e))
    
    _.keys(ret)

readBuildConfig = (p)->
  configPath = path.resolve(p or "./config")
  readConf = require(configPath)
  config = new Config()
  readConf(config)
  config

module.exports = readBuildConfig