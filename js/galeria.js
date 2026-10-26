/* Creaciones Amara — galería tipo muro polaroid con lightbox */
(function () {
  'use strict';
  var A = window.Amara;
  var dlg = document.getElementById('lightbox');
  var items = Array.prototype.slice.call(document.querySelectorAll('#wall .polaroid'));
  if (!dlg || !items.length) return;

  var img = document.getElementById('lb-img');
  var src = document.getElementById('lb-src');
  var cap = document.getElementById('lb-cap');
  var count = document.getElementById('lb-count');
  var stage = document.getElementById('lb-stage');
  var current = 0, opener = null;
  var WEBP = document.createElement('canvas').toDataURL('image/webp').indexOf('image/webp') > -1;

  var data = items.map(function (b) {
    var thumb = b.querySelector('img');
    return {
      base: b.getAttribute('data-full'),
      w: b.getAttribute('data-w'), h: b.getAttribute('data-h'),
      alt: thumb.alt, cap: b.querySelector('.cap').textContent
    };
  });

  function show(i, dir) {
    current = (i + data.length) % data.length;
    var d = data[current];
    src.srcset = d.base + '.webp';
    img.src = d.base + '.jpg';
    img.width = d.w; img.height = d.h;
    img.alt = d.alt;
    cap.textContent = d.cap;
    count.textContent = (current + 1) + ' / ' + data.length;
    if (dir && img.animate && !A.reduced()) {
      img.animate([
        { transform: 'translateX(' + (dir * 60) + 'px) scale(.96)', opacity: 0 },
        { transform: 'none', opacity: 1 }
      ], { duration: 320, easing: 'cubic-bezier(.2,.9,.3,1)' });
    }
    // Precarga la siguiente
    var n = data[(current + 1) % data.length];
    var pre = new Image();
    pre.src = n.base + (WEBP ? '.webp' : '.jpg');
  }

  function open(i) {
    opener = items[i];
    show(i, 0);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.getElementById('lb-close').focus();
  }
  function close() {
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
  }
  dlg.addEventListener('close', function () { if (opener) opener.focus({ preventScroll: true }); });

  items.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', function () { show(current - 1, -1); });
  document.getElementById('lb-next').addEventListener('click', function () { show(current + 1, 1); });

  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1, -1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1, 1); }
    else if (e.key === 'Escape' && typeof dlg.showModal !== 'function') close();
  });
  // Tocar el fondo oscuro cierra
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target === stage) close(); });

  /* ---------- Deslizar con el dedo ---------- */
  var startX = 0, startY = 0, dx = 0, dragging = false, pid = null;
  stage.addEventListener('pointerdown', function (e) {
    if (e.target !== img) return;
    dragging = true; pid = e.pointerId; startX = e.clientX; startY = e.clientY; dx = 0;
    img.classList.add('dragging');
  });
  stage.addEventListener('pointermove', function (e) {
    if (!dragging || e.pointerId !== pid) return;
    dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (Math.abs(dy) > Math.abs(dx) * 1.5 && Math.abs(dx) < 10) return;
    img.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 40) + 'deg)';
  });
  function end(e) {
    if (!dragging || (e && e.pointerId !== pid)) return;
    dragging = false;
    img.classList.remove('dragging');
    img.style.transform = '';
    if (dx < -50) show(current + 1, 1);
    else if (dx > 50) show(current - 1, -1);
    dx = 0;
  }
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('pointerleave', end);
  // Evita que el clic tras deslizar cierre el lightbox
  img.addEventListener('click', function (e) { e.stopPropagation(); });
  img.addEventListener('dragstart', function (e) { e.preventDefault(); });
})();
