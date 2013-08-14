#= require "./json.coffee"

class Minigap.JSendOrigin extends Minigap.JsonOrigin

  processResponse: (response) ->
    if response.status == "success"
      response.data
    else
      {}

  doMerge: (responses) ->
    res = {}
    for r in responses
      for prop, obj of r.response
        res[prop] = obj    
    res