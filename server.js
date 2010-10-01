var Connect = require('connect'),
		sys = require('sys'),
		couchdb = require('couchdb'),
		couchClient = couchdb.createClient(80, 'dpritchett.couchone.com'),
		db = couchClient.db('chatbox'),
		uuid = require('uuid'),
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
  client.on('message', function(message){
			 console.log("MESG recvd: \"" + sys.inspect(message) + "\"");
 			 db.saveDoc(uuid.generate(), message, function (er, ok) {
			 		if (er) {
						console.log('db error on: ' + JSON.stringify(message) +
						 JSON.stringify(er));
						throw new Error(JSON.stringify(er)) 
					}	
	    		else {console.log('Wrote to couch: ' + JSON.stringify(message));};
				});
	})
  client.on('disconnect', function(){ console.log("client disconnected") })
});
