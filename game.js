// this.(from|to) = {id:..., type:(actor|movie), name:...}

var Game = function(from, to) {
	this.start = new Date();
	this.end = new Date().setMinutes(this.start.getMinutes() + 1);
	this.from = from;
	this.to = to;
	this.sessions = {};
};

Game.prototype.join = function(session) {
	this.sessions[session] = new GameState(this, session);
};

var GameState = function(game, session) {
	this.game = game;
	this.session = session;
	this.current = this.game.from;
	this.results = {}
	this.results[this.pointer.id] = this.pointer;
	this.fetch(this.current.id);
};

GameState.prototype.fetch = function(next) {
	if (!this.results[next]) {
		console.log('Invalid selection.');
		return;
	}
	this.current = this.results[next];
	this.results = {};
};
