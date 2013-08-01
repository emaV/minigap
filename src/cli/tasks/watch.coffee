Builder = require "../lib/builder"

module.exports = (runner) ->
  runner.task "watch", "Watch for changes on the source code and rebuild the changed sources only", {}, {}, (targets...)->
    @h.check()
    builder = new Builder(targets, @options)
    builder.watch()