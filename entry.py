import ni.ce

@ni.ce.url('/')
def index(io):
	return 'Index, yeah!'
