#!/usr/bin/env node

var apricot = require('apricot').Apricot,
	http    = require('http'),
	querystring = require('querystring');

var grab = function(url, items) {
	var item = items.shift();
	apricot.open(url, function(e, doc) {
		if (e) return console.log(e);
		var element = doc.find(item.value).matches[0];
		console.log(element, item.action);
	});
};

var server = http.createServer(function(req, res) {
	if (req.method == 'POST') {
		var buffer = '';
		req.on('data', function(chunk) {buffer+=chunk});
		req.on('end', function() {
			var history = JSON.parse(querystring.parse(buffer).history);
			var item = history.shift(); // Should be source
			grab(item.value, history);
			//res.writeHead(303, {'Location':req.url});
			res.end();
		});
	} else {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end('Hi!');
	}
});
server.listen(process.env.PORT||8080);
