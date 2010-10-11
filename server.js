(function() {
  var Connect, DB_PORT, DB_SERVER, PORT, couchClient, couchdb, db, io, json, names, server, socket, sys, users, uuid;
  var __hasProp = Object.prototype.hasOwnProperty;
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
      if (!(typeof oldval !== "undefined" && oldval !== null)) {
        return ("joined: " + (names[id]));
      }
      if (oldval !== newval) {
        return ("" + (oldval) + " is now " + (newval));
      }
      return '';
    },
    destroy: function(id) {
      return delete names[id];
    },
    list: function() {
      var _ref, _result, key, val;
      return (function() {
        _result = []; _ref = names;
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          val = _ref[key];
          _result.push(val);
        }
        return _result;
      })().join(' ');
    }
  };
  json = JSON.stringify;
  socket = io.listen(server);
  socket.on('connection', function(client) {
    var response;
    response = {
      name: "chatbot",
      content: ("Welcome to chatbox! Other users online: " + (users.list() || 'none.'))
    };
    client.send(json(response));
    client.on('message', function(message) {
      var _ref;
      if (typeof (_ref = message.system) !== "undefined" && _ref !== null) {
        response.content = users.setName(client.sessionId, message.name);
        socket.broadcast(json(response));
        return null;
      }
      return db.saveDoc(uuid.generate(), message, function(err, ok) {
        if (!(typeof err !== "undefined" && err !== null)) {
          client.broadcast(json(message));
          return console.log("Wrote to couch: " + (sys.inspect(message)));
        } else {
          console.log("DB error on input: " + (sys.inspect(message)) + " " + (sys.inspect(err)));
          throw new Error(err);
        }
      });
    });
    return client.on('disconnect', function() {
      response.content = ("" + (users.getName(client.sessionId)) + " disconnected");
      client.broadcast(json(response));
      return users.destroy(client.sessionId);
    });
  });
}).call(this);
