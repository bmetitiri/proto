var keys = {32:'attack', 16:'run', 66:'bomb',
	65:'left', 68:'right', 87:'up', 83:'down',
	72:'left', 76:'right', 75:'up', 74:'down'} /* hlkj */

var cvs = null, gid = 0;
var list = [], types = {}, atlas = {};
var players = [], messages = [], data_q = [];
var attrs = {}, utils = {};
var collisions = {}, box_size = 100; //collision engine

if (typeof(exports)=='undefined') exports = {}
exports.world = {};

utils.repel = function(self, obj){
	var b = self.bounds();
	var ox = obj.x; obj.x = obj.x1;
	var oy = obj.y; obj.y = obj.y1;
	var obj_b = obj.bounds();
	if (obj_b.right>b.left && obj_b.left<b.right) obj.x = ox; 
	else if (obj_b.bottom>b.top && obj_b.top<b.bottom) obj.y = oy;
	else {obj.x = ox; obj.y = oy;}
}

utils.roll = function(dice){
	return Math.round(Math.random()*dice)
}

attrs.damage = function(self){
	for (var a in self.collisions.arrow){
		a = self.collisions.arrow[a];
		if (a.hits[self.type] != null){
			a.delete();
			self.health-= a.hits[self.type];
		}
	}
	for (var b in self.collisions.boom)
		self.health-=3;
	if (self.health < 1){
		env = {}; env[self.id]='delete';
		if (exports.broadcast) exports.broadcast(env); // TODO: Send:@
		else exports.receive(env);
	}
}

attrs.solid = function(self){
	for (var h in self.collisions.hero)
		utils.repel(self, self.collisions.hero[h]);
	for (var m in self.collisions.mob)
		utils.repel(self, self.collisions.mob[m]);
}

types.arrow = function(data){
	this.x      = data.x;
	this.y      = data.y;
	this.t      = data.t||50;
	this.color  = data.color||'#000';
	this.hits   = data.hits || {'mob':1,'spawn':1,'wall':1,'tower':1};
	this.dx     = data.dx;
	this.dy     = data.dy;
	this.speed  = data.speed;
	this.bounds = function(){
		return {left:this.x-4, top:this.y-4,
			right:this.x+4, bottom:this.y+4}
	}
	this.draw   = function(){
		ctx.fillStyle = this.color;
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
		this.x += this.dx;
		this.y += this.dy;
	}
}

types.bomb = function(data){
	this.x = data.x;
	this.y = data.y;
	this.z = -1;
	this.t = data.t||50;
	this.bounds = function(){
		return {left:this.x-6, top:this.y-6,
			right:this.x+6, bottom:this.y+6}
	}
	this.draw   = function(){
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = 'rgba(127,0,0,'+this.t/30+')';
		ctx.arc(this.x, this.y, 6, 0, Math.PI*2, true);
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
	this.t = data.t || 1;
	this.z = -20;
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
	this.speed     = data.speed  || 5;
	this.chat      = data.chat   || false;
	this.health    = data.health || 20;
	this.color     = data.color; 	
	this.inventory = {'bombs':5, 'ammo':500}
	this.r = data.r || 8;
	this.x = data.x || 0; this.x1 = data.x1 || this.x;
	this.y = data.y || 0; this.y1 = data.y1 || this.y;
	this.draw = function(){
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.fillStyle = '#00f';
		ctx.beginPath();
		ctx.lineTo(0, 0);
		ctx.arc(0, 0, 13, Math.PI*this.health/10, 0, true);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = this.color;
		ctx.fillRect(-10, -10, 20, 20);
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
			if (this.inventory['ammo'] > 0){
				this.inventory['ammo'] -= 1;
				if (exports.broadcast){
					var dx = (this.r&1&&-1)+(this.r&2&&1),
					    dy = (this.r&4&&-1)+(this.r&8&&1);
					var speed = (dx&&dy)?14:20;
					var a = {}; a['a'+gid++] = {type:'arrow',
						x:this.x, y:this.y, color:this.color,
						dx:dx*speed, dy:dy*speed}
					exports.broadcast(a);
				}
			}
			this.attack = false;
		}
		if (this.bomb){
			if (this.inventory['bombs'] > 0){
				this.inventory['bombs'] -= 1;
				if (exports.broadcast){
					var b = {}; b['b'+gid++] = {type:'bomb', x:this.x, y:this.y}
					exports.broadcast(b);
				}
			}
			this.bomb = false;
		}
		for (var m in this.collisions.mob) this.health--;
		attrs.damage(this);
	}
	this.bounds = function(){
		return {left:this.x-10, top:this.y-10,
			right:this.x+10, bottom:this.y+10}
	}
}

types.mob = function(data){
	this.x = data.x || 0; this.x1 = data.x1 || this.x;
	this.y = data.y || 0; this.y1 = data.y1 || this.y;
	this.speed  = data.speed  || 5;
	this.health = data.health || 2;

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
	this.health = data.health || 15;
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
		var active = false;
		if (exports.broadcast){
			for (var p in players){
				p = players[p];
				var d = Math.sqrt(Math.pow(this.x-p.x, 2) +
						Math.pow(this.y-p.y, 2));
				if (d<200 && Math.random() > .95){
					var mobs = {}; mobs['m'+gid++] = {type:'mob',
						x:this.x+(utils.roll(2)-1)*20,
						y:this.y+(utils.roll(2)-1)*20}
					exports.broadcast(mobs);
					break;
				}
			}
		}
	}
}

types.wall = function(data){
	this.z    = -10;
	this.x = data.x;
	this.y = data.y;
	this.health = data.health || 10;
	this.bounds = function(){
		return {left:this.x-20, top:this.y-20,
			right:this.x+20, bottom:this.y+20}
	}
	this.draw   = function(){
		ctx.save();
		ctx.fillStyle = 'rgba(0,0,0,'+this.health/10+')';
		ctx.fillRect(this.x-20, this.y-20, 40, 40);
		ctx.restore();
	}
	this.update = function(){
		attrs.damage(this);
		attrs.solid(this);
	}
}

types.tower = function(data){
	types.wall.call(this, data);
	this.health = data.health || 15;
	this.draw   = function(){
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = 'rgba(0,0,0,'+this.health/15+')';
		ctx.arc(this.x, this.y, 20, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
	this.update = function(){
		attrs.damage(this);
		attrs.solid(this);
		if (exports.broadcast && Math.random() < .05){
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
			if (distance<200){
				var r = 20/distance;
				var a = {}; a['a'+gid++] = {type:'arrow',
					x:this.x, y:this.y,
					dx: (nearest.x-this.x)*r,
					dy: (nearest.y-this.y)*r,
				   	hits:{'wall':0, 'hero':2}}
				exports.broadcast(a);
			}
		}
	}
}

function map(x_o, y_o, spawn_c){
	var items = {};
	/* Spawn generation */
	for (var s = 0; s < spawn_c; s++){
		var x = (utils.roll(20)-10)*24+x_o;
		var y = (utils.roll(20)-10)*24+y_o;
		if (Math.abs(x) < 100 && Math.abs(y) < 100) s--;
		else items['s'+gid++] = {type:'spawn', x:x, y:y}
	}

	/* Walls generation */
	var wall_n = 3;
	for (var y = -wall_n; y <= wall_n; y++)
		for(var x = -wall_n; x <= wall_n; x++){
			var wx = x*80+x_o, wy = y*80+y_o;
			if (wx || wy){
				items['w'+gid++] = {type:'wall', x:wx, y:wy}
				r = Math.random();
				if (r > .9 && x<wall_n &&
						(Math.abs(x)>3||Math.abs(y)>3))
					items['t'+gid++] = {type:'tower', x:wx+40, y:wy}
				else if (r > .7 && x<wall_n)
					items['w'+gid++] = {type:'wall',  x:wx+40, y:wy}
				else if (r < .1 && x<wall_n &&
						(Math.abs(x)>3||Math.abs(y)>3))
					items['t'+gid++] = {type:'tower', x:wx+40, y:wy}
				else if (r < .3 && y<wall_n)
					items['w'+gid++] = {type:'wall',  x:wx, y:wy+40}
			}
		}
	exports.broadcast(items);
	return items;
}

exports.init = function(){
	setInterval(exports.main, 33);
}

function process(data){
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

var map_size = 560;

function generate(x, y){
	var x_o = Math.round(x/map_size);
	var y_o = Math.round(y/map_size);
	var a = ''+x_o+','+y_o;
	if (!atlas[a]){
		atlas[a] = map(x_o*map_size, y_o*map_size, 4);
		console.log('generate', a)
	}
}

exports.main = function (){
	while(data_q.length) process(data_q.shift());
	if (exports.broadcast)
		for (var p in players){
			p = players[p];
			generate(p.x-200, p.y-200);
			generate(p.x+200, p.y-200);
			generate(p.x-200, p.y+200);
			generate(p.x+200, p.y+200);
		}
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
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, cvs.width, cvs.height);
		ctx.save();
		ctx.translate(cvs.width/2-player.x, cvs.height/2-player.y);
		for (var p in players){
			p = players[p];
			ctx.fillStyle = '#aa8';
			ctx.beginPath();
			ctx.arc(p.x, p.y, 200, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
		debug.innerHTML = 'health: '+ player.health+' | bombs:'+player.inventory['bombs'] + ' | ammo: ' + player.inventory['ammo'];
		debug.innerHTML += '<br />';
		if (messages.length > 5) messages.splice(5,1);
		for (m in messages)
			debug.innerHTML += '<font color="'+messages[m].color+'">'+messages[m].message + '</font><br />';
	}
	for (var i in list){
		var o = list[i];
		o.update();
		if (cvs){
			if (o.type == 'boom' || o.collisions.boom) o.draw();
			else for (var p in players){
				p = players[p];
				var d = Math.sqrt(Math.pow(o.x-p.x, 2) +
						Math.pow(o.y-p.y, 2));
				if (d<220){
				   	o.draw();
					break;
				}
			}
		}
		o.collisions = {};
	}
	if (cvs) ctx.restore();
}

exports.receive = function(data){
	data_q.push(data);
}

function send(id, data){
	socket.send(data);
	var env = {}; env[id] = data;
	exports.receive(env);
}

function handle_keys(e){
	var action = {}
	action = keys[e.keyCode];
	
	if(player['chat'] == false){
		if (action){
			state = e.type == 'keydown';
			if (player[action] != state){
				var env = {x:player.x, y:player.y}; env[action] = state;
				send('@', env);
			}
		}
	}
}

if (typeof(window)!='undefined')
	window.onload = function(){
		socket = new io.Socket(null, {port: 8080});
		socket.on('message', function(data){
			exports.receive(data);
		});
		socket.connect();
		
		debug   = document.getElementById('debug')
		chatbox = document.getElementById('chatbox')
		cvs     = document.getElementById('canvas');
		ctx = cvs.getContext('2d');
		send('@', {type:'hero',color:Math.floor(Math.random()*16777215).toString(16)});
		while(data_q.length) process(data_q.shift());
		player = exports.world['@'];

		window.onresize = function(){
			cvs.width  = window.innerWidth;
			cvs.height = window.innerHeight;
		}
		window.onresize();

		window.onkeydown = handle_keys;
		window.onkeyup = function(e){
			if (e.keyCode == 192)
				if (debug.style.display != 'none')
					debug.style.display = 'none'
				else debug.style.display = 'block'
			else if (e.keyCode == 13){
					(!player['chat']) ? chatbox.style.display = 'block': chatbox.style.display = 'none';
					if (chatbox.style.display == 'block') chatbox.focus();
					message = {message:chatbox.value, color:player.color}
					var env = {}; env['chat'] = !player['chat'];
					send('@', env);
					send('!', message);
					chatbox.value = '';
			} else handle_keys(e);
		}
		exports.init();
	}
