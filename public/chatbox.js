(function() {
  $(document).ready(function() {
    chatbox.wipeScreen();
    $("#username").attr("value", "user" + (Math.floor(Math.random() * 1000)));
    $("button").click(function() {
      return chatbox.takeTurn($("#txtYourMove").attr("value"));
    });
    $("#txtYourMove").click(function() {
      return $(this).select();
    }).click();
    $("#txtYourMove").keypress(function(e) {
      if (e.keyCode === 13) {
        return $("button").click();
      }
    });
    chatbox.packet.name = $("#username").attr("value");
    return socket.send({
      name: chatbox.packet.name,
      system: "onjoin"
    });
  });
  /* This window.chatbox class is going to be referred to by some inline JS on index.html
  as well as from within the onload business above
  */
  window.chatbox = {
    flag: false,
    toggler: function() {
      return (this.flag = !this.flag);
    },
    packet: {
      name: 'default_name',
      content: '',
      date: ''
    },
    alertUser: function(alertText) {
      return $('#alerts').empty().append(alertText).stop(true, true).fadeIn(500, function() {
        return $('#alerts').fadeOut(3000);
      });
    },
    spitLine: function(contents, username) {
      var d;
      if (typeof username !== "undefined" && username !== null) {
        d = new Date();
        if (username === 'chatbot') {
          contents = ("<strong>" + (contents) + "</strong>");
        }
        contents = '<span class=\"timestamp\">[' + ("" + ((d.getHours() % 12) || '12') + ":") + (d.getMinutes() + 100).toString().substring(1) + ']</span><span style=\"background-color: #' + $.md5(username).substring(0, 6) + ("\">" + (username) + "<\/span>: " + (contents));
      }
      contents = (typeof contents !== "undefined" && contents !== null) ? contents : '&nbsp;';
      $(".gameout").append("<li>" + (contents) + "<\/li>");
      $(".gameout li:first").remove();
      if (!(this.toggler())) {
        return $(".gameout li:last").addClass("alt");
      }
    },
    wipeScreen: function(printMe) {
      var i;
      for (i = 0; i < 10; i++) {
        this.spitLine();
      }
      return this.spitLine(printMe);
    },
    sendNameChange: function(newName) {
      var msg;
      this.packet.name = newName;
      msg = {
        name: this.packet.name,
        system: '/nick'
      };
      window.socket.send(msg);
      return $('#username').attr("value", msg.name).css('display', 'none');
    },
    takeTurn: function(inVal) {
      var _ref, tokens;
      if ($("#username").css('display') !== 'none') {
        if ($("#username").attr('value').search('user') === -1) {
          this.sendNameChange($('#username').attr('value'));
          return this.takeTurn(inVal);
        }
      }
      inVal = inVal.replace(' ', '&nbsp;'.replace(/\\/gi, ''.replace(/\"/gi, '')));
      this.packet.name = $('#username').attr('value');
      this.packet.content = inVal;
      this.packet.date = (new Date()).getTime();
      if (inVal.charAt(0) === '/') {
        tokens = inVal.split('&nbsp;');
        console.log(tokens);
        if (tokens[0] === "/clear") {
          this.wipeScreen();
        }
        if (("/name" === (_ref = tokens[0]) || "/nick" === _ref)) {
          this.sendNameChange(tokens[1]);
        }
        this.alertUser(inVal.substr(1));
      } else if (inVal !== '') {
        window.socket.send(this.packet);
        this.spitLine(this.packet.content, this.packet.name);
      }
      return $("#txtYourMove").removeAttr("value").select();
    }
  };
}).call(this);
