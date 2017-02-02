'use strict';
(function(){
  let s = document.body.lastElementChild;
  document.body.removeChild(s);
  let url = encodeURIComponent(location.href);
  let container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = 0;
  container.style.right = '25px';
  container.style.top = 0;
  container.style.width = '330px';
  container.style.zIndex = 1 << 24;
  let frame = document.createElement('iframe');
  frame.src = `${new URL(s.src).origin}/?url=${url}`;
  frame.style.border = 0;
  frame.style.boxShadow = '0 0 5px 0 #999';
  frame.style.height = '100%';
  frame.style.width = '100%';
  container.appendChild(frame);
  let close = document.createElement('input');
  close.type = 'button';
  close.value = '❌';
  close.style.position = 'absolute';
  close.style.top = '10px';
  close.style.right = '5px';
  close.addEventListener('click', exit);
  container.appendChild(close);
  document.body.appendChild(container);
  document.body.addEventListener('keyup', keyup);
  function keyup(e) {
    if (e.keyCode == 27) {
      exit();
    }
  }
  function exit() {
    document.body.removeEventListener('keyup', keyup);
    document.body.removeChild(container);
  }
})();
