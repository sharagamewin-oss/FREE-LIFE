import * as THREE from 'three';

// =====================================================
// 1. BASIC SETUP: renderer, scene, camera
// =====================================================
const canvas = document.getElementById('game');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // keeps phones fast
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

// The fog colour matches the sky at the horizon, so the far edge of the land melts away.
const HORIZON_COLOR = 0xffcfa0;
scene.fog = new THREE.Fog(HORIZON_COLOR, 120, 900);

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

// Gradient dome: warm orange at the horizon, soft pink in the middle, light blue on top.
const skyGeo = new THREE.SphereGeometry(SKY_RADIUS, 48, 24);
const skyPos = skyGeo.attributes.position;
const skyColors = [];
const cHorizon = new THREE.Color(0xffcfa0);
const cMiddle = new THREE.Color(0xffb0a8);
const cTop = new THREE.Color(0x86b9e8);
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

// The rising sun: a bright core and a soft glow around it.
const sunDirection = new THREE.Vector3(0.25, 0.12, -1).normalize();
const sunPosition = sunDirection.clone().multiplyScalar(1200);

const sunCore = new THREE.Mesh(
  new THREE.SphereGeometry(55, 24, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff3c4, fog: false })
);
sunCore.position.copy(sunPosition);
skyGroup.add(sunCore);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(115, 24, 16),
  new THREE.MeshBasicMaterial({
    color: 0xffc27a,
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
  color: 0xfff0ea,
  emissive: 0xffc9b0,
  emissiveIntensity: 0.35
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
// Sky light from above (warm pink) and bounce light from the grass below (green).
const hemiLight = new THREE.HemisphereLight(0xffe0cc, 0x9bd36b, 2.6);
scene.add(hemiLight);

// The low sunrise sun, shining from the sun's direction.
const sunLight = new THREE.DirectionalLight(0xffb870, 2.0);
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

// =====================================================
// 5. RIVER (a curvy ribbon on the right side of the town square)
// =====================================================
const RIVER_WIDTH = 24;

// Where the middle of the river is, for any z position. Phase 3+ will reuse this.
function riverX(z) {
  return 140 + 35 * Math.sin(z * 0.008);
}

function makeRibbon(width, y, color, emissive) {
  const vertices = [];
  const normals = [];
  const indices = [];
  const step = 20;
  let rows = 0;

  for (let z = -1500; z <= 1500; z += step) {
    const cx = riverX(z);
    vertices.push(cx - width / 2, y, z, cx + width / 2, y, z);
    normals.push(0, 1, 0, 0, 1, 0);
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
  geo.setIndex(indices);

  const material = new THREE.MeshLambertMaterial({
    color,
    emissive,
    side: THREE.DoubleSide,
    polygonOffset: true,       // stops flickering where it touches the ground
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  return new THREE.Mesh(geo, material);
}

// Sandy bank (wider, underneath) and the water on top.
scene.add(makeRibbon(RIVER_WIDTH + 8, 0.05, 0xf0dca6, 0x000000));
scene.add(makeRibbon(RIVER_WIDTH, 0.12, 0x62c3e6, 0x14405a));

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
// 7. PLAYER + CONTROLS (keyboard, mouse, touch)
// =====================================================
const EYE_HEIGHT = 1.7;
const player = { x: 0, z: 45, yaw: 0, pitch: 0.1 };

let started = false;     // becomes true when you press "Enter the World"
const keys = new Set();  // which keyboard keys are held down

window.addEventListener('keydown', (e) => keys.add(e.code));
window.addEventListener('keyup', (e) => keys.delete(e.code));
window.addEventListener('blur', () => keys.clear());

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

  let speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 12 : 6;

  // Wading through the river slows you down.
  if (Math.abs(player.x - riverX(player.z)) < RIVER_WIDTH / 2) speed *= 0.5;

  const sin = Math.sin(player.yaw);
  const cos = Math.cos(player.yaw);
  player.x += (-sin * forward + cos * strafe) * speed * dt;
  player.z += (-cos * forward - sin * strafe) * speed * dt;

  // Keep the player inside the world.
  const distance = Math.hypot(player.x, player.z);
  if (distance > 1400) {
    player.x *= 1400 / distance;
    player.z *= 1400 / distance;
  }
}

// =====================================================
// 8. MENU BUTTONS AND SCREENS
// =====================================================
const loadingScreen = document.getElementById('loading');
const menuScreen = document.getElementById('menu');
const hud = document.getElementById('hud');
const hudHint = document.getElementById('hudHint');
const startBtn = document.getElementById('startBtn');
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

startBtn.addEventListener('click', () => {
  started = true;
  menuScreen.classList.add('hidden');
  hud.classList.remove('hidden');

  if (isTouchDevice) {
    joystick.classList.remove('hidden');
    hudHint.textContent = 'Left circle: walk. Drag to look.';
  } else {
    hudHint.textContent = 'WASD or arrows: walk. Shift: run. Drag mouse: look.';
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// =====================================================
// 9. THE GAME LOOP (runs about 60 times per second)
// =====================================================
let lastTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);

  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  if (started) updatePlayer(dt);

  // Put the camera where the player is.
  camera.position.set(player.x, EYE_HEIGHT, player.z);
  camera.rotation.set(player.pitch, player.yaw, 0);

  // The sky follows the camera so it never gets closer.
  skyGroup.position.copy(camera.position);

  // Clouds drift slowly to the right, then wrap around.
  clouds.children.forEach((cloud) => {
    cloud.position.x += dt * 3;
    if (cloud.position.x > 800) cloud.position.x = -800;
  });

  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

// Everything is built: hide the loading screen and show the main menu.
loadingScreen.classList.add('hidden');
menuScreen.classList.remove('hidden');
