def serialize(fn):
	def inner(*args):
		ext = args[-1]
		return fn(*args[0:-1])
	return inner

SERIAL_URL = '\.?(?P<ext>html|json|xml)?$'

	########## Regexes ##########
import re
_BOLD       = re.compile('\*(.+?)\*')
_ITALIC     = re.compile('\_(.+?)\_')
_STRIKE     = re.compile('\-(.+?)\-')
_INSERT     = re.compile('\+(.+?)\+')

def parse(s):
	s = _BOLD.sub('<strong>\\1</strong>', s)
	s = _ITALIC.sub('<em>\\1</em>',       s)
	s = _STRIKE.sub('<del>\\1</del>',     s)
	s = _INSERT.sub('<ins>\\1</ins>',     s)
	return s
