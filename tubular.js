var Board = function(context, w, h, block_size, block_padding) {
	this.context = context;
	this.width = w;
	this.height = h;
	this.block_size = block_size;
	this.block_padding = block_padding;
	this.board = [];

	this.magicBlock = 0;
	this.magicMax = 10000;
	this.magicLeft = {};
}

Board.prototype.draw = function() {
	for (var k in this.board) {
		this.drawBlock(
				k % this.width,
				Math.floor(k/this.width),
				this.board[k]);
	}
}

Board.prototype.drawBlock = function(x, y, type) {
	var offset = this.block_size + this.block_padding * 2;
	this.context.fillStyle = (Math.floor(type) == 1) ? '#0f0' : '#00f';
	this.context.fillRect(
			x * offset + this.block_padding,
			y * offset + this.block_padding,
			this.block_size, this.block_size)
}

Board.prototype.getBlock = function(x, y) {
	return this.board[y * this.width + x];
}

Board.prototype.setBlock = function(x, y, type) {
	this.board[y * this.width + x] = type;
}

Board.prototype.getMagic = function(x, y) {
	var block = this.getBlock(x, y);
	return Math.round((block - Math.floor(block)) * this.magicMax);
}

Board.prototype.setMagic = function(x, y, magic) {
	var block = this.getBlock(x, y);
	this.setBlock(x, y, Math.floor(block) + magic / this.magicMax);
}

Board.prototype.gravity = function() {
	for (var i = this.board.length - 1; i >= 0; i--) {
		var x = i % this.width;
		var y = Math.floor(i/this.width);
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
	var magicCount = {};
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
					this.magicLeft[magic] = 10000;
				}
				this.setMagic(x, y, magic);
				magicCount[magic] = (magicCount[magic] || 0) + 1;

				this.setMagic(x + 1, y, magic);
				this.setMagic(x + 1, y + 1, magic);
				this.setMagic(x, y + 1, magic);
				var offset = this.block_size + this.block_padding * 2;
				var left = this.magicLeft[magic];
				this.context.fillStyle = (Math.floor(type) == 1) ?
					'rgba(0, 255, 0, ' + left / 10000 + ')' :
					'rgba(0, 0, 255, ' + left / 10000 + ')';
				this.context.clearRect(
						x * offset + this.block_padding,
						y * offset + this.block_padding,
						offset * 2 - this.block_padding * 2,
						offset * 2 - this.block_padding * 2);
				this.context.fillRect(
						x * offset + this.block_padding,
						y * offset + this.block_padding,
						offset * 2 - this.block_padding * 2,
						offset * 2 - this.block_padding * 2);
			}
		}
	}
	for (var k in magicCount) {
		this.magicLeft[k] -= magicCount[k];
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
	this.x = Math.floor((this.board.width - 1) / 2);
	this.y = 0;
	if (!this.move(0,0)) return false;
	this.type = Math.floor(Math.random() * 0x10);
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

var getCanvas = function(width, height) {
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	canvas.style.position = 'fixed';
	canvas.style.top = (window.innerHeight - height) / 2 + 'px';
	canvas.style.left = (window.innerWidth - width) / 2 + 'px';
	document.body.appendChild(canvas);
	return canvas;
}

var getPlayer = function() {
	var container = document.createElement('div');
	document.body.appendChild(container);
	return new YT.Player(container, {
		events: {
			onReady: function(event) {
				youtube = event.target;
			}
		},
		playerVars: {
			listType: 'search',
			list: 'mlp',
			autoplay: 1,
			controls: 0,
			loop: 1,
			showinfo: 0,
			wmode: 'opaque'
		}});
}

var canvas, interval, youtube;

var main = function() {
	if (canvas) document.body.removeChild(canvas);
	if (interval) window.clearInterval(interval);
	/* Constants */
	var block_row = 30;
	var block_size = Math.floor(window.innerWidth / block_row);
	block_column = Math.floor(window.innerHeight / block_size);
	var block_padding = 2;
	var block_inset = block_size - block_padding * 2;

	canvas = getCanvas(
			block_row * block_size,
			block_column * block_size);
	var context = canvas.getContext('2d');
	var board = new Board(context,
			block_row, block_column,
			block_inset, block_padding);
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
		board.draw();
		player.draw();
		board.findBlocks();
	}, 50);
	window.onresize = main;
}

function onYouTubePlayerAPIReady() {
	getPlayer();
	main();
}
