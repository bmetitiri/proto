def process(urls):
	import ce
	if ce.platform == ce.GOOGLE:
		from google.appengine.ext import webapp
		Handler = webapp.RequestHandler
