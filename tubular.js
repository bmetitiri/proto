var Board = function(context, w, h) {
	this.context = context;
	this.width = w;
	this.height = h;
	this.board = [];

	this.magicBlock = 0;
	this.magicMax = 10000;
	this.magicLeft = {};

	this.setBlockSize(20); // Pre-initialisation default.
}

Board.prototype.draw = function() {
	for (var k in this.board) {
		this.drawBlock(
				k % this.width,
				~~(k/this.width),
				this.board[k]);
	}
}

Board.prototype.setBlockSize = function(size) {
	this.block_size = size;
}

Board.prototype.getImage = function(type) {
	// TODO Use localized lookups.
	var index = youtube.getPlaylistIndex();
	return (~~(type) == 1) ?
		images[videoAuthor[videoPlaylist[index]]] :
		images[videoAuthor[videoPlaylist[index+1]]];
}

Board.prototype.drawBlock = function(x, y, type) {
	var margin = ~~(this.block_size / 10);
	var type = (~~(type) == 1);
	var image = this.getImage(type);
	var draw_x = x * this.block_size + margin;
	var draw_y = y * this.block_size + margin;
	var size = this.block_size - margin * 2;
	if (image) {
		this.context.drawImage(image, draw_x, draw_y, size, size)
	} else {
		this.context.fillStyle = type ? '#0f0' : '#00f';
		this.context.fillRect(draw_x, draw_y, size, size)
	}
	this.context.strokeStyle = type ? '#000' : '#fff'
	this.context.lineWidth = margin;
	this.context.strokeRect(draw_x, draw_y, size, size);
}

Board.prototype.getBlock = function(x, y) {
	return this.board[y * this.width + x];
}

Board.prototype.setBlock = function(x, y, type) {
	this.board[y * this.width + x] = type;
}

Board.prototype.getMagic = function(x, y) {
	var block = this.getBlock(x, y);
	return Math.round((block - ~~(block)) * this.magicMax);
}

Board.prototype.setMagic = function(x, y, magic) {
	var block = this.getBlock(x, y);
	this.setBlock(x, y, ~~(block) + magic / this.magicMax);
}

Board.prototype.gravity = function() {
	for (var i = this.board.length - 1; i >= 0; i--) {
		var x = i % this.width;
		var y = ~~(i/this.width);
		if (this.magicLeft[this.getMagic(x, y)] < 0) {
			delete this.board[y * this.width + x];
		} else if (y < this.height - 1 &&
				!isNaN(this.board[i]) &&
				isNaN(this.getBlock(x, y+1))) {
			this.setBlock(x, y + 1, this.board[i]);
			delete this.board[y * this.width + x];
		}
	}
}

Board.prototype.findBlocks = function() {
	var magicList = {};
	for (var x = 0; x < this.width - 1; x++) {
		for (var y = 0; y < this.height - 1; y++) {
			b = this;
			var type = this.getBlock(x, y);
			if (type && type & this.getBlock(x + 1, y) &
					this.getBlock(x + 1, y + 1) & this.getBlock(x, y + 1)) {
				var magic = this.getMagic(x, y);
				[this.getMagic(x + 1, y), this.getMagic(x + 1, y + 1),
					this.getMagic(x, y + 1)].forEach(function(v) {
						if (v && this.magicLeft[v] < this.magicLeft[magic]) {
							magic = v;
						}
					}, this);
				if (!magic) {
					magic = this.magicBlock++;
					if (this.magicBlock + 1 >= this.magicMax) {
						// TODO Don't assign existing blocks.
						this.magicBlock = 0;
					}
					this.magicLeft[magic] = this.magicMax;
				}
				this.setMagic(x, y, magic);
				var point = {x:x, y:y};
				if (magicList[magic]) {
					magicList[magic].push(point);
				} else {
					magicList[magic] = [point];
				}

				this.setMagic(x + 1, y, magic);
				this.setMagic(x + 1, y + 1, magic);
				this.setMagic(x, y + 1, magic);
			}
		}
	}
	for (var k in magicList) {
		this.magicLeft[k] -= magicList[k].length;

		var point = magicList[k][0];
		var type = this.getBlock(point.x, point.y);
		var image = this.getImage(type);
		var magic = this.getMagic(point.x, point.y);
		var left = this.magicLeft[magic];
		var max_x = 0;
		var max_y = 0;
		var min_x = Infinity;
		var min_y = Infinity;
		magicList[k].forEach(function(v) {
			if (v.x > max_x) max_x = v.x;
			if (v.y > max_y) max_y = v.y;
			if (v.x < min_x) min_x = v.x;
			if (v.y < min_y) min_y = v.y;
		}, this);
		var width = max_x + 2 - min_x;
		var height = max_y + 2 - min_y;
		var size = Math.max(width, height);
		var x_offset = (size - width) / 2;
		var y_offset = (size - height) / 2;

		var slide = (this.magicMax - left) / this.magicMax * canvas.width;
		magicList[k].forEach(function(v) {
			if (image) {
				this.context.drawImage(image,
						(v.x - min_x + x_offset) / size * image.width,
						(v.y - min_y + y_offset) / size * image.height,
						(2 * image.width / size),
						(2 * image.height / size),
						(v.x * this.block_size + slide) % canvas.width,
						v.y * this.block_size,
						this.block_size * 2,
						this.block_size * 2);
			} else {
				this.context.fillStyle =
						(~~(type) == 1) ? '#0f0' : '#00f';
				this.context.fillRect(
						v.x * this.block_size,
						v.y * this.block_size,
						this.block_size * 2,
						this.block_size * 2)
			}
		}, this);
	}
}

var Piece = function(board) {
	this.board = board;
	this.reset();
}

Piece.prototype.reset = function() {
	if (!isNaN(this.type)) {
		this.board.setBlock(this.x, this.y, (this.type & 1) + 1);
		this.board.setBlock(this.x+1, this.y, ((this.type & 2) >> 1) + 1);
		this.board.setBlock(this.x+1, this.y+1, ((this.type & 4) >> 2) + 1);
		this.board.setBlock(this.x, this.y+1, ((this.type & 8) >> 3) + 1);
	}
	this.x = ~~((this.board.width - 1) / 2);
	this.y = 0;
	if (!this.move(0,0)) return false;
	this.type = ~~(Math.random() * 0x10);
	return true;
}

Piece.prototype.move = function(x, y) {
	to_x = this.x + x;
	to_y = this.y + y;
	if (to_x < 0 || to_y < 0 || to_x + 2 > this.board.width ||
			to_y + 2 > this.board.height) return false;
	if ((this.board.getBlock(to_x, to_y) |
		this.board.getBlock(to_x + 1, to_y) |
		this.board.getBlock(to_x + 1, to_y + 1) |
		this.board.getBlock(to_x, to_y + 1)) == 0){
		this.x += x;
		this.y += y;
		return true;
	}
	return false;
}

Piece.prototype.down = function() {
	return this.move(0, 1) || this.reset();
}

Piece.prototype.draw = function() {
	this.board.drawBlock(this.x, this.y, (this.type & 1) + 1);
	this.board.drawBlock(this.x + 1, this.y, ((this.type & 2) >> 1) + 1);
	this.board.drawBlock(this.x  +  1, this.y+1, ((this.type & 4) >> 2) + 1);
	this.board.drawBlock(this.x, this.y  +  1, ((this.type & 8) >> 3) + 1);
}

Piece.prototype.rotate = function() {
	this.type = this.type << 3 | this.type >> 1;
}

var interval, youtube;

var main = function() {
	if (interval) window.clearInterval(interval);
	/* Constants */
	var block_row = 30;
	var block_column = 20;

	var context = canvas.getContext('2d');
	var board = new Board(context, block_row, block_column);

	var player = new Piece(board);

	var timer = 0;

	var codes = {37:'left', 38:'up', 39:'right', 40:'down'}
	window.onkeydown = function(e){
		switch(codes[e.keyCode]) {
			case 'left':
				player.move(-1, 0);
				break;
			case 'right':
				player.move(1, 0);
				break;
			case 'up':
				player.rotate();
				break;
			case 'down':
				player.down();
				break;
		}
	}
	interval = window.setInterval(function() {
		timer++;
		if (timer % 10 == 0){
			if (!player.down()) {
				youtube.nextVideo();
				return main();
			}
		}
		board.gravity();
		context.clearRect(0, 0, canvas.width, canvas.height);
		board.findBlocks();
		board.draw();
		player.draw();
	}, 50);

	window.onresize = function() {
		var window_ratio = window.innerWidth / window.innerHeight;
		var canvas_ratio = block_row / block_column;
		var size = ~~((window_ratio > canvas_ratio) ?
			window.innerHeight / block_column :
			window.innerWidth / block_row);
		board.setBlockSize(size);
		setCanvas(block_row * size, block_column * size);
	};
	window.onresize();
}

var getPlayer = function() {
	return new YT.Player(container, {
		events: {
			onReady: callbacks.player
		},
		playerVars: {
			autoplay: 1,
			controls: 0,
			loop: 1,
			showinfo: 0,
			wmode: 'opaque'
		}});
}

var setCanvas = function(width, height) {
	canvas.width = width;
	canvas.height = height;
	canvas.style.position = 'fixed';
	canvas.style.top = (window.innerHeight - height) / 2 + 'px';
	canvas.style.left = (window.innerWidth - width) / 2 + 'px';
}

var createElement = function(type, params) {
	var element = document.createElement(type);
	for (var k in params) {
		element[k] = params[k];
	}
	document.body.appendChild(element);
	return element;
}

var callYoutube = function(type, params, positional) {
	positional = positional ? '/' + positional : '';
	var src = 'https://gdata.youtube.com/feeds/api/' + type +
		positional + '?alt=json&callback=callbacks.' + type;
	for (var k in params) {
		src += '&' + k + '=' + params[k];
	}
	createElement('script', {
		src: src
	});
}

var container = createElement('div');
var canvas = createElement('canvas');
var video = window.location.href.match(/[?&]v=([^&]+)/);
if (video) {
	var loader = callYoutube('videos', {fields: 'entry'}, video + '/related');
} else {
	var loader = callYoutube('videos', {fields: 'entry', time: 'today'});
}

var videoPlaylist, videoAuthor = {}, images = {};
callbacks = {
	users: function(data) {
		var image = document.createElement('img');
		image.src = data.entry.media$thumbnail.url;
		images[data.entry.yt$username.$t.toLowerCase()] = image;
	},
	videos: function(data) {
		videoPlaylist = [];
		data.feed.entry.forEach(function(video) {
			var id = video.id.$t;
			id = id.slice(id.lastIndexOf('/')+1)
			var user = video.author[0].name.$t.replace(/ /g, '');
			videoPlaylist.push(id);
			videoAuthor[id] = user.toLowerCase();
			callYoutube('users',
				{fields: 'media:thumbnail,yt:username'}, user);
		});
	},
	player: function(event) {
		youtube = event.target;
		youtube.loadPlaylist({playlist:videoPlaylist});

		main();
	}
}

function onYouTubePlayerAPIReady() {
	getPlayer();
}
