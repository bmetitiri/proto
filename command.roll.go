package hackyslack

import (
	"math/rand"
	"strconv"
	"time"
)

func (cmd Command) Roll() {
	rand.Seed(time.Now().UnixNano())
	s := cmd.Say("@" + cmd.UserName + " rolled 2d6 for a total of " + strconv.Itoa(rand.Intn(6)+rand.Intn(6)+2))
	if s == 404 {
		cmd.Write("error rolling dice: not in channel")
	} else if s != 200 {
		cmd.Write("error rolling dice: " + strconv.Itoa(s))
	}
}
