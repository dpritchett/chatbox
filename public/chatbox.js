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
      return ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) ? $("button").click() : null;
    });
    chatbox.packet.name = $("#username").attr("value");
    return socket.send({
      name: chatbox.packet.name,
      system: "onjoin"
    });
  });
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
    $: window.$,
    alertUser: function(alertText) {
      return $('#alerts').empty().append(alertText).stop(true, true).fadeIn(500, function() {
        return $('#alerts').fadeOut(3000);
      });
    },
    spitLine: function(contents, username) {
      var d;
      if (typeof username !== "undefined" && username !== null) {
        if (username === 'chatbot') {
          contents = "<strong>" + contents + "</strong>";
        }
        d = new Date();
        contents = '<span class=\"timestamp\">[' + ("" + ((d.getHours() % 12) || '12')) + ':' + (d.getMinutes() + 100).toString().substring(1) + ']</span><span style=\"background-color: #' + $.md5(username).substring(0, 6) + ("\">" + (username) + "<\/span>: " + (contents));
      }
      if (!(typeof contents !== "undefined" && contents !== null)) {
        contents = '&nbsp;';
      }
      $(".gameout").append("<li>" + (contents) + "<\/li>");
      $(".gameout li:first").remove();
      return this.toggler() ? $(".gameout li:last").addClass("alt") : null;
    },
    wipeScreen: function(printMe) {
      var i;
      i = 0;
      while (i < 10) {
        this.spitLine();
        i++;
      }
      return this.spitLine(printMe);
    },
    takeTurn: function(inVal) {
      var msg;
      inVal = inVal.replace(' ', '&nbsp;').replace(/\\/gi, '').replace(/\"/gi, '');
      this.packet.name = $('#username').attr('value');
      this.packet.content = inVal;
      this.packet.date = (new Date()).getTime();
      if (inVal.charAt(0) === '/') {
        if (inVal === '\/clear') {
          wipeScreen();
        }
        if (inVal.search('\/name') !== -1 || inVal.search('\/nick') !== -1) {
          this.packet.name = inVal.substr(11);
          msg = {
            name: this.packet.name,
            system: '/nick'
          };
          $('#username').attr("value", msg.name);
          window.socket.send(msg);
        }
        alertUser(inVal.substr(1));
      } else if (inVal !== '') {
        window.socket.send(this.packet);
        this.spitLine(this.packet.content, this.packet.name);
      }
      $("#txtYourMove").removeAttr("value").select();
      return $("#username").attr("value").search("user") === -1 ? $("#username").css('display', 'none') : null;
    }
  };
}).call(this);
