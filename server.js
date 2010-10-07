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

var $ = JSON.stringify;
var users = (function(){
        names = [];
        return {
                user: function(id, newval){
                              if(newval){
                                      names[id] = newval;
                              };
                              return names[id];
                      },   
    userList: function(){
                      var list = "";
                      for(var i in names){
                              if(names.hasOwnProperty(i)){
                                      list += names[i] + ' ';
                              }
                      }
                      return (list || "none.");
              } 
        }
})();

// Socket.io hooks into the server above and intercepts socket comms
var socket = io.listen(server);
socket.on('connection', function(client){
        client.send($(
                        { content: "Welcome to chatbox! Other users online: " + users.userList(),
                                name: "chatbot" }
                     ));


        client.on('message', function(message){
                if(users.user(client.sessionId)){
                        client.broadcast($({
                                name: "chatbot",
                                content: users.user(client.sessionId) + " is now " +
                                message.name
                        }
                        ));
                }
                else {
                        client.broadcast($({
                                name: "chatbot",
                                content: message.name + " connected."
                        }));
                }
        users.user(client.sessionId, message.name);
        if(message.system) {return;}
        //passing user message to Couch
        db.saveDoc(uuid.generate(), message, function (er, ok) {
                if (er) {
                        console.log('DB error on input: ' +
                                $(message) +
                                $(er));
                        throw new Error($(er)); 
                }	
                else {
                        client.broadcast($(message));
                        console.log('Wrote to couch: ' +
                                sys.inspect(message));}
        });
        });
        client.on('disconnect', function(){
                client.broadcast(
                        $({
                                content: users.user(client.sessionId) + ' disconnected',
                                name: "chatbot"
                        }));
                delete users.user(client.sessionId);
        });
});
