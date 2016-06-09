var capture = {};
var boxes = document.getElementById('boxes');
var count = 0;
loop: while (true) {
  var table = document.createElement('table');
  boxes.appendChild(table);
  while (true) {
    var row = document.createElement('tr');
    table.appendChild(row);
    while (true) {
      count++;
      var p = POKEDEX[count.toString()];
      if (!p) {
        break loop;
      }
      var data = document.createElement('td');
      var a = document.createElement('a');
      a.id = p.id;
      a.className = 'image ' + p.identifier;
      a.href = 'http://veekun.com/dex/pokemon/' + p.name.replace(' ', '');
      a.title = p.id + ': ' + p.name;
      data.dataset.capture = capture[p.id];
      data.appendChild(a);
      row.appendChild(data);
      if (count % 6 == 0) {
        break;
      }
    }
    if (count % 5 == 0) {
      break;
    }
  }
}
function poke(id) {
  var p = POKEDEX[id];
  var span = document.createElement('span');
  span.className = 'image ' + p.identifier;
  span.title = p.id + ': ' + p.name;
  return span
}
var info = document.getElementById('info');
window.scrollTo(40, 300);
function showInfo(id) {
  info.style.display = 'block';
  var p = POKEDEX[id];
  if (!p) {
    return;
  }
  while (info.firstChild) {
    info.removeChild(info.firstChild);
  }
  var div = document.createElement('div');
  div.className = 'name';
  var id = document.createElement('span');
  id.className = 'id';
  id.textContent = p.id;
  div.appendChild(id);
  div.appendChild(document.createTextNode(p.name));
  var image = document.createElement('span');
  image.className = 'preview image ' + p.identifier;
  div.appendChild(image);
  info.appendChild(div);
  //info.appendChild(document.createTextNode(JSON.stringify(p, null, 4)));
  if (p.chain[0] == p.id && (
        p.chain.length > 1 ||
        p.egg.indexOf('Undiscovered') == -1)) {
    var breed = document.createElement('div');
    breed.className = 'breed';
    breed.appendChild(document.createTextNode('Breed'));
    p.chain.forEach(function(i) {
      if (POKEDEX[i].egg.indexOf('Undiscovered') == -1) {
        breed.appendChild(poke(i));
      }
    });
    if (p.baby_item) {
      breed.appendChild(document.createTextNode('holding ' + p.baby_item));
    }
    info.appendChild(breed);
  }
  if (p.precursor) {
    var pre = document.createElement('div');
    pre.className = 'breed';
    pre.appendChild(document.createTextNode(p.trade ? 'Trade' : 'Evolve'));
    pre.appendChild(poke(p.precursor));
    var text = [];
    if (p.level) {
      text.push('at Lvl', p.level);
    }
    if (p.item) {
      text.push('using', p.item);
    }
    if (p.held) {
      text.push('holding', p.held);
    }
    if (p.happy) {
      text.push('with', p.happy, 'Happiness');
    }
    if (p.check) {
      text.push('*');
    }
    if (text.length) {
      pre.appendChild(document.createTextNode(text.join(' ')));
    }
    info.appendChild(pre);
  }
  if (p.catch) {
    var locales = {};
    p.catch.forEach(function(c) {
      if (!locales[c.location]) {
        locales[c.location] = {};
      }
      var l = locales[c.location];
      if (!l[c.method]) {
        l[c.method] = {};
      }
      l[c.method][c.game] = true;
    });
    for (var k in locales) {
      var locale = document.createElement('div');
      locale.className = 'catch';
      locale.appendChild(document.createTextNode(k));
      var ul = document.createElement('ul');
      for (var k2 in locales[k]) {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(k2 + ' (' +
          Object.keys(locales[k][k2]).join(', ') + ')'));
        ul.appendChild(li);
      }
      locale.appendChild(ul);
      info.appendChild(locale);
    }
  }
}
var reshow;
window.addEventListener('scroll', function(e) {
  clearTimeout(reshow);
  info.style.display = 'none';
  reshow = setTimeout(showInfo, 100);
});
var pokelist = boxes.getElementsByTagName('a');
var query = document.getElementById('query');
query.addEventListener('input', function(e) {
  query.className = '';
  try {
    var re = new RegExp(query.value, 'i');
    for (var i = 0; i < pokelist.length; i++) {
      var p = pokelist[i];
      p.dataset.filter = re.test(p.title);
    }
  } catch (e) {
    console.log(e);
    query.className = 'err';
  }
});
for (var i = 0; i < pokelist.length; i++) {
  var p = pokelist[i];
  p.addEventListener('click', function(e){
    if (e.cmdKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
    var id = e.target.id;
    capture[id] = !capture[id];
    e.target.parentNode.dataset.capture = capture[id];
  });
  p.addEventListener('mouseover', function(e){
    showInfo(e.target.id);
  });
  p.addEventListener('focusin', function(e){
    showInfo(e.target.id);
  });
}
