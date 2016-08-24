package ninsendo

import (
	"github.com/arkie/gintendo"
	"golang.org/x/net/context"
	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/urlfetch"
	"google.golang.org/appengine/user"
	"html/template"
	"net/http"
	"time"
)

const (
	gameType         = "game"
	subscriptionType = "subscription"
)

var templates = template.Must(template.ParseGlob("template/*.html"))

// TODO: Add a sent field to prevent resends.
type Subscription struct {
	Game  string
	Email string
}

type Session struct {
	User          *user.User
	Result        *gintendo.Result
	Login         string
	Logout        string
	Query         string
	Subscriptions []gintendo.Game
}

func init() {
	http.HandleFunc("/", index)
	http.HandleFunc("/logout", logout)
}

func subscribe(c context.Context, id string, email string) error {
	// TODO: Cache games in memcache.
	key := datastore.NewKey(c, gameType, id, 0, nil)
	game := gintendo.Game{}
	err := datastore.Get(c, key, &game)
	if err != nil {
		log.Infof(c, "Couldn't load id: %v", id)
		client := gintendo.Client{HTTP: urlfetch.Client(c)}
		game, err := client.Load(id)
		if err != nil {
			return err
		}
		_, err = datastore.Put(c, key, game)
		if err != nil {
			return err
		}
	}
	key = datastore.NewKey(c, subscriptionType, id+":"+email, 0, nil)
	_, err = datastore.Put(c, key, &Subscription{
		Game:  id,
		Email: email,
	})
	return err
}

func logout(w http.ResponseWriter, r *http.Request) {
	c := &http.Cookie{
		Name:   "ACSID",
		MaxAge: -1,
	}
	http.SetCookie(w, c)
	dc := &http.Cookie{
		Name:   "dev_appserver_login",
		MaxAge: -1,
	}
	http.SetCookie(w, dc)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func index(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	c, _ = context.WithTimeout(c, 30*time.Second)
	u := user.Current(c)
	if u == nil {
		login, _ := user.LoginURL(c, "/")
		templates.ExecuteTemplate(w, "index.html", Session{Login: login})
		return
	}
	if r.Method == "POST" {
		r.ParseForm()
		keys := []*datastore.Key{}
		for _, id := range r.Form["remove"] {
			keys = append(keys, datastore.NewKey(
				c, subscriptionType, id+":"+u.Email, 0, nil))
		}
		if len(keys) > 0 {
			if err := datastore.DeleteMulti(c, keys); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
		// TODO: Run as goroutines if appengine supported.
		for _, id := range r.Form["add"] {
			if err := subscribe(c, id, u.Email); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}
	s := Session{Logout: "/logout", User: u, Query: r.FormValue("query")}
	q := datastore.NewQuery(subscriptionType).
		Filter("Email =", u.Email)
	subs := []Subscription{}
	_, err := q.GetAll(c, &subs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	keys := []*datastore.Key{}
	for _, s := range subs {
		keys = append(keys, datastore.NewKey(c, gameType, s.Game, 0, nil))
	}
	s.Subscriptions = make([]gintendo.Game, len(keys))
	err = datastore.GetMulti(c, keys, s.Subscriptions)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if s.Query != "" {
		client := gintendo.Client{HTTP: urlfetch.Client(c)}
		res, err := client.Search(s.Query)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		s.Result = res
	}
	templates.ExecuteTemplate(w, "account.html", s)
}
