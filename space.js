OBJECT_COUNT   = 1;
ROTATION_SPEED = .005;
THRUSTER_SPEED = .1;
THRUSTER_COLOR = '#fa3';
BULLET_SPEED   = 10;

KEYS = {65:'starboard', 68:'port', 87:'aft', 16:'fire',
		37:'starboard', 39:'port', 38:'aft', 17:'fire'}

world = {}

function shape(){
	ctx.beginPath();
	ctx.fillStyle = arguments[0];
	ctx.moveTo(arguments[1], arguments[2]);
	for (var i = 3; i < arguments.length; i+=2)
		ctx.lineTo(arguments[i], arguments[i+1]);
	ctx.fill();
}
exports = {
	bullet : function(id, data){
		this.collide = [];
		this.id = id; this.x = data.x; this.y = data.y; this.r = data.r;
		this.deltax = data.deltax; this.deltay = data.deltay;
		this.deltax += Math.cos(this.r) * BULLET_SPEED;
		this.deltay += Math.sin(this.r) * BULLET_SPEED;
		this.draw = function(){
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.r);
			/* Blaster graphic
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
		this.bounds = function(){
			return {left:this.x-2, top:this.y-2,
				right:this.x+2, bottom:this.y+2}
		}
	},
	ship : function(id, data){
		this.type      = 'ship';
		this.collide   = [];
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
			var color = (this.collide.length)?'#f00':'#000';
			shape(color, 10, 0, -10, 8, 0, 0, -10, -8);
			if (this.starboard) shape(THRUSTER_COLOR, 8, 2, 5, 7, 11, 7);
			if (this.port)      shape(THRUSTER_COLOR, 8, -2, 5, -7, 11, -7);
			if (this.aft)       shape(THRUSTER_COLOR, -4, 0, -8, -4, -8, 4);
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
		this.bounds = function(){
			return {left:this.x-5, top:this.y-5,
				right:this.x+5, bottom:this.y+5}
		}
	}
}
function main(){
	ctx.clearRect(0, 0, cvs.width, cvs.height);
	for (var o in world){
		world[o].collide = [];
		for (var oo in world) //TODO: O(n2) => O(nlogn)
			if (o != oo){
				var r1 = world[o].bounds()
				var r2 = world[oo].bounds()
				if (r1.top < r2.bottom && r2.top < r1.bottom &&
						r1.left < r2.right && r2.left < r1.right)
					world[o].collide.push(world[oo]);
			}
		world[o].update();
		if (world[o]) world[o].draw();
	}
}
function receive(data){
	for (var k in data){
		if (k in world){
			if (data[k] == 'delete') delete world[k];
			else for (var v in data[k]) world[k][v] = data[k][v];
		} else if (data[k]['type']){
			world[k] = new exports[data[k]['type']](k, data[k]);
		}
	}
}
function send(id, data){
	socket.send(data);
	var env = {}; env[id] = data;
	receive(env);
}
window.onload = function(){
	socket = new io.Socket(null, {port: 8080});
	socket.on('message', function(data){
		receive(data);
	});
	socket.connect();

	cvs = document.getElementById('canvas');
	cvs.width  = 400;
	cvs.height = 400;
	ctx = cvs.getContext('2d');

	send('^', {type:'ship'});
	window.onkeyup = window.onkeydown = function(e){
		action = {}
		action = KEYS[e.keyCode];
		if (action){
			state = e.type == 'keydown';
			if (world['^'][action] != state){
				env = {}; env[action] = state;
				send('^', env);
			}
		}
	}
	setInterval(main, 33);
	setInterval(function(){
		send('^', world['^']);
	}, 1000);
}
