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

var Bullet = function(x, y, d){
	Circle.call(this, x, y, 2);
	this.speed = 7;
	this.dx    = Math.cos(d) * this.speed;
	this.dy    = Math.sin(d) * this.speed;
}
Bullet.prototype = new Circle;
Bullet.prototype.update = function(){
	this.x += this.dx;
	this.y += this.dy;
}

var Ship = function(x, y){
	Circle.call(this, x, y, 5);
	this.speed  = 3;
	this.delta  = .1;
	this.arc_r  = Math.PI * 2 - 1;
	this.arc_l  = Math.PI + 1;
}
Ship.prototype = new Circle;
Ship.prototype.update = function(){
	if (this.left){
		if (!this.fire){
			this.arc_l += this.delta;
			this.arc_r += this.delta;
		}
		this.x -= this.speed;
	}
	if (this.right){
		if (!this.fire){
			this.arc_l -= this.delta;
			this.arc_r -= this.delta;
		}
		this.x += this.speed;
	}
	if (this.up){
		if (!this.fire && this.arc_r - this.arc_l < Math.PI){
			this.arc_l -= this.delta;
			this.arc_r += this.delta;
		}
		this.y -= this.speed;
	}
	if (this.down){
		if (!this.fire && this.arc_r - this.arc_l > this.delta*2){
			this.arc_l += this.delta;
			this.arc_r -= this.delta;
		}
		this.y += this.speed;
	}
	if (this.fire){
		things.push(new Bullet(this.x, this.y, Math.random() *
				(this.arc_l - this.arc_r) + this.arc_r));
	}
}
Ship.prototype.draw = function(ctx){
	Circle.prototype.draw.call(this, ctx);
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.r*4, this.arc_l-.1, this.arc_r+.1); 
	ctx.stroke();
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
