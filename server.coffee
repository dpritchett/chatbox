# Chatbox by Daniel J. Pritchett
# 
#  Use npm to install the packages by name e.g. npm install socket.io
#
#  Development begun September 2010 as a JS exploration
#
#  Contacts: 
#    daniel@sharingatwork.com
#    http://github.com/dpritchett
#    http://twitter.com/dpritchett

PORT        = 80
DB_SERVER   = 'dpritchett.couchone.com'
DB_PORT     = 80

Connect     = require 'connect'
sys         = require 'sys'
uuid        = require 'uuid'
io          = require 'socket.io'

couchdb     = require 'couchdb'
couchClient = couchdb.createClient DB_PORT, DB_SERVER
db          = couchClient.db 'chatbox'

# Connect middleware serves static files and can handle additional
# features I might want to add later
server = Connect.createServer(

    Connect.logger()

    Connect.staticProvider "#{__dirname}/public"

    (req, res) ->
        res.writeHead 200, 'Content-Type': 'text/plain'
        res.write 'Hello World'
        res.end()

    )

server.listen PORT
console.log "Listening on port #{PORT} with backend at #{DB_SERVER}: #{DB_PORT}"

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

json = JSON.stringify

# Socket.io hooks into the server above and intercepts socket comms
socket = io.listen server

socket.on 'connection', (client) ->

    response =
        name: "chatbot",
        content: "Welcome to chatbox! Other users online: #{users.list() or 'none.'}"

    client.send json response

    client.on 'message', ( (message) ->
        if message.system?
            response.content = users.setName client.sessionId, message.name
            socket.broadcast json response
            return

        #Passing user message to Couch
        db.saveDoc uuid.generate(), message, (err, ok) ->
            unless err?
                client.broadcast json message
                console.log "Wrote to couch: #{sys.inspect message}"
            else   #if error
                console.log "DB error on input: #{sys.inspect message } #{sys.inspect err }"
                throw new Error err
            )

    client.on 'disconnect', ->
        response.content = "#{users.getName(client.sessionId)} disconnected"

    client.broadcast json response
    users.destroy client.sessionId
