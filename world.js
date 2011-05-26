var utils = {
	roll : function(n){return Math.random()*n|0},
}

var chunk_size = 16, things = [], focus = {x:0, y:0}, offset = {x:0, y:0};

var Terrain = function(x, y, z){
	this.x = x, this.y = y, this.z = z;
	this.blocks = [];

	var z = 0;
	while (z++ < chunk_size/4){
		var y = 0, row = [];
		while (y++ < chunk_size){
			var x = 0, column = [];
			while (x++ < chunk_size)
				column.push(0);
			row.push(column);
		}
		this.blocks.push(row);
	}
}
Terrain.world = {};
Terrain.lookup = function(x, y, z){
	x = Math.floor(x/chunk_size);
	y = Math.floor(y/chunk_size);
	z = Math.floor(z/(chunk_size/4));
	if (Terrain.world[z]==undefined) Terrain.world[z] = {}
	if (Terrain.world[z][y]==undefined) Terrain.world[z][y] = {}
	if (Terrain.world[z][y][x]==undefined){
		console.log('generating', x, y, z);
		Terrain.world[z][y][x] = new Terrain(x, y, z).generate();
	}
	return Terrain.world[z][y][x];
}
Terrain.collide = function(x, y, z){
	var o = tile - 1;
	if (x%tile || y%tile){
		return Terrain.get(x, y, z).t|
			Terrain.get(x, y+o, z).t|
			Terrain.get(x+o, y, z).t|
			Terrain.get(x+o, y+o, z).t;
	} else return Terrain.get(x, y, z).t;
}
Terrain.get = function(x, y, z){ //TODO: Optimize
	x = Math.floor(x/tile);
	y = Math.floor(y/tile);
	z = Math.floor(z/tile);
	var terrain = Terrain.lookup(x, y, z);
	x %= chunk_size; y %= chunk_size; z %= chunk_size/4;
	if (!terrain.blocks) return {t:null}
	return {x:x, y:y, z:z, T:terrain, t:terrain.blocks[z][y][x]}
}
Terrain.prototype.draw = function(ctx){
	var x_o = this.x*chunk_size*tile;
	var y_o = this.y*chunk_size*tile;
	var x = -1;
	while (++x < this.blocks[0][0].length){
		var y = -1;
		while (++y < this.blocks[0].length){
			var z = -1, block = null;
			while (++z < this.blocks.length){
				block = this.blocks[z][y][x];
				if (block) break;
			}
			if (block){
				var s = 2*z+this.z*chunk_size/4;
				switch(block){
					case 1:
						ctx.fillStyle = '#330';
						ctx.fillRect(x*tile+s+x_o, y*tile+s+y_o,
								tile-s*2, tile-s*2);
						break;
					case 2:
						var o=tile/2;
						ctx.fillStyle = '#0f0';
						ctx.beginPath();
						ctx.arc(x*tile+o+x_o, y*tile+o+y_o,
								tile/2-s, 0, Math.PI*2);
						ctx.closePath();
						ctx.fill();
						break;
				}
			}
		}
	}
}
Terrain.prototype.generate = function(){
	if (this.z >= 0){
		var i;
		for (i = 0; i < 50; i++){
			var x = utils.roll(chunk_size);
			var y = utils.roll(chunk_size);
			var z = utils.roll(chunk_size/4);
			this.hill(x, y, z);
		}
	}
	return this;
}
Terrain.prototype.hill = function(x, y, z){
	if (this.blocks[z][y][x]) return;
	this.blocks[z][y][x] = 2;
	z++;
	if (this.blocks[z]){
		if (x < chunk_size-1) this.hill(x+1, y, z);
		if (x > 0) this.hill(x-1, y, z);
		if (y < chunk_size-1) this.hill(x, y+1, z);
		if (y > 0) this.hill(x, y-1, z);
	}
	while (z < chunk_size/4-1)
		this.blocks[z++][y][x] = 1;
}

//Terrain.world[0][0][0] = new Terrain(0, 0, 0).generate();

var Pleb = function(x, y, z){
	this.x = x; this.y = y; this.z = z; this.speed = 1;
}
Pleb.prototype.size = function(){return {width:tile, height:tile}};
Pleb.prototype.draw = function(ctx){
	var o = 2*this.z / tile;
	if (o > tile/2) o = tile/2-1;
	ctx.fillStyle = '#00f';
	ctx.fillRect(this.x+o, this.y+o, tile-o*2, tile-o*2);
};
Pleb.prototype.move = function(dx, dy){
	var target = Terrain.collide(this.x+dx, this.y+dy, this.z-1);
	if (!target&1){
		this.x += dx;
		this.y += dy;
	}
	if (this.dig && target){
		var o = (tile)/this.speed;
		var b = Terrain.get(this.x+dx*o, this.y+dy*o, this.z-1);
		if (b.t) b.T.blocks[b.z][b.y][b.x] = 0;
	} else if (target&2)
		if (!Terrain.collide(this.x, this.y, this.z-tile))
			this.z -= 4;
};
Pleb.prototype.update = function(){
	if (!Terrain.collide(this.x, this.y, this.z)) this.z+=2;
	if (this.left)  this.move(-this.speed, 0)
	if (this.right) this.move( this.speed, 0)
	if (this.up)   this.move(0, -this.speed)
	if (this.down) this.move(0,  this.speed)
};

var codes = {37:'left', 38:'up', 39:'right', 40:'down', 17:'dig'}
var tile = 16;
var init = function(){
	things.push(focus = new Pleb(tile*utils.roll(chunk_size),
				tile*utils.roll(chunk_size), 0));
	things.push(new Pleb(tile*utils.roll(chunk_size),
				tile*utils.roll(chunk_size), 0));
}

var main = function(ctx){
	things.forEach(function(o){o.update()});
}

var draw = function(ctx){
	ctx.clearRect(-ctx.canvas.width/2, -ctx.canvas.height/2,
		ctx.canvas.width, ctx.canvas.height);
	ctx.save();
	if (focus)
		offset.x = (offset.x-focus.x)/2, offset.y = (offset.y-focus.y)/2;
	ctx.translate(offset.x, offset.y);
	for (var z in Terrain.world)
		for (var y in Terrain.world[z])
			for (var x in Terrain.world[z][y])
				Terrain.world[z][y][x].draw(ctx);
	things.forEach(function(o){o.draw(ctx)});
	ctx.restore();
};

window.onload = function(){
	var cvs = document.getElementById('canvas');
	var ctx = cvs.getContext('2d');
	init();
	(window.onresize = function(){
		cvs.width  = window.innerWidth;
		cvs.height = window.innerHeight;
		ctx.translate(cvs.width/2, cvs.height/2);
		draw(ctx);
	})();
	window.onkeydown = window.onkeyup = function(e){
		//console.log(e.keyCode);
		if (focus) focus[codes[e.keyCode]] = e.type == 'keydown';
	}
	window.onclick = function(e){
		var x = e.x-cvs.width/2-offset.x, y = e.y-cvs.height/2-offset.y;
		//focus = {x:0, y:0};
		things.forEach(function(o){
			var s = o.size();
			if (x > o.x && x < o.x+s.width&& y > o.y && y < o.y+s.height)
				return focus = o;
		});
	}
	window.setInterval(function(){
		main(); draw(ctx);
	}, 33);
}
