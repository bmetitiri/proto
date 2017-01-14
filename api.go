package tinynote

import (
	"encoding/json"
	"golang.org/x/net/context"
	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/search"
	"google.golang.org/appengine/user"
	"net/http"
	"time"
)

const (
	noteType = "note"
)

func init() {
	http.HandleFunc("/add", api(add))
	http.HandleFunc("/search", api(query))
}

type Note struct {
	Key  string    `datastore:"-" json:"key"`
	Text string    `datastore:",noindex" json:"text"`
	Time time.Time `json:"time"`
}

type NoteSearch struct {
	Text search.HTML
}

type response struct {
	Notes []Note `json:"notes,omitempty"`
	Error string `json:"error,omitempty"`
}

type apiFunc func(context.Context, *http.Request) ([]Note, error)

func api(next apiFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		c := appengine.NewContext(r)
		u := user.Current(c)
		if u == nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		c, err := appengine.Namespace(c, u.ID)
		out := response{}
		if err == nil {
			out.Notes, err = next(c, r)
		}
		w.Header().Set("Content-Type", "application/json")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			out.Error = err.Error()
		}
		json.NewEncoder(w).Encode(out)
	}
}

func add(c context.Context, r *http.Request) ([]Note, error) {
	key := datastore.NewIncompleteKey(c, noteType, nil)
	note := Note{Text: r.FormValue("text")}
	key, err := datastore.Put(c, key, &note)
	if err != nil {
		return nil, err
	}
	note.Key = key.Encode()
	index, err := search.Open(noteType)
	if err != nil {
		return nil, err
	}
	_, err = index.Put(c, note.Key, &NoteSearch{
		Text: search.HTML(note.Text),
	})
	if err != nil {
		return nil, err
	}
	return []Note{note}, nil
}

func query(c context.Context, r *http.Request) ([]Note, error) {
	index, err := search.Open(noteType)
	if err != nil {
		return nil, err
	}
	opt := &search.SearchOptions{
		IDsOnly: true,
	}
	keys := []*datastore.Key{}
	for r := index.Search(c, r.FormValue("q"), opt); ; {
		id, err := r.Next(nil)
		if err == search.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		key, err := datastore.DecodeKey(id)
		if err != nil {
			return nil, err
		}
		keys = append(keys, key)
	}
	notes := make([]Note, len(keys))
	err = datastore.GetMulti(c, keys, notes)
	return notes, err
}
