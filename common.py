from google.appengine.api import datastore_types, users
from google.appengine.ext import db, webapp
from google.appengine.ext.webapp import template, util
from google.appengine.api.urlfetch import fetch

import json, logging, os

def log(*args):
	logging.info('-'*40)
	logging.info(*args)
	logging.info('-'*40)

class JSONProperty(db.Property):
	def __init__(self, **kwargs):
		kwargs['indexed'] = False
		super(JSONProperty, self).__init__(**kwargs)
	def get_value_for_datastore(self, value):
		return json.dumps(value)
	def get_value_for_datastore(self, instance):
		return json.loads(super(JSONProperty,
			self).get_value_for_datastore(instance))

class DictProperty(JSONProperty):
	data_type = dict
	def validate(self, value):
		value = super(DictProperty, self).get_value_for_datastore(value)
		if isinstance(value, dict):
			return value
		raise db.BadValueError('Property %s must be a dict.' % self.name)

class Page(webapp.RequestHandler):
	def get(self): self.out()
	def login(self, path=None): #TODO: Switch for uri?
		return users.create_login_url(path or self.request.path)
#		federated_identity='gmail.com')
	def logout(self, path=None):
		return users.create_logout_url(path or self.request.path)
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
		fields = instance.fields()
		for arg in self.request.arguments():
			if arg in fields:
				type = fields[arg].data_type
				if type == list:
					value = [self.type_check(fields[arg].item_type, v)
						for v in self.request.get_all(arg)]
				else: value = self.type_check(type, self.request.get(arg))
			
				setattr(instance, arg, value)
		return instance
	@staticmethod
	def type_check(type, value):
		if type == datastore_types.Link:
			if '://' not in value: value = 'http://'+value
		elif type != basestring: value = type(value)
		return value
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

def from_key(model, key):
	return model.get_by_key_name(key) or model(key_name=key)

#application = webapp.WSGIApplication([('/', Main)], debug=True)
#def main(): util.run_wsgi_app(application)
#if __name__ == '__main__': main()
