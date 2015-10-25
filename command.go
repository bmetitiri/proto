package hackyslack

import (
	"strings"

	"appengine"
	"appengine/urlfetch"
)

type Command struct {
	TeamId      string
	TeamDomain  string
	ChannelId   string
	ChannelName string
	UserId      string
	UserName    string
	Text        string

	context appengine.Context
	token   Token
	write   func([]byte) (int, error)
}

func (cmd *Command) Say(text string) int {
	if cmd.token.Write == "" {
		return 401
	}
	if cmd.ChannelName == "directmessage" {
		return 404
	}
	client := urlfetch.Client(cmd.context)
	url := "https://" + cmd.TeamDomain + ".slack.com/services/hooks/slackbot?token=" + cmd.token.Write + "&channel=%23" + cmd.ChannelName
	resp, _ := client.Post(url, "text/plain", strings.NewReader(text))
	if resp == nil {
		return 502
	}
	return resp.StatusCode
}

func (cmd *Command) Write(text string) {
	cmd.write([]byte(text))
}
