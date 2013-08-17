PORT = process.argv[2] or 4000

Faye   = require('faye')
server = new Faye.NodeAdapter({mount: '/'})

process.on "message", (m) ->
  console.log "Message received from parent:"
  console.log m

  server.getClient().publish(m.channel, m.message or {});

server.listen(PORT)


# http = require("http")

# PORT = process.argv[2] or 4000
# HOST = process.argv[3] or "127.0.0.1"

# process.on "message", (m) ->
#   console.log "Message received from parent: #{m}"

# server = http.createServer (req, res) ->
#   console.log "Request Received"

#   # res.writeHead 200,
#   #   "Content-Type": "text/event-stream"
#   #   "Cache-Control": "no-cache"
#   #   Connection: "keep-alive"

#   # process.on "message", (m) ->
#   #   console.log "Message received from parent: #{m}"
#   #   res.write JSON.stringify(m)


# server.on "close", ->
#   "Message server closing ..."

# server.listen PORT, HOST, ->
#   console.log "Message server listening on #{HOST}:#{PORT} ..."