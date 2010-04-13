from google.appengine.ext.webapp import  WSGIApplication, util
import vertex, common

application = WSGIApplication([
		('/edit(?P<url>/[a-z\d-]*)' + common.SERIAL_URL, vertex.VertexEdit),
		('(?P<url>/[a-z\d-]*)'      + common.SERIAL_URL, vertex.VertexView),
		('(?P<url>/.*)', vertex.RedirectView),
	], debug=True)

def main(): util.run_wsgi_app(application)
if __name__ == "__main__": main()
