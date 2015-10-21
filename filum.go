package main

import (
	"github.com/nsf/termbox-go"
	"regexp"
)

type Filum struct {
	X      int
	Y      int
	W      int
	H      int
	Raw    []string
	filter Edit
	match  [][]Format
	re     *regexp.Regexp
}

func (f *Filum) HandleKey(e termbox.Event) bool {
	if e.Key == termbox.KeyCtrlC {
		return false
	} else if f.filter.HandleKey(e) {
		re, _ := regexp.Compile(f.filter.Text)
		f.re = re
	}
	return true
}

func (f *Filum) Refresh() {
	termbox.Clear(termbox.ColorDefault, termbox.ColorDefault)
	defer termbox.Flush()
	h := f.H - 1
	f.write(0, h, ">", termbox.ColorDefault, termbox.ColorDefault)
	if f.re != nil {
		f.write(2, h, f.filter.Text, termbox.ColorDefault, termbox.ColorDefault)
	} else {
		f.write(2, h, f.filter.Text, termbox.ColorRed, termbox.ColorDefault)
	}
	termbox.SetCursor(2+f.filter.Cursor, f.H-1)
	// TODO: Only refilter when dirty.
	f.refilter()
	for i, l := range f.match {
		offset := 0
		for _, m := range l {
			f.write(offset, len(f.match)-i-1, m.Text, m.Fg, m.Bg)
			offset += len(m.Text)
		}
	}
}

func (f *Filum) refilter() {
	f.match = [][]Format{}
	for i := len(f.Raw) - 1; i >= 0; i-- {
		format, raw := Parse(f.Raw[i])
		if f.re != nil {
			match := f.re.FindStringIndex(raw)
			if match != nil {
				f.match = append(f.match, format)
			}
		} else {
			f.match = append(f.match, format)
		}
		if len(f.match) >= f.H-1 {
			break
		}
	}
}

func (f *Filum) write(x, y int, line string, Fg, Bg termbox.Attribute) {
	for _, c := range line {
		if c == '\t' {
			x = (x/8 + 1) * 8
		} else {
			termbox.SetCell(f.X+x, f.Y+y, c, Fg, Bg)
			x++
		}
	}
}
