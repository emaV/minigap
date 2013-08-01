_ = require("./utils")

class Runner
  constructor: (@programName, @options) ->
    @tasks = {}
    @h = _

  helper: (name, func) ->
    @h[name] = (args...) ->
      func.apply(@, args)

  task: (name, description, args, options, run) ->
    @tasks[name] = {description: description, run: run, arguments: args, options: options}

  run: (cmd, args)->
    if !@tasks[cmd]?
      _.error("Wrong arguments.")
      @usage()
    else
      @tasks[cmd].run.apply(@, args)

  invoke: (cmd, args...) ->
    @run(cmd, args)

  usage: () ->    
    console.log """


    USAGE: 
      #{@programName} TASK

    TASKS:

    """

    for name, task of @tasks
      padded_name = ("            " + name).slice(-10)
      console.log "#{padded_name}       #{task.description}"

    console.log ""

module.exports = Runner
