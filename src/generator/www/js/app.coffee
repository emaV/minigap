`#= include <lib/minigap.js>`

`#= if development`
Minigap.origin('devSocket', new SocketOrigin("#= print server/sock"))

Minigap.controller 
    'devSocket:refresh' : ->
		window.location.reload()

`#= end`

Minigap.start()