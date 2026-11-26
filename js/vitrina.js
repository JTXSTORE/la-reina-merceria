// La Reina Mercería RD — vitrina en carrusel 3D con las fotos reales de Instagram.
// Los datos de cada producto están en js/productos.js.
(function () {
  "use strict";

  var PRODUCTOS = window.VITRINA_PRODUCTOS || [];
  var WHATSAPP = "18092415077";
  var $ = function (id) { return document.getElementById(id); };
  var escena = $("carrusel-escena");
  if (!escena || !PRODUCTOS.length) return;

  var filtros = $("vitrina-filtros");
  var minis = $("carrusel-mini");
  var lupa = $("lupa");
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
  function fotoChica(p) { return p.foto.replace("img/productos/", "img/productos/mini/"); }
  function el(etiqueta, clase, texto) {
    var n = document.createElement(etiqueta);
    if (clase) n.className = clase;
    if (texto) n.textContent = texto;
    return n;
  }
  function icono(id) {
    var span = document.createElement("span");
    span.innerHTML = '<svg class="icono" aria-hidden="true"><use href="#' + id + '"/></svg>';
    return span.firstChild;
  }
  function ver3d(t) {
    if (!t) return;
    if (window.laReina3D) window.laReina3D.ver(t.id, t.opciones);
    else {
      window.__ver3dPendiente = t;
      var destino = $("showroom");
      if (destino) destino.scrollIntoView({ behavior: "smooth" });
    }
  }

  /* ---------- Estado ---------- */
  var lista = [];      // índices de PRODUCTOS que pasan el filtro
  var activo = 0;      // posición dentro de lista
  var arrastre = 0;    // desplazamiento fraccional mientras se arrastra
  var cartas = [];
  var miniaturas = [];

  /* ---------- Cartas y miniaturas ---------- */
  PRODUCTOS.forEach(function (p, i) {
    var c = el("button", "carta");
    c.type = "button";
    c.dataset.i = i;
    c.tabIndex = -1;
    c.setAttribute("aria-label", p.nombre + (p.precio ? ", " + p.precio : "") + ". Ver de cerca");
    var img = el("img");
    img.alt = "";
    img.decoding = "async";
    img.draggable = false;
    c.appendChild(img);
    if (p.precio) c.appendChild(el("span", "carta__precio", p.precio));
    if (p.tres) {
      var b = el("span", "carta__3d");
      b.append(icono("i-cubo"), document.createTextNode("3D"));
      c.appendChild(b);
    }
    c.appendChild(el("span", "carta__brillo"));
    c.addEventListener("click", function (e) {
      if (e.detail === 0) tocarCarta(c);   // teclado (Enter / espacio)
    });
    escena.appendChild(c);
    cartas[i] = c;

    var m = el("button", "mini");
    m.type = "button";
    m.title = p.nombre;
    m.setAttribute("aria-label", p.nombre);
    var mi = el("img");
    mi.src = fotoChica(p);
    mi.alt = "";
    mi.loading = "lazy";
    mi.width = 64;
    mi.height = 64;
    m.appendChild(mi);
    m.addEventListener("click", function () { parar(); ir(lista.indexOf(i)); });
    minis.appendChild(m);
    miniaturas[i] = m;
  });

  function separacion() {
    var w = cartas[0].offsetWidth || 260;
    return Math.min(w * 0.6, escena.clientWidth * 0.3);
  }

  function pintar(animar) {
    var sep = separacion();
    PRODUCTOS.forEach(function (p, i) {
      var c = cartas[i];
      var pos = lista.indexOf(i);
      if (pos < 0) { c.hidden = true; return; }
      c.hidden = false;
      var o = pos - activo + arrastre;
      var a = Math.abs(o);
      c.style.transition = animar ? "" : "none";
      if (a > 3.5) {
        c.style.opacity = "0";
        c.style.pointerEvents = "none";
        c.style.transform = "translate(-50%, -50%) translateX(" + (Math.sign(o) * 3.5 * sep).toFixed(0) + "px) translateZ(-520px)";
        c.tabIndex = -1;
        return;
      }
      var giro = -Math.max(-1, Math.min(1, o)) * 42;
      c.style.transform = "translate(-50%, -50%) translateX(" + (o * sep).toFixed(1) + "px) translateZ(" +
        (-a * 150).toFixed(1) + "px) rotateY(" + giro.toFixed(1) + "deg) scale(" + (1 - Math.min(a, 1) * 0.06).toFixed(3) + ")";
      c.style.opacity = String(Math.max(0, 1 - Math.max(0, a - 1) * 0.3));
      c.style.zIndex = String(100 - Math.round(a * 10));
      c.style.pointerEvents = "auto";
      c.style.setProperty("--luz", (50 - o * 30).toFixed(0) + "%");
      c.classList.toggle("activa", a < 0.5);
      c.tabIndex = a < 0.5 ? 0 : -1;
      var img = c.firstChild;
      if (!img.getAttribute("src")) img.src = p.foto;
    });
  }

  function info() {
    var i = lista[activo];
    var p = PRODUCTOS[i];
    if (!p) return;
    $("carrusel-cat").textContent = p.categoria;
    $("carrusel-nombre").textContent = p.nombre;
    $("carrusel-precio").textContent = p.precio ? p.precio + (p.unidad ? " " + p.unidad : "") : "Pregunta el precio";
    $("carrusel-precio2").textContent = p.precio2 ? "· " + p.precio2 : "";
    $("carrusel-wa").href = enlaceWhatsApp(p);
    $("carrusel-3d").hidden = !p.tres;
    etiquetaAgregar($("carrusel-agregar"), p);
    $("carrusel-contador").textContent = (activo + 1) + " de " + lista.length;
    $("carrusel-ant").disabled = activo === 0;
    $("carrusel-sig").disabled = activo === lista.length - 1;
    miniaturas.forEach(function (m, k) {
      m.classList.toggle("activa", k === i);
      m.setAttribute("aria-current", String(k === i));
    });
    var m = miniaturas[i];
    if (m && !m.hidden) {
      var objetivo = m.offsetLeft - minis.clientWidth / 2 + m.offsetWidth / 2;
      minis.scrollTo({ left: objetivo, behavior: sinMovimiento ? "auto" : "smooth" });
    }
  }

  function ir(pos) {
    if (!lista.length) return;
    activo = Math.max(0, Math.min(lista.length - 1, pos));
    arrastre = 0;
    pintar(true);
    info();
  }

  function tocarCarta(c) {
    var pos = lista.indexOf(Number(c.dataset.i));
    parar();
    if (pos === activo) abrir(lista[activo], c);
    else ir(pos);
  }

  /* ---------- Pedido ---------- */
  function agregarAlPedido(p) {
    if (!window.LaReinaPedido) return;
    window.LaReinaPedido.agregar({ nombre: p.nombre, precio: p.precio, unidad: p.unidad, foto: fotoChica(p) });
  }
  function etiquetaAgregar(boton, p) {
    if (!boton || !p) return;
    var n = window.LaReinaPedido ? window.LaReinaPedido.cantidadDe(p.nombre) : 0;
    boton.lastElementChild.textContent = n ? "Agregar otro (" + n + ")" : "Agregar al pedido";
    boton.classList.toggle("en-pedido", n > 0);
  }
  document.addEventListener("pedido:cambio", function () {
    etiquetaAgregar($("carrusel-agregar"), PRODUCTOS[lista[activo]]);
    if (lupa && lupa.open) etiquetaAgregar($("lupa-agregar"), PRODUCTOS[indice]);
  });

  /* ---------- Filtros ---------- */
  var categorias = [];
  PRODUCTOS.forEach(function (p) { if (categorias.indexOf(p.categoria) < 0) categorias.push(p.categoria); });

  function filtrar(cat) {
    lista = PRODUCTOS.map(function (p, i) { return i; })
      .filter(function (i) { return cat === "Todo" || PRODUCTOS[i].categoria === cat; });
    miniaturas.forEach(function (m, i) { m.hidden = lista.indexOf(i) < 0; });
    activo = 0;
    arrastre = 0;
    pintar(false);
    requestAnimationFrame(function () { pintar(true); });
    info();
  }

  ["Todo"].concat(categorias).forEach(function (cat) {
    var b = el("button", "filtro");
    b.type = "button";
    var cuantos = cat === "Todo" ? PRODUCTOS.length : PRODUCTOS.filter(function (p) { return p.categoria === cat; }).length;
    b.append(document.createTextNode(cat), el("span", "filtro__n", String(cuantos)));
    b.setAttribute("aria-pressed", String(cat === "Todo"));
    b.addEventListener("click", function () {
      parar();
      filtros.querySelectorAll(".filtro").forEach(function (f) { f.setAttribute("aria-pressed", String(f === b)); });
      filtrar(cat);
    });
    filtros.appendChild(b);
  });

  /* ---------- Arrastrar, flechas, teclado y rueda ---------- */
  var inicioX = null;
  var movido = false;
  var puntero = null;
  escena.addEventListener("pointerdown", function (e) {
    inicioX = e.clientX;
    movido = false;
    puntero = e.pointerId;
    parar();
  });
  escena.addEventListener("pointermove", function (e) {
    if (inicioX === null) return;
    var dx = e.clientX - inicioX;
    if (!movido && Math.abs(dx) > 8) {
      movido = true;
      escena.setPointerCapture(puntero);
      escena.classList.add("arrastrando");
    }
    if (!movido) return;
    arrastre = dx / separacion();
    if ((activo === 0 && arrastre > 0) || (activo === lista.length - 1 && arrastre < 0)) arrastre *= 0.3;
    pintar(false);
  });
  escena.addEventListener("pointerup", function (e) {
    if (inicioX === null) return;
    escena.classList.remove("arrastrando");
    if (movido) {
      var nuevo = Math.round(activo - arrastre);
      arrastre = 0;
      ir(nuevo);
    } else {
      var c = e.target.closest ? e.target.closest(".carta") : null;
      if (c) tocarCarta(c);
    }
    inicioX = null;
  });
  escena.addEventListener("pointercancel", function () {
    inicioX = null;
    arrastre = 0;
    escena.classList.remove("arrastrando");
    pintar(true);
  });

  var ultimaRueda = 0;
  escena.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
    e.preventDefault();
    var ahora = Date.now();
    if (ahora - ultimaRueda < 350) return;
    ultimaRueda = ahora;
    parar();
    ir(activo + (e.deltaX > 0 ? 1 : -1));
  }, { passive: false });

  $("carrusel-ant").addEventListener("click", function () { parar(); ir(activo - 1); });
  $("carrusel-sig").addEventListener("click", function () { parar(); ir(activo + 1); });
  escena.parentElement.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { parar(); ir(activo - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { parar(); ir(activo + 1); e.preventDefault(); }
  });
  $("carrusel-lupa").addEventListener("click", function () { parar(); abrir(lista[activo], $("carrusel-lupa")); });
  $("carrusel-agregar").addEventListener("click", function () { parar(); agregarAlPedido(PRODUCTOS[lista[activo]]); });
  $("carrusel-3d").addEventListener("click", function () { parar(); ver3d(PRODUCTOS[lista[activo]].tres); });
  window.addEventListener("resize", function () { pintar(false); });

  /* ---------- Avance automático: se detiene al tocar y tiene botón de pausa ---------- */
  var auto = null;
  var tocado = sinMovimiento;
  var enPantalla = false;
  var botonPausa = $("carrusel-pausa");
  function pintarPausa() {
    var pausado = tocado;
    botonPausa.setAttribute("aria-pressed", String(pausado));
    botonPausa.setAttribute("aria-label", pausado ? "Reanudar el carrusel" : "Pausar el carrusel");
    botonPausa.title = pausado ? "Reanudar" : "Pausar";
    botonPausa.firstElementChild.firstElementChild.setAttribute("href", pausado ? "#i-play" : "#i-pausa");
  }
  function arrancarAuto() {
    if (auto || tocado || !enPantalla) return;
    auto = setInterval(function () {
      if (document.hidden || (lupa && lupa.open)) return;
      ir(activo + 1 >= lista.length ? 0 : activo + 1);
    }, 3800);
  }
  function parar() {
    tocado = true;
    if (auto) { clearInterval(auto); auto = null; }
    pintarPausa();
  }
  botonPausa.addEventListener("click", function () {
    if (tocado) {
      tocado = false;
      arrancarAuto();
      pintarPausa();
    } else parar();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entradas) {
      enPantalla = entradas[0].isIntersecting;
      if (enPantalla) arrancarAuto();
      else if (auto) { clearInterval(auto); auto = null; }
    }, { threshold: 0.5 }).observe(escena);
  }
  pintarPausa();

  filtrar("Todo");

  /* ---------- Lupa: el producto en grande, para girarlo con el dedo ---------- */
  if (!lupa || typeof lupa.showModal !== "function") return;

  var objeto = $("lupa-objeto");
  var imgLupa = $("lupa-img");
  var escenaLupa = objeto.parentElement;
  var indice = 0;
  var disparador = null;
  var rx = 0, ry = 0, vx = 0, vy = 0, metaX = 0, metaY = 0, zoom = 1, metaZoom = 1;
  var agarrado = false, ultimo = null, t0 = performance.now(), animando = false;
  var giroscopio = false, gx = 0, gy = 0;

  function pintarLupa(p) {
    imgLupa.src = p.foto;
    imgLupa.alt = p.nombre;
    $("lupa-cat").textContent = p.categoria;
    $("lupa-nombre").textContent = p.nombre;
    $("lupa-precio").textContent = p.precio ? p.precio + (p.unidad ? " " + p.unidad : "") : "Pregunta el precio";
    $("lupa-precio2").textContent = p.precio2 || "";
    $("lupa-detalle").textContent = p.detalle || "";
    $("lupa-wa").href = enlaceWhatsApp(p);
    $("lupa-ig").href = p.instagram;
    $("lupa-3d").hidden = !p.tres;
    etiquetaAgregar($("lupa-agregar"), p);
    $("lupa-fecha").textContent = p.fecha ? "Publicado en Instagram el " + fechaCorta(p.fecha) + ". Confirma precio y existencia por WhatsApp." : "";
    metaZoom = 1;
    if (!sinMovimiento) { ry = -35; vy = 0; }
  }

  function abrir(i, desde) {
    indice = i;
    disparador = desde || null;
    pintarLupa(PRODUCTOS[i]);
    var foto = cartas[i] && cartas[i].firstChild;
    var mostrar = function () {
      if (foto) foto.style.viewTransitionName = "";
      imgLupa.style.viewTransitionName = "foto-producto";
      lupa.showModal();
      document.documentElement.classList.add("lupa-abierta");
    };
    // La foto de la carta «vuela» hasta la vista de cerca (donde el navegador lo permite)
    if (document.startViewTransition && !sinMovimiento && foto && cartas[i].classList.contains("activa")) {
      foto.style.viewTransitionName = "foto-producto";
      ry = 0;
      vy = 0;
      var vt = document.startViewTransition(mostrar);
      vt.finished.finally(function () { imgLupa.style.viewTransitionName = ""; });
    } else mostrar();
    arrancar();
  }

  function mover(paso) {
    var pos = lista.indexOf(indice);
    if (pos < 0) pos = 0;
    pos = (pos + paso + lista.length) % lista.length;
    indice = lista[pos];
    pintarLupa(PRODUCTOS[indice]);
    activo = pos;
    pintar(false);
    info();
  }

  lupa.addEventListener("close", function () {
    document.documentElement.classList.remove("lupa-abierta");
    if (disparador) disparador.focus();
  });
  lupa.addEventListener("click", function (e) { if (e.target === lupa) lupa.close(); });
  $("lupa-cerrar").addEventListener("click", function () { lupa.close(); });
  $("lupa-ant").addEventListener("click", function () { mover(-1); });
  $("lupa-sig").addEventListener("click", function () { mover(1); });
  $("lupa-agregar").addEventListener("click", function () { agregarAlPedido(PRODUCTOS[indice]); });
  $("lupa-3d").addEventListener("click", function () {
    var t = PRODUCTOS[indice].tres;
    lupa.close();
    ver3d(t);
  });
  lupa.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { mover(-1); e.preventDefault(); }
    if (e.key === "ArrowRight") { mover(1); e.preventDefault(); }
  });

  escenaLupa.addEventListener("pointerdown", function (e) {
    agarrado = true;
    ultimo = { x: e.clientX, y: e.clientY };
    escenaLupa.setPointerCapture(e.pointerId);
    escenaLupa.classList.add("agarrado");
    $("lupa-pista").classList.add("oculta");
  });
  escenaLupa.addEventListener("pointermove", function (e) {
    if (agarrado) {
      var dx = e.clientX - ultimo.x, dy = e.clientY - ultimo.y;
      ultimo = { x: e.clientX, y: e.clientY };
      ry = Math.max(-60, Math.min(60, ry + dx * 0.35));
      rx = Math.max(-40, Math.min(40, rx - dy * 0.3));
      vy = dx * 0.35;
      vx = -dy * 0.3;
    } else if (e.pointerType === "mouse") {
      var r = escenaLupa.getBoundingClientRect();
      metaY = ((e.clientX - r.left) / r.width - 0.5) * 24;
      metaX = -((e.clientY - r.top) / r.height - 0.5) * 18;
    }
  });
  function soltar() { agarrado = false; escenaLupa.classList.remove("agarrado"); }
  escenaLupa.addEventListener("pointerup", soltar);
  escenaLupa.addEventListener("pointercancel", soltar);
  escenaLupa.addEventListener("pointerleave", function () { if (!agarrado) { metaX = 0; metaY = 0; } });
  escenaLupa.addEventListener("dblclick", function () { metaZoom = metaZoom > 1 ? 1 : 1.6; });

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
    if (!agarrado) {
      var objX = giroscopio ? gx : metaX + (sinMovimiento ? 0 : Math.sin(t * 0.9) * 4);
      var objY = giroscopio ? gy : metaY + (sinMovimiento ? 0 : Math.sin(t * 0.6) * 9);
      vx += (objX - rx) * 0.06;
      vy += (objY - ry) * 0.06;
      vx *= 0.82;
      vy *= 0.82;
      rx += vx;
      ry += vy;
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

  // Para abrir un producto desde otra parte de la página (las piezas de la portada)
  window.LaReinaVitrina = {
    abrir: function (nombre) {
      var i = -1;
      PRODUCTOS.forEach(function (p, k) { if (i < 0 && p.nombre === nombre) i = k; });
      if (i < 0) return false;
      abrir(i, document.activeElement);
      return true;
    },
  };
})();
