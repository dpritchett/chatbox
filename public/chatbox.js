// toggler.value() returns true then false then true then false...
var toggler = (function() {
        var flag = true;
        return {
                value: function() {
                               (flag==true) ? flag = false : flag = true;
                               return flag;
                       }
        }
})();

//Display an alert in a colored box that fades out
function alertUser(alertText){
        $("#alerts").empty();
        $("#alerts").append(alertText);
        $("#alerts").stop(true, true).fadeIn(
                        500,
                        function(){$("#alerts").fadeOut(3000)});
}

//Write a line to the chatbox on the page
function spitLine(contents, username) {
        if(username) {
                var d = new Date();
                contents = "<span class=\"timestamp\" style=\"color: #" +
                        $.md5(username).substring(0,6) + 
                        "\">[" +
                        d.getHours() +
                        ":" + d.getMinutes() + "] " +
                        username + "</span>: " + contents;
        }
        $(".gameout").append(
                        "<li>" +
                        contents +
                        "</li>");
        $(".gameout li:first").remove();
        if(toggler.value()) {$(".gameout li:last").addClass("alt")};
};

//clears the chatbox by pushing empty lines
function wipeScreen(printMe){
        for(i = 0; i < 10; i++) {spitLine("&nbsp");}
        (!printMe) ? spitLine("&nbsp") : spitLine(printMe);
};

//Reads user input and passes it on to server via websocket.
//Also checks for slash commands
function takeTurn(inVal) {
        if($("#username").attr("value").search("user") == -1) {
                $("#username").css('display', 'none');
        }
        inVal = inVal.replace(" ","&nbsp;");

        //Detect and execute slash commands
        if(inVal[0] == "/")
        {
                if(inVal=="/clear"){
                        wipeScreen();
                };
                if((inVal.search("/name") != -1) || (inVal.search("/nick") != -1)){
                        $("#username").attr('value', inVal.substr(11));
                };
                if(inVal=="/connect"){
                        alert("Connecting!");
                }
                alertUser(inVal.substr(1));
        }

        //Submit plaintext to server as JSON
        else if(inVal !="") {
                var jstring = '{ "name": "' + $('#username').attr('value') + '", ' +
                        '"content": "' + $('#txtYourMove').attr('value') + '", ' +
                                '"date": "' + (new Date()).getTime() + '" }';
                console.log(jstring);
                socket.send(jstring);
                spitLine(inVal, $("#username").attr('value'));
        } 

        //Clear and target input blank
        $("#txtYourMove").removeAttr("value");
        $("#txtYourMove").select();
};

// onload init stuff
$(document).ready(function() {
        wipeScreen();
        $("#username").attr("value", "user" + Math.floor(Math.random()*1000));
        $("button").click(
                function () {
                        takeTurn($("#txtYourMove").attr("value"));
                }); 
        $("#txtYourMove").click( function() { $(this).select(); });
        $("#txtYourMove").click();
        //Submit on <ENTER>
        $("#txtYourMove").keypress(function(e) {
                if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
                        $("button").click();
                }
        });
});
