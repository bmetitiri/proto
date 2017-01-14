'use strict';
(function(){
  function api(call, data) {
    return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.addEventListener('load', function() {
        if (xhr.status != 200) {
          return reject(xhr.response);
        }
        resolve(xhr.response);
      });
      xhr.open('POST', '/' + call);
      xhr.send(data);
    });
  }
  function clear(e) {
    while (e.firstChild) {
      e.removeChild(e.firstChild);
    }
  }
  function error(response) {
    clear(content);
    if (response.error) {
      return alert(response.error);
    }
  }
  function render(response) {
    clear(content);
    response.notes.forEach(note => {
      let div = document.createElement('div');
      div.className = 'note';
      div.innerHTML = note.text;
      content.appendChild(div);
    });
  }
  function trim(e) {
    return e.innerText.replace(/^\s+|\s+$/g, '');
  }
  let container = document.getElementById('container');
  let text = document.getElementById('text');
  let content = document.getElementById('content');
  let placeholder = document.createElement('div');
  placeholder.className = 'placeholder';
  placeholder.innerText = '⌘⏎ Save ⌥⏎ Search';
  text.appendChild(placeholder);
  text.addEventListener('focus', function() {
    if (text.firstChild === placeholder) {
      clear(text);
    }
  });
  text.addEventListener('blur', function() {
    if (!trim(text)) {
      clear(text);
      text.appendChild(placeholder);
    }
  });
  text.addEventListener('keydown', function(e) {
    // ⌥⏎ Search
    if (e.keyCode === 13 && e.altKey) {
      e.preventDefault();
      if (trim(text)) {
        let data = new FormData();
        data.append('q', text.innerText);
        api('search', data).then(render, error);
      }
      return;
    }
    // ⌘⏎ Save
    if (e.keyCode === 13 && e.metaKey) {
      e.preventDefault();
      if (trim(text)) {
        let data = new FormData();
        data.append('text', text.innerHTML);
        api('add', data).then(render, error);
        clear(text);
        text.blur();
      }
      return;
    }
    // ⌘p Password
    if (e.keyCode === 80 && e.metaKey) {
      e.preventDefault();
      let pass = document.createElement('input');
      pass.type = 'password';
      container.appendChild(pass);
      return;
    }
    // ⎋ Blur
    if (e.keyCode === 27) {
      e.preventDefault();
      text.blur();
      return;
    }
  });
})();
