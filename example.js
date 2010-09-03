#!/usr/bin/node

var glomp = require('./glomp.js');

template = {html:{body:[
	{h1:{$style:"color:#0f0;",$:'Hello World!'}},
	{h1:{$style:"color:#ff0;",$:'Hello World!'}},
	{h1:{$style:"color:#0ff;",$:'Hello World!'}},
	]}}

glomp.urls({
	'/' : function(io){
		io.template(template);
	}
}).debug();
