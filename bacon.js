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

var returns = {moviegenres: 'genres', significantmovies: 'movies'};

var rovio = function(resource, params, callback) {
	var path = '/data/v1/descriptor/' + resource +
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
				callback(JSON.parse(body)[returns[resource]]);
			});
		});
}

var logger = function(items) {
	console.log(items);
}

rovio('moviegenres', {include:'subgenres'}, function(genres) {
	rovio('significantmovies', {
		genreids:genres[0].id.replace(/ /g, '+')
	}, logger);
});

/*http.createServer(
	function(res, req) {
	});
server.listen(8080, '0.0.0.0');*/
