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
	return {name:movie.title + ' (' + (movie.releaseYear || movie.year) + ')',
			id:movie.id, type:'movie', image:movie.thumbnail};
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

exports.getGenres = function(callback) {
	rovio('descriptor/moviegenres',
			{include:'subgenres'}, function(genres) {
		callback(genres);
	});
}

var loadMovies = function(genre, callback) {
	rovio('descriptor/significantmovies', {
		genreids:id(genre)
	}, function(movies) {
		console.log('Loaded:', genre);
		for (k in movies) {
			var movie = movies[k];
			if (movie.releaseYear > 1975 &&
				movie.title.indexOf('[') == -1 &&
				movie.title.indexOf(':') == -1 &&
				movie.title.indexOf('TV') == -1 &&
				movie.title.indexOf('Episode') == -1 &&
				movie.title.indexOf('Anime') == -1) {
				getPathCache.push(toMovie(movie));
			}
		}
		callback();
	});
}

exports.getPath = function(callback) {
	if (!getPathCache.length) {
		loadMovies('D   652', // SCI-FI
		function(){loadMovies('D   650', // Fantasy
		function(){loadMovies('D   657', // Epic
		function(){loadMovies('D   648', // Comedy
		function(){
		callback(getPathCache[random(getPathCache.length)],
			getPathCache[random(getPathCache.length)]);
		}
		)})})});
	} else {
		callback(getPathCache[random(getPathCache.length)],
			getPathCache[random(getPathCache.length)]);
	}
};
