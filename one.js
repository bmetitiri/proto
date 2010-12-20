#!/usr/bin/env node
var http = require('http'),
	io   = require('socket.io');
	fs   = require('fs');

var cwd   = process.argv[1];
	cwd   = cwd.slice(0, cwd.lastIndexOf('/')+1);
var index = fs.readFileSync(cwd+'index.html')

fs.watchFile(cwd+'index.html', function(){
	fs.readFile(cwd+'index.html', function(e, data){index = data;})});

var user = process.argv[2], pass = process.argv[3]; //Fill in details here.

// Server

server = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(index);
});
server.listen(8080);
var socket = io.listen(server);

// Twitter

var auth    = 'Basic ' + new Buffer(user + ':' + pass).toString('base64'),
	buf     = Buffer('');

var twitter = http.createClient(80, 'stream.twitter.com');
var stream  = function(url){
	twitter.request('GET', url,
		{'host':'stream.twitter.com', 'authorization':auth}
	).on('response', function(res){
		if (res.statusCode == 200)
			res.on('data', function(data){
				buf   += data;
				var cr = buf.indexOf('\n')+1;
				if (cr){
					data = buf.slice(0, cr);
					buf  = buf.slice(cr);
					data = JSON.parse(data);
					if (data.user){
						socket.broadcast({name:data.user.name,
							screen:data.user.screen_name, text:data.text})
					}
				}
			})
		else console.log(res)}
	).end()
};

stream('/1/statuses/sample.json');
//	stream('/1/statuses/filter.json?track=facebook');
