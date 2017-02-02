'use strict';
(function(){
  let notes = document.getElementsByClassName('note');
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let password = note.querySelector('input[type=password]');
    password.addEventListener('input', toggle);
    let copy = document.createElement('input');
    copy.style.display = 'none';
    copy.title = 'Copy Password';
    copy.type = 'button';
    copy.value = '📋';
    copy.addEventListener('click', function(){
      password.type = 'text';
      password.focus();
      password.setSelectionRange(0, password.value.length);
      if (document.execCommand('copy')) {
        password.type = 'password';
        password.blur();
      }
    });
    function toggle(){
      copy.style.display = password.value.length > 0 ? 'inline': 'none';
    }
    toggle();
    note.insertBefore(copy, password.nextSibling);
  }
  if (window != parent) {
    return;
  }
  let bookmark = document.createElement('a');
  bookmark.title = 'Drag to bookmark bar.';
  bookmark.textContent = '🔖TinyNote';
  bookmark.href = `javascript:(function() {
    var s = document.createElement('script');
    s.src = '${window.location.origin}/static/bookmark.js';
    document.body.appendChild(s);
  })();`.replace(/\s/g, '').replace(/var/g, 'var ');
  document.getElementsByTagName('nav')[0].appendChild(bookmark);
})();
