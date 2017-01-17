package main

import (
	"fmt"
	"regexp"

	"github.com/shurcooL/github_flavored_markdown"
)

func init() {
	register(regexp.MustCompile(`(?i)\.(md|markdown)$`),
		func(v *View) (error, string) {
			return nil, fmt.Sprintf(`<article class="render">%s</article>`,
				string(github_flavored_markdown.Markdown(v.Read())))
		})
}
