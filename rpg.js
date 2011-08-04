var key_codes = {37:'left', 38:'up', 39:'right', 40:'down', 17:'fire',
	65:'left', 87:'up', 68:'right', 83:'down', 32:'fire'}

var Square = function(x, y, size){
	this.x = x, this.y = y, this.size = size;
}
Square.prototype.draw = function(ctx){
	ctx.strokeRect(this.x, this.y, this.size, this.size);
}
Square.prototype.collide = function(square){
	return this.x < square.x+square.size && this.y < square.y+square.size &&
		this.x+this.size < square.x && this.y+this.size < square.y;
}
Square.prototype.update = function(){}

var Character = function(x, y){
	Square.call(this, x, y, 20);
	this.speed = 4;
	this.frame = 0;
	this.dir   = 1; // left:-2, up:-1, down:1, right:2

	this.skin    = '#fb9';
	this.uniform = '#00b';
}
Character.prototype = new Square;
Character.prototype.draw = function(ctx){
	//Square.prototype.draw.call(this, ctx);
	if (this.dx || this.dy) this.frame++;
	else this.frame = 0;
	if (this.frame > 4) this.frame = -2;
	var f = Math.floor(this.frame/2) % 2, fa = Math.abs(f);
	ctx.save();
	ctx.translate(this.x+this.size/2, this.y+this.size/2-7);

	ctx.beginPath(); //Feet
	if (this.dir%2==0){
		ctx.arc(f*3,  13-fa, 4, 0, Math.PI*2); 
		ctx.arc(-f*3, 13-fa, 4, 0, Math.PI*2); 
	} else {
		ctx.arc(-4, 12-f, 4, 0, Math.PI*2); 
		ctx.arc(4,  12+f, 4, 0, Math.PI*2); 
	}
	ctx.fillStyle = '#000';
	ctx.fill();

	ctx.beginPath(); //Body
	ctx.moveTo(8, 10); 
	ctx.lineTo(4, 0); 
	ctx.lineTo(-4, 0); 
	ctx.lineTo(-8, 10); 
	ctx.arcTo(0, 20, 8, 10, 10); 
	ctx.stroke();
	ctx.fillStyle = this.uniform;
	ctx.fill();

	ctx.beginPath(); //Arms
	if (this.dir%2==0){
		ctx.arc(f*2, 10-fa, 3, 0, Math.PI*2); 
	} else {
		ctx.arc(-9, 7+f, 3, 0, Math.PI*2); 
		ctx.arc(9,  7-f, 3, 0, Math.PI*2); 
	}
	ctx.stroke();
	ctx.fillStyle = this.skin;
	ctx.fill();
	ctx.beginPath();
	if (this.dir%2==0){
		ctx.arc(f, 7-fa/2, 3, 0, Math.PI*2); 
	} else {
		ctx.arc(-8, 5+f/2, 3, 0, Math.PI*2); 
		ctx.arc(8,  5-f/2, 3, 0, Math.PI*2); 
	}
	ctx.stroke();
	ctx.fillStyle = this.uniform;
	ctx.fill();

	ctx.beginPath(); //Head
	ctx.arc(0, -5, 12, 0, Math.PI*2); 
	ctx.stroke();
	ctx.fillStyle = this.skin;
	ctx.fill();

	//if (this.dx){//Face
	if (this.dir%2==0){
		var x = 6*this.dir/2;
		ctx.fillStyle = '#000';
		ctx.fillRect(x-1, -5, 2, 7); 
	} else if (this.dir > 0){
		ctx.fillStyle = '#000';
		ctx.fillRect(-5, -4, 2, 7); 
		ctx.fillRect(3, -4, 2, 7); 
	}

	ctx.restore()
}

var Hero = function(x, y){
	Character.call(this, x, y);
}
Hero.prototype = new Character;
Hero.prototype.update = function(){
	this.dx = this.dy = 0;
	if (this.up){
		this.dy -= this.speed;
		this.dir = -1;
	}
	if (this.down){
		this.dy += this.speed;
		this.dir = 1;
	}
	if (this.left){
		this.dx -= this.speed;
		this.dir = -2;
	}
	if (this.right){
		this.dx += this.speed;
		this.dir = 2;
	}
	this.x += this.dx;
	this.y += this.dy;
}

var Game = function(){
	this.things = [];
	this.things.push(this.player = new Hero(0, 0));
}
Game.prototype.draw = function(ctx){
	ctx.save()
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);
	this.things.forEach(function(o){o.draw(ctx);})
	ctx.restore()
}
Game.prototype.onkey = function(e){
	this.player[key_codes[e.keyCode]] = e.type == 'keydown';
}
Game.prototype.update = function(){
	var self = this;
	this.things.forEach(function(o){o.update(self)});
}

window.onload = function(){
	var cvs = document.getElementById('c');
	var ctx = cvs.getContext('2d');

	var game = new Game();
	(window.onresize = function(){
		cvs.width  = window.innerWidth;
		cvs.height = window.innerHeight;
		game.draw(ctx);
	})();
	window.onkeydown = window.onkeyup = function(e){
		game.onkey(e);
	}
	window.setInterval(function(){game.update(); game.draw(ctx);}, 50);
}
