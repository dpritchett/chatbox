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
				
function takeTurn(inVal) {
  $("input").removeAttr("value");
  if(inVal[0] == "/")
	{
					if(inVal=="/clear"){
									wipeScreen();
									$(".gameout").effect("bounce", {direction: "right", distance: "15"});
					};
	}
	else if(inVal != "") {
		$(".gameout li:first").remove();
		$(".gameout").append(
			"<li>" +
		   inVal +
		   "</li>");
		if(toggler.value()) {$(".gameout li:last").addClass("alt")};
		 $(".gameout li:last").effect("bounce", {direction: "down", distance: "7", times: "2"})
		} 
	$("input").select();
};

function wipeScreen(printMe){
				$(".gameout li").empty();
				for(i = 0; i < 9; i++){takeTurn("&nbsp");}
				(!printMe) ? takeTurn("&nbsp") : takeTurn(printMe);
};

$(document).ready(function() {
	$("#inputs").append(
		"<input value=\"Welcome to app!\" tabindex=1 size=55/><button type=submit tabindex=2>Do it!</button>");
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
