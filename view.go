package main

import (
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"os"
	"strings"

	"github.com/sourcegraph/syntaxhighlight"
)

type Link struct {
	Name string
	Path string
}

type View struct {
	Theme   string
	Title   string
	Path    []Link
	Folders []os.FileInfo
	Files   []os.FileInfo
	File    *os.File
	Info    os.FileInfo
	HTML    template.HTML
}

func newView(path string, info os.FileInfo, file *os.File) *View {
	url := strings.Split(path, "/")
	s := len(url) - 3
	title := "/"
	if s <= 1 {
		s = 1
	} else {
		title = ".." + title
	}
	v := View{
		File:  file,
		Theme: style,
		Title: title + strings.Join(url[s:], "/"),
	}
	if file != nil {
		v.Info = info
	}
	base := ""
	for _, f := range url[:len(url)-1] {
		f += "/"
		base += f
		v.Path = append(v.Path, Link{
			Name: f,
			Path: base,
		})
	}
	return &v
}

func (v *View) Read() []byte {
	content, err := ioutil.ReadAll(v.File)
	if err != nil {
		log.Print(err)
	}
	return content
}

func (v *View) Render() {
	for _, h := range handlers {
		if h.Path.MatchString(v.File.Name()) {
			err, html := h.Render(v)
			if err != nil {
				continue
			}
			v.HTML = template.HTML(html)
			return
		}
	}
	s := v.Info.Size()
	if s < 1<<20 { // 1MB
		highlighted, err := syntaxhighlight.AsHTML(v.Read())
		if err != nil {
			log.Print(err)
		}
		v.HTML = template.HTML(`<pre class="prettyprint">` +
			string(highlighted) + `</pre>`)
		return
	}
	v.HTML = template.HTML(fmt.Sprintf("File Size: %v bytes, not rendering.", s))
}
