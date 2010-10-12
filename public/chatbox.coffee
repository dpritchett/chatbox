# Frontend communications and animation for [chatbox](/docs/server.html).

# ### Initialization

# Set up the UI and **say hi to the server**.
$(document).ready ->
    chatbox.wipeScreen()

    # Assign a randomized username.
    $("#username").attr "value",
        "user#{Math.floor(Math.random() * 1000)}"
        $("#username").focusout( -> chatbox.sendNameChange $(this).attr "value")

    # Attach click and keypress events to catch user input.
    $("button").click ->
        chatbox.takeTurn($("#txtYourMove").attr "value" )
    $("#txtYourMove").click( ->
        $(this).select()
    ).click()

    $("#txtYourMove").keypress (e) ->
        $("button").click() if e.keyCode is 13   #Submit on <ENTER>

    # **Ping the server with our newly generated username.**
    chatbox.packet.name = $("#username").attr "value"
    socket.send { name: chatbox.packet.name, system: "onjoin" }

# ### Define window.chatbox class for export
#
# This class is going to be referred to by some inline JS on `index.html`
# as well as from within the onload business above.

window.chatbox =

    flag: false

    # The `toggler()` facilitates zebra striping of the chatbox.
    toggler: ->
        @flag = not @flag

    # This `packet` will be reused for our JSON communications with the server.
    packet:
        name: 'default_name'
        content: ''
        date: ''

    # Display an alert in a colored box that fades in and then out.
    alertUser: (alertText) ->
        $('#alerts').empty().
            append(alertText).
            stop(true, true).
            fadeIn(500,
                -> $('#alerts').fadeOut(3000))

    # Write a line to the chatbox on the page.
    spitLine: (contents, username) ->
        if username?
            d = new Date()

            contents = "<strong>#{contents}</strong>" if username is 'chatbot'
            contents =
                '<span class=\"timestamp\">[' +
                "#{((d.getHours() % 12) or '12')}:" +             #12-hour time
                (d.getMinutes() + 100).toString().substring(1) +  #force 2-digit minutes
                ']</span><span style=\"background-color: #' +
                $.md5(username).substring(0,6) +                  #unique color for each username
                "\">#{username}</span>: #{contents}"

        # Handle empty input by packing in a `&nbsp`.
        contents ?= '&nbsp;'

        # Push a new line to bottom of list and drop the oldest line.
        $(".gameout").append "<li>#{contents}</li>"
        $(".gameout li:first").remove()

        # Add zebra stripes to every other line pushed to the chatbox.
        $(".gameout li:last").addClass "alt" unless @toggler()

    # Clear the chatbox by overflowing it with empty lines.
    wipeScreen: (printMe) ->
        for i in [0...10]
            @spitLine()
        @spitLine printMe

    # **Alert the server when the user changes her name.**
    sendNameChange: (newName) ->
        @packet.name  = newName
        msg           = { name: @packet.name, system: '/nick'}
        window.socket.send msg

        # Hide username input field once the user has replaced the default name.
        $('#username').attr("value", msg.name).
            css 'display', 'none'

    # Read user input and **pass it on to the server** via websocket.
    # Also check for slash commands.
    takeTurn: (inVal) ->
        # If we have a new name, **alert the server** and retry `@takeTurn()`
        # with the same input.
        unless $("#username").css('display') is 'none'
            if $("#username").attr('value').search('user') is -1
                @sendNameChange $('#username').attr 'value'
                return @takeTurn inVal

        # Clean up whitespace to avoid breaking our JSON submission.
        # Inputs need to be sanitized serverside as well.
        inVal = inVal.replace ' ','&nbsp;' .
            replace /\\/gi, '' .
            replace /\"/gi, ''

        @packet.name    = $('#username').attr 'value'
        @packet.content = inVal
        @packet.date    = (new Date()).getTime()

        # Detect and execute slash commands.
        if inVal.charAt(0) is '/'
            tokens = inVal.split '&nbsp;'

            if tokens[0] is "/clear"
                @wipeScreen()

            # Switch username both on page and in `packet`;
            # **alert server of the new name**.
            if tokens[0] in ["/name", "/nick"]
                @sendNameChange tokens[1]

            # Give visual feedback on slash commands.
            @alertUser inVal

        # **Submit plaintext to server as JSON.**
        else if inVal isnt ''
            window.socket.send @packet
            @spitLine @packet.content, @packet.name

        # Clear the input field and target it for more input.
        $("#txtYourMove").
            removeAttr("value").
            select()
