import common

class Resolution(common.db.Model):
	user   = common.db.UserProperty(auto_current_user_add=True)
	name   = common.db.StringProperty()
	date   = common.db.DateTimeProperty(auto_now_add=True)
	public = common.db.BooleanProperty()

class Main(common.Page):
	url = '/.*'
	def get(self):
		prev = next = 0
		try:
			page = int(self.request.get('p'))
			if page > 10: page = 10
			if page < 1: page = 1
		except: page = 1
		resolutions = Resolution.all().order('-date')
		if self.user: resolutions.filter('user =', self.user)
		else: resolutions.filter('public =', True)
		resolutions = resolutions.fetch(6, page*5-5)
		if resolutions[5:]: next = page+1
		self.out(next=next, prev=page-1, resolutions=resolutions[:5])
	def post(self):
		if self.user:
			if self.request.get('method') == 'Add':
				self.process(Resolution()).save()
				self.redirect(self.request.path)
			elif self.request.get('method') == 'Give Up':
				resolution = Resolution.get(self.request.get('id'))
				if resolution.user == self.user:
					resolution.delete()
				self.redirect('')

main = common.setup(Main)
if __name__ == '__main__': main()
