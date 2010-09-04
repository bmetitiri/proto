#!/usr/bin/env node

require('./glomp.js').templates(['index.html']).urls({
	'/' : function(io){
		io.template('index.html');
	}
}).debug();
