var Cookies = require('cookies');
var crypto  = require('crypto');

// The main request wrapper function to provide req.fastauth.
module.exports = function(chain) {
	return function(req, res) {
		var cookies = new Cookies(req, res, module.exports.cookieKeys);
		var mintPrefix = module.exports.mintPrefix;
		if (req.url.indexOf(mintPrefix) == 0) {
			var key = req.url.slice(mintPrefix.length);
			if (key.length > module.exports.mintLength) {
				var session = module.exports.hash(key);
				cookies.set('s', session, {signed: !!module.exports.cookieKeys});
			}
			res.writeHead(302, {'Location': module.exports.postLogin});
			res.end();
			return;
		}
		if (req.url.indexOf(module.exports.logoutPath) == 0) {
			cookies.set('s');
			res.writeHead(302, {'Location': module.exports.postLogout});
			res.end();
			return;
		}
		req.fastauth = cookies.get('s', {signed: !!module.exports.cookieKeys});
		chain(req, res);
	}
};

// Hashes the authentication token into a session token.
module.exports.hash = function(key) {
	var hash = crypto.createHash('sha384');
	hash.update(key);
	if (module.exports.signKey) {
		hash.update(module.exports.signKey);
	}
	return hash.digest('base64').replace(/[+\/=]/g, 'z');
};

// Returns the random key used as the authentication token.
module.exports.random = function() {
	return crypto.randomBytes(33).toString('base64').replace(/[+\/=]/g, 'z');
};

// Returns a URL for minting.
module.exports.mint = function() {
	return module.exports.mintPrefix + module.exports.random();
};

// Cookie keys used for cookie library signing.
module.exports.cookieKeys = undefined;

// Path to direct to for removing the session cookie.
module.exports.logoutPath = '/logout';

// Should be set to the expected length of the return from .random(), used to
// enforce a minimum mint key length.
module.exports.mintLength = 16;

// Path to direct to for minting session cookies.
module.exports.mintPrefix = '/mint/';

// Path to direct to after minting session cookies.
module.exports.postLogin = '/';

// Path to direct to after removing session cookies.
module.exports.postLogout = '/';

// Note that if this is changed, existing sessions will be invalidated.
module.exports.signKey = undefined;

// Generic description associated with the module explaining how to login.
module.exports.description = 'This site uses registration-less login by generating a unique link which acts as your authentication token. This token can be saved locally as a bookmark by dragging this link to your bookmark bar, and then clicking it at any time to log in. Note that this link is not saved on the server, and will not be recoverable if lost.';
