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
						var message = {name:data.user.name,
							screen:data.user.screen_name,
							followers:data.user.followers_count,
							background:data.user.profile_background_color,
							image:data.user.profile_image_url};
						for (var url in data.entities.urls){
							url = data.entities.urls[url];
							switch(url.url.slice(7, url.url.indexOf('/', 8))){
								case 'yfrog.com':
									message.media = {type:'image',
										source : url.url+':iphone',
										thumb  : url.url+':small',
										link   : url.url};
									break;
							}
							data.text = [data.text.slice(0, url.indices[0]),
								'<a href="', url.expanded_url || url.url, '">',
								url.url, '</a>', data.text.slice(url.indices[1])
							].join('')
						}
						message.text = data.text;
						socket.broadcast(message);
					}
				}
			})
		else console.log(res)}
	).end()
};

//stream('/1/statuses/sample.json');
stream('/1/statuses/filter.json?track=yfrog');
