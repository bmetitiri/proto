// javascript:(function(){var s = document.createElement('script'); s.id = 'anothr.js'; s.src = 'http://read.anothr.co/s/read.js'; document.body.appendChild(s)})();

(function(){
	document.body.removeChild(document.getElementById('anothr.js'));
	var format = function(){"format"};
	var find = function(array, next) {
		var match = next ? /next|newer/i : /prev|back|older/i;
		for (var i = 0; i < array.length; i++) {
			var anchor = array[i];
			if (anchor.href.replace(/#.*/, '') == window.location.href) continue;
			if ((anchor.textContent.match(match) ||
				anchor.rel.match(match) ||
				anchor.title.match(match) ||
				anchor.className.match(match) ||
				anchor.innerHTML.match(match)) &&
				anchor.title.length < 20 &&
				anchor.href) return anchor;
		}
	}
	var create = function(tag, attr, children) {
		var element = document.createElement(tag);
		for (var key in attr) {
			if (key == 'style') element.style.cssText = attr.style;
			else element[key] = attr[key];
		}
		if (children) children.forEach(function(e) {element.appendChild(e);});
		return element;
	}
	var unique = function(element) {
		if (element.id) {
			var target = '#' + element.id;
			if (element == document.querySelector(target)) return target;
		}
		if (element.className) {
			var target = '.' + element.className.split(' ')[0];
			if (element == document.querySelector(target)) return target;
		}
		if (element.parentNode.id) {
			var target = '#' + element.parentNode.id + '>' + element.nodeName;
			if (element == document.querySelector(target)) return target;
		}
		if (element.parentNode.className) {
			var target = '.' + element.parentNode.className.replace(' ', '.') + '>' + element.nodeName;
			if (element == document.querySelector(target)) return target;
		}
		if (element.parentNode.parentNode.className) {
			var target = '.' + element.parentNode.parentNode.className.replace(' ', '.') + ' ' + element.nodeName;
			if (element == document.querySelector(target)) return target;
		}
	}
	var filter = function(array) {
		var ret = [];
		for (var i = 0; i < array.length; i++) {
			if (array[i].height > 100 && array[i].width > 100) {
				ret.push(array[i]);
			}
		}
		return ret;
	}
	var diff = function(current, other) {
		var img1 = filter(current.getElementsByTagName('img'));
		var img2 = filter(other.getElementsByTagName('img'));
		var targets = [];
		for (var i = 0; i < Math.min(img1.length, img2.length); i++) {
			if (img1[i].src != img2[i].src) {
				var id = unique(img1[i]);
				if (!id) console.log('Unable to identify', img1[i]);
				else targets.push(id);
			}
		}
		return targets;
	}
	var last;
	var get = function(url, callback) {
		url = url.replace(/#.*/, '');
		if (last == url) return callback(null);
		last = url;
		var iframe = create('iframe', {sandbox: 'allow-same-origin', src:url, style:'display:none'});
		iframe.onload = function() {
			var body = iframe.contentDocument.body;
			document.body.removeChild(iframe);
			callback(body);
		}
		document.body.appendChild(iframe);
	}
	var append = function(div, targets, body, source) {
		var anchor = format(body.ownerDocument, targets, source);
		if (anchor) {
			anchor.target = '_top';
			div.appendChild(anchor);
		}
	}
	var hidden = function(name, value) {
		return create('input', {type:'hidden', name:name, value:value});
	}
	var input = function(name, value, type) {
		return create('label', {}, [create('input', {name:name, type:type}), document.createTextNode(value)]);
	}
	var build = function(targets) {
		var style = document.createElement('style');
		style.textContent = 'body {font:13px arial; margin:0; text-align:center;}' +
			'iframe {display:none;}' +
			'label {margin:5px; vertical-align:center;}' +
			'label>input {vertical-align:text-bottom;}' +
			'.caption {color: #000; display:inline-block; margin:4px auto 16px; max-width:480px; text-align:justify;}' +
			'.item {text-decoration:none;}' +
			'.item img {display:block; margin:auto; max-width:100%;}' +
			'#content {background:#fff; color:#000; box-shadow: 0 0 20px #000; display:inline-block;}' +
			'#content:hover #controls {display:block;}' +
			'#controls {background:#000; box-shadow: 0 3px 5px #333; color:#ccc; display:none; font-size:15px; margin:20px 10px; padding:3px; position:fixed;}';
		var iframe = create('iframe', {style:'border:none; height:100%; left:0; position:fixed; top:0; width:100%; z-index:4000;'});
		document.body.appendChild(iframe);
		var container = iframe.contentDocument.body;
		var div = create('div', {id:'content'}, [
			create('form', {action:'http://read.anothr.co/add', id:'controls', method:'POST', target:'_top'})
		]);
		container.onclick = function(e) {
			if (e.target == container) document.body.removeChild(iframe);
			e.stopPropagation();
		}
		container.appendChild(style);
		container.appendChild(div);
		append(div, targets, document.body, window.location.href);
		div.appendChild(create('div', {id:'additional'}));
		return container.ownerDocument;
	}
	var link = function(type) {
		var array = document.querySelectorAll('link');
		for (var i = 0; i < array.length; i++) {
			if (array[i].type.indexOf(type) > -1) {
				return array[i].href;
			}
		}
		var array = document.querySelectorAll('a');
		for (var i = 0; i < array.length; i++) {
			if (array[i].href.match(/feed|rss/)) {
				return array[i].href;
			}
		}
	}
	var previous = find(document.body.getElementsByTagName('a'), false);
	var next = find(document.body.getElementsByTagName('a'), true);
	var other = next || previous;
	if (!other) {
		console.log('No next or previous link found');
	} else {
		get(other.href, function(body) {
			var targets = diff(document.body, body);
			if (!targets.length) return;
			var container = build(targets);
			var controls = container.getElementById('controls');
			var additional = container.getElementById('additional');
			var backward = input('dir', 'Past', 'radio');
			var forward = input('dir', 'Future', 'radio');
			if (!!previous) {
				controls.appendChild(backward);
				backward.firstChild.checked = true;
			}
			if (!!next) {
				controls.appendChild(forward);
				forward.firstChild.checked = true;
			}
			var rss = link('rss');
			if (rss) {
				var subscribe = create('input', {type:'submit', value:'RSS'});
				subscribe.onclick = function(e) {
					controls.appendChild(hidden('rss', rss));
					targets.forEach(function(target) {
						controls.appendChild(hidden('target', target));
					});
				}
				controls.appendChild(subscribe);
			}
			append(additional, targets, body, other.href);

			var direction = forward.firstChild.checked;
			backward.onclick = forward.onclick = function(e) {
				if (direction != forward.firstChild.checked) {
					while (child = additional.firstChild) additional.removeChild(child);
					direction = forward.firstChild.checked;
					body = document.body;
					container.defaultView.onscroll();
				}
			}

			var loading;
			(container.defaultView.onscroll = function(e) {
				var items = container.querySelectorAll('.item');
				if (!loading && items[items.length - 1].offsetTop < container.body.scrollTop + window.innerHeight) {
					loading = find(body.getElementsByTagName('a'), direction);
					if (loading) {
						get(loading.href, function(another) {
							if (another) {
								body = another;
								append(additional, targets, body, loading.href);
							}
							loading = null;
							if (another) container.defaultView.onscroll();
						});
					}
				}
			})();
		});
	}
})();
