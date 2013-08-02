module.exports = (runner) ->
  
  #
  #

  runner.helper "parseTargets", (config, envs) ->
    availableTargets = config.availableTargets()

    if @h.isEmpty(targets)
      targets = availableTargets
      @h.warn("No targets specified: building for all targets..")
    
    invalidTargets = @h.difference(@h.union(availableTargets, targets), availableTargets)

    if invalidTargets.length > 0
      @h.fatal("Unknown target#{if invalidTargets.length > 1 then 's' else ''}: #{invalidTargets.join(', ')}")

    targets

  #
  # 
  
  runner.helper "parseEnvs", (config, envs) ->
    
    availableEnvs = config.availableEnvironments()

    if @h.isEmpty(envs)
      if @h.isEmpty(availableEnvs)
        @h.fatal("There is no environment declared in your configuration.")
      else
        envs      = [availableEnvs[0]]
        @h.warn("No environment specified: assuming '#{envs[0]}'")
    
    invalidEnvs = @h.difference(@h.union(availableEnvs, envs), availableEnvs)

    if invalidEnvs.length > 0
      @h.fatal("Unknown environment#{if invalidEnvs.length > 1 then 's' else ''}: #{invalidEnvs.join(', ')}")
    
    envs

  #
  #
  
  runner.helper "check", ->
    if not @h.fs.existsSync(".minigap")
      @h.fatal("This is not a minigap project root")
    else
      true

  runner.helper "readBuildConfig", ->
    readBuildConfig = require("../lib/config")
    readBuildConfig()
