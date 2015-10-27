package main

import (
	"bufio"
	"flag"
	"fmt"
	"github.com/kr/pty"
	"github.com/nsf/termbox-go"
	"io"
	"os"
	"os/exec"
)

func EventCh() <-chan termbox.Event {
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

func InputCh(args []string, pt bool) <-chan string {
	stat, _ := os.Stdin.Stat()
	stdin := (stat.Mode() & os.ModeCharDevice) == 0
	if !stdin && len(args) == 0 {
		return nil
	}
	input := make(chan string, 1024)
	if stdin {
		go read(os.Stdin, input)
	}
	if len(args) > 0 {
		cmd := exec.Command(args[0], args[1:]...)
		var e error
		if pt {
			f, err := pty.Start(cmd)
			e = err
			go read(f, input)
		} else {
			cmdout, _ := cmd.StdoutPipe()
			cmderr, _ := cmd.StderrPipe()
			go read(cmdout, input)
			go read(cmderr, input)
			e = cmd.Start()
		}
		if e != nil {
			fmt.Println(e.Error())
			return nil
		}
	}
	return input
}

func main() {
	pt := flag.Bool("p", false, "Use a pseudoterminal to run command.")
	help := flag.Bool("h", false, "Print this message.")
	flag.Parse()
	input := InputCh(flag.Args(), *pt)
	if input == nil || *help {
		fmt.Println("Usage: [command |] filum [-h] [-p] [command] [< input_file]")
		flag.PrintDefaults()
		return
	}
	termbox.Init()
	defer termbox.Close()
	event := EventCh()
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
			f.Add(l)
			if len(input) == 0 {
				f.Refresh()
			}
		}
	}
}
