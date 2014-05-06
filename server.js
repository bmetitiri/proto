#!/usr/bin/env node

var fs			 = require('fs');
var http		 = require('http');
var path		 = require('path');
var whiskers = require('whiskers');

var fastauth = require('./fastauth.js');

var port = process.env.PORT || 80;
var templateDir = 'templates';

var templates = {};
fs.readdirSync(templateDir).forEach(function(file) {
	templates[file.replace('.html', '')] = fs.readFileSync(
		path.join(templateDir, file));
});

http.createServer(fastauth(function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(whiskers.render(templates['index'], {
		auth: req.fastauth,
		description: fastauth.description,
		logout: fastauth.logoutPath,
		mint: fastauth.mint(),
	}));
})).listen(port);

console.log('Listening on', port);
