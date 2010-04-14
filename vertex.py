from google.appengine.ext.webapp import template
from google.appengine.ext import db, webapp
import os.path, common

	########## Models ##########
class Vertex(db.Model):
	name    = db.StringProperty()
	content = db.TextProperty()
	html    = db.TextProperty()
	created = db.DateTimeProperty(auto_now_add=True)
	def __init__(self, url, *a, **kw):
		kw['key_name'] = url
		super(Vertex, self).__init__(*a, **kw)
		if not self.name:
			if url == '/': self.name = '(index)'
			else: self.name = url.replace('/', '').replace('-', ' ').title()
		if not self.content: self.content = '(text here)'
	@property
	def data(self):
		return {'vertex':{
			'name'     : self.name,
			'content'  : self.content,
			'created'  : self.created,
		}}
	@property 
	def edit_url(self):
		return '/edit%s' % self.url
	def put(self, *a, **kw):
		super(Vertex, self).save(*a, **kw)
	@property
	def url(self):
		return '%s'      % self.key().name()

	########## Views ##########
class BaseHandler(webapp.RequestHandler):
	def render(self, values):
		self.response.headers['Content-Type'] = 'text/html'
		out = template.render(os.path.join('template',
			self.__class__.__name__)+'.html', values)
		self.response.out.write(out)

class RedirectView(webapp.RequestHandler):
	def get(self, url):
		url = ''.join([l for l in url.lower().replace('%20', '-')
				if l in 'abcdefghijklmnopqrstuvwxyz0123456789-'])
		return self.redirect('/'+url)

class VertexView(BaseHandler):
	@common.serialize
	def get(self, url):
		vertex = Vertex.get_by_key_name(url) or Vertex(url)
		self.render({'vertex': vertex})

class VertexEdit(BaseHandler):
	def get (self, url):
		vertex = Vertex.get_by_key_name(url) or Vertex(url)
		self.render({'vertex': vertex})
	def post(self, url, *a, **kw):
		vertex         = Vertex.get_by_key_name(url) or Vertex(url)
		vertex.name    = self.request.get('name')
		vertex.content = self.request.get('content')
		vertex.put()
		self.redirect(vertex.url)
