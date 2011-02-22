var gid = 0, size = 32, canvas = context = null;
var keys = {16:'run', 37:'left', 39:'right', 38:'up', 40:'down'}

function adjust(i){return Math.floor(parseInt(i)/size);}
function tile(x, y){
	var r = parseInt(map[adjust(y)][adjust(x)]); return r;}

types = {}

types.hero = function(data){
	this.x  = data.x;
	this.y  = data.y;
	this.dx = data.dx || 0;
	this.dy = data.dy || 0;
	this.draw = function(){
		context.fillStyle = '#00f';
		context.fillRect(this.x-size/2, this.y-size/2, size, size);
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
			if (this.dy < 0) this.dy = 0;
		} else if (this.jump && this.up){
		   	this.dy = -size+1;
			this.jump = false;
		}
		this.x += this.dx;
		this.y += this.dy;
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
	for (var o in world) world[o].update();
	exports.draw();
}

window.onload = function(){
	canvas = document.getElementById('canvas'),
		   context = canvas.getContext('2d');
	(window.onresize = function(){
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
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
