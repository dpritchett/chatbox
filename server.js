var Connect = require('connect'),
		io = require('socket.io');

var server = Connect.createServer(
  Connect.logger(),
  Connect.staticProvider(__dirname + '/public'),
  function(req, res) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.write('Hello World');
			res.end();
  }
);

server.listen(80);

// socket.io, I choose you
var socket = io.listen(server);

socket.on('connection', function(client){
  // new client is here!
  client.on('message', function(data){ console.log("MESG recvd: \"" + data + "\"") })
  client.on('disconnect', function(){ console.log("client disconnected") })
});

