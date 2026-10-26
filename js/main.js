/* Creaciones Amara — utilidades comunes, encabezado, productos, efectos */
(function () {
  'use strict';

  var WA_NUM = '573106427519';
  var MSG_GENERAL = 'Hola Creaciones Amara 💖 quiero información y el catálogo';
  var reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');

  function waLink(msg) {
    return 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg);
  }

  /* ---------- Confeti propio en canvas (sin librerías) ---------- */
  var cCanvas, cCtx, cParts = [], cRunning = false, cDpr = 1;
  var C_COLORS = ['#E8457C', '#F7A1C0', '#D4A24C', '#F3D28E', '#B07CC6', '#FFFFFF', '#25D366'];

  function confetti(opts) {
    if (reducedMQ.matches) return;
    opts = opts || {};
    if (!cCanvas) {
      cCanvas = document.createElement('canvas');
      cCanvas.className = 'confetti-canvas';
      cCanvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cCanvas);
      cCtx = cCanvas.getContext('2d');
    }
    cDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = window.innerWidth, h = window.innerHeight;
    if (cCanvas.width !== Math.round(w * cDpr) || cCanvas.height !== Math.round(h * cDpr)) {
      cCanvas.width = Math.round(w * cDpr);
      cCanvas.height = Math.round(h * cDpr);
    }
    var x = opts.x != null ? opts.x : w / 2;
    var y = opts.y != null ? opts.y : h / 2;
    var count = opts.count || 80;
    if (w < 600) count = Math.round(count * 0.6);
    var power = opts.power || 1;
    for (var i = 0; i < count; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      var v = (5 + Math.random() * 9) * power;
      cParts.push({
        x: x, y: y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        w: 6 + Math.random() * 6, h: 4 + Math.random() * 5,
        r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.35,
        c: C_COLORS[(Math.random() * C_COLORS.length) | 0],
        heart: Math.random() < 0.22, life: 0
      });
    }
    if (!cRunning) { cRunning = true; requestAnimationFrame(cTick); }
  }

  function drawHeart(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.45, -s, 0, -s * 0.45);
    ctx.bezierCurveTo(s * 0.45, -s, s, -s * 0.3, 0, s * 0.35);
    ctx.fill();
  }

  function cTick() {
    var w = cCanvas.width / cDpr, h = cCanvas.height / cDpr;
    cCtx.setTransform(cDpr, 0, 0, cDpr, 0, 0);
    cCtx.clearRect(0, 0, w, h);
    for (var i = cParts.length - 1; i >= 0; i--) {
      var p = cParts[i];
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.28;
      p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      if (p.y > h + 30 || p.life > 260) { cParts.splice(i, 1); continue; }
      cCtx.save();
      cCtx.translate(p.x, p.y);
      cCtx.rotate(p.r);
      cCtx.fillStyle = p.c;
      cCtx.globalAlpha = p.life > 200 ? (260 - p.life) / 60 : 1;
      if (p.heart) drawHeart(cCtx, p.w);
      else cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 1.7)) + 1);
      cCtx.restore();
    }
    if (cParts.length) requestAnimationFrame(cTick);
    else { cCtx.clearRect(0, 0, w, h); cRunning = false; }
  }

  window.Amara = {
    waLink: waLink,
    MSG_GENERAL: MSG_GENERAL,
    confetti: confetti,
    reduced: function () { return reducedMQ.matches; },
    fine: function () { return fineMQ.matches; }
  };

  document.documentElement.classList.add('loaded');

  /* ---------- Enlaces de WhatsApp ---------- */
  document.querySelectorAll('[data-wa]').forEach(function (a) { a.href = waLink(MSG_GENERAL); });

  /* ---------- Año automático ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Encabezado, progreso y parallax ---------- */
  var header = document.getElementById('header');
  var bar = document.getElementById('progress-bar');
  var decos = Array.prototype.slice.call(document.querySelectorAll('.pd[data-speed]'));
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle('scrolled', y > 10);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      if (!reducedMQ.matches) {
        var vh = window.innerHeight;
        for (var i = 0; i < decos.length; i++) {
          var d = decos[i], sec = d.parentNode.getBoundingClientRect();
          if (sec.bottom < -100 || sec.top > vh + 100) continue;
          var off = (sec.top + sec.height / 2 - vh / 2) * parseFloat(d.getAttribute('data-speed'));
          d.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
        }
      }
      drawRibbon();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------- Menú hamburguesa ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) setMenu(false);
  });

  /* ---------- Enlace activo según la sección visible ---------- */
  var links = {};
  nav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var sectionToLink = { ocasiones: 'productos' };
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = sectionToLink[en.target.id] || en.target.id;
        Object.keys(links).forEach(function (k) {
          var on = k === id;
          links[k].classList.toggle('active', on);
          if (on) links[k].setAttribute('aria-current', 'location'); else links[k].removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section[id]').forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- Aparición escalonada ---------- */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (el, i) { el.style.setProperty('--i', i % 8); });
  });
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reducedMQ.matches) {
    var revIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { revIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Tarjetas de productos (giro 3D + inclinación) ---------- */
  document.querySelectorAll('.pcard').forEach(function (card) {
    var name = card.getAttribute('data-product');
    var front = card.querySelector('.pcard-front');
    var back = card.querySelector('.pcard-back');
    var flipBtn = card.querySelector('.pcard-flip');
    var backBtn = card.querySelector('.pcard-back-btn');
    var tilt = card.querySelector('.pcard-tilt');
    var want = card.querySelector('[data-wa-product]');
    want.href = waLink('Hola Creaciones Amara 💖 me interesa: ' + name);
    back.inert = true;

    function setFlip(f, moveFocus) {
      card.classList.toggle('flipped', f);
      front.inert = f;
      back.inert = !f;
      flipBtn.setAttribute('aria-expanded', f ? 'true' : 'false');
      if (moveFocus) (f ? want : flipBtn).focus({ preventScroll: true });
    }
    flipBtn.addEventListener('click', function (e) { setFlip(true, e.detail === 0); });
    backBtn.addEventListener('click', function (e) { setFlip(false, e.detail === 0); });
    back.addEventListener('click', function (e) { if (!e.target.closest('a, button')) setFlip(false, false); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && card.classList.contains('flipped')) setFlip(false, true);
    });

    if (fineMQ.matches && !reducedMQ.matches) {
      card.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = 'rotateX(' + (-py * 12).toFixed(2) + 'deg) rotateY(' + (px * 14).toFixed(2) + 'deg) translateZ(0)';
      });
      card.addEventListener('pointerleave', function () { tilt.style.transform = ''; });
    }
  });

  /* ---------- Ocasiones → Arma tu detalle ---------- */
  document.querySelectorAll('[data-ocasion]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (window.Amara.armador) window.Amara.armador.preset(btn.getAttribute('data-ocasion'));
      var target = document.getElementById('armar');
      target.scrollIntoView({ behavior: reducedMQ.matches ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ---------- Cómo pedir: cinta que se dibuja ---------- */
  var pasos = document.getElementById('pasos');
  var cinta = document.getElementById('cinta');
  function drawRibbon() {
    if (!pasos || reducedMQ.matches) return;
    var r = pasos.getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    var p = (vh * 0.72 - r.top) / r.height;
    p = Math.max(0, Math.min(1, p));
    cinta.style.strokeDashoffset = (1 - p).toFixed(4);
  }
  if ('IntersectionObserver' in window && !reducedMQ.matches) {
    var pasoIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); pasoIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -28% 0px' });
    document.querySelectorAll('.paso').forEach(function (p) { pasoIO.observe(p); });
  } else {
    document.querySelectorAll('.paso').forEach(function (p) { p.classList.add('in'); });
  }

  /* ---------- Burbuja del botón flotante (una vez por visita) ---------- */
  var bubble = document.getElementById('fab-bubble');
  var seen = false;
  try { seen = sessionStorage.getItem('amara-burbuja') === '1'; } catch (e) { /* sin almacenamiento */ }
  if (!seen) {
    setTimeout(function () {
      bubble.hidden = false;
      try { sessionStorage.setItem('amara-burbuja', '1'); } catch (e) { /* sin almacenamiento */ }
    }, 8000);
  }
  document.getElementById('fab-close').addEventListener('click', function () { bubble.hidden = true; });

  /* ---------- Ripple en botones ---------- */
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.btn, .cbtn, .tag');
    if (!b || reducedMQ.matches) return;
    var r = b.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 2.2;
    var ink = document.createElement('span');
    ink.className = 'ripple-ink';
    ink.style.width = ink.style.height = size + 'px';
    ink.style.left = (e.clientX - r.left - size / 2) + 'px';
    ink.style.top = (e.clientY - r.top - size / 2) + 'px';
    if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
    b.style.overflow = 'hidden';
    b.appendChild(ink);
    ink.addEventListener('animationend', function () { ink.remove(); });
  }, { passive: true });

  /* ---------- Estela de corazones (solo escritorio con mouse) ---------- */
  if (fineMQ.matches && !reducedMQ.matches && Element.prototype.animate) {
    var pool = [], idx = 0, last = 0;
    var trailColors = ['#E8457C', '#D4A24C', '#B07CC6', '#F7A1C0'];
    for (var i = 0; i < 14; i++) {
      var s = document.createElement('span');
      s.className = 'trail';
      s.setAttribute('aria-hidden', 'true');
      s.style.color = trailColors[i % trailColors.length];
      s.innerHTML = '<svg><use href="#' + (i % 3 ? 'i-heart' : 'i-sparkle') + '"/></svg>';
      document.body.appendChild(s);
      pool.push(s);
    }
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var now = performance.now();
      if (now - last < 45) return;
      last = now;
      var el = pool[idx++ % pool.length];
      var x = e.clientX, y = e.clientY;
      var dx = (Math.random() - 0.5) * 30, rot = (Math.random() - 0.5) * 60;
      el.animate([
        { transform: 'translate3d(' + x + 'px,' + y + 'px,0) scale(1)', opacity: 0.9 },
        { transform: 'translate3d(' + (x + dx) + 'px,' + (y + 26) + 'px,0) scale(.2) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: 850, easing: 'ease-out', fill: 'forwards' });
    }, { passive: true });
  }

  onScroll();
})();
