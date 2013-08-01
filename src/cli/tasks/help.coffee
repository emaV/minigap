_ = require("../lib/utils")

module.exports = (runner) ->
  runner.task "help", "Display this screen of help", {}, {}, ->
    runner.usage()