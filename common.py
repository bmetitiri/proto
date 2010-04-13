def serialize(fn):
	def inner(*args):
		ext = args[-1]
		return fn(*args[0:-1])
	return inner

SERIAL_URL = '\.?(?P<ext>\w+)?'
