import ce

class Request(object):
	GET, POST = 'get', 'post'
	def __init__(self, env):
		self.method = env.get('REQUEST_METHOD')
		if self.method: self.method.lower()
		self.agent    = env.get('HTTP_USER_AGENT')
		self.path     = env.get('PATH_INFO')
		self.query    = env.get('QUERY_STRING')
	def __str__(self): return '%s %s%s' % (self.method,
		self.path, self.query and '?%s' % self.query)

class Response(object):
	def __init__(self, headers=None, status='200'):
		self.headers  = headers or {'Content-Type': 'text/plain'}
		self.status   = status

class Handler(object):
	def __init__(self, env):
		self.request  = Request(env)
		self.response = Response()
	def status(self, code=None):
		if code: self.response.status = str(code)
		return self.response.status
	def header(self, name, value=None):
		if value: self.response.headers[name] = value
		return self.response.headers[name]

def error(io, status, message=None):
	if not message:
		message = {404: 'Not Found', 500: 'Server Error'}[status]
	io.status(status)
	return '%s: %s' % (status, message)

def wsgi_router(env, start):
	handler = Handler(env)
	url     = handler.request.path
	try:
		if url in ce.urls:
			body = ce.urls[url](handler)
		else:
			body = error(handler, 404)
	except Exception, e:
		body = error(handler, 500, e)
	start(handler.status(), [(k, handler.response.headers[k])
		for k in handler.response.headers])
	return [body,]

def add_url(url):
	"Decorator around a callable which takes a url path"
	def wrap(fn):
		ce.urls[url] = fn
		return fn
	return wrap
