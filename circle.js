var things = [], player = null;

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
	this.bullet = 7;
}
Ship.prototype = new Circle;
Ship.prototype.update = function(){
	var dx = this.px-this.x, dy = this.py-this.y,
		dist = 1-Math.min(.9, Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2))/100),
		arc = Math.atan2(dy, dx);
	this.arc_r = arc+dist;
	this.arc_l = arc-dist;
	this.dx  = (this.right-this.left) * this.speed;
	this.dy  = (this.down-this.up)    * this.speed;
	this.x  += this.dx;
	this.y  += this.dy;
	this.px += this.dx;
	this.py += this.dy;
	if (this.fire){
		var d = Math.random() * (this.arc_l - this.arc_r) + this.arc_r;
		things.push(new Bullet(this.x, this.y,
					Math.cos(d) * this.bullet + this.dx,
					Math.sin(d) * this.bullet + this.dy));
	} else {
		if (Math.abs(this.x - (this.px - 2*this.dx))<100) this.px -= 2*this.dx;
		if (Math.abs(this.y - (this.py - 2*this.dy))<100) this.py -= 2*this.dy;
	}
}
Ship.prototype.draw = function(ctx){
	Circle.prototype.draw.call(this, ctx);
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.r*4, this.arc_l-.1, this.arc_r+.1); 
	ctx.stroke();

	/* ctx.beginPath();
	ctx.arc(this.px, this.py, 1, 0, Math.PI*2); 
	ctx.stroke(); */
}

var init = function(){
	things.push(player = new Ship(0, 0));
}
var main = function(){
	things.forEach(function(o){o.update()});
}
var draw = function(ctx){
	ctx.save()
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.translate(ctx.canvas.width/2, ctx.canvas.height-20);
	things.forEach(function(o){o.draw(ctx);})
	ctx.restore()
}

window.onload = function(){
	var codes = {37:'left', 38:'up', 39:'right', 40:'down', 17:'fire',
		65:'left', 87:'up', 68:'right', 83:'down', 32:'fire'}
	var cvs = document.getElementById('c');
	var ctx = cvs.getContext('2d');
	init();
	(window.onresize = function(){
		cvs.width  = window.innerWidth;
		cvs.height = window.innerHeight;
		draw(ctx);
	})();
	window.onkeydown = window.onkeyup = function(e){
		player[codes[e.keyCode]] = e.type == 'keydown';
	}
	window.setInterval(function(){main(); draw(ctx);}, 33);
}
