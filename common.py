from google.appengine.api import users
from google.appengine.ext import db, webapp
from google.appengine.ext.webapp import template, util

import os

class Page(webapp.RequestHandler):
	def get(self): self.out()
	def login(self, uri=None):
		return users.create_login_url(uri or self.request.uri)
#		federated_identity='gmail.com')
	def logout(self, uri=None):
		return users.create_logout_url(uri or self.request.uri)
	def out(self, template_file=None, **kwargs):
		self.response.headers['Content-Type'] = 'text/html'
		template_file = template_file or os.path.join('templates',
				self.__class__.__name__.lower()+'.html')
		kwargs['user'] = self.user #Too common for c.
		kwargs['c'] = {
			'logout' : self.logout(),
			'login'  : self.login()
		}
		self.response.out.write(template.render(template_file, kwargs))
	def process(self, instance): #TODO: Process Model class
		for f,t in instance.fields().iteritems():
			v = self.request.get(f)
			if v:
				if t.data_type != basestring: v = t.data_type(v)
				setattr(instance, f, v)
		return instance
	@property
	def user(self):
		if not hasattr(self, '_user'):
			self._user = users.get_current_user()
		return self._user

def setup(*args):
	args = [hasattr(a, 'url') and (a.url, a) or a for a in args]
	application = webapp.WSGIApplication(args)#, debug=True)
	def inner(): return util.run_wsgi_app(application)
	return inner

#application = webapp.WSGIApplication([('/', Main)], debug=True)
#def main(): util.run_wsgi_app(application)
#if __name__ == '__main__': main()
