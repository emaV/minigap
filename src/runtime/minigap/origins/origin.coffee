`
//= require "../ns.js"
`

class Minigap.Origin

  constructor: (@domain = "", @base = "/") ->
    @_urlbase = @_url_join(@domain, @base)

    # This is set by the application receiving this object

  request: (context, path, params, options, func) ->
    args = @_normalizeRequestArguments(path, params, options, func)
    self = @
    @doRequest args.url, args.params, args.options, (response) ->
      if typeof args.func is 'function'
        args.func.call(context, self.processResponse(response))
  

  # Performs multiple requests and runs callback on merged response:

  requests: (context, requests, func) ->

    responses = []
    self = @

    requestDone = (req, resp) ->
      responses.push {
        request:  req,
        response: resp
      }

      if responses.length == requests.length
        func.call self.app, self.doMerge( responses )

    for req in requests
      @request context, req.path, req.params, req.options, (resp) ->
        requestDone(req, resp)
  

  #
  # Abstract interface
  #

  # Actually perform requests
  doRequest: (url, params, options, func) ->
    throw "NotImplemented"

  # Actually merge responses
  doMerge: (responses) ->
    throw "NotImplemented"
  
  # Used by exensions to adapt response and create different
  # behaviours
  processResponse: (response) ->
    response

  #
  # Internals
  #

  _normalizeRequestArguments: (path, params, options, func) ->
    cb = undefined
    
    if typeof params is 'function'
      cb = params
      options = {}
      params = {}
    else if typeof options is 'function'
      cb = options
      options = {}
    else if typeof func is 'function'
      cb = func

    params ?= {}
    options ?= {}
    
    {
      url: @_buildRequestUrl(path)
      params: params
      options: options
      func: cb
    }


  _url_join: (p1, p2) ->
    if p1[p1.length - 1] == "/"
      p1 = p1.slice(0, p1.length - 1)
    
    if p2[0] == "/"
      p2 = p2.slice(1)

    "#{p1}/#{p2}"

  _buildRequestUrl: (path) ->
    @_url_join(@_urlbase, path)

