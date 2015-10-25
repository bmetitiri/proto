###[hackyslack](http://hacky-slack.appspot.com/)

[Google App Engine](https://appengine.google.com) powered [Slack](https://slack.com) commands.

####Current commands:

 - /roll XdY - Roll X Y-sided dice and have @slackbot message the result. Defaults to 2d6.

####How to add a command:

 - Fork this repo.
 - Add a command.\*.go file similar to [command.roll.go](/command.roll.go)
 - Update this [README.md](/README.md) to reflect it.
 - Submit a pull requrest.
