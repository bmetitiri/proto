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
		this.type       = 'player';
		this.id         = id;
		this.collisions = [];
		this.speed      = 5;
		this.left       = data.left   || false;
		this.right      = data.right  || false;
		this.up         = data.up     || false;
		this.attack     = data.attack || false;

		//Start position
		this.x = data.x || 100;
		this.y = data.y || 100; 
		this.draw = function(){
			ctx.save();
			ctx.translate(this.x, this.y);
			var color = (this.collisions.length)?'#f00':'#000';
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
		this.type       = 'monster';
		this.id         = id;
		this.x          = data.x; 
		this.y          = data.y; 
		this.collisions = [];
		this.speed      = 2;
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
			if (this.collisions.length == 0){
				speed = this.speed;
				if ((this.x < world['player'].x||this.x >
					world['player'].x)&&(this.y <
					world['player']||this.y>world['player'].y)){
					speed = .7 * speed;	
				}
				if (this.x < world['player'].x){
					this.x += speed;
				}
				if (this.x > world['player'].x){
					this.x -= speed;
				}
				if (this.y < world['player'].y){
					this.y += speed;
				}
				if (this.y > world['player'].y){
					this.y -= speed;
				}
			}
			else{
				speed = 0;
				this.collisions = [];
			}
		}
	}

}

function collision_detection(obj){
	var r1 = world[obj].bounds()
	for (var oobj in world){
		if (obj != oobj){
			var r2 = world[oobj].bounds()
			if (r1.top < r2.bottom && r2.top < r1.bottom && 
				r1.left < r2.right && r2.left < r1.right) {
					world[obj].collisions.push(world[oobj].id);
			}
		}
	}
}

function update_world(){
	ctx.clearRect(0, 0, cvs.width, cvs.height);
	for (var obj in world){
		collision_detection(obj);
		if (world[obj].update) world[obj].update();
		if (world[obj].draw) world[obj].draw();
	}
}

function draw_grid(){
	for (x = 0; x < SCREEN_WIDTH; x+=32){
		ctx.moveTo(x,0);
		ctx.lineTo(x, SCREEN_HEIGHT);
	}
	for (y = 0; y < SCREEN_HEIGHT; y+=32){
		ctx.moveTo(0,y);
		ctx.lineTo(SCREEN_WIDTH, y);
	}

	ctx.strokeStyle = "#eee";
	ctx.stroke();

}

function main(){
	update_world();
	draw_grid();
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

function touchMove(e){
	e.preventDefault();
	//var touch = e.touches[0];
	//ctx.save();
	//ctx.translate(touch.pageX, touch.pageY);
	//ctx.fillRect(-45, -45, 45, 45);
	//ctx.restore();
}

function touchStart(e){
	e.preventDefault();
	var touch = e.touches[0];
	action = {};
	if (touch.pageX > SCREEN_WIDTH/2){
		action = 'right';
	}
	if (touch.pageX < SCREEN_WIDTH/2){
		action = 'left';
	}
	if (action){
		state = e.type == 'touchstart';
		if (world['player'][action] != state){
			env = {}; env[action] = state;
			send('player', env);
		}
	}
}

window.onload = function(){
	TOUCHSTART = 'ontouchstart' in document.documentElement;

	socket = new io.Socket(null, {port: 8080});
	socket.on('message', function(data){
		receive(data);
	});
	socket.connect();

	SCREEN_WIDTH  = document.body.clientWidth;
	SCREEN_HEIGHT = document.body.clientHeight;

	cvs = document.getElementById('canvas');
	cvs.width  = SCREEN_WIDTH; 	
	cvs.height = SCREEN_HEIGHT;
	ctx = cvs.getContext('2d');

	send('player', {type:'player'});
	enemies = {}
	for (var i = 0; i < 5; i++)
		enemies['monster-'+i] = {type:'monster',
		x:Math.floor(Math.random()*SCREEN_WIDTH), y:Math.floor(Math.random()*SCREEN_HEIGHT)};
	receive(enemies);
	if (TOUCHSTART == false){
		window.onkeyup = window.onkeydown = function(e){
			action = {}
			action = KEYS[e.keyCode];
			if (action){
				state = e.type == 'keydown';
				if (world['player'][action] != state){
					env = {}; env[action] = state;
					send('player', env);
				}
			}
		}
	}
	else {
		canvas.addEventListener('touchmove', touchMove, false);	
		canvas.addEventListener('touchstart', touchStart, false);	
	}
	setInterval(main, 33);
	setInterval(function(){
		send('player', world['player']);
	}, 1000);
}
