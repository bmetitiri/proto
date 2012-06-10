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

var toActor = function(actor) {
	return {name:actor.name, id:actor.id, type:'actor', image:actor.thumbnail};
}

var toMovie = function(movie) {
	return {name:movie.title, id:movie.id, type:'movie', image:movie.thumbnail};
}

var random = function(max) {
	return Math.floor(Math.random() * max);
}

exports.getActors = function(callback, source) {
	rovio('movie/cast', {movieId: id(source)}, function(cast) {
		var ret = [];
		for (k in cast) {
			ret.push(toActor(cast[k]));
		}
		callback(ret);
	});
}

exports.getMovies = function(callback, source) {
	rovio('name/filmography', {amgmovieid: id(source)}, function(films) {
		console.log(films);
		var ret = [];
		for (k in films) {
			ret.push(toMovie(films[k]));
		}
		callback(ret);
	});
}

var getPathCache = [];

exports.getPath = function(callback) {
	if (!getPathCache.length) {
		rovio('descriptor/moviegenres', {include:'subgenres'}, function(genres) {
			rovio('descriptor/significantmovies', {
				genreids:id(genres[0].id)
			}, function(movies) {
				getPathCache = movies;
				callback(toMovie(movies[random(movies.length)]),
					toMovie(movies[random(movies.length)]));
			});
		});
	} else {
		callback(toMovie(getPathCache[random(getPathCache.length)]),
			toMovie(getPathCache[random(getPathCache.length)]));
	}
};
