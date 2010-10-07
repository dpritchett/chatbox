// toggler.value() returns true then false then true then false...
var toggler = (function() {
        var flag = false;
        return {
                value: function() {
                               flag = !flag;
                               return flag;
                       }
        };
})();

var packet = {
        name: "default_name",
        content: "",
        date: ""
};

//Display an alert in a colored box that fades in and then out
function alertUser(alertText){
        $("#alerts").empty().append(alertText).stop(true, true).fadeIn(
                        500,
                        function(){$("#alerts").fadeOut(3000);});
}

//Write a line to the chatbox on the page
function spitLine(contents, username) {
        //no username means no timestamp etc
        if(username) {
                if(username == 'chatbot') {
                        contents = "<strong>" + contents + "</strong>";
                }
                var d = new Date();
                contents = "<span class=\"timestamp\">[" +
                        ((d.getHours() % 12) || '12') + //12-hour time
                        ":" +
                        (d.getMinutes() + 100).toString().substring(1) + //force 2-digit minutes
                        "]</span> " +
                        "<span style=\"background-color: #" +
                        $.md5(username).substring(0,6) + //unique color for each username
                        "\">" +
                        username + "<\/span>: " + contents;
        }
        //handle empty line
        if(!contents) {contents = '&nbsp;';}

        //push new line to bottom of list while losing oldest line
        $(".gameout").append(
                        "<li>" +
                        contents +
                        "<\/li>");
        $(".gameout li:first").remove();

        //zebra stripes
        if(toggler.value()) {$(".gameout li:last").addClass("alt");}
}

//clears the chatbox by pushing empty lines
function wipeScreen(printMe){
        for(i = 0; i < 10; i++) {spitLine();}
        spitLine(printMe);
}

//Reads user input and passes it on to server via websocket.
//Also checks for slash commands
function takeTurn(inVal) {
        //clean up whitespace
        //need to sanitize inputs serverside too
        inVal = inVal.replace(" ","&nbsp;").replace(/\\/gi, "").replace(/\"/gi, "");

        packet.name =  $("#username").attr('value');
        packet.content =  inVal;
        packet.date = (new Date()).getTime();

        //Detect and execute slash commands
        if(inVal.charAt(0) == '/')
        {
                if(inVal=="\/clear"){
                        wipeScreen();
                }
                //switch username both on page and in packet
                //alert server of the new name
                if((inVal.search("\/name") != -1) || (inVal.search("\/nick") != -1)){
                        packet.name = inVal.substr(11);
                        var msg = {
                                name: packet.name,
                                system: "/nick"
                        };
                        $("#username").attr("value", msg.name);
                        socket.send(msg);
                }
                alertUser(inVal.substr(1)); //user needs to see slash commands are received
        }

        //Submit plaintext to server as JSON
        else if(inVal !="") {
                socket.send(packet);
                spitLine(packet.content, packet.name);
        } 

        //Clear and target input blank
        $("#txtYourMove").removeAttr("value").select();

        //hide username input once user has replaced default name
        if($("#username").attr("value").search("user") == -1) {
                $("#username").css('display', 'none');
        }
}

// onload init stuff
$(document).ready(function() {
        wipeScreen();
        $("#username").attr("value", "user" + Math.floor(Math.random()*1000));
        $("button").click(
                function () {
                        takeTurn($("#txtYourMove").attr("value"));
                }); 
        $("#txtYourMove").click( function() { $(this).select(); }).click();
        //Submit on <ENTER>
        $("#txtYourMove").keypress(function(e) {
                if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
                        $("button").click();
                }
        });
        packet.name = $("#username").attr("value");
        socket.send({
                name: packet.name,
                system: "/nick"});
});
