package main

import (
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"regexp"
	"strings"
)

var (
	handlers = []Handler{}
)

type Handler struct {
	Path   *regexp.Regexp
	Render func(v *View)
}

type Link struct {
	Name string
	Path string
}

type View struct {
	Title   string
	Path    []Link
	Folders []os.FileInfo
	Files   []os.FileInfo
	File    *os.File
	Info    os.FileInfo
	Content string
	HTML    template.HTML
}

func init() {
	http.HandleFunc("/", handler)
}

func register(re *regexp.Regexp, r func(*View)) {
	h := Handler{Path: re, Render: r}
	handlers = append(handlers, h)
}

func newView(path string, fi os.FileInfo) *View {
	url := strings.Split(path, "/")
	s := len(url) - 3
	title := "/"
	if s <= 1 {
		s = 1
	} else {
		title = ".." + title
	}
	v := View{Title: title + strings.Join(url[s:], "/")}
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
		v.File = file
		v.Info = fi
		v.Render()
		if err := indexTemplate.Execute(w, v); err != nil {
			log.Print(err)
		}
	} else {
		http.ServeContent(w, r, fi.Name(), fi.ModTime(), file)
	}
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
			h.Render(v)
			return
		}
	}
	v.Content = string(v.Read())
}
