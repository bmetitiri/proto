var utils = {
	roll : function(n){return Math.floor(Math.random()*n)},
}

var chunk = 16, things = [], world = [];
/*	[
		[1,0,0,0,1],
		[1,0,0,0,0],
		[1,0,0,0,0],
		[0,0,0,0,2],
		[0,0,2,2,2],
	],
	[
		[1,1,1,1,1],
		[1,1,0,0,2],
		[0,0,0,0,2],
		[0,0,0,2,1],
		[0,0,2,1,1],
	],
	[
		[1,1,1,1,1],
		[1,1,1,1,1],
		[1,1,1,1,1],
		[1,1,1,1,1],
		[1,1,1,1,1],
	],
]*/

var z = 0;
while (z++ < chunk/4){
	var y = 0, row = [];
	while (y++ < chunk){
		var x = 0, column = [];
		while (x++ < chunk)
			column.push(z==4?1:0);
		row.push(column);
	}
	world.push(row);
}

var hill = function(x, y, z){
	world[z][y][x] = 2;
	z++;
	if (world[z]){
		if (x < chunk-1) hill(x+1, y, z);
		if (x > 0) hill(x-1, y, z);
		if (y < chunk-1) hill(x, y+1, z);
		if (y > 0) hill(x, y-1, z);
	}
	while (z < chunk/4-1)
		world[z++][y][x] = 1;
}

var i;
for (i = 0; i < 50; i++){
	var x = utils.roll(chunk);
	var y = utils.roll(chunk);
	var z = utils.roll(chunk/4);
	hill(x, y, z);
}

var blocks = function(x, y, z){
	var level = world[Math.floor(z / tile)];
	if (!level) return null;
	if (x%16 || y%16){
		var x1 = Math.floor(x / tile),
		 	x2 = Math.ceil( x / tile),
		 	y1 = Math.floor(y / tile),
		 	y2 = Math.ceil( y / tile);
		return level[y1][x1]|level[y1][x2]|level[y2][x1]|level[y2][x2];
	} else return level[y/16][x/16];
}

var single = function(x, y, z){
	var z = Math.floor(z / tile);
	var level = world[z];
	if (!level) return null;
	var x = Math.round(x/tile);
	var y = Math.round(y/tile);
	return {x:x, y:y, z:z}
}

var Pleb = function(x, y, z){
	this.x = x; this.y = y; this.z = z; this.speed = 1;
}
Pleb.prototype.draw = function(ctx){
	var o = 2*this.z / tile;
	if (o > tile/2) o = tile/2;
	ctx.fillStyle = '#00f';
	ctx.fillRect(this.x+o, this.y+o, tile-o*2, tile-o*2);
};
Pleb.prototype.move = function(dx, dy){
	var target = blocks(this.x+dx, this.y+dy, this.z-1);
	if (!target&1){
		this.x += dx;
		this.y += dy;
	}
	if (keys.dig && target){
		var o = (tile)/this.speed;
		var block = single(this.x+dx*o, this.y+dy*o, this.z-1);
		console.log(block.x, block.y, block.z);
		if (block) world[block.z][block.y][block.x] = 0;
	} else if (target&2) this.z -= 4;
};
Pleb.prototype.update = function(){
	if (!blocks(this.x, this.y, this.z)) this.z+=2;
	if (keys.left)  this.move(-this.speed, 0)
	if (keys.right) this.move( this.speed, 0)
	if (keys.up)   this.move(0, -this.speed)
	if (keys.down) this.move(0,  this.speed)
};

var keys = {}, codes = {37:'left', 38:'up', 39:'right', 40:'down', 17:'dig'}
var tile = 16;
var init = function(){
	things.push(new Pleb(tile*utils.roll(chunk), tile*utils.roll(chunk), 0));
}

var main = function(ctx){
	things.forEach(function(o){o.update()});
}

var draw = function(ctx){
	ctx.clearRect(-ctx.canvas.width/2, -ctx.canvas.height/2,
		ctx.canvas.width, ctx.canvas.height);
	var x = -1, block;
	while (++x < world[0][0].length){
		var y = -1;
		while (++y < world[0].length){
			var z = -1;
			while (++z < world.length){
				block = world[z][y][x];
//				if (block) break;
//			}
//			if (block){
				var s = (z)*2;
				switch(block){
					case 1:
						ctx.fillStyle = '#330';
						ctx.fillRect(x*tile+s, y*tile+s, tile-s*2, tile-s*2);
						break;
					case 2:
						var o=tile/2;
						ctx.fillStyle = '#0f0';
						ctx.beginPath();
						ctx.arc(x*tile+o, y*tile+o, tile/2-s, 0, Math.PI*2);
						ctx.closePath();
						ctx.fill();
						break;
				}
			}
		}
	}
	things.forEach(function(o){o.draw(ctx)});
};

window.onload = function(){
	var cvs = document.getElementById('canvas');
	var ctx = cvs.getContext('2d');
	(window.onresize = function(){
		cvs.width  = window.innerWidth;
		cvs.height = window.innerHeight;
		ctx.translate(cvs.width/2, cvs.height/2);
		draw(ctx);
	})();
	window.onkeydown = window.onkeyup = function(e){
		//console.log(e.keyCode);
		keys[codes[e.keyCode]] = e.type == 'keydown';
	}
	init();
	window.setInterval(function(){
		main(); draw(ctx);
	}, 33);
}
