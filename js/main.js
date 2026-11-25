// La Reina Mercería RD — comportamiento de la página
(function () {
  "use strict";

  var WHATSAPP = "18092415077"; // número de la sucursal Beller

  document.documentElement.classList.add("js");

  // Enlaces de WhatsApp con mensaje ya escrito (data-wa="texto")
  document.querySelectorAll("[data-wa]").forEach(function (enlace) {
    enlace.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(enlace.dataset.wa);
    enlace.target = "_blank";
    enlace.rel = "noopener";
  });

  // Aviso de temporada: desaparece al día siguiente de data-hasta
  document.querySelectorAll("[data-hasta]").forEach(function (aviso) {
    var partes = aviso.dataset.hasta.split("-").map(Number);
    var fin = new Date(partes[0], partes[1] - 1, partes[2], 23, 59, 59);
    if (new Date() > fin) aviso.remove();
  });

  // Menú en móvil
  var boton = document.querySelector(".menu-boton");
  var menu = document.getElementById("menu");
  if (boton && menu) {
    var usar = boton.querySelector("use");
    var cambiar = function (abrir) {
      menu.classList.toggle("abierto", abrir);
      boton.setAttribute("aria-expanded", String(abrir));
      boton.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
      if (usar) usar.setAttribute("href", abrir ? "#i-cerrar" : "#i-menu");
    };
    boton.addEventListener("click", function () {
      cambiar(boton.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) cambiar(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("abierto")) { cambiar(false); boton.focus(); }
    });
  }

  // Aparición suave al hacer scroll
  var elementos = document.querySelectorAll(".revelar");
  if ("IntersectionObserver" in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    elementos.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + "ms";
      observador.observe(el);
    });
  } else {
    elementos.forEach(function (el) { el.classList.add("visible"); });
  }

  // Botones «Ver en 3D»: eligen el producto en el showroom y bajan hasta él
  document.querySelectorAll("[data-ver3d]").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.dataset.ver3d;
      if (window.laReina3D) window.laReina3D.seleccionar(id);
      else window.__ver3dPendiente = id;
      var destino = document.getElementById("showroom");
      if (destino) destino.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Tarjetas que se inclinan siguiendo el mouse (solo con mouse y sin movimiento reducido)
  var conMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (conMouse && !sinMovimiento) {
    document.querySelectorAll(".inclinar").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg");
        el.style.setProperty("--ry", (x * 12).toFixed(2) + "deg");
        el.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%");
        el.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
        el.classList.add("inclinando");
      });
      el.addEventListener("pointerleave", function () {
        el.classList.remove("inclinando");
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });
  }

  // Si el 3D no arranca en 12 segundos (sin internet, navegador viejo), se avisa en el showroom
  setTimeout(function () {
    var raiz = document.documentElement;
    if (!raiz.classList.contains("tres-listo")) raiz.classList.add("sin-3d");
  }, 12000);

  // Año del pie
  var anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();
})();
