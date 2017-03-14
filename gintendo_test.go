package gintendo

import (
	"testing"
)

const (
	mario3DS    = "VnTS_u2DBaJ5N-PXEJC-gWWMkSC5Rixm"
	marioTitle  = "Super Mario 3D Land"
	marioSearch = "super mario"
	zeldaSearch = "zelda"
	zeldaSwitch = "GHbaBYuv3zqQeW1CVQlmTSehZ45KTV78"
)

func TestDetail(t *testing.T) {
	game, err := Load(mario3DS)
	if err != nil {
		t.Error(err)
	}
	if game.Title != marioTitle {
		t.Error("Loaded", game.Title, "did not match", marioTitle)
	}
}

func TestSearch(t *testing.T) {
	results, err := Search(marioSearch)
	if err != nil {
		t.Error(err)
	}
	for _, game := range results.Games {
		if game.Title == marioTitle {
			return
		}
	}
	t.Error("Did not find", marioTitle, "in search", marioSearch)
}

func TestSearchSwitch(t *testing.T) {
	results, err := Search(zeldaSearch)
	if err != nil {
		t.Error(err)
	}
	for _, game := range results.Games {
		if game.ID == zeldaSwitch {
			return
		}
	}
	t.Error("Did not find", zeldaSwitch, "in search", zeldaSearch)
}
