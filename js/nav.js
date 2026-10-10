/* Encabezado: vuelve a la landing al recargar, saltos suaves sin #hash,
   sección activa marcada y menú desplegable en móvil. */
(function () {
  "use strict";

  // Al recargar, siempre arriba (la landing), aunque la URL traiga #seccion.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  function toTop() {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  toTop();
  window.addEventListener("load", toTop);

  var head = document.querySelector(".site-head");
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (!head) return;
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
  var links = [].slice.call(head.querySelectorAll("a[href^='#']"));

  function setOpen(open) {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    head.classList.toggle("is-open", open);
  }

  // Saltos sin escribir #hash en la URL (así recargar no deja la página a medias).
  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.getElementById(a.getAttribute("href").slice(1));
      if (!target) return;
      e.preventDefault();
      setOpen(false);
      var top = a.getAttribute("href") === "#inicio" ? 0 : target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: top, behavior: REDUCED.matches ? "auto" : "smooth" });
    });
  });

  // Sección activa: la última cuyo inicio ya pasó bajo el encabezado.
  var sections = links
    .map(function (a) { return document.getElementById(a.dataset.section || ""); })
    .filter(Boolean);
  function updateActive() {
    var current = sections[0];
    sections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= 140) current = sec;
    });
    // Al final de la página, la última sección (contacto) aunque sea corta.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = sections[sections.length - 1];
    }
    links.forEach(function (a) {
      if (a.dataset.section === current.id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", updateActive, { passive: true });
  window.addEventListener("resize", updateActive);
  updateActive();

  if (!toggle || !menu) return;
  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("click", function (e) {
    if (!head.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && head.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
})();
