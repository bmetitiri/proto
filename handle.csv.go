package main

import (
	"bytes"
	"encoding/csv"
	"regexp"
)

func init() {
	register(regexp.MustCompile(`(?i)\.csv$`),
		func(v *View) (error, string) {
			reader := csv.NewReader(v.File)
			buf := bytes.NewBuffer([]byte{})
			err := templates["handle.csv.html"].Execute(buf, reader)
			return err, buf.String()
		})
}
