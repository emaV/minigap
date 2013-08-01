Builder = require "../lib/builder"

module.exports = (runner) ->
  runner.task "build", "Build application", {}, {}, (targets...)->
    @h.check()
    builder = new Builder(targets, @options)
    builder.build()