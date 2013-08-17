if typeof global isnt 'undefined' 
  global.Minigap ?= 
    setRuntime: (runtime) ->
      global.Minigap = runtime

if typeof window isnt 'undefined' 
  window.Minigap ?=
    setRuntime: (runtime) ->
      window.Minigap = runtime

