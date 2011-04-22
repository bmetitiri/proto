import common
from BeautifulSoup import BeautifulSoup
from datetime import datetime, timedelta

props = {'images': 'img'} #Tracked properties

class Feed(common.db.Model):
	url    = common.db.LinkProperty()
	date   = common.db.DateTimeProperty(auto_now_add=True)
	next   = common.db.DateTimeProperty()
	images = common.db.ListProperty(int)
	def save(self, *args, **kwargs):
		self.next = datetime.now()+timedelta(seconds=2400)
		super(Feed, self).save(*args, **kwargs)

#for k in props: setattr(Feed, k, common.db.ListProperty(int, indexed=False))
# Cannot dynamically add properties, even at module initialisation

class Record(common.db.Model):
	date = common.db.DateTimeProperty(auto_now_add=True)
	html = common.db.TextProperty()
	feed = common.db.ReferenceProperty(Feed)

	def data(self):
		return {'date': str(self.date), 'html': self.html, 'url':self.feed.url}

class Main(common.JSONPage):
	url = '/.*'
	def get(self):
		offset  = int(self.request.get('o', 0))
		records = Record.all().order('-date')
		self.out(records = records.fetch(10, offset), next=offset+10)
	def post(self):
		key  = self.request.get('url')
		_url = self.request.get('_url')
		feed = common.from_key(Feed, key)
		if key == _url:
			feed = self.process(feed)
			feed.save()
		else: feed.url = key
		raw  = common.fetch(feed.url).content
		soup = BeautifulSoup(raw)
		matches = {}
		for k, v in props.iteritems():
			matches[k] = soup.findAll(v)
		for i in matches['images']:
			if '//' not in i['src']: i['src'] = '%s/%s' % (feed.url,i['src'])
			del i['style'], i['height'], i['width'], i['onload']
		for k in props:
			for i in getattr(feed, k):
				match = matches[k][i]
				match.checked = True
				if key == _url:
					record = Record.get_or_insert(str(match)[-50:],
							feed=feed, html=unicode(match))
		if key == _url: self.redirect('')
		self.out(feed=feed, raw=raw, matches=matches)

from google.appengine.api import urlfetch

class Sync(common.Page): #TODO: Extract parts up?
	url = '/syndicate/sync'
	def get(self):
		feeds = Feed.all().filter('next <', datetime.now()).fetch(100)
		rpcs = {}
		for feed in feeds:
			rpc = urlfetch.create_rpc()
			urlfetch.make_fetch_call(rpc, feed.url)
			rpcs[rpc] = feed
		for rpc, feed in rpcs.iteritems():
			rpc.wait()
			#raw  = common.fetch(feed.url).content
			raw  = rpc.get_result().content
			soup = BeautifulSoup(raw)
			for k, v in props.iteritems():
				matches = soup.findAll(v)
				for i in getattr(feed, k):
					match = matches[i]
					if '//' not in match['src']: #TODO: Just images?
						match['src'] = '%s/%s' % (feed.url,match['src'])
					del match['style'], match['height'], \
						match['width'], match['onload']
					record = Record.get_or_insert(str(match)[-50:],
							feed=feed, html=unicode(match))
			feed.save()
		self.response.out.write('updated %s' % [f.url for f in feeds])

main = common.setup(Sync, Main)
if __name__ == '__main__': main()
