package tinynote

import (
	"google.golang.org/appengine/aetest"
	"testing"
)

func equals(t *testing.T, msg string, a interface{}, b interface{}) {
	if a != b {
		t.Errorf("%v: %v != %v", msg, a, b)
	}
}

func TestNote(t *testing.T) {
	c, done, err := aetest.NewContext()
	if err != nil {
		t.Fatal(err)
	}
	defer done()
	n := Note{Text: "This is a test", Password: "This is a password"}
	n.Save(c)
	notes, err := Search(c, "test")
	if err != nil {
		t.Fatal(err)
	}
	equals(t, "Failed Key comparision", n.Key, notes[0].Key)
	equals(t, "Failed Text comparision", n.Text, notes[0].Text)
	equals(t, "Failed Password comparision", n.Password, notes[0].Password)
}
