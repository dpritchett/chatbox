(function() {
  var Connect, DB_PORT, DB_SERVER, PORT, couchClient, couchdb, db, io, json, names, server, socket, sys, users, uuid;
  PORT = 80;
  DB_SERVER = 'dpritchett.couchone.com';
  DB_PORT = 80;
  Connect = require('connect');
  sys = require('sys');
  uuid = require('uuid');
  io = require('socket.io');
  couchdb = require('couchdb');
  couchClient = couchdb.createClient(DB_PORT, DB_SERVER);
  db = couchClient.db('chatbox');
  server = Connect.createServer(Connect.logger(), Connect.staticProvider(__dirname + '/public'), function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.write('Hello World');
    return res.end();
  });
  server.listen(PORT);
  console.log("Listening on port " + (PORT) + " with backend at " + (DB_SERVER) + ": " + (DB_PORT));
  names = [];
  users = {
    getName: function(id) {
      return names[id];
    },
    setName: function(id, newval) {
      var oldval;
      oldval = names[id];
      names[id] = newval;
      return ("joined: " + (names[id]));
      if (oldval !== newval) {
        return ("" + (tmp) + " is now " + (newval));
      }
      return '';
    },
    destroy: function(id) {
      return delete names[id];
    },
    list: function() {
      return names.join(' ');
    }
  };
  json = JSON.stringify;
  socket = io.listen(server);
  socket.on('connection', function(client) {
    var response;
    response = {
      name: "chatbot",
      content: ("Welcome to chatbox! Other users online: " + (users.list()))
    };
    client.send(json(response));
    client.on('message', function(message) {
      if (message.system) {
        response.content = users.setName(client.sessionId, message.name);
        client.broadcast(json(response));
        return null;
      }
      return db.saveDoc(uuid.generate(), message, function(err, ok) {
        if (err) {
          console.log("DB error on input: " + (sys.inspect(message)) + " " + (sys.inspect(err)));
          throw new Error(err);
        } else {
          client.broadcast(json(message));
          return console.log("Wrote to couch: " + (sys.inspect(message)));
        }
      });
    });
    return client.on('disconnect', function() {
      response.content = users.getName(client.sessionId) + ' disconnected';
      client.broadcast(json(response));
      return users.destroy(client.sessionId);
    });
  });
}).call(this);
