`
//= require "./runtime.js"
`

global.Handlebars = require('handlebars')

express    = require("express")
fs         = require("fs")
path       = require("path")
toobusy    = require("toobusy")
nopt       = require("nopt")
app        = express()
app.configure ->
  app.disable "x-powered-by"
  app.use (req, res, next) ->
    if toobusy()
      res.send 503, "Sorry, too busy"
    else
      next()

  app.use express.static(path.join(__dirname, "public"))
  app.use express.errorHandler(
    dumpExceptions: true
    showStack: true
  )

OPTIONS = nopt({}, {}, process.argv, 2)

`
//= if env == "dev" or env == "test"
`
port = OPTIONS.port or 3000
`
//= else
`
port = OPTIONS.port or 80
`
//= end
`
layout = fs.readFileSync("app.html")
cheerio = require('cheerio')

class ServerActionContext extends Minigap.ActionContext
  constructor: (@impl = {})->
    super()
    @document = cheerio.load(layout)

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

    @impl.response.send(@document.html())


class Minigap.ServerRuntime extends Minigap.Runtime
  constructor: () ->
    @impl = {}
    @impl.app = app
    super()

  ajax: require("najax")

  controller: (controller) ->
    self = @
    for name, action of controller
      if name.slice(0,1) is "/" 
        ((routePath, routeAction)->
          app.get routePath, (req, res) ->
            req.action = routePath
            ctx = new ServerActionContext
              request: req
              response: res

            routeAction.apply(ctx, [req])
        )(name, action)

  start: () =>
    app.listen port, ->
      console.log "Server listening on port: #{port}"

# console.log "**********************"
# console.log require("util").inspect(Minigap.Runtime.prototype)

# global.Minigap = 

# if not typeof Minigap.origin is "function"
#   throw "Minigap.origin is not a function"

Minigap.setRuntime(new Minigap.ServerRuntime())
