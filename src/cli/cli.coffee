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

run = (cmd, args...)->
  commands[cmd].run.apply(null, args)

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
    run: ->
      commands.check.run()
      require("coffee-script")

      configPath = path.resolve("./config/build")
      readConf = require(configPath)
      preproc = require('preproc')

      builder = null
      files = {}

      builderAdapter = {

        root: (src) ->
          path.resolve(".", src)

        config: (config)  ->
          builder = new preproc.Builder(config)

        build: (from, to) ->
          files[from] = to

      }

      readConf(builderAdapter)
      console.log builder

  # /*=================================
  # =           Watch Task            =
  # =================================*/

  watch:
    description: "Watch for changes on the source code and rebuild the application"
    run: ->
      commands.check.run()

      watch = require('node-watch')
      filter = (pattern, fn) ->
        (filename) ->
          fn filename  if pattern.test(filename)
      www = path.resolve('./www')
      console.log clc.green("Watching for changes in #{www}")
      watch './www', filter(/\.(coffee|html|js)$/, (filename) ->
          commands.build.run()
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

