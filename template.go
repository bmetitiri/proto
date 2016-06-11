package main

import (
	"html/template"
)

var indexTemplate = template.Must(template.New("index").Parse(`
<html>
	<head>
		<title>
			{{.Title}}
		</title>
		{{if .Theme}}
		<link rel="stylesheet" type="text/css" href="https://jmblog.github.io/color-themes-for-google-code-prettify/themes/{{.Theme}}.min.css">
		{{end}}
		<style>
			article {
				font-family: sans;
			}
			article code, article pre {
				background-color: #f7f7f7;
				border-radius: 4px;
				padding: 4px;
				overflow: visible;
			}
			article pre>code {
				background: transparent;
			}
			body {
				font-family: monospace;
			}
			th {
				cursor: pointer;
				padding: 3px 10px;
			}
			th[data-sorted-direction="ascending"]:after {
				content: " 🔼";
			}
			th[data-sorted-direction="descending"]:after {
				content: " 🔽";
			}
			img.render {
				background: indigo;
				padding: 0;
			}
			table, .indigo, .render {
				box-shadow: 0 0 5px indigo;
				margin:10px;
				padding: 20px;
			}
			.explorer {
				margin: 80px;
			}
			.file, .file:hover .view {
				display: inline-block;
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
					<a class="indigo" href="{{.Name}}" title="{{.ModTime}}">{{.Name}}</a><a class="indigo view" href="{{.Name}}?view">view</a>
				</div>
			{{end}}
			{{end}}
			{{if .Info}}
			<h2>{{.Info.Name}}</h2>
			{{.HTML}}
			{{end}}
		</div>
	</body>
</html>
`))
