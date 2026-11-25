/* =========================================================
   La Reina Mercería RD — productos en 3D (Three.js)

   Los productos se modelan aquí mismo con geometría y materiales
   (no hay archivos 3D que descargar). Si más adelante escanean un
   producto real (por ejemplo con Polycam o Luma AI en el celular),
   exporten un .glb, pónganlo en la carpeta modelos/ y escriban su
   ruta en el campo «modelo» del producto: el visor lo usará en vez
   del modelo dibujado.
   ========================================================= */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const V2 = THREE.Vector2;
const V3 = THREE.Vector3;
const WHATSAPP = "18092415077";
const MOV_REDUCIDO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Texturas dibujadas en canvas ---------------- */

function lienzo(ancho, alto, dibujar) {
  const c = document.createElement("canvas");
  c.width = ancho;
  c.height = alto;
  dibujar(c.getContext("2d"), ancho, alto);
  return c;
}

function textura(c, esColor = true) {
  const t = new THREE.CanvasTexture(c);
  if (esColor) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function texturaRadial(paradas) {
  return textura(lienzo(128, 128, (x) => {
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    paradas.forEach(([p, c]) => g.addColorStop(p, c));
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
  }));
}

/* ---------------- Materiales ---------------- */

const matOro = () => new THREE.MeshPhysicalMaterial({
  color: 0xf0bd45, metalness: 1, roughness: 0.24, clearcoat: 0.3, clearcoatRoughness: 0.2,
});

const matPerla = () => new THREE.MeshPhysicalMaterial({
  color: 0xfff5e8, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06,
  iridescence: 0.9, iridescenceIOR: 1.6, iridescenceThicknessRange: [220, 480],
  sheen: 0.6, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xffe3ef),
});

/* ---------------- Modelos ---------------- */

function crearCarrete() {
  const g = new THREE.Group();
  const color = "#C2185B";

  const madera = new THREE.MeshStandardMaterial({ color: 0xc99360, roughness: 0.55 });
  const tapa = new THREE.LatheGeometry([
    new V2(0.17, -0.08), new V2(0.74, -0.08), new V2(0.8, -0.03),
    new V2(0.8, 0.03), new V2(0.74, 0.08), new V2(0.17, 0.08), new V2(0.17, -0.08),
  ], 72);
  const arriba = new THREE.Mesh(tapa, madera);
  arriba.position.y = 0.9;
  const abajo = new THREE.Mesh(tapa, madera);
  abajo.position.y = -0.9;

  const nucleo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.17, 1.96, 32, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x5b3b22, roughness: 0.8, side: THREE.DoubleSide }),
  );

  // Hilo enrollado: perfil un poco abombado, con vueltas dibujadas y relieve
  const perfil = [];
  for (let i = 0; i <= 24; i++) {
    const y = -0.82 + (1.64 * i) / 24;
    const k = y / 0.82;
    perfil.push(new V2(0.6 + 0.05 * (1 - k * k), y));
  }
  const mapa = textura(lienzo(64, 1024, (x, w, h) => {
    x.fillStyle = color;
    x.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 5) {
      x.fillStyle = "rgba(255,255,255,.28)";
      x.fillRect(0, y, w, 1.6);
      x.fillStyle = "rgba(0,0,0,.22)";
      x.fillRect(0, y + 2.5, w, 1.2);
    }
  }));
  const relieve = textura(lienzo(64, 1024, (x, w, h) => {
    x.fillStyle = "#808080";
    x.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 5) {
      x.fillStyle = "#fff";
      x.fillRect(0, y, w, 2);
      x.fillStyle = "#000";
      x.fillRect(0, y + 3, w, 1);
    }
  }), false);
  const hilo = new THREE.Mesh(
    new THREE.LatheGeometry(perfil, 96),
    new THREE.MeshPhysicalMaterial({
      map: mapa, bumpMap: relieve, bumpScale: 1.5, roughness: 0.6,
      sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color(0xffc2da),
    }),
  );

  // Hebra suelta
  const curva = new THREE.CatmullRomCurve3([
    new V3(0.62, 0.35, 0.05), new V3(0.9, 0.2, 0.35), new V3(1.1, -0.2, 0.55),
    new V3(1.0, -0.6, 0.85), new V3(0.75, -0.95, 1.0),
  ]);
  const hebra = new THREE.Mesh(
    new THREE.TubeGeometry(curva, 64, 0.014, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
  );

  g.add(arriba, abajo, nucleo, hilo, hebra);
  return g;
}

function formaBoton(r, rHoyo, s) {
  const forma = new THREE.Shape();
  forma.absarc(0, 0, r, 0, Math.PI * 2, false);
  for (const [x, y] of [[-s, -s], [s, -s], [s, s], [-s, s]]) {
    const hoyo = new THREE.Path();
    hoyo.absarc(x, y, rHoyo, 0, Math.PI * 2, true);
    forma.holes.push(hoyo);
  }
  return forma;
}

function boton(color, extra = {}) {
  const geo = new THREE.ExtrudeGeometry(formaBoton(0.9, 0.11, 0.24), {
    depth: 0.1, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07,
    bevelSegments: 8, curveSegments: 72,
  });
  geo.center();
  const mat = new THREE.MeshPhysicalMaterial({
    color, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, ...extra,
  });
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, mat));
  const borde = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.045, 16, 96), mat);
  borde.position.z = 0.12;
  g.add(borde);
  return g;
}

function hiloCruzado(s, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  for (const [a, b] of [[[-s, -s], [s, s]], [[s, -s], [-s, s]]]) {
    const c = new THREE.QuadraticBezierCurve3(
      new V3(a[0], a[1], 0.08), new V3(0, 0, 0.21), new V3(b[0], b[1], 0.08),
    );
    g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 24, 0.04, 8), mat));
  }
  return g;
}

function crearBotones() {
  const g = new THREE.Group();
  const grande = boton(0x5db531);
  grande.add(hiloCruzado(0.24, "#C2185B"));
  grande.rotation.set(-0.15, 0.25, 0);

  const dorado = boton(0xe9b64a, { metalness: 0.6, roughness: 0.3 });
  dorado.scale.setScalar(0.5);
  dorado.position.set(0.95, -0.75, -0.35);
  dorado.rotation.set(-0.3, -0.5, 0.4);

  const rosado = boton(0xd63c7e);
  rosado.scale.setScalar(0.42);
  rosado.position.set(-0.9, 0.8, -0.3);
  rosado.rotation.set(0.4, 0.6, -0.2);

  g.add(grande, dorado, rosado);
  return g;
}

function texturaEtiqueta() {
  return textura(lienzo(1024, 256, (x, w) => {
    x.fillStyle = "#EFE3CF";
    x.fillRect(0, 0, w, 256);
    x.fillStyle = "#2F7A16";
    x.fillRect(0, 16, w, 6);
    x.fillRect(0, 234, w, 6);
    x.textAlign = "center";
    for (const cx of [256, 768]) {
      x.fillStyle = "#2F7A16";
      x.font = "700 84px Fredoka, sans-serif";
      x.fillText("La Reina", cx, 125);
      x.fillStyle = "#C2185B";
      x.font = "700 38px Cabin, sans-serif";
      x.fillText("CERA DE SOYA", cx, 190);
    }
  }));
}

function crearVela() {
  const g = new THREE.Group();

  const frasco = new THREE.Mesh(
    new THREE.LatheGeometry([
      new V2(0, -0.92), new V2(0.6, -0.92), new V2(0.7, -0.86), new V2(0.73, -0.74),
      new V2(0.73, 0.78), new V2(0.71, 0.83), new V2(0.67, 0.81), new V2(0.67, -0.76),
      new V2(0.6, -0.8), new V2(0, -0.8),
    ], 72),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transmission: 1, roughness: 0.05, thickness: 0.12, ior: 1.5,
      side: THREE.DoubleSide,
    }),
  );

  const cera = new THREE.Mesh(
    new THREE.CylinderGeometry(0.66, 0.66, 1.1, 72),
    new THREE.MeshPhysicalMaterial({
      color: 0xf6ecdd, roughness: 0.8, sheen: 0.6, sheenColor: new THREE.Color(0xfff1dc),
      emissive: 0x3a1c00, emissiveIntensity: 0.25,
    }),
  );
  cera.position.y = -0.24;

  const etiqueta = new THREE.Mesh(
    new THREE.CylinderGeometry(0.738, 0.738, 0.66, 72, 1, true, -Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: texturaEtiqueta(), roughness: 0.85 }),
  );
  etiqueta.position.y = -0.12;

  const mecha = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x2a1f17 }),
  );
  mecha.position.y = 0.4;

  const llama = new THREE.Group();
  llama.position.y = 0.62;
  const exterior = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xffa43a, transparent: true, opacity: 0.8, depthWrite: false }),
  );
  exterior.scale.set(1, 2.3, 1);
  const interior = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xfff4c2 }),
  );
  interior.scale.set(1, 2, 1);
  interior.position.y = -0.05;
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texturaRadial([[0, "rgba(255,190,110,.9)"], [0.35, "rgba(255,150,60,.35)"], [1, "rgba(255,120,40,0)"]]),
    transparent: true, depthWrite: false,
  }));
  halo.scale.setScalar(0.75);
  const luz = new THREE.PointLight(0xffa04a, 2.5, 3, 2);
  llama.add(halo, exterior, interior, luz);

  g.add(cera, etiqueta, mecha, llama, frasco);
  g.userData.actualizar = (t) => {
    const f = Math.sin(t * 17) * 0.5 + Math.sin(t * 7.3) * 0.5;
    exterior.scale.y = 2.3 + f * 0.2;
    llama.rotation.z = f * 0.05;
    luz.intensity = 2.3 + f * 0.5;
  };
  return g;
}

function crearJabon() {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xb394ea, roughness: 0.22, transmission: 0.6, thickness: 1.0, ior: 1.42,
    attenuationColor: new THREE.Color(0x6c3fc0), attenuationDistance: 1.5,
    clearcoat: 0.5, clearcoatRoughness: 0.2,
  });
  g.add(new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.55, 1.3, 6, 0.2), mat));
  const bulto = new THREE.SphereGeometry(0.24, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const x of [-0.6, 0, 0.6]) {
    for (const z of [-0.3, 0.3]) {
      const m = new THREE.Mesh(bulto, mat);
      m.position.set(x, 0.26, z);
      m.scale.set(1, 0.8, 1.1);
      g.add(m);
    }
  }
  return g;
}

function crearPerlas() {
  const g = new THREE.Group();
  const puntos = [];
  const n = 18;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const caida = Math.cos(a) < 0 ? 1.25 : 1;
    puntos.push(new V3(Math.sin(a), Math.cos(a) * 0.9 * caida + 0.1, Math.sin(a * 2) * 0.12));
  }
  const curva = new THREE.CatmullRomCurve3(puntos, true, "centripetal");
  const r = 0.072;
  const cuantas = Math.floor(curva.getLength() / (r * 2.08));
  const perlas = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 32, 24), matPerla(), cuantas - 2);
  const m = new THREE.Matrix4();
  let k = 0;
  for (let i = 1; i < cuantas - 1; i++) {
    const p = curva.getPointAt(i / cuantas);
    m.makeTranslation(p.x, p.y, p.z);
    perlas.setMatrixAt(k++, m);
  }
  perlas.computeBoundingSphere();
  perlas.computeBoundingBox();

  const oro = matOro();
  const broche = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.022, 12, 32), oro);
  broche.position.copy(curva.getPointAt(0));
  broche.rotation.y = Math.PI / 2;

  const abajo = curva.getPointAt(0.5);
  const argolla = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.014, 10, 24), oro);
  argolla.position.set(abajo.x, abajo.y - 0.1, abajo.z);
  const dije = new THREE.Mesh(new THREE.SphereGeometry(0.16, 48, 32), matPerla());
  dije.position.set(abajo.x, abajo.y - 0.3, abajo.z);
  const casquillo = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), oro);
  casquillo.position.set(abajo.x, abajo.y - 0.17, abajo.z);

  g.add(perlas, broche, argolla, dije, casquillo);
  return g;
}

function crearFlor() {
  const g = new THREE.Group();
  const petalo = new THREE.Shape();
  petalo.moveTo(0, 0.05);
  petalo.bezierCurveTo(0.38, 0.2, 0.46, 0.78, 0, 1.0);
  petalo.bezierCurveTo(-0.46, 0.78, -0.38, 0.2, 0, 0.05);
  const geo = new THREE.ExtrudeGeometry(petalo, {
    depth: 0.04, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04,
    bevelSegments: 6, curveSegments: 40,
  });
  const oro = matOro();
  const nervio = new THREE.TubeGeometry(
    new THREE.LineCurve3(new V3(0, 0.25, 0.09), new V3(0, 0.82, 0.09)), 8, 0.016, 8,
  );
  for (let i = 0; i < 5; i++) {
    const pivote = new THREE.Group();
    pivote.rotation.z = (i * Math.PI * 2) / 5;
    const m = new THREE.Mesh(geo, oro);
    m.rotation.x = 0.32;
    m.add(new THREE.Mesh(nervio, oro));
    pivote.add(m);
    g.add(pivote);
  }
  const centro = new THREE.Mesh(new THREE.SphereGeometry(0.2, 48, 32), matPerla());
  centro.position.z = 0.14;
  g.add(centro);
  const bolita = new THREE.SphereGeometry(0.045, 16, 12);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const b = new THREE.Mesh(bolita, oro);
    b.position.set(Math.cos(a) * 0.27, Math.sin(a) * 0.27, 0.1);
    g.add(b);
  }
  const argolla = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.026, 12, 32), oro);
  argolla.position.y = 1.06;
  g.add(argolla);
  return g;
}

function crearGreca() {
  const g = new THREE.Group();
  const acero = new THREE.MeshStandardMaterial({ color: 0xe6e8ec, metalness: 1, roughness: 0.2, flatShading: true });
  const negro = new THREE.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 0.45 });

  const cuerpo = new THREE.Mesh(new THREE.LatheGeometry([
    new V2(0, -1.0), new V2(0.56, -1.0), new V2(0.62, -0.94),
    new V2(0.5, -0.14), new V2(0.53, -0.14), new V2(0.53, 0.02), new V2(0.49, 0.02),
    new V2(0.6, 0.82), new V2(0.63, 0.86), new V2(0.6, 0.9),
    new V2(0.42, 0.98), new V2(0.15, 1.02), new V2(0, 1.02),
  ], 8, Math.PI / 8), acero);

  const perilla = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.14, 16), negro);
  perilla.position.y = 1.09;

  const asa = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new V3(-0.55, 0.74, 0), new V3(-0.92, 0.7, 0), new V3(-1.02, 0.45, 0),
    new V3(-0.95, 0.15, 0), new V3(-0.5, 0.12, 0),
  ]), 48, 0.07, 12), negro);

  const pico = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 4), acero);
  pico.rotation.z = -Math.PI / 2;
  pico.position.set(0.66, 0.84, 0);

  g.add(cuerpo, perilla, asa, pico);
  return g;
}

/* ---------------- Catálogo del showroom ---------------- */

const PRODUCTOS = [
  {
    id: "flor", nombre: "Flor dorada", categoria: "Bisutería", color: "#E9B64A",
    desc: "Pieza dorada de cinco pétalos con perla al centro, para aretes, collares y prendedores.",
    crear: crearFlor, modelo: null,
  },
  {
    id: "perlas", nombre: "Collar de perlas", categoria: "Bisutería", color: "#EADCC6", pose: [-0.35, 0, 0],
    desc: "Perlas con brillo nacarado para armar collares, pulseras y detalles de fiesta.",
    crear: crearPerlas, modelo: null,
  },
  {
    id: "carrete", nombre: "Carrete de hilo", categoria: "Mercería", color: "#C2185B", pose: [0, 0, 0.12],
    desc: "Hilo resistente en colores vivos para coser, bordar y reparar.",
    crear: crearCarrete, modelo: null,
  },
  {
    id: "boton", nombre: "Botones", categoria: "Mercería", color: "#5DB531",
    desc: "Botones de cuatro hoyos en colores y tamaños para ropa y manualidades.",
    crear: crearBotones, modelo: null,
  },
  {
    id: "vela", nombre: "Vela de soya", categoria: "Velas y cera de soya", color: "#F2A93B",
    desc: "Cera de soya en envase de vidrio, lista para aromatizar y regalar. También vendemos la cera para que hagas las tuyas.",
    crear: crearVela, modelo: null,
  },
  {
    id: "jabon", nombre: "Jabón artesanal", categoria: "Jabonería", color: "#A98BDB", pose: [0, -0.35, 0],
    desc: "Jabón de glicerina con relieve masajeador, hecho con base para jabón y moldes de silicona.",
    crear: crearJabon, modelo: null,
  },
  {
    id: "greca", nombre: "Greca de acero", categoria: "Hogar y cocina", color: "#B8BCC4", pose: [0, 0.35, 0],
    desc: "Greca de acero inoxidable para 3 tazas, para el cafecito de todos los días.",
    crear: crearGreca, modelo: null,
  },
];

/* ---------------- Utilidades ---------------- */

function crearRenderer(host, etiqueta) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.05;
  r.setClearColor(0x000000, 0);
  r.domElement.setAttribute("role", "img");
  r.domElement.setAttribute("aria-label", etiqueta);
  host.appendChild(r.domElement);
  return r;
}

function ajustarTamano(renderer, camara, host, alCambiar) {
  const cambiar = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    if (alCambiar) alCambiar(w / h);
    camara.updateProjectionMatrix();
  };
  new ResizeObserver(cambiar).observe(host);
  cambiar();
}

function entorno(renderer) {
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  pm.dispose();
  return tex;
}

function cuandoVisible(elemento, alCambiar) {
  new IntersectionObserver(([e]) => alCambiar(e.isIntersecting), { rootMargin: "120px" }).observe(elemento);
}

// Centra el objeto y lo escala para que su lado mayor mida «tam»
function encuadrar(objeto, tam) {
  objeto.updateMatrixWorld(true);
  const caja = new THREE.Box3().setFromObject(objeto);
  const medida = caja.getSize(new V3());
  const centro = caja.getCenter(new V3());
  objeto.position.sub(centro);
  const pivote = new THREE.Group();
  pivote.add(objeto);
  const k = tam / Math.max(medida.x, medida.y, medida.z);
  pivote.scale.setScalar(k);
  pivote.userData.escala = k;
  pivote.userData.actualizar = objeto.userData.actualizar;
  return pivote;
}

function liberar(objeto) {
  objeto.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    mats.forEach((m) => {
      Object.values(m).forEach((v) => { if (v && v.isTexture) v.dispose(); });
      m.dispose();
    });
  });
}

async function construir(p) {
  let obj = null;
  if (p.modelo) {
    try {
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      obj = (await new GLTFLoader().loadAsync(p.modelo)).scene;
    } catch (e) {
      console.warn("No se pudo cargar el modelo 3D de", p.nombre, e);
    }
  }
  if (!obj) obj = p.crear();
  if (p.pose) obj.rotation.set(...p.pose);
  return obj;
}

const rebote = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/* ---------------- Portada: productos flotando ---------------- */

const DISPOSICION = [
  { id: "carrete", pos: [-1.4, 0.95, 0], tam: 1.55, rot: [0.25, 0.4, 0.3] },
  { id: "flor", pos: [1.45, 1.05, 0.3], tam: 1.2, rot: [0.15, -0.3, 0.2] },
  { id: "vela", pos: [0.2, -0.05, 0.6], tam: 1.45, rot: [0.12, 0, 0] },
  { id: "jabon", pos: [1.55, -1.1, 0], tam: 1.35, rot: [0.2, -0.4, 0.1] },
  { id: "boton", pos: [-1.45, -0.95, 0.35], tam: 1.25, rot: [0.1, 0.35, 0] },
  { id: "perlas", pos: [-0.1, -1.7, -0.4], tam: 1.5, rot: [-0.7, 0, 0.12] },
  { id: "greca", pos: [0.1, 1.55, -1.3], tam: 1.2, rot: [0.1, 0.5, 0] },
];

function iniciarPortada(host, alElegir) {
  const renderer = crearRenderer(host,
    "Productos de La Reina Mercería en 3D: hilo, botones, vela, jabón, perlas, flor dorada y greca. Toca uno para verlo de cerca.");
  const escena = new THREE.Scene();
  escena.environment = entorno(renderer);
  const camara = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
  camara.position.set(0, 0, 8);

  const sol = new THREE.DirectionalLight(0xfff1e4, 1.8);
  sol.position.set(3, 5, 5);
  escena.add(sol, new THREE.HemisphereLight(0xfff0f6, 0xdff0d0, 0.7));

  const grupo = new THREE.Group();
  escena.add(grupo);
  const piezas = DISPOSICION.map((d, i) => {
    const p = PRODUCTOS.find((x) => x.id === d.id);
    const obj = p.crear();
    if (p.pose) obj.rotation.set(...p.pose);
    const pieza = encuadrar(obj, d.tam);
    pieza.position.set(...d.pos);
    pieza.rotation.set(...d.rot);
    Object.assign(pieza.userData, { id: d.id, baseY: d.pos[1], fase: i * 1.3, giro: 0.12 + (i % 3) * 0.06, foco: 0 });
    grupo.add(pieza);
    return pieza;
  });

  ajustarTamano(renderer, camara, host, (aspecto) => {
    camara.position.z = aspecto < 1 ? 8 / Math.pow(aspecto, 0.85) : 8;
  });

  const puntero = new V2();
  const ndc = new V2();
  const rayo = new THREE.Raycaster();
  let dentro = false;

  const aNdc = (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const piezaBajo = () => {
    rayo.setFromCamera(ndc, camara);
    const toque = rayo.intersectObjects(piezas, true)[0];
    let o = toque ? toque.object : null;
    while (o && !o.userData.id) o = o.parent;
    return o;
  };

  window.addEventListener("pointermove", (e) => {
    puntero.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    aNdc(e);
  }, { passive: true });

  renderer.domElement.addEventListener("click", (e) => {
    aNdc(e);
    const p = piezaBajo();
    if (p) alElegir(p.userData.id);
  });

  let t = 0;
  let previo = null;
  let primero = true;
  function cuadro(ahora) {
    const dt = previo === null ? 1 / 60 : Math.min((ahora - previo) / 1000, 0.05);
    previo = ahora;
    t += dt;
    const sobre = dentro ? piezaBajo() : null;
    renderer.domElement.style.cursor = sobre ? "pointer" : "";
    for (const p of piezas) {
      const u = p.userData;
      if (!MOV_REDUCIDO) {
        p.position.y = u.baseY + Math.sin(t * 0.9 + u.fase) * 0.09;
        p.rotation.y += dt * u.giro;
      }
      u.foco += ((p === sobre ? 1 : 0) - u.foco) * 0.15;
      p.scale.setScalar(u.escala * (1 + u.foco * 0.12));
      if (u.actualizar) u.actualizar(t);
    }
    const objX = MOV_REDUCIDO ? 0 : puntero.y * 0.16;
    const objY = MOV_REDUCIDO ? 0 : puntero.x * 0.28;
    grupo.rotation.x += (objX - grupo.rotation.x) * 0.05;
    grupo.rotation.y += (objY - grupo.rotation.y) * 0.05;
    renderer.render(escena, camara);
    if (primero) {
      primero = false;
      host.classList.add("listo");
    }
  }
  cuandoVisible(host, (v) => renderer.setAnimationLoop(v ? cuadro : null));
}

/* ---------------- Showroom: un producto en las manos ---------------- */

function iniciarVisor(ui) {
  const host = ui.escena;
  const renderer = crearRenderer(host,
    "Visor 3D del producto elegido. Arrastra para girarlo; usa la rueda, pellizca o los botones para acercarlo.");
  renderer.domElement.tabIndex = 0;

  const escena = new THREE.Scene();
  escena.environment = entorno(renderer);
  escena.environmentIntensity = 0.9;

  const camara = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  camara.position.set(0, 1.5, 4.8);
  ajustarTamano(renderer, camara, host);

  const controles = new OrbitControls(camara, renderer.domElement);
  Object.assign(controles, {
    enableDamping: true, dampingFactor: 0.08, enablePan: false,
    minDistance: 2.6, maxDistance: 7.5,
    minPolarAngle: Math.PI * 0.12, maxPolarAngle: Math.PI * 0.62,
    autoRotate: !MOV_REDUCIDO, autoRotateSpeed: 1.4,
  });
  controles.target.set(0, -0.1, 0);
  controles.update();
  controles.saveState();

  const clave = new THREE.DirectionalLight(0xffffff, 2.4);
  clave.position.set(3, 5, 4);
  const contra = new THREE.DirectionalLight(0xff6fa8, 2.0);
  contra.position.set(-4, 2.5, -3.5);
  const relleno = new THREE.DirectionalLight(0xbfffa0, 0.5);
  relleno.position.set(-3, -1, 3);
  escena.add(clave, contra, relleno);

  // Pedestal de exhibición
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.45, 0.14, 96),
    new THREE.MeshStandardMaterial({ color: 0x1a0811, roughness: 0.6, metalness: 0.1, envMapIntensity: 0.15 }),
  );
  pedestal.position.y = -1.32;
  const aro = new THREE.Mesh(
    new THREE.TorusGeometry(1.36, 0.012, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0xff5a9e, transparent: true, opacity: 0.7 }),
  );
  aro.rotation.x = Math.PI / 2;
  aro.position.y = -1.245;
  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.6),
    new THREE.MeshBasicMaterial({
      map: texturaRadial([[0, "rgba(0,0,0,.6)"], [1, "rgba(0,0,0,0)"]]), transparent: true, depthWrite: false,
    }),
  );
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = -1.245;
  escena.add(pedestal, aro, sombra);

  const soporte = new THREE.Group();
  escena.add(soporte);

  let actual = null;
  let idActual = null;
  let peticion = 0;
  let entrada = 1;

  // Botones para elegir producto
  PRODUCTOS.forEach((p) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.id = p.id;
    b.setAttribute("aria-pressed", "false");
    const punto = document.createElement("span");
    punto.className = "chip__punto";
    punto.style.setProperty("--c", p.color);
    b.append(punto, document.createTextNode(p.nombre));
    b.addEventListener("click", () => seleccionar(p.id));
    ui.chips.appendChild(b);
  });

  function mostrarDatos(p) {
    ui.categoria.textContent = p.categoria;
    ui.nombre.textContent = p.nombre;
    ui.desc.textContent = p.desc;
    ui.whatsapp.href = "https://wa.me/" + WHATSAPP + "?text=" +
      encodeURIComponent("Hola, La Reina Mercería. Me interesa: " + p.nombre + ". ¿Lo tienen disponible?");
    ui.chips.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === p.id)));
    ui.anuncio.textContent = p.nombre + ", en 3D.";
  }

  async function seleccionar(id) {
    const p = PRODUCTOS.find((x) => x.id === id);
    if (!p || id === idActual) return;
    idActual = id;
    const mia = ++peticion;
    mostrarDatos(p);
    const obj = await construir(p);
    if (mia !== peticion) {
      liberar(obj);
      return;
    }
    if (actual) {
      soporte.remove(actual);
      liberar(actual);
    }
    actual = encuadrar(obj, 2.15);
    soporte.add(actual);
    entrada = MOV_REDUCIDO ? 1 : 0;
  }

  // Controles
  ui.girar.setAttribute("aria-pressed", String(controles.autoRotate));
  ui.girar.addEventListener("click", () => {
    controles.autoRotate = !controles.autoRotate;
    ui.girar.setAttribute("aria-pressed", String(controles.autoRotate));
  });
  ui.reiniciar.addEventListener("click", () => controles.reset());
  const acercar = (f) => {
    const d = camara.position.clone().sub(controles.target);
    d.setLength(THREE.MathUtils.clamp(d.length() * f, controles.minDistance, controles.maxDistance));
    camara.position.copy(controles.target).add(d);
  };
  ui.acercar.addEventListener("click", () => acercar(0.8));
  ui.alejar.addEventListener("click", () => acercar(1.25));

  renderer.domElement.addEventListener("keydown", (e) => {
    const s = new THREE.Spherical().setFromVector3(camara.position.clone().sub(controles.target));
    switch (e.key) {
      case "ArrowLeft": s.theta -= 0.3; break;
      case "ArrowRight": s.theta += 0.3; break;
      case "ArrowUp": s.phi = Math.max(controles.minPolarAngle + 0.01, s.phi - 0.2); break;
      case "ArrowDown": s.phi = Math.min(controles.maxPolarAngle - 0.01, s.phi + 0.2); break;
      case "+": case "=": acercar(0.8); e.preventDefault(); return;
      case "-": acercar(1.25); e.preventDefault(); return;
      default: return;
    }
    e.preventDefault();
    camara.position.copy(controles.target).add(new V3().setFromSpherical(s));
  });

  controles.addEventListener("start", () => ui.pista.classList.add("oculta"), { once: true });

  let t = 0;
  let previo = null;
  let primero = true;
  function cuadro(ahora) {
    const dt = previo === null ? 1 / 60 : Math.min((ahora - previo) / 1000, 0.05);
    previo = ahora;
    t += dt;
    if (entrada < 1) {
      entrada = Math.min(1, entrada + dt / 0.7);
      soporte.scale.setScalar(0.55 + 0.45 * rebote(entrada));
      soporte.rotation.y = (1 - (1 - Math.pow(1 - entrada, 3))) * -1.4;
    } else {
      soporte.scale.setScalar(1);
      soporte.rotation.y = 0;
    }
    soporte.position.y = MOV_REDUCIDO ? 0 : Math.sin(t * 1.2) * 0.05;
    if (actual && actual.userData.actualizar) actual.userData.actualizar(t);
    aro.material.opacity = 0.55 + Math.sin(t * 2) * 0.2;
    controles.update(dt);
    renderer.render(escena, camara);
    if (primero) primero = false;
  }
  cuandoVisible(host, (v) => renderer.setAnimationLoop(v ? cuadro : null));

  return { seleccionar };
}

/* ---------------- Arranque ---------------- */

function hayWebGL() {
  try {
    return !!(window.WebGL2RenderingContext && document.createElement("canvas").getContext("webgl2"));
  } catch (e) {
    return false;
  }
}

async function iniciar() {
  const $ = (id) => document.getElementById(id);
  const ui = {
    escena: $("visor-escena"), chips: $("visor-chips"), categoria: $("visor-categoria"),
    nombre: $("visor-nombre"), desc: $("visor-desc"), whatsapp: $("visor-whatsapp"),
    girar: $("visor-girar"), reiniciar: $("visor-reiniciar"), acercar: $("visor-acercar"),
    alejar: $("visor-alejar"), pista: $("visor-pista"), anuncio: $("visor-anuncio"),
  };

  // Que la etiqueta de la vela salga con las letras de la marca
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);

  const visor = ui.escena ? iniciarVisor(ui) : null;
  const ver = (id) => {
    if (visor) visor.seleccionar(id);
    const destino = document.getElementById("showroom");
    if (destino) destino.scrollIntoView({ behavior: MOV_REDUCIDO ? "auto" : "smooth" });
  };

  const portada = document.querySelector(".portada__3d");
  if (portada) iniciarPortada(portada, ver);

  window.laReina3D = { seleccionar: (id) => visor && visor.seleccionar(id) };
  if (visor) await visor.seleccionar(window.__ver3dPendiente || PRODUCTOS[0].id);
  document.documentElement.classList.remove("sin-3d");
  document.documentElement.classList.add("tres-listo");
}

if (hayWebGL()) {
  iniciar().catch((e) => {
    console.error("No se pudo iniciar el 3D:", e);
    document.documentElement.classList.add("sin-3d");
  });
} else {
  document.documentElement.classList.add("sin-3d");
}
