$(document).ready(function(){
	$(window).resize(function(){
			$('#input').css({'font-size':'15px'}).height(20);
			$('#module').height($(window).height()-52);
			$('#output').height($(window).height()-74);
		}).resize()
	$('body').prepend('<ul id="menu" />')
	$('fieldset').css({'margin':0, 'height':'100%','padding':0, 'width':'100%'}
		).hide()
	$('form').css({'border':0, 'max-width':'500px',
		'width':'100%'})
	$('input').css({'border':0}); $('textarea').css({'border':0});
	$('label').hide(); $('legend').hide(); $('#update').hide();
	$('legend').each(function(){$('#menu').append(
		$('<li class="nav">'+$(this).text()+'</li>').data('fs', $(this)))})
	$('.nav').css({'cursor':'pointer', 'float':'left', 'line-height':'50px',
		'list-style-type':'none', 'text-align':'center', 'width':'50px',}
		).hover(function(){
			$('fieldset').hide();
			$(this).data('fs').parent().show();
			$(this).css({'background':'#fff', 'color':'#000'})},
			function(){$(this).css({'background':'#000', 'color':'#fff'})}
		).mouseleave()
	$('#menu').css({'margin':'auto'}).width($('#menu>li').length*50)
});
