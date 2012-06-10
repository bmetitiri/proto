// this.(from|to) = {id:..., type:(actor|movie), name:...}
var rovio = require('./rovio');

exports.Game = function(from, to) {
	this.start = new Date();
	this.end = new Date().setSeconds(this.start.getSeconds() + 90);
	this.from = from;
	this.to = to;
	this.sessions = {};
};

exports.Game.prototype.get = function(session) {
	return this.sessions[session];
};

exports.Game.prototype.join = function(session) {
	this.sessions[session] = new exports.GameState(this, session);
	return this.sessions[session];
};

exports.Game.prototype.leave = function(session) {
	delete this.sessions[session];
};

exports.GameState = function(game, session) {
	this.game = game;
	this.current = this.game.from;
	this.path = []
	this.results = {}
	this.results[this.current.id] = this.current;
	this.session = session;
};

exports.GameState.prototype.fetch = function(next, callback) {
	if (!this.results[next]) {
		console.log('Invalid selection:', next);
		return;
	}
	this.current = this.results[next];
	this.path.push(this.current);
	this.results = {};
	var fetcher = (this.current.type == 'movie') ? rovio.getActors : rovio.getMovies;
	var self = this;
	fetcher(function(ret) {
		for (k in ret) {
			var result = ret[k];
			self.results[result.id] = result;
		}
		callback(ret);
	}, next);
};
