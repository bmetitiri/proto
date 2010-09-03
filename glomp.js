#!/usr/bin/node
var http = require('http'), fs = require('fs');

RELOAD_GLOMP = true // Reload glomp on main reload (glomp development only)

// Internal functions
function render(dict, node){
	var values = [], attrs = []
	for (n in dict){
		var cur = dict[n];
		if (n == '$'){values.push(cur);}
		else if(n[0] == '$'){attrs.push(' '+n.slice(1)+'="'+cur+'"')}
		else if (typeof(cur) == 'object'){
			if (cur instanceof Array)
				for (i in cur)
					values.push(render(cur[i]));
			else values.push(render(cur, n));
		} else values.push('<'+n+'>'+cur+'</'+n+'>');
	}
	if (node){values.unshift('<'+node+attrs+'>'); values.push('</'+node+'>');}
	return values.join('')
}

function serve(){
	if (!exports.port) exports.port = 80
	server = http.createServer(
		function(req, res){
			var _code = 200
			function headers(io){
				if (!res._header) res.writeHead(_code, io.headers);
			}
			io = { 'end': function(){res.end();}
			, 'headers': {'Content-Type':'text/plain'}
			, 'url': req.url
			}
			io.end = function(data){headers(io); res.end(data); return io;}
			io.html = function(data){
				io.headers['Content-Type'] = 'text/html';
				io.out(data);
				return io;
			}
			io.out = function(data){headers(io); res.write(data); return io;}
			io.status = function(code){
				if (code)
					if (!res._header){
						_code = code;
						return io;
					}
				else return code
			}
			io.template = function(dict){
				io.html(render(dict));
			}
			exports.route(io);
			res.end();
		});
	server.listen(exports.port, "0.0.0.0");
}

// Internal variables
var urls = {}, server;

global.running = 0;

// Exports
exports.debug = function(){
	var runner = process.mainModule;
	fs.unwatchFile(runner.filename);
	fs.watchFile(runner.filename, function(cur, prev){
		if (cur.mtime.toString() == prev.mtime.toString()) return; //TODO:???
		delete(module.moduleCache[runner.filename]);
		if (RELOAD_GLOMP){
			global.running = 0;
			server.close();
			delete(module.moduleCache[__filename]);
		}
		require(runner.filename);
		console.log(runner.filename.split('/').pop() + ' reloaded at ' + cur.mtime);
	});
	if (!global.running){
		global.running = 1;
		serve();
		console.log('glomp is debug at ' + exports.port + '!');
	}
}
exports.go = function(){
	serve();
	console.log('glomp is go at ' + exports.port + '!');
	return exports
}
exports.route = function (io){
	if (io.url in urls) urls[io.url](io);
	else {
		io.code = 404;
		io.end('404: Thank you visitor, but ['+io.url+'] is in another server')
	}
}
exports.port = process.argv[2];
exports.urls = function(key, value){
	if (value) urls[key] = value;
	else if (key)
		for (k in key) urls[k] = key[k];
	else return urls;
	return exports;
}
