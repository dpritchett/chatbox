(function() {
  var $, $DB_PORT, $DB_SERVER, $PORT, Connect, couchClient, couchdb, db, io, server, socket, sys, users, uuid;
  $PORT = 80;
  $DB_SERVER = 'dpritchett.couchone.com';
  $DB_PORT = 80;
  Connect = require('connect');
  sys = require('sys');
  uuid = require('uuid');
  io = require('socket.io');
  couchdb = require('couchdb');
  couchClient = couchdb.createClient($DB_PORT, $DB_SERVER);
  db = couchClient.db('chatbox');
  server = Connect.createServer(Connect.logger(), Connect.staticProvider(__dirname + '/public'), function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.write('Hello World');
    return res.end();
  });
  server.listen($PORT);
  console.log("Listening on port " + $PORT + " with backend at " + $DB_SERVER + ":" + $DB_PORT);
  $ = JSON.stringify;
  users = (function() {
    var names;
    names = [];
    return {
      getName: function(id) {
        return names[id];
      },
      setName: function(id, newval) {
        var tmp;
        tmp = names[id];
        if (!tmp) {
          names[id] = newval;
          return "joined: " + names[id];
        } else if (tmp !== newval) {
          names[id] = newval;
          return tmp + " is now " + newval;
        } else {
          return '';
        }
      },
      destroy: function(id) {
        return delete names[id];
      },
      list: function() {
        var _i, _len, _ref, i, output;
        output = "";
        _ref = names;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          if (names.hasOwnProperty(i)) {
            output += names[i] + ' ';
          }
        }
        return output;
      }
    };
  })();
  socket = io.listen(server);
  socket.on('connection', function(client) {
    var response;
    response = {
      name: "chatbot",
      content: ""
    };
    client.send((function() {
      response.content = "Welcome to chatbox! Other users online: " + users.list();
      return $(response);
    })());
    client.on('message', function(message) {
      if (message.system) {
        if (message.system) {
          response.content = users.setName(client.sessionId, message.name);
          client.broadcast($(response));
        }
        return null;
      }
      return db.saveDoc(uuid.generate(), message, function(er, ok) {
        if (er) {
          console.log('DB error on input: ' + $(message) + $(er));
          throw new Error($(er));
        } else {
          client.broadcast($(message));
          return console.log('Wrote to couch: ' + sys.inspect(message));
        }
      });
    });
    return client.on('disconnect', function() {
      response.content = users.getName(client.sessionId) + ' disconnected';
      client.broadcast($(response));
      return users.destroy(client.sessionId);
    });
  });
}).call(this);
