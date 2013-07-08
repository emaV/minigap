#= require core/namespace
#= require_tree ./interfaces
#= require core/emitter
#= require core/router

class @Minigap.App
  constructor: (options = {}) ->
    
    @router = new Minigap.Router()

    # @helpers         = {}
    # self = @
    # for helper in Minigap.helpers
    #   for name, func of helper
    #     @helpers[name] = (-> func.call)

    @template_engine = new Minigap.DefaultTemplateEngine(@)
    
    @dom_helper      = new Minigap.DomHelper()    

    @frames = {}
  
    if options.frames?
      for name, selector of options.frames
        @frames[name] = new Minigap.Frame(selector)
      
    @origins = {}
  
    if options.origins?
      for name, origin of options.origins
        @origins[name] = origin
        @origins[name].setApp(@)

    if options.origin?
      @origins.main = options.origin
      @origins.main.setApp(@)

    @origin = @origins.main

    @globals = {}

  on: (events, func) ->   
    Minigap.Emitter.on(events, @, func)

  off: (events, uid) ->
    Minigap.Emitter.off(events, uid)

  emit: (event, params = {}) ->
    Minigap.Emitter.emit(event, params)

  goto: (path) ->
    @router.goto(path)

  request: (path, params, options, func) ->
    @origin.request(path, params, options, func)

  start: () ->
    self = @
    @dom_helper.deviceReady ->
      @dom_helper.documentReady ->
        self._doStart

  _doStart: ->
    for controller in Minigap.controllers
      for evt, func of controller
        @on(evt, func)

    #@dom_helper.click2tap("body")
    @router.start()
    @emit("app.started")
  
  render: (template, context, options, func) ->
    
    cb = undefined
    
    if typeof context is 'function'
      cb = context
      options = {}
      context = {}
    else if typeof options is 'function'
      cb = options
      options = {}
    else if typeof func is 'function'
      cb = func

    options ?= {}
    cb ?= ->

    frame  = @frames[options.frame or "main"]
    method = frame[options.method or "replaceContent"]
    
    templateApplyed = (html) ->
      method.call(frame, html)
      @dom_helper.click2tap(frame.selector)
      cb.call(@)

    @template_engine.applyTemplate(template, context, @utils.proxy(templateApplyed, @))



