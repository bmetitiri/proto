package main

import (
	"fmt"
	"regexp"
)

func init() {
	register(regexp.MustCompile(`(?i)\.(bmp|gif|jpe?g|png)$`),
		func(v *View) (error, string) {
			return nil, fmt.Sprintf(`<img class="render" src="%s">`, v.Info.Name())
		})
}
