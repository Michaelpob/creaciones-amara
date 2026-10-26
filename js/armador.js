/* Creaciones Amara — asistente "Arma tu detalle" */
(function () {
  'use strict';
  var A = window.Amara;
  var wiz = document.getElementById('wizard');
  if (!wiz) return;

  var DATA = {
    ocasion: [
      ['Cumpleaños', '🎂'], ['Aniversario', '💍'], ['Amor y amistad', '💕'], ['Día de la madre', '🌷'],
      ['Día del padre', '👔'], ['Grado', '🎓'], ['Otra', '✨']
    ],
    producto: [
      ['Desayunos sorpresa', '🥐'], ['Carteleras', '📌'], ['Anchetas personalizadas', '🧺'], ['Ramos de rosas y girasoles', '💐'],
      ['Cajas personalizadas', '🎁'], ['Llaveros personalizados', '🔑'], ['Cuadros personalizados', '🖼️'], ['Fotos polaroid', '📸']
    ],
    colores: [
      ['Rosa', '#F27BA5'], ['Rojo', '#D7263D'], ['Azul', '#3A6FD8'], ['Morado', '#9B5DC4'],
      ['Dorado', '#D4A24C'], ['Blanco', '#FFFFFF'], ['Sorpréndeme', 'conic-gradient(#F27BA5, #D4A24C, #3A6FD8, #9B5DC4, #F27BA5)']
    ],
    extras: [
      ['Globo', '🎈', 'globo'], ['Chocolates', '🍫', 'chocolates'], ['Peluche', '🧸', 'peluche'],
      ['Foto polaroid', '📸', 'polaroid'], ['Carta o mensaje', '💌', 'carta'], ['Flores', '🌸', 'flores']
    ]
  };
  var SURPRISE = 'linear-gradient(135deg, #F27BA5, #9B5DC4 45%, #3A6FD8 70%, #D4A24C)';
  var TOTAL = 6;
  var step = 1;

  var form = document.getElementById('wiz-form');
  var steps = form.querySelectorAll('.wiz-step');
  var fill = document.getElementById('wiz-fill');
  var barEl = document.getElementById('wiz-bar');
  var dots = document.getElementById('wiz-dots');
  var msg = document.getElementById('wiz-msg');
  var btnBack = document.getElementById('wiz-back');
  var btnNext = document.getElementById('wiz-next');
  var send = document.getElementById('wiz-send');
  var pv = document.getElementById('pv');
  var pvTag = document.getElementById('pv-tag');
  var pvEmoji = document.getElementById('pv-emoji');
  var pvName = document.getElementById('pv-name');
  var fecha = document.getElementById('f-fecha');

  /* ---------- Construir opciones ---------- */
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  form.querySelectorAll('[data-group]').forEach(function (box) {
    var g = box.getAttribute('data-group'), type = box.getAttribute('data-type');
    var html = '';
    DATA[g].forEach(function (o) {
      if (g === 'colores') {
        html += '<label class="chip"><input type="checkbox" name="colores" value="' + esc(o[0]) + '"><span><span class="sw" style="--sw:' + o[1] + '"></span>' + esc(o[0]) + '</span></label>';
      } else {
        html += '<label class="opt"><input type="' + type + '" name="' + g + '" value="' + esc(o[0]) + '"' + (o[2] ? ' data-x="' + o[2] + '"' : '') + '>' +
          '<span class="opt-card"><span class="opt-emo" aria-hidden="true">' + o[1] + '</span><span>' + esc(o[0]) + '</span></span></label>';
      }
    });
    box.innerHTML = html;
  });

  var labels = ['Ocasión', 'Detalle', 'Colores', 'Extras', 'Datos'];
  labels.forEach(function (l, i) {
    var li = document.createElement('li');
    li.innerHTML = '<button type="button" data-go="' + (i + 1) + '" aria-label="Paso ' + (i + 1) + ': ' + l + '">' + (i + 1) + '</button>';
    dots.appendChild(li);
  });

  /* Fecha mínima: hoy */
  (function () {
    var d = new Date();
    fecha.min = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  })();

  /* ---------- Estado ---------- */
  function val(name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; }
  function vals(name) { return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (el) { return el.value; }); }
  function emojiOf(group, value) { var f = DATA[group].filter(function (o) { return o[0] === value; })[0]; return f ? f[1] : ''; }
  function colorOf(value) { var f = DATA.colores.filter(function (o) { return o[0] === value; })[0]; return f ? f[1] : ''; }

  function state() {
    return {
      ocasion: val('ocasion'), producto: val('producto'), colores: vals('colores'), extras: vals('extras'),
      fecha: fecha.value, para: document.getElementById('f-para').value.trim(), idea: document.getElementById('f-idea').value.trim()
    };
  }

  function fechaBonita(v) {
    if (!v) return '';
    var p = v.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    try { return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return p[2] + '/' + p[1] + '/' + p[0]; }
  }

  /* ---------- Vista previa ---------- */
  function wobble() {
    if (A.reduced() || !pv.animate) return;
    pv.querySelector('.pv-box').animate([
      { transform: 'scale(1) rotate(0)' }, { transform: 'scale(1.08, .92) rotate(-3deg)' },
      { transform: 'scale(.96, 1.05) rotate(2deg)' }, { transform: 'scale(1) rotate(0)' }
    ], { duration: 500, easing: 'ease-out' });
  }

  function updatePreview() {
    var s = state();
    var cols = s.colores.filter(function (c) { return c !== 'Sorpréndeme'; });
    var surprise = s.colores.indexOf('Sorpréndeme') > -1;
    var c1 = '#E8457C', c2 = '#D4A24C';
    if (surprise) { c1 = SURPRISE; c2 = '#FFFFFF'; }
    else if (cols.length) {
      c1 = colorOf(cols[0]);
      c2 = cols[1] ? colorOf(cols[1]) : (cols[0] === 'Dorado' ? '#E8457C' : '#D4A24C');
    }
    pv.style.setProperty('--pc1', c1);
    pv.style.setProperty('--pc2', c2);
    pv.classList.toggle('white', !surprise && cols[0] === 'Blanco');
    pvTag.textContent = s.ocasion ? emojiOf('ocasion', s.ocasion) + ' ' + s.ocasion : 'Tu detalle';
    pvEmoji.textContent = s.producto ? emojiOf('producto', s.producto) : '🎁';
    pvName.textContent = s.producto || '¡Empecemos! 💖';
    var on = form.querySelectorAll('input[name="extras"]:checked');
    var keys = Array.prototype.map.call(on, function (el) { return el.getAttribute('data-x'); });
    pv.querySelectorAll('.pv-x').forEach(function (x) { x.classList.toggle('on', keys.indexOf(x.getAttribute('data-x')) > -1); });
  }

  /* ---------- Mensaje de WhatsApp ---------- */
  function buildMessage() {
    var s = state();
    var lines = ['Hola Creaciones Amara 💖 quiero armar mi detalle:', ''];
    lines.push('🎉 Ocasión: ' + (s.ocasion || 'Por definir'));
    lines.push('🎁 Producto: ' + (s.producto || 'Por definir'));
    lines.push('🎨 Colores: ' + (s.colores.length ? s.colores.join(', ') : 'Sorpréndeme'));
    lines.push('✨ Extras: ' + (s.extras.length ? s.extras.join(', ') : 'Sin extras'));
    lines.push('📅 Fecha de entrega: ' + (s.fecha ? fechaBonita(s.fecha) : 'Por definir'));
    if (s.para) lines.push('💌 Para: ' + s.para);
    if (s.idea) lines.push('📝 Idea o mensaje: ' + s.idea);
    lines.push('', '¿Me envían el catálogo y más información? 😊');
    return lines.join('\n');
  }

  function renderSummary() {
    var s = state();
    var rows = [
      ['🎉', 'Ocasión', s.ocasion || 'Por definir', 1],
      ['🎁', 'Detalle', s.producto || 'Por definir', 2],
      ['🎨', 'Colores', s.colores.length ? s.colores.join(', ') : 'Sorpréndeme', 3],
      ['✨', 'Extras', s.extras.length ? s.extras.join(', ') : 'Sin extras', 4],
      ['📅', 'Fecha de entrega', s.fecha ? fechaBonita(s.fecha) : 'Por definir', 5]
    ];
    if (s.para) rows.push(['💌', 'Para', s.para, 5]);
    if (s.idea) rows.push(['📝', 'Idea o mensaje', s.idea, 5]);
    document.getElementById('sum-list').innerHTML = rows.map(function (r) {
      return '<div class="sum-row"><span class="e" aria-hidden="true">' + r[0] + '</span><dt>' + r[1] + '</dt><dd>' + esc(r[2]) +
        ' <button type="button" class="link-btn sum-edit" style="display:inline;margin:0;padding:0 6px;min-height:0" data-go="' + r[3] + '">cambiar</button></dd></div>';
    }).join('');
    send.href = A.waLink(buildMessage());
  }

  /* ---------- Navegación ---------- */
  function say(text) {
    msg.textContent = text;
    msg.classList.remove('shake');
    void msg.offsetWidth;
    if (text) msg.classList.add('shake');
  }

  function valid(n) {
    if (n === 1 && !val('ocasion')) { say('Elige una ocasión para seguir 😊'); return false; }
    if (n === 2 && !val('producto')) { say('Elige un detalle para seguir 😊'); return false; }
    return true;
  }

  function maxReachable() {
    if (!val('ocasion')) return 1;
    if (!val('producto')) return 2;
    return TOTAL;
  }

  function go(n, opts) {
    opts = opts || {};
    n = Math.max(1, Math.min(TOTAL, n));
    var backwards = n < step;
    step = n;
    say('');
    steps.forEach(function (el) {
      var k = +el.getAttribute('data-step');
      el.hidden = k !== n;
      el.classList.toggle('back', backwards);
    });
    if (n === TOTAL) renderSummary();
    fill.style.transform = 'scaleX(' + (n / TOTAL) + ')';
    barEl.setAttribute('aria-valuenow', n);
    barEl.setAttribute('aria-valuetext', n === TOTAL ? 'Resumen' : 'Paso ' + n + ' de 5');
    var reach = maxReachable();
    dots.querySelectorAll('button').forEach(function (b) {
      var k = +b.getAttribute('data-go');
      b.classList.toggle('current', k === n);
      b.classList.toggle('done', k < n);
      b.disabled = k > reach;
      if (k === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    btnBack.disabled = n === 1;
    btnNext.innerHTML = (n === 5 ? 'Ver resumen' : 'Siguiente') + ' <svg class="ico" aria-hidden="true"><use href="#i-right"/></svg>';
    wiz.classList.toggle('at-end', n === TOTAL);

    var top = wiz.getBoundingClientRect().top;
    if (opts.scroll !== false && (top < 0 || top > window.innerHeight * 0.6)) {
      wiz.scrollIntoView({ behavior: A.reduced() ? 'auto' : 'smooth', block: 'start' });
    }
    if (opts.focus) {
      var h = steps[n - 1].querySelector('legend, h3');
      if (h) h.focus({ preventScroll: true });
    }
  }

  btnNext.addEventListener('click', function (e) {
    if (!valid(step)) return;
    go(step + 1, { focus: e.detail === 0 });
  });
  btnBack.addEventListener('click', function (e) { go(step - 1, { focus: e.detail === 0 }); });
  wiz.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]');
    if (b && !b.disabled) go(+b.getAttribute('data-go'), { focus: e.detail === 0 });
  });
  document.getElementById('wiz-restart').addEventListener('click', function () {
    form.reset();
    updatePreview();
    go(1, { focus: true });
  });

  /* Esc dentro del asistente: volver un paso */
  wiz.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && step > 1) { e.preventDefault(); go(step - 1, { focus: true, scroll: false }); }
  });

  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'radio') {
      e.preventDefault(); btnNext.click();
    }
  });

  /* Cambios: vista previa, exclusividad de "Sorpréndeme" y avance automático */
  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'colores') {
      if (t.value === 'Sorpréndeme' && t.checked) {
        form.querySelectorAll('input[name="colores"]').forEach(function (c) { if (c !== t) c.checked = false; });
      } else if (t.checked) {
        var s = form.querySelector('input[name="colores"][value="Sorpréndeme"]');
        if (s) s.checked = false;
      }
    }
    updatePreview();
    if (t.type === 'radio' || t.type === 'checkbox') wobble();
    say('');
  });

  /* Toque en una opción de un solo valor: pasa solo al siguiente paso */
  form.addEventListener('click', function (e) {
    var label = e.target.closest('.opt');
    if (!label || e.detail === 0) return;
    var input = label.querySelector('input');
    if (input.type !== 'radio') return;
    var from = step;
    setTimeout(function () { if (step === from && input.checked) go(from + 1); }, 380);
  });

  send.addEventListener('click', function () {
    send.href = A.waLink(buildMessage());
    var r = send.getBoundingClientRect();
    A.confetti({ x: r.left + r.width / 2, y: r.top, count: 120, power: 1.2 });
  });

  /* API para la sección de ocasiones */
  A.armador = {
    preset: function (ocasion) {
      var input = form.querySelector('input[name="ocasion"][value="' + ocasion + '"]');
      if (input) { input.checked = true; updatePreview(); wobble(); }
      go(2, { scroll: false });
    },
    message: buildMessage
  };

  updatePreview();
  go(1, { scroll: false });
})();
