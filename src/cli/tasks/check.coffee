module.exports = (runner) ->
  runner.helper "check", ->
    if not @h.fs.existsSync(".minigap")
      @h.fatal("This is not a minigap project root")
    else
      true