import * as THREE from 'three';

// =====================================================
// 1. BASIC SETUP: renderer, scene, camera
// =====================================================
const canvas = document.getElementById('game');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // keeps phones fast
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

// DAY colours. The fog colour matches the sky at the horizon,
// so the far edge of the land melts away.
const HORIZON_COLOR = 0xcfe9f7;
scene.fog = new THREE.Fog(HORIZON_COLOR, 150, 1000);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.5,
  2500
);
camera.rotation.order = 'YXZ'; // turn left/right first, then look up/down

// =====================================================
// 2. SKY (gradient dome + sun + clouds)
// =====================================================
const SKY_RADIUS = 1500;

// The sky and sun live in a group that follows the camera, so they feel infinitely far away.
const skyGroup = new THREE.Group();
scene.add(skyGroup);

// Gradient dome: pale blue at the horizon, soft sky blue in the middle, deeper blue on top.
const skyGeo = new THREE.SphereGeometry(SKY_RADIUS, 48, 24);
const skyPos = skyGeo.attributes.position;
const skyColors = [];
const cHorizon = new THREE.Color(0xcfe9f7);
const cMiddle = new THREE.Color(0xa6d8f2);
const cTop = new THREE.Color(0x5aaae6);
const tmp = new THREE.Color();

for (let i = 0; i < skyPos.count; i++) {
  const h = Math.max(skyPos.getY(i) / SKY_RADIUS, 0); // 0 = horizon, 1 = straight up
  if (h < 0.25) {
    tmp.copy(cHorizon).lerp(cMiddle, h / 0.25);
  } else {
    tmp.copy(cMiddle).lerp(cTop, Math.min((h - 0.25) / 0.6, 1));
  }
  skyColors.push(tmp.r, tmp.g, tmp.b);
}
skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(skyColors, 3));

const sky = new THREE.Mesh(
  skyGeo,
  new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false
  })
);
sky.frustumCulled = false;
sky.renderOrder = -1;
skyGroup.add(sky);

// The daytime sun: high in the sky, a bright core and a soft glow around it.
const sunDirection = new THREE.Vector3(0.3, 0.75, -0.6).normalize();
const sunPosition = sunDirection.clone().multiplyScalar(1200);

const sunCore = new THREE.Mesh(
  new THREE.SphereGeometry(55, 24, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff6c8, fog: false })
);
sunCore.position.copy(sunPosition);
skyGroup.add(sunCore);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(115, 24, 16),
  new THREE.MeshBasicMaterial({
    color: 0xffe9a0,
    transparent: true,
    opacity: 0.3,
    fog: false,
    depthWrite: false
  })
);
sunGlow.position.copy(sunPosition);
skyGroup.add(sunGlow);

// Puffy cartoon clouds (a few soft blobs each, sharing one shape and one material).
const clouds = new THREE.Group();
const cloudMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  emissive: 0xdde8f5,
  emissiveIntensity: 0.4
});
const puffGeometry = new THREE.SphereGeometry(1, 12, 10);

for (let i = 0; i < 14; i++) {
  const cloud = new THREE.Group();
  const puffCount = 3 + Math.floor(Math.random() * 3);

  for (let p = 0; p < puffCount; p++) {
    const puff = new THREE.Mesh(puffGeometry, cloudMaterial);
    const size = 14 + Math.random() * 10;
    puff.scale.set(size, size * 0.6, size * 0.8);
    puff.position.set((p - puffCount / 2) * 14, Math.random() * 4, Math.random() * 6);
    cloud.add(puff);
  }

  const angle = Math.random() * Math.PI * 2;
  const distance = 200 + Math.random() * 600;
  cloud.position.set(
    Math.cos(angle) * distance,
    110 + Math.random() * 50,
    Math.sin(angle) * distance
  );
  clouds.add(cloud);
}
scene.add(clouds);

// =====================================================
// 3. LIGHTING (soft and warm, cheap for phones)
// =====================================================
// Sky light from above (white-blue) and bounce light from the grass below (green).
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x9bd36b, 2.4);
scene.add(hemiLight);

// The warm daytime sun, shining from the sun's direction.
const sunLight = new THREE.DirectionalLight(0xfff0cc, 2.2);
sunLight.position.copy(sunDirection).multiplyScalar(100);
scene.add(sunLight);

// =====================================================
// 4. GROUND (vast grass with a soft, patchy texture)
// =====================================================
function makeGrassTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');

  g.fillStyle = '#9bd36b';
  g.fillRect(0, 0, size, size);

  // Soft blotches of lighter and darker green.
  // We draw each blotch 9 times (shifted) so the texture tiles without visible seams.
  const blotchColors = ['rgba(169,220,120,0.35)', 'rgba(134,195,94,0.35)'];
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 4 + Math.random() * 10;
    g.fillStyle = blotchColors[i % 2];
    for (let ox = -size; ox <= size; ox += size) {
      for (let oy = -size; oy <= size; oy += size) {
        g.beginPath();
        g.arc(x + ox, y + oy, r, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(c);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(300, 300); // each tile covers 10 x 10 metres
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

const groundGeo = new THREE.CircleGeometry(1500, 48);
groundGeo.rotateX(-Math.PI / 2); // lay it flat
const ground = new THREE.Mesh(
  groundGeo,
  new THREE.MeshLambertMaterial({ map: makeGrassTexture() })
);
scene.add(ground);

// A small random number maker with a fixed seed. The same seed gives the same
// result every visit, so houses, stones and trees are always in the same places.
function makeRng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// =====================================================
// 5. RIVER (flowing water with soft sandy banks)
// =====================================================
const RIVER_WIDTH = 24;

// Where the middle of the river is, for any z position. Later phases will reuse this.
function riverX(z) {
  return 140 + 35 * Math.sin(z * 0.008);
}

// A clock for everything that sways in the wind (reeds, trees, and the breeze later).
const windUniform = { value: 0 };

// Soft ripple streaks that tile without seams. They are stretched along the flow direction.
function makeWaterTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');

  g.fillStyle = '#eaf7ff';
  g.fillRect(0, 0, size, size);

  const streakColors = ['rgba(255,255,255,0.55)', 'rgba(120,190,225,0.28)'];
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const rx = 2 + Math.random() * 4;
    const ry = 10 + Math.random() * 26;
    g.fillStyle = streakColors[i % 2];
    for (let ox = -size; ox <= size; ox += size) {
      for (let oy = -size; oy <= size; oy += size) {
        g.beginPath();
        g.ellipse(x + ox, y + oy, rx, ry, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(c);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// A ribbon that follows the river. One texture tile covers 14 m.
const WATER_TILE = 14;

function makeRiverGeometry(width) {
  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const step = 20;
  let rows = 0;

  for (let z = -1500; z <= 1500; z += step) {
    const cx = riverX(z);
    vertices.push(cx - width / 2, 0, z, cx + width / 2, 0, z);
    normals.push(0, 1, 0, 0, 1, 0);
    uvs.push(0, z / WATER_TILE, width / WATER_TILE, z / WATER_TILE);
    rows++;
  }

  for (let i = 0; i < rows - 1; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b, b, c, d);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

// One layer of the river. Higher "layer" numbers are drawn on top (this stops flickering).
function makeRiverLayer(width, y, material, layer) {
  material.side = THREE.DoubleSide;
  material.polygonOffset = true;
  material.polygonOffsetFactor = -layer;
  material.polygonOffsetUnits = -layer;
  const mesh = new THREE.Mesh(makeRiverGeometry(width), material);
  mesh.position.y = y;
  return mesh;
}

function flatColor(color, emissive = 0x000000) {
  return new THREE.MeshLambertMaterial({ color, emissive });
}

// Banks, from the outside in: dry sand, wet sand, then a pale shallow edge.
scene.add(makeRiverLayer(RIVER_WIDTH + 13, 0.04, flatColor(0xf6e7bb), 1));
scene.add(makeRiverLayer(RIVER_WIDTH + 7, 0.06, flatColor(0xe3c98f), 2));
scene.add(makeRiverLayer(RIVER_WIDTH + 3, 0.09, flatColor(0x9fe0f0, 0x1a5068), 3));

// The flowing water on top, with a soft shine from the sun.
const waterTexture = makeWaterTexture();
const waterMaterial = new THREE.MeshPhongMaterial({
  map: waterTexture,
  color: 0x62c3e6,
  emissive: 0x14405a,
  specular: 0x9fd0ea,
  shininess: 50
});
scene.add(makeRiverLayer(RIVER_WIDTH, 0.12, waterMaterial, 4));

// =====================================================
// 6. TOWN SQUARE (empty round plaza in the middle)
// =====================================================
const SQUARE_RADIUS = 24;

// Darker stone base ring (slightly bigger, lower).
const squareBase = new THREE.Mesh(
  new THREE.CylinderGeometry(SQUARE_RADIUS + 1.5, SQUARE_RADIUS + 1.5, 0.2, 48),
  new THREE.MeshLambertMaterial({ color: 0xc9b79a })
);
squareBase.position.y = 0.1;
scene.add(squareBase);

// Main plaza floor.
const squareFloor = new THREE.Mesh(
  new THREE.CylinderGeometry(SQUARE_RADIUS, SQUARE_RADIUS, 0.3, 48),
  new THREE.MeshLambertMaterial({ color: 0xeadfc6 })
);
squareFloor.position.y = 0.15;
scene.add(squareFloor);

// A soft decorative ring on the floor.
const squareRing = new THREE.Mesh(
  new THREE.RingGeometry(10, 11.2, 48),
  new THREE.MeshLambertMaterial({ color: 0xd8c4a0, side: THREE.DoubleSide })
);
squareRing.rotation.x = -Math.PI / 2;
squareRing.position.y = 0.32;
scene.add(squareRing);

// =====================================================
// 6b. PLOTS (the data array) AND HOUSES (about 500 of them)
// =====================================================

// ---------- The plot grid ----------
// Plot centres sit every 36 m. Each plot is 24 m wide, so a 12 m "street line"
// is left between plots (at x or z = 0, +-36, +-72 ...). Roads go on those lines.
// The town fills the land WEST of the river: 14 columns x 36 rows = 504 cells,
// minus the 4 cells next to the square = 500 plots.
const PLOT_PITCH = 36;
const PLOT_SIZE = 24;
const GRID_MIN_X = -12;   // columns -12 ... 1  (plot centres x = -414 ... +54)
const GRID_MAX_X = 1;
const GRID_MIN_Z = -18;   // rows -18 ... 17    (plot centres z = -630 ... +630)
const GRID_MAX_Z = 17;
const HOUSE_STYLES = ['cottage', 'treehouse', 'modern', 'traditional'];
const PAD_TOP = 0.1;      // height of the plot pads; houses are built on top of it

// THE DATA ARRAY. Every plot is one object. Later, Firebase can fill in
// ownerId and house for each plot, and the world will draw itself from this list.
//   id      : unique name of the plot
//   gx, gz  : the plot's column and row in the grid
//   x, z    : centre of the plot in the world
//   facing  : the direction the front door looks (radians)
//   ownerId : null = nobody owns it yet (ready to be claimed)
//   house   : 'cottage' | 'treehouse' | 'modern' | 'traditional' (null = empty plot)
const PLOTS = [];
const PLOT_AT = {};   // quick lookup: PLOT_AT['gx,gz'] gives the plot in that grid cell

// Does this plot touch the town square (plus a little space around it)?
function plotTouchesSquare(x, z) {
  const half = PLOT_SIZE / 2;
  const dx = Math.max(Math.abs(x) - half, 0);
  const dz = Math.max(Math.abs(z) - half, 0);
  return Math.hypot(dx, dz) < SQUARE_RADIUS + 1.5 + 8;
}

// Does this plot touch the river (including its sandy bank, plus a little space)?
function plotTouchesRiver(x, z) {
  const half = PLOT_SIZE / 2;
  const clearance = (RIVER_WIDTH + 8) / 2 + 6;
  for (let dz = -half; dz <= half + 0.01; dz += 3) {
    const rx = riverX(z + dz);
    if (x + half > rx - clearance && x - half < rx + clearance) return true;
  }
  return false;
}

const styleRng = makeRng(11);

for (let gz = GRID_MIN_Z; gz <= GRID_MAX_Z; gz++) {
  for (let gx = GRID_MIN_X; gx <= GRID_MAX_X; gx++) {
    const x = (gx + 0.5) * PLOT_PITCH;
    const z = (gz + 0.5) * PLOT_PITCH;
    if (plotTouchesSquare(x, z) || plotTouchesRiver(x, z)) continue;

    // The front door looks toward the square, along the stronger direction,
    // so every door faces a street line.
    let faceX = 0;
    let faceZ = 0;
    if (Math.abs(x) > Math.abs(z)) faceX = -Math.sign(x);
    else faceZ = -Math.sign(z);

    const plot = {
      id: `plot_${gx}_${gz}`,
      gx,
      gz,
      x,
      z,
      facing: Math.atan2(faceX, faceZ),
      ownerId: null,
      house: HOUSE_STYLES[Math.floor(styleRng() * HOUSE_STYLES.length)]
    };
    PLOTS.push(plot);
    PLOT_AT[`${gx},${gz}`] = plot;
  }
}

// ---------- Plot pads (flat marks on the grass, one InstancedMesh each) ----------
const dummy = new THREE.Object3D();

function makePads(width, height, color) {
  const mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color }),
    PLOTS.length
  );
  PLOTS.forEach((plot, i) => {
    dummy.position.set(plot.x, height / 2, plot.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(width, height, width);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  scene.add(mesh);
}
makePads(PLOT_SIZE, 0.07, 0xe8d9a8);          // sandy border
makePads(PLOT_SIZE - 1.2, PAD_TOP, 0xa9dc78); // soft green lawn

// ---------- A tiny "shape builder" ----------
// It lets us build a house from simple parts (boxes, balls, cylinders...), each with
// its own colour, and joins them into ONE shape. One shape = very light for phones.
const U_BOX = new THREE.BoxGeometry(1, 1, 1);
const U_CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 14);
const U_CONE = new THREE.ConeGeometry(0.5, 1, 12);
const U_BALL = new THREE.SphereGeometry(0.5, 8, 6);
const U_DOT = new THREE.SphereGeometry(0.5, 6, 4);          // tiny flowers
const U_PYR = new THREE.ConeGeometry(0.7071, 1, 4).rotateY(Math.PI / 4); // square pyramid, side = 1

// A flat triangle (front and back face only) used to fill the end of a pitched roof.
const U_GABLE = (() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.5, 0, 0.5,   0.5, 0, 0.5,   0, 1, 0.5,
     0.5, 0, -0.5, -0.5, 0, -0.5,  0, 1, -0.5
  ], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([
    0, 0, 1, 0, 0, 1, 0, 0, 1,
    0, 0, -1, 0, 0, -1, 0, 0, -1
  ], 3));
  return g;
})();

// LITE MODE: when true, houses are built in a simple version (no flowers, fences,
// bushes or tiny parts). Houses far away use the simple version so phones stay fast.
let liteMode = false;

function makeBuilder() {
  const pos = [];
  const nor = [];
  const col = [];
  const q = new THREE.Quaternion();
  const eul = new THREE.Euler();
  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  const c = new THREE.Color();

  // Adds one part: shape, colour, centre position, size, rotation.
  function add(geo, color, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
    if (liteMode) {
      if (geo === U_DOT) return;                  // no tiny flowers
      if (geo === U_BALL && sx < 2.5) return;     // no small balls (bushes, knobs)
    }

    eul.set(rx, ry, rz);
    q.setFromEuler(eul);
    p.set(x, y, z);
    s.set(sx, sy, sz);
    m.compose(p, q, s);

    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(m);
    c.set(color);

    const pa = g.attributes.position.array;
    const na = g.attributes.normal.array;
    for (let i = 0; i < pa.length; i++) {
      pos.push(pa[i]);
      nor.push(na[i]);
    }
    for (let i = 0; i < pa.length / 3; i++) col.push(c.r, c.g, c.b);
    g.dispose();
  }

  return {
    // For these, (x, y, z) is the middle of the BOTTOM of the part.
    box(color, w, h, d, x, y, z) { add(U_BOX, color, x, y + h / 2, z, w, h, d); },
    cyl(color, dia, h, x, y, z) { add(U_CYL, color, x, y + h / 2, z, dia, h, dia); },
    cone(color, dia, h, x, y, z) { add(U_CONE, color, x, y + h / 2, z, dia, h, dia); },
    pyramid(color, w, h, d, x, y, z) { add(U_PYR, color, x, y + h / 2, z, w, h, d); },
    gable(color, w, h, d, x, y, z) { add(U_GABLE, color, x, y, z, w, h, d); },

    // For these, (x, y, z) is the CENTRE of the part.
    ball(color, dia, x, y, z, squash = 1) { add(U_BALL, color, x, y, z, dia, dia * squash, dia); },
    dot(color, dia, x, y, z) { add(U_DOT, color, x, y, z, dia, dia, dia); },
    cylZ(color, dia, len, x, y, z) { add(U_CYL, color, x, y, z, dia, len, dia, Math.PI / 2, 0, 0); },
    slab(color, w, h, d, x, y, z, rx, ry, rz) { add(U_BOX, color, x, y, z, w, h, d, rx, ry, rz); },

    build() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      return g;
    }
  };
}

// ---------- Shared colours and small pieces ----------
const G = PAD_TOP;           // ground level inside a plot
const GLASS = 0xbfe6f5;
const WHITE = 0xfff4e0;
const PATH_COLOR = 0xe0d3b8;
const WOOD_DARK = 0x8a5a3a;
const LEAF = 0x62b552;
const FLOWER_COLORS = [0xf48fb1, 0xffd54f, 0xffffff, 0xff8a65];

// A window on a front wall. (x, y) = middle-bottom of the glass. Zf = the wall's z.
function frontWindow(b, x, y, Zf, w, h, frameCol, glassCol) {
  if (liteMode) {
    b.box(glassCol, w, h, 0.2, x, y, Zf + 0.04);
    return;
  }
  b.box(frameCol, w + 0.4, h + 0.4, 0.16, x, y - 0.2, Zf + 0.04);
  b.box(glassCol, w, h, 0.2, x, y, Zf + 0.04);
  b.box(frameCol, 0.1, h, 0.04, x, y, Zf + 0.16);
  b.box(frameCol, w, 0.1, 0.04, x, y + h / 2 - 0.05, Zf + 0.16);
}

// A window on a side wall. side = +1 (right wall) or -1 (left wall). Xf = the wall's x.
function sideWindow(b, side, z, y, Xf, w, h, frameCol, glassCol) {
  if (liteMode) {
    b.box(glassCol, 0.2, h, w, Xf + side * 0.04, y, z);
    return;
  }
  b.box(frameCol, 0.16, h + 0.4, w + 0.4, Xf + side * 0.04, y - 0.2, z);
  b.box(glassCol, 0.2, h, w, Xf + side * 0.04, y, z);
  b.box(frameCol, 0.04, h, 0.1, Xf + side * 0.16, y, z);
  b.box(frameCol, 0.04, 0.1, w, Xf + side * 0.16, y + h / 2 - 0.05, z);
}

// Fence pieces
function fenceX(b, color, z, x1, x2) {
  const len = x2 - x1;
  const n = Math.max(1, Math.round(len / 1.5));
  for (let i = 0; i <= n; i++) b.box(color, 0.22, 1.0, 0.22, x1 + (len * i) / n, G, z);
  b.box(color, len, 0.12, 0.1, (x1 + x2) / 2, G + 0.3, z);
  b.box(color, len, 0.12, 0.1, (x1 + x2) / 2, G + 0.7, z);
}

function fenceZ(b, color, x, z1, z2) {
  const len = z2 - z1;
  const n = Math.max(1, Math.round(len / 1.5));
  for (let i = 0; i <= n; i++) b.box(color, 0.22, 1.0, 0.22, x, G, z1 + (len * i) / n);
  b.box(color, 0.1, 0.12, len, x, G + 0.3, (z1 + z2) / 2);
  b.box(color, 0.1, 0.12, len, x, G + 0.7, (z1 + z2) / 2);
}

// Fence around the front garden, with a gate gap in the middle.
function gardenFence(b, color) {
  if (liteMode) return;
  fenceX(b, color, 11, -11, -1.4);
  fenceX(b, color, 11, 1.4, 11);
  fenceZ(b, color, -11, -6, 11);
  fenceZ(b, color, 11, -6, 11);
}

// A small bed of flowers.
function flowerBed(b, x, z, w, d) {
  b.box(0x7a5237, w, 0.18, d, x, G, z);
  if (liteMode) return;
  const n = Math.round(w * d * 0.9);
  for (let i = 0; i < n; i++) {
    const fx = x + (Math.random() - 0.5) * (w - 0.6);
    const fz = z + (Math.random() - 0.5) * (d - 0.6);
    b.dot(0x5fae4e, 0.45, fx, G + 0.38, fz);
    b.dot(FLOWER_COLORS[i % FLOWER_COLORS.length], 0.42, fx, G + 0.7, fz);
  }
}

// A round bush.
function bush(b, x, z, size = 1.9) {
  if (liteMode) return;
  b.ball(LEAF, size, x, G + size * 0.42, z, 0.85);
}

// ---------- STYLE 1: COTTAGE (round, warm, thatched) ----------
function buildCottage() {
  const b = makeBuilder();
  const Zf = -0.5; // the front wall is at z = -0.5

  b.box(0xfbe3cf, 9, 4, 8, 0, G, -4.5);                    // walls
  b.pyramid(0xd9a441, 10.8, 3.6, 9.8, 0, G + 4, -4.5);     // cosy roof
  b.box(0x9b8f86, 1.1, 3.6, 1.1, 2.7, G + 3.6, -6.2);      // chimney

  // Round-top door
  b.box(WOOD_DARK, 1.6, 2.2, 0.16, 0, G, Zf + 0.04);
  b.cylZ(WOOD_DARK, 1.6, 0.16, 0, G + 2.2, Zf + 0.04);
  b.ball(0xf2c94c, 0.16, 0.5, G + 1.2, Zf + 0.14);
  b.box(0xcfc3ae, 2.6, 0.2, 1.1, 0, G, Zf + 0.55);         // door step

  // Windows with shutters
  [-2.9, 2.9].forEach((x) => {
    frontWindow(b, x, G + 1.4, Zf, 1.4, 1.4, WHITE, GLASS);
    b.box(0xc96f5a, 0.5, 1.8, 0.1, x - 1.25, G + 1.2, Zf + 0.04);
    b.box(0xc96f5a, 0.5, 1.8, 0.1, x + 1.25, G + 1.2, Zf + 0.04);
  });
  sideWindow(b, 1, -4.5, G + 1.4, 4.5, 1.4, 1.4, WHITE, GLASS);
  sideWindow(b, -1, -4.5, G + 1.4, -4.5, 1.4, 1.4, WHITE, GLASS);

  // Garden
  b.box(PATH_COLOR, 1.8, 0.06, 10.4, 0, G, 5.8);
  gardenFence(b, WHITE);
  flowerBed(b, -5, 6, 3.6, 2.2);
  flowerBed(b, 5, 6, 3.6, 2.2);
  bush(b, -4.9, 0.5);
  bush(b, 4.9, 0.5);
  return b.build();
}

// ---------- STYLE 2: TREEHOUSE ----------
function buildTreehouse() {
  const b = makeBuilder();
  const Zf = -2.2; // the cabin's front wall

  b.cyl(0x7d5232, 3.4, 0.7, 0, G, -4.5);          // flared trunk base
  b.cyl(WOOD_DARK, 2.4, 5.3, 0, G, -4.5);         // trunk
  b.cyl(0xc99560, 8, 0.35, 0, G + 5.1, -4.5);     // round platform
  b.box(0xd9a566, 4.6, 3.2, 4.6, 0, G + 5.45, -4.5); // cabin
  b.cone(0xe0a64a, 6.8, 2.8, 0, G + 8.65, -4.5);  // round thatched roof

  // Door and round window
  b.box(WOOD_DARK, 1.1, 2.0, 0.14, -0.8, G + 5.45, Zf + 0.03);
  b.cylZ(WOOD_DARK, 1.1, 0.14, -0.8, G + 7.45, Zf + 0.03);
  b.cylZ(WHITE, 1.3, 0.14, 1.0, G + 6.9, Zf + 0.04);
  b.cylZ(GLASS, 1.0, 0.18, 1.0, G + 6.9, Zf + 0.04);

  // Leafy crown around the cabin (not in front, so the door stays visible)
  const leafColors = [0x6dbb5a, 0x58a84d, 0x7fc968];
  [0, 180, 215, 250, 290, 325].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    b.ball(leafColors[i % 3], 4.4, Math.cos(a) * 4.3, G + 7.2 + (i % 2) * 0.8, -4.5 + Math.sin(a) * 4.3, 0.85);
  });
  b.ball(0x58a84d, 4.5, 0, G + 10.2, -6.2, 0.85);

  // Ladder up to the platform
  b.box(0xa8764a, 0.14, 5.4, 0.14, -0.5, G, -0.35);
  b.box(0xa8764a, 0.14, 5.4, 0.14, 0.5, G, -0.35);
  if (!liteMode) {
    for (let i = 0; i < 7; i++) b.box(0xa8764a, 1.2, 0.1, 0.12, 0, G + 0.5 + i * 0.75, -0.35);
  }

  // Garden
  b.box(PATH_COLOR, 1.8, 0.06, 11, 0, G, 5.3);
  gardenFence(b, 0xb98a5a);
  if (!liteMode) {
    b.cyl(0xc99560, 1.0, 0.45, -3, G, 2.5);       // tree stump seats
    b.cyl(0xc99560, 1.0, 0.45, 3, G, 3.2);
  }
  flowerBed(b, -5.5, 7, 3.4, 2.2);
  flowerBed(b, 5.5, 7, 3.4, 2.2);
  bush(b, -7, 0);
  bush(b, 7, 0);
  return b.build();
}

// ---------- STYLE 3: MODERN ----------
function buildModern() {
  const b = makeBuilder();
  const DARK = 0x4a4440;
  const ROOF = 0x6b625c;
  const Zf = -0.5;   // lower front wall
  const Zf2 = -2.0;  // upper floor front wall

  b.box(0xf4efe6, 10, 3.2, 8, 0, G, -4.5);                  // lower floor
  b.box(ROOF, 10.8, 0.35, 8.8, 0, G + 3.2, -4.5);           // flat roof
  b.box(0xe9dfd0, 6, 3, 6.5, -1.8, G + 3.55, -5.25);        // upper floor
  b.box(ROOF, 6.8, 0.35, 7.3, -1.8, G + 6.55, -5.25);       // upper flat roof

  b.box(0xc58b52, 2.4, 3.2, 0.14, 3.4, G, Zf + 0.03);       // wood panel
  frontWindow(b, -2.4, G + 0.6, Zf, 3.8, 2.2, DARK, 0x9fd7ee);   // big window
  frontWindow(b, -1.8, G + 4.35, Zf2, 4.2, 1.4, DARK, 0x9fd7ee); // upper window band

  // Door and entrance canopy
  b.box(0x3f8f8a, 1.4, 2.4, 0.16, 0.8, G, Zf + 0.04);
  b.box(0xf2c94c, 0.08, 0.7, 0.08, 1.2, G + 1.0, Zf + 0.15);
  b.box(ROOF, 3.0, 0.2, 2.2, 0.8, G + 2.75, 0.5);
  b.cyl(0xf4efe6, 0.22, 2.75, -0.5, G, 1.4);
  b.cyl(0xf4efe6, 0.22, 2.75, 2.1, G, 1.4);
  b.box(0xcfc3ae, 3.0, 0.14, 2.0, 0.8, G, 0.5);

  // Round planters by the door
  [[-1.4, 0.9], [3.0, 0.9]].forEach(([x, z]) => {
    b.cyl(0xd7a77a, 0.8, 0.7, x, G, z);
    b.ball(LEAF, 1.3, x, G + 1.35, z);
  });

  // Garden: stepping stones, hedges, pond, small tree
  for (let i = 0; i < 5; i++) b.box(PATH_COLOR, 1.6, 0.08, 1.1, 0.8, G, 2.9 + i * 1.9);
  const HEDGE = 0x70be5f;
  b.box(HEDGE, 10.6, 1.0, 1.1, -5.7, G, 10.6);
  b.box(HEDGE, 9.0, 1.0, 1.1, 6.5, G, 10.6);
  b.box(HEDGE, 1.1, 1.0, 16.6, -10.6, G, 2.3);
  b.box(HEDGE, 1.1, 1.0, 16.6, 10.6, G, 2.3);
  b.ball(LEAF, 1.5, -0.4, G + 0.8, 10.6);
  b.ball(LEAF, 1.5, 2.0, G + 0.8, 10.6);
  b.cyl(0xd7cbb8, 5, 0.12, -6.5, G, 5.5);                   // pond rim
  b.cyl(0x7fd3ee, 4.3, 0.16, -6.5, G, 5.5);                 // pond water
  b.cyl(WOOD_DARK, 0.5, 2.2, 6.5, G, 5);                    // small tree
  b.ball(0x6dbb5a, 3.0, 6.5, G + 3.3, 5);
  return b.build();
}

// ---------- STYLE 4: TRADITIONAL (pitched roof, porch) ----------
function buildTraditional() {
  const b = makeBuilder();
  const WALL = 0xe2a97c;
  const ROOF = 0xb5523b;
  const Zf = -0.5;
  const W = 9;
  const D = 8;
  const wallH = 3.6;
  const roofH = 3.2;

  b.box(WALL, W, wallH, D, 0, G, -4.5);                     // walls
  b.gable(WALL, W, roofH, D, 0, G + wallH, -4.5);           // triangle wall under the roof

  // Roof: two tilted slabs meeting at the top
  const slope = roofH / (W / 2);
  const angle = Math.atan(slope);
  const e = W / 2 + 0.8;                                    // roof overhang
  const apexY = G + wallH + roofH;
  const eaveY = G + wallH - 0.8 * slope;
  const len = Math.hypot(e, apexY - eaveY) + 0.1;
  const cy = (apexY + eaveY) / 2 + 0.18;
  b.slab(ROOF, len, 0.4, D + 1.4, e / 2, cy, -4.5, 0, 0, -angle);
  b.slab(ROOF, len, 0.4, D + 1.4, -e / 2, cy, -4.5, 0, 0, angle);
  b.cylZ(0x8f3f2c, 0.55, D + 1.4, 0, apexY + 0.12, -4.5);   // roof ridge
  b.box(0xb5654a, 1.2, 2.7, 1.2, -2.8, G + 4.2, -6.5);      // chimney

  // Porch
  b.box(0xc99560, 4.4, 0.25, 2.6, 0, G, 0.8);
  b.cyl(WHITE, 0.38, 2.8, -1.8, G + 0.25, 1.8);
  b.cyl(WHITE, 0.38, 2.8, 1.8, G + 0.25, 1.8);
  b.box(ROOF, 4.9, 0.22, 3.2, 0, G + 3.05, 0.9);

  // Door
  b.box(0x8d3b32, 1.5, 2.5, 0.16, 0, G + 0.25, Zf + 0.04);
  b.ball(0xf2c94c, 0.16, 0.5, G + 1.5, Zf + 0.14);

  // Windows with flower boxes
  [-3.2, 3.2].forEach((x) => {
    frontWindow(b, x, G + 1.3, Zf, 1.3, 1.5, WHITE, GLASS);
    b.box(WOOD_DARK, 1.8, 0.3, 0.45, x, G + 0.75, Zf + 0.3);
    [-0.5, 0, 0.5].forEach((o, i) => b.dot(FLOWER_COLORS[i], 0.4, x + o, G + 1.15, Zf + 0.3));
  });
  b.cylZ(WHITE, 1.6, 0.16, 0, G + wallH + 1.05, Zf + 0.04); // round attic window
  b.cylZ(GLASS, 1.25, 0.2, 0, G + wallH + 1.05, Zf + 0.04);
  sideWindow(b, 1, -4.5, G + 1.4, 4.5, 1.4, 1.4, WHITE, GLASS);
  sideWindow(b, -1, -4.5, G + 1.4, -4.5, 1.4, 1.4, WHITE, GLASS);

  // Garden
  b.box(PATH_COLOR, 1.8, 0.06, 9, 0, G, 6.6);
  gardenFence(b, WHITE);
  flowerBed(b, -5.5, 5.5, 3.6, 2.2);
  flowerBed(b, 5.5, 5.5, 3.6, 2.2);
  bush(b, -5.5, 0.6);
  bush(b, 5.5, 0.6);
  return b.build();
}

// ---------- Build each house twice: DETAILED (near you) and LITE (far away) ----------
const houseMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });
const houseBuilders = {
  cottage: buildCottage,
  treehouse: buildTreehouse,
  modern: buildModern,
  traditional: buildTraditional
};

const houseGeos = {};
HOUSE_STYLES.forEach((style) => {
  liteMode = false;
  const detail = houseBuilders[style]();
  liteMode = true;
  const lite = houseBuilders[style]();
  liteMode = false;
  houseGeos[style] = { detail, lite };
});

// ---------- Chunks: the town is cut into blocks of 3 x 3 plots ----------
// Each block has its own InstancedMeshes. The browser skips blocks that are off-screen,
// and blocks near you show the detailed houses while far blocks show the lite houses.
const CHUNK = 3;
const DETAIL_DIST = 160;   // blocks closer than this (metres) show detailed houses
const houseChunks = [];    // kept so later phases can update houses
const chunkMap = {};

PLOTS.forEach((plot) => {
  const kx = Math.floor(plot.gx / CHUNK);
  const kz = Math.floor(plot.gz / CHUNK);
  const key = `${kx},${kz}`;
  if (!chunkMap[key]) {
    chunkMap[key] = { plots: [], cx: 0, cz: 0, detail: [], lite: [] };
    houseChunks.push(chunkMap[key]);
  }
  chunkMap[key].plots.push(plot);
});

houseChunks.forEach((chunk) => {
  let sumX = 0;
  let sumZ = 0;
  chunk.plots.forEach((p) => { sumX += p.x; sumZ += p.z; });
  chunk.cx = sumX / chunk.plots.length;
  chunk.cz = sumZ / chunk.plots.length;

  HOUSE_STYLES.forEach((style) => {
    const list = chunk.plots.filter((p) => p.house === style);
    if (list.length === 0) return;

    ['detail', 'lite'].forEach((kind) => {
      const mesh = new THREE.InstancedMesh(houseGeos[style][kind], houseMaterial, list.length);
      list.forEach((plot, i) => {
        dummy.position.set(plot.x, 0, plot.z);
        dummy.rotation.set(0, plot.facing, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.computeBoundingSphere) mesh.computeBoundingSphere();
      mesh.visible = false; // the LOD update below decides what to show
      scene.add(mesh);
      chunk[kind].push(mesh);
    });
  });
});

// Decides which houses are drawn: detailed near you, lite far away, none when you are inside a house.
function updateHouseLOD() {
  houseChunks.forEach((chunk) => {
    const d = Math.hypot(chunk.cx - player.x, chunk.cz - player.z);
    const outdoors = !inside;
    const showDetail = outdoors && d < DETAIL_DIST;
    const showLite = outdoors && !showDetail && d < 1200;
    chunk.detail.forEach((m) => { m.visible = showDetail; });
    chunk.lite.forEach((m) => { m.visible = showLite; });
  });
}

// =====================================================
// 6c. ROADS AND BRIDGE (made from the plot grid, one merged shape)
// =====================================================

// ---------- Road settings ----------
const ROAD_WIDTH = 8;       // street lines are 12 m wide, so 2 m of grass stays on each side
const ROAD_TOP = 0.14;      // height of the road surface above the ground
const BRIDGE_TOP = 0.55;    // height of the bridge deck above the ground
const BRIDGE_RAMP = 6;      // length of the sloping part at each end of the bridge

// ---------- THE ROAD DATA ----------
// Nodes are junctions and road ends. Links join two nodes in a straight line.
// The street lines run at x = i * 36 and z = j * 36. A road is made on every street line.
//   id  : unique name
//   x,z : position in the world
//   pad : false = no junction square here (the road just carries on)
const ROAD_I_MIN = GRID_MIN_X;       // street lines x = -432 ... +72
const ROAD_I_MAX = GRID_MAX_X + 1;
const ROAD_J_MIN = GRID_MIN_Z;       // street lines z = -648 ... +648
const ROAD_J_MAX = GRID_MAX_Z + 1;

const ROAD_NODES = [
  // Where the four spokes meet the edge of the square (hidden inside the plaza)
  { id: 'sqN', x: 0, z: -SQUARE_RADIUS, pad: false },
  { id: 'sqS', x: 0, z: SQUARE_RADIUS, pad: false },
  { id: 'sqE', x: SQUARE_RADIUS, z: 0, pad: false },
  { id: 'sqW', x: -SQUARE_RADIUS, z: 0, pad: false },

  // East road, over the river
  { id: 'bridgeW', x: 120, z: 0, pad: false },
  { id: 'bridgeE', x: 160, z: 0, pad: false },
  { id: 'farE', x: 200, z: 0 }
];

const ROADS = [
  // Spokes: the square to the ring road around it
  { from: 'sqN', to: 'n_0_-1' },
  { from: 'sqS', to: 'n_0_1' },
  { from: 'sqE', to: 'n_1_0' },
  { from: 'sqW', to: 'n_-1_0' },

  // East road with the bridge
  { from: 'n_2_0', to: 'bridgeW' },
  { from: 'bridgeW', to: 'bridgeE', type: 'bridge' },
  { from: 'bridgeE', to: 'farE' }
];

// A junction at every crossing of two street lines (except the very middle: that is the square).
for (let i = ROAD_I_MIN; i <= ROAD_I_MAX; i++) {
  for (let j = ROAD_J_MIN; j <= ROAD_J_MAX; j++) {
    if (i === 0 && j === 0) continue;
    ROAD_NODES.push({ id: `n_${i}_${j}`, x: i * PLOT_PITCH, z: j * PLOT_PITCH });
  }
}

// A road between every two neighbouring junctions.
for (let i = ROAD_I_MIN; i <= ROAD_I_MAX; i++) {
  for (let j = ROAD_J_MIN; j <= ROAD_J_MAX; j++) {
    if (i === 0 && j === 0) continue;
    if (i < ROAD_I_MAX && !(i + 1 === 0 && j === 0)) {
      ROADS.push({ from: `n_${i}_${j}`, to: `n_${i + 1}_${j}` });
    }
    if (j < ROAD_J_MAX && !(i === 0 && j + 1 === 0)) {
      ROADS.push({ from: `n_${i}_${j}`, to: `n_${i}_${j + 1}` });
    }
  }
}

// A quick way to find a node by its id.
const NODE = {};
ROAD_NODES.forEach((node) => { NODE[node.id] = node; });

// ---------- Road colours ----------
const ASPHALT = 0x7b7580;
const EDGE_LINE = 0xfff4e0;
const DASH = 0xf6cf5a;
const STONE = 0xd6c7a6;
const STONE_LIGHT = 0xeadfc6;

const roadBuilder = makeBuilder();

// A flat strip of road between two points (it runs straight along x or z).
function roadStrip(b, color, x1, z1, x2, z2, width, height) {
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  if (z1 === z2) b.box(color, Math.abs(x2 - x1), height, width, cx, 0, cz);
  else b.box(color, width, height, Math.abs(z2 - z1), cx, 0, cz);
}

// Edge lines (both sides) and a dashed centre line. y = height of the road surface.
function addMarkings(b, x1, z1, x2, z2, width, y) {
  const horizontal = z1 === z2;
  const len = horizontal ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
  const a0 = horizontal ? Math.min(x1, x2) : Math.min(z1, z2); // start along the road
  const c = horizontal ? z1 : x1;                              // the centre line position
  const mid = a0 + len / 2;
  const edgeOffset = width / 2 - 0.55;
  const lineH = 0.03;

  // Two solid edge lines
  [-edgeOffset, edgeOffset].forEach((off) => {
    if (horizontal) b.box(EDGE_LINE, len, lineH, 0.2, mid, y, c + off);
    else b.box(EDGE_LINE, 0.2, lineH, len, c + off, y, mid);
  });

  // Dashed centre line
  const dash = 2.2;
  const gap = 2.2;
  const count = Math.floor((len - 1) / (dash + gap));
  if (count < 1) return;
  const used = count * (dash + gap) - gap;
  const first = a0 + (len - used) / 2;
  for (let i = 0; i < count; i++) {
    const s = first + i * (dash + gap) + dash / 2;
    if (horizontal) b.box(DASH, dash, lineH, 0.22, s, y, c);
    else b.box(DASH, 0.22, lineH, dash, c, y, s);
  }
}

// One sloping or flat piece of the bridge (stone body, asphalt top, two low walls).
function deckPiece(b, xA, yA, xB, yB, z) {
  const len = Math.hypot(xB - xA, yB - yA);
  const ang = Math.atan2(yB - yA, xB - xA);
  const cx = (xA + xB) / 2;
  const cy = (yA + yB) / 2;
  const nx = -Math.sin(ang); // "up" direction of the slope
  const ny = Math.cos(ang);
  const at = (off) => [cx + nx * off, cy + ny * off];

  let p = at(-0.48);
  b.slab(STONE, len + 0.04, 0.9, ROAD_WIDTH + 1.4, p[0], p[1], z, 0, 0, ang);   // stone body
  p = at(-0.06);
  b.slab(ASPHALT, len + 0.04, 0.12, ROAD_WIDTH, p[0], p[1], z, 0, 0, ang);       // road surface
  [-1, 1].forEach((side) => {
    const w = at(0.35);
    b.slab(STONE_LIGHT, len + 0.04, 0.8, 0.55, w[0], w[1], z + side * 4.4, 0, 0, ang); // wall
  });
}

// A whole bridge: ramp up, flat deck, ramp down, round posts, and road markings.
function addBridge(b, A, B) {
  const z = A.z;
  const xa = Math.min(A.x, B.x);
  const xb = Math.max(A.x, B.x);
  const R = BRIDGE_RAMP;

  deckPiece(b, xa, ROAD_TOP, xa + R, BRIDGE_TOP, z);
  deckPiece(b, xa + R, BRIDGE_TOP, xb - R, BRIDGE_TOP, z);
  deckPiece(b, xb - R, BRIDGE_TOP, xb, ROAD_TOP, z);

  // Round stone posts where the pieces meet
  [[xa, ROAD_TOP], [xa + R, BRIDGE_TOP], [xb - R, BRIDGE_TOP], [xb, ROAD_TOP]].forEach(([x, y]) => {
    [-1, 1].forEach((side) => b.ball(STONE_LIGHT, 0.95, x, y + 0.8, z + side * 4.4));
  });

  // Edge lines and dashes on the flat part
  addMarkings(b, xa + R, z, xb - R, z, ROAD_WIDTH, BRIDGE_TOP);
}

// ---------- Build everything from the data ----------
// 1) A square at every junction
ROAD_NODES.forEach((node) => {
  if (node.pad === false) return;
  roadBuilder.box(ASPHALT, ROAD_WIDTH, ROAD_TOP, ROAD_WIDTH, node.x, 0, node.z);
});

// 2) Every link: a road strip with markings, or a bridge
ROADS.forEach((road) => {
  const A = NODE[road.from];
  const B = NODE[road.to];

  if (road.type === 'bridge') {
    addBridge(roadBuilder, A, B);
    return;
  }

  // Roads stop at the edge of a junction square so lines do not cross junctions.
  const dx = Math.sign(B.x - A.x);
  const dz = Math.sign(B.z - A.z);
  const trimA = A.pad === false ? 0 : ROAD_WIDTH / 2;
  const trimB = B.pad === false ? 0 : ROAD_WIDTH / 2;
  const x1 = A.x + dx * trimA;
  const z1 = A.z + dz * trimA;
  const x2 = B.x - dx * trimB;
  const z2 = B.z - dz * trimB;

  roadStrip(roadBuilder, ASPHALT, x1, z1, x2, z2, ROAD_WIDTH, ROAD_TOP);
  addMarkings(roadBuilder, x1, z1, x2, z2, ROAD_WIDTH, ROAD_TOP);
});

// 3) All roads and bridges are ONE shape that reuses the house material.
const roadMesh = new THREE.Mesh(roadBuilder.build(), houseMaterial);
scene.add(roadMesh);

// ---------- Is a point on a bridge? (used so the river does not slow you on the bridge) ----------
const BRIDGES = ROADS.filter((r) => r.type === 'bridge').map((r) => {
  const A = NODE[r.from];
  const B = NODE[r.to];
  return {
    minX: Math.min(A.x, B.x),
    maxX: Math.max(A.x, B.x),
    minZ: A.z - ROAD_WIDTH / 2,
    maxZ: A.z + ROAD_WIDTH / 2
  };
});

function isOnBridge(x, z) {
  return BRIDGES.some((b) => x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ);
}

// =====================================================
// 6d. RIVER DECORATIONS (stones and swaying reeds on the banks)
// =====================================================
const bankRng = makeRng(2026);

// Keep stones and reeds away from the bridge and its road.
function nearBridge(x, z) {
  return BRIDGES.some((b) =>
    x > b.minX - 6 && x < b.maxX + 6 && z > b.minZ - 6 && z < b.maxZ + 6
  );
}

// Finds a random spot on the river bank.
//   offset: distance from the water's edge (negative = a little inside the water edge)
//   range : how far up and down the river to place things (metres from the middle)
function randomBankSpot(minOffset, maxOffset, range) {
  for (let tries = 0; tries < 20; tries++) {
    const z = (bankRng() - 0.5) * 2 * range;
    const side = bankRng() < 0.5 ? -1 : 1;
    const offset = minOffset + bankRng() * (maxOffset - minOffset);
    const x = riverX(z) + side * (RIVER_WIDTH / 2 + offset);
    if (!nearBridge(x, z)) return { x, z };
  }
  return null;
}

// ---------- Stones (one InstancedMesh) ----------
const STONE_COUNT = 220;
const stoneColors = [0x9a9690, 0xb3aea3, 0x8c8780, 0xa89f8f, 0xc2bba9];
const stoneMesh = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.5, 0),
  new THREE.MeshLambertMaterial({ flatShading: true }),
  STONE_COUNT
);
const stoneColor = new THREE.Color();
let stoneCount = 0;

for (let i = 0; i < STONE_COUNT; i++) {
  const spot = randomBankSpot(-1.5, 5, 600);
  if (!spot) continue;

  const size = 0.5 + bankRng() * 1.1;
  dummy.position.set(spot.x, 0.1 + size * 0.15, spot.z);
  dummy.rotation.set(bankRng() * 0.4, bankRng() * Math.PI * 2, bankRng() * 0.4);
  dummy.scale.set(size * (0.9 + bankRng() * 0.6), size * (0.45 + bankRng() * 0.3), size * (0.8 + bankRng() * 0.5));
  dummy.updateMatrix();
  stoneMesh.setMatrixAt(stoneCount, dummy.matrix);

  stoneColor.set(stoneColors[Math.floor(bankRng() * stoneColors.length)]);
  stoneMesh.setColorAt(stoneCount, stoneColor);
  stoneCount++;
}
stoneMesh.count = stoneCount;
stoneMesh.instanceMatrix.needsUpdate = true;
if (stoneMesh.instanceColor) stoneMesh.instanceColor.needsUpdate = true;
stoneMesh.frustumCulled = false;
scene.add(stoneMesh);

// ---------- Reeds (thin blades in clusters, they sway in the wind) ----------
const REED_CLUSTERS = 160;
const MAX_REEDS = REED_CLUSTERS * 7;
const reedColors = [0x6fae4a, 0x5c9c42, 0x80bb57];

const reedGeometry = new THREE.ConeGeometry(0.5, 1, 5, 1, true);
reedGeometry.translate(0, 0.5, 0); // the bottom of each blade sits at y = 0

const reedMaterial = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
reedMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uWind = windUniform;
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nuniform float uWind;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
#ifdef USE_INSTANCING
  float sX = length(instanceMatrix[0].xyz);
  float sY = length(instanceMatrix[1].xyz);
  float hgt = position.y * sY;
  float phase = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.29;
  transformed.x += sin(uWind * 1.7 + phase) * 0.035 * hgt * hgt / sX;
  transformed.z += cos(uWind * 1.3 + phase) * 0.025 * hgt * hgt / sX;
#endif`);
};

const reedMesh = new THREE.InstancedMesh(reedGeometry, reedMaterial, MAX_REEDS);
const reedColor = new THREE.Color();
let reedCount = 0;

for (let i = 0; i < REED_CLUSTERS; i++) {
  const spot = randomBankSpot(-0.8, 2.2, 500);
  if (!spot) continue;

  const blades = 4 + Math.floor(bankRng() * 4);
  for (let r = 0; r < blades; r++) {
    const height = 1.4 + bankRng() * 1.4;
    const width = 0.13 + bankRng() * 0.05;
    dummy.position.set(
      spot.x + (bankRng() - 0.5) * 1.8,
      0.1,
      spot.z + (bankRng() - 0.5) * 1.8
    );
    dummy.rotation.set((bankRng() - 0.5) * 0.3, bankRng() * Math.PI * 2, (bankRng() - 0.5) * 0.3);
    dummy.scale.set(width, height, width);
    dummy.updateMatrix();
    reedMesh.setMatrixAt(reedCount, dummy.matrix);

    reedColor.set(reedColors[Math.floor(bankRng() * reedColors.length)]);
    reedMesh.setColorAt(reedCount, reedColor);
    reedCount++;
  }
}
reedMesh.count = reedCount;
reedMesh.instanceMatrix.needsUpdate = true;
if (reedMesh.instanceColor) reedMesh.instanceColor.needsUpdate = true;
reedMesh.frustumCulled = false;
scene.add(reedMesh);

// =====================================================
// 6e. TREES (round, tall and pine trees in groves, outside the town)
// =====================================================

// ---------- Settings ----------
// The town block (all plots and streets) is kept free of trees.
const TOWN_MIN_X = (GRID_MIN_X - 1) * PLOT_PITCH;   // -468
const TOWN_MAX_X = (GRID_MAX_X + 3) * PLOT_PITCH;   // 108
const TOWN_Z = (GRID_MAX_Z + 3) * PLOT_PITCH;       // 720
const TREE_ROAD_CLEAR = ROAD_WIDTH / 2 + 5;          // keep trees this far from any road centre line
const TREE_RIVER_CLEAR = (RIVER_WIDTH + 13) / 2 + 6; // keep trees off the river and its sandy banks
const GROVE_COUNT = 80;       // number of small forests
const SINGLE_TREES = 150;     // trees standing alone
const treeRng = makeRng(777); // fixed seed: the trees are in the same places every visit

// For later phases (the air breeze can raise this number to make trees sway more).
const treeWindStrength = { value: 1 };

// ---------- Three tree shapes (each one is ONE merged shape) ----------
const TRUNK = 0x8a5a3a;

function buildRoundTree() {
  const b = makeBuilder();
  b.cyl(TRUNK, 0.9, 2.8, 0, 0, 0);
  b.ball(0x5fb04f, 5.2, 0, 4.4, 0, 0.9);
  b.ball(0x6cbc58, 3.6, 1.6, 5.2, 0.6, 0.9);
  b.ball(0x56a548, 3.4, -1.5, 4.9, -0.8, 0.9);
  return b.build();
}

function buildTallTree() {
  const b = makeBuilder();
  b.cyl(TRUNK, 0.8, 3.6, 0, 0, 0);
  b.ball(0x4f9e4a, 4.2, 0, 6.4, 0, 1.55);
  b.ball(0x5dae52, 3.0, 0.3, 8.6, 0.2, 1.2);
  return b.build();
}

function buildPineTree() {
  const b = makeBuilder();
  b.cyl(TRUNK, 0.7, 2.2, 0, 0, 0);
  b.cone(0x3f8f5a, 5.6, 3.0, 0, 1.6, 0);
  b.cone(0x479c60, 4.5, 2.8, 0, 3.6, 0);
  b.cone(0x4fa668, 3.4, 2.6, 0, 5.5, 0);
  b.cone(0x58b06f, 2.0, 1.8, 0, 7.3, 0);
  return b.build();
}

// ---------- The material (colours come from the shapes, the sway comes from the wind clock) ----------
const treeMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });
treeMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uWind = windUniform;
  shader.uniforms.uStrength = treeWindStrength;
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nuniform float uWind;\nuniform float uStrength;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
#ifdef USE_INSTANCING
  float sX = length(instanceMatrix[0].xyz);
  float sY = length(instanceMatrix[1].xyz);
  float hgt = position.y * sY;
  float phase = instanceMatrix[3].x * 0.21 + instanceMatrix[3].z * 0.17;
  transformed.x += sin(uWind * 1.1 + phase) * 0.0018 * uStrength * hgt * hgt / sX;
  transformed.z += cos(uWind * 0.9 + phase) * 0.0013 * uStrength * hgt * hgt / sX;
#endif`);
};

// ---------- Rules: where a tree is NOT allowed ----------
function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

function treeSpotIsFree(x, z) {
  if (Math.hypot(x, z) > 1300) return false;                                   // stay inside the world
  if (x > TOWN_MIN_X && x < TOWN_MAX_X && Math.abs(z) < TOWN_Z) return false;  // the town
  if (Math.abs(x - riverX(z)) < TREE_RIVER_CLEAR) return false;                // river and banks
  for (const road of ROADS) {
    const A = NODE[road.from];
    const B = NODE[road.to];
    if (distToSegment(x, z, A.x, A.z, B.x, B.z) < TREE_ROAD_CLEAR) return false;
  }
  return true;
}

// ---------- Choose the places ----------
const treeLists = { round: [], tall: [], pine: [] };
const usedCells = new Set(); // stops two trees from standing on top of each other

function tryPlaceTree(x, z) {
  if (!treeSpotIsFree(x, z)) return;
  const cell = `${Math.floor(x / 6)},${Math.floor(z / 6)}`;
  if (usedCells.has(cell)) return;
  usedCells.add(cell);

  const r = treeRng();
  const type = r < 0.4 ? 'round' : r < 0.65 ? 'tall' : 'pine';
  treeLists[type].push({
    x,
    z,
    size: 0.8 + treeRng() * 0.9,
    turn: treeRng() * Math.PI * 2,
    tint: 0.82 + treeRng() * 0.18
  });
}

// Small forests
for (let g = 0; g < GROVE_COUNT; g++) {
  const angle = treeRng() * Math.PI * 2;
  const distance = 200 + treeRng() * 900;
  const cx = Math.cos(angle) * distance;
  const cz = Math.sin(angle) * distance;
  const spread = 18 + treeRng() * 22;
  const count = 10 + Math.floor(treeRng() * 9);

  for (let i = 0; i < count; i++) {
    const ox = (treeRng() + treeRng() + treeRng() - 1.5) * 2 * spread;
    const oz = (treeRng() + treeRng() + treeRng() - 1.5) * 2 * spread;
    tryPlaceTree(cx + ox, cz + oz);
  }
}

// Trees standing alone
for (let i = 0; i < SINGLE_TREES; i++) {
  const angle = treeRng() * Math.PI * 2;
  const distance = 150 + Math.sqrt(treeRng()) * 1000;
  tryPlaceTree(Math.cos(angle) * distance, Math.sin(angle) * distance);
}

// ---------- Draw them (one InstancedMesh per tree type) ----------
const treeBuilders = { round: buildRoundTree, tall: buildTallTree, pine: buildPineTree };
const treeMeshes = {}; // kept so later phases can find the trees
const treeTint = new THREE.Color();

Object.keys(treeLists).forEach((type) => {
  const list = treeLists[type];
  if (list.length === 0) return;

  const mesh = new THREE.InstancedMesh(treeBuilders[type](), treeMaterial, list.length);
  list.forEach((tree, i) => {
    dummy.position.set(tree.x, 0, tree.z);
    dummy.rotation.set(0, tree.turn, 0);
    dummy.scale.set(tree.size, tree.size, tree.size);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    treeTint.setRGB(tree.tint, tree.tint, tree.tint); // a little darker or lighter for variety
    mesh.setColorAt(i, treeTint);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  if (mesh.computeBoundingSphere) mesh.computeBoundingSphere();
  scene.add(mesh);
  treeMeshes[type] = mesh;
});

// =====================================================
// 6f. INSIDE THE HOUSES (one furnished room for each house style)
// =====================================================
// The rooms are built far away from the town (x = 5000 and up). When you go inside,
// you are moved there. When you go out, you are moved back to the door.
const ROOM_HALF_W = 7;     // the room is 14 m wide ...
const ROOM_HALF_D = 5;     // ... and 10 m deep
const ROOM_HEIGHT = 3.6;

const INTERIOR_THEMES = {
  cottage:     { wall: 0xfbe3cf, floor: 0xc99560, accent: 0xc96f5a, sofa: 0xd98f7a, trim: 0xfff4e0 },
  treehouse:   { wall: 0xd9a566, floor: 0xa8764a, accent: 0x6dbb5a, sofa: 0x7fa86a, trim: 0x8a5a3a },
  modern:      { wall: 0xf4efe6, floor: 0xcfc3ae, accent: 0x3f8f8a, sofa: 0x4a4440, trim: 0xe9dfd0 },
  traditional: { wall: 0xe2a97c, floor: 0x9b6a45, accent: 0x8d3b32, sofa: 0xb5523b, trim: 0xfff4e0 }
};

function buildInterior(style) {
  const t = INTERIOR_THEMES[style];
  const b = makeBuilder();
  const hw = ROOM_HALF_W;
  const hd = ROOM_HALF_D;
  const H = ROOM_HEIGHT;
  const WOOD = 0xb98a5a;
  const WOOD_DK = 0x7a5237;
  const GLASS_IN = 0xdff4ff;
  const books = [0xd9534f, 0x5bc0de, 0xf0ad4e, 0x5cb85c, 0x9b59b6];

  // Floor, ceiling and four walls (the floor's top is at y = 0)
  b.box(t.floor, 15, 0.3, 11, 0, -0.3, 0);
  b.box(t.trim, 15, 0.3, 11, 0, H, 0);
  b.box(t.wall, 15, H, 0.4, 0, 0, -hd - 0.2);   // north wall
  b.box(t.wall, 15, H, 0.4, 0, 0, hd + 0.2);    // south wall (the door is here)
  b.box(t.wall, 0.4, H, 10, -hw - 0.2, 0, 0);   // west wall
  b.box(t.wall, 0.4, H, 10, hw + 0.2, 0, 0);    // east wall

  // Skirting boards along the bottom of the walls
  b.box(t.trim, 14, 0.25, 0.1, 0, 0, -hd + 0.05);
  b.box(t.trim, 0.1, 0.25, 10, -hw + 0.05, 0, 0);
  b.box(t.trim, 0.1, 0.25, 10, hw - 0.05, 0, 0);

  // The door (south wall, in the middle)
  b.box(t.trim, 2.3, 2.9, 0.1, 0, 0, hd - 0.05);
  b.box(WOOD_DK, 1.8, 2.5, 0.12, 0, 0, hd - 0.07);
  b.box(0xf2c94c, 0.12, 0.12, 0.08, 0.6, 1.2, hd - 0.15);

  // Windows: two on the north wall, one on the east wall (soft daylight colour)
  [-3.6, 3.6].forEach((x) => {
    b.box(t.trim, 3.2, 2.0, 0.08, x, 0.9, -hd + 0.04);
    b.box(GLASS_IN, 2.8, 1.6, 0.1, x, 1.1, -hd + 0.05);
  });
  b.box(t.trim, 0.08, 2.0, 3.2, hw - 0.04, 0.9, 0.5);
  b.box(GLASS_IN, 0.1, 1.6, 2.8, hw - 0.05, 1.1, 0.5);

  // A picture above the sofa
  b.box(WOOD_DK, 1.8, 1.2, 0.06, 0, 1.5, -hd + 0.03);
  b.box(t.accent, 1.5, 0.9, 0.08, 0, 1.65, -hd + 0.04);

  // Rug
  b.box(t.accent, 6, 0.04, 4, 0, 0, 0.6);

  // Sofa (against the north wall)
  b.box(t.sofa, 3.6, 0.7, 1.3, 0, 0, -hd + 1.3);        // seat
  b.box(t.sofa, 3.6, 0.9, 0.35, 0, 0.7, -hd + 0.7);     // back
  b.box(t.sofa, 0.4, 1.1, 1.3, -1.9, 0, -hd + 1.3);     // arms
  b.box(t.sofa, 0.4, 1.1, 1.3, 1.9, 0, -hd + 1.3);

  // Coffee table
  b.box(WOOD, 1.8, 0.1, 1.0, 0, 0.5, 0.2);
  b.box(WOOD_DK, 0.12, 0.5, 0.8, -0.8, 0, 0.2);
  b.box(WOOD_DK, 0.12, 0.5, 0.8, 0.8, 0, 0.2);

  // Bookshelf (west wall) with books
  b.box(WOOD_DK, 0.6, 2.6, 3.4, -hw + 0.3, 0, -1);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 7; i++) {
      b.box(books[(row + i) % books.length], 0.35, 0.55, 0.28, -hw + 0.65, 0.2 + row * 0.8, -2.4 + i * 0.42);
    }
  }

  // Bed (east wall, in the north corner)
  const bedX = hw - 1.8;
  b.box(WOOD, 2.6, 0.5, 3.6, bedX, 0, -2.8);            // frame
  b.box(0xfff4e0, 2.4, 0.3, 3.4, bedX, 0.5, -2.8);      // mattress
  b.box(t.accent, 2.4, 0.12, 2.2, bedX, 0.8, -2.3);     // blanket
  b.box(0xffffff, 1.0, 0.2, 0.7, bedX, 0.8, -4.2);      // pillow
  b.box(WOOD_DK, 2.6, 1.3, 0.2, bedX, 0, -4.7);         // headboard

  // Dining table and two chairs (south-east)
  b.box(WOOD, 2.6, 0.12, 1.6, 3.8, 0.75, 2.4);
  [[-1.1, -0.6], [1.1, -0.6], [-1.1, 0.6], [1.1, 0.6]].forEach(([ox, oz]) => {
    b.box(WOOD_DK, 0.14, 0.75, 0.14, 3.8 + ox, 0, 2.4 + oz);
  });
  [-1.3, 1.3].forEach((oz) => {
    b.box(t.accent, 0.7, 0.12, 0.7, 3.8, 0.45, 2.4 + oz);
    b.box(WOOD_DK, 0.1, 0.45, 0.1, 3.5, 0, 2.4 + oz - 0.28);
    b.box(WOOD_DK, 0.1, 0.45, 0.1, 4.1, 0, 2.4 + oz - 0.28);
    b.box(t.accent, 0.7, 0.6, 0.1, 3.8, 0.55, 2.4 + oz + (oz < 0 ? -0.3 : 0.3));
  });

  // Plants in the two south corners
  [[-hw + 0.8, hd - 0.8], [hw - 0.8, hd - 0.8]].forEach(([x, z]) => {
    b.cyl(0xd7a77a, 0.8, 0.7, x, 0, z);
    b.ball(LEAF, 1.5, x, 1.4, z);
  });

  // Standing lamp and a hanging lamp
  b.cyl(WOOD_DK, 0.1, 1.6, -3.2, 0, -hd + 0.8);
  b.cyl(0xfff0b0, 0.7, 0.5, -3.2, 1.5, -hd + 0.8);
  b.cyl(WOOD_DK, 0.06, 1.0, 0, H - 1.0, 0.6);
  b.ball(0xfff0b0, 1.0, 0, H - 1.15, 0.6, 0.7);

  // Extra for the treehouse: a tree trunk through the room and leaves on the ceiling
  if (style === 'treehouse') {
    b.cyl(0x7d5232, 1.8, H, -4.5, 0, 2.5);
    [[-5.5, -3.5], [5.5, 3.5], [-5.5, 3.5]].forEach(([x, z]) => b.ball(0x6dbb5a, 2.6, x, H - 0.4, z, 0.6));
  }

  return b.build();
}

const interiors = {};
HOUSE_STYLES.forEach((style, i) => {
  const mesh = new THREE.Mesh(buildInterior(style), houseMaterial);
  mesh.position.set(5000 + i * 100, 0, 0);
  mesh.visible = false;
  mesh.frustumCulled = false;
  scene.add(mesh);
  interiors[style] = { mesh, x: 5000 + i * 100, z: 0 };
});

// =====================================================
// 7. PLAYER + CONTROLS (keyboard, mouse, touch)
// =====================================================
const EYE_HEIGHT = 1.7;      // how high your eyes are above the ground when walking
const MAX_ALTITUDE = 100;    // the highest you can fly above the ground (metres)

// player.y is the height of your eyes above the ground.
const player = { x: 0, y: EYE_HEIGHT, z: 45, yaw: 0, pitch: 0.1 };

// Fly mode state
let flying = false;   // true while in fly mode
let landing = false;  // true while gently coming down to land
let vy = 0;           // up/down speed
const vel = { x: 0, z: 0 }; // sideways speed (used to make flying smooth)

// Inside a house? null = outside. Otherwise { plot, style, x, z } (x, z = the room's middle).
let inside = null;

// Touch buttons for up/down (true while a finger is holding them)
let touchUp = false;
let touchDown = false;

let started = false;     // becomes true when you press "Enter the World"
const keys = new Set();  // which keyboard keys are held down

window.addEventListener('keydown', (e) => {
  keys.add(e.code);

  if (e.code === 'Space') e.preventDefault(); // stop the page from scrolling

  // F toggles fly mode (ignore key repeat, and Ctrl+F / Cmd+F which is "find")
  if (started && e.code === 'KeyF' && !e.repeat && !e.ctrlKey && !e.metaKey) {
    toggleFly();
  }

  // E uses the door (go inside / go outside)
  if (started && e.code === 'KeyE' && !e.repeat && !e.ctrlKey && !e.metaKey) {
    useDoor();
  }
});
window.addEventListener('keyup', (e) => keys.delete(e.code));
window.addEventListener('blur', () => {
  keys.clear();
  touchUp = false;
  touchDown = false;
});

// --- Looking around (mouse drag or finger drag on the canvas) ---
let lookId = null;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('pointerdown', (e) => {
  if (!started || lookId !== null) return;
  lookId = e.pointerId;
  lastX = e.clientX;
  lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId !== lookId) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  player.yaw -= dx * 0.004;
  player.pitch -= dy * 0.004;
  player.pitch = Math.max(-1.3, Math.min(1.3, player.pitch));
});

function endLook(e) {
  if (e.pointerId === lookId) lookId = null;
}
canvas.addEventListener('pointerup', endLook);
canvas.addEventListener('pointercancel', endLook);

// --- Touch joystick (left circle) ---
const joystick = document.getElementById('joystick');
const stick = document.getElementById('stick');
const JOY_RADIUS = 45;
const joy = { x: 0, y: 0 };
let joyId = null;

function moveStick(e) {
  const rect = joystick.getBoundingClientRect();
  let dx = e.clientX - (rect.left + rect.width / 2);
  let dy = e.clientY - (rect.top + rect.height / 2);
  const dist = Math.hypot(dx, dy);
  if (dist > JOY_RADIUS) {
    dx *= JOY_RADIUS / dist;
    dy *= JOY_RADIUS / dist;
  }
  stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  joy.x = dx / JOY_RADIUS;
  joy.y = dy / JOY_RADIUS;
}

function resetStick() {
  joyId = null;
  joy.x = 0;
  joy.y = 0;
  stick.style.transform = 'translate(-50%, -50%)';
}

joystick.addEventListener('pointerdown', (e) => {
  joyId = e.pointerId;
  joystick.setPointerCapture(e.pointerId);
  moveStick(e);
});
joystick.addEventListener('pointermove', (e) => {
  if (e.pointerId === joyId) moveStick(e);
});
joystick.addEventListener('pointerup', (e) => {
  if (e.pointerId === joyId) resetStick();
});
joystick.addEventListener('pointercancel', (e) => {
  if (e.pointerId === joyId) resetStick();
});

// --- Fly buttons (touch) ---
const flyButtons = document.getElementById('flyButtons');
const flyBtn = document.getElementById('flyBtn');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');

flyBtn.addEventListener('click', () => {
  if (started) toggleFly();
});

// Up and Down buttons work while a finger is holding them.
function holdButton(button, setValue) {
  button.addEventListener('pointerdown', (e) => {
    button.setPointerCapture(e.pointerId);
    button.classList.add('pressed');
    setValue(true);
  });
  const release = () => {
    button.classList.remove('pressed');
    setValue(false);
  };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
}
holdButton(upBtn, (v) => { touchUp = v; });
holdButton(downBtn, (v) => { touchDown = v; });

// --- Turning fly mode on and off ---
function toggleFly() {
  if (inside) return; // no flying inside a house
  if (!flying) {
    // Take off: a small push upward so we leave the ground.
    flying = true;
    landing = false;
    vy = 4;
  } else {
    // Press again while flying: start landing. Press again while landing: cancel landing.
    landing = !landing;
  }
  updateFlyUI();
}

function updateFlyUI() {
  flyBtn.textContent = flying && !landing ? 'Land' : 'Fly';
  const showUpDown = flying && !landing;
  upBtn.classList.toggle('hidden', !showUpDown);
  downBtn.classList.toggle('hidden', !showUpDown);
}

// --- Moving the player every frame ---
function updatePlayer(dt) {
  let forward = 0;
  let strafe = 0;

  if (keys.has('KeyW') || keys.has('ArrowUp')) forward += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) forward -= 1;
  if (keys.has('KeyD')) strafe += 1;
  if (keys.has('KeyA')) strafe -= 1;
  if (keys.has('ArrowLeft')) player.yaw += 1.8 * dt;
  if (keys.has('ArrowRight')) player.yaw -= 1.8 * dt;

  // Add the touch joystick (pushing up = walk forward).
  forward += -joy.y;
  strafe += joy.x;

  // Don't let diagonal movement be faster.
  const length = Math.hypot(forward, strafe);
  if (length > 1) {
    forward /= length;
    strafe /= length;
  }

  const shift = keys.has('ShiftLeft') || keys.has('ShiftRight');
  let speed;
  if (flying) {
    speed = shift ? 30 : 14;          // flying is faster than walking
  } else if (inside) {
    speed = shift ? 6 : 3.5;          // calmer pace inside the house
  } else {
    speed = shift ? 12 : 6;
    // Wading through the river slows you down (only when walking, and not on the bridge).
    if (!isOnBridge(player.x, player.z) &&
        Math.abs(player.x - riverX(player.z)) < RIVER_WIDTH / 2) {
      speed *= 0.5;
    }
  }

  const sin = Math.sin(player.yaw);
  const cos = Math.cos(player.yaw);
  const targetX = (-sin * forward + cos * strafe) * speed;
  const targetZ = (-cos * forward - sin * strafe) * speed;

  if (flying) {
    // Smooth flying: speed eases toward the target instead of jumping to it.
    const ease = 1 - Math.exp(-4 * dt);
    vel.x += (targetX - vel.x) * ease;
    vel.z += (targetZ - vel.z) * ease;
  } else {
    // Walking is direct. We also remember the speed so take-off feels smooth.
    vel.x = targetX;
    vel.z = targetZ;
  }

  player.x += vel.x * dt;
  player.z += vel.z * dt;

  // Up and down (fly mode only)
  if (flying) {
    let up = 0;
    if (!landing) {
      if (keys.has('Space') || touchUp) up += 1;
      if (keys.has('ControlLeft') || keys.has('ControlRight') || keys.has('KeyC') || touchDown) up -= 1;
    }

    let targetVy = up * 12;

    if (landing) {
      // Come down gently: fast when high, slow near the ground.
      const heightAboveGround = player.y - EYE_HEIGHT;
      targetVy = -Math.min(10, 1.5 + heightAboveGround * 0.8);
    }

    vy += (targetVy - vy) * (1 - Math.exp(-5 * dt));
    player.y += vy * dt;

    // Never go higher than the maximum.
    if (player.y > EYE_HEIGHT + MAX_ALTITUDE) {
      player.y = EYE_HEIGHT + MAX_ALTITUDE;
      if (vy > 0) vy = 0;
    }

    // Never go under the ground. Touching down while landing (or holding Down) ends fly mode.
    if (player.y <= EYE_HEIGHT) {
      player.y = EYE_HEIGHT;
      if (vy < 0) vy = 0;
      if (landing || up < 0) {
        flying = false;
        landing = false;
        vy = 0;
        updateFlyUI();
      }
    }
  }

  if (inside) {
    // Keep the player inside the room's walls.
    const maxX = ROOM_HALF_W - 0.6;
    const maxZ = ROOM_HALF_D - 0.6;
    player.x = Math.max(inside.x - maxX, Math.min(inside.x + maxX, player.x));
    player.z = Math.max(inside.z - maxZ, Math.min(inside.z + maxZ, player.z));
  } else {
    // Keep the player inside the world.
    const distance = Math.hypot(player.x, player.z);
    if (distance > 1400) {
      player.x *= 1400 / distance;
      player.z *= 1400 / distance;
    }
  }
}

// =====================================================
// 8. MENU BUTTONS AND SCREENS
// =====================================================
const loadingScreen = document.getElementById('loading');
const menuScreen = document.getElementById('menu');
const hud = document.getElementById('hud');
const hudHint = document.getElementById('hudHint');
const hudAltitude = document.getElementById('hudAltitude');
const startBtn = document.getElementById('startBtn');
const doorBtn = document.getElementById('doorBtn');
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

// The small help text at the top left.
function setHint() {
  if (inside) {
    hudHint.textContent = 'Inside the house. Walk to the door and press E (or tap the button) to go out.';
  } else if (isTouchDevice) {
    hudHint.textContent = 'Left circle: walk. Drag to look. Fly button: fly. Door button: go in.';
  } else {
    hudHint.textContent = 'WASD: walk. Shift: run. F: fly. E: door. Space up, Ctrl/C down.';
  }
}

startBtn.addEventListener('click', () => {
  started = true;
  menuScreen.classList.add('hidden');
  hud.classList.remove('hidden');

  if (isTouchDevice) {
    joystick.classList.remove('hidden');
    flyButtons.classList.remove('hidden');
  }
  setHint();
});

// Show the altitude (only touches the page when the text changes).
let lastAltitudeText = '';
function updateAltitudeDisplay() {
  const metres = Math.max(0, Math.round(player.y - EYE_HEIGHT));
  let text;
  if (inside) {
    text = 'Inside a house';
  } else {
    let mode = 'Walking';
    if (flying) mode = landing ? 'Landing' : 'Flying';
    text = `${mode} \u00B7 Altitude: ${metres} m`;
  }
  if (text !== lastAltitudeText) {
    hudAltitude.textContent = text;
    lastAltitudeText = text;
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// =====================================================
// 8b. DOORS (go inside a house and come back out)
// =====================================================
// Where you must stand to use each house's door. (x, z) are measured in the HOUSE's own
// directions: x = right, z = toward the street (the way the house faces).
const DOOR_SPOTS = {
  cottage: { x: 0, z: 1.3 },
  treehouse: { x: 0, z: 1.1 },   // at the bottom of the ladder
  modern: { x: 0.8, z: 1.7 },
  traditional: { x: 0, z: 2.4 }
};
const DOOR_REACH = 2.4;          // how close you must be (metres)

let doorAction = null;           // 'enter', 'exit' or null
let doorPlot = null;             // the plot whose door is near you
let lastDoorText = '';

// Is the player next to the door of a house? Returns that plot, or null.
function findNearbyDoor() {
  const gx = Math.floor(player.x / PLOT_PITCH);
  const gz = Math.floor(player.z / PLOT_PITCH);
  const plot = PLOT_AT[`${gx},${gz}`];
  if (!plot || !plot.house) return null;

  const spot = DOOR_SPOTS[plot.house];
  const dx = player.x - plot.x;
  const dz = player.z - plot.z;
  const c = Math.cos(plot.facing);
  const s = Math.sin(plot.facing);
  const lx = c * dx - s * dz;    // turn the world position into the house's own directions
  const lz = s * dx + c * dz;
  return Math.hypot(lx - spot.x, lz - spot.z) < DOOR_REACH ? plot : null;
}

// Runs every frame: decides if the door button should be shown.
function updateDoorPrompt() {
  let text = '';
  doorAction = null;
  doorPlot = null;

  if (inside) {
    // Near the inside door (the south wall, in the middle)?
    if (player.z > inside.z + ROOM_HALF_D - 1.8 && Math.abs(player.x - inside.x) < 2.2) {
      doorAction = 'exit';
      text = 'Go outside (E)';
    }
  } else if (!flying && player.y - EYE_HEIGHT < 3) {
    doorPlot = findNearbyDoor();
    if (doorPlot) {
      doorAction = 'enter';
      text = doorPlot.house === 'treehouse' ? 'Climb up and go inside (E)' : 'Go inside (E)';
    }
  }

  doorBtn.classList.toggle('hidden', doorAction === null);
  if (text !== lastDoorText && text !== '') {
    doorBtn.textContent = text;
  }
  lastDoorText = text;
}

function enterHouse(plot) {
  const room = interiors[plot.house];
  inside = { plot, style: plot.house, x: room.x, z: room.z };
  room.mesh.visible = true;

  // No flying inside, and stop any movement.
  flying = false;
  landing = false;
  vy = 0;
  vel.x = 0;
  vel.z = 0;
  updateFlyUI();

  // Appear just inside the door, looking into the room.
  player.x = room.x;
  player.z = room.z + ROOM_HALF_D - 1.4;
  player.y = EYE_HEIGHT;
  player.yaw = 0;
  player.pitch = 0;

  updateHouseLOD();
  setHint();
}

function exitHouse() {
  const plot = inside.plot;
  interiors[inside.style].mesh.visible = false;

  // Stand just outside the door, looking away from the house.
  const spot = DOOR_SPOTS[plot.house];
  const lz = spot.z + 0.6;
  const c = Math.cos(plot.facing);
  const s = Math.sin(plot.facing);
  player.x = plot.x + c * spot.x + s * lz;
  player.z = plot.z - s * spot.x + c * lz;
  player.y = EYE_HEIGHT;
  player.yaw = plot.facing + Math.PI;
  player.pitch = 0.1;

  inside = null;
  vel.x = 0;
  vel.z = 0;
  updateHouseLOD();
  setHint();
}

// Pressing E (or the door button) does whatever the door button says.
function useDoor() {
  if (doorAction === 'enter' && doorPlot) enterHouse(doorPlot);
  else if (doorAction === 'exit' && inside) exitHouse();
}

doorBtn.addEventListener('click', () => {
  if (started) useDoor();
});

// =====================================================
// 9. THE GAME LOOP (runs about 60 times per second)
// =====================================================
let lastTime = performance.now();
let lodTimer = 0;

function animate(now) {
  requestAnimationFrame(animate);

  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  if (started) {
    updatePlayer(dt);
    updateAltitudeDisplay();
    updateDoorPrompt();

    // Every 0.3 seconds, decide which houses are detailed and which are simple.
    lodTimer += dt;
    if (lodTimer > 0.3) {
      lodTimer = 0;
      updateHouseLOD();
    }
  }

  // Put the camera where the player is.
  camera.position.set(player.x, player.y, player.z);
  camera.rotation.set(player.pitch, player.yaw, 0);

  // The sky follows the camera so it never gets closer.
  skyGroup.position.copy(camera.position);

  // Clouds drift slowly to the right, then wrap around.
  clouds.children.forEach((cloud) => {
    cloud.position.x += dt * 3;
    if (cloud.position.x > 800) cloud.position.x = -800;
  });

  // The river flows (the ripples slide along the water) and the wind clock ticks.
  waterTexture.offset.y -= dt * 0.05;
  windUniform.value = now / 1000;

  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

// Everything is built: show the right houses, hide the loading screen and show the main menu.
updateHouseLOD();
loadingScreen.classList.add('hidden');
menuScreen.classList.remove('hidden');
