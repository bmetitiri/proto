#!/usr/bin/node

require.paths.unshift('.');
var glomp = require('glomp');

template = {html:{body:{h2:'test',
	h1:{$style:"color:#f00;",$:'Hello World!'},h3:'test2'}}}

glomp.go({
	'/' : function(io){
		io.template(template);
	}
});
