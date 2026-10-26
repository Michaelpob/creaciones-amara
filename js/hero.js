/* Creaciones Amara — inicio: caja de regalo 3D, pétalos y mariposas */
(function () {
  'use strict';
  var A = window.Amara;
  var hero = document.getElementById('inicio');
  var gift = document.getElementById('gift');
  var burst = document.getElementById('burst');
  var reveal = document.getElementById('hero-reveal');
  if (!hero || !gift) return;

  /* ---------- Abrir / cerrar el regalo ---------- */
  var BURST = ['💖', '💕', '✨', '💗', '⭐', '🌸', '💖', '✨', '🦋', '💞'];

  function doBurst() {
    if (A.reduced()) return;
    burst.textContent = '';
    var n = window.innerWidth < 600 ? 14 : 20;
    for (var i = 0; i < n; i++) {
      var el = document.createElement('i');
      var ang = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 1.5;
      var dist = 90 + Math.random() * 120;
      el.textContent = BURST[i % BURST.length];
      el.style.setProperty('--x', (Math.cos(ang) * dist).toFixed(0) + 'px');
      el.style.setProperty('--y', (Math.sin(ang) * dist - 20).toFixed(0) + 'px');
      el.style.setProperty('--r', ((Math.random() - 0.5) * 120).toFixed(0) + 'deg');
      el.style.setProperty('--sc', (0.8 + Math.random() * 0.8).toFixed(2));
      el.style.setProperty('--fs', (16 + Math.random() * 14).toFixed(0) + 'px');
      el.style.setProperty('--dl', (Math.random() * 0.15).toFixed(2) + 's');
      burst.appendChild(el);
    }
    setTimeout(function () { burst.textContent = ''; }, 1700);
  }

  function setOpen(open) {
    hero.classList.toggle('opened', open);
    gift.setAttribute('aria-expanded', open ? 'true' : 'false');
    gift.setAttribute('aria-label', open ? 'Cerrar el regalo' : 'Toca el regalo para abrirlo');
    if (open) {
      reveal.hidden = false;
      doBurst();
      var r = gift.getBoundingClientRect();
      setTimeout(function () {
        A.confetti({ x: r.left + r.width / 2, y: r.top + r.height * 0.35, count: 90 });
      }, 180);
    }
  }
  gift.addEventListener('click', function () { setOpen(!hero.classList.contains('opened')); });

  /* ---------- Parallax con el mouse (escritorio) ---------- */
  if (A.fine() && !A.reduced()) {
    var pending = false, mx = 0, my = 0;
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        hero.style.setProperty('--mx', mx.toFixed(3));
        hero.style.setProperty('--my', my.toFixed(3));
      });
    });
    hero.addEventListener('pointerleave', function () {
      hero.style.setProperty('--mx', 0);
      hero.style.setProperty('--my', 0);
    });
  }

  /* ---------- Pétalos de rosa y mariposas doradas (canvas 2D) ---------- */
  var canvas = document.getElementById('petals');
  var ctx = canvas && canvas.getContext('2d');
  var visible = true, running = false, petals = [], flies = [], W = 0, H = 0, dpr = 1, lastT = 0;

  function makeSprite(w, h, draw) {
    var c = document.createElement('canvas');
    c.width = w * 2; c.height = h * 2;
    var x = c.getContext('2d');
    x.scale(2, 2);
    draw(x, w, h);
    return c;
  }
  function petalSprite(c1, c2) {
    return makeSprite(24, 24, function (x) {
      var g = x.createLinearGradient(0, 0, 24, 24);
      g.addColorStop(0, c1); g.addColorStop(1, c2);
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(12, 2);
      x.bezierCurveTo(22, 4, 22, 16, 12, 22);
      x.bezierCurveTo(2, 16, 2, 4, 12, 2);
      x.fill();
      x.fillStyle = 'rgba(255,255,255,.35)';
      x.beginPath();
      x.ellipse(10, 9, 2.5, 5, -0.4, 0, Math.PI * 2);
      x.fill();
    });
  }
  function wingSprite() {
    return makeSprite(20, 24, function (x) {
      var g = x.createLinearGradient(0, 0, 20, 24);
      g.addColorStop(0, '#F6D693'); g.addColorStop(1, '#C38E35');
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(0, 12);
      x.bezierCurveTo(4, -2, 22, -2, 18, 8);
      x.bezierCurveTo(16, 12, 6, 12, 0, 12);
      x.moveTo(0, 12);
      x.bezierCurveTo(6, 13, 16, 16, 13, 22);
      x.bezierCurveTo(10, 26, 2, 20, 0, 12);
      x.fill();
      x.fillStyle = 'rgba(255,255,255,.4)';
      x.beginPath(); x.arc(11, 6, 2, 0, Math.PI * 2); x.fill();
    });
  }

  var sprites, wing;
  function init() {
    if (!ctx) return;
    sprites = [petalSprite('#FF9CBF', '#E8457C'), petalSprite('#FFC4D8', '#F27BA5'), petalSprite('#F8A5C2', '#C42F66')];
    wing = wingSprite();
    resize();
    var small = window.innerWidth < 768;
    var nP = small ? 12 : 26, nF = small ? 2 : 5;
    for (var i = 0; i < nP; i++) petals.push(newPetal(true));
    for (var j = 0; j < nF; j++) flies.push(newFly());
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  }
  function newPetal(anywhere) {
    return {
      x: Math.random() * W, y: anywhere ? Math.random() * H : -30,
      s: 0.6 + Math.random() * 0.8, vy: 18 + Math.random() * 30,
      amp: 12 + Math.random() * 26, f: 0.6 + Math.random() * 1.2, ph: Math.random() * 6.28,
      r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 1.6,
      flip: Math.random() * 6.28, img: sprites[(Math.random() * sprites.length) | 0]
    };
  }
  function newFly() {
    return {
      x: Math.random() * W, y: H * (0.15 + Math.random() * 0.6),
      vx: (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 22),
      ph: Math.random() * 6.28, s: 0.8 + Math.random() * 0.5, t: Math.random() * 10
    };
  }
  function frame(t) {
    if (!running) return;
    var dt = Math.min(0.05, (t - (lastT || t)) / 1000);
    lastT = t;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var i, p;
    for (i = 0; i < petals.length; i++) {
      p = petals[i];
      p.y += p.vy * dt;
      p.ph += p.f * dt;
      p.r += p.vr * dt;
      p.flip += dt * 2;
      if (p.y > H + 30) { petals[i] = newPetal(false); continue; }
      var x = p.x + Math.sin(p.ph) * p.amp;
      ctx.save();
      ctx.translate(x, p.y);
      ctx.rotate(p.r);
      ctx.scale(p.s * (0.55 + 0.45 * Math.abs(Math.cos(p.flip))), p.s);
      ctx.globalAlpha = 0.85;
      ctx.drawImage(p.img, -12, -12, 24, 24);
      ctx.restore();
    }
    for (i = 0; i < flies.length; i++) {
      var f = flies[i];
      f.t += dt;
      f.x += f.vx * dt;
      f.y += Math.sin(f.t * 1.3 + f.ph) * 22 * dt;
      if (f.x < -40) f.x = W + 30;
      if (f.x > W + 40) f.x = -30;
      var flap = 0.25 + 0.75 * Math.abs(Math.sin(f.t * 9 + f.ph));
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(f.vx > 0 ? f.s : -f.s, f.s);
      ctx.rotate(Math.sin(f.t * 2) * 0.15);
      ctx.globalAlpha = 0.95;
      ctx.save(); ctx.scale(flap, 1); ctx.drawImage(wing, 0, -12, 20, 24); ctx.restore();
      ctx.save(); ctx.scale(-flap, 1); ctx.drawImage(wing, 0, -12, 20, 24); ctx.restore();
      ctx.fillStyle = '#8A5A1E';
      ctx.fillRect(-1, -8, 2, 16);
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }
  function update() {
    var should = visible && !document.hidden && !A.reduced();
    hero.classList.toggle('paused', !visible || document.hidden);
    if (should && !running) { running = true; lastT = 0; requestAnimationFrame(frame); }
    else if (!should) running = false;
  }

  if (ctx && !A.reduced()) {
    // Arranca cuando el navegador esté libre para no frenar la carga.
    var start = function () {
      init();
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { visible = en[0].isIntersecting; update(); }).observe(hero);
      }
      document.addEventListener('visibilitychange', update);
      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () { var oldW = W; resize(); if (Math.abs(oldW - W) > 50) { petals.forEach(function (p) { p.x = Math.random() * W; }); } }, 150);
      }, { passive: true });
      update();
    };
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1200 });
    else setTimeout(start, 300);
  } else if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { hero.classList.toggle('paused', !en[0].isIntersecting); }).observe(hero);
  }
})();
