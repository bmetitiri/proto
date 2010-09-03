#!/usr/bin/node

require('./glomp.js').urls({
	'/' : function(io){
		var template = {html:{head:{style:{$type:'text/css',
			$:'body {background:#00f; text-align:center}'}},
			meta:{'$http-equiv':'refresh',$content:1},body:[
			{h1:{$style:'color:#0f0;',$:'Hello World!'}},
			{h2:{$style:'color:#ff0;',$:'Hello World!'}},
			{h3:{$style:'color:#0ff;',$:'Hello World!'}},
			{h4:{$style:'color:#f0f;',$:'Hello World!'}},
			{h5:{$style:'color:#f00;',$:'Hello World!'}},
			]}}

		template.html.body.push({h6:'What\'s up?'})
		io.template(template);
	}
}).debug();
