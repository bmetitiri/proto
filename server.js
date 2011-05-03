#!/usr/bin/env node

// imports
var http = require('http'),
	fs   = require('fs'),
	io   = require('socket.io'),
	querystring = require('querystring'),
	TwitterNode = require('twitter-node').TwitterNode;

// variables
var keywords = {'☺':0},
	reset    = true,
	time     = 1,
	tweets   = [];

// shared code
var handle = function(tweet){
	for (k in keywords)
		if (tweet.text.toLowerCase().indexOf(k)+1) keywords[k]++;
	return '<img src="'+tweet.user.profile_image_url+
		'" /><div class="author" style="background:#'+
		tweet.user.profile_sidebar_fill_color+'; color:#'+
		tweet.user.profile_text_color+'"><a style="color:#'+
		tweet.user.profile_link_color+
		'" href="http://twitter.com/'+tweet.user.screen_name+
		'" title="'+tweet.user.description+'">'+tweet.user.name+
		'</a> ('+tweet.user.followers_count+')</div> via '+
		tweet.source+'<br />'+tweet.text;
}
var delta = function(keyword){
	return '<form method="post"><input name="delta" type="submit" value="-" /> ' +
		keyword + ' (<span class="count">' + keywords[keyword] +
		'</span>)<input name="keyword" type="hidden" value="'+
		keyword +'" /></form>';
}

// "template"
var cwd   = __filename.slice(0, __filename.lastIndexOf('/')+1),
	index = fs.readFileSync(cwd+'index.html').toString().split('<!---->'),
	funcs = [function(req, res){
			for (k in keywords) res.write('<li>'+delta(k)+'</li>');
			res.write('<li class="info">Reset in <span id="time">'+ (time>0?time:0) +'</span> seconds</li>');
		}, function(req, res){
			for (var i = 0; i < tweets.length; i++)
				res.write('<li>'+tweets[i]+'</li>');
		}, function(req, res){
			res.write('var keywords = '+JSON.stringify(keywords) + ', handle = ' +
					handle.toString() + ', delta = ' + delta.toString());
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
					keywords[post.keyword] = 0;
					socket.broadcast({add:post.keyword});
				} else if (post.delta == '-' && keywords[post.keyword]){
					delete keywords[post.keyword]
					socket.broadcast({remove:post.keyword});
				}
				reset = true;
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
			function(tweet){
				tweets.push(handle(tweet));
				socket.broadcast(tweet);
				if (tweets.length > 24) tweets.shift();
			}).addListener('error',
			function(error){console.log(error)});

var stream = function(){
	twit.trackKeywords = [];
	for (k in keywords) twit.track(k);
	console.log('tracking: ' + twit.trackKeywords);
	if (twit.trackKeywords.length) twit.action = 'filter';
	else twit.action = 'sample';
	twit.stream();
}

setInterval(function(){
	if (time-- < 1 && reset){
		console.log('reset stream at ' + new Date());
		stream();
		reset = false;
		time = 60;
		socket.broadcast({time:time});
	}
}, 1000);
