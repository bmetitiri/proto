package main

import (
	"github.com/nsf/termbox-go"
	"regexp"
	"strconv"
)

type Format struct {
	Bg   termbox.Attribute
	Fg   termbox.Attribute
	Text string
}

var escape = regexp.MustCompile(`\x{001b}\[(\d+)m`)

func Parse(s string) ([]Format, string) {
	f := []Format{}
	text := ""
	e := escape.FindAllStringSubmatchIndex(s, -1)
	if len(e) > 0 {
		for i, a := range e {
			Fg := termbox.ColorDefault
			Bg := termbox.ColorDefault
			style, _ := strconv.Atoi(s[a[2]:a[3]])
			switch {
			case style == 1:
				Fg = termbox.AttrBold
			case style == 4:
				Fg = termbox.AttrUnderline
			case style == 7:
				Fg = termbox.AttrReverse
			case style > 30 && style < 40:
				Fg = termbox.Attribute(style - 29)
			case style > 40 && style < 50:
				Bg = termbox.Attribute(style - 39)
			}
			var t string
			if i < len(e)-1 {
				t = s[a[1]:e[i+1][0]]
				f = append(f, Format{Text: t, Fg: Fg, Bg: Bg})
			} else {
				t = s[a[1]:]
				f = append(f, Format{Text: t, Fg: Fg, Bg: Bg})
			}
			text = text + t
		}
	} else {
		text = s
		f = append(f, Format{Text: text, Fg: termbox.ColorDefault, Bg: termbox.ColorDefault})
	}
	return f, text
}
