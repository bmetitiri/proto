package main

import (
	"github.com/nsf/termbox-go"
	"regexp"
	"time"
)

type Filum struct {
	X      int
	Y      int
	W      int
	H      int
	filter Edit
	freeze bool
	corpus []row
	match  []row
	focus  int
	re     *regexp.Regexp
}

type row struct {
	marker bool
	format []Format
	text   string
}

func (f *Filum) Add(s string) {
	format, text := Parse(s)
	f.corpus = append(f.corpus, row{
		format: format,
		text:   text,
	})
}

var block = Format{
	Text:       " ▚▚▚▚ ",
	Foreground: termbox.ColorRed,
}

func (f *Filum) HandleKey(e termbox.Event) bool {
	switch e.Key {
	case termbox.KeyCtrlK, termbox.KeyArrowUp:
		if f.focus < len(f.match) {
			f.focus++
		}
	case termbox.KeyCtrlJ, termbox.KeyArrowDown:
		if f.focus > 0 {
			f.focus--
		}
	case termbox.KeyEnter:
		f.corpus = append(f.corpus, row{
			marker: true,
			format: []Format{
				block,
				Format{
					Text: time.Now().Format("15:04:05"),
				},
				block,
				Format{
					Text: f.filter.Text,
				},
			},
		})
	case termbox.KeyCtrlS:
		f.freeze = true
	case termbox.KeyCtrlQ:
		f.freeze = false
	case termbox.KeyCtrlC:
		return false
	default:
		if f.filter.HandleKey(e) {
			re, _ := regexp.Compile(f.filter.Text)
			f.re = re
		}
	}
	return true
}

func (f *Filum) Refresh() {
	termbox.Clear(termbox.ColorDefault, termbox.ColorDefault)
	defer termbox.Flush()
	h := f.H - 1
	f.write(0, h, ">", termbox.ColorDefault, termbox.ColorDefault)
	color := termbox.ColorDefault
	if f.re == nil {
		color = termbox.ColorRed
	}
	f.write(2, h, f.filter.Text, color, termbox.ColorDefault)
	termbox.SetCursor(2+f.filter.Cursor, f.H-1)
	// TODO: Only refilter when dirty.
	f.refilter()
	for i, l := range f.match {
		x := 0
		for _, m := range l.format {
			x = f.write(x, len(f.match)-i-1, m.Text, m.Foreground, m.Background)
		}
	}
	if f.focus > 0 && f.focus <= len(f.match) {
		f.alert(len(f.match)-f.focus, f.match[f.focus-1].text)
	}
}

// TODO: Investigate sharing parts with Filum.write
func (f *Filum) alert(y int, text string) {
	lines := []string{}
	line := []rune{}
	for i, c := range text {
		if c == '\t' {
			l := len(line)
			for i := l; i < (l/8+1)*8; i++ {
				line = append(line, ' ')
			}
		} else {
			line = append(line, c)
		}
		if len(line) > f.W || i >= len(text)-1 {
			lines = append(lines, string(line))
			line = []rune{}
		}
	}
	if y+len(lines) >= f.H {
		y = f.H - len(lines) - 1
	}
	for i, l := range lines {
		f.write(0, y+i, l, termbox.AttrReverse, termbox.ColorDefault)
	}
}

func (f *Filum) refilter() {
	if f.freeze {
		return
	}
	f.match = []row{}
	for i := len(f.corpus) - 1; i >= 0; i-- {
		r := f.corpus[i]
		if f.re != nil {
			match := f.re.FindStringIndex(r.text)
			if match != nil || r.marker {
				f.match = append(f.match, r)
			}
		} else {
			f.match = append(f.match, r)
		}
		if len(f.match) >= f.H-1 {
			break
		}
	}
}

func (f *Filum) write(x, y int, line string, fg, bg termbox.Attribute) int {
	for _, c := range line {
		if c == '\t' {
			stop := (x/8 + 1) * 8
			for ; x < stop; x++ {
				termbox.SetCell(f.X+x, f.Y+y, ' ', fg, bg)
			}
		} else {
			termbox.SetCell(f.X+x, f.Y+y, c, fg, bg)
			x++
		}
	}
	return x
}
