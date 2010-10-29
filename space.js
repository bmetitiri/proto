CONNECTION_ID  = '+';
OBJECT_COUNT   = 1;
ROTATION_SPEED = .005;
THRUSTER_SPEED = .1;
BULLET_SPEED   = 10;
world          = {}

exports = {
	bullet : function(id, data){//id, x, y, deltax, deltay, r
		this.id = id; this.x = data.x; this.y = data.y; this.r = data.r;
		this.deltax = data.deltax; this.deltay = data.deltay;
		this.deltax += Math.cos(this.r) * BULLET_SPEED;
		this.deltay += Math.sin(this.r) * BULLET_SPEED;
		this.draw = function(){
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.r);
			/* Blaster
			ctx.fillStyle = '#3af'
			ctx.fillRect(0, -1, 5, -2);
			ctx.fillRect(0, 1, 5, 2); */
			ctx.fillRect(-2, -2, 2, 2);
			ctx.restore();
		}
		this.update = function(){
			this.x += this.deltax;
			this.y += this.deltay;
			if (this.x > cvs.width || this.x < 0
					|| this.y > cvs.height || this.y < 0){
				delete world[id]
			}
		}
	},

	ship : function(id, data){//id, x, y
		this.type      = 'ship';
		// Thrusters
		this.port      = data.port      || false;
		this.starboard = data.starboard || false;
		this.aft       = data.aft       || false;
		this.fire      = data.fire      || false;

		this.id = id;
		this.x = data.x || 100; this.deltax = data.deltax || 0;
		this.y = data.y || 100; this.deltay = data.deltay || 0;
		this.r = data.r || 0;   this.deltar = data.deltar || 0;
		this.draw = function(){
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.r);
			ctx.beginPath();
			ctx.fillStyle = '#000'
			ctx.moveTo(10, 0);
			ctx.lineTo(-10, 8);
			ctx.lineTo(0, 0);
			ctx.lineTo(-10, -8);
			ctx.fill();
			if (this.starboard){
				ctx.beginPath();
				ctx.fillStyle = '#fa3'
				ctx.moveTo(8, 2);
				ctx.lineTo(5, 7);
				ctx.lineTo(11, 7);
				ctx.fill();
			}
			if (this.port){
				ctx.beginPath();
				ctx.fillStyle = '#fa3'
				ctx.moveTo(8, -2);
				ctx.lineTo(5, -7);
				ctx.lineTo(11, -7);
				ctx.fill();
			}
			if (this.aft){
				ctx.beginPath();
				ctx.fillStyle = '#fa3'
				ctx.moveTo(-4, 0);
				ctx.lineTo(-8, -4);
				ctx.lineTo(-8, 4);
				ctx.fill();
			}
			ctx.restore();
		}
		this.update = function(){
			if (this.port) this.deltar += ROTATION_SPEED;
			if (this.starboard) this.deltar -= ROTATION_SPEED;
			this.r += this.deltar;
			if (this.aft){
				this.deltax += Math.cos(this.r) * THRUSTER_SPEED;
				this.deltay += Math.sin(this.r) * THRUSTER_SPEED;
			}
			if (this.fire){
/*				if (PLAYER_ID = this.id)
					send(CONNECTION_ID + OBJECT_COUNT++,
						{x:this.x, y:this.y, deltax:this.deltax,
						deltay:this.deltay, r:this.r, type:'bullet'});*/
				shot = new exports.bullet('0.'+OBJECT_COUNT++,
						{x:this.x, y:this.y, deltax:this.deltax,
						deltay:this.deltay, r:this.r});
				world[shot.id] = shot;
				this.fire = false;
			}
			this.x += this.deltax;
			this.y += this.deltay;

			/* Wraparound
			if (this.x > cvs.width) this.x = 0;
			if (this.x < 0) this.x = cvs.width;
			if (this.y > cvs.height) this.y = 0;
			if (this.y < 0) this.y = cvs.height; */

			if (this.x > cvs.width || this.x < 0)  this.deltax = -this.deltax;
			if (this.y > cvs.height || this.y < 0) this.deltay = -this.deltay;
		}
	}
}
function main(){
	ctx.clearRect(0, 0, cvs.width, cvs.height);
	for (var o in world){
		world[o].update();
		if (world[o]) world[o].draw();
	}
}
function init(){
	setInterval(main, 33);
	setInterval(function(){
		id = CONNECTION_ID+'wad+shift';
		send(id, world[id]);
	}, 1000);
}
function receive(data){
//	var data = JSON.parse(data);
	for (var k in data){
		if (k in world){
			if (data[k] == 'delete') delete world[k];
			else for (var v in data[k]) world[k][v] = data[k][v];
		} else if (data[k]['type'])
			world[k] = new exports[data[k]['type']](k, data[k]);
	}
}
function send(id, data){
	var env = {}; env[id] = data;
	socket.send(data);
	receive(env);
//	receive(JSON.stringify(env));
}
keys = {'wad+shift':{65:'starboard', 68:'port', 87:'aft', 16:'fire'},
		'arrows+ctrl':{37:'starboard', 39:'port', 38:'aft', 17:'fire'}}

window.onload = function(){
	socket = new io.Socket(null, {port: 8080});
	socket.on('message', function(data){
		receive(data);
		console.log(data);
	});
	socket.connect();

	cvs = document.getElementById('canvas');
	cvs.width  = 400;
	cvs.height = 400;
	cvs.style.cssText = 'border:1px solid #000';
//	cvs.width  = window.innerWidth;
//	cvs.height = window.innerHeight;
	ctx = cvs.getContext('2d');

//	for (var type in keys){
	type = 'wad+shift';
		send(CONNECTION_ID+type, {type:'ship'});
//	}
	window.onkeyup = window.onkeydown = function(e){
		action = {}
//		for (var type in keys){
		type = 'wad+shift';
			action = keys[type][e.keyCode];
			if (action){
				state = e.type == 'keydown';
				if (world[CONNECTION_ID+type][action] != state){
					env = {}; env[action] = state;
					send(CONNECTION_ID+type, env);
				}
			}
//		}
	}
	init();
}
