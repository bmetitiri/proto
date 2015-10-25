package hackyslack

import (
	"fmt"
	"math/rand"
	"regexp"
	"strconv"
	"time"
)

var dice = regexp.MustCompile(`(\d+)d(\d+)`)

func (cmd Command) Roll() {
	rand.Seed(time.Now().UnixNano())
	m := dice.FindStringSubmatch(cmd.Text)
	num := 2
	sides := 6
	if len(m) > 2 {
		num, _ = strconv.Atoi(m[1])
		sides, _ = strconv.Atoi(m[2])
	}
	total := 0
	for i := 0; i < num; i++ {
		total += rand.Intn(sides)+1
	}
	s := cmd.Say(fmt.Sprint("@", cmd.UserName, " rolled ", num, "d", sides, " for a total of ", total))
	if s == 404 {
		cmd.Write("error rolling dice: not in channel")
	} else if s != 200 {
		cmd.Write("error rolling dice: " + strconv.Itoa(s))
	}
}
