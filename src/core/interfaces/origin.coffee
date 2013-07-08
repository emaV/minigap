#= require core/namespace

class @Minigap.Origin

  constructor: (@domain = "", @base = "/") ->
    @_urlbase = @_url_join(@domain, @base)

    # This is set by the application receiving this object
    @app = null


  # This method is called by application to set itself as @app
  # ovveride this to create adapters to other Origins

  setApp: (@app) ->


  request: (path, params, options, func) ->
    args = @_normalizeRequestArguments(path, params, options, func)
    self = @
    @doRequest args.url, args.params, args.options, (response) ->
      if typeof args.func is 'function'
        args.func.call(self.app, self.processResponse(response))
  

  # Performs multiple requests and run the callback on merged response:

  requests: (requests, func) ->

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
      @request req.path, req.params, req.options, (resp) ->
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

