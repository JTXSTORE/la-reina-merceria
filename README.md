# La Reina Mercería RD — página web

Página de presentación de **La Reina Mercería RD | Suministros & Manualidades** (Santiago, República Dominicana).
Es un sitio estático (HTML, CSS y JavaScript sin dependencias) pensado para publicarse gratis con **GitHub Pages**.

## Estructura

```
index.html        la página completa
css/estilos.css   colores, tipografía y diseño
js/main.js        menú móvil, enlaces de WhatsApp, aviso de temporada, tarjetas que se inclinan
js/productos.js   los productos de la vitrina (nombre, precio, foto, publicación de Instagram)
js/vitrina.js     vitrina con filtros y la vista de cerca para girar cada producto
js/tienda3d.js    productos en 3D (portada flotante y showroom «Tómalo en tus manos»)
img/productos/    fotos de la vitrina (WebP, tomadas de @mercerialareina2)
img/favicon.svg   ícono de la pestaña
```

## Vitrina (productos reales)

Los 43 productos salen de las publicaciones de Instagram de @mercerialareina2 de octubre y noviembre de 2026,
con el precio que tenían publicado. Se muestran en un carrusel 3D (se desliza con el dedo, el mouse, las flechas
o las miniaturas) con filtros por categoría. Para cambiar o agregar uno:

1. Guarda la foto en `img/productos/<nombre>.webp` (unos 1000 px de ancho) y una miniatura cuadrada de 200 px
   con el mismo nombre en `img/productos/mini/`.
2. En `js/productos.js` copia un bloque y cambia `categoria`, `nombre`, `precio`, `unidad`, `detalle`, `foto`,
   `instagram` y `fecha`. Las categorías y sus filtros se arman solos.

Al tocar el producto del centro se abre en grande: se gira arrastrando, se acerca con doble toque y, en celular,
se puede mover inclinando el teléfono.

## Productos reales en 3D

En el showroom «Tómalo en tus manos» hay tres productos de la tienda modelados en 3D a partir de sus fotos
(`js/tienda3d.js`): la greca de 3 tazas (6 colores), el set collar y topos de trébol, y el collar chicle
(rojo vino, ámbar o marrón, con dije de caracol, corazón o estrella de mar). En `js/productos.js`, el campo
`tres: { id, opciones }` pone el botón «Ver en 3D» en la vitrina.

## Mi pedido (por WhatsApp)

`js/pedido.js`. En la vitrina, en la vista de cerca y en el showroom 3D hay «Agregar al pedido». La bolsita
flotante abre un panel con los productos, cantidades, total estimado (con los precios publicados), sucursal para
retirar y nombre opcional; «Enviar pedido por WhatsApp» manda todo en un solo mensaje. El pedido se guarda en el
navegador de la persona (localStorage), no en ningún servidor.

## Animaciones

Pantalla de carga de marca (`js/cargador.js`): la corona se dibuja, «La Reina» sube letra por letra y la barra
sigue la carga real (página, fuentes, fotos y 3D). Dura al menos 1.6 s la primera vez para que se vea la marca,
la mitad en las siguientes visitas de la sesión, y nunca más de 7 s; al terminar se levanta como un telón.

Portada con aurora animada y título que aparece palabra por palabra, cinta de categorías, barra de progreso,
cabecera que se compacta al bajar, botones «magnéticos», transición de la foto a la vista de cerca y bloques que
entran suaves al bajar. Si la persona tiene activado «reducir movimiento» en su equipo, todo eso se apaga y el
carrusel no avanza solo (tiene botón de pausa).

## Cambios frecuentes

| Qué cambiar | Dónde |
|---|---|
| Número de WhatsApp | `js/main.js`, variable `WHATSAPP` (y los `href="https://wa.me/..."` de `index.html`) |
| Aviso de ofertas (franja de arriba) | `index.html`, bloque `<div class="promo" data-hasta="AAAA-MM-DD">`. Se oculta solo después de esa fecha. |
| Productos de la vitrina | `js/productos.js` (fotos en `img/productos/` y `img/productos/mini/`) |
| Sucursales, teléfonos y horario | `index.html`, sección `id="sucursales"` (hay un comentario `PENDIENTE` para el horario) |
| Colores | `css/estilos.css`, variables al inicio (`--verde`, `--magenta`, …) |

## Verla en la computadora

Abrir `index.html` con doble clic, o levantar un servidor local:

```
python -m http.server 4180
```

y entrar a http://localhost:4180

## Publicar en GitHub Pages

En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
rama `main`, carpeta `/ (root)`. La página queda en `https://<usuario>.github.io/<repositorio>/`.
