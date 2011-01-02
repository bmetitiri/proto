from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template, util

import os

def userise(fn):
	def request(self, *args, **kwargs):
		self.user = users.get_current_user()
		if self.user: fn(self, *args, **kwargs)
		else: self.redirect(users.create_login_url(self.request.uri))
	return request

class Page(webapp.RequestHandler):
	def out(self, **kwargs):
		self.response.headers['Content-Type'] = 'text/html'
		template_file = os.path.join(os.path.dirname(__file__),
			self.__class__.__name__.lower()+'.html')
		kwargs['user'] = users.get_current_user()
		self.response.out.write(template.render(template_file, kwargs))
	def get(self): self.out()

class Main(Page):
	@userise
	def get(self): self.out()

application = webapp.WSGIApplication([('/', Main)], debug=True)
def main(): util.run_wsgi_app(application)
if __name__ == '__main__': main()
