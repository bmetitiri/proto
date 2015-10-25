package hackyslack

import (
	"appengine"
	"html/template"
	"net/http"
)

var (
	templates = template.Must(template.ParseGlob("*.html"))
)

func index(w http.ResponseWriter, r *http.Request) {
	action := r.FormValue("action")
	t := Token{
		Read:    r.FormValue("read"),
		Write:   r.FormValue("write"),
		context: appengine.NewContext(r),
	}
	if action == "" || t.Read == "" {
		w.Header().Set("Content-Type", "text/html")
		templates.ExecuteTemplate(w, "index.html", nil)
		return
	}
	switch action {
	case "Add":
		t.Add()
	case "Remove":
		t.Remove()
	}
	http.Redirect(w, r, "/", http.StatusFound)
}

func init() {
	r := NewRouter()
	http.HandleFunc("/command", r.Route)
	http.HandleFunc("/", index)
}
