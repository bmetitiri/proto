package main

import (
	"bufio"
	"fmt"
	"github.com/nsf/termbox-go"
	"os"
)

func GetEventCh() <-chan termbox.Event {
	event := make(chan termbox.Event)
	go func() {
		for {
			event <- termbox.PollEvent()
		}
	}()
	return event
}

func GetInputCh() <-chan string {
	input := make(chan string)
	stat, _ := os.Stdin.Stat()
	if (stat.Mode() & os.ModeCharDevice) != 0 {
		return nil
	}
	go func() {
		reader := bufio.NewReader(os.Stdin)
		for {
			line, err := reader.ReadString('\n')
			if err != nil {
				break
			}
			input <- line
		}
	}()
	return input
}

func main() {
	input := GetInputCh()
	if input == nil {
		fmt.Println("Usage: [command |] filum [< input_file]")
		return
	}
	termbox.Init()
	defer termbox.Close()
	event := GetEventCh()
	w, h := termbox.Size()
	f := Filum{W: w, H: h}
	f.Refresh()
main:
	for {
		select {
		case e := <-event:
			switch e.Type {
			case termbox.EventKey:
				if !f.HandleKey(e) {
					break main
				}
			case termbox.EventResize:
				f.W = e.Width
				f.H = e.Height
			}
			f.Refresh()
		case l := <-input:
			f.Raw = append(f.Raw, l)
			f.Refresh()
		}
	}
}
