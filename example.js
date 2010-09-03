#!/usr/bin/node

var glomp = require('./glomp.js');

glomp.urls({
	'/' : function(io){
		var template = {html:{head:{style:{$type:'text/css',
			$:'body {background:#00f; text-align:center}'}},
			meta:{'$http-equiv':'refresh',$content:1},body:[
			{h1:{$style:'color:#0f0;',$:'Hello World!'}},
			{h1:{$style:'color:#ff0;',$:'Hello World!'}},
			{h1:{$style:'color:#0ff;',$:'Hello World!'}},
			{h1:{$style:'color:#f0f;',$:'Hello World!'}},
			{h1:{$style:'color:#f00;',$:'Hello World!'}},
			]}}

		template.html.body.push({h1:'What\'s up?'})
		io.template(template);
	}
}).debug();
