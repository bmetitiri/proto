(function() {
document.body.removeChild(document.body.lastElementChild);

var NEXT = /forward|next/i;
var PREV = /back|prev/i;
var HIDE = '{display:none}';

var clean = function(url) {
  return url.replace(/#.*/, '').replace(/https?:/, '');
}

var search = function(doc, pattern) {
  var anchors = doc.getElementsByTagName('a');
  for (var i = 0; i < anchors.length; i++) {
    var a = anchors[i];
    var href = a.href ? clean(a.href) : '';
    if (href != clean(window.location.href) && a.outerHTML.search(pattern) != -1) {
      return href;
    }
  }
};

var pattern = NEXT;
var target = search(document, pattern);
if (!target){ 
  pattern = PREV;
  target = search(document, pattern);
}

if (!target) {
  return alert('No next/previous links found.');
}

document.body['data-title'] = document.title;
document.body['data-url'] = clean(window.location.href);

var loading = false;
var load = function(url, cb) {
  if (loading || !url) {
    return;
  }
  loading = true;
  var iframe = document.createElement('iframe');
  iframe.addEventListener('load', function() {
    cb(iframe.contentDocument);
    document.body.removeChild(iframe);
    loading = false;
  });
  iframe.sandbox = 'allow-same-origin';
  iframe.src = url;
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
};

var next = function() {
  load(target, function(doc) {
    doc.body['data-title'] = doc.title;
    doc.body['data-url'] = target;
    target = search(doc, pattern);
    if (window.getComputedStyle(doc.body).position == 'absolute') {
      doc.body.style.top = document.body.scrollHeight + 'px';
    }
    document.body.appendChild(doc.body);
  });
};
next();

var scroll = function() {
  var bodies = document.getElementsByTagName('body');
  for (var i = 0; i < bodies.length; i++) {
    var body = bodies[i];
    var rect = body.getBoundingClientRect();
    if (rect.top >= 0 && rect.top < window.innerHeight) {
      window.history.replaceState(null, body['data-title'], body['data-url']);
      document.title = body['data-title'];
      // Load more at the last body.
      if (i >= bodies.length - 1) {
        next();
      }
      return;
    }
  }
};
document.addEventListener('scroll', scroll);

var removed = [];
var saved = localStorage.getItem('autoload.js.v1');
if (saved) {
  removed = JSON.parse(saved);
}
var save = function() {
  localStorage.setItem('autoload.js.v1', JSON.stringify(removed));
};

var style = document.createElement('style');
document.body.appendChild(style);
var sheet = style.sheet;
var builtins = 0;
var clear = function() {
  while (sheet.cssRules.length > builtins) {
    sheet.deleteRule(builtins);
  }
}
var addRule = function (rule) {
  sheet.insertRule(rule, 0);
  builtins = sheet.cssRules.length;
}
var resetCss = function () {
  builtins = 0;
  clear();
  addRule('* {transition: opacity .2s;}');
  addRule('.autoload_menu {bottom:10px; display:inline-block; left:10px; position:fixed; text-align:left; z-index:2000000000;}');
  addRule('.autoload_menu .autoload_desc {visibility:hidden;}');
  addRule('.autoload_menu:hover .autoload_desc {visibility:visible;}');
  addRule('.autoload_desc {color:#fff; cursor:no-drop; padding:5px; text-shadow:0 0 1px #000;}');
  addRule('.autoload_x {color:#fff; cursor:no-drop; padding:5px; text-shadow:0 0 1px #000;}');
  for (var k in removed) {
    addRule(removed[k] + HIDE);
  }
  builtins = sheet.cssRules.length;
}
resetCss();

var stop = function(e) {
  e.stopPropagation();
  e.preventDefault();
}
var menu = document.createElement('div');
menu.className = 'autoload_menu';
var removals = document.createElement('div');
removals.addEventListener('click', function(e){
  var i = e.target['data-index'];
  if (i != null) {
    removed.splice(i, 1);
    save();
    refresh();
    resetCss();
  }
});
menu.appendChild(removals);
menu.addEventListener('mouseover', stop);
menu.addEventListener('mouseout', stop);
var x = document.createElement('div');
var removing = false;
var remove = function(e) {
  if (removing) {
    unremove();
    return
  }
  stop(e);
  removing = true;
  x.style.color = '#f00';
  document.addEventListener('mouseover', hide);
  document.addEventListener('mouseout', unhide);
}
var unremove = function() {
  clear();
  document.removeEventListener('mouseover', hide);
  document.removeEventListener('mouseout', unhide);
  removing = false;
  x.style.color = '#fff';
}
x.className = 'autoload_x';
x.innerHTML = '&#10006;';
x.title = 'Remove elements (Shortcut: x)';
x.addEventListener('click', remove);
menu.appendChild(x);
document.body.appendChild(menu);

var keys = function(e) {
  switch(e.keyCode) {
    case 27:
      unremove();
      break;
    case 88:
      remove(e);
      break;
  }
};
document.addEventListener('keyup', keys);

var refresh = function() {
  removals.innerHTML = '';
  for (var k in removed) {
    var s = removed[k];
    var d = document.createElement('div');
    d['data-index'] = k;
    d.title = 'Stop hiding ' + s;
    d.innerHTML = s;
    d.className = 'autoload_desc';
    removals.appendChild(d);
  }
};
  refresh();

document.addEventListener('click', function() {
  if (!removing) {
    return;
  }
  if (target) {
    addRule(selected + HIDE);
    removed.push(selected);
    save();
    refresh();
  }
  unremove();
});

var selected = '';

var hide = function(e) {
  if (!e.target) {
    return;
  }
  if (e.target.id) {
    selected = '#' + e.target.id;
  } else if (e.target.className) {
    selected = '.' + e.target.className.split(' ').join('.');
  }
  clear();
  if (selected) {
    sheet.insertRule(selected + '{cursor: no-drop; opacity:.1}', builtins);
  }
};

var unhide = function(e) {
  selected = '';
  clear();
};
})();
