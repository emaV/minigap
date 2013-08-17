var Faye, PORT, server;

PORT = process.argv[2] || 4000;

Faye = require('faye');

server = new Faye.NodeAdapter({
  mount: '/'
});

process.on("message", function(m) {
  console.log("Message received from parent:");
  console.log(m);
  return server.getClient().publish(m.channel, m.message || {});
});

server.listen(PORT);
