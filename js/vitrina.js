// La Reina Mercería RD — vitrina con las fotos reales de Instagram.
// Los datos de cada producto están en js/productos.js.
(function () {
  "use strict";

  var PRODUCTOS = window.VITRINA_PRODUCTOS || [];
  var WHATSAPP = "18092415077";
  var lista = document.getElementById("vitrina-lista");
  var filtros = document.getElementById("vitrina-filtros");
  var lupa = document.getElementById("lupa");
  if (!lista || !PRODUCTOS.length) return;

  var sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  function fechaCorta(iso) {
    var p = (iso || "").split("-");
    return p.length === 3 ? Number(p[2]) + " " + MESES[Number(p[1]) - 1] + " " + p[0] : "";
  }

  function enlaceWhatsApp(p) {
    var texto = "Hola, La Reina Mercería. Me interesa: " + p.nombre +
      (p.precio ? " (" + p.precio + (p.unidad ? " " + p.unidad : "") + ")" : "") + ". ¿Lo tienen disponible?";
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
  }

  function el(etiqueta, clase, texto) {
    var n = document.createElement(etiqueta);
    if (clase) n.className = clase;
    if (texto) n.textContent = texto;
    return n;
  }

  /* ---------- Tarjetas ---------- */
  PRODUCTOS.forEach(function (p, i) {
    var li = el("li", "producto revelar");
    li.dataset.cat = p.categoria;

    var tarjeta = el("article", "producto__tarjeta inclinar");

    var foto = el("button", "producto__foto");
    foto.type = "button";
    foto.setAttribute("aria-label", "Ver de cerca: " + p.nombre);
    var img = el("img");
    img.src = p.foto;
    img.alt = p.nombre;
    img.loading = i < 4 ? "eager" : "lazy";
    img.decoding = "async";
    img.width = 360;
    img.height = 450;
    foto.appendChild(img);
    if (p.precio) foto.appendChild(el("span", "producto__precio", p.precio));
    var lupaIcono = el("span", "producto__ver");
    lupaIcono.innerHTML = '<svg class="icono" aria-hidden="true"><use href="#i-mano"/></svg>Tócalo';
    foto.appendChild(lupaIcono);
    foto.addEventListener("click", function () { abrir(i, foto); });

    var info = el("div", "producto__info");
    info.appendChild(el("p", "producto__cat", p.categoria));
    info.appendChild(el("h3", "producto__nombre", p.nombre));
    if (p.unidad || p.precio2) info.appendChild(el("p", "producto__unidad", [p.unidad, p.precio2].filter(Boolean).join(" · ")));

    var wa = el("a", "boton boton--verde boton--chico producto__wa");
    wa.href = enlaceWhatsApp(p);
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.innerHTML = '<svg class="icono" aria-hidden="true"><use href="#i-whatsapp"/></svg>Lo quiero';
    info.appendChild(wa);

    tarjeta.append(foto, info);
    li.appendChild(tarjeta);
    lista.appendChild(li);
  });

  /* ---------- Filtros por categoría ---------- */
  var categorias = [];
  PRODUCTOS.forEach(function (p) { if (categorias.indexOf(p.categoria) < 0) categorias.push(p.categoria); });
  var actual = "Todo";

  function visibles() {
    return PRODUCTOS.map(function (p, i) { return i; })
      .filter(function (i) { return actual === "Todo" || PRODUCTOS[i].categoria === actual; });
  }

  ["Todo"].concat(categorias).forEach(function (c) {
    var b = el("button", "filtro");
    b.type = "button";
    var cuantos = c === "Todo" ? PRODUCTOS.length : PRODUCTOS.filter(function (p) { return p.categoria === c; }).length;
    b.append(document.createTextNode(c), el("span", "filtro__n", String(cuantos)));
    b.setAttribute("aria-pressed", String(c === "Todo"));
    b.addEventListener("click", function () {
      actual = c;
      filtros.querySelectorAll(".filtro").forEach(function (f) { f.setAttribute("aria-pressed", String(f === b)); });
      lista.querySelectorAll(".producto").forEach(function (li) {
        var ver = c === "Todo" || li.dataset.cat === c;
        li.hidden = !ver;
        if (ver) li.classList.add("visible");
      });
    });
    filtros.appendChild(b);
  });

  /* ---------- Lupa: el producto en grande, para girarlo con el dedo ---------- */
  if (!lupa || typeof lupa.showModal !== "function") return;

  var $ = function (id) { return document.getElementById(id); };
  var objeto = $("lupa-objeto");
  var imgLupa = $("lupa-img");
  var escena = objeto.parentElement;
  var indice = 0;
  var disparador = null;

  // Estado de giro con resorte
  var rx = 0, ry = 0, vx = 0, vy = 0, metaX = 0, metaY = 0, zoom = 1, metaZoom = 1;
  var arrastrando = false, ultimo = null, t0 = performance.now(), animando = false;
  var giroscopio = false, gx = 0, gy = 0;

  function pintar(p) {
    imgLupa.src = p.foto;
    imgLupa.alt = p.nombre;
    $("lupa-cat").textContent = p.categoria;
    $("lupa-nombre").textContent = p.nombre;
    $("lupa-precio").textContent = p.precio ? p.precio + (p.unidad ? " " + p.unidad : "") : "Pregunta el precio";
    $("lupa-precio2").textContent = p.precio2 || "";
    $("lupa-detalle").textContent = p.detalle || "";
    $("lupa-wa").href = enlaceWhatsApp(p);
    $("lupa-ig").href = p.instagram;
    $("lupa-fecha").textContent = p.fecha ? "Publicado en Instagram el " + fechaCorta(p.fecha) + ". Confirma precio y existencia por WhatsApp." : "";
    metaZoom = 1;
    if (!sinMovimiento) { ry = -35; vy = 0; }
  }

  function abrir(i, desde) {
    indice = i;
    disparador = desde || null;
    pintar(PRODUCTOS[i]);
    lupa.showModal();
    document.documentElement.classList.add("lupa-abierta");
    arrancar();
  }

  function mover(paso) {
    var lista2 = visibles();
    var pos = lista2.indexOf(indice);
    if (pos < 0) pos = 0;
    indice = lista2[(pos + paso + lista2.length) % lista2.length];
    pintar(PRODUCTOS[indice]);
  }

  lupa.addEventListener("close", function () {
    document.documentElement.classList.remove("lupa-abierta");
    if (disparador) disparador.focus();
  });
  lupa.addEventListener("click", function (e) { if (e.target === lupa) lupa.close(); });
  $("lupa-cerrar").addEventListener("click", function () { lupa.close(); });
  $("lupa-ant").addEventListener("click", function () { mover(-1); });
  $("lupa-sig").addEventListener("click", function () { mover(1); });
  lupa.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { mover(-1); e.preventDefault(); }
    if (e.key === "ArrowRight") { mover(1); e.preventDefault(); }
  });

  // Arrastrar para girar
  escena.addEventListener("pointerdown", function (e) {
    arrastrando = true;
    ultimo = { x: e.clientX, y: e.clientY };
    escena.setPointerCapture(e.pointerId);
    escena.classList.add("agarrado");
    $("lupa-pista").classList.add("oculta");
  });
  escena.addEventListener("pointermove", function (e) {
    if (arrastrando) {
      var dx = e.clientX - ultimo.x, dy = e.clientY - ultimo.y;
      ultimo = { x: e.clientX, y: e.clientY };
      ry = Math.max(-60, Math.min(60, ry + dx * 0.35));
      rx = Math.max(-40, Math.min(40, rx - dy * 0.3));
      vy = dx * 0.35; vx = -dy * 0.3;
    } else if (e.pointerType === "mouse") {
      var r = escena.getBoundingClientRect();
      metaY = ((e.clientX - r.left) / r.width - 0.5) * 24;
      metaX = -((e.clientY - r.top) / r.height - 0.5) * 18;
    }
  });
  function soltar() { arrastrando = false; escena.classList.remove("agarrado"); }
  escena.addEventListener("pointerup", soltar);
  escena.addEventListener("pointercancel", soltar);
  escena.addEventListener("pointerleave", function () { if (!arrastrando) { metaX = 0; metaY = 0; } });
  escena.addEventListener("dblclick", function () { metaZoom = metaZoom > 1 ? 1 : 1.6; });

  // Inclinar el celular para mover el producto
  var botonGiro = $("lupa-giroscopio");
  if (botonGiro && "DeviceOrientationEvent" in window && window.matchMedia("(pointer: coarse)").matches) {
    botonGiro.hidden = false;
    botonGiro.addEventListener("click", function () {
      var activar = function () {
        giroscopio = !giroscopio;
        botonGiro.setAttribute("aria-pressed", String(giroscopio));
      };
      if (typeof DeviceOrientationEvent.requestPermission === "function" && !giroscopio) {
        DeviceOrientationEvent.requestPermission().then(function (r) { if (r === "granted") activar(); }).catch(function () {});
      } else activar();
    });
    window.addEventListener("deviceorientation", function (e) {
      if (!giroscopio || e.beta == null) return;
      gx = Math.max(-30, Math.min(30, (e.beta - 45) * 0.8));
      gy = Math.max(-40, Math.min(40, e.gamma * 1.2));
    });
  }

  function cuadro(ahora) {
    if (!lupa.open) { animando = false; return; }
    var t = (ahora - t0) / 1000;
    if (!arrastrando) {
      var flotaX = sinMovimiento ? 0 : Math.sin(t * 0.9) * 4;
      var flotaY = sinMovimiento ? 0 : Math.sin(t * 0.6) * 9;
      var objX = giroscopio ? gx : metaX + flotaX;
      var objY = giroscopio ? gy : metaY + flotaY;
      vx += (objX - rx) * 0.06; vy += (objY - ry) * 0.06;
      vx *= 0.82; vy *= 0.82;
      rx += vx; ry += vy;
    }
    zoom += (metaZoom - zoom) * 0.15;
    objeto.style.setProperty("--rx", rx.toFixed(2) + "deg");
    objeto.style.setProperty("--ry", ry.toFixed(2) + "deg");
    objeto.style.setProperty("--zoom", zoom.toFixed(3));
    objeto.style.setProperty("--luz", (50 + ry * 0.9).toFixed(1) + "%");
    objeto.style.setProperty("--sombra-x", (-ry * 0.6).toFixed(1) + "px");
    objeto.style.setProperty("--sombra-y", (18 + rx * 0.5).toFixed(1) + "px");
    requestAnimationFrame(cuadro);
  }
  function arrancar() {
    if (animando) return;
    animando = true;
    requestAnimationFrame(cuadro);
  }
})();
