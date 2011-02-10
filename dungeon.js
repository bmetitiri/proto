var keys = {65:'left', 68:'right', 87:'up',
	83:'down', 17:'attack', 16:'run'}

var sys_keys = {13:'chat'}

var cvs = null, mid = 0;
var list = [], types = {}, players = [];
var collisions = {}, box_size = 100; //collision engine

if (typeof(exports)=='undefined') exports = {}
exports.world = {};

types.hero = function(id, data){
	this.type       = 'hero';
	this.id         = id;

	this.speed      = 5;
	this.run        = data.run     || false;
	this.left       = data.left    || false;
	this.right      = data.right   || false;
	this.up         = data.up      || false;
	this.attack     = data.attack  || false;
	this.chat       = data.chat    || this.chat || false;
	this.message    = data.message || '';

	//Start position
	this.x = data.x || 0; this.x1 = data.x1 || this.x;
	this.y = data.y || 0; this.y1 = data.y1 || this.y;
	this.draw = function(){
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.fillStyle = (this.collisions.hero)?'#f00':'#000';
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
	}
	this.bounds = function(){
		return {left:this.x-10, top:this.y-10,
			right:this.x+10, bottom:this.y+10}
	}
}

types.zone = function(id, data){
	this.type       = 'zone';
	this.id         = id;

	this.x     = data.x;
	this.y     = data.y;
	this.z     = 10;
	this.color = data.color;
	this.draw = function(){
		ctx.save();
		ctx.translate(this.x, this.y);
		if (this.collisions.hero)
			ctx.fillStyle = 'rgba('+this.color+',.2)';
		else
			ctx.fillStyle = 'rgb('+this.color+')';
		ctx.fillRect(-200, -200, 400, 400);
		ctx.restore();
	}
	this.bounds = function(){
		return {left:this.x-300, top:this.y-300,
			right:this.x+300, bottom:this.y+300}
	}
	this.update = function(){
		if (this.collisions.hero)
			/*if (this.color == '255,0,0'){ #TODO: Make work
				for (var h in this.collisions.hero){
					h = this.collisions.hero[h];
					h.x = h.x1; h.y = h.y1;
				}
			} else*/ if (exports.broadcast && this.color == '0,0,0'
				&& Math.random() > .95){
				var mobs = {}; mobs['m'+mid++] = {type:'mob',
					x:this.x-190+Math.random()*380,
					y:this.y-190+Math.random()*380}
				exports.broadcast(mobs);
			}
	}
}

types.mob = function(id, data){
	this.type       = 'mob';
	this.id         = id;

	this.x = data.x || 0; this.x1 = data.x1 || this.x;
	this.y = data.y || 0; this.y1 = data.y1 || this.y;
	this.speed = 5;

	this.draw = function(){
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.beginPath();
		ctx.arc(0, 0, 10, 0, Math.PI*2, true);
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

types.wall = function(id, data){
	this.type = 'wall';
	this.id   = id;
	this.z    = -10;

	this.x = data.x;
	this.y = data.y;
	this.width  = data.width||40;
	this.height = data.height||40;
	this.bounds = function(){
		return {left:this.x, top:this.y,
			right:this.x+this.width, bottom:this.y+this.height}
	}
	this.draw   = function(){
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
	this.repel  = function(obj){
		var b = this.bounds();
		var ox = obj.x; obj.x = obj.x1;
		var oy = obj.y; obj.y = obj.y1;
		var obj_b = obj.bounds();
		if (obj_b.right>b.left && obj_b.left<b.right) obj.x = ox; 
		if (obj_b.bottom>b.top  && obj_b.top<b.bottom) obj.y = oy; 

	}
	this.update = function(){
		for (var h in this.collisions.hero)
			this.repel(this.collisions.hero[h]);
		for (var m in this.collisions.mob)
			this.repel(this.collisions.mob[m]);
	}
}

exports.init = function(){
	var wid = 0, zid = 0;
	if (exports.broadcast){
		/* Walls generation */
		var zones = {}, walls = {};
		for (var y = -10; y < 10; y++)
			for(var x = -10; x < 10; x++)
				if (x || y) walls['w'+wid++] = {type:'wall', x:x*100-20,y:y*100-20}
		exports.broadcast(walls);

		/* Zones generation */
		for (var x = -1; x <= 1; x++)
			for (var y = -1; y <= 1; y++)
				if (x||y)
					zones['z'+zid++] = {type:'zone', x:x*410, y:y*410,
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
		for (p in players)
			p = players[p];
			debug.innerHTML += '<br/>'+p.message;
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
			var n = new types[data[k]['type']](k, data[k]);
			n.collisions = {};
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
		send('@', {type:'hero'});
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
				env = {message:chatbox.value}
				env[sys_action] = player[sys_action] == true?false:true;
				send('@', env);
				chatbox.style.visibility = player[sys_action] == true?'visible':'hidden';
				if (chatbox.style.visibility == 'visible') chatbox.focus();
				chatbox.value = '';
			}
		}
		exports.init();
	}
