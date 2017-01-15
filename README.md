tinynote [![CircleCI](https://circleci.com/gh/arkie/tinynote.svg?style=shield)](https://circleci.com/gh/arkie/tinynote)
--------

A small AppEngine utility for keeping notes and copying password fields, with a
bookmarklet to open on any site.

Notes from using the [aetest](https://cloud.google.com/appengine/docs/go/tools/localunittesting/#Go_Introducing_the_aetest_package) package with [CircleCI](https://circleci.com/gh/arkie/tinynote/) continuous deployment:
 - Added `APPENGINE_TOKEN` to `Environment Variables` with the value of the `refresh_token` from `$HOME/.appcfg_oauth2_tokens`
 - Overrode the `test` from the default to using the downloaded `go_appengine_sdk` command `goapp test` to avoid `gcloud component` issues.
 - Updated the `deployment` command to point to the directory `app.yaml` is in (`.` in this case).
