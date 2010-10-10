# onload init stuff
$(document).ready ->
        chatbox.wipeScreen()
        $("#username").attr "value",
                "user#{Math.floor(Math.random() * 1000)}"
        $("button").click ->
                chatbox.takeTurn($("#txtYourMove").attr("value"))
        $("#txtYourMove").click( ->
                $(this).select()
        ).click()

        #Submit on <ENTER>
        $("#txtYourMove").keypress (e) ->
                if (e.which and e.which is 13) or (e.keyCode and e.keyCode is 13)
                        $("button").click()
        chatbox.packet.name = $("#username").attr("value")
        socket.send { name: chatbox.packet.name, system: "onjoin" }

window.chatbox =

        flag: false

        toggler: ->
                @flag = not @flag

        packet:
                name: 'default_name'
                content: ''
                date: ''

        #Display an alert in a colored box that fades in and then out
        alertUser: (alertText) ->
                $('#alerts').empty().append(alertText).stop(true, true).fadeIn(500, -> $('#alerts').fadeOut(3000))

        #Write a line to the chatbox on the page
        spitLine: (contents, username) ->
                if username?
                        if username is 'chatbot'
                                contents = "<strong>" + contents + "</strong>"
                        d = new Date()
                        contents =
                                '<span class=\"timestamp\">[' +
                                "#{((d.getHours() % 12) or '12')}" + #12-hour time
                                ':' +
                                (d.getMinutes() + 100).toString().substring(1) + #force 2-digit minutes
                                ']</span><span style=\"background-color: #' +
                                $.md5(username).substring(0,6) + #unique color for each username
                                "\">#{username}<\/span>: #{contents}"
                #handle empty line
                unless contents?
                        contents = '&nbsp;'

                #push new line to bottom of list while losing oldest line
                $(".gameout").append "<li>#{contents}<\/li>"
                $(".gameout li:first").remove()

                #zebra stripes
                if @toggler()
                        $(".gameout li:last").addClass "alt"

        #Clears the chatbox by pushing empty lines
        wipeScreen: (printMe) ->
                for i in [0...10]
                        @spitLine()
                @spitLine printMe

        #Reads user input and passes it on to server via websocket. Also checks for slash commands
        takeTurn: (inVal) ->
                #clean up whitespace
                #need to sanitize inputs serverside too
                inVal = inVal.replace(' ','&nbsp;').replace(/\\/gi, '').replace(/\"/gi, '')

                @packet.name =  $('#username').attr('value')
                @packet.content = inVal
                @packet.date = (new Date()).getTime()

                #Detect and execute slash commands
                if inVal.charAt(0) is '/'
                        if inVal is '\/clear'
                                wipeScreen()
                        #switch username both on page and in packet; alert server of the new name
                        if inVal.search('\/name') isnt -1 or inVal.search('\/nick') isnt -1
                                @packet.name = inVal.substr 11
                                msg = { name: @packet.name, system: '/nick'}
                                $('#username').attr "value", msg.name
                                window.socket.send msg
                        @alertUser inVal.substr(1)       #user needs to see slash commands are received
                else if inVal isnt ''     #Submit plaintext to server as JSON
                        window.socket.send @packet
                        @spitLine @packet.content, @packet.name

                #Clear and target input blank
                $("#txtYourMove").removeAttr("value").select()

                #hide username input once user has replaced default name
                if $("#username").attr("value").search("user") is -1
                        $("#username").css 'display', 'none'
