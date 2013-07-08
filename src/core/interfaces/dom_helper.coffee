#= require core/namespace

class @Minigap.DomHelper

  # Eg.
  #
  # $("#{selector} a").on 'tap', ->
  #   if @href
  #     window.location.href = @href
  #   true

  # $("#{selector} a").on 'click', (e) ->
  #   e.preventDefault()
  #   false

  click2tap: (selector) ->
  documentReady: (func) -> 
  deviceReady: (func) ->
