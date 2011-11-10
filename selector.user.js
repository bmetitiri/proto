// ==UserScript==
// @name         Selector
// @description  Selector for node.no.de grabber.
// @version      0.0.1
// ==/UserScript==

(function() {
	if (top != window) return;
 	var self = arguments.callee,
		actions = {download:'\u2193', follow:'\u2192', source:'\u25cf'},
		history = JSON.parse(localStorage.getItem('selector')) || [];

	// DOM Helpers
	var appendItem = function(item) {
			container.appendChild(div(actions[item.action] + ' ' + item.value));
		},
		div = function(content, click) {
			var div = document.createElement('div');
			if (content) {
				if (content instanceof Element) div.appendChild(content)
				else div.textContent = content;
			}
			if (click) {
				div.onclick = click;
				div.style.cursor = 'pointer';
			}
			return div;
		},
		find = function(element, attr) {
			while (element.parentNode) {
				if (element[attr]) break;
				else element = element.parentNode;
			}
			return element;
		},
		cancel  = function(e) {e.stopPropagation(); e.preventDefault()},
		hover   = function(e) {e.target.style.outline = '2px solid #f00'},
		unhover = function(e) {e.target.style.outline = ''};

	// Document click handler
	var click = function(e) {
		var original = e.target, action = 'download', query;
		var follow = find(original, 'href');
		if (follow.href) {
			if (confirm('Follow link?')) {
				original = follow;
				action   = 'follow';
			} else cancel(e);
		}
		if (original.id) {
			query = '#' + original.id;
		} else {
			var target = find(original, 'id');
			query = (target.id ? '#' + target.id + ' ' : '') +
				original.tagName;
			var queried = document.querySelectorAll(query);
			if (queried.length > 1) {
				for (var i = 0; i < queried.length; ++i) {
					if (queried[i] == original) {
						query += ':eq(' + i + ')';
						break;
					}
				}
			}
		}
		if (!history.length) {
			var source = {action: 'source', value: document.location.href};
			appendItem(source);
			history.push(source);
		}
		var item = {action: action, value: query};
		appendItem(item);
		history.push(item);
		localStorage.setItem('selector', JSON.stringify(history));

		if (!next.parentNode && action == 'download') {
			container.appendChild(next);
		}
	};

	// Activate selector handling
	var activate = function() {
		selector.textContent = 'selector:recording';
		selector.style['text-decoration'] = 'underline';
		document.addEventListener('click', click);
		document.addEventListener('mouseover', hover);
		document.addEventListener('mouseout', unhover);
		selector.onclick = function(e) {
			cancel(e);
			localStorage.removeItem('selector');
			document.removeEventListener('click', click);
			document.body.removeChild(container);
			self();
		};
	};

	// Next step handling
	var submit = function() {
		var form  = document.createElement('form');
		var input = document.createElement('input');
		form.action = 'http://127.0.0.1:8080/';
		form.method = 'post';
		input.name  = 'history';
		input.value = JSON.stringify(history);
		form.appendChild(input);
		form.submit();
	}

	// Elements
	var next      = div('\u00bb', submit),
		selector  = div('select', function(e) {cancel(e); activate()});

	var container = div(selector);

	container.onmouseover = container.onclick = cancel;

	// Styling
	container.style.background = '#fff';
	container.style.bottom = container.style.left = 0;
	container.style.padding = '2px';
	container.style.position = 'fixed';
	container.style['box-shadow'] = '0 0 5px #000';
	container.style['border-top-right-radius'] = '5px';
	container.style['font'] = 'xx-small sans-serif';
	container.style['text-align'] = 'left';
	container.style['z-index'] = 2000;

	selector.style['text-align'] = 'center';

	next.style.background = '#000';
	next.style.color = '#fff';
	next.style.bottom = 0;
	next.style.position = 'absolute';
	next.style.right = '-20px';
	next.style.width = '16px';
	next.style['box-shadow'] = '0 0 5px #000';
	next.style['border-top-left-radius'] = '5px';
	next.style['border-top-right-radius'] = '5px';
	next.style['text-align'] = 'center';
	next.style['font-size'] = 'medium';

	if (history.length) {
		history.forEach(function(item){
			appendItem(item)
			if (!next.parentNode && item.action == 'download') {
				container.appendChild(next);
			}
		});
	   	activate();
	}
	document.body.appendChild(container);
})();
