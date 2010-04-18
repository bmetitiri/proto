from google.appengine.ext.webapp import  WSGIApplication, template, util
from google.appengine.ext import db, webapp
import new, urllib, __builtin__

class Shill(db.Model, webapp.RequestHandler):
	def get(self, key):
		key   = urllib.unquote(key)
		self.render({'key':key})
	def post(self, key):
		world    = {'__builtins__':__builtin__, 'db':db}
		module    = self.request.get('module').replace('\r\n', '\n')
		input = self.request.get('input').replace('\r\n', '\n')
		exec module in world
		if input.strip():
			output   = eval(input, world)
			if isinstance(output, unicode):
				output = "u'%s'" % output
			elif isinstance(output, basestring):
				output = "'%s'" % output
			else:
				output = str(output)
			output     = '&gt;&gt;&gt; ' + input + '<br />' + output
		else:
			output     = '&gt;&gt;&gt;'
		self.render({'key':key, 'module':module, 'output':output})
	def render(self, values=None):
		if not values: values={}
		self.response.headers['Content-Type'] = 'text/html'
		out = template.render('shill.html', values)
		self.response.out.write(out)

application = WSGIApplication([
		('/(?P<key>.*)', Shill),
	], debug=True)

def main(): util.run_wsgi_app(application)
if __name__ == '__main__': main()
