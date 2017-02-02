package tinynote

import (
	"google.golang.org/appengine"
	"google.golang.org/appengine/user"
	"html/template"
	"log"
	"net/http"
	"net/url"
)

var templates = template.Must(template.ParseGlob("template/*.html"))

type Session struct {
	User   *user.User
	Login  string
	Logout string
	Query  string
	Form   Note
	Notes  []Note
	Error  error
}

func init() {
	http.HandleFunc("/", index)
	http.HandleFunc("/logout", logout)
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

func index(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	u := user.Current(c)
	if u == nil {
		login, _ := user.LoginURL(c, r.URL.String())
		templates.ExecuteTemplate(w, "index.html", Session{Login: login})
		return
	}
	c, err := appengine.Namespace(c, u.ID)
	if err != nil {
		log.Fatalf("Could not get namespace: %v", err)
	}
	s := Session{Logout: "/logout", User: u}
	switch r.FormValue("action") {
	case "💾":
		note := Note{
			Key:      r.FormValue("key"),
			Text:     r.FormValue("text"),
			Password: r.FormValue("password"),
		}
		if err := note.Save(c); err != nil {
			log.Fatalf("Could not save note: %v", err)
		}
		v := url.Values{}
		v.Add("id", note.Key)
		http.Redirect(w, r, "/?"+v.Encode(), http.StatusSeeOther)
		return
	case "❌":
		note := Note{Key: r.FormValue("key")}
		if err := note.Delete(c); err != nil {
			log.Fatalf("Could not delete note: %v", err)
		}
		http.Redirect(w, r, r.URL.String(), http.StatusSeeOther)
		return
	}
	host := r.FormValue("url")
	if host != "" {
		s.Form = Note{Text: host}
		u, err := url.Parse(host)
		if err == nil {
			s.Query = "\"" + u.Host + "\""
		}
	}
	q := r.FormValue("q")
	if q != "" {
		s.Query = q
	}
	ids := r.Form["id"]
	if len(ids) != 0 {
		s.Notes, s.Error = Load(c, ids)
	} else if s.Query != "" {
		s.Notes, s.Error = Search(c, s.Query)
	}
	templates.ExecuteTemplate(w, "account.html", s)
}
