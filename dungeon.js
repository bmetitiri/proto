var keys = {32:'attack', 16:'run', 66:'bomb',
	65:'left', 68:'right', 87:'up', 83:'down',
	72:'left', 76:'right', 75:'up', 74:'down'} /* hlkj */

var three = typeof(THREE)!='undefined';
var cvs = null, gid = 0;
var list = [], types = {}, atlas = {};
var players = [], messages = [], data_q = [];
var attrs = {}, utils = {};
var collisions = {}, box_size = 100; //collision engine
var item_types = ['healthpack', 'quiver', 'bomb_bag'];

if (typeof(exports)=='undefined') exports = {}
exports.world = {};

if(three) {
	var camera = new THREE.Camera(75, null, 1, 1000),
		scene = new THREE.Scene(),
		renderer = new THREE.WebGLRenderer();
	scene.fog = new THREE.FogExp2( 0x000000, 0.0025);
	var wall = new Cube(40, 40, 40, 1, 1, 
		new THREE.MeshLambertMaterial( { color:
			0xcccccc, shading:THREE.FlatShading } ))
	var tower_geometry = new Cylinder(16, 20, 20, 30, 0, 0);
	var mob = new Cube(20, 20, 20, 1, 1, 
		new THREE.MeshLambertMaterial( { color:
			0x00ff00, shading:THREE.FlatShading } ));
	var arrow = new Cube(4, 4, 4, 1, 1, 
		new THREE.MeshLambertMaterial( { color:
			0x00ffff, shading:THREE.FlatShading } ));
	var player_model = new Cube( 20, 20, 20, 1, 1, 
			new THREE.MeshLambertMaterial( { color:
				Math.random() * 0xffffff, shading:THREE.FlatShading } ));
	var bomb = new Cube(5, 5, 5, 1, 1, 
		new THREE.MeshLambertMaterial( { color:
			0xaaaaaa, shading:THREE.FlatShading } ));
	var pickup = new Cube(5, 5, 5, 1, 1, 
		new THREE.MeshLambertMaterial( { color:
			0xf0ff0f, shading:THREE.FlatShading } ));
	var spawn = new Cube(20, 20, 20, 1, 1, 
		new THREE.MeshLambertMaterial( { color:
			0xffff00, shading:THREE.FlatShading } ));
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

utils.roll = function(dice){
	return Math.round(Math.random()*dice)
}

attrs.damage = function(self){
	for (var a in self.collisions.arrow){
		a = self.collisions.arrow[a];
		if (a.hits[self.type] != null){
			a.remove();
			self.health -= a.hits[self.type];
		}
	}
	for (var b in self.collisions.boom)
		self.health-=3;
	if (self.health < 1){
		env = {}; env[self.id]='delete';
		if(three) renderer.removeObject(scene, self.model);
		if (exports.broadcast){
			if (Math.random() < .1)
				env['p'+gid++] = {type:'pickup',item_type:item_types[
					utils.roll(item_types.length)], x:self.x, y:self.y};
			if (self.type == 'hero' && self.inventory.bombs)
				env['b'+gid++] = {type:'bomb', x:self.x, y:self.y}
		   	exports.broadcast(env); // TODO: Send:@

		} else exports.receive(env);
	}
}

attrs.bag = function(self){
	for (var p in self.collisions.pickup){
		p = self.collisions.pickup[p];
		if (p.item_type == 'healthpack') 
			if(self.health + 10 <= 100) self.health += 10;
		if (p.item_type == 'quiver'){
			if(self.inventory.ammo + 50 <= 500) self.inventory.ammo += 50;
			else self.inventory.ammo = 500;
		} if (p.item_type == 'bomb_bag') 
			if(self.inventory.bombs + 5 <= 30) self.inventory.bombs += 5;
		p.remove();
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
	}
	if(three){
		this.model = new THREE.Mesh(arrow, new THREE.MeshFaceMaterial());
		this.model.position.x = this.x;
		this.model.position.y = 20;
		this.model.position.z = this.y;
		this.model.overdraw = true;
		scene.addObject(this.model);
	}
	this.remove = function(){
		if(three) renderer.removeObject(scene, this.model);
		env = {}; env[this.id]='delete'; exports.receive(env);
		/*if (exports.broadcast){
			env = {}; env[this.id]='delete';
			exports.broadcast(env);
		}*/
	}
	this.update = function(){
		if (this.t-- < 0) this.remove();
		this.x += this.dx;
		this.y += this.dy;
		if(three) {
			this.model.position.x = this.x;
			this.model.position.z = this.y;
		}
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
	if(three){
		this.model = new THREE.Mesh(bomb, new THREE.MeshFaceMaterial());
		this.model.position.x = this.x;
		this.model.position.y = 20;
		this.model.position.z = this.y;
		this.model.overdraw = true;
		scene.addObject(this.model);
	}
	this.draw   = function(){
	}
	this.remove = function(){
		if(three) renderer.removeObject(scene, this.model);
		env = {}; env[this.id]='delete'; exports.receive(env);
	}
	this.update = function(){
		if (this.t-- < 0 || this.collisions.boom){
			this.remove();
			if (exports.broadcast){
				var e = {}; e['e'+gid++] = {type:'boom', x:this.x, y:this.y}
				exports.broadcast(e);
			}
		}
	}
}

types.pickup = function(data){
	this.x = data.x;
	this.y = data.y;
	this.z      = 4;
	this.health = data.health || 5;
	this.item_type = data.item_type || 'healthpack';
	this.bounds = function(){
		return {left:this.x-10, top:this.y-10,
			right:this.x+10, bottom:this.y+10}
	}
	if(three){
		this.model = new THREE.Mesh(pickup, new THREE.MeshFaceMaterial());
		this.model.position.x = this.x;
		this.model.position.y = 20;
		this.model.position.z = this.y;
		this.model.overdraw = true;
		scene.addObject(this.model);
	}
	this.draw   = function(){
         if (this.item_type == 'healthpack'){
         }
         else if (this.item_type =='quiver'){
         }
         else if (this.item_type =='bomb_bag'){
         }
	}
	this.update = function(){
		attrs.damage(this);
	}
	this.remove = function(){
		if(three) renderer.removeObject(scene, this.model);
		env = {}; env[this.id]='delete'; exports.receive(env);
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
	}
	this.update = function(){
		if (this.t-- < 0){
			env = {}; env[this.id]='delete'; exports.receive(env);
		}
	}
}

types.hero = function(data){
	this.speed     = data.speed   || 5;
	this.chat      = data.chat    || false;
	this.health    = data.health  || 2000;
	this.stamina   = data.stamina || 100;
	this.color     = data.color; 	
	this.inventory = {'bombs':5, 'ammo':500}
	this.r = data.r || 8;
	this.x = data.x || 0; this.x1 = data.x1 || this.x;
	this.y = data.y || 0; this.y1 = data.y1 || this.y;
	this.draw = function(){
	}
	if(three){
	this.model = new THREE.Mesh( player_model, new THREE.MeshFaceMaterial() );
		this.model.position.x = this.x;
		this.model.position.y = 10;
		this.model.position.z = this.y;
		this.model.overdraw = true;
		scene.addObject(this.model);
		this.light = new THREE.PointLight( 0xffcc99 ),
		this.light.position.x = this.x;
		this.light.position.z = this.y;
		this.light.position.y = 30;
		scene.addLight( this.light );
	}
	this.update = function(){
		speed = this.speed;
		if (this.left||this.right||this.up||this.down){
			if (this.run && this.stamina-- > 0) speed *= 2;
			else if (this.stamina < 100) this.stamina++;

			if ((this.left||this.right)&&(this.up||this.down))
				speed = .7 * speed;
			this.x1 = this.x; this.y1 = this.y;
			if (this.left)  {this.x -= speed; }
			if (this.right) {this.x += speed; }
			if (this.up)    {this.y -= speed; }
			if (this.down)  {this.y += speed; }
	
	if(three){
		this.light.position.x = this.model.position.x = this.x;
		this.light.position.z = this.model.position.z = this.y;
		camera.target.position = player.model.position;
	}

			var dir = (this.left&&1)|(this.right&&2)|
				(this.up&&4)|(this.down&&8);
		}
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
			if (this.inventory.bombs > 0){
				this.inventory.bombs -= 1;
				if (exports.broadcast){
					var b = {}; b['b'+gid++] = {type:'bomb', x:this.x, y:this.y}
					exports.broadcast(b);
				}
			}
			this.bomb = false;
		}
		for (var m in this.collisions.mob) this.health--;
		attrs.damage(this);
		attrs.bag(this);
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
	if(three){
		this.model = new THREE.Mesh(mob, new THREE.MeshFaceMaterial());
		this.model.position.x = this.x;
		this.model.position.y = 20;
		this.model.position.z = this.y;
		this.model.overdraw = true;
		scene.addObject(this.model);
	}
	this.bounds = function(){
		return {left:this.x-8, top:this.y-8,
			right:this.x+8, bottom:this.y+8}
	}
	this.draw   = function(){
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
		if(three) {
			this.model.position.x = this.x;
			this.model.position.z = this.y;
		}
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
	if(three){
		this.model = new THREE.Mesh(spawn, new THREE.MeshFaceMaterial());
		this.model.position.x = this.x;
		this.model.position.y = 20;
		this.model.position.z = this.y;
		this.model.overdraw = true;
		scene.addObject(this.model);
	}
	this.draw   = function(){
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
				if (d<400 && Math.random() > .95){
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
	}
	if(three){
		this.model = new THREE.Mesh(wall, new THREE.MeshFaceMaterial());
		this.model.position.x = this.x;
		this.model.position.y = 20;
		this.model.position.z = this.y;
		this.model.overdraw = true;
		scene.addObject(this.model);
	}
	this.update = function(){
		attrs.damage(this);
		attrs.solid(this);
	}
}

types.tower = function(data){
	types.wall.call(this, data);
	this.health = data.health || 15;
	if(three){
		this.model = new THREE.Mesh(tower_geometry, new THREE.MeshLambertMaterial( 
			{ color: 0xff0000, shading:THREE.FlatShading } ), new THREE.MeshFaceMaterial());
		this.model.position.x = this.x;
		this.model.position.y = 20;
		this.model.position.z = this.y;
		this.model.rotation.x = - 90 * ( Math.PI / 180 );
		this.model.overdraw = true;
		scene.addObject(this.model);
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
	var items = {}, danger=x_o||y_o;
	if (danger){
		/* Spawn generation */
		for (var s = 0; s < spawn_c; s++){
			var x = (utils.roll(20)-10)*24+x_o;
			var y = (utils.roll(20)-10)*24+y_o;
			//if (Math.abs(x) < 100 && Math.abs(y) < 100) s--; else
			items['s'+gid++] = {type:'spawn', x:x, y:y}
		}
		
		/* Items generation */
		for (var i = 0; i < 2; i++){
			var x = (utils.roll(20)-10)*24+x_o;
			var y = (utils.roll(20)-10)*24+y_o;
			items['p'+gid++] = {type:'pickup',item_type:item_types[
				utils.roll(item_types.length)], x:x, y:y}
		}
	}

	/* Walls generation */
	var wall_n = 3;
	for (var y = -wall_n; y <= wall_n; y++)
		for(var x = -wall_n; x <= wall_n; x++){
			var wx = x*80+x_o, wy = y*80+y_o;
			if (wx || wy){
				items['w'+gid++] = {type:'wall', x:wx, y:wy}
				r = Math.random();
				if (r > .9 && danger)
					items['t'+gid++] = {type:'tower', x:wx+40, y:wy}
				else if (r > .7)
					items['w'+gid++] = {type:'wall',  x:wx+40, y:wy}
				else if (r < .1 && danger)
					items['t'+gid++] = {type:'tower', x:wx+40, y:wy}
				else if (r < .3)
					items['w'+gid++] = {type:'wall',  x:wx, y:wy+40}
			}
		}
	exports.broadcast(items);
	return items;
}




// from three.js grass demo
function generateTextureBase() {

	var canvas = document.createElement( 'canvas' );
	canvas.loaded = true;
	canvas.width = 512;
	canvas.height = 512;

	var context = canvas.getContext( '2d' );
	context.fillStyle = "#030";
	context.fillRect(0,0, canvas.width, canvas.height);

	for ( var i = 0; i < 20000; i ++ ) {
		context.fillStyle = 'rgba(0,' + Math.floor( Math.random() * 64 + 32 ) + ',16,1)';
		context.beginPath();
		context.arc( Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3 + 1, 0, Math.PI * 2, true );
		context.closePath();
		context.fill();
	}
	context.globalAlpha = 0.1;
	context.globalCompositeOperation = 'lighter';
	return canvas;
}

exports.init = function(){
	if (three){
		camera.position.y = 100;
		var geometry = new Plane(10000,10000);
		var texture = generateTextureBase();
		var floor = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: new THREE.Texture( texture , new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping ) } ) );
		floor.rotation.x = - 90 * ( Math.PI / 180 );
		floor.position.x = 0;
		floor.position.z = 0;
		scene.addObject(floor);
	}
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
			generate(p.x+200, p.y+200);
			generate(p.x-200, p.y+200);
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
	for (var i in list){
		var o = list[i];
		if (typeof(THREE) != 'undefined'){
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
		o.update();
		o.collisions = {};
	}
	 if(typeof(THREE) != 'undefined' && typeof(player) != 'undefined') {
		 camera.position.z = player.model.position.z+100;
		 camera.position.x = player.model.position.x;
		 renderer.render( scene, camera);
	 }
}


create_player = function(sessionId){
	send(sessionId.toString(), {type:'hero',color:Math.floor(Math.random()*16777215).toString(16)});
	while(data_q.length) process(data_q.shift());
	player = exports.world[sessionId];
}

exports.receive = function(data){
	if (data.sessionId){
		create_player(data.sessionId);
	}
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
	
	if(typeof(player) != 'undefined' && player['chat'] == false){
		if (action){
			state = e.type == 'keydown';
			if (player[action] != state){
				var env = {x:player.x, y:player.y}; env[action] = state;
				send(player.id.toString(), env);
			}
		}
	}
}

if (typeof(window)!='undefined')
	window.onload = function(){
		document.body.appendChild( renderer.domElement );
		
		socket = new io.Socket(null, {port: 8080});
		socket.on('message', function(data){
			exports.receive(data);
		});
		socket.connect();
		
		(window.onresize = function(){
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		})();
		window.onkeydown = handle_keys;
		window.onkeyup = function(e){
			if (e.keyCode == 192)
				if (debug.style.display != 'none')
					debug.style.display = 'none'
				else debug.style.display = 'block'
			else if (e.keyCode == 13){
				//
			} else handle_keys(e);
		}
		exports.init();
	}
