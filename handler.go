package main

//go:generate go run template/gen.go

import (
	"log"
	"net/http"
	"os"
	"path"
	"regexp"
)

var (
	handlers = []Handler{}
)

type Handler struct {
	Path   *regexp.Regexp
	Render Renderer
}

type Renderer func(*View) (error, string)

func init() {
	http.HandleFunc("/", handler)
}

func register(re *regexp.Regexp, r Renderer) {
	h := Handler{Path: re, Render: r}
	handlers = append(handlers, h)
}

func check(w http.ResponseWriter, err error) bool {
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return true
	}
	return false
}

func handler(w http.ResponseWriter, r *http.Request) {
	file, err := os.Open(path.Join(".", r.URL.Path))
	defer file.Close()
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	fi, err := file.Stat()
	if check(w, err) {
		return
	}
	if fi.IsDir() {
		// Redirect if in a directory without trailing slash (e.g. symlink).
		if r.URL.Path[len(r.URL.Path)-1:] != "/" {
			http.Redirect(w, r, r.URL.Path+"/", http.StatusMovedPermanently)
			return
		}
		files, err := file.Readdir(-1)
		if check(w, err) {
			return
		}
		v := newView(r.URL.Path, fi, nil)
		for _, f := range files {
			if f.IsDir() {
				v.Folders = append(v.Folders, f)
			} else {
				v.Files = append(v.Files, f)
			}
		}
		if check(w, templates["index.html"].Execute(w, v)) {
			return
		}
	} else if r.URL.RawQuery == "view" {
		v := newView(r.URL.Path, fi, file)
		v.Render()
		if err := templates["index.html"].Execute(w, v); err != nil {
			log.Print(err)
		}
	} else {
		http.ServeContent(w, r, fi.Name(), fi.ModTime(), file)
	}
}
