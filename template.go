package main

import (
	"html/template"
)

var indexTemplate = template.Must(template.New("index").Parse(`
<html>
	<head>
		<style>
			article {
				font-family: sans;
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
			article code, article pre {
				background-color: #f7f7f7;
				border-radius: 4px;
				padding: 4px;
				overflow: visible;
			}
			article pre>code {
				background: transparent;
			}
			img.render {
				background: indigo;
				padding: 0;
			}
			.explorer {
				margin: 80px;
			}
			.file, .file:hover .view {
				display: inline-block;
			}
			table, .indigo, .render {
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
			{{if .Info}}
			<h2>{{.Info.Name}}</h2>
			{{if .HTML}}
			{{.HTML}}
			{{else}}
			<pre class="render"><code>{{.Content}}</code></pre>
			<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.4.0/styles/github-gist.min.css">
			<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.4.0/highlight.min.js"></script>
			<script>
				hljs.initHighlightingOnLoad();
			</script>
			{{end}}
			{{end}}
		</div>
	</body>
</html>
`))
