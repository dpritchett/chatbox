/*
 *  Chatbox by Daniel J. Pritchett
 *  
 *  Use npm to install the packages by name e.g. npm install socket.io
 *
 *  Development begun September 2010 as a JS exploration
 *
 *  Contacts: 
 *    daniel@sharingatwork.com
 *    http://github.com/dpritchett
 *    http://twitter.com/dpritchett
 *
 */

var $PORT = 80,
    $DB_SERVER = 'dpritchett.couchone.com',
    $DB_PORT = 80;

var Connect = require('connect'),
    sys = require('sys'),
    uuid = require('uuid'),
    io = require('socket.io'),

    couchdb = require('couchdb'),
    couchClient = couchdb.createClient($DB_PORT, $DB_SERVER),
    db = couchClient.db('chatbox');

// Connect middleware serves static files and can handle additional
// features I might want to add later
var server = Connect.createServer(
                Connect.logger(),
                Connect.staticProvider(__dirname + '/public'),

                function(req, res) {
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.write('Hello World');
                        res.end();
                }
                );
server.listen($PORT);
console.log("Listening on port " + $PORT + " with backend at " +
                $DB_SERVER + ":" + $DB_PORT);

// Socket.io hooks into the server above and intercepts socket comms
var socket = io.listen(server);
socket.on('connection', function(client){
        client.send('{"message": "Welcome to chatbox!"}');
        //incoming message on a socket
        // We're hoping to see some JSON that we can punt to CouchDB
        client.on('message', function(message){
                console.log("MESG recvd: \"" + sys.inspect(message) + "\"");

                //passing user message to Couch
                db.saveDoc(uuid.generate(), message, function (er, ok) {
                        if (er) {
                                console.log('DB error on input: ' +
                                        JSON.stringify(message) +
                                        JSON.stringify(er));
                                throw new Error(JSON.stringify(er)) 
                        }	
                        else {
                                console.log('Wrote to couch: ' +
                                        sys.inspect(message));};
                });
        })
        client.on('disconnect', function(){ console.log("Client disconnected") })
});
