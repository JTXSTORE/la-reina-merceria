// La Reina Mercería RD — «Mi pedido»: la persona junta productos y manda un solo mensaje por WhatsApp.
// Se guarda en el navegador (localStorage), así que no se pierde si cierran la página.
(function () {
  "use strict";

  var WHATSAPP = "18092415077";
  var CLAVE = "lareina-pedido-v1";
  var $ = function (id) { return document.getElementById(id); };
  var items = [];

  try { items = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { items = []; }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch (e) { /* modo privado */ }
    document.dispatchEvent(new CustomEvent("pedido:cambio"));
  }

  function leerPrecio(texto) {
    var m = /RD\$\s?([\d,]+(?:\.\d+)?)/.exec(texto || "");
    return m ? Number(m[1].replace(/,/g, "")) : null;
  }
  function plata(n) { return "RD$" + Math.round(n).toLocaleString("en-US"); }

  function total() {
    var suma = 0, faltan = false;
    items.forEach(function (it) {
      if (it.valor == null) faltan = true;
      else {
        suma += it.valor * it.cantidad;
        if (it.desde) faltan = true;
      }
    });
    return { suma: suma, faltan: faltan };
  }
  function cuantos() { return items.reduce(function (n, it) { return n + it.cantidad; }, 0); }
  function cantidadDe(clave) {
    var it = items.find(function (x) { return x.clave === clave; });
    return it ? it.cantidad : 0;
  }

  /* ---------- Aviso corto ---------- */
  var toast = $("toast");
  var tiempoToast = null;
  function avisar(texto) {
    if (!toast) return;
    toast.textContent = texto;
    toast.classList.add("visible");
    clearTimeout(tiempoToast);
    tiempoToast = setTimeout(function () { toast.classList.remove("visible"); }, 2400);
  }

  /* ---------- API pública ---------- */
  function agregar(p) {
    var clave = p.nombre + (p.variante ? " · " + p.variante : "");
    var it = items.find(function (x) { return x.clave === clave; });
    if (it) it.cantidad += 1;
    else {
      items.push({
        clave: clave, nombre: p.nombre, variante: p.variante || "", precio: p.precio || "",
        unidad: p.unidad || "", valor: leerPrecio(p.precio), desde: /desde/i.test(p.precio || ""),
        foto: p.foto || "", cantidad: 1,
      });
    }
    guardar();
    avisar("Agregado a tu pedido: " + p.nombre + (p.variante ? " (" + p.variante + ")" : ""));
    var b = $("pedido-abrir");
    if (b) {
      b.classList.remove("rebota");
      void b.offsetWidth;
      b.classList.add("rebota");
    }
    return clave;
  }
  window.LaReinaPedido = { agregar: agregar, cantidadDe: cantidadDe, abrir: abrir };

  /* ---------- Panel del pedido ---------- */
  var panel = $("pedido");
  var lista = $("pedido-lista");

  function mensaje() {
    var lineas = ["Hola, La Reina Mercería. Quiero hacer este pedido:", ""];
    items.forEach(function (it) {
      var nombre = it.nombre + (it.variante ? " (" + it.variante + ")" : "");
      var precio = it.valor != null
        ? " — " + (it.desde ? "desde " : "") + plata(it.valor) + (it.cantidad > 1 ? " c/u" : "")
        : " — precio por confirmar";
      lineas.push("• " + it.cantidad + " × " + nombre + precio);
    });
    var t = total();
    lineas.push("");
    if (t.suma > 0) lineas.push("Total estimado: " + plata(t.suma) + (t.faltan ? " (algunos precios por confirmar)" : ""));
    var sucursal = $("pedido-sucursal");
    if (sucursal && sucursal.value) lineas.push("Para retirar en: " + sucursal.value);
    var nombre = $("pedido-nombre");
    if (nombre && nombre.value.trim()) lineas.push("Nombre: " + nombre.value.trim());
    lineas.push("¿Me confirman disponibilidad? Gracias.");
    return lineas.join("\n");
  }

  function pintar() {
    var n = cuantos();
    var boton = $("pedido-abrir");
    if (boton) {
      boton.hidden = n === 0;
      $("pedido-n").textContent = String(n);
      boton.setAttribute("aria-label", "Ver mi pedido, " + n + (n === 1 ? " producto" : " productos"));
    }
    if (!lista) return;
    lista.replaceChildren();
    items.forEach(function (it, k) {
      var li = document.createElement("li");
      li.className = "pedido__item";
      if (it.foto) {
        var img = document.createElement("img");
        img.src = it.foto;
        img.alt = "";
        img.width = 56;
        img.height = 56;
        li.appendChild(img);
      } else {
        li.appendChild(document.createElement("span")).className = "pedido__sin-foto";
      }
      var texto = document.createElement("div");
      texto.className = "pedido__texto";
      var nom = document.createElement("p");
      nom.className = "pedido__nombre";
      nom.textContent = it.nombre;
      texto.appendChild(nom);
      var det = document.createElement("p");
      det.className = "pedido__detalle";
      det.textContent = [it.variante, it.precio ? it.precio + (it.unidad ? " " + it.unidad : "") : "Precio por confirmar"]
        .filter(Boolean).join(" · ");
      texto.appendChild(det);
      li.appendChild(texto);

      var ctrl = document.createElement("div");
      ctrl.className = "pedido__cantidad";
      var menos = document.createElement("button");
      menos.type = "button";
      menos.setAttribute("aria-label", "Quitar uno de " + it.nombre);
      menos.innerHTML = it.cantidad > 1
        ? '<svg class="icono" aria-hidden="true"><use href="#i-menos"/></svg>'
        : '<svg class="icono" aria-hidden="true"><use href="#i-basura"/></svg>';
      menos.addEventListener("click", function () {
        if (it.cantidad > 1) it.cantidad -= 1;
        else items.splice(k, 1);
        guardar();
      });
      var num = document.createElement("span");
      num.textContent = String(it.cantidad);
      num.setAttribute("aria-label", it.cantidad + " unidades");
      var mas = document.createElement("button");
      mas.type = "button";
      mas.setAttribute("aria-label", "Agregar otro " + it.nombre);
      mas.innerHTML = '<svg class="icono" aria-hidden="true"><use href="#i-mas"/></svg>';
      mas.addEventListener("click", function () { it.cantidad += 1; guardar(); });
      ctrl.append(menos, num, mas);
      li.appendChild(ctrl);
      lista.appendChild(li);
    });

    var vacio = n === 0;
    $("pedido-vacio").hidden = !vacio;
    $("pedido-pie").hidden = vacio;
    var t = total();
    $("pedido-total").textContent = t.suma > 0 ? plata(t.suma) : "Por confirmar";
    $("pedido-nota").textContent = t.faltan
      ? "Algunos precios se confirman por WhatsApp. Los precios son los publicados en Instagram."
      : "Precios publicados en Instagram; la tienda te confirma existencia.";
    $("pedido-enviar").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(mensaje());
  }

  function abrir() {
    if (!panel || typeof panel.showModal !== "function") return;
    pintar();
    panel.showModal();
    document.documentElement.classList.add("pedido-abierto");
  }

  if (panel) {
    $("pedido-abrir").addEventListener("click", abrir);
    $("pedido-cerrar").addEventListener("click", function () { panel.close(); });
    panel.addEventListener("click", function (e) { if (e.target === panel) panel.close(); });
    panel.addEventListener("close", function () { document.documentElement.classList.remove("pedido-abierto"); });
    $("pedido-vaciar").addEventListener("click", function () { items = []; guardar(); });
    $("pedido-sucursal").addEventListener("change", pintar);
    $("pedido-nombre").addEventListener("input", function () {
      $("pedido-enviar").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(mensaje());
    });
  }

  document.addEventListener("pedido:cambio", pintar);
  pintar();
})();
