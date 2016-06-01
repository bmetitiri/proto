package main

import (
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"regexp"
	"strings"

	"github.com/shurcooL/github_flavored_markdown"
)

var (
	image    = regexp.MustCompile(`(?i)\.(png|bmp|jpe?g)$`)
	markdown = regexp.MustCompile(`(?i)\.(md|markdown)$`)
)

type Link struct {
	Name string
	Path string
}

type View struct {
	Path    []Link
	Folders []os.FileInfo
	Files   []os.FileInfo
	File    os.FileInfo
	Content string
	Render  template.HTML
}

func init() {
	http.HandleFunc("/", handler)
}

func newView(path string, fi os.FileInfo) *View {
	v := View{}
	url := strings.Split(path, "/")
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

func handler(w http.ResponseWriter, r *http.Request) {
	file, err := os.Open(path.Join(".", r.URL.Path))
	defer file.Close()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fi, err := file.Stat()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if fi.IsDir() {
		// Redirect if in a directory without trailing slash (e.g. symlink).
		if r.URL.Path[len(r.URL.Path)-1:] != "/" {
			http.Redirect(w, r, r.URL.Path+"/", 301)
			return
		}
		files, err := file.Readdir(-1)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		v := newView(r.URL.Path, fi)
		for _, f := range files {
			if f.IsDir() {
				v.Folders = append(v.Folders, f)
			} else {
				v.Files = append(v.Files, f)
			}
		}
		if err := indexTemplate.Execute(w, v); err != nil {
			log.Print(err)
		}
	} else if r.URL.RawQuery == "view" {
		v := newView(r.URL.Path, fi)
		v.File = fi
		content, err := ioutil.ReadAll(file)
		// TODO: Break out rendering.
		if image.MatchString(fi.Name()) {
			v.Render = template.HTML(
				fmt.Sprintf(`<img class="render" src="%s">`, fi.Name()))
		} else if markdown.MatchString(fi.Name()) {
			v.Render = template.HTML(
				fmt.Sprintf(`<article class="render">%s</article>`,
					string(github_flavored_markdown.Markdown(content))))
		} else {
			v.Content = string(content)
		}
		if err != nil {
			log.Print(err)
		}
		if err := indexTemplate.Execute(w, v); err != nil {
			log.Print(err)
		}
	} else {
		http.ServeContent(w, r, fi.Name(), fi.ModTime(), file)
	}
}
