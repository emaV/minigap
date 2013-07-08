#= require core/namespace

@Minigap.Emitter = {

  callbacks: {}
  next_uid: 0

  on: ( types_str, context, fn ) ->
    if typeof context is 'function'
      fn = context
      context = {}

    types = []
    @next_uid += 1

    for t in types_str.replace(/\s+/, '').split(",")
      @callbacks[t] ?= []  
      @callbacks[t].push(
        fn: fn,
        context: context,
        uid: @next_uid
      )

    @next_uid

  off: (types_str, uid) ->
    for type in types_str.replace(/\s+/, '').split(",")
      if @callbacks[type]
        found = undefined
        i = 0

        for cb in @callbacks[type]
          if cb.uid == uid
            found = i
            break
          else
            i+=1

        if found?
          ary = @callbacks[type]
          if ary.length == 1
            delete @callbacks[type]
          else
            ary.splice(found,1)

    true

  emit: (type, params={}) ->
    if @callbacks[type]
      for cb in @callbacks[type]
        cb.fn.call(cb.context, params)

    true


}