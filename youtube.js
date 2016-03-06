(function() {
document.body.removeChild(document.body.lastElementChild);

var anchors = document.getElementsByTagName('a');
// Use both to guarantee order. Cache images to lessen Safari img bugs.
var images = {};
var ids = [];
for (var i = 0; i < anchors.length; i++) {
  var a = anchors[i];
  var video = /(youtube.com\/watch\?v=|youtu.be\/)([^?&]+)/.exec(a.href);
  if (video) {
    if (!images[video[2]]) {
      ids.push(video[2]);
      var img = document.createElement('img');
      img.addEventListener('load', function(id) {
        // Check for 404 images.
        if (this.width == 120) {
          ids.splice(ids.indexOf(id), 1);
          group();
        }
      }.bind(img, video[2]));
      img.src = `https://img.youtube.com/vi/${video[2]}/mqdefault.jpg`
      img.style.cssText = 'vertical-align: bottom;';
      img.title = a.textContent;
      images[video[2]] = img;
    } else if (!images[video[2]].title) {
      images[video[2]].title = a.textContent;
    }
  }
}
if (!ids.length) {
  return alert('No video links found.');
}
var container = document.createElement('div');
container.addEventListener('click', function(e) {
  e.stopPropagation();
});
// YouTube is z-index at 1999999999.
container.style.cssText = `
  background: #fff;
  bottom: 0;
  box-shadow: 0 0 10px #333;
  left: 10%;
  overflow: scroll;
  position: fixed;
  right: 10%;
  text-align: center;
  top: 0;
  z-index: 2000000000;
`;
var group = function(){
  if (!ids.length) {
    return remove();
  }
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  var current = [];
  ids.forEach(function(video, i) {
    var a = document.createElement('a');
    a.href = `https://youtube.com/watch?v=${video}`;
    a.style.cssText = 'position: relative;';
    var remove = document.createElement('span');
    remove.innerHTML = '&#10006;';
    remove.style.cssText = `
      color: #fff;
      cursor: no-drop;
      padding: 5px;
      position: absolute;
      right: 5px;
      text-shadow: 0 0 1px #000;
      top: -15px;
    `;
    remove.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      ids.splice(i, 1);
      group();
    });
    a.appendChild(images[video]);
    a.appendChild(remove);
    container.appendChild(a);
    current.push(video);
    if ((i + 1) % 20 == 0 || i == ids.length - 1) {
      var playlist = document.createElement('a');
      var url = 'https://www.youtube.com/watch_videos?video_ids=' + current.join(',');
      playlist.textContent = 'Playlist';
      playlist.href = url;
      playlist.style.cssText = `
        display: block;
        font: 20px monospace;
        padding: 20px;
      `;
      container.appendChild(playlist);
      current = [];
    }
  });
};
group();
var remove = function(e) {
  document.body.removeChild(container);
  document.removeEventListener('click', remove);
  document.removeEventListener('keyup', escape);
};
var escape = function(e) {
  if (e.keyCode == 27) {
    return remove(e);
  }
};
document.addEventListener('click', remove);
document.addEventListener('keyup', escape);
document.body.appendChild(container);
})();
