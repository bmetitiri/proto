// +build ignore
// This file generates `template.go` via `go generate`.

package main

import (
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"text/template"
	"time"
)

const base = "template/"

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	templates := map[string]string{}
	files, err := filepath.Glob(base + "*.html")
	check(err)
	for _, f := range files {
		t, err := ioutil.ReadFile(f)
		templates[f[len(base):]] = string(t)
		check(err)
	}
	file, err := os.Create("gen.template.go")
	check(err)
	tmpl := template.Must(template.ParseFiles("template/template.go"))
	tmpl.Execute(file, map[string]interface{}{
		"Time":      time.Now(),
		"Templates": templates,
	})
	log.Printf("Generated %v", file.Name())
}
