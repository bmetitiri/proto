CONNECTION_ID  = '1' + '.';
OBJECT_COUNT   = 1;
ROTATION_SPEED = .005;
THRUSTER_SPEED = .1;
BULLET_SPEED   = 10;
world          = {}

game = {
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
		// Thrusters
		this.port      = data.port || false;
		this.starboard = data.starboard || false;
		this.aft       = data.aft || false;

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
		this.fire = function(){
			var shot = new game.bullet(CONNECTION_ID + OBJECT_COUNT++,
				{x:this.x, y:this.y, deltax:this.deltax, deltay:this.deltay, r:this.r});
			world[shot.id] = shot
		}
		this.update = function(){
			if (this.port) this.deltar += ROTATION_SPEED;
			if (this.starboard) this.deltar -= ROTATION_SPEED;
			this.r += this.deltar;
			if (this.aft){
				this.deltax += Math.cos(this.r) * THRUSTER_SPEED;
				this.deltay += Math.sin(this.r) * THRUSTER_SPEED;
			}
			this.x += this.deltax;
			this.y += this.deltay;

			/* Wraparound
			if (this.x > cvs.width) this.x = 0;
			if (this.x < 0) this.x = cvs.width;
			if (this.y > cvs.height) this.y = 0;
			if (this.y < 0) this.y = cvs.height; */

			if (this.x > cvs.width) this.deltax = -this.deltax;
			if (this.x < 0) this.deltax = -this.deltax;
			if (this.y > cvs.height) this.deltay = -this.deltay;
			if (this.y < 0) this.deltay = -this.deltay;
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
}
function receive(data){
	console.log(data);
	var data = JSON.parse(data);
	for (k in data){
		if (k in world)
			for (v in data[k]) world[k][v] = data[k][v];
		else if (data[k]['type'])
			world[k] = new game[data[k]['type']](k, data[k]);
	}
}
function send(id, data){
	var env = {}; env[id] = data;
	receive(JSON.stringify(env));
//	receive(data);
}
window.onload = function(){
	cvs = document.getElementById('canvas');
	cvs.width  = window.innerWidth;
	cvs.height = window.innerHeight;
	ctx = cvs.getContext('2d');

	PLAYER_ID = CONNECTION_ID+OBJECT_COUNT++;
	send(PLAYER_ID, {type:'ship'});
	window.onkeyup = window.onkeydown = function(e){
		keys   = {65:'starboard', 68:'port', 87:'aft'}
		action = keys[e.keyCode];
		if (action){
			state = e.type == 'keydown';
			if (world[PLAYER_ID][action] != state){
				env = {}; env[action] = state;
				send(PLAYER_ID, env);
			}
		}
		//if (e.type == 'keydown') alert(e.keyCode);
		/*switch(e.keyCode){
			case 65: // a
				state = e.type == 'keydown'
				if (player.starboard != state)
				send(player.id, {starboard:state});
				break;
			case 68: // d
				send(player.id, {port:e.type == 'keydown'});
				break;
			case 87: // w
				send(player.id, {aft:e.type == 'keydown'});
				break;
			case 16: // shift
				if (e.type == 'keydown') player.fire();
				break;
			/* Alternate controls
			case 37: // left
			case 39: // right
			case 38: // up
			case 17: // control */
		//}
	}
	init();
}
