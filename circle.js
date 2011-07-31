var Circle = function(x, y, r){
	this.x = x, this.y = y, this.r = r;
}
Circle.prototype.draw = function(ctx){
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); 
	ctx.fill();
}
Circle.prototype.collide = function(circle){
	return Math.sqrt(Math.pow(this.x - circle.x, 2) +
			Math.pow(this.y - circle.y, 2)) > this.r + circle.r;
}

var Bullet = function(x, y, dx, dy){
	Circle.call(this, x, y, 2);
	this.dx = dx, this.dy = dy;
}
Bullet.prototype = new Circle;
Bullet.prototype.update = function(){
	this.x += this.dx;
	this.y += this.dy;
}

var Ship = function(x, y){
	this.left = this.right = this.up = this.down = false;
	Circle.call(this, x, y, 5);
	this.px = this.x;
	this.py = this.y - 100;
	this.speed  = 3;
	this.bullet = 8;
	this.firing = 0;
}
Ship.prototype = new Circle;
Ship.prototype.update = function(game){
	var dx = this.px-this.x, dy = this.py-this.y;
	this.delta = 1-Math.min(.9, Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2))/100);
	this.arc = Math.atan2(dy, dx);
	this.dx  = (this.right-this.left) * this.speed;
	this.dy  = (this.down-this.up)    * this.speed;
	this.x  += this.dx; this.y  += this.dy;
	this.px += this.dx; this.py += this.dy;
	if (this.fire){
		if (this.firing++ >= 50) this.firing = 1;
		var d = Math.sin(Math.PI*this.firing/25.0) * this.delta;
		game.things.push(new Bullet(this.x, this.y,
					Math.cos(this.arc+d) * this.bullet + this.dx,
					Math.sin(this.arc+d) * this.bullet + this.dy));
		game.things.push(new Bullet(this.x, this.y,
					Math.cos(this.arc-d) * this.bullet + this.dx,
					Math.sin(this.arc-d) * this.bullet + this.dy));
	} else {
		this.px -= this.dx; this.py -= this.dy;
		var dx = this.x - this.px, dy = this.y - this.py;
		var dist = Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2));
		if (dist > 100){
			this.px = this.x - dx*100/dist;
			this.py = this.y - dy*100/dist;
		}
	}
}
Ship.prototype.draw = function(ctx){
	Circle.prototype.draw.call(this, ctx);
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.r*4, this.arc-this.delta, this.arc+this.delta); 
	ctx.stroke();
	/*
	ctx.beginPath();
	ctx.arc(this.px, this.py, 1, 0, Math.PI*2); 
	ctx.stroke(); /**/
}

var Game = function(){
	this.things = [];
	this.things.push(this.player = new Ship(0, 0));
}
Game.prototype.draw = function(ctx){
	ctx.save()
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.translate(ctx.canvas.width/2, ctx.canvas.height-20);
	this.things.forEach(function(o){o.draw(ctx);})
	ctx.restore()
}
Game.prototype.update = function(){
	var self = this;
	this.things.forEach(function(o){o.update(self)});
}

window.onload = function(){
	var codes = {37:'left', 38:'up', 39:'right', 40:'down', 17:'fire',
		65:'left', 87:'up', 68:'right', 83:'down', 32:'fire'}
	var cvs = document.getElementById('c');
	var ctx = cvs.getContext('2d');

	var game = new Game();
	(window.onresize = function(){
		cvs.width  = window.innerWidth;
		cvs.height = window.innerHeight;
		game.draw(ctx);
	})();
	window.onkeydown = window.onkeyup = function(e){
		game.player[codes[e.keyCode]] = e.type == 'keydown';
	}
	window.setInterval(function(){game.update(); game.draw(ctx);}, 33);
}
