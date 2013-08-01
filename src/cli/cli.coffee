`#!/usr/bin/env node

`

nopt = require("nopt")
wrench  = require("wrench")
path = require("path")
fs   = require("fs")
clc  = require('cli-color')
sh   = require('execSync')
mkdirp = require('mkdirp')
watch = require('node-watch')

options = nopt({}, {}, process.argv, 2)
OPTIONS = options

run = (cmd, args...)->
  commands[cmd].run.apply(null, args)

readBuildConfig = require("./config")

error = (msg) ->
  console.log clc.red("[ERROR] #{msg}")
  process.exit(1)

warn = (msg) ->
  console.log clc.yellow("[WARN] #{msg}")

success = (msg) ->
  console.log clc.green("[SUCCESS] #{msg}")

parseBuildArgs = (config, targets, options) ->
  envs = null
  if !options.env?
    allEnvs   = config.getAllEnvironments()
    if allEnvs.length == 0
      error("There is no environment declared in your configuration.")
    
    firstEnv  = allEnvs[0]
    envs      = [firstEnv]
    warn("No environment specified: assuming '#{firstEnv}'")
  else
    envs = options.env.split(",")
    invalidEnvs = config.findInvalidEnvs(envs)
    if invalidEnvs.length > 0
      error("Unknown environment#{if invalidEnvs.length > 1 then 's' else ''}: #{invalidEnvs.join(', ')}")
    

  if targets.length == 0
    targets = config.getAllTargets()
    warn("No targets specified: building for all targets..")
  else
    invalidTargets = config.findInvalidTargets(targets)
    if invalidTargets.length > 0
      error("Unknown target#{if invalidTargets.length > 1 then 's' else ''}: #{invalidTargets.join(', ')}")

  console.log "\n"
  
  {
    targets: targets, 
    envs: envs
  }

copyFileSync = (srcFile, destFile) ->
  BUF_LENGTH = 64*1024
  buff = new Buffer(BUF_LENGTH)
  fdr = fs.openSync(srcFile, 'r')
  fdw = fs.openSync(destFile, 'w')
  bytesRead = 1
  pos = 0
  while bytesRead > 0
    bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos)
    fs.writeSync(fdw,buff,0,bytesRead)
    pos += bytesRead
  fs.closeSync(fdr)
  fs.closeSync(fdw)


build = (config, envs, targets) ->
  
  config       = readBuildConfig()
  extensions   = config.knownExtensions()
  extensionsRe = new RegExp("\\.(#{extensions.join('|')})$")

  for target in targets
    for env in envs
      console.log "Building #{target}:#{env}"

      builder = config.getBuilder()
      ctx     = config.getContext(target, env)
      files   = config.getFiles(target, env)

      for srcf, dstf of files
        builder.env = ctx
        try
          if srcf.match(extensionsRe)
            builder.build(srcf, dstf)    
          else if path.extname(srcf) is path.extname(dstf)
            copyFileSync(srcf, dstf)
          else
            error "Your configuration does not define how to build #{srcf} to #{dstf}."

        catch e
          if e.type is "PreprocessorError"
            console.log ""
            console.log "PreprocessorError: #{e.message}"
            console.log "  at #{e.path}:#{e.line}:#{e.col}"
            console.log ""
            error = true
            break
      
          else
            throw e
      
      if env is "dev"
        # touch ".built_at"
        fs.writeSync(path.resolve(config.getBase(), ".built_at"), (new Date()).toString())

      if typeof config.built is "function"
        config.built(target, env)
      
      if typeof config.done is "function"
        config.done(targets, envs)  

      success("Done.\n")


commands =

  # /*================================
  # =            New Task            =
  # ================================*/

  "new":
    description: "Create a new minigap application"
    run: (appPath) ->

      absPath = path.resolve(appPath)
      appName = path.basename(appPath)

      if not mkdirp.sync(appPath)
        console.log clc.red """

          An error occurred while creating path: #{appPath}

        """
        process.exit(1)

      generatorPath = path.resolve(__dirname, "../generators")

      process.chdir(appPath)
      
      yeoman = require('yeoman-generator')
      env = yeoman()
      env.appendPath(generatorPath)
      env.lookup(generatorPath)

      done = ->
        console.log clc.green "done!"

      if options.js
        env.run('app', {js: true}, done)
      else
        env.run('app', {coffee: true}, done)
      


  # /*=================================
  # =           Check Task            =
  # =================================*/

  check:
    description: "Checks if current folder is inside a minigap project"
    run: () ->
      if not fs.existsSync(".minigap")
        console.log clc.red """
                      
        #{clc.red('[ERROR]')} This is not a minigap project root.
        
        """
        process.exit(1)
      else
        true


  # /*=================================
  # =           Build Task            =
  # =================================*/

  # minigap build
  # minigap build --env=dev browser server
  build:
    description: "Build the application"
    run: (targets...) ->
      commands.check.run()
      config = readBuildConfig()
      args = parseBuildArgs(config, targets, OPTIONS)
      build(config, args.envs, args.targets)


  # /*=================================
  # =           Watch Task            =
  # =================================*/

  watch:
    description: "Watch for changes on the source code and rebuild the application"
    run: (targets...)->
      commands.check.run()

      config       = readBuildConfig()
      args         = parseBuildArgs(config, targets, OPTIONS)
      sources      = config.getSources(args.envs, args.targets)

      console.log clc.green("Watching for changes ..")
      watch sources, (filename) ->
        build(config, args.envs, args.targets)

  # /*=================================
  # =           Help Task             =
  # =================================*/

  help:
    description: "Display this screen of help"
    run: ->
      console.log """

        USAGE: 
          minigap COMMAND

        COMMANDS:
        """

      for name, command of commands
        padded_name = ("            " + name).slice(-10)
        console.log "#{padded_name}       #{command.description}"

      console.log ""


#
# MAIN
#

cmd = options.argv.remain.shift()
command = commands[cmd]

if not command?
  commands.help.run()
  process.exit(1)

command.run.apply(null, options.argv.remain)

