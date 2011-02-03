#!/usr/bin/env node

var http = require('http'),
	fs   = require('fs');
	io   = require('./socket.io'),

server = http.createServer(
	function(req, res){
		if (req.url == '/'){
			res.writeHead(200, {'Content-Type':'text/html'});
			fs.readFile('index.html', function(err, data){
				res.end(data);
			});
		} else if (req.url == '/dungeon.js'){
			res.writeHead(200, {'Content-Type':'text/javascript'});
			fs.readFile('dungeon.js', function(err, data){
				res.end(data);
			});
		} else {
			res.writeHead(204);
			res.end();
		}
	});

server.listen(8080, '0.0.0.0');

var io = io.listen(server); //, buffer = [];

io.on('connection', function(client){
	client.send();

	client.on('message', function(message){
//		var msg = { message: [client.sessionId, message] };
//		buffer.push(msg);
//		if (buffer.length > 15) buffer.shift();
		var env = {}; env[client.sessionId] = message;
		client.broadcast(env);
//		console.log(msg);
	});

	client.on('disconnect', function(){
		var env = {}; env[client.sessionId] = 'delete';
		client.broadcast(env);
	});
});
