package main

import (
	"github.com/nsf/termbox-go"
)

type Edit struct {
	Text   string
	Cursor int
}

func (ed *Edit) HandleKey(e termbox.Event) bool {
	dirty := false
	switch e.Key {
	case termbox.KeyCtrlA:
		ed.Cursor = 0
	case termbox.KeyCtrlE:
		ed.Cursor = len(ed.Text)
	case termbox.KeyCtrlW:
		pos := ed.Cursor - 1
		word := false
	delete:
		for ; pos >= 0; pos-- {
			switch ed.Text[pos] {
			case '`', '@', '+', '\\', '|', '\'', '"', ',', ' ':
				if word {
					break delete
				}
			default:
				word = true
			}
		}
		pos++
		ed.Text = ed.Text[:pos] + ed.Text[ed.Cursor:]
		ed.Cursor = pos
		dirty = true
	case termbox.KeyArrowLeft:
		if ed.Cursor > 0 {
			ed.Cursor--
		}
	case termbox.KeyArrowRight:
		if ed.Cursor < len(ed.Text) {
			ed.Cursor++
		}
	case termbox.KeyBackspace, termbox.KeyBackspace2:
		if ed.Cursor > 0 {
			ed.Text = ed.Text[:ed.Cursor-1] + ed.Text[ed.Cursor:]
			ed.Cursor--
		}
		dirty = true
	case termbox.KeySpace:
		ed.Text = ed.Text[:ed.Cursor] + " " + ed.Text[ed.Cursor:]
		ed.Cursor++
		dirty = true
	case 0:
		ed.Text = ed.Text[:ed.Cursor] + string(e.Ch) + ed.Text[ed.Cursor:]
		ed.Cursor++
		dirty = true
	}
	return dirty
}
