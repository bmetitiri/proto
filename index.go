package tinynote

import (
	"google.golang.org/appengine"
	"google.golang.org/appengine/user"
	"html/template"
	"net/http"
)

var templates = template.Must(template.ParseGlob("template/*.html"))

type Session struct {
	User   *user.User
	Login  string
	Logout string
}

func init() {
	http.HandleFunc("/", index)
	http.HandleFunc("/logout", logout)
}

func index(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	u := user.Current(c)
	if u == nil {
		login, _ := user.LoginURL(c, "/")
		templates.ExecuteTemplate(w, "index.html", Session{Login: login})
		return
	}
	s := Session{Logout: "/logout", User: u}
	templates.ExecuteTemplate(w, "account.html", s)
}

func logout(w http.ResponseWriter, r *http.Request) {
	c := &http.Cookie{
		Name:   "ACSID",
		MaxAge: -1,
	}
	http.SetCookie(w, c)
	sc := &http.Cookie{
		Name:   "SACSID",
		MaxAge: -1,
	}
	http.SetCookie(w, sc)
	dc := &http.Cookie{
		Name:   "dev_appserver_login",
		MaxAge: -1,
	}
	http.SetCookie(w, dc)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}
