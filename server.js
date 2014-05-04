#!/usr/bin/env node

var concat = require('concat-stream')
  , fs = require('fs')
  , http = require('http')
  , querystring = require('querystring')
  , url = require('url')

var extract = require('./extract')

//var icon = fs.readFileSync('static/read.ico');
var index = fs.readFileSync('index.html');
var script = fs.readFileSync('static/read.js', {encoding:'utf-8'}).replace(
		'function(){"format"};', extract.format.toString());

var request = function(req, res) {
	switch (req.url) {
	case '/favicon.ico':
		res.writeHead(200, {'Content-Type': 'image/x-icon'});
		res.end();//icon);
		break;
	case '/read.js':
		res.writeHead(200, {'Content-Type': 'application/javascript'});
		res.end(script);
		break;
	case '/add':
		req.pipe(concat(function(data) {
			data = querystring.parse(String(data));
			if (!data.rss || !data.target) {
				res.writeHead(400, {'Content-Type': 'text/plain'});
				return res.end('malformed request');
			}
			extract(data.rss, data.target).pipe(concat(function(data){
				res.writeHead(302, {'Location': '/'});
				return res.end();
			}));
		}));
		break;
	default:
		var url = req.url.match('/(\\d*)');
		if (!url) {
			res.writeHead(404);
			res.end('404');
			return;
		}
		var offset = parseInt(url[1]) || 0;
		res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
		extract.retrieve(function(e, items){
			var ret = index;
			items.forEach(function(item) {
				ret += item.snippet;
			});
			ret += '</div></body></html>';
			res.end(ret);
		}, offset);
	}
}

if (require.main === module) {
	extract.init('mongodb:///tmp/mongodb-27017.sock/read', function() {
		http.createServer(request).listen(80);
	});
}
