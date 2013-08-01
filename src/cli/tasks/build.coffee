Builder = require "../lib/builder"

module.exports = (runner) ->
  runner.task "build", "Build application", {}, {}, (targets...)->
    @h.check()
    Builder.build(targets, @options)