`
//= require "../lib/handlebars.runtime.js" --skip
//= require "../lib/jquery2.js" --skip
//= require "../lib/davis.js" --skip
//= require "../lib/form-serializer.js" --skip
//= require "./runtime.js"
`

class BrowserActionContext extends Minigap.ActionContext
  constructor: (@impl = {})->
    super()
    @document = $

class Minigap.BrowserRuntime extends Minigap.Runtime
  constructor: () ->
    @controllers = []
    @app = null
    super()

  ajax: $.ajax

  controller: (controller) ->
    @controllers.push(controller)

  redirect: (name, params = {}) ->
    if name.slice(0,1) is "/"
      Davis.location.replace(new Davis.Request ({
            method: 'get',
            fullPath: name,
            title: name
          }), params)

  eventsTimeouts = {}

  start: () => 
    controllers = @controllers
    doc = $(document)
    doc.on "submit", (e) ->
      if not e._minigapHandled?
        form = $(e.target)
        evt = $.Event("submit")
        evt._minigapHandled = true
        evt.object = form.serializeObject()
        form.trigger(evt)
        e.stopPropagation()
        false

    @app = Davis -> 
      davis = @
      for controller in controllers
        for name, action of controller
          
          ((routePath, routeAction)->
            e = parseEventName(routePath)
            callback = (evt) ->
              routeAction.apply(new BrowserActionContext(), [evt])

            switch e.type
              when "route"
                davis.get e.route, callback

              when "dom"
                args = [e.events]

                if e.selector?
                  args.push(e.selector)

                if e.timeout?
                  args.push (evt) ->
                    clearTimeout(eventsTimeouts[e])
                    eventsTimeouts[e] = setTimeout (->callback(evt)), e.timeout
                else
                  args.push(callback)
                
                doc.on.apply(doc, args)

          )(name, action)

    $(document).ready =>
      @app.start()

  # private
  parseEventName = (e) ->
    res = {}
    if e.slice(0,1) is "/"
      res.type  = "route"
      res.route = e
    else
      res.type     = "dom"

      m = e.match(/\s+([1-9][0-9]*)$/)
      res.events   = ""
      res.selector = ""
      res.timeout  = null

      if m
        res.timeout = parseInt(m[1])
        e = e.replace(/\s+[1-9][0-9]*$/, "")

      e= e.replace(/\s*,\s*/g, ",").replace(/\s+/g, " ")

      split = e.indexOf(" ")
      if split == -1
        res.events = e
      else
        res.events = e.slice(0, split) or ""
        res.selector = e.slice(split + 1) or ""
    res

   
Minigap.setRuntime(new Minigap.BrowserRuntime())