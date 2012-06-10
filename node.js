#!/usr/bin/env node

var http = require('http'),
	fs   = require('fs');
	io   = require('socket.io');

var game  = require('./game'),
	rovio = require('./rovio');

mime = {'html':'text/html', 'js':'text/javascript', 'css': 'text/css'}

var server = http.createServer(
	function(req, res){
		file = req.url.slice(1)||'index.html';
		fs.readFile(file, function(e, data){
			if (e){
				res.writeHead(404);
				res.end('404: Not Found');
				console.log('Error reading [' + file + ']');
			} else {
				res.writeHead(200, {'Content-Type':
					mime[file.slice(file.lastIndexOf('.')+1)]});
				res.end(data);
			}
		});
	});

server.listen(8080, '0.0.0.0');

var io = io.listen(server);

var init = function(current) {
	io.on('connection', function(client){
		client.send(JSON.stringify(
			{type:'init', to:current.to, from:current.from,
				remaining:current.end - new Date() - 1,
				elapsed: new Date() - current.start})); 

		client.on('message', function(message){
			switch(message) {
			case 'join':
				var session = current.join(client.sessionId);
				session.fetch(session.current.id, function(results) {
					client.send(JSON.stringify({type:'update', results:results}));
				});
				break;
			default:
				var session = current.get(client.sessionId) ||
					current.join(client.sessionId);
				session.fetch(message, function(results) {
					client.send(JSON.stringify({type:'update', results:results}));
				});
				break;
			}
		});

		client.on('disconnect', function(){
			current.leave(client.sessionId);
		});
	});

	setInterval(function() {
		if (new Date() > current.end) {
			rovio.getPath(function(from, to) {
				current = new game.Game(from, to);
				io.sockets.send(JSON.stringify(
					{type:'init', to:current.to, from:current.from,
						remaining:current.end - new Date() - 1,
						elapsed: new Date() - current.start})); 
			});
		}
	}, 1000);
}

rovio.getPath(function(from, to) {init(new game.Game(from, to));});
