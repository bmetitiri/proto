package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/user"
	"path"
	"strconv"
	"sync"

	"github.com/kabukky/httpscerts"
	"github.com/toqueteos/webbrowser"
)

const (
	configPath = ".config/indigo"
)

var (
	config, host, style string
	httpPort, httpsPort int
	open                bool
)

func init() {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	if port == 0 {
		port = 8080
	}
	flag.StringVar(&config, "config", "", "set the config path (default \"~/"+configPath+"\")")
	flag.StringVar(&host, "host", "0.0.0.0", "set the HTTP(S) host")
	flag.IntVar(&httpPort, "http", port, "set the HTTP port, disable with 0")
	flag.IntVar(&httpsPort, "https", 0, "set the HTTPS port")
	flag.BoolVar(&open, "open", false, "open the served root in browser")
	flag.StringVar(&style, "style", "github-v2", "select a style from tiny.cc/csses")
}

func configure() {
	usr, err := user.Current()
	if err != nil {
		log.Fatal(err)
	}
	if config == "" {
		config = path.Join(usr.HomeDir, configPath)
	}
	if err := os.MkdirAll(config, 0700); err != nil {
		log.Fatal(err.Error())
	}
}

func serveHttps(host string) {
	configure()
	cert := path.Join(config, "cert.pem")
	key := path.Join(config, "key.pem")
	if err := httpscerts.Check(cert, key); err != nil {
		if err = httpscerts.Generate(cert, key, host); err != nil {
			log.Fatal(err.Error())
		}
	}
	fmt.Println("Listening on https://" + host)
	if err := http.ListenAndServeTLS(host, cert, key, nil); err != nil {
		log.Fatal(err.Error())
	}
}

func serveHttp(host string) {
	fmt.Println("Listening on http://" + host)
	if err := http.ListenAndServe(host, nil); err != nil {
		log.Fatal(err.Error())
	}
}

func main() {
	flag.Parse()
	wg := sync.WaitGroup{}
	if httpsPort != 0 {
		wg.Add(1)
		host := fmt.Sprintf("%v:%v", host, httpsPort)
		go func() {
			defer wg.Done()
			serveHttps(host)
		}()
		if open {
			webbrowser.Open("https://" + host)
		}
	}
	if httpPort != 0 {
		wg.Add(1)
		host := fmt.Sprintf("%v:%v", host, httpPort)
		go func() {
			defer wg.Done()
			serveHttp(host)
		}()
		if open {
			webbrowser.Open("http://" + host)
		}
	}
	wg.Wait()
}
