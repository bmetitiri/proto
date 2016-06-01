indigo
------

**indigo** is an HTTP(S) <b>in</b>stant <b>di</b>rectory server in <b>go</b>
that generates indexes, syntax highlights code
(using [highlight.js](https://highlightjs.org)), and renders markdown.

Run `go get github.com/arkie/indigo` to install indigo, and then run `indigo`
in any directory to serve locally on HTTP and HTTPS.

```
Usage of indigo:
  -config string
      set the config path (default "~/.config/indigo")
  -host string
      set the HTTP(S) host (default "0.0.0.0")
  -http int
      set the HTTP port, disable with 0 (default 8080)
  -https int
      set the HTTPS port, disable with 0 (default 8443)
  -open
      open the served root in browser
```
