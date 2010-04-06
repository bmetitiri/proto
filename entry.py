import ni.ce

class Entry(ni.ce.Model):
	name    = ni.ce.persist(basestring)
	content = ni.ce.persist(basestring)
	@ni.ce.url('/')
	def index(io):
		return 'Index, yeah!'
