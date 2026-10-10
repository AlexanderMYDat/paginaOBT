/* Hero: render de mundos desde WORLDS, escala entera, idle y hover. */
(function () {
  "use strict";

  var hero = document.querySelector(".hero");
  var stage = document.querySelector(".worlds");
  if (!hero || !stage || !window.WORLDS) return;

  var MOBILE = window.matchMedia("(max-width: 767px)");
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
  var flickers = [];
  var nodes = [];
  var byId = {};
  var scale = 1;

  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    return n;
  }

  // Ruta con versión para evitar imágenes viejas en caché.
  function asset(src) {
    return src + "?v=" + (window.ASSET_VERSION || "1");
  }

  // Convierte % del lienzo a px nativos enteros.
  function nat(pct, size) {
    return Math.round((pct / 100) * size);
  }

  function px(n) {
    return "calc(var(--s) * " + n + "px)";
  }

  function buildSprite(w, s, n) {
    var sp = el("div", "sprite" + (s.hidden ? " is-hidden" : ""), { "data-sprite": s.id });
    var frames = s.frames || 1;
    var box = s.clip ? { w: s.clip.w, h: s.clip.h } : w.native;
    var x = nat(s.x, box.w);
    var y = nat(s.y, box.h);
    var fw = nat(s.w, w.native.w);
    sp.style.setProperty("--x", x);
    sp.style.setProperty("--y", y);
    sp.style.setProperty("--w", fw);
    sp.style.setProperty("--f", frames);
    sp.style.zIndex = s.z || 1;
    sp.style.backgroundImage = "url(" + asset(s.src) + ")";
    if (s.fps) sp.style.setProperty("--fps", s.fps);
    if (s.hover) sp.dataset.hover = s.hover;
    if (s.idle) {
      sp.classList.add("idle-" + s.idle);
      // Desfase al azar para que nada se mueva al unísono.
      sp.style.setProperty("--dur", (2.5 + Math.random() * 3).toFixed(2) + "s");
      sp.style.setProperty("--delay", (-Math.random() * 5).toFixed(2) + "s");
      if (s.idle === "flicker") flickers.push({ el: sp, every: s.every || [6, 10], world: w.id });
    }
    // Alto nativo de un frame, leído de la imagen; la caja también cuenta para el hit-test.
    var img = new Image();
    img.onload = function () {
      sp.style.setProperty("--h", img.naturalHeight);
      if (!s.hidden && !s.clip) n.boxes.push([x, y, fw, img.naturalHeight]);
    };
    img.src = asset(s.src);

    if (!s.clip) return sp;
    // Recorte con forma (p. ej. la puerta por donde cruza la silueta).
    var clip = el("div", "sprite-clip");
    clip.style.setProperty("--x", s.clip.x);
    clip.style.setProperty("--y", s.clip.y);
    clip.style.setProperty("--cw", s.clip.w);
    clip.style.setProperty("--ch", s.clip.h);
    clip.style.zIndex = s.z || 1;
    clip.style.clipPath = "polygon(" + s.clip.poly.map(function (p) {
      return px(p[0]) + " " + px(p[1]);
    }).join(", ") + ")";
    clip.appendChild(sp);
    return clip;
  }

  // Máscara de opacidad de la base: el hover solo cuenta sobre píxeles visibles.
  function buildHitMask(n, img) {
    try {
      var c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      var ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      var data = ctx.getImageData(0, 0, c.width, c.height).data;
      n.mask = new Uint8Array(c.width * c.height);
      for (var i = 0; i < n.mask.length; i++) n.mask[i] = data[i * 4 + 3] > 0 ? 1 : 0;
    } catch (e) {
      n.mask = null; // file:// u otro origen: se usa la caja completa
    }
  }

  function buildWorld(w) {
    var node = el("div", "world" + (w.empty ? " world--empty" : ""), { "data-world": w.id });
    if (w.empty) node.setAttribute("aria-hidden", "true");
    node.style.setProperty("--nw", w.native.w);
    node.style.setProperty("--nh", w.native.h);
    node.style.setProperty("--depth", w.depth || 0);
    node.style.zIndex = w.pos.y + w.native.h;
    var n = { data: w, node: node, boxes: [], mask: null };

    if (!w.empty) {
      node.setAttribute("role", "button");
      node.setAttribute("tabindex", "0");
      node.setAttribute("aria-label", w.label + ": " + w.title + ". Abrir redes sociales");
    }

    node.appendChild(el("div", "world-shadow", { "aria-hidden": "true" }));
    var canvas = el("div", "world-canvas");
    var base = el("img", "world-base", { src: asset(w.base), alt: "", width: w.native.w, height: w.native.h, draggable: "false" });
    if (!w.empty) {
      if (base.complete) buildHitMask(n, base);
      else base.addEventListener("load", function () { buildHitMask(n, base); });
    }
    canvas.appendChild(base);
    (w.sprites || []).forEach(function (s) {
      canvas.appendChild(buildSprite(w, s, n));
    });
    node.appendChild(canvas);
    n.canvas = canvas;
    stage.appendChild(node);
    nodes.push(n);
    byId[w.id] = n;
  }

  // Caja del racimo en px nativos (para escalar y centrar todo junto).
  var CLUSTER = { w: 0, h: 0 };
  var LABEL_ROOM = 0; // los letreros van dentro del lienzo de cada mundo

  function measureCluster() {
    window.WORLDS.forEach(function (w) {
      CLUSTER.w = Math.max(CLUSTER.w, w.pos.x + w.native.w);
      CLUSTER.h = Math.max(CLUSTER.h, w.pos.y + w.native.h);
    });
    CLUSTER.h += LABEL_ROOM;
  }

  // Escala entera según viewport, siempre redondeada hacia abajo.
  function computeScale() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    if (MOBILE.matches) return Math.max(1, Math.min(2, Math.floor((vw - 32) / 128)));
    // Que quepa a lo ancho y a lo alto, pero sin pasar de ~1 escala por cada 900 px
    // de ancho: los mundos se mantienen chicos aun en pantallas grandes.
    var fit = Math.floor(Math.min((vw - 32) / CLUSTER.w, (vh - 200) / CLUSTER.h));
    return Math.max(1, Math.min(fit, Math.max(2, Math.floor(vw / 900))));
  }

  function layout() {
    var s = (scale = computeScale());
    var mobile = MOBILE.matches;
    var W = stage.clientWidth;
    var H = stage.clientHeight;
    // Racimo centrado; todo en px enteros.
    var ox = Math.floor((W - CLUSTER.w * s) / 2);
    // Centrado vertical algo por debajo del medio, bajo la palabra gigante.
    var oy = Math.max(96, Math.min(H - 16 - CLUSTER.h * s, Math.round((H - CLUSTER.h * s) / 2 + H * 0.15)));
    // Móvil: mundos apilados en el orden de WORLDS (sin los bloques vacíos);
    // el primero arranca detrás de la palabra gigante.
    var my = 212;
    stage.style.height = "";
    window.WORLDS.forEach(function (w) {
      var n = byId[w.id];
      n.node.style.setProperty("--s", s);
      if (mobile) {
        if (w.empty) return;
        n.node.style.left = Math.floor((W - w.native.w * s) / 2) + "px";
        n.node.style.top = my + "px";
        my += w.native.h * s + 8 * s;
        return;
      }
      n.node.style.left = ox + w.pos.x * s + "px";
      n.node.style.top = oy + w.pos.y * s + "px";
    });
    if (mobile) stage.style.height = my + 40 + "px";
  }

  // ------------------------------------------------------------------ parpadeo de tubos
  // Patrones irregulares generados al azar (nunca dos iguales).
  // A veces el tubo se queda apagado un momento antes de volver.
  function pattern(longOff) {
    var p = [];
    var n = 3 + Math.floor(Math.random() * 6);
    for (var i = 0; i < n; i++) p.push(30 + Math.random() * 140);
    // Índices pares = apagado: el apagón largo cae siempre en uno par.
    if (longOff && Math.random() < 0.3) p.splice(2 * Math.floor(Math.random() * (n / 2)), 0, 600 + Math.random() * 900);
    if (p.length % 2) p.push(40);
    return p;
  }

  function flicker(sp, longOff) {
    if (sp._busy) return;
    sp._busy = true;
    var p = pattern(longOff);
    var i = 0;
    (function step() {
      sp.classList.toggle("is-off", i % 2 === 0);
      if (i < p.length) return setTimeout(step, p[i++]);
      sp.classList.remove("is-off");
      sp._busy = false;
    })();
  }

  function scheduleFlicker(f) {
    var min = f.every[0] * 1000;
    var span = (f.every[1] - f.every[0]) * 1000;
    setTimeout(function () {
      if (!REDUCED.matches && !document.hidden) flicker(f.el, true);
      scheduleFlicker(f);
    }, min + Math.random() * span);
  }

  // En hover, todos los tubos del mundo parpadean seguido y sin patrón.
  var hoverTimer = 0;
  function hoverFlicker(id) {
    var lights = flickers.filter(function (f) { return f.world === id; });
    if (!lights.length || REDUCED.matches) return;
    (function tick() {
      flicker(lights[Math.floor(Math.random() * lights.length)].el, false);
      hoverTimer = setTimeout(tick, 120 + Math.random() * 380);
    })();
  }

  // ------------------------------------------------------------------ hover y foco entre mundos
  var active = null;

  function setActive(n) {
    if (n === active) return;
    if (active) {
      active.node.classList.remove("is-active");
      clearTimeout(hoverTimer);
    }
    active = n;
    stage.classList.toggle("has-active", !!n);
    if (!n) return;
    n.node.classList.add("is-active");
    hoverFlicker(n.data.id);
  }

  // ¿El puntero está sobre un píxel visible del mundo (base o sprites, incluido su letrero)?
  function hits(n, e) {
    var r = n.canvas.getBoundingClientRect();
    var x = Math.floor((e.clientX - r.left) / scale);
    var y = Math.floor((e.clientY - r.top) / scale);
    var w = n.data.native.w;
    if (x < 0 || y < 0 || x >= w || y >= n.data.native.h) return false;
    if (!n.mask || n.mask[y * w + x]) return true;
    return n.boxes.some(function (b) {
      return x >= b[0] && x < b[0] + b[2] && y >= b[1] && y < b[1] + b[3];
    });
  }

  function onMove(e) {
    if (e.pointerType === "touch") return; // táctil: Fase 5
    var hit = null;
    for (var i = 0; i < nodes.length && !hit; i++) {
      if (!nodes[i].data.empty && hits(nodes[i], e)) hit = nodes[i];
    }
    setActive(hit);
    stage.classList.toggle("is-pointing", !!hit);
  }

  // ------------------------------------------------------------------ ventana de redes sociales
  var win = document.querySelector(".social-window");
  var opener = null;

  function q(sel) {
    return win.querySelector(sel);
  }

  function openWindow(n) {
    if (!win || win.open) return;
    var w = n.data;
    opener = n;
    q(".sw-title").textContent = w.label;
    q(".sw-heading").textContent = w.title;
    q(".sw-desc").textContent = w.description;
    q(".sw-note").textContent = w.note || "";
    q(".sw-note").hidden = !w.note;
    var list = q(".sw-links");
    list.textContent = "";
    w.socials.forEach(function (so) {
      var a = el("a", "sw-link", { href: so.url, target: "_blank", rel: "noopener" });
      a.innerHTML =
        '<svg class="sw-icon" aria-hidden="true" focusable="false"><use href="' +
        asset("assets/ui/social-icons.svg") + "#" + so.network + '"></use></svg>';
      a.appendChild(el("span", "sw-net")).textContent = so.label;
      a.appendChild(el("span", "sw-arrow", { "aria-hidden": "true" })).textContent = "→";
      a.setAttribute("aria-label", so.label + " de " + w.label + " (se abre en una pestaña nueva)");
      list.appendChild(el("li")).appendChild(a);
    });
    list.classList.toggle("is-single", w.socials.length === 1);

    win.showModal();
    // La ventana "nace" desde el letrero del mundo.
    var sign = n.node.querySelector('[data-hover="sign-on"]') || n.canvas;
    var r = sign.getBoundingClientRect();
    var f = win.getBoundingClientRect();
    win.style.setProperty("--ox", Math.round(r.left + r.width / 2 - f.left) + "px");
    win.style.setProperty("--oy", Math.round(r.top + r.height / 2 - f.top) + "px");
    win.classList.remove("is-opening");
    void win.offsetWidth;
    win.classList.add("is-opening");
    q(".sw-btn--close").focus();
  }

  if (win) {
    q(".sw-btn--close").addEventListener("click", function () {
      win.close();
    });
    // Clic fuera del marco = clic en el propio <dialog> (su backdrop).
    win.addEventListener("click", function (e) {
      if (e.target === win) win.close();
    });
    // Foco atrapado: Tab y Shift+Tab giran dentro de la ventana.
    win.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = win.querySelectorAll("button, a[href]");
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    });
    // Esc lo resuelve <dialog>; al cerrar por cualquier vía, el foco vuelve al mundo.
    win.addEventListener("close", function () {
      win.classList.remove("is-opening");
      if (opener) opener.node.focus();
      opener = null;
    });
  }

  // Táctil: el primer toque activa el hover; el segundo, sobre el mismo mundo, abre la ventana.
  var lastPointer = "mouse";
  stage.addEventListener("pointerdown", function (e) {
    lastPointer = e.pointerType;
  });

  stage.addEventListener("click", function (e) {
    var hit = null;
    for (var i = 0; i < nodes.length && !hit; i++) {
      if (!nodes[i].data.empty && hits(nodes[i], e)) hit = nodes[i];
    }
    if (lastPointer === "touch" && hit !== active) return setActive(hit);
    if (hit) openWindow(hit);
  });

  // Un toque fuera de los mundos apaga el hover táctil.
  document.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "touch" && !stage.contains(e.target) && !(win && win.open)) setActive(null);
  });

  // Teclado: el foco equivale al hover.
  stage.addEventListener("focusin", function (e) {
    var n = nodes.filter(function (x) { return x.node === e.target; })[0];
    if (n) setActive(n);
  });
  stage.addEventListener("focusout", function (e) {
    if (!stage.contains(e.relatedTarget) && !(win && win.open)) setActive(null);
  });

  // Teclado: Enter o Espacio sobre un mundo enfocado abren su ventana.
  stage.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var n = nodes.filter(function (x) { return x.node === e.target; })[0];
    if (!n) return;
    e.preventDefault();
    openWindow(n);
  });

  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", function () {
    setActive(null);
    stage.classList.remove("is-pointing");
  });

  measureCluster();
  window.WORLDS.forEach(buildWorld);
  // De adelante hacia atrás para el hit-test.
  nodes.sort(function (a, b) {
    return (b.data.pos.y + b.data.native.h) - (a.data.pos.y + a.data.native.h);
  });
  layout();
  flickers.forEach(scheduleFlicker);

  var raf = 0;
  window.addEventListener("resize", function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(layout);
  });
})();
