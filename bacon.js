#!/usr/local/bin/node

var crypto = require('crypto');
var http = require('http');

var key = '5sqj7bgxvacspnpqbnwqmpwe';
var secret = '42bNwNTgJg';

var sign = function(){
	var time = Math.floor(new Date().getTime()/1000);
	return (crypto.createHash('md5')
			.update(key)
			.update(secret)
			.update(time.toString())).digest('hex');
}

var returns = {moviegenres: 'genres'};

var rovio = function(resource, params, callback) {
	var path = '/data/v1/descriptor/' + resource +
		'?country=US&language=en&format=json&apikey=' +
		key + '&sig=' + sign();
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

var init = function(genres) {
	var ret = {};
	for (var k in genres) {
		var genre = genres[k];
		ret[genre['name']] = genre['id'];
	}
	console.log(ret);
}

rovio('moviegenres', {include:'subgenres'}, init);
