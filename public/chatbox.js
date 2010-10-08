(function() {
  var alertUser, packet, spitLine, takeTurn, toggler, wipeScreen;
  toggler = function() {
    var flag, value;
    flag = false;
    return (value = function() {
      return (flag = !flag);
    });
  };
  packet = {
    name: 'default_name',
    content: '',
    date: ''
  };
  alertUser = function(alertText) {
    return $('#alerts').empty().append(alertText).stop(true, true).fadeIn(500, function() {
      return $('#alerts').fadeOut(3000);
    });
  };
  spitLine = function(contents, username) {
    var _ref, d;
    if (typeof username !== "undefined" && username !== null) {
      if (username === 'chatbot') {
        contents = "<strong>" + contents + "</strong>";
      }
      d = new Date();
      contents = '<span class=\"timestamp\">[' + ("" + ((d.getHours() % 12) || '12')) + ':' + (d.getMinutes() + 100).toString().substring(1) + ']</span><span style=\"background-color: #' + $.md5(username).substring(0, 6) + ("\">" + (username) + " <\/span>: " + (contents));
    }
    if (!(typeof contents !== "undefined" && contents !== null)) {
      contents = '&nbsp;';
    }
    $(".gameout").append("<li>" + (contents) + "<\/li>");
    $(".gameout li:first").remove();
    return (typeof (_ref = toggler.value()) !== "undefined" && _ref !== null) ? $(".gameout li:last").addClass("alt") : null;
  };
  wipeScreen = function(printMe) {
    var i;
    i = 0;
    while (i < 10) {
      spitLine();
      i++;
    }
    return spitLine(printMe);
  };
  takeTurn = function(inVal) {
    var msg;
    inVal = inVal.replace(' ', '&nbsp;').replace(/\\/gi, '').replace(/\"/gi, '');
    packet.name = $('#username').attr('value');
    packet.content = inVal;
    packet.date = (new Date()).getTime();
    if (inVal.charAt(0) === '/') {
      if (inVal === '\/clear') {
        wipeScreen();
      }
      if (inVal.search('\/name') !== -1 || inVal.search('\/nick') !== -1) {
        packet.name = inVal.substr(11);
        msg = {
          name: packet.name,
          system: '/nick'
        };
        $('#username').attr("value", msg.name);
        return socket.send(msg);
      }
      /*
      alertUser inVal.substr(1) #user needs to see slash commands are received
              #Submit plaintext to server as JSON
      else if inVal != ''
              socket.send packet
      spitLine packet.content, packet.name

              #Clear and target input blank
              $("#txtYourMove").removeAttr("value").select()

              #hide username input once user has replaced default name
              if $("#username").attr("value").search("user") == -1
      $("#username").css 'display', 'none'

      # onload init stuff
      $(document).ready () ->
              wipeScreen()
              $("#username").attr "value",
      "user #{Math.floor(Math.random() * 1000)}"
              $("button").click () ->
      takeTurn($("#txtYourMove").attr("value"))
              $("#txtYourMove").click( () ->
      $(this).select()
              ).click()

              #Submit on <ENTER>
              $("#txtYourMove").keypress (e) ->
      if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13))
              $("button").click()
              packet.name = $("#username").attr("value")
              socket.send { name: packet.name, system: "onjoin"}*/
    }
  };
}).call(this);
