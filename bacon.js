#!/usr/local/bin/node

var crypto = require('crypto');
var http = require('http');
var fs = require('fs');

var conf = JSON.parse(fs.readFileSync('conf'));

var sign = function(){
	var time = Math.floor(new Date().getTime()/1000);
	return (crypto.createHash('md5')
			.update(conf.key)
			.update(conf.secret)
			.update(time.toString())).digest('hex');
}

var returns = {
	'descriptor/moviegenres': 'genres',
	'descriptor/significantmovies': 'movies'};

var rovio = function(resource, params, callback) {
	var path = '/data/v1/' + resource +
		'?country=US&language=en&format=json&apikey=' +
		conf.key + '&sig=' + sign();
	for (var k in params) {
		path += '&' + k + '=' + params[k];
	}
	console.log(path);
	var req = http.get({
		host:'api.rovicorp.com',
		path:path},
		function(res){
			var body = '';
			res.on('data', function(chunk){
				body += chunk;
			});
			res.on('end', function(chunk){
				callback(JSON.parse(body)[
					returns[resource]||resource.split('/')[1]]);
			});
		});
}

var id = function(target) {
	return target.replace(/ /g, '+');
}

var movie = function(target) {
	return target.title + ' (' + target.releaseYear + ')';
}

var actor = function(target) {
	return target.name + (target.role ? ' (' + target.role + ')' : '');
}

var actors = function(req, source) {
	rovio('movie/cast', {movieId: id(source)}, function(cast) {
		for (k in cast) {
			var member = cast[k];
			console.log(member);
			req.write('<div><a href="/actor/' + id(member.id) + '">')
			if (member.thumbnail) {
				req.write('<img src="' + member.thumbnail +
					'" title="' + actor(member) + '">');
			}
			req.write(actor(member) + '</a></div>');
		}
		req.end();
	});
}

var movies = function(req, source) {
	rovio('name/filmography', {amgmovieid: id(source)}, function(films) {
		for (k in films) {
			var feature = films[k];
			console.log(feature);
			req.write('<div><a href="/movie/' + id(feature.id) + '">' +
			   feature.title + ' (' + feature.year + ')</a></div>');
		}
		req.end();
	});
}

var start = function(req) {
	rovio('descriptor/moviegenres', {include:'subgenres'}, function(genres) {
		rovio('descriptor/significantmovies', {
			genreids:id(genres[0].id)
		}, function(movies) {
			var from = movies[0];
			console.log(from);
			var to = movies[1];
			req.write('Go from <img src="' + from['thumbnail'] +
				'" title="' + movie(from) + '"> to <img src="' +
				to.thumbnail + '" title="' + movie(to) + '">.<hr>');
			actors(req, from.id);
		});
	});
};

http.createServer(
	function(res, req) {
		var parts = res.url.split('/');
		switch (parts[1]) {
			case '':
				req.writeHead(200, {'Content-Type': 'text/html'});
				start(req);
				break;
			case 'actor':
				req.writeHead(200, {'Content-Type': 'text/html'});
				movies(req, parts[2]);
				break;
			case 'movie':
				req.writeHead(200, {'Content-Type': 'text/html'});
				actors(req, parts[2]);
				break;
		}
	}).listen(8080, '0.0.0.0');
