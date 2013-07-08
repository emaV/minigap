@Minigap = {}

Minigap.helpers = []
Minigap.controllers = []

Minigap.controller = (controller) ->
  Minigap.controllers.push(controller)

Minigap.helpers = (helpers) ->
  Minigap.helpers.push(helpers)