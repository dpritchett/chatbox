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

function spitLine(contents) {
    $(".gameout").append(
      "<li>" +
      contents +
      "</li>");
    $(".gameout li:first").remove();
    if(toggler.value()) {$(".gameout li:last").addClass("alt")};
    };

function wipeScreen(printMe){
				$(".gameout li").empty();
				for(i = 0; i < 9; i++){spitLine("&nbsp");}
				(!printMe) ? spitLine("&nbsp") : spitLine(printMe);
};

function takeTurn(inVal) {
  $("input").removeAttr("value");
	inVal = inVal.replace(" ","&nbsp;");
  if(inVal[0] == "/")
	{
					if(inVal=="/clear"){
									wipeScreen();
					};
					if(inVal=="/connect"){
									alert("Connecting!");
					}
	}
	else if(inVal !="") {
			spitLine(inVal);
		} 
	$("input").select();
};

$(document).ready(function() {
	$("#inputs").append(
		"<input value=\"What do you wanna do?\" tabindex=1 size=55/><button type=submit tabindex=2>Do it!</button>");
	wipeScreen("Welcome to app!");

	$("button").click(
		function () {
			takeTurn($("input").attr("value"));
		}); 

	$("input").click( function() { $(this).select(); });
	$("input").select();
	$("input").keypress(function(e) {
		if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
			$("button").click();
		}
	});
});
