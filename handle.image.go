package main

import (
	"fmt"
	"html/template"
	"regexp"
)

func init() {
	register(regexp.MustCompile(`(?i)\.(png|bmp|jpe?g)$`), func(v *View) {
		v.HTML = template.HTML(
			fmt.Sprintf(`<img class="render" src="%s">`, v.Info.Name()))
	})
}
