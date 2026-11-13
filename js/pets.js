// =====================================================
// ADOPTABLE PETS: dogs, cats, bunnies and ducklings walk the streets.
// Stand next to one, tap "Adopt", name it, and it follows you everywhere.
// =====================================================
import * as THREE from 'three';

const PET_COUNT = 36;
const NAMES = ['Biscuit', 'Mochi', 'Luna', 'Coco', 'Buddy', 'Pepper', 'Nala', 'Peanut', 'Daisy', 'Ziggy', 'Honey', 'Maple'];

const PALETTES = {
  dog: [
    { fur: 0xc68642, light: 0xe8c39e, ear: 0x8b5a2b },
    { fur: 0xf2e2c4, light: 0xffffff, ear: 0xc9a36b },
    { fur: 0x4a3b32, light: 0x8a6f5a, ear: 0x2e241e },
    { fur: 0xd9a441, light: 0xf4dca0, ear: 0xa8741f }
  ],
  cat: [
    { fur: 0xf0902a, light: 0xffd9a8, ear: 0xd9741a },
    { fur: 0x9aa0a6, light: 0xd9dde0, ear: 0x7d8388 },
    { fur: 0x2e2e33, light: 0x55555c, ear: 0x1f1f23 },
    { fur: 0xf4efe6, light: 0xffffff, ear: 0xf2b8c0 }
  ],
  bunny: [
    { fur: 0xf7f2ea, light: 0xffffff, ear: 0xf2b8c0 },
    { fur: 0xb9a48a, light: 0xe6d9c6, ear: 0xd9a0a0 },
    { fur: 0xe8c9b0, light: 0xfff0e0, ear: 0xe8a0a0 }
  ],
  duckling: [
    { fur: 0xffdf4a, light: 0xffee8a, ear: 0xff9f1c }
  ]
};

// ---------- The pet shapes ----------
// Each pet is 3 parts: the body (with head, ears, tail) and two sets of legs that swing
// the opposite way, so the pet looks like it is really walking. The pet faces +z.
function fourLegs(la, lb, color, w, H, lx, lz) {
  la.box(color, w, H, w, -lx, 0, lz);
  la.box(color, w, H, w, lx, 0, -lz);
  lb.box(color, w, H, w, lx, 0, lz);
  lb.box(color, w, H, w, -lx, 0, -lz);
}

function buildPetModel(type, c, makeBuilder) {
  const b = makeBuilder();
  const la = makeBuilder();
  const lb = makeBuilder();
  let H = 0.36;
  let tagY = 1.5;

  if (type === 'dog') {
    H = 0.36;
    b.box(c.fur, 0.5, 0.42, 0.95, 0, H, 0);                       // body
    b.ball(c.fur, 0.46, 0, H + 0.62, 0.58);                       // head
    b.box(c.light, 0.22, 0.17, 0.26, 0, H + 0.34, 0.8);           // snout
    b.ball(0x222222, 0.1, 0, H + 0.5, 0.94);                      // nose
    [-1, 1].forEach((s) => {
      b.box(c.ear, 0.12, 0.26, 0.1, s * 0.21, H + 0.6, 0.5);      // floppy ears
      b.dot(0x222222, 0.07, s * 0.1, H + 0.7, 0.78);              // eyes
    });
    b.cylRot(c.fur, 0.09, 0.42, 0, H + 0.5, -0.58, -0.9, 0, 0);   // tail
    fourLegs(la, lb, c.fur, 0.14, H, 0.17, 0.34);
    tagY = 1.55;
  } else if (type === 'cat') {
    H = 0.26;
    b.box(c.fur, 0.32, 0.3, 0.62, 0, H, 0);
    b.ball(c.fur, 0.34, 0, H + 0.45, 0.4);
    b.ball(c.light, 0.14, 0, H + 0.38, 0.55);                     // muzzle
    b.ball(0xf29aa8, 0.06, 0, H + 0.42, 0.62);                    // nose
    [-1, 1].forEach((s) => {
      b.cone(c.ear, 0.13, 0.17, s * 0.1, H + 0.57, 0.36);         // pointy ears
      b.dot(0x6fdc6f, 0.07, s * 0.08, H + 0.5, 0.55);             // eyes
    });
    b.cylRot(c.fur, 0.07, 0.62, 0, H + 0.34, -0.45, -0.5, 0, 0);  // long tail
    fourLegs(la, lb, c.fur, 0.09, H, 0.11, 0.22);
    tagY = 1.2;
  } else if (type === 'bunny') {
    H = 0.16;
    b.ellip(c.fur, 0.42, 0.36, 0.55, 0, H + 0.22, 0);
    b.ball(c.fur, 0.3, 0, H + 0.42, 0.3);
    [-1, 1].forEach((s) => {
      b.box(c.fur, 0.07, 0.34, 0.05, s * 0.07, H + 0.5, 0.26);    // tall ears
      b.box(c.ear, 0.03, 0.24, 0.06, s * 0.07, H + 0.55, 0.27);
      b.dot(0x222222, 0.05, s * 0.09, H + 0.47, 0.43);
    });
    b.ball(0xffffff, 0.16, 0, H + 0.22, -0.32);                   // fluffy tail
    fourLegs(la, lb, c.fur, 0.1, H, 0.12, 0.16);
    tagY = 1.15;
  } else {
    H = 0.1;
    b.ellip(c.fur, 0.34, 0.28, 0.42, 0, H + 0.18, 0);
    b.ball(c.fur, 0.22, 0, H + 0.4, 0.2);
    b.box(c.ear, 0.1, 0.04, 0.1, 0, H + 0.36, 0.34);              // beak
    [-1, 1].forEach((s) => b.dot(0x222222, 0.04, s * 0.07, H + 0.45, 0.3));
    la.box(c.ear, 0.05, H, 0.05, -0.07, 0, 0.02);
    lb.box(c.ear, 0.05, H, 0.05, 0.07, 0, 0.02);
    tagY = 0.9;
  }

  const legsA = la.build();
  legsA.translate(0, -H, 0);   // the leg swings from its top (the hip)
  const legsB = lb.build();
  legsB.translate(0, -H, 0);
  return { body: b.build(), legsA, legsB, hipY: H, tagY };
}

// A little name tag that floats above your own pet.
function makeLabel(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const g = canvas.getContext('2d');
  g.fillStyle = 'rgba(255, 241, 208, 0.92)';
  g.beginPath();
  g.roundRect ? g.roundRect(4, 6, 248, 52, 26) : g.rect(4, 6, 248, 52);
  g.fill();
  g.fillStyle = '#7a3b22';
  g.font = 'bold 30px "Trebuchet MS", Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 128, 34);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(2.0, 0.5, 1);
  return sprite;
}

// =====================================================
export function createPets(ctx) {
  const { scene, makeBuilder, player, keys, grid } = ctx;
  const rng = ctx.makeRng(909);
  const material = new THREE.MeshLambertMaterial({ vertexColors: true });

  let fb = null;
  let currentUid = null;
  let adopted = {};      // petId -> { ownerId, ownerName, name, type }
  let myPet = null;
  let busy = false;
  let wasInside = false;

  // ---------- The street map: pets walk from crossing to crossing ----------
  function nodeOk(i, j) {
    return i >= grid.iMin && i <= grid.iMax && j >= grid.jMin && j <= grid.jMax && !(i === 0 && j === 0);
  }

  function pickNext(p) {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const all = dirs.filter(([di, dj]) => nodeOk(p.ni + di, p.nj + dj));
    const fwd = all.filter(([di, dj]) => !(p.pi === p.ni + di && p.pj === p.nj + dj));
    const list = fwd.length ? fwd : all;
    const [di, dj] = list[Math.floor(Math.random() * list.length)];
    p.pi = p.ni;
    p.pj = p.nj;
    p.ni += di;
    p.nj += dj;
    p.tx = p.ni * grid.pitch + p.lane;
    p.tz = p.nj * grid.pitch + p.lane;
  }

  // ---------- Make the pets ----------
  const pets = [];
  const typeList = ['dog', 'dog', 'dog', 'cat', 'cat', 'cat', 'bunny', 'bunny', 'duckling'];

  for (let n = 0; n < PET_COUNT; n++) {
    const type = typeList[Math.floor(rng() * typeList.length)];
    const palette = PALETTES[type];
    const model = buildPetModel(type, palette[Math.floor(rng() * palette.length)], makeBuilder);

    const group = new THREE.Group();
    group.add(new THREE.Mesh(model.body, material));
    const meshA = new THREE.Mesh(model.legsA, material);
    const meshB = new THREE.Mesh(model.legsB, material);
    meshA.position.y = model.hipY;
    meshB.position.y = model.hipY;
    group.add(meshA, meshB);
    group.scale.setScalar(0.9 + rng() * 0.25);
    scene.add(group);

    let i = 0;
    let j = 0;
    do {
      i = Math.round(-6 + rng() * 8);
      j = Math.round(-8 + rng() * 16);
    } while (!nodeOk(i, j));

    const lane = (rng() < 0.5 ? -1 : 1) * (1.4 + rng() * 1.2);
    const pet = {
      id: `pet_${n}`,
      type,
      name: NAMES[n % NAMES.length],
      group,
      meshA,
      meshB,
      tagY: model.tagY,
      lane,
      speed: type === 'duckling' ? 0.9 + rng() * 0.4 : 1.2 + rng() * 0.9,
      x: i * grid.pitch + lane,
      z: j * grid.pitch + lane,
      ni: i, nj: j, pi: NaN, pj: NaN, tx: 0, tz: 0,
      wait: rng() * 3,
      yaw: rng() * Math.PI * 2,
      yawT: 0,
      phase: rng() * 6,
      amp: 0,
      moving: false,
      spd: 1,
      stuck: 0,
      mine: false,
      hidden: false,
      label: null
    };
    pet.yawT = pet.yaw;
    pickNext(pet);
    pets.push(pet);
  }

  // ---------- Movement ----------
  function wander(p, dt) {
    p.moving = false;
    const toPlayer = Math.hypot(player.x - p.x, player.z - p.z);
    if (toPlayer < 3.5) {                       // someone is close: stop and look at them
      p.yawT = Math.atan2(player.x - p.x, player.z - p.z);
      return;
    }
    if (p.wait > 0) {
      p.wait -= dt;
      return;
    }
    const dx = p.tx - p.x;
    const dz = p.tz - p.z;
    const d = Math.hypot(dx, dz);
    const step = p.speed * dt;
    if (d <= step) {
      p.x = p.tx;
      p.z = p.tz;
      p.wait = 0.5 + Math.random() * 4;
      pickNext(p);
      return;
    }
    p.x += (dx / d) * step;
    p.z += (dz / d) * step;
    p.yawT = Math.atan2(dx, dz);
    p.moving = true;
    p.spd = p.speed;
  }

  function followSpot() {
    const s = Math.sin(player.yaw);
    const c = Math.cos(player.yaw);
    // a little behind you and to your right
    return { x: player.x + s * 2.4 + c * 1.3, z: player.z + c * 2.4 - s * 1.3 };
  }

  function teleportNear(p) {
    const t = followSpot();
    p.x = t.x;
    p.z = t.z;
    p.stuck = 0;
  }

  function follow(p, dt) {
    const t = followSpot();
    const dx = t.x - p.x;
    const dz = t.z - p.z;
    const d = Math.hypot(dx, dz);
    p.moving = false;

    if (d > 45) {
      teleportNear(p);
      return;
    }
    if (d > 0.5) {
      const speed = Math.min(10, 1.2 + d * 1.6);
      const step = speed * dt;
      const nx = p.x + (dx / d) * step;
      const nz = p.z + (dz / d) * step;
      const startedBlocked = ctx.blocked(p.x, p.z);   // if stuck inside something, it may walk out
      const ox = p.x;
      const oz = p.z;
      if (startedBlocked || !ctx.blocked(nx, p.z)) p.x = nx;
      if (startedBlocked || !ctx.blocked(p.x, nz)) p.z = nz;
      const moved = Math.hypot(p.x - ox, p.z - oz);
      if (moved < step * 0.2) {
        p.stuck += dt;
        if (p.stuck > 2.5) teleportNear(p);
      } else {
        p.stuck = 0;
      }
      p.yawT = Math.atan2(dx, dz);
      p.moving = true;
      p.spd = speed;
    } else {
      p.stuck = 0;
      p.yawT = Math.atan2(player.x - p.x, player.z - p.z);
    }
  }

  function animatePet(p, dt) {
    if (p.moving) p.phase += dt * (4 + p.spd * 3.5);
    p.amp += ((p.moving ? 0.7 : 0) - p.amp) * Math.min(1, dt * 10);
    const swing = Math.sin(p.phase) * p.amp;
    p.meshA.rotation.x = swing;
    p.meshB.rotation.x = -swing;

    let diff = p.yawT - p.yaw;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    p.yaw += diff * Math.min(1, dt * 8);

    const bob = p.moving ? Math.abs(Math.sin(p.phase)) * 0.04 : 0;
    p.group.position.set(p.x, ctx.groundY(p.x, p.z) + bob, p.z);
    p.group.rotation.y = p.yaw;
  }

  // ---------- Putting a pet back on the street after it is released ----------
  function snapToNode(p) {
    let i = Math.round(p.x / grid.pitch);
    let j = Math.round(p.z / grid.pitch);
    i = Math.max(grid.iMin, Math.min(grid.iMax, i));
    j = Math.max(grid.jMin, Math.min(grid.jMax, j));
    if (!nodeOk(i, j)) i = 1;
    p.ni = i;
    p.nj = j;
    p.pi = NaN;
    p.pj = NaN;
    p.wait = 1;
    pickNext(p);
  }

  // ---------- Adoption data (from Firebase) ----------
  function setLabel(p, text) {
    if (p.label && p.label.userData.text === text) return;
    removeLabel(p);
    p.label = makeLabel(text);
    p.label.userData.text = text;
    p.label.position.y = p.tagY + 0.35;
    p.group.add(p.label);
  }

  function removeLabel(p) {
    if (!p.label) return;
    p.group.remove(p.label);
    p.label.material.map.dispose();
    p.label.material.dispose();
    p.label = null;
  }

  function applyAdoptions() {
    myPet = null;
    pets.forEach((p) => {
      const rec = adopted[p.id];
      const wasMine = p.mine;
      p.mine = !!(rec && currentUid && rec.ownerId === currentUid);
      p.hidden = !!rec && !p.mine;       // adopted by someone else: gone from the street
      p.group.visible = !p.hidden;
      if (p.mine) {
        p.name = rec.name || p.name;
        myPet = p;
        setLabel(p, p.name);
        if (!wasMine) teleportNear(p);
      } else {
        removeLabel(p);
        if (wasMine) snapToNode(p);
      }
    });
    updateInfoButton();
  }

  // ---------- Buttons ----------
  const btn = document.createElement('button');
  btn.id = 'petBtn';
  btn.className = 'hidden';
  Object.assign(btn.style, {
    position: 'fixed', left: '50%', bottom: '174px', transform: 'translateX(-50%)',
    padding: '12px 26px', fontFamily: 'inherit', fontSize: '18px', fontWeight: 'bold',
    color: '#7a3b22', background: '#fff1d0', border: 'none', borderRadius: '999px',
    boxShadow: '0 4px 0 #e0a56a, 0 8px 18px rgba(100, 50, 20, 0.3)', cursor: 'pointer',
    zIndex: '25', touchAction: 'manipulation'
  });
  document.body.appendChild(btn);

  const infoBtn = document.createElement('button');
  infoBtn.className = 'hidden';
  Object.assign(infoBtn.style, {
    fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold', color: '#7a3b22',
    background: '#fff1d0', border: 'none', borderRadius: '999px', padding: '8px 16px',
    boxShadow: '0 3px 0 #e0a56a', cursor: 'pointer', touchAction: 'manipulation'
  });
  const authBar = document.getElementById('authBar');
  if (authBar) authBar.appendChild(infoBtn);

  function updateInfoButton() {
    infoBtn.classList.toggle('hidden', !myPet);
    if (myPet) infoBtn.textContent = `Pet: ${myPet.name}`;
  }

  let curMode = null;
  let curTarget = null;
  let lastText = '';

  function updateButton() {
    let text = '';
    curMode = null;
    curTarget = null;

    if (fb && ctx.canInteract()) {
      let best = null;
      let bestD = 3.6;
      pets.forEach((p) => {
        if (p.hidden || p.mine) return;
        const d = Math.hypot(p.x - player.x, p.z - player.z);
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      });
      if (best) {
        curTarget = best;
        if (!currentUid) {
          text = `Sign in to adopt this ${best.type}`;
          curMode = 'signin';
        } else if (myPet) {
          text = `You already have a pet (${myPet.name})`;
        } else if (busy) {
          text = 'Adopting...';
        } else {
          text = `Adopt this ${best.type} (free)`;
          curMode = 'adopt';
        }
      }
    }

    btn.classList.toggle('hidden', text === '');
    btn.disabled = curMode === null;
    btn.style.opacity = curMode === null ? '0.85' : '1';
    if (text !== lastText && text !== '') btn.textContent = text;
    lastText = text;
  }

  btn.addEventListener('click', async () => {
    if (!fb || !curTarget || !curMode) return;
    if (curMode === 'signin') {
      fb.signIn().catch((err) => console.warn('Sign in failed:', err));
      return;
    }
    const pet = curTarget;
    const suggestion = NAMES[Math.floor(Math.random() * NAMES.length)];
    const answer = window.prompt(`Give your new ${pet.type} a name:`, suggestion);
    keys.clear();
    const name = (answer || '').trim().slice(0, 16);
    if (!name) return;

    busy = true;
    try {
      await fb.adoptPet(pet.id, pet.type, name);
      ctx.hint(`${name} is now your pet! It will follow you everywhere.`);
    } catch (err) {
      console.warn('Could not adopt:', err);
      const messages = {
        'has-pet': 'You already have a pet.',
        'pet-taken': 'Sorry, someone just adopted this pet.',
        'not-signed-in': 'Please sign in first.'
      };
      ctx.hint(messages[err.message] || 'Could not adopt the pet. Please try again.');
    }
    busy = false;
  });

  infoBtn.addEventListener('click', () => {
    if (!fb || !myPet) return;
    const p = myPet;
    if (window.confirm(`Let ${p.name} go back to the streets? Someone else can adopt it.`)) {
      fb.releasePet(p.id)
        .then(() => ctx.hint(`${p.name} went back to the streets.`))
        .catch((err) => {
          console.warn('Could not release:', err);
          ctx.hint('Could not release the pet. Please try again.');
        });
    }
    keys.clear();
  });

  // ---------- Firebase (loaded on its own, so the game works without it) ----------
  import('./firebase.js').then((mod) => {
    fb = mod;
    fb.onUserChange((user) => {
      currentUid = user ? user.uid : null;
      applyAdoptions();
    });
    fb.watchPets((map) => {
      adopted = map;
      applyAdoptions();
    });
  }).catch((err) => console.warn('Pets could not reach Firebase:', err));

  // ---------- Runs every frame ----------
  function update(dt) {
    const inside = ctx.isInside();
    if (wasInside && !inside && myPet) teleportNear(myPet);   // came out of a house: pet is next to you
    wasInside = inside;

    pets.forEach((p) => {
      if (p.hidden) return;
      if (p.mine) {
        p.group.visible = !inside;                            // your pet waits outside while you are in a house
        if (inside) return;
        follow(p, dt);
      } else {
        wander(p, dt);
      }
      animatePet(p, dt);
    });
    updateButton();
  }

  return { update };
}
