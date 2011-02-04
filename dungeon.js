KEYS = {65:'left', 68:'right', 87:'up', 83: 'down', 16:'attack'}

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
	player : function(id, data){
		this.type      = 'player';
		this.collide   = [];
		this.speed     = 10;
		this.left      = data.left   || false;
		this.right     = data.right  || false;
		this.up        = data.up     || false;
		this.attack    = data.attack || false;

		this.id = id;
		//Start position
		this.x = data.x || 100;
		this.y = data.y || 100; 
		this.draw = function(){
			ctx.save();
			ctx.translate(this.x, this.y);
//			ctx.rotate(this.r);
			var color = (this.collide.length)?'#f00':'#000';
			shape(color, 10, 0, -10, 8, 0, 0, -10, -8);
			ctx.restore();
		}
		this.update = function(){
			speed = this.speed;
			if ((this.left||this.right)&&(this.up||this.down))
				speed = .7 * speed;
			if (this.left) this.x -= speed;
			if (this.right) this.x += speed;
			if (this.up) this.y -= speed;
			if (this.down) this.y += speed;
		}
		this.bounds = function(){
			return {left:this.x-5, top:this.y-5,
				right:this.x+5, bottom:this.y+5}
		}
	},

	monster : function(id, data){
		this.x = data.x; 
		this.y = data.y; 
		this.collide   = [];
		this.draw = function(){
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.fillRect(-5, -5, 5, 5);
			ctx.restore();
		},
		this.bounds = function(){
			return {left:this.x-5, top:this.y-5,
				right:this.x+5, bottom:this.y+5}
		}
		this.update = function(){
			this.x -= (this.x-world['^'].x)/10
			this.y -= (this.y-world['^'].y)/10
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
		if (world[o].update) world[o].update();
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
	cvs.width  = document.width;
	cvs.height = document.height;
	ctx = cvs.getContext('2d');

	send('^', {type:'player'});
	l = {}
	for (var x = 0; x < 10; x++)
	for (var y = 0; y < 10; y++)
		l['tile-'+x+'-'+y] = {type:'monster', x:x*10, y:y*10};
	receive(l);
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
