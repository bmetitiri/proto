#!/usr/bin/env node
var http = require('http'),
	io   = require('socket.io');
	fs   = require('fs');

var format_twitter = function(data){
	var message = ['<div class="inner '];
	if (data.media){
		message = message.concat(
			['container" style="background: url(',
			data.media.thumb,') no-repeat center center']);
	}
	message = message.concat([
		'"><canvas width="100" height="100"></canvas>',
		'<a href="http://twitter.com/', data.screen, '">',
		'<img class="profile" src="', data.image,'" />',
		data.name, '[', data.followers, ']</a> ', data.text, '</div>']);
	if (data.media)
		if (data.media.type == 'image')
			message = message.concat(['<a href="', data.media.link,
					'"><img class="media" src="', data.media.source,
					'" /></a>']);
		else message = message.concat([
				'<iframe class=" media youtube-player"',
				'type="text/html" width="640" height="385"',
				'src="http://www.youtube.com/embed/', data.media.source,
				'" frameborder="0"></iframe>']);
	return message.join('');
}

//var cwd   = process.argv[1];
var cwd   = __filename.slice(0, __filename.lastIndexOf('/')+1);
var index = fs.readFileSync(cwd+'index.html').toString();
index = index.replace('function(data){/*placeholder*/}',
		format_twitter.toString());

//fs.watchFile(cwd+'index.html', function(){
//	fs.readFile(cwd+'index.html', function(e, data){index = data;})});

var user = process.env.TWITTER_USERNAME,
	pass = process.env.TWITTER_PASSWORD,
	log  = [];


// Server

var server = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'text/html'});

	var needle  = '<div id="content">';
	var slice   = index.indexOf(needle)+needle.length;
	res.write(index.slice(0, slice));

	for (var data in log){
		res.write('<div data-twitter="'+JSON.stringify(log[data]).replace(/"/g,
			'`')+ '" class="message">'+format_twitter(log[data])+'</div>');
	}

	res.end(index.slice(slice));
});
server.listen(process.env.PORT||8080);
var socket = io.listen(server);

// Twitter

var auth    = 'Basic ' + new Buffer(user + ':' + pass).toString('base64'),
	buf     = Buffer('');

var twitter = http.createClient(80, 'stream.twitter.com');
var handle  = function(data){
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
				var res   = null;
				var uri   = url.expanded_url || url.url;
				var slice = uri.indexOf('/', 8);
				var host  = uri.slice(7, slice);
				switch(host){
					case 'yfrog.com':
						message.media = {type:'image',
							source : uri+':iphone',
							thumb  : uri+':small',
							link   : uri};
						break;
					case 'twitpic.com':
						res = uri.slice(slice);
						message.media = {type:'image',
						//	source : 'http://'+host+'/show/full'+res
							source : 'http://'+host+'/show/large'+res,
							thumb  : 'http://'+host+'/show/thumb'+res,
							link   : uri};
						break;
					case 'youtu.be':
						res = uri.slice(16, uri.lastIndexOf('?'))
					case 'youtube.com':
					case 'www.youtube.com':
						if (!res && uri.indexOf('watch')+1)
							res = uri.slice(uri.indexOf('=')+1, uri.indexOf('&'));
						if (res)
							message.media = {type:'youtube',
								source : res,
								thumb  : 'http://img.youtube.com/vi/'+res+'/1.jpg',
								link   : uri};
						break;
//								default:
//									console.log('Missed:', uri);
//									break;
				}
				//TODO: Handle >1 url
				data.text = data.text.slice(0, url.indices[0])+'<a href="'+uri+'">'+
					url.url+'</a>'+data.text.slice(url.indices[1]);
			}
			message.text = data.text;
			if (log.length > 20) log.shift();
			log.push(message);
			socket.broadcast(message);
		}
	}
}
var stream  = function(url){
	twitter.request('GET', url,
		{'host':'stream.twitter.com', 'authorization':auth}
	).on('response', function(res){
		if (res.statusCode == 200) res.on('data', handle);
		else console.log('Code:', res.statusCode)}
	).end();
};

stream('/1/statuses/sample.json');
//stream('/1/statuses/filter.json?track=yfrog,twitpic');
//stream('/1/statuses/filter.json?track=youtube');
