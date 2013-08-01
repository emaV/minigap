module.exports = (config) ->

  ###
    Environments
  ###

  config.env "*",
    title: "MyApp"

  config.env "dev",
    origin:   "localhost:3001"
    bind:     "localhost:3000"

  config.env "dist",
    origin:   "http://ds.example.org/"
    bind:     "localhost:80"

  ###
    Targets
  ###

  config.target "server",
    files:
      "app/js/app.coffee":  "server.js"

    dest:
      dev:  "dev"
      dist: "dist"

    run:  "server.js"

  config.target "browser",
    files:
      "app/js/app.coffee":  "js/app.js"
      "app/layout.html":  "index.html"

    dest:
      dev:  "dev/public"
      dist: "dist/public"

  ###
    Dependencies
  ###

  ###
  config.dep "handlebars",
      base: 'dist'
      files: [ "handlebars.runtime.js" ]
  ###
