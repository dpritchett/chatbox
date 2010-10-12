# **Chatbox** is a websockets-based chat room built on
# [node.js](http://nodejs.org) and [socket.io](http://socket.io). You can see
# chatbox in action at [dpritchett.no.de](http://dpritchett.no.de)
# 
# Use [npm](http://npmjs.org/) to install the packages by name:
#
#     npm install socket.io uuid connect
#
#  Development begun September 2010 as a JavaScript exploration.
#
# ####  Contact: 
#
#  *  [daniel@sharingatwork.com](mailto:daniel@sharingatwork.com)
#  *  [github.com/dpritchett](http://github.com/dpritchett)
#  *  [@dpritchett](http://twitter.com/dpritchett)

# ### Includes and globals

sys         = require 'sys'
uuid        = require 'uuid'
io          = require 'socket.io'
Connect     = require 'connect'

PORT        = 80
DB_SERVER   = 'dpritchett.couchone.com'
DB_PORT     = 80

# We're currently logging to a couchdb on [couchone.com](http://couchdb.com)
# even though we're not yet pulling out any data.

couchdb     = require 'couchdb'
couchClient = couchdb.createClient DB_PORT, DB_SERVER
db          = couchClient.db 'chatbox'

# ### Service initialization

# Create an instance of the Connect middleware, serving static files
# out of `/public`.

server = Connect.createServer(

    Connect.logger()

    Connect.staticProvider "#{__dirname}/public"

    (req, res) ->
        res.writeHead 200, 'Content-Type': 'text/plain'
        res.write 'Hello World'
        res.end()
    )

# Listen on `http://localhost:80` by default but allow command line
# args to override to e.g. `http://dpritchett.no.de`.

server.listen PORT
console.log "Listening on port #{PORT} with backend at #{DB_SERVER}: #{DB_PORT}"

# This userlist allows us to keep track of who's online and which names map to 
# which `client.sessionId`.

names = []

users =

    getName: (id) ->
        names[id]

    setName: (id, newval) ->
        oldval = names[id]
        names[id] = newval
        return "joined: #{names[id]}" unless oldval?
        return "#{oldval} is now #{newval}" if oldval isnt newval
        ''

    destroy: (id) ->
        delete names[id]

    list: ->
        (val for key, val of names).join ' '

# Typing `JSON.stringify` too often cluttered up the source...
json = JSON.stringify

# Socket.io hooks into the server above and intercepts socket communications.
socket = io.listen server

# ### Client handling logic: on connect, on message, on disconnect

socket.on 'connection', (client) ->

    # Send an initial welcome message.
    response =
        name: "chatbot",
        content: "Welcome to chatbox! Other users online: #{users.list() or 'none.'}"

    client.send json response

    # Process incoming messages as either name changes or chat text.
    client.on 'message', ( (message) ->
        # System messages aren't rebroadcast directly.
        if message.system?
            response.content = users.setName client.sessionId, message.name
            socket.broadcast json response
            return

        # User chat is logged to couchdb.
        db.saveDoc uuid.generate(), message, (err, ok) ->
            unless err?
                client.broadcast json message
                console.log "Wrote to couch: #{sys.inspect message}"
            else   #if error
                console.log "DB error on input: #{sys.inspect message } #{sys.inspect err }"
                throw new Error err
            )

    # Notify other chatters upon any disconnects.
    client.on 'disconnect', ->
        response.content = "#{users.getName(client.sessionId)} disconnected"

        client.broadcast json response
        users.destroy client.sessionId

# ### Miscellaneous
# Literate documentation generated with
# [Docco](http://jashkenas.github.com/docco).
#
# Source code hosted on [github](http://github.com/dpritchett/chatbox).
#
# Free no.de hosting by [Joyent](http://no.de).
