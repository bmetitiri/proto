def serialize(fn):
	def inner(*args):
		ext = args[-1]
		return fn(*args[0:-1])
	return inner

SERIAL_URL = '\.?(?P<ext>html|json|xml)?$'

	########## Regexes ##########
import re
_LINKS     = re.compile(r'([\w+]+://\S+[\w\d/])')
_TAGS      = re.compile(r'(?<![\S])([*_+-])(.+?)\1(?=[\s.!?]|$)')
_PARAGRAPH = re.compile(r'(.+?)(\n\r?\n|$)', re.DOTALL)
def _tags(match):
	MATCHES = {
		'*': ('<strong>', '</strong>'),
		'_': ('<em>',     '</em>'),
		'+': ('<ins>',    '</ins>'),
		'-': ('<del>',    '</del>'),
	}
	tag = MATCHES[match.group(1)]
	return '%s%s%s' % (tag[0], match.group(2), tag[1])
def parse(target):
	target = _LINKS.sub(r'<a href="\1">\1</a>', target)
	target = _PARAGRAPH.sub(r'<p>\1</p>', target) #.replace('\n', '<br />')
	return _TAGS.sub(_tags, target)
