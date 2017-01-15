package tinynote

import (
	"golang.org/x/net/context"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/search"
	"log"
	"time"
)

const (
	noteType = "note"
)

type Note struct {
	Key      string `datastore:"-"`
	Text     string `datastore:",noindex"`
	Password string `datastore:",noindex"`
	Time     time.Time
}

type NoteSearch struct {
	Text string
}

func (n *Note) Save(c context.Context) error {
	var key *datastore.Key
	log.Print(n)
	if n.Key != "" {
		k, err := datastore.DecodeKey(n.Key)
		if err != nil {
			return err
		}
		key = k
	} else {
		key = datastore.NewIncompleteKey(c, noteType, nil)
	}
	key, err := datastore.Put(c, key, n)
	if err != nil {
		return err
	}
	n.Key = key.Encode()
	log.Print(n)
	index, err := search.Open(noteType)
	if err != nil {
		return err
	}
	_, err = index.Put(c, n.Key, &NoteSearch{
		Text: n.Text,
	})
	if err != nil {
		return err
	}
	return nil
}

func (n *Note) Delete(c context.Context) error {
	k, err := datastore.DecodeKey(n.Key)
	if err != nil {
		return err
	}
	index, err := search.Open(noteType)
	if err != nil {
		return err
	}
	if err = index.Delete(c, n.Key); err != nil {
		return err
	}
	if err = datastore.Delete(c, k); err != nil {
		return err
	}
	return nil
}

func Load(c context.Context, ids []string) ([]Note, error) {
	keys := []*datastore.Key{}
	for _, id := range ids {
		key, err := datastore.DecodeKey(id)
		if err != nil {
			return nil, err
		}
		keys = append(keys, key)
	}
	notes := make([]Note, len(keys))
	err := datastore.GetMulti(c, keys, notes)
	if err != nil {
		return nil, err
	}
	for i, k := range keys {
		notes[i].Key = k.Encode()
	}
	return notes, err
}

func Search(c context.Context, q string) ([]Note, error) {
	index, err := search.Open(noteType)
	if err != nil {
		return nil, err
	}
	opt := &search.SearchOptions{
		IDsOnly: true,
	}
	ids := []string{}
	for r := index.Search(c, q, opt); ; {
		id, err := r.Next(nil)
		if err == search.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return Load(c, ids)
}
