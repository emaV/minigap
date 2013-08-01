class Builder
  constructor: (config, targets, options) ->
    

module.exports = Builder
  


# readBuildConfig = require("./config")




# parseBuildArgs = (config, targets, options) ->
#   envs = null
#   if !options.env?
#     allEnvs   = config.getAllEnvironments()
#     if allEnvs.length == 0
#       error("There is no environment declared in your configuration.")
    
#     firstEnv  = allEnvs[0]
#     envs      = [firstEnv]
#     warn("No environment specified: assuming '#{firstEnv}'")
#   else
#     envs = options.env.split(",")
#     invalidEnvs = config.findInvalidEnvs(envs)
#     if invalidEnvs.length > 0
#       error("Unknown environment#{if invalidEnvs.length > 1 then 's' else ''}: #{invalidEnvs.join(', ')}")
    

#   if targets.length == 0
#     targets = config.getAllTargets()
#     warn("No targets specified: building for all targets..")
#   else
#     invalidTargets = config.findInvalidTargets(targets)
#     if invalidTargets.length > 0
#       error("Unknown target#{if invalidTargets.length > 1 then 's' else ''}: #{invalidTargets.join(', ')}")

#   console.log "\n"
  
#   {
#     targets: targets, 
#     envs: envs
#   }



# touchBuiltAt = (config, target, env) ->
#   if env is "dev"
#     # touch ".built_at"
#     built_file = path.resolve(config.getDest(target, env), ".built_at")
#     built_at = (new Date()).toString()
#     fs.writeFileSync(built_file, built_at)

# buildFile = (srcf, dstf, config, target, env) ->
#   #console.log "buildFile(#{srcf}) for #{target}:#{env}"
#   extensions   = config.knownExtensions()
#   extensionsRe = new RegExp("\\.(#{extensions.join('|')})$")
#   builder = config.getBuilder()
#   ctx     = config.getContext(target, env)
#   builder.env = ctx
#   try
#     if srcf.match(extensionsRe)
#       builder.build(srcf, dstf)    
#     else if path.extname(srcf) is path.extname(dstf)
#       copyFileSync(srcf, dstf)
#     else
#       error "Your configuration does not define how to build #{srcf} to #{dstf}."

#     if typeof config.builtFile is "function"
#       config.builtFile(dstf, target, env)

#   catch e
#     if e.type is "PreprocessorError"
#       msg = """

#         PreprocessorError: #{e.message}
#           at #{e.path}:#{e.line}:#{e.col}

#       """
#       throw msg
#     else
#       throw e


# build = (config, envs, targets) ->
#   config       = readBuildConfig()
#   for target in targets
#     for env in envs
#       console.log "Building #{target}:#{env}"
#       files   = config.getFiles(target, env)

#       for srcf, dstf of files
#         buildFile(srcf, dstf, config, target, env)
      
#       touchBuiltAt(config, target, env)

#       if typeof config.built is "function"
#         config.built(target, env)
      
#       if typeof config.done is "function"
#         config.done(targets, envs)  

#       success("Done.\n")
