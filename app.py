import sys, os.path, ce, web

def _google():
	from google.appengine.ext.webapp.util import run_wsgi_app
	def _main(): run_wsgi_app(web.wsgi_router)
	def _server():
		"Google development server"
		from google.appengine.api import \
			apiproxy_stub_map, datastore_file_stub
		from google.appengine.tools import dev_appserver_main
		apiproxy_stub_map.apiproxy = apiproxy_stub_map.APIProxyStubMap()
		apiproxy_stub_map.apiproxy.RegisterStub(
			'datastore_v3', datastore_file_stub.DatastoreFileStub(
			'app', os.path.join(ce._path, 'app.data'),
			os.path.join(ce._path, 'app.log')))
		dev_appserver_main.main([sys.argv[0], ce._path, '-p', ce.port])
	ce._main   = _main
	ce._server = _server

def _tornado():
	import tornado.httpserver
	import tornado.ioloop
	import tornado.wsgi

	def _main(): pass
	def _server():
		http_server = tornado.httpserver.HTTPServer(
				tornado.wsgi.WSGIContainer(web.wsgi_router))
		http_server.listen(ce.port)
		tornado.ioloop.IOLoop.instance().start()

	ce._main   = _main
	ce._server = _server

platforms = {ce.GOOGLE: _google, ce.TORNADO: _tornado}

def shell(name):
	"Generic shell (Uses IPython if available)"
	try:
		from IPython.Shell import IPShellEmbed
		IPShellEmbed()(header='%s (IPython Shell)' % name)
	except:
		import code
		code.interact('%s (Shell)' % name)

def main(platform, modules=None, path=None, name='Project', port=8080):
	"Request handling switcher based on defined platform"
	if hasattr(ce, '_main'): return ce._main
	ce.platform = platform
	ce.port     = port
	if modules:
		ce._modules = {}
		if hasattr(modules, '__iter__'):
			for m in modules: ce._modules[m] = __import__(m)
		else: ce._modules[modules] = __import__(modules)
	if not path:
		path = os.path.abspath(os.path.dirname(
			os.path.join(os.getcwd(), sys.argv[0])))
	ce._path = path
	try:
		platforms[ce.platform]()
	except:
		print '%s is not a recognized enviroment' % platform
		sys.exit(1)
	if len(sys.argv) == 1:
		print 'Usage: %s (server|shell)' % sys.argv[0]
	elif sys.argv[1] == 'shell':
		shell(name)
		sys.exit(0)
	elif sys.argv[1] == 'server':
		ce._server()
		sys.exit(0)
	return ce._main
