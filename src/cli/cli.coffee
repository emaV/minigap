`#!/usr/bin/env node

`

nopt = require("nopt")
ncp  = require("ncp").ncp
path = require("path")
fs   = require("fs")
clc  = require('cli-color')
sh   = require('execSync')
mkdirp = require('mkdirp')
options = nopt({}, {}, process.argv, 2)
OPTIONS = options

run = (cmd, args...)->
  commands[cmd].run.apply(null, args)

readBuildConfig = require("./config")



commands =

  # /*=================================
  # =            Init Task            =
  # =================================*/

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

      if options.coffee
        env.run('app', {coffee: true}, done)
      else
        env.run('app', {js: true}, done)

      


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

  build:
    description: "Build the application"
    run: (targets...) ->
      commands.check.run()
      config = readBuildConfig()
      config.build()


  # /*=================================
  # =           Watch Task            =
  # =================================*/

  watch:
    description: "Watch for changes on the source code and rebuild the application"
    run: (targets...)->
      commands.check.run()

      config       = readBuildConfig()
      extensions   = config.knownExtensions()
      extensionsRe = extensions.join("|")

      watch = require('node-watch')
      filter = (pattern, fn) ->
        (filename) ->
          fn filename  if pattern.test(filename)
      www = path.resolve('./www')
      console.log clc.green("Watching for source changes in #{www}")
      watch './www', filter(new RegExp("\\.(#{extensionsRe})$"), (filename) ->
          commands.build.run.apply(null, targets)
        )



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

