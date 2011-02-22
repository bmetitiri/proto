var sprite = new Image();
sprite.src = 'data:image/png;base64,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';

var gid = 0, size = 16, canvas = context = null, tick = 0;
var keys = {16:'run', 37:'left', 39:'right', 38:'up', 40:'down'}

function adjust(i){return Math.floor(parseInt(i)/size);}
function tile(x, y){
	var r = parseInt(map[adjust(y)][adjust(x)]); return r;}

types = {}

types.hero = function(data){
	this.frame = 0;
	this.x  = data.x;
	this.y  = data.y;
	this.dx = data.dx || 0;
	this.dy = data.dy || 0;
	this.draw = function(){
//		context.fillStyle = '#00f';
//		context.fillRect(this.x-size/2, this.y-size/2, size, size);
		var f = this.frame%4;
		context.drawImage(sprite, 24*(f==3?1:f),
			this.right?32:this.left?96:64,
			24, 32, this.x-12, this.y-18, 24, 32);
	}
	this.update = function(){
		this.dx = 0, dir = 0;
		if (this.left){  this.dx -= 5; this.dir = -1;}
		if (this.right){ this.dx += 5; this.dir = 1;}
		if (this.run)   this.dx *= 2;
		var x = this.x+(size-1)*this.dir;
		if (tile(x, this.y-7) || tile(x, this.y+7)){
			this.x  = size*adjust(this.x)+size/2;
			this.dx = 0;
		}

		// if on ground
		if (tile(this.x-7, this.y+size-1) || tile(this.x+7, this.y+size-1)){
			this.y  = size*adjust(this.y)+size/2;
			this.dy = 0;
			this.jump = this.double = true;
		} else if (this.dy < size-1){
		   	this.dy += 1;
			if (!this.up && this.double){
			   	this.double = false;
				this.jump = true;
			}
		}
		// jumped into something above
		if (tile(this.x-7, this.y-size-1) || tile(this.x+7, this.y-size-1)){
			this.y  = size*adjust(this.y)+size/2;
			if (this.dy < 0) this.dy *= -.1;
		} else if (this.jump && this.up){
		   	this.dy = -size+1;
			this.jump = false;
		}
		this.x += this.dx;
		this.y += this.dy;
		if (this.dx){
			if (this.run||tick%3==0) this.frame++;
		} else this.frame = 1;
	}
}

if (typeof(exports) == 'undefined') exports = {}
exports.world = world = {}

exports.draw = function(){
	context.fillStyle = '#89c';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = '#000';
	context.save();
	if(typeof(hero) != 'undefined')
		context.translate((canvas.width/8)-hero.x,-size);
	for (var y = 0; y < map.length; y++){
		for (var x = 0; x < map[0].length; x++)
			if (map[y][x]=='1') context.fillRect(x*size, y*size, size, size);
	}
	for (var o in world) world[o].draw();
	context.restore();
}

exports.init = function(){
	hero = world['@'] = new types.hero({x:100, y:100});
	setInterval(exports.main, 30);
}

exports.main = function(){
	tick++;
	for (var o in world) world[o].update();
	exports.draw();
}

window.onload = function(){
	canvas = document.getElementById('canvas'),
		   context = canvas.getContext('2d');
	(window.onresize = function(){
		canvas.width  = window.innerWidth/2;
		canvas.height = window.innerHeight/2;
		exports.draw(canvas);
	})();
	window.onkeydown = window.onkeyup = function (e){
		var action = keys[e.keyCode];
		if (action){
			state = e.type == 'keydown';
			if (hero[action] != state) hero[action] = state;
		}
	}

	exports.init();
	exports.draw(canvas);
}
