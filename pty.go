package main

import (
	"io"
	"log"
	"os/exec"

	"github.com/kr/pty"
	"golang.org/x/net/websocket"
)

func ptyHandler(ws *websocket.Conn) {
	defer ws.Close()
	c := exec.Command(command)
	f, err := pty.Start(c)
	defer f.Close()
	if err != nil {
		log.Fatal("Couldm't start command:", err)
	}
	// Copy directly from terminal output to websocket.
	go func() {
		defer ws.Close()
		defer f.Close()
		io.Copy(ws, f)
	}()
	// Parse websocket messages as JSON to handle data, size.
	for {
		var data Message
		if err = websocket.JSON.Receive(ws, &data); err != nil {
			log.Print("Error reading: ", err, ", disconnecting.")
			break
		}
		switch data.Type {
		case "data":
			n, err := f.Write(data.Data)
			if err != nil {
				log.Print("Error writing: ", err, ", disconnecting.")
				break
			}
			if n != len(data.Data) {
				log.Print("Wrote ", n, " out of ", len(data.Data))
			}
		case "size":
			setSize(f, data.Row, data.Col)
		}
	}
}
