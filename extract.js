var FeedParser = require('feedparser')
  , concat = require('concat-stream')
  , jsdom = require('jsdom')
  , request = require('request')
  , stream = require('stream')
  , mongo = require('mongodb').MongoClient
  , util = require('util')

jsdom.defaultDocumentFeatures = {
	FetchExternalResources: false,
	ProcessExternalResources: false,
	QuerySelector: true
}

var db;

module.exports = function(rss, target, max) {
	rss = rss.replace('feed://', 'http://');
	return request(rss).pipe(
		new FeedParser({feedurl:rss})).pipe(
		new Extractor(target, max))
}
module.exports.format = function(document, targets, link) {
	var anchor = document.createElement('a');
	anchor.href = link;
	anchor.className = 'item';
	targets.forEach(function(target) {
		var node = document.querySelector(target);
		if (node) {
			var element = document.createElement(node.nodeName);
			element.src = node.src;
			element.title = node.title;
			anchor.appendChild(element);
			if (element.title) {
				var title = document.createElement('div');
				title.className = 'caption';
				title.textContent = element.title;
				anchor.appendChild(title);
			}
		}
	});
	if (anchor.childNodes.length) return anchor;
}
module.exports.init = function(url, cb) {
	mongo.connect(url, function(e, database) {
		if (e) throw e;
		db = database;
		cb();
	});
}
module.exports.cache = function(type, miss, keys, cb) {
	var collection = db.collection(type);
	collection.findOne(keys, function(e, item) {
		if (item) return cb(item);
		miss(keys, function(item) {
			if (item) {
				for (var k in keys) item[k] = keys[k];
				collection.insert(item, {w:0});
			}
			cb(item, true);
		});
	});
}
module.exports.retrieve = function(cb, skip) {
	db.collection('item').find().skip(skip).limit(5).sort({date: -1}).toArray(cb);
}
module.exports.update = function() {
	var count = 0;
	db.collection('feed').find().each(function(e, doc) {
		if (!doc) return;
		count++;
		module.exports(doc.feed, doc.targets, 5).pipe(concat(function(updates) {
			console.log(doc.feed, 'updated');
			if (--count == 0) db.close();
		}));
	});
}

var Extractor = function(target, max) {
	stream.Transform.call(this, {objectMode:true});
	this.targets = Array.isArray(target) ? target : [target];
	this.max = max || 1;
}
util.inherits(Extractor, stream.Transform);
Extractor.prototype._transform = function(chunk, encoding, done) {
	if (this.max < 1) {
		return done();
	}
	var extractor = this;
	module.exports.cache('item', function(keys, cb) {
		jsdom.env({url:chunk.link, done:function(e, window) {
			var anchor = module.exports.format(window.document, extractor.targets, chunk.link);
			if (anchor) {
				return cb({snippet:anchor.outerHTML, date:chunk.date});
			}
			if (extractor.max < 1) {
				return cb(null);
			}
			cb();
		}});
	}, {url:chunk.link, targets:this.targets}, function(item, create){
		if (item != undefined) {
			extractor.max--;
			extractor.push(item);
			if (create)
				db.collection('feed').update(
					{feed:chunk.meta.xmlurl, targets:extractor.targets},
					{$set:{last:item}}, {upsert:true, w:0});
		}
		done();
	});
}

if (require.main === module) {
	module.exports.init('mongodb:///tmp/mongodb-27017.sock/read', module.exports.update);
}
