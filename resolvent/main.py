import common, logging

class Resolution(common.db.Model):
	user   = common.db.UserProperty(auto_current_user_add=True)
	name   = common.db.StringProperty()
	date   = common.db.DateTimeProperty(auto_now_add=True)
	public = common.db.BooleanProperty()

class Main(common.Page):
	url = '/.*'
	def get(self):
		if self.user: resolutions=Resolution.all().filter('user =', self.user)
		else: resolutions=Resolution.all().filter('public =', True)
		self.out(resolutions=resolutions)
	def post(self):
		if self.user:
			if self.request.get('method') == 'add':
				self.process(Resolution()).save()
		self.redirect('')

main = common.setup(Main)
if __name__ == '__main__': main()
