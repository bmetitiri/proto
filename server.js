#!/usr/bin/env node

// imports
var http = require('http'),
	fs   = require('fs'),
	io   = require('socket.io'),
	querystring = require('querystring'),
	TwitterNode = require('twitter-node').TwitterNode;

// variables
var keywords = {'hello':1, 'node':1}

// "template"
var cwd   = __filename.slice(0, __filename.lastIndexOf('/')+1),
	index = fs.readFileSync(cwd+'index.html').toString().split('<!---->'),
	funcs = [function(req, res){
			for (k in keywords)
				res.write('<li><form method="post">' +
					'<input name="delta" type="submit" value="-" /> ' + k +
					'<input name="keyword" type="hidden" value="'+k+'" />' +
				'</form></li>');
		}, function(req, res){
		}]

var server = http.createServer(function(req, res){
	if (req.method == 'POST'){
		var buffer = '';
		req.on('data', function(chunk){buffer+=chunk});
		req.on('end', function(){
			var post = querystring.parse(buffer);
			//console.log(post);
			if (post.keyword){
				if (post.delta == '+' && !keywords[post.keyword]){
					keywords[post.keyword] = 1;
					socket.broadcast({add:post.keyword});
				} else if (post.delta == '-' && keywords[post.keyword]){
					delete keywords[post.keyword]
					socket.broadcast({remove:post.keyword});
				}
				reset();
			}
			res.writeHead(303, {'Location':req.url});
			res.end();
		});
		//res.end('Location:/');
	} else {
		res.writeHead(200, {'Content-Type': 'text/html'});
		index = fs.readFileSync(cwd+'index.html').toString().split('<!---->');
		for (var i = 0; i < index.length; i++){
			res.write(index[i]);
			if (funcs[i]) funcs[i](req, res);
		}
		res.end();
	}
});
server.listen(process.env.PORT||9000);

var socket = io.listen(server); 
/* socket.on('connection', function(client){ 
	client.on('message', function(){ }) 
}); */

var twit = new TwitterNode({user:process.env.TWITTER_USERNAME,
		password:process.env.TWITTER_PASSWORD}).addListener('tweet',
			function(tweet){socket.broadcast(tweet)});

var reset = function(){
	twit.trackKeywords = [];
	for (k in keywords) twit.track(k);
	if (twit.trackKeywords.length) twit.method = 'filter';
	else twit.action = 'sample';
	twit.stream();
}
reset();
