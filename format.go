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

var escape = regexp.MustCompile(`\x{001b}\[(\d+);?(\d*)m`)

func Attribute(style int) termbox.Attribute {
	switch style {
	case 1:
		return termbox.AttrBold
	case 4:
		return termbox.AttrUnderline
	case 7:
		return termbox.AttrReverse
	default:
		return termbox.ColorDefault // 0
	}
}

func Parse(s string) ([]Format, string) {
	f := []Format{}
	text := ""
	e := escape.FindAllStringSubmatchIndex(s, -1)
	if len(e) > 0 {
		for i, a := range e {
			style, _ := strconv.Atoi(s[a[2]:a[3]])
			attr := 0
			if len(a) > 4 {
				attr, _ = strconv.Atoi(s[a[4]:a[5]])
			}
			Fg := Attribute(style) | Attribute(attr)
			Bg := termbox.ColorDefault
			switch {
			case style > 30 && style < 40:
				Fg |= termbox.Attribute(style - 29)
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
