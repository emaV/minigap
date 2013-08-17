`
//= require "./origin.js"
`

class Minigap.JsonOrigin extends Minigap.Origin

  doRequest: (url, params, options, func) ->
    req = Minigap.ajax
      url: url
      data: params or {}
      type: (options.type or "GET").toUpperCase()

      error: (e) ->
        throw e

      success: (resp) ->
        if typeof resp is 'string'
          resp = JSON.parse(resp)
        
        func(resp)

  doMerge: (responses) ->
    res = {}
    for r in responses
      res[ r.request.name ] = r.response
    
    res