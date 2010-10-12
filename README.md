Intro
-----
This chatbox is an exploratory project using a jQueryish frontend and a node.js backend.  I currently host the live copy on Joyent at [dpritchett.no.de](http://dpritchett.no.de).

I have aspirations of making a simple chatbox-based MUD with NPCs that use the same API clients use to read and write to the chat stream.

Design
------
* Backend runs with [`node server.js`](http://github.com/dpritchett/chatbox/blob/master//server.js)
* Frontend runs off of `index.html` which is served via [Connect](http://github.com/senchalabs/connect)'s `staticProvider`.
* Data is posted to a [CouchOne](http://www.couchone.com/) CouchDB as JSON.
* Client-server communication is handled by [Socket.IO](http://socket.io/)
