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

// A clock for everything that sways in the wind (reeds, trees).
// It runs a little faster during a gust (see section 6g, THE BREEZE).
const windUniform = { value: 0 };

// The breeze: gustUniform is 0 in calm air and goes up to 1 in the strongest gust.
// windDirUniform is the direction the wind blows TOWARD, on the ground (x, z).
const gustUniform = { value: 0 };
const windDirUniform = { value: new THREE.Vector2(0.8, 0.6).normalize() };

// Shader code shared by trees and reeds: during a gust they lean along the wind direction,
// and the gust "rolls" across the land as a wave instead of hitting everything at once.
// "leanAmount" is how far (in metres, at 1 m tall squared) a gust bends them.
function gustLeanGLSL(leanAmount) {
  return `
  float sZ = length(instanceMatrix[2].xyz);
  vec3 axisX = instanceMatrix[0].xyz / sX;
  vec3 axisZ = instanceMatrix[2].xyz / sZ;
  vec3 worldDir = vec3(uWindDir.x, 0.0, uWindDir.y);
  vec2 localDir = vec2(dot(axisX, worldDir), dot(axisZ, worldDir));
  float front = 0.75 + 0.25 * sin(dot(instanceMatrix[3].xz, uWindDir) * 0.03 - uWind * 1.6);
  float lean = uGust * front * ${leanAmount} * hgt * hgt / sX;
  transformed.x += localDir.x * lean;
  transformed.z += localDir.y * lean;`;
}

// Shader code for LIGHT things (leaves, branch tips, flowers, garlands, petals, a hanging bell).
// Every point has a "flex" number (see makeBuilder): 0 = stays still, 1 = moves freely.
// In a gust a flexible point is pushed along the wind, swings slowly (whole branches and stems
// moving), and rustles quickly (single leaves). Even in still air it stirs a tiny bit.
//   lean   : how far (m) a gust pushes it downwind
//   swing  : how far (m) it swings slowly
//   rustle : how far (m) it shakes quickly
function flexSwayGLSL(lean, swing, rustle) {
  return `
  if (flex > 0.001) {
    #ifdef USE_INSTANCING
      vec3 fwp = (instanceMatrix * vec4(position, 1.0)).xyz;
    #else
      vec3 fwp = position;
    #endif
    float fg = 0.15 + uGust;
    float slowA = sin(uWind * 2.1 + fwp.x * 0.8 + fwp.z * 0.6);
    float slowB = cos(uWind * 1.7 + fwp.z * 0.9 - fwp.x * 0.5);
    float fastA = sin(uWind * 9.0 + fwp.x * 4.1 + fwp.y * 3.3 + fwp.z * 2.7);
    float fastB = cos(uWind * 11.0 + fwp.x * 3.1 - fwp.y * 4.3 + fwp.z * 3.7);
    vec3 push = vec3(uWindDir.x, 0.0, uWindDir.y) * (uGust * ${lean} * (0.7 + 0.3 * slowA));
    vec3 off = push + vec3(slowA * ${swing} * fg, 0.0, slowB * ${swing} * fg);
    off += vec3(fastA, 0.5 * fastB, fastB) * ${rustle} * fg;
    off *= flex;
    #ifdef USE_INSTANCING
      vec3 fsc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
      vec3 fax = instanceMatrix[0].xyz / fsc.x;
      vec3 fay = instanceMatrix[1].xyz / fsc.y;
      vec3 faz = instanceMatrix[2].xyz / fsc.z;
      off = vec3(dot(fax, off) / fsc.x, dot(fay, off) / fsc.y, dot(faz, off) / fsc.z);
    #endif
    transformed += off;
  }`;
}

// Gives a material the flexible-things wind. "name" must be different for every different setting.
function addFlexSway(material, name, lean, swing, rustle) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWind = windUniform;
    shader.uniforms.uGust = gustUniform;
    shader.uniforms.uWindDir = windDirUniform;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float flex;\nuniform float uWind;\nuniform float uGust;\nuniform vec2 uWindDir;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + flexSwayGLSL(lean, swing, rustle));
  };
  material.customProgramCacheKey = () => name;
}

// Flames flicker all the time and lean away from the wind. A gust makes them dance (and lean a lot).
function makeFlameMaterial() {
  const material = new THREE.MeshBasicMaterial({ vertexColors: true });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWind = windUniform;
    shader.uniforms.uGust = gustUniform;
    shader.uniforms.uWindDir = windDirUniform;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float flex;\nuniform float uWind;\nuniform float uGust;\nuniform vec2 uWindDir;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
  float flick = 0.012 + 0.035 * uGust;
  float fx = sin(uWind * 25.0 + position.x * 40.0 + position.z * 31.0) + 0.6 * sin(uWind * 41.0 + position.z * 50.0);
  float fz = cos(uWind * 29.0 + position.x * 37.0) + 0.6 * cos(uWind * 47.0 + position.x * 23.0);
  vec3 offFlame = vec3(
    uWindDir.x * uGust * 0.16 + fx * flick,
    -uGust * 0.05,
    uWindDir.y * uGust * 0.16 + fz * flick);
  transformed += offFlame * flex;`);
  };
  material.customProgramCacheKey = () => 'flame';
  return material;
}

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

  // "Flex" says how freely each part moves in the wind: 0 = stiff (stone, walls, wood),
  // 1 = moves freely (leaves, flowers, garlands, flames). Every point of a part gets its own number.
  //   flex(v)              : the whole part has the same flex v
  //   flexUp(yBase, yTip)  : flex grows from 0 at yBase to v at yTip (flower stems, flames, branch tips)
  //   flexDown(yTop, yBot) : flex grows from 0 at yTop to v at yBot (hanging things: bells, ropes)
  // The setting stays on for every part added after it, so call flex(0) to turn it off again.
  const flex = [];
  let flexMode = 0;      // 0 = same everywhere, 1 = grows upwards, 2 = grows downwards
  let flexValue = 0;
  let flexA = 0;
  let flexB = 1;
  const flexAt = (y) => {
    if (flexMode === 0) return flexValue;
    const t = flexMode === 1 ? (y - flexA) / (flexB - flexA) : (flexA - y) / (flexA - flexB);
    return flexValue * Math.max(0, Math.min(1, t));
  };

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
    for (let i = 0; i < pa.length / 3; i++) {
      col.push(c.r, c.g, c.b);
      flex.push(flexAt(pa[i * 3 + 1]));
    }
    g.dispose();
  }

  return {
    // Wind flexibility for the parts added after these calls (see the note above).
    flex(v) { flexMode = 0; flexValue = v; },
    flexUp(yBase, yTip, v = 1) { flexMode = 1; flexValue = v; flexA = yBase; flexB = yTip; },
    flexDown(yTop, yBot, v = 1) { flexMode = 2; flexValue = v; flexA = yTop; flexB = yBot; },

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
    ellip(color, sx, sy, sz, x, y, z, rx = 0, ry = 0, rz = 0) { add(U_BALL, color, x, y, z, sx, sy, sz, rx, ry, rz); },
    cylRot(color, dia, len, x, y, z, rx, ry, rz) { add(U_CYL, color, x, y, z, dia, len, dia, rx, ry, rz); },

    build() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      g.setAttribute('flex', new THREE.Float32BufferAttribute(flex, 1));
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
  b.flexUp(G + 0.15, G + 0.95, 0.9);   // flowers nod in the wind: the stem barely, the flower head most
  for (let i = 0; i < n; i++) {
    const fx = x + (Math.random() - 0.5) * (w - 0.6);
    const fz = z + (Math.random() - 0.5) * (d - 0.6);
    b.dot(0x5fae4e, 0.45, fx, G + 0.38, fz);
    b.dot(FLOWER_COLORS[i % FLOWER_COLORS.length], 0.42, fx, G + 0.7, fz);
  }
  b.flex(0);
}

// A round bush.
function bush(b, x, z, size = 1.9) {
  if (liteMode) return;
  b.flex(0.5);   // the leaves of a bush ruffle in the wind
  b.ball(LEAF, size, x, G + size * 0.42, z, 0.85);
  b.flex(0);
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
  b.flex(1);   // the leaves shake in the wind
  [0, 180, 215, 250, 290, 325].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    b.ball(leafColors[i % 3], 4.4, Math.cos(a) * 4.3, G + 7.2 + (i % 2) * 0.8, -4.5 + Math.sin(a) * 4.3, 0.85);
  });
  b.ball(0x58a84d, 4.5, 0, G + 10.2, -6.2, 0.85);
  b.flex(0);

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
    b.flex(0.4);   // window-box flowers nod in the wind
    [-0.5, 0, 0.5].forEach((o, i) => b.dot(FLOWER_COLORS[i], 0.4, x + o, G + 1.15, Zf + 0.3));
    b.flex(0);
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
addFlexSway(houseMaterial, 'house', 0.2, 0.15, 0.05);   // garden flowers, bushes and treehouse leaves move in the wind
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
// 6b2. THE SACRED PEEPAL TREE AND THE GANESHA SHRINE (in the middle of the town square)
// =====================================================
const SQUARE_TOP = 0.3;                 // height of the plaza floor
const PLATFORM_R1 = 5.0;                // the stone platform (chabutara) around the tree
const SHRINE = { x: 0, z: 9.2 };        // the little shrine, in front of the tree (facing the south road)

(function buildSacredSquare() {
  const wasLite = liteMode;
  liteMode = false;                      // always build every small detail
  const rng = makeRng(4242);
  const b = makeBuilder();               // stone, wood, leaves, flowers
  const f = makeBuilder();               // flames (drawn bright, never dark)

  // One lamp flame. It is fixed at the bottom and flickers and leans more towards the tip.
  function flame(dia, h, x, y, z) {
    f.flexUp(y, y + h, 1);
    f.cone(0xffd24a, dia, h, x, y, z);
  }

  // A thin part pointing from one point to another (branches, arms, roots).
  const upAxis = new THREE.Vector3(0, 1, 0);
  const dirVec = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  // sway > 0 makes the branch move in the wind, more and more towards its tip.
  function limb(color, dia, x1, y1, z1, x2, y2, z2, sway = 0) {
    if (sway > 0) b.flexUp(Math.min(y1, y2), Math.max(y1, y2), sway);
    else b.flex(0);
    dirVec.set(x2 - x1, y2 - y1, z2 - z1);
    const len = dirVec.length();
    dirVec.normalize();
    quat.setFromUnitVectors(upAxis, dirVec);
    euler.setFromQuaternion(quat, 'XYZ');
    b.cylRot(color, dia, len, (x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2, euler.x, euler.y, euler.z);
  }

  const GOLD = 0xe0a82e;
  const MARIGOLD = [0xff9f1c, 0xffc300, 0xff7a00, 0xffd93b];
  const WOOD = 0x7c6d5e;
  const WOOD_DK = 0x6a5c4e;

  // ---------- Stone platform (chabutara) ----------
  b.cyl(0xcdb892, PLATFORM_R1 * 2, 0.55, 0, SQUARE_TOP, 0);                 // lower tier
  b.cyl(0xb8402c, PLATFORM_R1 * 2 + 0.08, 0.14, 0, SQUARE_TOP + 0.2, 0);    // red painted band
  b.cyl(0xf3ead2, 8.4, 0.4, 0, SQUARE_TOP + 0.55, 0);                       // upper tier
  const TOP2 = SQUARE_TOP + 0.95;                                           // top of the platform

  // ---------- The big Peepal (sacred fig / Bodhi) tree ----------
  b.cyl(WOOD_DK, 4.6, 1.2, 0, TOP2, 0);                  // wide root base
  b.cyl(WOOD, 3.0, 9.2, 0, TOP2 + 1.1, 0);               // thick trunk

  // Roots spreading over the platform
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rng() * 0.3;
    limb(WOOD_DK, 0.9, Math.cos(a) * 1.0, TOP2 + 2.3, Math.sin(a) * 1.0, Math.cos(a) * 3.3, TOP2, Math.sin(a) * 3.3);
  }

  // Sacred threads and a saffron cloth tied around the trunk
  b.cyl(0xc62828, 3.12, 0.14, 0, TOP2 + 2.0, 0);
  b.cyl(0xffc107, 3.12, 0.1, 0, TOP2 + 2.25, 0);
  b.cyl(0xc62828, 3.12, 0.14, 0, TOP2 + 2.5, 0);
  b.cyl(0xff8f00, 3.2, 0.55, 0, TOP2 + 3.3, 0);

  // Big spreading branches and the leafy crown
  const greens = [0x4f9b3a, 0x5fae3f, 0x6dbb48, 0x7ec850, 0x429134];
  // Every leafy ball of the crown is fully flexible, so the whole crown shakes and rustles in a gust.
  const crown = (x, y, z, dia, squash) => {
    b.flex(1);
    b.ball(greens[Math.floor(rng() * greens.length)], dia, x, y, z, squash);
  };

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + rng() * 0.4;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const midY = TOP2 + 12 + rng() * 1.5;
    const endY = TOP2 + 14.2 + rng() * 2;
    limb(WOOD, 1.3, ca * 0.6, TOP2 + 9.0 + rng() * 1.2, sa * 0.6, ca * 5.5, midY, sa * 5.5, 0.25);
    limb(WOOD, 0.8, ca * 5.5, midY, sa * 5.5, ca * 10.5, endY, sa * 10.5, 0.8);
    for (let k = 0; k < 5; k++) {
      crown(ca * 10.5 + (rng() - 0.5) * 7, endY + (rng() - 0.3) * 4, sa * 10.5 + (rng() - 0.5) * 7, 7 + rng() * 3, 0.7);
    }
  }
  for (let i = 0; i < 30; i++) {            // the top dome
    const r = Math.sqrt(rng()) * 9;
    const a = rng() * Math.PI * 2;
    crown(Math.cos(a) * r, TOP2 + 14 + (1 - r / 9) * 5 + rng() * 2, Math.sin(a) * r, 7 + rng() * 4, 0.7);
  }
  for (let i = 0; i < 24; i++) {            // lower, drooping edge
    const r = 8 + rng() * 7;
    const a = rng() * Math.PI * 2;
    crown(Math.cos(a) * r, TOP2 + 10.5 + rng() * 3.5, Math.sin(a) * r, 5.5 + rng() * 3, 0.7);
  }
  b.flex(1);
  for (let i = 0; i < 18; i++) {            // fresh light-green leaves on top
    const r = Math.sqrt(rng()) * 11;
    const a = rng() * Math.PI * 2;
    b.ball(0x9bd65c, 3 + rng() * 1.5, Math.cos(a) * r, TOP2 + 17.5 + (1 - r / 11) * 4.5 + rng() * 1.5, Math.sin(a) * r, 0.7);
  }
  b.flex(0);

  // ---------- Garland and lamps on the platform ----------
  b.flex(0.15);                             // the garland flowers ruffle a little
  for (let i = 0; i < 44; i++) {            // marigold garland around the upper tier
    const a = (i / 44) * Math.PI * 2;
    b.dot(MARIGOLD[i % 4], 0.34, Math.cos(a) * 4.05, TOP2 + 0.14, Math.sin(a) * 4.05);
  }
  b.flex(0);
  for (let i = 0; i < 14; i++) {            // clay lamps (diyas) around the lower tier
    const a = (i / 14) * Math.PI * 2 + 0.2;
    const x = Math.cos(a) * 4.6;
    const z = Math.sin(a) * 4.6;
    b.cyl(0xb5522b, 0.34, 0.1, x, SQUARE_TOP + 0.55, z);
    flame(0.14, 0.3, x, SQUARE_TOP + 0.66, z);
  }
  [60, 90, 120].forEach((deg) => {          // three serpent stones painted with sindoor
    const a = (deg * Math.PI) / 180;
    const x = Math.cos(a) * 3.2;
    const z = Math.sin(a) * 3.2;
    const face = Math.PI / 2 - a;
    b.ellip(0x8e8a82, 0.8, 1.3, 0.4, x, TOP2 + 0.65, z, 0, face, 0);
    b.ellip(0x8e8a82, 0.62, 0.5, 0.36, x, TOP2 + 1.4, z, 0, face, 0);
    b.dot(0xff6a00, 0.3, x + Math.cos(a) * 0.2, TOP2 + 1.0, z + Math.sin(a) * 0.2);
    b.dot(MARIGOLD[deg % 4], 0.28, x + Math.cos(a) * 0.5, TOP2 + 0.14, z + Math.sin(a) * 0.5);
  });

  // ---------- The Ganesha shrine ----------
  const sx = SHRINE.x;
  const sz = SHRINE.z;
  const SL = SQUARE_TOP + 0.45;             // top of the shrine's stone floor
  const PH = 4.9;                           // pillar height

  b.box(0xd9c7a1, 6.2, 0.45, 5.0, sx, SQUARE_TOP, sz);          // stone floor
  b.box(0xb8402c, 6.3, 0.12, 5.1, sx, SQUARE_TOP + 0.18, sz);   // red band
  b.box(0xf6e8c8, 5.8, PH, 0.35, sx, SL, sz - 2.15);            // back wall
  [-1, 1].forEach((sd) => {                                      // four pillars
    [sz - 2.1, sz + 2.1].forEach((pz) => {
      b.cyl(0xf0dfc0, 0.4, PH, sx + sd * 2.8, SL, pz);
      b.cyl(0xb8402c, 0.58, 0.28, sx + sd * 2.8, SL, pz);
      b.box(GOLD, 0.72, 0.18, 0.72, sx + sd * 2.8, SL + PH - 0.18, pz);
    });
  });
  b.box(0xb3472b, 6.8, 0.3, 5.6, sx, SL + PH, sz);                // roof slab
  b.pyramid(0xc65a35, 6.2, 1.7, 5.0, sx, SL + PH + 0.3, sz);      // roof
  b.cyl(GOLD, 0.45, 0.35, sx, SL + PH + 1.95, sz);                // golden kalasha on top
  b.ball(GOLD, 0.7, sx, SL + PH + 2.5, sz);
  b.cone(GOLD, 0.2, 0.45, sx, SL + PH + 2.8, sz);

  // The seat for the idol
  const IZ = sz - 0.7;                                           // idol's centre (front-back)
  b.box(0xe9dcc0, 3.0, 1.0, 2.2, sx, SL, IZ);
  b.box(0xb8402c, 3.1, 0.12, 2.3, sx, SL + 0.45, IZ);
  b.box(0xf3ead2, 3.2, 0.15, 2.4, sx, SL + 1.0, IZ);
  const IY = SL + 1.15;                                          // top of the seat
  b.cyl(0xf28aa8, 2.6, 0.2, sx, IY, IZ);                         // lotus seat
  b.cyl(0xffe3ee, 2.0, 0.15, sx, IY + 0.2, IZ);

  // Halo behind the idol
  const y0 = IY + 0.35;                                          // bottom of the idol
  const K = 0.75;                                                // idol size
  b.cylZ(GOLD, 3.1, 0.08, sx, y0 + 2.0 * K + 0.25, sz - 1.95);
  b.cylZ(0x9c2a1c, 2.7, 0.08, sx, y0 + 2.0 * K + 0.25, sz - 1.9);

  // ---- Lord Ganesha, seated ----
  const ORANGE = 0xe2672b;
  const ORANGE_DK = 0xc9531a;
  const X = (v) => sx + v * K;
  const Y = (v) => y0 + v * K;
  const Z = (v) => IZ + v * K;

  b.ball(ORANGE, 1.8 * K, X(0), Y(1.0), Z(0.15), 1.0);                    // belly
  b.ball(ORANGE, 1.5 * K, X(0), Y(1.25), Z(-0.25), 1.0);                  // back
  b.ball(ORANGE, 1.35 * K, X(0), Y(1.7), Z(0), 1.0);                      // chest
  b.cyl(GOLD, 1.95 * K, 0.1 * K, X(0), Y(0.82), Z(0.15));                 // golden belt
  [-1, 1].forEach((sd) => {
    b.ellip(ORANGE_DK, 1.2 * K, 0.55 * K, 1.0 * K, X(sd * 0.65), Y(0.3), Z(0.4));   // crossed legs
    b.ball(0xf1b08a, 0.38 * K, X(sd * 0.35), Y(0.35), Z(0.95));                     // feet
    b.ellip(ORANGE_DK, 0.22 * K, 1.35 * K, 1.1 * K, X(sd * 0.9), Y(2.5), Z(0.0));   // big ears
    b.dot(0x2b1b12, 0.12 * K, X(sd * 0.25), Y(2.62), Z(0.62));                      // eyes
    b.dot(0xfff6e0, 0.16 * K, X(sd * 0.25), Y(2.62), Z(0.58));
  });
  b.ball(ORANGE, 1.2 * K, X(0), Y(2.5), Z(0.1), 1.0);                     // head
  [[0, 2.3, 0.65, 0.5], [0.02, 2.0, 0.8, 0.46], [0.05, 1.7, 0.85, 0.42],  // trunk, curling to one side
   [0.15, 1.45, 0.8, 0.38], [0.3, 1.35, 0.7, 0.34]].forEach(([tx, ty, tz, td]) => {
    b.ball(ORANGE, td * K, X(tx), Y(ty), Z(tz), 1.0);
  });
  b.ellip(0xfff6e0, 0.15 * K, 0.15 * K, 0.5 * K, X(-0.28), Y(2.15), Z(0.6));      // tusk
  b.cone(GOLD, 0.95 * K, 0.7 * K, X(0), Y(2.95), Z(0.1));                         // golden crown
  b.cyl(0xd62828, 1.0 * K, 0.12 * K, X(0), Y(2.95), Z(0.1));
  b.ball(0xd62828, 0.2 * K, X(0), Y(3.65), Z(0.1));
  b.dot(0xffc107, 0.2 * K, X(0), Y(2.88), Z(0.68));                               // golden forehead mark

  // Four arms
  limb(ORANGE, 0.28 * K, X(0.6), Y(1.95), Z(0.05), X(1.15), Y(2.35), Z(0.25));    // upper right: goad
  b.ball(ORANGE, 0.34 * K, X(1.15), Y(2.35), Z(0.25));
  b.cyl(GOLD, 0.07 * K, 0.9 * K, X(1.15), Y(2.0), Z(0.25));
  b.cone(0xe8e8e8, 0.25 * K, 0.3 * K, X(1.15), Y(2.9), Z(0.25));
  limb(ORANGE, 0.28 * K, X(-0.6), Y(1.95), Z(0.05), X(-1.15), Y(2.35), Z(0.25));  // upper left: noose
  b.ball(ORANGE, 0.34 * K, X(-1.15), Y(2.35), Z(0.25));
  b.ball(0xd62828, 0.32 * K, X(-1.15), Y(2.7), Z(0.25));
  limb(ORANGE, 0.28 * K, X(0.65), Y(1.4), Z(0.2), X(1.2), Y(1.55), Z(0.75));      // lower right: blessing
  b.ball(ORANGE, 0.4 * K, X(1.2), Y(1.55), Z(0.75));
  limb(ORANGE, 0.28 * K, X(-0.65), Y(1.4), Z(0.2), X(-0.95), Y(1.25), Z(0.75));   // lower left: sweet modak
  b.ball(ORANGE, 0.36 * K, X(-0.95), Y(1.25), Z(0.75));
  b.ball(0xf4c542, 0.34 * K, X(-0.95), Y(1.5), Z(0.78), 0.9);

  // Marigold garland on his chest
  for (let i = 0; i <= 14; i++) {
    const a = -1.2 + (2.4 * i) / 14;
    b.dot(MARIGOLD[i % 4], 0.3 * K, X(0.8 * Math.sin(a)), Y(1.95 - 0.55 * Math.cos(a)), Z(0.5 + 0.6 * Math.cos(a)));
  }

  // His friend the little mouse
  const mx = sx - 1.9;
  const mz = sz + 0.9;
  b.ellip(0x8d8680, 0.55, 0.42, 0.8, mx, SL + 0.25, mz);
  b.ball(0x8d8680, 0.3, mx, SL + 0.28, mz + 0.45);
  b.dot(0xf2a6b5, 0.1, mx - 0.1, SL + 0.4, mz + 0.5);
  b.dot(0xf2a6b5, 0.1, mx + 0.1, SL + 0.4, mz + 0.5);
  b.dot(0x2b1b12, 0.06, mx, SL + 0.3, mz + 0.6);
  limb(0xf2a6b5, 0.05, mx, SL + 0.2, mz - 0.4, mx - 0.3, SL + 0.08, mz - 0.9);

  // Marigold garland hanging between the front pillars, and a temple bell
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    b.dot(MARIGOLD[i % 4], 0.3, sx - 2.8 + 5.6 * t, SL + PH - 0.2 - 0.7 * Math.sin(Math.PI * t), sz + 2.1);
  }
  b.cyl(0x5a3a22, 0.05, 0.7, sx, SL + PH - 0.7, sz + 2.1);
  b.cone(GOLD, 0.7, 0.55, sx, SL + PH - 1.25, sz + 2.1);
  b.ball(0x8a6a1a, 0.18, sx, SL + PH - 1.28, sz + 2.1);
  for (let i = 0; i <= 12; i++) {                                   // garland on the front of the seat
    b.dot(MARIGOLD[i % 4], 0.3, sx - 1.5 + (3 * i) / 12, SL + 1.1, IZ + 1.25);
  }

  // ---------- Offerings ----------
  // Brass plate with sweet modaks, red hibiscus and durva grass
  b.cyl(0xd4a017, 1.5, 0.06, 0, SL, 10.6);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.ball(0xf4c542, 0.34, Math.cos(a) * 0.4, SL + 0.2, 10.6 + Math.sin(a) * 0.4, 0.9);
    b.dot(0xd62828, 0.22, Math.cos(a) * 0.65, SL + 0.1, 10.6 + Math.sin(a) * 0.65);
  }
  b.ball(0xf4c542, 0.34, 0, SL + 0.38, 10.6, 0.9);
  for (let i = 0; i < 6; i++) {
    b.cylRot(0x3f9a3a, 0.04, 0.5, 0.5 + i * 0.03, SL + 0.3, 10.2 + i * 0.03, 0.2, 0, -0.3 + i * 0.12);
  }

  // Bananas on a banana leaf
  b.ellip(0x3f9a3a, 1.2, 0.05, 0.8, -1.7, SL + 0.03, 10.6);
  for (let i = 0; i < 6; i++) {
    b.cylRot(0xf2d544, 0.17, 0.65, -1.7 + (i - 2.5) * 0.14, SL + 0.38, 10.6, 0, 0, (i - 2.5) * 0.12);
  }
  b.cyl(0x3f7a2a, 0.1, 0.15, -1.7, SL + 0.7, 10.6);

  // Coconuts
  [[-0.95, 10.95], [-0.62, 10.8], [1.15, 10.95]].forEach(([cx, cz]) => {
    b.ball(0x6b4a2b, 0.5, cx, SL + 0.25, cz);
    b.dot(0x4a3320, 0.14, cx, SL + 0.48, cz);
  });

  // Kumkum and turmeric bowls
  [[-0.35, 11.25, 0xc1121f], [0.35, 11.25, 0xf2b705]].forEach(([cx, cz, col]) => {
    b.cyl(GOLD, 0.5, 0.12, cx, SL, cz);
    b.cone(col, 0.38, 0.2, cx, SL + 0.12, cz);
  });

  // Clay lamps in a row, and two tall brass lamps
  for (let i = 0; i < 4; i++) {
    [-1, 1].forEach((sd) => {
      const lx = sd * (0.95 + i * 0.45);
      b.cyl(0xb5522b, 0.38, 0.12, lx, SL, 11.2);
      f.cone(0xffd24a, 0.16, 0.34, lx, SL + 0.12, 11.2);
    });
  }
  [-1, 1].forEach((sd) => {
    const lx = sd * 2.4;
    b.cyl(GOLD, 0.45, 0.08, lx, SL, 11.0);
    b.cyl(GOLD, 0.12, 0.8, lx, SL + 0.08, 11.0);
    b.cyl(GOLD, 0.5, 0.1, lx, SL + 0.88, 11.0);
    f.cone(0xffd24a, 0.2, 0.42, lx, SL + 0.98, 11.0);
  });

  // Incense sticks
  b.cyl(0xc79a2b, 0.3, 0.25, 1.9, SL, 10.3);
  for (let i = 0; i < 5; i++) {
    const tilt = (i - 2) * 0.12;
    b.cylRot(0x5a3a22, 0.03, 0.8, 1.9 + tilt * 0.4, SL + 0.62, 10.3, 0, 0, -tilt);
    b.dot(0xff3b1f, 0.06, 1.9 + tilt * 0.85, SL + 1.02, 10.3);
  }

  // Copper water pot (kalash) with mango leaves and a coconut
  b.ball(0xb87333, 0.75, 2.3, SL + 0.4, 9.95);
  b.cyl(0xb87333, 0.35, 0.2, 2.3, SL + 0.72, 9.95);
  b.cyl(0xb87333, 0.5, 0.06, 2.3, SL + 0.9, 9.95);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.ellip(0x3f9a3a, 0.12, 0.5, 0.2, 2.3 + Math.cos(a) * 0.22, SL + 1.15, 9.95 + Math.sin(a) * 0.22, Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
  }
  b.ball(0x6b4a2b, 0.38, 2.3, SL + 1.2, 9.95);
  b.cyl(0xc62828, 0.4, 0.1, 2.3, SL + 0.95, 9.95);

  // Heap of marigold flowers, and scattered petals
  for (let i = 0; i < 26; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * 0.5;
    b.dot(MARIGOLD[i % 4], 0.26, -2.35 + Math.cos(a) * r, SL + 0.12 + (1 - r / 0.5) * 0.25, 10.8 + Math.sin(a) * r);
  }
  const petals = [0xff9f1c, 0xffc300, 0xf48fb1, 0xffffff, 0xd62828];
  for (let i = 0; i < 40; i++) {
    b.dot(petals[i % 5], 0.2, sx + (rng() - 0.5) * 5.2, SL + 0.05, 9.9 + rng() * 1.6);
  }
  for (let i = 0; i < 40; i++) {                                    // petals on the plaza floor in front
    b.dot(petals[i % 5], 0.18, sx + (rng() - 0.5) * 6, SQUARE_TOP + 0.04, sz + 3.0 + rng() * 1.6);
  }

  // Rangoli (coloured floor art) in front of the shrine
  const RX = sx;
  const RZ = sz + 6.2;
  b.cyl(0xf3e9d0, 5.0, 0.02, RX, SQUARE_TOP, RZ);
  b.cyl(0xc1121f, 4.2, 0.03, RX, SQUARE_TOP, RZ);
  b.cyl(0xffffff, 3.6, 0.04, RX, SQUARE_TOP, RZ);
  b.cyl(0xff8f00, 3.0, 0.05, RX, SQUARE_TOP, RZ);
  b.cyl(0xffd93b, 2.2, 0.06, RX, SQUARE_TOP, RZ);
  b.cyl(0xc1121f, 1.4, 0.07, RX, SQUARE_TOP, RZ);
  b.cyl(0xffffff, 0.6, 0.08, RX, SQUARE_TOP, RZ);

  // ---------- Put it in the world ----------
  const stoneMesh = new THREE.Mesh(b.build(), new THREE.MeshLambertMaterial({ vertexColors: true }));
  stoneMesh.frustumCulled = false;
  scene.add(stoneMesh);

  const flameMesh = new THREE.Mesh(f.build(), new THREE.MeshBasicMaterial({ vertexColors: true }));
  flameMesh.frustumCulled = false;
  scene.add(flameMesh);

  liteMode = wasLite;
})();

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
  shader.uniforms.uGust = gustUniform;
  shader.uniforms.uWindDir = windDirUniform;
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nuniform float uWind;\nuniform float uGust;\nuniform vec2 uWindDir;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
#ifdef USE_INSTANCING
  float sX = length(instanceMatrix[0].xyz);
  float sY = length(instanceMatrix[1].xyz);
  float hgt = position.y * sY;
  float phase = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.29;
  float flutter = 1.0 + uGust * 1.5;   // blades shake more in a gust
  transformed.x += sin(uWind * 1.7 + phase) * 0.035 * flutter * hgt * hgt / sX;
  transformed.z += cos(uWind * 1.3 + phase) * 0.025 * flutter * hgt * hgt / sX;
  ${gustLeanGLSL('0.07')}
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

// How much the trees sway. The breeze (section 6g) raises this number during a gust.
const treeWindStrength = { value: 1 };

// ---------- Three tree shapes (each one is ONE merged shape) ----------
const TRUNK = 0x8a5a3a;

// (b.flex(1) = "the leaves move freely in the wind". The trunk is added first and stays stiff.)
function buildRoundTree() {
  const b = makeBuilder();
  b.cyl(TRUNK, 0.9, 2.8, 0, 0, 0);
  b.flex(1);
  b.ball(0x5fb04f, 5.2, 0, 4.4, 0, 0.9);
  b.ball(0x6cbc58, 3.6, 1.6, 5.2, 0.6, 0.9);
  b.ball(0x56a548, 3.4, -1.5, 4.9, -0.8, 0.9);
  return b.build();
}

function buildTallTree() {
  const b = makeBuilder();
  b.cyl(TRUNK, 0.8, 3.6, 0, 0, 0);
  b.flex(1);
  b.ball(0x4f9e4a, 4.2, 0, 6.4, 0, 1.55);
  b.ball(0x5dae52, 3.0, 0.3, 8.6, 0.2, 1.2);
  return b.build();
}

function buildPineTree() {
  const b = makeBuilder();
  b.cyl(TRUNK, 0.7, 2.2, 0, 0, 0);
  // Each layer of needles moves most at its tip, so the branches seem to wave.
  [[0x3f8f5a, 5.6, 3.0, 1.6], [0x479c60, 4.5, 2.8, 3.6], [0x4fa668, 3.4, 2.6, 5.5], [0x58b06f, 2.0, 1.8, 7.3]]
    .forEach(([color, dia, h, y]) => {
      b.flexUp(y, y + h, 0.9);
      b.cone(color, dia, h, 0, y, 0);
    });
  return b.build();
}

// ---------- The material (colours come from the shapes, the sway comes from the wind clock) ----------
const treeMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });
treeMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uWind = windUniform;
  shader.uniforms.uStrength = treeWindStrength;
  shader.uniforms.uGust = gustUniform;
  shader.uniforms.uWindDir = windDirUniform;
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nattribute float flex;\nuniform float uWind;\nuniform float uStrength;\nuniform float uGust;\nuniform vec2 uWindDir;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
#ifdef USE_INSTANCING
  float sX = length(instanceMatrix[0].xyz);
  float sY = length(instanceMatrix[1].xyz);
  float hgt = position.y * sY;
  float phase = instanceMatrix[3].x * 0.21 + instanceMatrix[3].z * 0.17;
  transformed.x += sin(uWind * 1.1 + phase) * 0.0018 * uStrength * hgt * hgt / sX;
  transformed.z += cos(uWind * 0.9 + phase) * 0.0013 * uStrength * hgt * hgt / sX;
  ${gustLeanGLSL('0.0045')}
  ${flexSwayGLSL('0.25', '0.25', '0.07')}   // branches swing and leaves rustle
#endif`);
};
treeMaterial.customProgramCacheKey = () => 'tree';

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
// ---------- Solid things: houses, fences, bushes, flower beds and trees ----------
// Everything below is measured in the HOUSE's own directions (x = right, z = toward the street).
// The front wall is at z = -0.5, so the garden and the street are on the +z side. Numbers are metres.
const HOUSE_BOXES = {
  cottage:     { x: 4.5, zMin: -8.5, zMax: -0.5 },
  treehouse:   { x: 1.8, zMin: -6.3, zMax: -2.7 },   // just the trunk (the cabin is high up)
  modern:      { x: 5.0, zMin: -8.5, zMax: -0.5 },
  traditional: { x: 4.5, zMin: -8.5, zMax: -0.5 }
};
const HOUSE_BLOCK_HEIGHT = 12;   // flying higher than this lets you pass over the roofs
const PLAYER_RADIUS = 0.6;       // keeps the camera from poking into house walls
const GARDEN_PAD = 0.3;          // keeps the camera from poking into fences, bushes and plants

// Small box: [centre x, centre z, width, depth, height]
// Round thing: [x, z, radius, height]
// You can walk over a thing only by flying higher than its height.
const FENCE_BOXES = [
  [-6.2, 11, 9.6, 0.3, 1.0],    // front fence, left of the gate
  [6.2, 11, 9.6, 0.3, 1.0],     // front fence, right of the gate
  [-11, 2.5, 0.3, 17, 1.0],     // left fence
  [11, 2.5, 0.3, 17, 1.0]       // right fence
];

function gardenWith(roundThings, beds) {
  return { round: roundThings, boxes: FENCE_BOXES.concat(beds) };
}

const GARDEN = {
  cottage: gardenWith(
    [[-4.9, 0.5, 0.95, 1.8], [4.9, 0.5, 0.95, 1.8]],                      // bushes
    [[-5, 6, 3.6, 2.2, 0.8], [5, 6, 3.6, 2.2, 0.8]]                       // flower beds
  ),
  treehouse: gardenWith(
    [[-7, 0, 0.95, 1.8], [7, 0, 0.95, 1.8]],
    [[-5.5, 7, 3.4, 2.2, 0.8], [5.5, 7, 3.4, 2.2, 0.8]]
  ),
  traditional: gardenWith(
    [[-5.5, 0.6, 0.95, 1.8], [5.5, 0.6, 0.95, 1.8]],
    [[-5.5, 5.5, 3.6, 2.2, 0.8], [5.5, 5.5, 3.6, 2.2, 0.8]]
  ),
  modern: {
    round: [[-1.4, 0.9, 0.7, 2.0], [3.0, 0.9, 0.7, 2.0], [6.5, 5, 0.3, 2.2]],   // planters and the small tree
    boxes: [                                                                    // the hedges
      [-5.7, 10.6, 10.6, 1.1, 1.0],
      [6.5, 10.6, 9.0, 1.1, 1.0],
      [-10.6, 2.3, 1.1, 16.6, 1.0],
      [10.6, 2.3, 1.1, 16.6, 1.0]
    ]
  }
};

// Trees: the trunk is solid (you can walk under the leaves). Each 6 m square holds one tree at most.
const TREE_AT = new Map();
const TRUNK_RADIUS = { round: 0.45, tall: 0.4, pine: 0.35 };
const TREE_TRUNK_HEIGHT = 3;
Object.keys(treeLists).forEach((type) => {
  treeLists[type].forEach((t) => {
    TREE_AT.set(`${Math.floor(t.x / 6)},${Math.floor(t.z / 6)}`, {
      x: t.x,
      z: t.z,
      r: TRUNK_RADIUS[type] * t.size
    });
  });
});

// Is the point (x, z) inside something solid? "altitude" is how high you are above the ground.
function blockedBySolid(x, z, altitude) {
  // Tree trunks
  if (altitude < TREE_TRUNK_HEIGHT) {
    const cx = Math.floor(x / 6);
    const cz = Math.floor(z / 6);
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const t = TREE_AT.get(`${cx + i},${cz + j}`);
        if (t && Math.hypot(x - t.x, z - t.z) < t.r + GARDEN_PAD) return true;
      }
    }
  }

  // The tree platform and the shrine in the middle of the town square
  if (Math.abs(x) < 20 && Math.abs(z) < 20) {
    if (altitude < 1.6 && Math.hypot(x, z) < PLATFORM_R1 + GARDEN_PAD) return true;
    if (altitude < 6.5 &&
        Math.abs(x - SHRINE.x) < 3.4 + GARDEN_PAD &&
        Math.abs(z - SHRINE.z) < 2.8 + GARDEN_PAD) return true;
  }

  // Only the house in that plot is checked.
  const plot = PLOT_AT[`${Math.floor(x / PLOT_PITCH)},${Math.floor(z / PLOT_PITCH)}`];
  if (!plot || !plot.house) return false;

  const dx = x - plot.x;
  const dz = z - plot.z;
  const c = Math.cos(plot.facing);
  const s = Math.sin(plot.facing);
  const lx = c * dx - s * dz;    // world position -> house's own directions
  const lz = s * dx + c * dz;

  // The house itself
  if (altitude < HOUSE_BLOCK_HEIGHT) {
    const box = HOUSE_BOXES[plot.house];
    if (Math.abs(lx) < box.x + PLAYER_RADIUS &&
        lz > box.zMin - PLAYER_RADIUS &&
        lz < box.zMax + PLAYER_RADIUS) return true;
  }

  // Fences, bushes, flower beds, hedges, planters
  const garden = GARDEN[plot.house];
  if (garden) {
    for (const [gx, gz, r, h] of garden.round) {
      if (altitude < h && Math.hypot(lx - gx, lz - gz) < r + GARDEN_PAD) return true;
    }
    for (const [gx, gz, w, d, h] of garden.boxes) {
      if (altitude < h &&
          Math.abs(lx - gx) < w / 2 + GARDEN_PAD &&
          Math.abs(lz - gz) < d / 2 + GARDEN_PAD) return true;
    }
  }
  return false;
}

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

  const oldX = player.x;
  const oldZ = player.z;
  player.x += vel.x * dt;
  player.z += vel.z * dt;

  // Houses, fences, bushes, plants and trees are solid: walking into them stops you
  // (flying high above them is fine). We try each direction on its own, so you slide along
  // instead of sticking. If you already stand inside something, you may walk out of it.
  if (!inside) {
    const altitude = player.y - EYE_HEIGHT;
    if (blockedBySolid(player.x, oldZ, altitude) && !blockedBySolid(oldX, oldZ, altitude)) {
      player.x = oldX;
      vel.x = 0;
    }
    if (blockedBySolid(player.x, player.z, altitude) && !blockedBySolid(player.x, oldZ, altitude)) {
      player.z = oldZ;
      vel.z = 0;
    }
  }

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
  startWindSound();   // browsers only allow sound after a click, so the wind starts here
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
    if (doorPlot && canEnterPlot(doorPlot)) {
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

// Can this person walk into this house? Free houses are open to all.
// Bought houses are only for the owner and the members the owner said yes to.
function canEnterPlot(plot) {
  if (!plot.ownerId) return true;
  const uid = currentUser && currentUser.uid;
  if (!uid) return false;
  return plot.ownerId === uid || (plot.memberIds || []).includes(uid);
}

function enterHouse(plot) {
  if (!canEnterPlot(plot)) return;
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
  if (agreementOpen) return;   // the house paper is open
  if (doorAction === 'enter' && doorPlot) enterHouse(doorPlot);
  else if (doorAction === 'exit' && inside) exitHouse();
}

doorBtn.addEventListener('click', () => {
  if (started) useDoor();
});

// =====================================================
// 8c. FIREBASE (sign in, game money, buying, permission to enter)
// =====================================================
// Loaded on its own, so if Firebase is not set up yet the game still works.
const authBtn = document.getElementById('authBtn');
const authName = document.getElementById('authName');
const coinText = document.getElementById('coinText');
const houseBtn = document.getElementById('houseBtn');
const claimBtn = document.getElementById('claimBtn');
const agreement = document.getElementById('agreement');
const paperBody = document.getElementById('paperBody');
const paperMsg = document.getElementById('paperMsg');
const paperYes = document.getElementById('paperYes');
const paperNo = document.getElementById('paperNo');
const housePanel = document.getElementById('housePanel');
const housePanelBody = document.getElementById('housePanelBody');
const housePanelMsg = document.getElementById('housePanelMsg');
const houseClose = document.getElementById('houseClose');

let fb = null;                 // the Firebase helpers, once loaded
let currentUser = null;        // the signed-in person, or null
let coins = null;              // the player's game coins (null = not known yet)
let stopWatchers = [];         // functions that stop listening when signing out
let agreementOpen = false;     // true while any paper or panel is open
let pendingPlot = null;        // the house being bought in the open paper
let requestsToMe = [];         // people asking to enter MY house
let myRequestPlots = new Set(); // houses I asked to enter

function myPlot() {
  return currentUser ? PLOTS.find((p) => p.ownerId === currentUser.uid) || null : null;
}

function updateCoinText() {
  coinText.classList.toggle('hidden', !currentUser);
  coinText.textContent = typeof coins === 'number' ? `Coins: ${coins}` : 'Coins: ...';
}

// Shows the "My House" button for house owners, with the number of waiting requests.
function updateHouseBtn() {
  const mine = myPlot();
  houseBtn.classList.toggle('hidden', !mine);
  if (mine) {
    const n = requestsToMe.filter((r) => r.plotId === mine.id).length;
    houseBtn.textContent = n ? `My House (${n})` : 'My House';
  }
  if (!housePanel.classList.contains('hidden')) renderHousePanel();
}

import('./firebase.js').then((mod) => {
  fb = mod;
  authBtn.classList.remove('hidden');

  fb.onUserChange(async (user) => {
    currentUser = user;
    coins = null;
    requestsToMe = [];
    myRequestPlots = new Set();
    stopWatchers.forEach((stop) => stop());
    stopWatchers = [];

    authBtn.textContent = user ? 'Sign out' : 'Sign in with Google';
    authName.textContent = user ? user.displayName || 'Player' : '';
    authName.classList.toggle('hidden', !user);
    updateCoinText();
    updateHouseBtn();

    if (user) {
      try { await fb.ensureWallet(user); } catch (err) { console.warn('Wallet error:', err); }
      stopWatchers.push(fb.watchWallet(user.uid, (data) => {
        coins = data.coins;
        updateCoinText();
      }));
      stopWatchers.push(fb.watchRequestsToMe(user.uid, (list) => {
        requestsToMe = list;
        updateHouseBtn();
      }));
      stopWatchers.push(fb.watchMyRequests(user.uid, (plotIds) => {
        myRequestPlots = new Set(plotIds);
      }));
    }
  });

  // Every time owners change in Firebase, copy them into the PLOTS list.
  fb.watchPlots((owners) => {
    PLOTS.forEach((plot) => {
      const o = owners[plot.id];
      plot.ownerId = o ? o.ownerId : null;
      plot.ownerName = o ? o.ownerName : null;
      plot.price = o ? o.price : null;
      plot.boughtAt = o ? o.boughtAt : null;
      plot.memberIds = o ? o.memberIds : [];
      plot.members = o ? o.members : {};
    });
    updateHouseBtn();
  });
}).catch((err) => console.warn('Firebase is not ready yet:', err));

authBtn.addEventListener('click', () => {
  if (!fb) return;
  if (currentUser) fb.signOutUser();
  else fb.signIn().catch((err) => console.warn('Sign in failed:', err));
});

// ---------- Opening and closing papers ----------
function freezePlayer() {
  agreementOpen = true;
  keys.clear();
  vel.x = 0;
  vel.z = 0;
}

function closeAgreement() {
  agreementOpen = false;
  pendingPlot = null;
  agreement.classList.add('hidden');
  housePanel.classList.add('hidden');
}

window.addEventListener('keydown', (e) => {
  if (agreementOpen && e.code === 'Escape') closeAgreement();
});

// ---------- The house agreement paper ----------
function paperRow(label, value) {
  const row = document.createElement('div');
  row.className = 'paperRow';
  const a = document.createElement('span');
  a.textContent = label;
  const b = document.createElement('b');
  b.textContent = value;
  row.append(a, b);
  paperBody.appendChild(row);
}

function openAgreement(plot, mode) {   // mode: 'buy' or 'view'
  freezePlayer();

  const style = plot.house.charAt(0).toUpperCase() + plot.house.slice(1);
  const buying = mode === 'buy';
  const price = buying ? fb.PRICES[plot.house] : plot.price;
  const date = (!buying && plot.boughtAt ? new Date(plot.boughtAt) : new Date()).toLocaleDateString();

  paperBody.textContent = '';
  paperRow('House number', plot.id.replace('plot_', ''));
  paperRow('House style', style);
  paperRow('Price', price != null ? `${price} coins` : '-');
  paperRow(buying ? 'Buyer' : 'Owner', buying ? (currentUser.displayName || 'Player') : (plot.ownerName || 'A player'));
  paperRow('Date', date);
  if (buying) {
    paperRow('Your coins now', typeof coins === 'number' ? String(coins) : '...');
    paperRow('Coins after buying', typeof coins === 'number' ? String(coins - price) : '...');
  }

  pendingPlot = buying ? plot : null;
  paperMsg.style.color = '#b3261e';
  paperMsg.textContent = '';
  paperYes.classList.toggle('hidden', !buying);
  paperYes.disabled = false;
  paperNo.textContent = buying ? 'Cancel' : 'Close';

  if (buying && (typeof coins !== 'number' || coins < price)) {
    paperYes.disabled = true;
    paperMsg.textContent = 'You do not have enough coins for this house.';
  }
  agreement.classList.remove('hidden');
}

paperNo.addEventListener('click', closeAgreement);

paperYes.addEventListener('click', async () => {
  if (!fb || !pendingPlot) return;
  paperYes.disabled = true;
  paperMsg.style.color = '#4a2f1b';
  paperMsg.textContent = 'Signing the paper...';
  try {
    await fb.buyPlot(pendingPlot.id, pendingPlot.house);
    closeAgreement();
    hudHint.textContent = 'Congratulations! This house is now yours. Only you can enter it.';
  } catch (err) {
    console.warn('Could not buy:', err);
    const messages = {
      'taken': 'Sorry, someone just bought this house.',
      'has-house': 'You already own a house.',
      'no-money': 'You do not have enough coins for this house.',
      'no-wallet': 'Your wallet is not ready yet. Try again in a moment.'
    };
    paperMsg.style.color = '#b3261e';
    paperMsg.textContent = messages[err.message] || 'Could not complete the purchase. Please try again.';
    paperYes.disabled = (err.message === 'taken' || err.message === 'has-house' || err.message === 'no-money');
  }
});

// ---------- My House panel (requests and members) ----------
function houseHeading(text) {
  const h = document.createElement('h3');
  h.textContent = text;
  housePanelBody.appendChild(h);
}

function houseNote(text) {
  const p = document.createElement('p');
  p.className = 'houseNote';
  p.textContent = text;
  housePanelBody.appendChild(p);
}

function houseButton(label, className, onClick) {
  const b = document.createElement('button');
  b.textContent = label;
  if (className) b.className = className;
  b.addEventListener('click', onClick);
  return b;
}

function showHouseError(err) {
  console.warn(err);
  housePanelMsg.textContent = 'Something went wrong. Please try again.';
}

function renderHousePanel() {
  housePanelBody.textContent = '';
  const mine = myPlot();
  if (!mine) {
    houseNote('You do not own a house yet.');
    return;
  }
  const memberIds = mine.memberIds || [];
  const members = mine.members || {};

  houseHeading('People asking to enter');
  const waiting = requestsToMe.filter((r) => r.plotId === mine.id);
  if (!waiting.length) houseNote('No requests right now.');
  waiting.forEach((req) => {
    const row = document.createElement('div');
    row.className = 'houseRow';
    const who = document.createElement('span');
    who.className = 'grow';
    who.textContent = req.fromName;

    const role = document.createElement('select');
    fb.ROLES.forEach((r) => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      role.appendChild(opt);
    });

    const yes = houseButton('Allow', '', () => {
      housePanelMsg.textContent = '';
      fb.approveRequest(req, role.value).catch(showHouseError);
    });
    yes.disabled = memberIds.length >= fb.MAX_MEMBERS;
    const no = houseButton('Say no', 'no', () => {
      housePanelMsg.textContent = '';
      fb.denyRequest(req).catch(showHouseError);
    });
    row.append(who, role, yes, no);
    housePanelBody.appendChild(row);
  });
  if (memberIds.length >= fb.MAX_MEMBERS) houseNote(`Your house is full (${fb.MAX_MEMBERS} members).`);

  houseHeading('Who stays in my house');
  if (!memberIds.length) houseNote('Nobody yet. Only you can enter.');
  memberIds.forEach((id) => {
    const m = members[id] || {};
    const row = document.createElement('div');
    row.className = 'houseRow';
    const who = document.createElement('span');
    who.className = 'grow';
    who.textContent = `${m.name || 'Member'} (${m.role || 'Friend'})`;
    const remove = houseButton('Remove', 'no', () => {
      housePanelMsg.textContent = '';
      fb.removeMember(mine.id, id).catch(showHouseError);
    });
    row.append(who, remove);
    housePanelBody.appendChild(row);
  });
}

houseBtn.addEventListener('click', () => {
  if (!fb) return;
  freezePlayer();
  housePanelMsg.textContent = '';
  renderHousePanel();
  housePanel.classList.remove('hidden');
});
houseClose.addEventListener('click', closeAgreement);

// ---------- The button at a house door ----------
let claimMode = null;        // 'buy', 'view', 'ask', 'signin' or null (just a text label)
let claimPlotTarget = null;
let lastClaimText = '';

claimBtn.addEventListener('click', () => {
  if (!fb || !claimPlotTarget || !claimMode) return;
  if (claimMode === 'signin') {
    fb.signIn().catch((err) => console.warn('Sign in failed:', err));
  } else if (claimMode === 'ask') {
    const plot = claimPlotTarget;
    fb.askToEnter(plot).then(() => {
      hudHint.textContent = `Your request was sent to ${plot.ownerName || 'the owner'}. Wait for a yes.`;
    }).catch((err) => {
      console.warn('Could not ask:', err);
      hudHint.textContent = 'Could not send the request. Please try again.';
    });
  } else {
    openAgreement(claimPlotTarget, claimMode);
  }
});

// Runs every frame: shows the right button (or label) at a house door.
function updateClaimPrompt() {
  claimMode = null;
  claimPlotTarget = null;
  let text = '';

  if (fb && !inside && doorPlot && !agreementOpen) {
    const plot = doorPlot;
    const uid = currentUser && currentUser.uid;
    claimPlotTarget = plot;

    if (!plot.ownerId) {
      // For sale
      const price = fb.PRICES[plot.house];
      if (!uid) {
        text = `For sale: ${price} coins. Sign in to buy`;
        claimMode = 'signin';
      } else if (myPlot()) {
        text = `For sale: ${price} coins`;
      } else {
        text = `Buy this house: ${price} coins`;
        claimMode = 'buy';
      }
    } else if (plot.ownerId === uid) {
      text = 'View my house agreement';
      claimMode = 'view';
    } else if (uid && (plot.memberIds || []).includes(uid)) {
      const m = (plot.members || {})[uid] || {};
      text = `${plot.ownerName || 'A player'}'s house (you are: ${m.role || 'Friend'})`;
    } else if (!uid) {
      text = `Owned by ${plot.ownerName || 'a player'}. Sign in to ask permission`;
      claimMode = 'signin';
    } else if (myRequestPlots.has(plot.id)) {
      text = `Request sent. Waiting for ${plot.ownerName || 'the owner'}`;
    } else {
      text = `Owned by ${plot.ownerName || 'a player'}. Ask permission to enter`;
      claimMode = 'ask';
    }
  }

  claimBtn.classList.toggle('hidden', text === '');
  claimBtn.disabled = claimMode === null;
  claimBtn.style.opacity = claimMode === null ? '0.85' : '1';
  if (text !== lastClaimText && text !== '') claimBtn.textContent = text;
  lastClaimText = text;
}

// =====================================================
// 6g. THE BREEZE (an occasional gust of wind, like a real day outdoors)
// =====================================================
// The air is almost still most of the time. Every so often a gust arrives:
// it builds up, peaks and fades away. While it blows:
//   - trees and reeds lean along the wind and sway harder (a wave rolls across the land)
//   - the clouds drift a little faster
//   - a few leaves fly past you
//   - a soft wind sound swells and fades (quieter when you are inside a house)

// ---------- Settings (change these numbers to change the weather) ----------
const BREEZE_FIRST_GUST = 6;     // seconds after the page loads until the first gust
const BREEZE_CALM_MIN = 15;      // seconds of calm between gusts (random between min and max)
const BREEZE_CALM_MAX = 45;
const BREEZE_LENGTH_MIN = 5;     // how long one gust lasts, in seconds
const BREEZE_LENGTH_MAX = 12;
const BREEZE_STILL_AIR = 0.05;   // the faint steady breath of wind between gusts

const breeze = {
  calmLeft: BREEZE_FIRST_GUST,   // seconds until the next gust starts
  blowing: false,                // true while a gust is happening
  gustTime: 0,                   // how long this gust has been blowing
  gustLength: 0,                 // how long this gust will last
  gustPeak: 0,                   // how strong this gust gets (0 to 1)
  level: 0,                      // smooth strength of the gust right now (0 to 1)
  clock: 0                       // wind clock, runs faster in a gust
};

const randomBetween = (a, b) => a + Math.random() * (b - a);

function updateBreeze(dt) {
  let target = 0;

  if (breeze.blowing) {
    breeze.gustTime += dt;
    const t = breeze.gustTime / breeze.gustLength;
    if (t >= 1) {
      breeze.blowing = false;
      breeze.calmLeft = randomBetween(BREEZE_CALM_MIN, BREEZE_CALM_MAX);
    } else {
      const bell = Math.sin(Math.PI * t);   // 0 -> 1 -> 0 over the gust
      target = breeze.gustPeak * bell * bell;
    }
  } else {
    breeze.calmLeft -= dt;
    if (breeze.calmLeft <= 0) {
      breeze.blowing = true;
      breeze.gustTime = 0;
      breeze.gustLength = randomBetween(BREEZE_LENGTH_MIN, BREEZE_LENGTH_MAX);
      breeze.gustPeak = randomBetween(0.45, 1);   // some gusts are gentle, some are strong
    }
  }

  // Ease towards the target so nothing ever jumps.
  breeze.level += (target - breeze.level) * Math.min(1, dt * 3);

  // A gust is not perfectly steady: it flutters a little.
  const flutter = 0.88 + 0.12 * Math.sin(breeze.clock * 2.3) * Math.sin(breeze.clock * 0.9 + 1);
  const gust = Math.min(1, BREEZE_STILL_AIR + breeze.level * flutter);

  gustUniform.value = gust;
  treeWindStrength.value = 1 + 4 * gust;          // trees sway up to 5x more
  breeze.clock += dt * (1 + 1.2 * gust);          // everything sways a bit faster too
  windUniform.value = breeze.clock;
}

// ---------- Leaves blowing past (only visible during a gust) ----------
const LEAF_COUNT = 70;
const LEAF_RADIUS = 28;   // leaves live in a circle this big around you
const leafColors = [0x6cbc58, 0x8fc65a, 0xc9b94a, 0xd28a3c, 0x5fb04f];

const leafMesh = new THREE.InstancedMesh(
  new THREE.PlaneGeometry(0.22, 0.14),
  new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
  LEAF_COUNT
);
leafMesh.frustumCulled = false;
leafMesh.visible = false;
scene.add(leafMesh);

const leaves = [];
const leafColor = new THREE.Color();
for (let i = 0; i < LEAF_COUNT; i++) {
  leaves.push({
    x: player.x + randomBetween(-LEAF_RADIUS, LEAF_RADIUS),
    y: 0.5 + Math.random() * 6,
    z: player.z + randomBetween(-LEAF_RADIUS, LEAF_RADIUS),
    speed: randomBetween(0.6, 1.1),     // some leaves are faster than others
    wobble: randomBetween(1.5, 3.5),    // how fast it flutters
    phase: Math.random() * Math.PI * 2,
    spin: randomBetween(2, 6)
  });
  leafColor.set(leafColors[i % leafColors.length]);
  leafMesh.setColorAt(i, leafColor);
}
if (leafMesh.instanceColor) leafMesh.instanceColor.needsUpdate = true;

// Put a leaf back at the upwind edge of the circle, at a random height.
function respawnLeaf(leaf, anywhere) {
  const wx = windDirUniform.value.x;
  const wz = windDirUniform.value.y;
  const side = randomBetween(-LEAF_RADIUS, LEAF_RADIUS);   // sideways position
  const back = anywhere ? randomBetween(-LEAF_RADIUS, LEAF_RADIUS) : -LEAF_RADIUS; // upwind position
  leaf.x = player.x + wx * back - wz * side;
  leaf.z = player.z + wz * back + wx * side;
  leaf.y = Math.max(0.4, player.y - 1.5) + Math.random() * 6;
}

function updateLeaves(dt) {
  const strength = gustUniform.value;
  const show = !inside && strength > 0.15;
  leafMesh.visible = show;
  if (!show) return;

  const wx = windDirUniform.value.x;
  const wz = windDirUniform.value.y;
  const size = Math.min(1, (strength - 0.15) * 3);   // leaves fade in with scale as the gust builds
  const t = breeze.clock;

  for (let i = 0; i < LEAF_COUNT; i++) {
    const leaf = leaves[i];
    const flow = leaf.speed * (2 + 10 * strength);   // metres per second along the wind
    const flap = Math.sin(t * leaf.wobble + leaf.phase);
    leaf.x += (wx * flow - wz * flap * 0.8) * dt;
    leaf.z += (wz * flow + wx * flap * 0.8) * dt;
    leaf.y += (flap * 0.9 - 0.3) * dt;               // bobs up and down, drifts slowly down

    // Too far from you, or on the ground? Send it back upwind.
    const dx = leaf.x - player.x;
    const dz = leaf.z - player.z;
    const ahead = dx * wx + dz * wz;
    if (ahead > LEAF_RADIUS || Math.abs(dx) > LEAF_RADIUS * 1.6 || Math.abs(dz) > LEAF_RADIUS * 1.6 || leaf.y < 0.15) {
      respawnLeaf(leaf, false);
    }

    dummy.position.set(leaf.x, leaf.y, leaf.z);
    dummy.rotation.set(t * leaf.spin, t * leaf.spin * 0.7 + leaf.phase, t * leaf.spin * 0.4);
    dummy.scale.setScalar(size);
    dummy.updateMatrix();
    leafMesh.setMatrixAt(i, dummy.matrix);
  }
  leafMesh.instanceMatrix.needsUpdate = true;
}

// ---------- The sound of the wind (soft noise that swells with the gust) ----------
// Browsers only allow sound after a tap or click, so this starts from the "Enter the World" button.
let windAudio = null;

function startWindSound() {
  if (windAudio) {
    if (windAudio.ctx.state === 'suspended') windAudio.ctx.resume();
    return;
  }
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();

    // 3 seconds of soft "brown" noise that loops without a click (the end fades into the start).
    const length = ctx.sampleRate * 3;
    const fade = Math.floor(ctx.sampleRate * 0.2);
    const raw = new Float32Array(length + fade);
    let last = 0;
    for (let i = 0; i < raw.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      raw[i] = last * 3.5;
    }
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = raw[i];
    for (let i = 0; i < fade; i++) {
      const a = i / fade;
      data[i] = raw[i] * Math.sqrt(a) + raw[length + i] * Math.sqrt(1 - a);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();   // a darker sound when calm, brighter in a strong gust
    filter.type = 'lowpass';
    filter.frequency.value = 250;
    filter.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    windAudio = { ctx, filter, gain };
  } catch (err) {
    windAudio = null;   // no sound is fine, the breeze still looks right
  }
}

function updateWindSound() {
  if (!windAudio) return;
  const strength = gustUniform.value;
  const muffle = inside ? 0.25 : 1;   // walls make the wind quieter
  const now = windAudio.ctx.currentTime;
  windAudio.gain.gain.setTargetAtTime(strength * 0.18 * muffle, now, 0.2);
  windAudio.filter.frequency.setTargetAtTime(250 + strength * 750 * muffle, now, 0.2);
}

// =====================================================
// 9. THE GAME LOOP (runs about 60 times per second)
// =====================================================
let lastTime = performance.now();
let lodTimer = 0;

function animate(now) {
  requestAnimationFrame(animate);

  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  if (started && !agreementOpen) {
    updatePlayer(dt);
    updateAltitudeDisplay();
    updateDoorPrompt();
    updateClaimPrompt();

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

  // The breeze: gusts come and go, and move the trees, reeds, leaves and the wind sound.
  updateBreeze(dt);
  updateLeaves(dt);
  updateWindSound();

  // Clouds drift slowly to the right (a little faster in a gust), then wrap around.
  const cloudSpeed = 3 + gustUniform.value * 5;
  clouds.children.forEach((cloud) => {
    cloud.position.x += dt * cloudSpeed;
    if (cloud.position.x > 800) cloud.position.x = -800;
  });

  // The river flows (the ripples slide along the water).
  waterTexture.offset.y -= dt * 0.05;

  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

// Everything is built: show the right houses, hide the loading screen and show the main menu.
updateHouseLOD();
loadingScreen.classList.add('hidden');
menuScreen.classList.remove('hidden');
