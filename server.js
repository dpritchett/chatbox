var Connect = require('connect'),
		sys = require('sys'),
		couchdb = require('couchdb'),
		couchClient = couchdb.createClient(80, 'dpritchett.couchone.com'),
		db = couchClient.db('chatbox'),
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
  client.on('message', function(message){
			 var msg = { message: [client.sessionId, message]};
			 console.log("MESG recvd: \"" + sys.inspect(message) + "\"");

 			 db.saveDoc('a9999101', msg, function (er, ok) {
			 		if (er) {
						//throw new Error(JSON.stringify(er)) 
						console.log('db error on: ' + JSON.stringify(msg) +
						 JSON.stringify(er));
					}	
	    		else {console.log('Wrote to couch: ' + JSON.stringify(msg));};
				});

	})

  client.on('disconnect', function(){ console.log("client disconnected") })
});
