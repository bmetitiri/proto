#!/usr/bin/env node

var http = require('http'),
	fs   = require('fs'),
	handshake = require('handshake');

server = http.createServer(
	function(req, res){
		if (req.url == '/'){
			res.writeHead(200, {'Content-Type':'text/html'});
			fs.readFile('index.html', function(err, data){
				res.end(data);
			});
		} else {
			res.writeHead(204);
			res.end();
		}
	});

server.addListener('upgrade',
	function(s){
		console.log(s);
	});

server.listen(8080, '0.0.0.0');
