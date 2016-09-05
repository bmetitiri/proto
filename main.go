package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"golang.org/x/net/websocket"
)

var (
	command string
	port    int
)

func init() {
	flag.StringVar(&command, "cmd", "bash", "set the command")
	flag.IntVar(&port, "port", 8080, "set the HTTP port")
}

func main() {
	flag.Parse()
	http.Handle("/pty", websocket.Handler(ptyHandler))
	http.Handle("/", http.FileServer(http.Dir(".")))
	err := http.ListenAndServe(fmt.Sprint(":", port), nil)
	if err != nil {
		log.Fatal("Failed to listen: ", err)
	}
}
