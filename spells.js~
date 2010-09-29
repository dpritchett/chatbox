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
  if(inVal[0] == "/")
	{
					if(inVal=="/clear"){};
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
		 $("input").removeAttr("value");
	$("input").select();
};

$(document).ready(function() {
				for(var i = 0; i < 9; i++){takeTurn("&nbsp;")};				
				takeTurn("Welcome to app!");
	$("#inputs").append(
		"<input value=\"What do you want to do?\" tabindex=1 size=55/><button type=submit tabindex=2>Do it!</button>");
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
