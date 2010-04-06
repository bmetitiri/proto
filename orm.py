import ce

def mongo(self, host='localhost', port=27017, collection=None):
	"Switch data management to mongo"
	if not collection: collection = ce.name
	from pymongo import Connection
	ce.db = Connection(host, port)[collection]

def _dict_unicode(d):
	"Utility method to convert dicts to use str keys"
	ret = {}
	for k in d:
		ret[str(k)] = d[k]
	return ret
	 
class Field(object):
	"Persistable data field"
	def type_check(self, value):
		"Default validation against defined type"
		if not isinstance(value, self.type) and value != None:
			raise TypeError('Expected %s: got %s' % (self.type, type(value)))
	def __init__(self, type, validator=None, default=None):
		"Takes a built-in Python type, and optionally a default value"
		self.type = type
		self.value = default
	def __repr__(self):
		return 'This is an unset %s field.' % self.type

class _Cursor(object):
	"Iterable that creates object types"
	def __init__(self, cls, data):
		self.cls  = cls #class is a no-no word
		self.data = data
	def __getitem__(self, index):
		ret = self.data[index]
		if isinstance(ret, dict):
			return self.cls(**_dict_unicode(ret))
		else:
			return [self.cls(**_dict_unicode(i)) for i in ret]
	def __iter__(self): return self
	def next(self):
		return self.cls(**_dict_unicode(self.data.next()))
#	def sort(self, *args, **kwargs):
#		self.data = self.data.sort(*args, **kwargs)
#		return self

class Model(object):
	@classmethod
	def find(cls, *args, **kwargs):
		"Takes a set of keywords and/or dictionary relating to object fields"
		if len(args): kwargs.update(args[0])
		cursor = ce.db[cls.__name__.lower()].find(kwargs)
		return _Cursor(cls, cursor)

	@classmethod
	def fields(cls):
		"Returns a list of Field objects from Model subclass"
		if not hasattr(cls, '_field_cache'):
			cls._field_cache = {}
			for f in cls.__dict__:
				if isinstance(cls.__dict__[f], Field):
					cls._field_cache[f] = cls.__dict__[f]
		return cls._field_cache.copy()

	def _getter(self, name):
		def _get(self):
			return self.fields[name]
		return _get

	def _setter(self, name, validator):
		def _set(self, value):
			validator(value)
			self.fields[name] = value
			return self.fields[name]
		return _set

	def __init__(self, validator = None, **kwargs):
		"Takes keyword arguments to pre-populate the object fields"
		self.fields = self.fields()
		for f in self.fields:
			if not validator: validator = self.fields[f].type_check
			setattr(self.__class__, f, property(self._getter(f),
				self._setter(f, validator)))
			if f in kwargs: setattr(self, f, kwargs[f])
			else:           setattr(self, f, self.fields[f].value)
		if '_id' in kwargs: self._id = kwargs['_id']

	def save(self):
		"Insert/update object into database (based on id)"
		if self.id: self.fields['_id'] = self.id
		self._id = ce.db[self.__class__.__name__.lower()].insert(self.fields)
		return self

	def __repr__(self):
		"Prints out type, id if available, and 40 characters of fields"
		body = '; '.join(['%s: %s' %(k, getattr(self, k))
			for k in self.fields])
		if len(body) > 43: body = body[:40] + '...'
		return '<%s[%s]:{%s}>' % (self.__class__.__name__, self.id, body)

	@property
	def id(self):
		"Read-only access to the object id once object is saved"
		return hasattr(self, '_id') and self._id or None

	def delete(self):
		"Remove object from database"
		if self.id: ce.db[self.__class__.__name__.lower()].remove(self.id)
