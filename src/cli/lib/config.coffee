coffee    = require "coffee-script"
_         = require "./utils"
Bundle    = require "./bundle"

class Config
  constructor: () ->
    @bundles = {}
    @targets = {}
    @envs = {}
    @deps = {}
    @builderConfig = {}
    @runnables = {}

  env:     (name, opts) ->
    @envs[name] ||= {}
    _.extend(@envs[name], opts)

  builder: (opts) ->
    _.extend(@builderConfig, opts)

  target:  (name, opts) ->
    @targets[name] = opts

  dep:    (name, opts) ->
    @deps[name] = opts

  # First matching destination root
  getDestination: (target, env) ->
    decls = @targets[target].dests or {}
    for declEnv, path of decls
      if _.minimatch(env, declEnv)
        return path
    null

  # First matching source root
  getSrc: (target, env) ->
    decls = @targets[target].sources or {}
    for declEnv, path of decls
      if _.minimatch(env, declEnv)
        return path
    null

  # All matching bases
  getBases: (target, env) ->
    decls = @targets[target].bases or {}
    bases = []
    for declEnv, path of decls
      if _.minimatch(env, declEnv)
        bases.push(_.path.resolve(path))

    _.uniq(bases)

  runnable: (name, obj) ->
    @runnables[name] = obj

  # All files (non-resolved) that needs to be built for a target-env pair
  getFilesToBuild: (target, env) ->
    decls = @targets[target].build or {}
    src = @getSrc(target, env)
    if !src
      throw "Source path not defined for #{target}:#{env}"

    res = {}
    for declEnv, files of decls
      if _.minimatch(env, declEnv)
        for srcFile, dstFile of files
          res[_.path.join(src, srcFile)] = dstFile


    res


  getFiles: (mode, target, env) ->    
    destinationRoot = @getDestination(target, env)
    if !destinationRoot?
      throw "Destination root not defined for #{target}:#{env}"

    files = {}

    if mode == "copy"
      bases = @getBases(target,env)
      for base in bases
        files["#{base}/**/*"] = ""
      
    else if mode == "build"
      
      for name, opts of @targets
        _.extend(files, @getFilesToBuild(target, env))
            
    
    # resolves globs
    res = {}
    for k, v of files
      if k.indexOf("*") == -1
        res[_.path.resolve(k)] = _.path.resolve(_.path.join(destinationRoot, v))
      else
        fixedPartIdx = k.split("*")[0].lastIndexOf(_.path.sep)
        globres = _.glob(k)
        
        destBase = v
        destExt = null
        if _.isArray(destBase)
          destBase = v[0]
          destExt = v[1]
        
        for f in globres
          dest = f.slice(fixedPartIdx)
          if destExt?
            bn = _.path.basename(dest)
            dn = _.path.dirname(dest)

            noExt = bn.slice(0, bn.indexOf("."))
            dest =  _.path.join dn, "#{noExt}.#{destExt}"
          res[_.path.resolve(f)] = _.path.resolve(_.path.join(destinationRoot, destBase, dest))
 
    res

  getContext: (target, env) ->
    context = {}

    for name, opts of @envs
      if _.minimatch(env, name)
        _.extend(context, opts)

    for name, opts of @targets
      if _.minimatch(target, name)
        if opts.env?
          _.extend(context, opts.env)

    context.target = target
    context.env = env
    context

  availableTargets: () ->
    _.reject _.keys(@targets), (t) ->
      t.indexOf("*") != -1

  availableEnvironments: () ->
    _.reject _.keys(@envs), (t) ->
      t.indexOf("*") != -1

  getBundle: (target, env) ->
    bid = "#{target}:#{env}"

    if not @bundles[bid]?
      @bundles[bid] = new Bundle(@, target, env)
    @bundles[bid]



readBuildConfig = (path)->
  readConf  = require(_.path.resolve(path or "./src/config"))
  configDsl = new Config()
  readConf(configDsl)
  conf = configDsl
  srcPath = _.path.resolve(__dirname, "../../dist")
  hbsOptions =
    libs: [srcPath]
    types:
      handlebars:
        delimiters: ["<!--=", "-->"]
        extensions: ['.hbs']
        to:
          coffeescript: (content, srcPath) ->
            handlebars = require("handlebars")
            path = require("path")
            templateName = path.basename(srcPath, ".hbs")
            template = handlebars.precompile(content)
            res = if templateName.slice(0,1) is "_"
              templateName = templateName.replace(/^_/, "")
              'Handlebars.partials[\'' + templateName + '\'] = Handlebars.template(`' + template + '`)\n'
            else
              'Minigap.templates[\'' + templateName + '\'] = Handlebars.template(`' + template + '`)\n'
            res

  conf.builderConfig = _.extend(hbsOptions, conf.builderConfig)
  conf


module.exports = readBuildConfig