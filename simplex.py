from google.appengine.ext.webapp import  WSGIApplication, util
import vertex, common

VERTEX_RE = '(?P<url>/[a-z\d-]*)'

application = WSGIApplication([
		('/edit' + VERTEX_RE, vertex.VertexEdit),
		(VERTEX_RE + common.SERIAL_URL, vertex.VertexView),
		('(?P<url>/.*)', vertex.RedirectView),
	], debug=True)

def main(): util.run_wsgi_app(application)
if __name__ == "__main__": main()
