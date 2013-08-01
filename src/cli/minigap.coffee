`#!/usr/bin/env node

`
_       = require("./lib/utils")
Runner  = require("./lib/runner")

options   = _.parseArgv()
taskName  = options.argv.remain.shift()
args      = options.argv.remain

runner  = new Runner("minigap", options)

# load tasks
_.each _.glob(_.path.resolve(__dirname, "tasks/*")), (p) ->
  p.slice(0, p.indexOf("."))
  conf = require(p)
  if typeof conf is "function"
    conf(runner)

# run task
runner.run(taskName, args)