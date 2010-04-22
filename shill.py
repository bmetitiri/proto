from google.appengine.ext.webapp import  WSGIApplication, template, util
from google.appengine.ext import db, webapp
from cStringIO import StringIO
import cgi, pickle, sys, traceback, urllib, __builtin__

class Out:
	def __init__(self): self._string = ''
	def write(self, output):
		self._string += output
	def _ignore(self, *args): pass
	def __str__(self):
		string        = self._string
		self._string  = ''
		return string
	seek = flush = readline = _ignore

class History(db.Model):
	input  = db.ListProperty(db.Text)
	output = db.ListProperty(db.Text)
	world  = db.BlobProperty()
	@property
	def html(self):
		out = ''.join(['>>> %s\n%s' % (k, v)
			for k,v in zip(self.input, self.output)])
		return cgi.escape(out).replace('\n', '<br />')
	def append(self, input, output):
		self.input.append(db.Text(input))
		self.output.append(db.Text(output))

class Shill(webapp.RequestHandler):
	def get(self, key):
		key           = urllib.unquote(key)
		self.render({'key':key, 'output':self.history.html})
	def post(self, key):
		world         = {}
#		world['__builtins__'] = __builtin__
		module        = self.request.get('module').replace('\r\n', '\n')
		input         = self.request.get('input').replace('\r\n', '\n')
		oldout        = sys.stdout
		sys.stdout    = Out()
		try:
			code      = compile(module, '(module code)', 'exec')
			exec code in world
		except: print traceback.format_exc()
		modout        = str(sys.stdout)
		if input.strip():
			try:
				world.update(pickle.loads(str(self.history.world)))
				code  = compile(input, '(interactive mode)', 'single')
				exec code in world
			except: print traceback.format_exc()
			output    = str(sys.stdout)
			self.history.append(input, output)
			self.history.world = pickle.dumps(dict([(k, world[k]) for k in
				world if k not in ['__builtins__', 'w']]))
			self.history.put()
		output        = self.history.html
		sys.stdout    = oldout
		if modout:
			output    = '(module init)<br />' + modout + '<br />' + output
		self.render({'key':key, 'module':module, 'output':output})

	@property
	def history(self):
		if not hasattr(self, '_history'):
			key       = self.request.query_string or '(index)'
			self._history = History.get_by_key_name(
					key) or History(key_name=key)
		return self._history
	def render(self, values=None):
		if not values: values={}
		self.response.headers['Content-Type'] = 'text/html'
		out = template.render('shill.html', values)
		self.response.out.write(out)

application = WSGIApplication([
		('/(?P<key>.*)/?edit', Shill),
	], debug=True)

def main(): util.run_wsgi_app(application)
if __name__ == '__main__': main()
