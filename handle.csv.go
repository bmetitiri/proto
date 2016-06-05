package main

import (
	"bytes"
	"encoding/csv"
	"html/template"
	"log"
	"regexp"
)

var csvTemplate = template.Must(template.New("csv").Parse(`
<table data-sortable>
	<thead>
		<tr>
		{{range .Read}}
			<th>{{.}}</th>
		{{end}}
		</tr>
	</thead>
	<tbody>
		{{range .ReadAll}}
		<tr>
			{{range .}}
				<td>{{.}}</td>
			{{end}}
		</tr>
		{{end}}
	</tbody>
</table>
<script src="https://cdnjs.cloudflare.com/ajax/libs/sortable/0.8.0/js/sortable.min.js"></script>
`))

func init() {
	register(regexp.MustCompile(`(?i)\.csv$`), func(v *View) {
		reader := csv.NewReader(v.File)
		buf := bytes.NewBuffer([]byte{})
		err := csvTemplate.Execute(buf, reader)
		if err != nil {
			log.Print(err)
			return
		}
		v.HTML = template.HTML(buf.String())
	})
}
