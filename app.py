import sys, os.path, ce, time

def first_run():
	if not hasattr(ce._data, 'init'):
		ce._data.init = time.time()
		return True
	return False

def shell(name):
	try:
		from IPython.Shell import IPShellEmbed
		IPShellEmbed()(header='%s (IPython Shell)' % name)
	except:
		import code
		code.interact('%s (Shell)' % name)

def _default_main(): print 'Unhandled request'
ce._data.main = _default_main

def main(platform, path=None, name='Project'):
	ce.platform = platform
	if not first_run(): return
	if not path:
		path = os.path.abspath(os.path.dirname(
			os.path.join(os.getcwd(), sys.argv[0])))
	if len(sys.argv) == 1:
		print 'Usage: %s (server|shell)' % sys.argv[0]

	elif ce.platform == ce.GOOGLE:
		def _google_main():
			from google.appengine.ext import webapp
			from google.appengine.ext.webapp.util import run_wsgi_app
			run_wsgi_app(webapp.WSGIApplication(ce.urls))
		from google.appengine.api import apiproxy_stub_map, datastore_file_stub
		apiproxy_stub_map.apiproxy = apiproxy_stub_map.APIProxyStubMap()
		apiproxy_stub_map.apiproxy.RegisterStub(
			'datastore_v3', datastore_file_stub.DatastoreFileStub(
			'app', os.path.join(path, 'app.data'),
			os.path.join(path, 'app.log')))
		if sys.argv[1] == 'shell': shell(name)
		elif sys.argv[1] == 'server':
			ce._data.main = _google_main
			from google.appengine.tools import dev_appserver_main
			bar = ' -' * 20 + '\n'
			__doc__ = bar + '  (Displaying development server help):\n' \
					+ bar + dev_appserver_main.__doc__
			dev_appserver_main.main([sys.argv[0], path] + sys.argv[2:])

	else:
		print '%s is not a recognized enviroment' % env
	return ce._data.main
