package hackyslack

import (
	"appengine"
	"appengine/datastore"
	"appengine/memcache"
)

type Token struct {
	Read    string
	Write   string
	context appengine.Context
}

func (t Token) key() *datastore.Key {
	return datastore.NewKey(t.context, "Token", t.Read, 0, nil)
}

func (t *Token) cache() {
	item := &memcache.Item{
		Key:   t.Read,
		Value: []byte(t.Write),
	}
	memcache.Set(t.context, item)
}

func (t *Token) Get() {
	i, e := memcache.Get(t.context, t.Read)
	if e == nil {
		t.Write = string(i.Value)
		return
	}
	e = datastore.Get(t.context, t.key(), t)
	if e == nil {
		t.cache()
	}
}

func (t *Token) Add() {
	t.cache()
	datastore.Put(t.context, t.key(), &t)
}

func (t *Token) Remove() {
	memcache.Delete(t.context, t.Read)
	datastore.Delete(t.context, t.key())
}
