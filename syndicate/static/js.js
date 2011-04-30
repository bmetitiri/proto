var main = document.getElementById('main'),
	more = document.getElementById('more');
if (more){
	var next = parseInt(more.getAttribute('data-next')),
		load = function(offset){
		var http = new XMLHttpRequest();
		http.onload = function(){
			console.log(http)
			var data = JSON.parse(http.responseText); next = data.next;
			for (var i = 0; i < data.records.length; i++){
				var record = data.records[i];
				var div = document.createElement('div');
				div.setAttribute('class', 'record');
				div.innerHTML = '<a href="'+record.url+'">'+record.html+'</a>';
				main.appendChild(div);
			}
			if (data.records.length < 10){
				window.onscroll = null;
				more.parentNode.removeChild(more);
			}
		}
		http.open('get', 'json?o='+offset, true);
		http.send();
	}
	window.onscroll = function(e){
		if (window.innerHeight + window.scrollY == document.body.scrollHeight)
			load(next);
	}
}
