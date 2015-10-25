package hackyslack

import (
	"net/http"
	"reflect"
	"strings"

	"appengine"
)

type Router struct {
	methods map[string]int
}

func (rt *Router) Route(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	t := Token{
		Read:    r.FormValue("token"),
		context: c,
	}
	t.Get()
	cmd := Command{
		TeamId:      r.FormValue("team_id"),
		TeamDomain:  r.FormValue("team_domain"),
		ChannelId:   r.FormValue("channel_id"),
		ChannelName: r.FormValue("channel_name"),
		UserId:      r.FormValue("user_id"),
		UserName:    r.FormValue("user_name"),
		Text:        r.FormValue("text"),
		context:     c,
		token:       t,
		write:       w.Write,
	}
	if m, ok := rt.methods[r.FormValue("command")[1:]]; ok {
		c := reflect.ValueOf(cmd)
		c.Method(m).Call(nil)
	}
}

func NewRouter() Router {
	rt := Router{}
	rt.methods = map[string]int{}
	c := reflect.TypeOf(Command{})
	for i := 0; i < c.NumMethod(); i++ {
		m := c.Method(i)
		rt.methods[strings.ToLower(m.Name)] = i
	}
	return rt
}
