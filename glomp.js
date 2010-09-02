#!/usr/bin/node
var http = require('http');
function render(dict, node, values, attrs){
	for (n in dict){
		if (n == '$'){values.push(dict[n]);}
		else if(n[0] == '$'){attrs.push(' '+n.slice(1)+'="'+dict[n]+'"')}
		else if (typeof(dict[n]) == 'object'){
			values.push(render(dict[n], n, [], []));
		} else values.push('<'+n+'>'+dict[n]+'</'+n+'>');
	}
	if (node){values.unshift('<'+node+attrs+'>'); values.push('</'+node+'>');}
	ret = values.join('')
	return ret
}
exports.route = function (urls, io){
	if (io.url in urls) urls[io.url](io);
	else {
		io.code = 404;
		io.end('Resource not found')
	}
}
exports.port = process.argv[2]
exports.go = function(urls){
	if (!exports.port) exports.port = 80
	http.createServer(
		function(req, res){
			_code = 200
			function headers(io){
				if (!res._header) res.writeHead(_code, io.headers);
			}
			io = { 'end': function(){res.end();}
			, 'headers': {'Content-Type':'text/plain'}
			, 'url': req.url,
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
				io.html(render(dict, null, [], []));
			}
			exports.route(urls, io);
			res.end();
		}).listen(exports.port, "0.0.0.0");
	console.log('glomp is go at ' + exports.port + '!');
}
