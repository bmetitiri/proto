var keys = {65:'left', 68:'right', 87:'up',
	83:'down', 32:'attack', 16:'run', 66:'bomb'}

var sys_keys = {13:'chat'}

var cvs = null, gid = 0;
var list = [], types = {}, players = [], messages = [];
var attrs = {}, utils = {};
var collisions = {}, box_size = 100; //collision engine

if (typeof(exports)=='undefined') exports = {}
exports.world = {};

utils.roll = function(dice){
	return Math.round(Math.random()*dice)
}

utils.repel = function(self, obj){
	var b = self.bounds();
	var ox = obj.x; obj.x = obj.x1;
	var oy = obj.y; obj.y = obj.y1;
	var obj_b = obj.bounds();
	if (obj_b.right>b.left && obj_b.left<b.right) obj.x = ox; 
	else if (obj_b.bottom>b.top && obj_b.top<b.bottom) obj.y = oy;
	else {obj.x = ox; obj.y = oy;}
}

attrs.damage = function(self){
	for (var a in self.collisions.arrow){
		a = self.collisions.arrow[a];
		a.delete();
		self.health--;
	}
	for (var b in self.collisions.boom)
		self.health-=2;
	if (self.health < 1){
		env = {}; env[self.id]='delete'; exports.receive(env);
		/*if (exports.broadcast){
			env = {}; env[self.id]='delete';
			exports.broadcast(env);
		}*/
	}
}

attrs.solid = function(self){
	for (var h in self.collisions.hero)
		utils.repel(self, self.collisions.hero[h]);
	for (var m in self.collisions.mob)
		utils.repel(self, self.collisions.mob[m]);
}

types.arrow = function(data){
	this.x  = data.x;
	this.y  = data.y;
	this.t  = 50;
	this.dx = (data.r&1&&-1)+(data.r&2&&1);
	this.dy = (data.r&4&&-1)+(data.r&8&&1);
	this.speed = (this.dx&&this.dy)?14:20;
	this.bounds = function(){
		return {left:this.x-4, top:this.y-4,
			right:this.x+4, bottom:this.y+4}
	}
	this.draw   = function(){
		ctx.fillRect(this.x-4, this.y-4, 8, 8);
	}
	this.delete = function(){
		env = {}; env[this.id]='delete'; exports.receive(env);
		/*if (exports.broadcast){
			env = {}; env[this.id]='delete';
			exports.broadcast(env);
		}*/
	}
	this.update = function(){
		if (this.t-- < 0) this.delete();
		this.x += this.dx * this.speed;
		this.y += this.dy * this.speed;
	}
}

types.bomb = function(data){
	this.x = data.x;
	this.y = data.y;
	this.z = -1;
	this.t = 100;
	this.bounds = function(){
		return {left:this.x-6, top:this.y-6,
			right:this.x+6, bottom:this.y+6}
	}
	this.draw   = function(){
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = 'rgba(127,0,0,'+this.t/30+')';
		ctx.arc(this.x, this.y, 12, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
	this.delete = function(){
		env = {}; env[this.id]='delete'; exports.receive(env);
	}
	this.update = function(){
		if (this.t-- < 0 || this.collisions.boom){
			this.delete();
			if (exports.broadcast){
				var e = {}; e['e'+gid++] = {type:'boom', x:this.x, y:this.y}
				exports.broadcast(e);
			}
		}
	}
}

types.boom = function(data){
	this.x = data.x;
	this.y = data.y;
	this.t = 1;
	this.z = 20;
	this.bounds = function(){
		return {left:this.x-66, top:this.y-66,
			right:this.x+66, bottom:this.y+66}
	}
	this.draw   = function(){
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = 'rgba(255,0,0,.5)';
		ctx.arc(this.x, this.y, 100, 0, Math.PI*2, true);
		ctx.fillStyle = 'rgba(255,0,0,.5)';
		ctx.fillRect(this.x-66, this.y-66, 132, 132)
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
	this.update = function(){
		if (this.t-- < 0){
			env = {}; env[this.id]='delete'; exports.receive(env);
		}
	}
}

types.hero = function(data){
	this.speed  = 5;
	this.chat   = data.chat || false;
	this.color  = data.color; 	
	this.health = 40;
	this.r = data.r || 8;
	this.x = data.x || 0; this.x1 = data.x1 || this.x;
	this.y = data.y || 0; this.y1 = data.y1 || this.y;
	this.draw = function(){
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.fillStyle = this.color;
		ctx.fillRect(-10, -10, 20, 20);
		ctx.fillStyle = '#fff';
		ctx.fillRect(-10, -10, this.health/2, 4);
		ctx.restore();
	}
	this.update = function(){
		speed = this.speed;
		if (this.run) speed *= 2;

		if ((this.left||this.right)&&(this.up||this.down))
			speed = .7 * speed;
		this.x1 = this.x; this.y1 = this.y;
		if (this.left)  this.x -= speed;
		if (this.right) this.x += speed;
		if (this.up)    this.y -= speed;
		if (this.down)  this.y += speed;

		var dir = (this.left&&1)|(this.right&&2)|
			(this.up&&4)|(this.down&&8);
		if (dir) this.r = dir;
		if (this.attack){
			if (exports.broadcast){
				var a = {}; a['a'+gid++] = {type:'arrow',
					x:this.x, y:this.y, r:this.r}
				exports.broadcast(a);
			}
			this.attack = false;
		}
		if (this.bomb){
			if (exports.broadcast){
				var b = {}; b['b'+gid++] = {type:'bomb', x:this.x, y:this.y}
				exports.broadcast(b);
			}
			this.bomb = false;
		}
		for (var m in this.collisions.mob) this.health--;
		for (var m in this.collisions.boom) this.health-=5;
		if (this.health < 1) this.health = 1;
	}
	this.bounds = function(){
		return {left:this.x-10, top:this.y-10,
			right:this.x+10, bottom:this.y+10}
	}
}

types.mob = function(data){
	this.x = data.x || 0; this.x1 = data.x1 || this.x;
	this.y = data.y || 0; this.y1 = data.y1 || this.y;
	this.speed  = 5;
	this.health = 2;

	this.draw = function(){
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = 'rgba(0,0,0,'+this.health/2+')';
		ctx.arc(this.x, this.y, 10, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
	this.bounds = function(){
		return {left:this.x-8, top:this.y-8,
			right:this.x+8, bottom:this.y+8}
	}
	this.toward = function(target, reverse){
		reverse = (reverse)?-1:1;
		speed = this.speed;
		var dx=0, dy=0;
		if (target.x > this.x + speed/2) dx+=1;
		if (target.x < this.x - speed/2) dx-=1;
		if (target.y > this.y + speed/2) dy+=1;
		if (target.y < this.y - speed/2) dy-=1;
		if (dx&&dy) speed = .7 * speed;
		this.x1 = this.x; this.x += dx*speed*reverse;
		this.y1 = this.y; this.y += dy*speed*reverse;
	}
	this.update = function(){
		attrs.damage(this);
		if (this.collisions.mob){
			for (var m in this.collisions.mob)
				this.toward(this.collisions.mob[m], true);
		} else {
			var nearest = null, distance = Infinity;
			for (var p in players){
				p = players[p];
				var d = Math.sqrt(Math.pow(this.x-p.x, 2) +
						Math.pow(this.y-p.y, 2));
				if (d<distance){
					nearest  = p;
					distance = d;
				}
			}
			if (distance<1000) this.toward(nearest);
			else if (exports.broadcast){
				env = {}; env[this.id]='delete';
				exports.broadcast(env);
			}
		}
	}
}

types.spawn = function(data){
	this.x = data.x;
	this.y = data.y;
	this.z      = 5;
	this.health = 10;
	this.bounds = function(){
		return {left:this.x-10, top:this.y-10,
			right:this.x+10, bottom:this.y+10}
	}
	this.draw   = function(){
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(Math.PI/4);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(-4, -10, 8, 20);
		ctx.fillRect(-10, -4, 20, 8);
		ctx.restore();
	}
	this.update = function(){
		attrs.damage(this);
		attrs.solid(this);
		var nearest = null, distance = Infinity;
		for (var p in players){
			p = players[p];
			var d = Math.sqrt(Math.pow(this.x-p.x, 2) +
					Math.pow(this.y-p.y, 2));
			if (d<distance) distance = d;
		}
		if (distance<200)
			if (exports.broadcast && Math.random() > .95){
				var mobs = {}; mobs['m'+gid++] = {type:'mob',
					x:this.x+(utils.roll(2)-1)*20,
					y:this.y+(utils.roll(2)-1)*20}
				exports.broadcast(mobs);
			}
	}
}

types.wall = function(data){
	this.z    = -10;
	this.x = data.x;
	this.y = data.y;
	this.width  = data.width||40;
	this.height = data.height||40;
	this.health = 10;
	this.bounds = function(){
		return {left:this.x, top:this.y,
			right:this.x+this.width, bottom:this.y+this.height}
	}
	this.draw   = function(){
		ctx.save();
		ctx.fillStyle = 'rgba(0,0,0,'+this.health/10+')';
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.restore();
	}
	this.update = function(){
		attrs.damage(this);
		attrs.solid(this);
	}
}

types.zone = function(data){
	this.x     = data.x;
	this.y     = data.y;
	this.z     = 10;
	this.color = data.color;
	this.draw = function(){
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.fillStyle = (this.collisions.hero)?
			'rgba('+this.color+',.2)':'rgb('+this.color+')';
		ctx.fillRect(-200, -200, 400, 400);
		ctx.restore();
	}
	this.bounds = function(){
		return {left:this.x-300, top:this.y-300,
			right:this.x+300, bottom:this.y+300}
	}
	this.update = function(){}
}

exports.init = function(){
	if (exports.broadcast){
		/* Spawn generation */
		var spawns = {};
		for (var s = 0; s < 10; s++){
			spawns['s'+gid++] = {type:'spawn',
				x:(utils.roll(20)-10)*75,
				y:(utils.roll(20)-10)*75}
		}
		exports.broadcast(spawns);

		/* Walls generation */
		var walls = {}, wall_n = 12;
		for (var y = -wall_n; y <= wall_n; y++)
			for(var x = -wall_n; x <= wall_n; x++)
				if (x || y){
					walls['w'+gid++] = {type:'wall',
						x:x*80-20, y:y*80-20}
					r = Math.random();
					if (r > .8 && x<wall_n)
						walls['w'+gid++] = {type:'wall',
							x:x*80+20,y:y*80-20}
					else if (r < .2 && y<wall_n)
						walls['w'+gid++] = {type:'wall',
							x:x*80-20,y:y*80+20}
				}
		exports.broadcast(walls);

		/* Zones generation */
		var zones = {}, zone_n=2;
		for (var x = -zone_n; x <= zone_n; x++)
			for (var y = -zone_n; y <= zone_n; y++)
				if (x||y)
					zones['z'+gid++] = {type:'zone', x:x*410, y:y*410,
						color:((x+y)%2)?'0,0,0':'255,0,0'};
		exports.broadcast(zones);
	}
	setInterval(exports.main, 33);
}

exports.main = function (){
	if (cvs) ctx.clearRect(0, 0, cvs.width, cvs.height);
	collisions = {};
	for (var o in list){ //TODO: Remove overlapping duplicates
		var o = list[o];
		var b = o.bounds();
		for (var x = Math.floor(b.left/box_size);
				x <= Math.floor(b.right/box_size); x++)
			for (var y = Math.floor(b.top/box_size);
					y <= Math.floor(b.bottom/box_size); y++){
				var k = ''+x+','+y;
				if (collisions[k]) collisions[k].push(o);
				else collisions[k] = [o];
			}
	}
	for (var l in collisions){
		l = collisions[l];
		if (l.length < 2) continue;
		for (var i = 0; i<l.length; i++){
			var o = l[i];
			var r1 = o.bounds()
			for (var ii = i+1; ii < l.length; ii++){
				var oo = l[ii];
				var r2 = oo.bounds()
				if (r1.top < r2.bottom && r2.top < r1.bottom &&
						r1.left < r2.right && r2.left < r1.right){
					if (!o.collisions[oo.type])
						o.collisions[oo.type] = {};
					o.collisions[oo.type][oo.id] = oo;
					if (!oo.collisions[o.type])
						oo.collisions[o.type] = {};
					oo.collisions[o.type][o.id] = o;
				}
			}
		}
	}
	if (cvs){
		ctx.save();
		ctx.translate(cvs.width/2-player.x, cvs.height/2-player.y);
		debug.innerHTML = 'x: '+ player.x+' y: '+ player.y + ' zones: ';
		for (var z in player.collisions.zone)
			debug.innerHTML += player.collisions.zone[z].id + ', ';
		debug.innerHTML += '<br />';
		if (messages.length > 5) messages.splice(5,1);
		for (m in messages)
			debug.innerHTML += '<font color="'+messages[m].color+'">'+messages[m].message + '</font><br />';
	}
	for (var i in list){
		var o = list[i];
		o.update();
		if (cvs) o.draw();
		o.collisions = {};
	}
	if (cvs) ctx.restore();
}

exports.receive = function(data){ //TODO: Queue and add in main loop
	for (var k in data){
		if (data[k].message){
			messages.unshift(data[k]);
			continue;
		}
		if (k in exports.world){
			if (data[k] == 'delete'){
				var d = exports.world[k];
				for (var i in list)
					if (list[i].id == k){
					   	list.splice(i, 1);
						break;
					}
				if (d.type == 'hero')
					for (var i in players) //TODO: abstract with above
						if (players[i].id == k){
							players.splice(i, 1);
							break;
						}
				delete exports.world[k];
			}
			else for (var v in data[k])
				exports.world[k][v] = data[k][v];
		} else if (data[k]['type']){
			var t = data[k]['type'];
			var n = new types[t](data[k]);
			n.id = k; n.type = t; n.collisions = {};
			exports.world[k] = n;
			if (n.type == 'hero') players.push(n)
			list.push(n);
			list.sort(function(a,b){return (a.z||0)-(b.z||0)});
		}
	}
}

function draw(){
	ctx.save();
	ctx.translate(cvs.width/2-player.x, cvs.height/2-player.y);
	for (var o in exports.world){
	var o = exports.world[o];
		o.draw();
	}
	ctx.restore();
}

function send(id, data){
	socket.send(data);
	var env = {}; env[id] = data;
	exports.receive(env);
}

if (typeof(window)!='undefined')
	window.onload = function(){
		socket = new io.Socket(null, {port: 8080});
		socket.on('message', function(data){
			exports.receive(data);
		});
		socket.connect();
		
		debug = document.getElementById('debug')
		chatbox = document.getElementById('chatbox')

		cvs = document.getElementById('canvas');
		ctx = cvs.getContext('2d');
		send('@', {type:'hero',color:Math.floor(Math.random()*16777215).toString(16)});
		player = exports.world['@'];

		window.onresize = function(){
			cvs.width  = window.innerWidth;
			cvs.height = window.innerHeight;
			draw();
		}
		window.onresize();

		messageBuffer = '';
		window.onkeyup = window.onkeydown = function(e){

			var action = {}
			var sys_action = {}
			action = keys[e.keyCode];
			sys_action = sys_keys[e.keyCode];
			
			if(player['chat'] == false){
				if (action){
					state = e.type == 'keydown';
					if (player[action] != state){
						env = {x:player.x, y:player.y}; env[action] = state;
						send('@', env);
					}
				}
			}
			if(sys_action && e.type =='keyup'){
				message = {message:chatbox.value, color:player.color}
				env[sys_action] = player[sys_action] == true?false:true;
				send('@', env);
				send('!', message);
				chatbox.style.visibility = player[sys_action] == true?'visible':'hidden';
				if (chatbox.style.visibility == 'visible') chatbox.focus();
				chatbox.value = '';
			}
		}
		exports.init();
	}
