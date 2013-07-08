#= require core/namespace
#= require core/emitter

class @Minigap.Router

  constructor: (@app, @routes) ->

  goto: (path) ->
    window.location.hash = "#!#{path}"
  
  start: () ->
    self = @
    window.addEventListener("hashchange", ( -> self._doRoute() ), false)
    @goto('/')

  _doRoute: () ->
    hash = window.location.hash
    if hash == ""
      hash = "#!/"
    
    if hash.slice(0, 2) is "#!"
      parts  = window.location.hash.split("?")
      path   = parts[0].substr(2)
      params = @_parseQueryString(parts[1])

      Minigap.Emitter.emit(path, params)

  _parseQueryString: (a) ->
    return {}  if !a?
    a = a.split("&")
    b = {}
    i = 0

    while i < a.length
      p = a[i].split("=")
      continue  unless p.length is 2
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "))
      ++i
    b
