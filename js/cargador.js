// La Reina Mercería RD — pantalla de carga.
// La barra sigue lo que de verdad se va cargando: la página, las fuentes, las fotos y el 3D.
(function () {
  "use strict";

  var raiz = document.documentElement;
  var el = document.getElementById("cargador");
  if (!el) { raiz.classList.remove("cargando"); return; }

  var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var repetida = false;
  try {
    repetida = sessionStorage.getItem("lareina-intro") === "1";
    sessionStorage.setItem("lareina-intro", "1");
  } catch (e) { /* modo privado */ }
  if (repetida) el.classList.add("rapido");

  var inicio = performance.now();
  var MINIMO = reducido ? 250 : repetida ? 450 : 1600;   // que la marca alcance a dibujarse, sin parpadeo
  var MAXIMO = 7000;                                      // nunca dejar a nadie esperando de más
  var PESO = { pagina: 20, fuentes: 20, fotos: 30, tres: 30 };
  var hecho = { pagina: false, fuentes: false, fotos: false, tres: false };
  var meta = 4;
  var mostrado = 0;
  var terminado = false;

  var barra = document.getElementById("cargador-barra");
  var pct = document.getElementById("cargador-pct");
  var texto = document.getElementById("cargador-texto");
  var aviso = document.getElementById("cargador-aviso");
  var principal = document.body;
  principal.setAttribute("aria-busy", "true");

  var FRASES = [
    [0, "Abriendo la tienda…"],
    [25, "Puliendo las perlas…"],
    [50, "Ensartando las cuentas…"],
    [75, "Calentando la greca…"],
    [100, "¡Todo listo!"],
  ];

  function marcar(paso) {
    if (hecho[paso]) return;
    hecho[paso] = true;
    meta = Object.keys(hecho).reduce(function (s, k) { return s + (hecho[k] ? PESO[k] : 0); }, 0);
  }
  function todoListo() { return hecho.pagina && hecho.fuentes && hecho.fotos && hecho.tres; }

  // 1. La página
  if (document.readyState !== "loading") marcar("pagina");
  else document.addEventListener("DOMContentLoaded", function () { marcar("pagina"); });
  // 2. Las fuentes
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { marcar("fuentes"); });
  else marcar("fuentes");
  // 3. Las fotos y archivos de la primera vista
  if (document.readyState === "complete") marcar("fotos");
  else window.addEventListener("load", function () { marcar("fotos"); });
  // 4. El 3D (o el aviso de que no hay 3D)
  var revisar3d = function () {
    if (raiz.classList.contains("tres-listo") || raiz.classList.contains("sin-3d")) marcar("tres");
  };
  revisar3d();
  new MutationObserver(revisar3d).observe(raiz, { attributes: true, attributeFilter: ["class"] });

  function pintar() {
    var n = Math.min(100, mostrado);
    if (barra) barra.style.transform = "scaleX(" + (n / 100).toFixed(4) + ")";
    if (pct) pct.textContent = Math.round(n) + "%";
    if (texto) {
      var frase = FRASES[0][1];
      FRASES.forEach(function (f) { if (n >= f[0]) frase = f[1]; });
      if (texto.textContent !== frase) texto.textContent = frase;
    }
  }

  function salir() {
    el.classList.add("saliendo");
    raiz.classList.remove("cargando");
    if (principal) principal.removeAttribute("aria-busy");
    if (aviso) aviso.textContent = "La página está lista.";
    var quitar = function () { el.hidden = true; };
    el.addEventListener("transitionend", function (e) { if (e.target === el) quitar(); });
    setTimeout(quitar, reducido ? 400 : 1300);
  }

  function terminar() {
    if (terminado) return;
    terminado = true;
    mostrado = 100;
    pintar();
    setTimeout(salir, reducido ? 0 : 280);
  }

  // Revisión aparte: termina aunque el navegador dé pocos cuadros (pestaña ocupada con el 3D)
  var vigia = setInterval(function () {
    var t = performance.now() - inicio;
    if ((todoListo() && t >= MINIMO + 500) || t >= MAXIMO) {
      clearInterval(vigia);
      terminar();
    }
  }, 200);

  // La barra avanza por tiempo real, no por cuadro
  var previo = null;
  function cuadro(ahora) {
    if (terminado) return;
    var dt = previo === null ? 16 : Math.min(ahora - previo, 300);
    previo = ahora;
    var t = ahora - inicio;
    var listo = todoListo();
    var objetivo = listo ? 100 : Math.min(98, meta + Math.min(18, t / 450));
    mostrado += (objetivo - mostrado) * (1 - Math.exp(-dt / (listo ? 110 : 260)));
    if ((listo && t >= MINIMO && mostrado >= 99.3) || t >= MAXIMO) {
      clearInterval(vigia);
      terminar();
      return;
    }
    pintar();
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);
})();
