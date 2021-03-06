`
//= require "../ns.js"
`

class Minigap.Runtime
  constructor: ->
    @origins = {}
    @templates = {}
    @mainFrame = "body"
    @defaultLocale = "en"
    @locales = {}
    @_global = if typeof global isnt 'undefined'
      global
    else if typeof window isnt 'undefined' 
      window

    @_session = {}

  origin: (name, origin) ->
    @origins[name] = origin
    if typeof origin.install is "function"
      origin.install(@)

  controller: (obj) ->

  locale: (localeId, obj) ->
    @locales[localeId] ?= {}
    l = @locales[localeId]
    for k, v of obj
      l[k] = v

  global: (key, value) ->
    if typeof key is "undefined"
      @_global
    else 
      if typeof value isnt "undefined"
        @_global[key] = value
      @_global[key]

  session: (key, value) ->
    if typeof key is "undefined"
      @_session
    else 
      if typeof value isnt "undefined"
        @_session[key] = value
      @_session[key]

  setMainFrame: (selector) ->
    @mainFrame = selector

  getMainFrame: () ->
    @mainFrame

  setDefaultLocale: (locale) ->
    @defaultLocale = locale

  getDefaultLocale: () ->
    @defaultLocale

  ajax: (args...) ->

  start: ->


class ContextualizedOrigin
  constructor: (@context, @origin) ->

  request: (args...) ->
    args.unshift(@context)
    @origin.request.apply(@origin, args)

  requests: (args...) ->
    args.unshift(@context)
    @origin.requests.apply(@origin, args)


class Minigap.ActionContext
  constructor: ->
    for k, v of Minigap.origins
      @[k] = new ContextualizedOrigin(@, v)

  setMeta: (name, content) ->
    nameAttr = "name" 
    if name.indexOf(":") != -1
      nameAttr = "property"

    if @document("meta[#{nameAttr}='#{name}']").length
      @document("meta[#{nameAttr}='#{name}']").attr("content", content)
    else
      @document("head").append("<meta #{nameAttr}='#{name}' content='#{content}'/>")

  render: (template,context,selector,mode="content") ->
    content = @_renderTemplate(template, context)
    selector ?= Minigap.getMainFrame()

    switch mode
      when "replace"
        @document(selector).replace(content)
      when "content"
        @document(selector).empty().append(content)
      when "append"
        @document(selector).append(content)

  _renderTemplate: (template, context) ->
    t = Minigap.templates[template]
    if not t?
      throw "Template '#{template}' not found."
    else
      t.call(null, context)

