`#!/usr/bin/env node

`

nopt = require("nopt")
ncp  = require("ncp").ncp
path = require("path")
fs   = require("fs")
clc  = require('cli-color')
wget = require('wget')
Coffeebuild = require('coffeebuild')
watch = require('node-watch')

options = nopt({}, {}, process.argv, 2)

commands =

  # /*=================================
  # =            Init Task            =
  # =================================*/

  init:
    description: "Initialize the application from the PhoneGap root"
    run: ->
      if not commands.check.run(log: false) and not options.force?
        console.log """
          
          This folder is not suitable to be used as minigap installation target. 
          Use 'minigap check' to obtain more information about this inconvenient or 
          repeat 'minigap init' with '--force' flag to continue anyway.
          
          """
        process.exit(1)

      source = path.resolve path.dirname(fs.realpathSync(__filename)), '../dist'
      destination = "."
      ncp source, destination, (err) ->
        if err
          console.error(err)
          process.exit(1)
        
        else
          fs.openSync("minigap/app.coffee", 'w')

          if not options["skip-handlebars"]
            download = wget.download(
              "https://raw.github.com/wycats/handlebars.js/1.0.0/dist/handlebars.runtime.js", 
              './minigap/lib/handlebars.runtime.js'
              )
            
            download.on 'error', (err) ->
              console.log(err);
              process.exit(1)

            download.on 'end', ->
              console.log clc.green "done!"
            
          else
            console.log clc.green "done!"


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

command = commands[options.argv.remain[0]]

if not command?
  commands.help.run()
  process.exit(1)

command.run()

