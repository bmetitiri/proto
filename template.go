package main

import (
	"html/template"
)

var (
	indexTemplate = template.Must(template.New("index.html").Parse(indexHTML))
)

const indexHTML = `
<html>
	<head>
		<style>
			article {
				font-family: sans;
			}
			body {
				font-family: monospace;
			}
			img.render {
				background: indigo;
				padding: 0;
			}
			.explorer {
				margin: 80px;
			}
			.file {
				display: inline-block;
			}
			.file:hover .view {
				display: inline-block;
			}
			.indigo, .render {
				box-shadow: 0 0 5px indigo;
				margin:10px;
				padding: 20px;
			}
			.indigo {
				background: indigo;
				color: #fff;
				display: inline-block;
				text-decoration: none;
			}
			.view {
				display: none;
				background: #fff;
				color: #000;
				margin-left: -7px;
				position: absolute;
			}
		</style>
	</head>
	<body>
		<div class="explorer">
			{{if .Path}}
			<h2>Path</h2>
			{{range .Path}}
				<a class="indigo" href="{{.Path}}">{{.Name}}</a>
			{{end}}
			{{end}}
			{{if .Folders}}
			<h2>Folders</h2>
			{{range .Folders}}
				<a class="indigo" href="{{.Name}}/" title="{{.ModTime}}">{{.Name}}/</a>
			{{end}}
			{{end}}
			{{if .Files}}
			<h2>Files</h2>
			{{range .Files}}
				<div class="file">
					<a class="indigo" href="{{.Name}}" title="{{.ModTime}}">{{.Name}}</a>
					<a class="indigo view" href="{{.Name}}?view">view</a>
				</div>
			{{end}}
			{{end}}
			{{if .File}}
			<h2>{{.File.Name}}</h2>
			{{if .Render}}
			{{.Render}}
			{{else}}
			<pre class="render">{{.Content}}</pre>
			{{end}}
			{{end}}
		</div>
	</body>
</html>
`
