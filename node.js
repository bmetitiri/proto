#!/usr/bin/env node

var http = require('http'),
	fs   = require('fs');
	io   = require('./socket.io'),

mime = {'html':'text/html', 'js':'text/javascript'}

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

/*var io = io.listen(server);

var game = require(process.argv[2]);
game.broadcast = function(data){game.receive(data); io.broadcast(data)}
game.init();

io.on('connection', function(client){
	client.send(game.world); // TODO: Shouldn't occur during loop

	client.on('message', function(message){
		var env = {}; env[client.sessionId] = message;
		game.receive(env);
		client.broadcast(env);
	});

	client.on('disconnect', function(){
		var env = {}; env[client.sessionId] = 'delete';
		game.receive(env);
		client.broadcast(env);
	});
});*/
