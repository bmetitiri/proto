'use strict';
(function(){
  var s = document.body.lastElementChild;
  document.body.removeChild(s);
  let query = window.location.hostname.split('.').slice(-2)[0];
  let frame = document.createElement('iframe');
  frame.src = `${new URL(s.src).origin}/?q=${query}`;
  frame.style.background = '#eee';
  frame.style.border = 0;
  frame.style.boxShadow = '0 0 5px 0 #999';
  frame.style.height = '100vh';
  frame.style.position = 'fixed';
  frame.style.right = '25px';
  frame.style.top = 0;
  frame.style.zIndex = 1 << 24;
  document.body.appendChild(frame);
  document.body.addEventListener('keyup', function handler(e) {
    if (e.keyCode == 27) {
      document.body.removeEventListener('keyup', handler);
      document.body.removeChild(frame);
    }
  });
})();
