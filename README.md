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
con el precio que tenían publicado. Para cambiar o agregar uno:

1. Guarda la foto en `img/productos/` (mejor en `.webp` o `.jpg`, de unos 720 px de ancho).
2. En `js/productos.js` copia un bloque y cambia `categoria`, `nombre`, `precio`, `unidad`, `detalle`, `foto`,
   `instagram` y `fecha`. Las categorías y sus filtros se arman solos.

Al tocar un producto se abre en grande: se gira arrastrando, se acerca con doble toque y, en celular, se puede
mover inclinando el teléfono.

## Productos en 3D

El 3D usa [Three.js](https://threejs.org) 0.185.1 desde jsDelivr (versión fija en el `importmap` de `index.html`).
Los siete productos (flor dorada, collar de perlas, carrete de hilo, botones, vela de soya, jabón artesanal y greca)
están modelados con código en `js/tienda3d.js`, en la lista `PRODUCTOS`: ahí se cambian nombres, textos y colores.

Para mostrar un producto **real** escaneado en 3D:

1. Escanearlo con el celular (por ejemplo Polycam o Luma AI) y exportarlo como `.glb`.
2. Guardarlo en una carpeta `modelos/` (por ejemplo `modelos/vela.glb`).
3. En `PRODUCTOS`, poner `modelo: "modelos/vela.glb"` en ese producto.

Si el navegador no puede mostrar 3D, la portada deja la ilustración y el showroom invita a escribir por WhatsApp.

## Cambios frecuentes

| Qué cambiar | Dónde |
|---|---|
| Número de WhatsApp | `js/main.js`, variable `WHATSAPP` (y los `href="https://wa.me/..."` de `index.html`) |
| Aviso de ofertas (franja de arriba) | `index.html`, bloque `<div class="promo" data-hasta="AAAA-MM-DD">`. Se oculta solo después de esa fecha. |
| Productos | `index.html`, sección `id="productos"` |
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
