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

function alertUser(alertText){
				$("#alerts").empty();
				$("#alerts").append(alertText);
				$("#alerts").stop(true, true).fadeIn(500, function(){$("#alerts").fadeOut(3000)});
}

function spitLine(contents, username) {
		if(username) {
		var d = new Date();
		contents = "<span class=\"stamp\">[" + d.getHours() + ":" + d.getMinutes() + "] " +
			 username + "</span>: " + contents;
}
    $(".gameout").append(
      "<li>" +
      contents +
      "</li>");
    $(".gameout li:first").remove();
    if(toggler.value()) {$(".gameout li:last").addClass("alt")};
    };

function wipeScreen(printMe){
				for(i = 0; i < 10; i++){spitLine("&nbsp");}
				(!printMe) ? spitLine("&nbsp") : spitLine(printMe);
};

function takeTurn(inVal) {
  $("#txtYourMove").removeAttr("value");
  if($("#username").attr("value").search("user") == -1) {
		$("#username").css('display', 'none');
}
	inVal = inVal.replace(" ","&nbsp;");
  if(inVal[0] == "/")
	{
					if(inVal=="/clear"){
									wipeScreen();
					};
					if(inVal.search("/name") != -1 ){
					  $("#username").attr('value', inVal.substr(11));
					};
					if(inVal=="/connect"){
									alert("Connecting!");
					}
					alertUser(inVal.substr(1));
	}
	else if(inVal !="") {
			spitLine(inVal, $("#username").attr("value"));
		} 
	$("#txtYourMove").select();
};

// onload init stuff
$(document).ready(function() {
	wipeScreen("Welcome to app!");
  
  $("#username").attr("value", "user" + Math.floor(Math.random()*1000));

	$("button").click(
		function () {
			takeTurn($("#txtYourMove").attr("value"));
		}); 

	$("#txtYourMove").click( function() { $(this).select(); });
	$("#txtYourMove").select();
	$("#txtYourMove").keypress(function(e) {
		if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
			$("button").click();
		}
	});
});
