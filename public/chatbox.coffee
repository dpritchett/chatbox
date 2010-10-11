# onload init stuff
$(document).ready ->
  chatbox.wipeScreen()
  $("#username").attr "value",
    "user#{Math.floor(Math.random() * 1000)}"
  $("button").click ->
    chatbox.takeTurn($("#txtYourMove").attr "value" )
  $("#txtYourMove").click( ->
    $(this).select()
  ).click()

  $("#txtYourMove").keypress (e) ->
    $("button").click() if e.keyCode is 13   #Submit on <ENTER>

  chatbox.packet.name = $("#username").attr "value"
  socket.send { name: chatbox.packet.name, system: "onjoin" }

### This window.chatbox class is going to be referred to by some inline JS on index.html
as well as from within the onload business above
###
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
    $('#alerts').empty().
      append(alertText).
      stop(true, true).
      fadeIn(500,
        -> $('#alerts').fadeOut(3000))

  #Write a line to the chatbox on the page
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
        "\">#{username}<\/span>: #{contents}"

    #handle empty line
    contents ?= '&nbsp;'

    #push new line to bottom of list while losing oldest line
    $(".gameout").append "<li>#{contents}<\/li>"
    $(".gameout li:first").remove()

    #zebra stripes
    $(".gameout li:last").addClass "alt" unless @toggler()

  #Clears the chatbox by pushing empty lines
  wipeScreen: (printMe) ->
    for i in [0...10]
      @spitLine()
    @spitLine printMe

  sendNameChange: (newName) ->
    @packet.name  = newName
    msg           = { name: @packet.name, system: '/nick'}
    window.socket.send msg

    #hide username input once user has replaced default name
    $('#username').attr "value", msg.name
    $("#username").css 'display', 'none'

  #Reads user input and passes it on to server via websocket. Also checks for slash commands
  takeTurn: (inVal) ->
    #if we have a new name, change it and rerun @takeTurn
    unless $("#username").css('display') is 'none'
      if $("#username").attr('value').search('user') is -1
        @sendNameChange $('#username').attr 'value'
        return @takeTurn inVal

    #clean up whitespace
    #need to sanitize inputs serverside too
    inVal = inVal.replace ' ','&nbsp;' .
      replace /\\/gi, '' .
      replace /\"/gi, ''

    @packet.name    = $('#username').attr 'value'
    @packet.content = inVal
    @packet.date    = (new Date()).getTime()

    #Detect and execute slash commands
    if inVal.charAt(0) is '/'

      if inVal is "/clear"
        wipeScreen()

      #switch username both on page and in packet; alert server of the new name
      unless inVal.search("/name") is inVal.search("/nick") is -1
        @sendNameChange inVal.substr 11

      @alertUser inVal.substr 1     #user needs to see slash commands are received

    else if inVal isnt ''                 #Submit plaintext to server as JSON
      window.socket.send @packet
      #@spitLine @packet.content, @packet.name

    #Clear and target input blank
    $("#txtYourMove").
      removeAttr("value").
      select()
