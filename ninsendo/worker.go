package ninsendo

import (
	"fmt"
	"github.com/arkie/gintendo"
	"golang.org/x/net/context"
	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/mail"
	"google.golang.org/appengine/urlfetch"
	"net/http"
	"time"
)

func init() {
	http.HandleFunc("/worker", worker)
}

func worker(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	c, _ = context.WithTimeout(c, 30*time.Second)
	q := datastore.NewQuery(gameType).Filter("Updated <", time.Now().
		Add(-24*time.Hour)).Limit(10)
	games := []gintendo.Game{}
	_, err := q.GetAll(c, &games)
	if len(games) != 0 {
		log.Infof(c, "Updating %v games", len(games))
	}
	if err != nil {
		log.Errorf(c, err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	client := gintendo.Client{HTTP: urlfetch.Client(c)}
	for _, game := range games {
		new, err := client.Load(game.ID)
		if err != nil {
			log.Errorf(c, err.Error())
			continue
		}
		if new.Price < game.Price || game.Price == 0 {
			alerts := datastore.NewQuery(subscriptionType).Filter("Game =", game.ID)
			subs := []Subscription{}
			_, err := alerts.GetAll(c, &subs)
			if err != nil {
				log.Errorf(c, err.Error())
				continue
			}
			for _, sub := range subs {
				msg := &mail.Message{
					Sender:  "Ninsendo <o@ninsend-o.appspotmail.com>",
					To:      []string{sub.Email},
					Subject: fmt.Sprintf("%v is now priced at $%v", new.Title, new.Price),
					Body:    fmt.Sprintf(gintendo.DetailUrl, new.ID),
				}
				if err := mail.Send(c, msg); err != nil {
					log.Errorf(c, "Couldn't send email: %v", err)
				}
			}
		}
		key := datastore.NewKey(c, gameType, new.ID, 0, nil)
		_, err = datastore.Put(c, key, new)
		if err != nil {
			log.Errorf(c, err.Error())
		}
	}
}
