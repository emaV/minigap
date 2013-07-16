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
    description: "Check if current folder is ready to install"
    run: (options = {log: true}) ->
      res = false
      try
        stats1 = fs.lstatSync("www")
        stats2 = fs.lstatSync("cordova")
        already_installed = fs.existsSync("minigap")

        res = stats1.isDirectory() and stats2.isDirectory() and not already_installed

      if options.log
        if res
          console.log """
            

            #{clc.green('[VALID]')} This is a PhoneGap project root and can be used to install minigap.

            """
        else
          if already_installed
            console.log clc.red """
              

              #{clc.red('[INVALID]')} It seems that minigap is already installed here.

              Use 'minigap init --force' to proceed with installation anyway.
              
              """

          else      
            console.log clc.red """
              
              
              #{clc.red('[INVALID]')} This is not a PhoneGap project root and may be unsuitable to install minigap.

              Use 'minigap init --force' to proceed with installation anyway.
              
              """

      res


  # /*=================================
  # =           Build Task            =
  # =================================*/

  build:
    description: "Build the application"
    run: ->
      builder = new Coffeebuild.Builder()
      .with("coffee")
      .source("minigap/app.coffee")
      .coffee()
      .store("www/js/app.js")
      .do (task) ->
        console.log clc.green "done!"
        task.done()


  # /*=================================
  # =           Watch Task            =
  # =================================*/

  watch:
    description: "Watch for changes on the source code and rebuild the application"
    run: ->
      filter = (pattern, fn) ->
        (filename) ->
          fn filename  if pattern.test(filename)

      watch './minigap', filter(/\.(coffee|html|js)$/, (filename) ->
          console.log "File Cambiato"
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
console.log cmd
command = commands[cmd]

if not command?
  commands.help.run()
  process.exit(1)

command.run.apply(null, options.argv.remain)

