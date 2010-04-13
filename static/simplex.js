function toggle(type){
	return function(){$(this).html("<"+type+" name=\"" +
			$(this).attr("class").split(" ")[0] + "\">");}
}

$(document).ready(function(){
	$(".input").click(toggle("input"));
	$(".textarea").click(toggle("textarea"));
//	$("#edit_form").hide();
});
