yeoman = require('yeoman-generator')
env = yeoman()

module.exports = (runner) ->
  runner.task "new", "Create a new minigap application", {}, {}, (appPath) ->
    absPath = @h.path.resolve(appPath)
    appName = @h.path.basename(appPath)

    if not appPath?
      @h.fatal "You should provide a PATH"

    if @h.fs.existsSync(appPath)
      @h.fatal "Path '#{appPath}' already exists."

    if not @h.mkdirp(appPath)
      @h.fatal "An error occurred while creating path: #{appPath}"

    generatorPath = @h.path.resolve(__dirname, "../../generators")

    process.chdir(appPath)
    
    env.appendPath(generatorPath)
    env.lookup(generatorPath)

    done = ->
      runner.h.success "done!"

    if @options.js
      env.run('app', {js: true}, done)
    else
      env.run('app', {coffee: true}, done)

