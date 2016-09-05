package main

import (
	"log"
	"net/http"
	"os"

	"golang.org/x/net/websocket"
)

var (
	command, port string
)

func init() {
	command = os.Getenv("COMMAND")
	if command == "" {
		command = "bash"
	}
	port = os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
}

func main() {
	http.Handle("/pty", websocket.Handler(ptyHandler))
	http.Handle("/", http.FileServer(http.Dir(".")))
	log.Print("Serving ", command, " on :", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal("Failed to listen: ", err)
	}
}
