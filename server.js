#!/usr/bin/env node

var fs = require('fs'),
	http = require('http'),
	url  = require('url'),
	zombie = require('zombie'),
	querystring = require('querystring');

var selector = fs.readFileSync('selector.user.js'),
	url = '/selector.user.js';

var server = http.createServer(function(req, res) {
	if (req.method == 'POST') {
		var buffer = '';
		req.on('data', function(chunk) {buffer+=chunk});
		req.on('end', function() {
			res.writeHead(200, {'Content-Type': 'text/html'});
			var history = JSON.parse(querystring.parse(buffer).history);
			var recurse = function(e, browser, status) {
				var item = history.shift();
				res.write('<li>' + item.action + ': ' + item.value + '</li>');
				switch (item.action) {
				case 'follow':
					browser.clickLink(item.value, recurse);
					break;
				case 'download':
					var target = browser.querySelector(item.value);
					switch (target.tagName) {
					case 'IMG':
						res.write('<li><a href="' + browser.location +
							'"><img src="' + target.src + '" title="' +
							(target.title || browser.text('title')) +
							'"></a></li>');
						break;
					default:
						res.write('<li>download: ' + target.tagName + '</li>');
						break;
					}
					break;
				}
				if (history.length == 0) res.end('</ul>');
				else recurse(null, browser, status);
			};

			// First item should be source
			var source = history.shift().value;
			res.write('<ul><li> source: <a href="' + source + '">' +
				source + '</a></li>');
			zombie.visit(source, {runScripts: false}, recurse);
		});
	} else {
		if (req.url == url) {
			res.writeHead(200, {'Content-Type': 'text/javascript'});
			res.end(selector);
		} else {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end('Install <a href="' + url + '">Selector</a> script.');
		}
	}
});
server.listen(process.env.PORT||8080);
