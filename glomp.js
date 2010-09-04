#!/usr/bin/node
var http = require('http'), fs = require('fs');

//RELOAD_GLOMP = true; // Reload glomp on main reload (glomp development only)

// Internal variables
var server, templates = {}, urls = {};
global.running = 0;

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
	return values.join('');
}
function serve(){
	global.running = 1;
	if (!exports.port) exports.port = 80;
	server = http.createServer(
		function(req, res){
			var _code = 200;
			function headers(io){
				if (!res._header) res.writeHead(_code, io.headers);
			}
			io = {
				'end': function(data){headers(io); res.end(data); return io;}
			,	'headers': {'Content-Type':'text/plain'}
			,	'url': req.url
			}
			io.code = function(code){
				io.status(code);
				io.end(exports.errors[code]);
			}
			io.html = function(data){
				io.headers['Content-Type'] = 'text/html';
				io.out(data);
				return io;
			}
			io.out = function(data){headers(io); res.write(data); return io;}
			io.render = function(dict){
				io.html(render(dict));
				return io;
			}
			io.status = function(code){
				if (code)
					if (!res._header){
						_code = code;
						return io;
					}
				else return code;
			}
			io.template = function(name, values){
				if (templates[name]) io.html(templates[name])
				else template(name, function(data){
					if (data) io.html(data);
					else io.code(500);
				});
				return io;
			}
			exports.route(io);
			res.end();
		});
	server.listen(exports.port, "0.0.0.0");
}
function template(file, callback){
	console.log('loading template ' + file);
	fs.readFile(file, 'utf-8', function (e, data) {if (e) console.log(e);
		if (data) templates[file] = data;
		if (callback) callback(data);
	});
}

// Exports
exports.debug = function(){
	var runner = process.mainModule.filename;
	fs.unwatchFile(runner);
	fs.watchFile(runner, function(cur, prev){
		if (cur.mtime.toString() == prev.mtime.toString()) return; //TODO:???
		/* if (RELOAD_GLOMP){
			global.running = 0;
			server.close();
			delete(module.moduleCache[__filename]);
		} */
		delete(module.moduleCache[runner]);
		require(runner);
		console.log(runner.split('/').pop() + ' reloaded at ' + cur.mtime);
	});
	if (!global.running){
		serve();
		console.log('glomp is debug at ' + exports.port + '!');
	}
}
exports.errors = {
	'404':'404: Thank you visitor, but your file is in another server'
,	'500':'500: Nice job breaking it, hero'
}
exports.go = function(){
	fs.unwatchFile(process.mainModule.filename)
	serve();
	console.log('glomp is go at ' + exports.port + '!');
	return exports
}
exports.port = process.argv[2];
exports.route = function (io){
	if (io.url in urls) urls[io.url](io);
	else io.code(404);
}
exports.templates = function(name){
	if (name instanceof Array)
		for (n in name){
			template(name[n]);
		}
	else if (name) template(name);
	else return templates;
	return exports;
}
exports.urls = function(key, value){
	if (value) urls[key] = value;
	else if (key)
		for (k in key) urls[k] = key[k];
	else return urls;
	return exports;
}
