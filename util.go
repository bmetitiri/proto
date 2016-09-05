package main

import (
	"log"
	"os"
	"syscall"
	"unsafe"
)

type Message struct {
	Type string
	Data []byte `omitempty`
	Row  int    `omitempty`
	Col  int    `omitempty`
}

// Ref: https://github.com/kr/pty/pull/10/files
func setSize(f *os.File, row, col int) {
	size := struct{ ws_row, ws_col, ws_xpixel, ws_ypixel uint16 }{
		ws_row: uint16(row),
		ws_col: uint16(col),
	}
	_, _, errno := syscall.Syscall(
		syscall.SYS_IOCTL,
		f.Fd(),
		syscall.TIOCSWINSZ,
		uintptr(unsafe.Pointer(&size)),
	)
	if errno != 0 {
		log.Panic("Got error:", errno, " on setSize: ", f)
	}
}
