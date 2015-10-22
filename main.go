package main

import (
	"bufio"
	"fmt"
	"github.com/nsf/termbox-go"
	"io"
	"os"
	"os/exec"
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

func read(source io.Reader, input chan<- string) {
	reader := bufio.NewReader(source)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			break
		}
		input <- line
	}
}

func GetInputCh() <-chan string {
	stat, _ := os.Stdin.Stat()
	stdin := (stat.Mode() & os.ModeCharDevice) == 0
	if !stdin && len(os.Args) <= 1 {
		return nil
	}
	input := make(chan string, 1024)
	if stdin {
		go read(os.Stdin, input)
	}
	if len(os.Args) > 1 {
		cmd := exec.Command(os.Args[1], os.Args[2:]...)
		cmdout, _ := cmd.StdoutPipe()
		cmderr, _ := cmd.StderrPipe()
		go read(cmdout, input)
		go read(cmderr, input)
		e := cmd.Start()
		if e != nil {
			fmt.Println(e.Error())
			return nil
		}
	}
	return input
}

func main() {
	input := GetInputCh()
	if input == nil {
		fmt.Println("Usage: [command |] filum [command] [< input_file]")
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
			if len(input) == 0 {
				f.Refresh()
			}
		}
	}
}
