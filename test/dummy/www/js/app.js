Minigap.origin('devSocket', new SocketOrigin("//= print server/sock"));

Minigap.controller({
  'devSocket:refresh': function() {}
});

window.location.reload();

Minigap.start();
