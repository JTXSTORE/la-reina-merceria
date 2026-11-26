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
js/tienda3d.js    portada con productos reales en 3D, showroom «Tómalo en tus manos» y su video
video/            video del set de trébol (AV1 + H.264) y su portada
img/productos/    fotos de la vitrina (WebP, tomadas de @mercerialareina2)
img/portada/      productos reales sin fondo y su relieve, para la portada
servidor_local.py para ver la página en la computadora (con saltos en el video)
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

## Portada con productos reales

En la portada flotan siete productos de la tienda sacados de sus fotos de Instagram en la mejor resolución
que había (hasta 1200×1600): hilo Madame Tricote Maxi, greca rosada, collar chicle en su busto, set de trébol en
su tarjeta, maxi dijes de corazón, cordón de yute y abanico. A cada foto se le quitó el fondo y se le hizo un
mapa de relieve, con el que el navegador la levanta en 3D (la pieza tiene volumen, se mece y le da la luz).
La greca y el hilo usan relieve de cilindro (cada fila se curva como un tubo, como el objeto real), así no se
deforman al girar.

- `img/portada/<id>.webp`: la foto sin fondo (720 px de lado mayor).
- `img/portada/<id>-relieve.png`: el relieve (blanco = lo más alto).
- En `js/tienda3d.js`, `PIEZAS_PORTADA` dice dónde va cada pieza, su tamaño, cuánto volumen tiene (`grosor`),
  cuánto brilla y qué abre al tocarla: el showroom (`tres`) o la vista de cerca de la vitrina (`vitrina`, por
  el nombre exacto del producto en `js/productos.js`).

## Video del set de trébol (showroom)

El showroom abre con el video del set de trébol (`video/`), rehecho a partir del reel de la tienda del
25 de noviembre de 2026: formato 4:5 a 1080×1350 sin franjas negras, sin las transiciones que giraban el cuadro,
con las tarjetas de producto limpias (se promediaron sus cuadros para quitar el ruido de compresión) y un
acercamiento lento de cámara. No lleva sonido: la canción del reel tiene derechos de autor.

- `video/trebol-av1.mp4` (AV1, más liviano) y `video/trebol.mp4` (H.264, para los navegadores que no tienen AV1).
- `video/trebol-poster.webp` es la imagen que se ve antes de que cargue.
- Solo se descarga cuando la persona se acerca al showroom, se pausa cuando sale de la pantalla y no arranca solo si
  la persona tiene «reducir movimiento» o el ahorro de datos activado.
- Los colores del panel llevan el video a ese color y lo dejan quieto; el botón de abajo («Elegir») toma el color
  que se está viendo. Los tramos de cada color están en `CAPITULOS`, al inicio de `js/tienda3d.js`; si se cambia el
  video hay que actualizar esos tiempos.
- Las miniaturas `img/productos/mini/trebol-<color>-<material>.webp` son las fotos que salen en «Mi pedido».

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

Levantar el servidor local que viene con la página:

```
python servidor_local.py
```

y entrar a http://localhost:4180. (Con `python -m http.server` la página abre, pero los colores del video no
llevan a su tramo: ese servidor no deja saltar dentro de los videos.)

## Publicar en GitHub Pages

En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
rama `main`, carpeta `/ (root)`. La página queda en `https://<usuario>.github.io/<repositorio>/`.
