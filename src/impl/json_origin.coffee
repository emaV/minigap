class Minigap.JsonOrigin extends Minigap.Origin

  doRequest: (url, params, options, func) ->
    type = (options.type or "GET").toUpperCase()
    req = new XMLHttpRequest()
    req.open type, url, true
    req.setRequestHeader 'Accept', 'application/json'
    req.onload = ->
      resp = req.response
      if typeof resp is 'string'
        resp = JSON.parse(resp)

      func(resp)

    req.send()

  doMerge: (responses) ->
    res = {}
    for r in responses
      res[ r.request.name ] = r.response
    
    res