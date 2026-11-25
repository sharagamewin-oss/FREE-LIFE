// =====================================================
// INTERIOR: Cafe   (2 floors, joined by stairs)
// THE ROYAL TEA SALON
//   Ground floor: grand barista bar, pastry case, 6 round tea tables, 2 sofa booths, fireplace,
//                 grand piano, red carpet runner, chandeliers, velvet curtains, paintings.
//   Floor 1:      royal lounge, library wall, chess table, balcony seating, staff room.
// Keeps the exports `plan` and `build`, and the job spot 'serve' (Serve customers).
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './inside_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'serve', label: 'Serve customers', x: 0, z: -5.2, floor: 0 });

// ---------- the royal palette ----------
const C = {
  burgundy: 0x7b1c2e, burgundyDark: 0x5a1020, velvet: 0x8c1d3a, velvetLight: 0xa3284a, red: 0x9b1b30,
  gold: 0xd4af37, goldDark: 0xa8842a, goldLight: 0xf0d27a,
  cream: 0xf4ecd8, marble: 0xf0e6d0, marbleDark: 0xdccfb4, ivory: 0xfaf6ea,
  wood: 0x3d2312, woodMid: 0x5a3820, woodLight: 0x7a5130, parquetA: 0x4a2a16, parquetB: 0x3e2212,
  glass: 0xdff1fb, steel: 0xb9bec6, black: 0x1b1713, white: 0xfaf7f0,
  blue: 0x1c2a6b, green: 0x2f6b3a, flame: 0xff8a1e, flameLight: 0xffd75a, crystal: 0xdff4ff
};

// ---------- small helpers ----------
function rng(seed) {                       // a tiny seeded random generator, so the room is always the same
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const top = (f) => plan.floors[f].top;
const block = (x0, x1, z0, z1, y0, y1) => plan.blocks.push([x0, x1, z0, z1, y0, y1]);

// A point on a wall: u = distance along the wall, depth = distance out from the wall face.
function wpos(wall, u, depth) {
  if (wall === 'n') return [u, -8 + depth];
  if (wall === 's') return [u, 8 - depth];
  if (wall === 'w') return [-12 + depth, u];
  return [12 - depth, u];
}
// A box flat on a wall. y = bottom, w = size along the wall, t = thickness out from the wall.
function wbox(b, wall, color, u, y, w, h, depth, t) {
  const [x, z] = wpos(wall, u, depth);
  if (wall === 'n' || wall === 's') b.box(color, w, h, t, x, y, z);
  else b.box(color, t, h, w, x, y, z);
}
function wball(b, wall, color, u, y, dia, depth, squash = 1) {
  const [x, z] = wpos(wall, u, depth);
  b.ball(color, dia, x, y, z, squash);
}

// ---------- floors, carpets and rugs ----------
function parquet(b, f, x0, x1, z0, z1) {          // dark wood floor in the middle of the cream marble
  const T = top(f);
  for (let z = z0, n = 0; z < z1 - 0.001; n++) {
    const ez = Math.min(z1, z + 0.6);
    b.box(n % 2 ? C.parquetA : C.parquetB, x1 - x0, 0.02, ez - z, (x0 + x1) / 2, T, (z + ez) / 2);
    z = ez;
  }
  const w = 0.07;                                   // gold inlay around it
  b.box(C.gold, x1 - x0 + w, 0.03, w, (x0 + x1) / 2, T, z0);
  b.box(C.gold, x1 - x0 + w, 0.03, w, (x0 + x1) / 2, T, z1);
  b.box(C.gold, w, 0.03, z1 - z0, x0, T, (z0 + z1) / 2);
  b.box(C.gold, w, 0.03, z1 - z0, x1, T, (z0 + z1) / 2);
}
function runner(b, f, x, z0, z1, w) {             // the red carpet with gold borders and diamonds
  const T = top(f);
  const len = z1 - z0;
  const cz = (z0 + z1) / 2;
  b.box(C.gold, w + 0.14, 0.025, len + 0.14, x, T, cz);
  b.box(C.red, w, 0.03, len, x, T, cz);
  b.box(C.gold, 0.1, 0.036, len, x - w / 2 + 0.12, T, cz);
  b.box(C.gold, 0.1, 0.036, len, x + w / 2 - 0.12, T, cz);
  b.box(C.goldDark, 0.03, 0.036, len, x - w / 2 + 0.3, T, cz);
  b.box(C.goldDark, 0.03, 0.036, len, x + w / 2 - 0.3, T, cz);
  for (let z = z0 + 0.8; z < z1 - 0.4; z += 1.6) {
    b.slab(C.gold, 0.5, 0.012, 0.5, x, T + 0.036, z, 0, Math.PI / 4, 0);
    b.slab(C.burgundyDark, 0.28, 0.012, 0.28, x, T + 0.042, z, 0, Math.PI / 4, 0);
  }
  for (let i = -4; i <= 4; i++) {                  // fringe at the two ends
    b.box(C.goldLight, 0.05, 0.03, 0.12, x + i * (w / 9), T, z0 - 0.1);
    b.box(C.goldLight, 0.05, 0.03, 0.12, x + i * (w / 9), T, z1 + 0.1);
  }
}
function rectRug(b, f, x, z, w, d) {
  const T = top(f);
  b.box(C.gold, w, 0.02, d, x, T, z);
  b.box(C.burgundyDark, w - 0.16, 0.03, d - 0.16, x, T, z);
  b.box(C.goldDark, w - 0.5, 0.035, d - 0.5, x, T, z);
  b.box(C.burgundy, w - 0.62, 0.04, d - 0.62, x, T, z);
  b.slab(C.gold, Math.min(w, d) * 0.4, 0.012, Math.min(w, d) * 0.4, x, T + 0.046, z, 0, Math.PI / 4, 0);
  b.slab(C.cream, Math.min(w, d) * 0.28, 0.012, Math.min(w, d) * 0.28, x, T + 0.052, z, 0, Math.PI / 4, 0);
}
function roundRug(b, f, x, z, dia) {
  const T = top(f);
  b.cyl(C.gold, dia, 0.02, x, T, z);
  b.cyl(C.burgundyDark, dia - 0.14, 0.03, x, T, z);
  b.cyl(C.goldDark, dia * 0.62, 0.035, x, T, z);
  b.cyl(C.burgundy, dia * 0.62 - 0.1, 0.04, x, T, z);
}

// ---------- walls: panelling, cornice, ceiling, curtains, art ----------
function wallPanelling(b, f) {
  const T = top(f);
  const strip = (wall, a, bb) => {                  // wainscot from a to bb along the wall
    const w = bb - a;
    const u = (a + bb) / 2;
    wbox(b, wall, C.wood, u, T, w, 0.95, 0.045, 0.09);
    wbox(b, wall, C.gold, u, T + 0.95, w, 0.05, 0.06, 0.12);
    wbox(b, wall, C.goldDark, u, T + 0.02, w, 0.06, 0.06, 0.12);
    for (let p = a + 0.3; p + 1.0 < bb; p += 1.35) {
      wbox(b, wall, C.woodMid, p + 0.5, T + 0.2, 1.0, 0.6, 0.1, 0.04);
      wbox(b, wall, C.goldDark, p + 0.5, T + 0.2, 1.04, 0.025, 0.1, 0.05);
    }
  };
  strip('n', -11.9, 11.9);
  strip('w', -7.9, 7.9);
  strip('e', -7.9, -4.1);
  strip('e', 4.1, 7.9);
  if (f === 0) { strip('s', -11.9, -1.45); strip('s', 1.45, 11.9); } else strip('s', -11.9, 11.9);
}
function cornice(b, f) {                           // gold crown moulding and ceiling grid
  const T = top(f);
  ['n', 's'].forEach((wl) => {
    wbox(b, wl, C.gold, 0, T + 3.28, 24, 0.17, 0.08, 0.16);
    wbox(b, wl, C.cream, 0, T + 3.16, 24, 0.12, 0.05, 0.1);
  });
  ['w', 'e'].forEach((wl) => {
    wbox(b, wl, C.gold, 0, T + 3.28, 16, 0.17, 0.08, 0.16);
    wbox(b, wl, C.cream, 0, T + 3.16, 16, 0.12, 0.05, 0.1);
  });
  [-8, -4, 4, 8].forEach((x) => b.box(C.gold, 0.1, 0.03, 15.6, x, T + 3.465, 0));
  [-2.5, 2.4].forEach((z) => b.box(C.gold, 23.6, 0.03, 0.1, 0, T + 3.465, z));
}
function curtain(b, f, wall, u, winW) {            // heavy velvet curtains, tie-backs and a pelmet
  const T = top(f);
  [-1, 1].forEach((side) => {
    const uc = u + side * (winW / 2 - 0.28);
    [-0.17, 0, 0.17].forEach((o, i) => {
      wbox(b, wall, i === 1 ? 0x6a1226 : 0x84203a, uc + o, T + 0.05, 0.17, 2.95, 0.07 + (i === 1 ? 0.03 : 0), 0.14 + (i === 1 ? 0.06 : 0));
    });
    wbox(b, wall, C.gold, uc, T + 1.15, 0.6, 0.07, 0.1, 0.22);
    wbox(b, wall, C.goldLight, uc + side * 0.0, T + 1.12, 0.1, 0.13, 0.1, 0.26);
  });
  wbox(b, wall, C.burgundyDark, u, T + 3.0, winW + 0.5, 0.3, 0.11, 0.22);
  wbox(b, wall, C.gold, u, T + 2.96, winW + 0.5, 0.05, 0.11, 0.24);
  wbox(b, wall, C.gold, u, T + 3.28, winW + 0.5, 0.04, 0.11, 0.24);
  for (let k = -winW / 2; k <= winW / 2 + 0.01; k += 0.4) wball(b, wall, C.goldLight, u + k, T + 2.93, 0.07, 0.12);
}
// A framed painting or mirror. y = bottom of the frame above the floor.
function art(b, f, wall, u, y, w, h, kind, opt = {}) {
  const T = top(f);
  const off = opt.off || 0;
  wbox(b, wall, C.gold, u, T + y, w, h, off + 0.05, 0.1);
  wbox(b, wall, C.goldDark, u, T + y + 0.07, w - 0.14, h - 0.14, off + 0.075, 0.1);
  const iw = w - 0.28;
  const ih = h - 0.28;
  const iy = T + y + 0.14;
  const d = off + 0.145;
  if (kind === 'mirror') {
    wbox(b, wall, 0xc9dce6, u, iy, iw, ih, off + 0.12, 0.04);
    wbox(b, wall, 0xe8f3f8, u - iw * 0.22, iy + ih * 0.1, 0.14, ih * 0.75, d, 0.02);
    wbox(b, wall, 0xe8f3f8, u - iw * 0.12, iy + ih * 0.1, 0.05, ih * 0.75, d, 0.02);
    wbox(b, wall, C.gold, u, T + y + h, w * 0.45, 0.1, off + 0.06, 0.14);
    wball(b, wall, C.gold, u, T + y + h + 0.16, 0.2, off + 0.07);
  } else if (kind === 'portrait') {
    wbox(b, wall, C.burgundyDark, u, iy, iw, ih, off + 0.12, 0.04);
    wbox(b, wall, 0x8a6a1a, u, iy + ih * 0.3, iw, 0.06, d, 0.02);
    const n = iw > 2.2 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const fx = u + (i - (n - 1) / 2) * (iw / n) * 0.9;
      const fw = Math.min(iw / n * 0.62, 1.0);
      wbox(b, wall, i === 0 ? C.blue : 0x2f6b3a, fx, iy, fw, ih * 0.55, d, 0.04);
      wbox(b, wall, C.white, fx, iy + ih * 0.5, fw * 0.7, ih * 0.09, d + 0.02, 0.04);
      wbox(b, wall, C.gold, fx, iy + ih * 0.1, 0.07, ih * 0.4, d + 0.03, 0.03);
      wball(b, wall, 0xf1c8a2, fx, iy + ih * 0.66, ih * 0.2, d + 0.05);
      wbox(b, wall, C.gold, fx, iy + ih * 0.74, ih * 0.17, ih * 0.06, d + 0.06, 0.05);
      [-1, 0, 1].forEach((k) => wbox(b, wall, C.goldLight, fx + k * ih * 0.055, iy + ih * 0.8, ih * 0.03, ih * 0.05, d + 0.06, 0.04));
      [-1, 1].forEach((k) => wball(b, wall, C.black, fx + k * ih * 0.04, iy + ih * 0.67, ih * 0.025, d + 0.13));
    }
  } else {                                          // landscape
    wbox(b, wall, 0x9ccbe8, u, iy + ih * 0.35, iw, ih * 0.65, off + 0.12, 0.04);
    wbox(b, wall, 0x5f8f4a, u, iy, iw, ih * 0.4, off + 0.13, 0.04);
    wbox(b, wall, 0x4a7a3a, u - iw * 0.2, iy + ih * 0.2, iw * 0.5, ih * 0.22, d, 0.03);
    wball(b, wall, C.goldLight, u + iw * 0.22, iy + ih * 0.78, ih * 0.16, d);
    wbox(b, wall, 0x6a4a2a, u + iw * 0.25, iy + ih * 0.2, 0.06, ih * 0.22, d + 0.02, 0.03);
    wball(b, wall, 0x2f6b3a, u + iw * 0.25, iy + ih * 0.46, ih * 0.22, d + 0.04);
  }
  wbox(b, wall, C.gold, u, T + y + h + 0.03, w * 0.4, 0.05, off + 0.15, 0.2);     // picture light
}

// ---------- pillars, chandeliers ----------
function pillar(b, f, x, z, dia = 0.62) {
  const T = top(f);
  b.cyl(C.marbleDark, dia + 0.3, 0.18, x, T, z);                           // plinth
  b.cyl(C.gold, dia + 0.2, 0.1, x, T + 0.18, z);                           // gold base ring
  b.cyl(C.marble, dia, 2.74, x, T + 0.28, z);                              // shaft
  for (let i = 0; i < 8; i++) {                                           // fluting
    const a = (i / 8) * Math.PI * 2;
    b.box(0xdcd0b6, 0.05, 2.6, 0.05, x + Math.cos(a) * (dia / 2), T + 0.34, z + Math.sin(a) * (dia / 2));
  }
  b.cyl(C.gold, dia + 0.12, 0.1, x, T + 3.02, z);                          // gold neck
  b.cyl(C.gold, dia + 0.36, 0.12, x, T + 3.12, z);                         // capital
  b.box(C.goldLight, dia + 0.5, 0.12, dia + 0.5, x, T + 3.24, z);          // top plate
  b.box(C.gold, dia + 0.62, 0.1, dia + 0.62, x, T + 3.36, z);
  const h = (dia + 0.62) / 2;
  block(x - h + 0.1, x + h - 0.1, z - h + 0.1, z + h - 0.1, T, T + 3.5);
}
function chandelier(b, f, x, z, s = 1) {
  const T = top(f);
  b.cyl(C.gold, 1.7 * s, 0.02, x, T + 3.47, z);                            // ceiling medallion
  b.cyl(C.cream, 1.5 * s, 0.03, x, T + 3.47, z);
  b.cyl(C.gold, 0.4 * s, 0.05, x, T + 3.42, z);                            // rose
  b.cyl(C.goldDark, 0.05, 0.64, x, T + 2.8, z);                            // chain
  b.ball(C.gold, 0.34 * s, x, T + 2.68, z);
  b.cyl(C.gold, 0.1, 0.3, x, T + 2.4, z);
  b.ball(C.goldLight, 0.2 * s, x, T + 2.42, z);
  const arms = (n, R, y, rot, flameLift) => {
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * Math.PI * 2;
      const ax = x + Math.cos(a) * R;
      const az = z - Math.sin(a) * R;
      b.slab(C.gold, R, 0.04, 0.04, x + Math.cos(a) * R / 2, T + y, z - Math.sin(a) * R / 2, 0, a, 0);
      b.cyl(C.gold, 0.1, 0.05, ax, T + y, az);
      b.cyl(C.ivory, 0.05, 0.16, ax, T + y + 0.05, az);
      b.dot(C.flameLight, 0.07, ax, T + y + 0.25 + flameLift, az);
      b.dot(C.crystal, 0.09, ax, T + y - 0.1, az);
      b.cyl(C.crystal, 0.015, 0.08, ax, T + y - 0.06, az);
    }
  };
  arms(8, 0.78 * s, 2.62, 0, 0);
  arms(4, 0.42 * s, 2.92, Math.PI / 8, 0);
  for (let i = 0; i < 8; i++) {                                           // hanging crystal drops
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.dot(C.crystal, 0.11, x + Math.cos(a) * 0.5 * s, T + 2.5, z - Math.sin(a) * 0.5 * s);
  }
}

// ---------- seats and tables ----------
function vchair(b, f, x, z, a) {                   // velvet dining chair with a gold rail
  addChair(b, plan, x, z, f, a, C.velvet);
  const T = top(f);
  const s = Math.sin(a);
  const c = Math.cos(a);
  b.slab(C.gold, 0.54, 0.05, 0.08, x - s * 0.22, T + 1.0, z - c * 0.22, 0, a, 0);
  b.slab(C.gold, 0.52, 0.025, 0.52, x, T + 0.425, z, 0, a, 0);
  [-0.25, 0.25].forEach((lx) => b.dot(C.goldLight, 0.07, x + c * lx - s * 0.22, T + 1.03, z - s * lx - c * 0.22));
}
function stool(b, f, x, z, a) {                    // round velvet stool you can sit on
  const T = top(f);
  b.cyl(C.gold, 0.36, 0.04, x, T, z);
  b.cyl(C.gold, 0.07, 0.42, x, T + 0.04, z);
  b.cyl(C.gold, 0.46, 0.03, x, T + 0.44, z);
  b.cyl(C.velvet, 0.42, 0.1, x, T + 0.47, z);
  b.dot(C.goldLight, 0.05, x, T + 0.58, z);
  plan.spots.push({ kind: 'sit', x, y: T + 0.62, z, a });
}
// A sofa or armchair. `facing` is the way the person sitting looks: 'n' (-z), 's' (+z), 'e' (+x), 'w' (-x).
function sofa(b, f, cx, cz, facing, w, d = 0.95, cover = C.velvet) {
  const T = top(f);
  const map = {
    s: (lx, lz) => [cx + lx, cz + lz], n: (lx, lz) => [cx - lx, cz - lz],
    e: (lx, lz) => [cx + lz, cz - lx], w: (lx, lz) => [cx - lz, cz + lx]
  }[facing];
  const swap = facing === 'e' || facing === 'w';
  const lb = (color, lx, lz, sw, sd, y, h) => {     // a box in the sofa's own directions
    const [x, z] = map(lx, lz);
    b.box(color, swap ? sd : sw, h, swap ? sw : sd, x, T + y, z);
  };
  lb(C.wood, 0, 0, w - 0.06, d - 0.06, 0.08, 0.12);                          // plinth
  const n = Math.max(1, Math.round(w / 0.9));
  const cw = (w - 0.4) / n;
  for (let i = 0; i < n; i++) lb(cover, -(w - 0.4) / 2 + cw * (i + 0.5), 0.14, cw - 0.03, d - 0.28, 0.2, 0.26);   // seat cushions
  lb(cover, 0, -d / 2 + 0.14, w - 0.02, 0.28, 0.2, 0.78);                    // back
  lb(C.gold, 0, -d / 2 + 0.14, w, 0.2, 0.98, 0.05);                          // gold top rail
  for (let i = 0; i < n * 2; i++) {                                           // button tufting
    const bx = -(w - 0.4) / 2 + (w - 0.4) * ((i + 0.5) / (n * 2));
    [0.5, 0.76].forEach((y) => { const [x, z] = map(bx, -d / 2 + 0.285); b.dot(C.goldLight, 0.05, x, T + y, z); });
  }
  [-1, 1].forEach((sd) => {
    lb(cover, sd * (w / 2 - 0.1), 0.02, 0.2, d - 0.04, 0.2, 0.42);           // arms
    lb(C.gold, sd * (w / 2 - 0.1), 0.02, 0.22, d - 0.02, 0.62, 0.04);
    [[sd * (w / 2 - 0.08), d / 2 - 0.08], [sd * (w / 2 - 0.08), -d / 2 + 0.08]].forEach(([lx, lz]) => {
      const [x, z] = map(lx, lz);
      b.cyl(C.gold, 0.07, 0.08, x, T, z);                                     // gold feet
    });
  });
  const [x0, z0] = map(-w / 2, -d / 2);
  const [x1, z1] = map(w / 2, d / 2);
  block(Math.min(x0, x1), Math.max(x0, x1), Math.min(z0, z1), Math.max(z0, z1), T, T + 1.0);
  const a = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[facing];
  for (let i = 0; i < n; i++) {
    const [x, z] = map(-(w - 0.4) / 2 + cw * (i + 0.5), 0.14);
    plan.spots.push({ kind: 'sit', x, y: T + 0.5, z, a });
  }
}
function tea(b, x, y, z, seed = 0) {               // a small tea setting on a table top
  b.ball(C.ivory, 0.2, x, y + 0.11, z, 0.9);
  b.dot(C.gold, 0.05, x, y + 0.23, z);
  b.box(C.ivory, 0.08, 0.03, 0.04, x + 0.13, y + 0.14, z);
  [-1, 1].forEach((k) => {
    b.cyl(C.ivory, 0.2, 0.012, x + k * 0.3, y, z + 0.2);
    b.cyl(C.ivory, 0.1, 0.07, x + k * 0.3, y + 0.012, z + 0.2);
    b.cyl(C.gold, 0.102, 0.012, x + k * 0.3, y + 0.07, z + 0.2);
  });
  b.cyl(C.gold, 0.07, 0.16, x - 0.1, y, z - 0.25);                            // little vase
  [C.velvetLight, 0xf2a6b8, 0xffe08a][seed % 3] && b.dot([C.velvetLight, 0xf2a6b8, 0xffe08a][seed % 3], 0.1, x - 0.1, y + 0.22, z - 0.25);
  b.dot(C.green, 0.06, x - 0.06, y + 0.2, z - 0.25);
}
function roundTable(b, f, x, z, chairs, seed = 0) {
  const T = top(f);
  roundRug(b, f, x, z, 2.5);
  b.cyl(C.wood, 0.7, 0.05, x, T, z);
  b.cyl(C.gold, 0.2, 0.68, x, T + 0.05, z);
  b.cyl(C.gold, 0.34, 0.06, x, T + 0.1, z);
  b.cyl(C.gold, 1.36, 0.03, x, T + 0.72, z);
  b.cyl(C.marble, 1.3, 0.04, x, T + 0.74, z);
  b.cyl(C.burgundyDark, 0.9, 0.012, x, T + 0.78, z);                          // lace runner colour
  tea(b, x, T + 0.792, z, seed);
  block(x - 0.62, x + 0.62, z - 0.62, z + 0.62, T, T + 0.85);
  chairs.forEach(([dx, dz]) => vchair(b, f, x + dx, z + dz, Math.atan2(-dx, -dz)));
}
function rectTable(b, f, x, z, w, d) {            // a gold-edged marble table
  const T = top(f);
  solidBox(b, plan, C.wood, x, z, w - 0.2, d - 0.2, 0.7, f);
  b.box(C.goldDark, w - 0.1, 0.05, d - 0.1, x, T + 0.68, z);
  b.box(C.marble, w, 0.05, d, x, T + 0.72, z);
  b.box(C.gold, w + 0.04, 0.025, d + 0.04, x, T + 0.7, z);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => b.cyl(C.gold, 0.08, 0.7, x + sx * (w / 2 - 0.12), T, z + sz * (d / 2 - 0.12)));
  b.box(C.burgundyDark, w * 0.6, 0.012, d * 0.5, x, T + 0.77, z);
}

// ---------- big features of the ground floor ----------
function bar(b) {
  const T = 0;
  // --- the front counter (customers stand on its +z side) ---
  solidBox(b, plan, C.wood, 0, -3.4, 11, 1.2, 1.05, 0);
  b.box(C.goldDark, 11.56, 0.04, 1.56, 0, 1.02, -3.4);
  b.box(C.marble, 11.5, 0.07, 1.5, 0, 1.05, -3.4);
  for (let i = 0; i < 11; i++) {
    const x = -5 + i;
    b.box(C.gold, 0.9, 0.8, 0.02, x, 0.15, -2.79);
    b.box(C.burgundyDark, 0.8, 0.7, 0.03, x, 0.2, -2.775);
    b.dot(C.goldLight, 0.1, x, 0.55, -2.75);
  }
  b.box(C.gold, 11, 0.1, 0.04, 0, 0, -2.78);
  // things on the front counter
  const y = 1.12;
  b.cyl(C.gold, 0.62, 0.06, 3.0, y, -3.4);                                    // cake on a stand with a dome cover
  b.cyl(C.gold, 0.1, 0.14, 3.0, y + 0.06, -3.4);
  b.cyl(C.gold, 0.56, 0.03, 3.0, y + 0.2, -3.4);
  b.cyl(0xf4c6d0, 0.46, 0.14, 3.0, y + 0.23, -3.4);
  b.cyl(C.white, 0.34, 0.12, 3.0, y + 0.37, -3.4);
  b.dot(0xc4162a, 0.07, 3.0, y + 0.52, -3.4);
  [[-0.27, -0.27], [0.27, -0.27], [-0.27, 0.27], [0.27, 0.27]].forEach(([dx, dz]) => b.cyl(C.crystal, 0.025, 0.55, 3.0 + dx, y + 0.06, -3.4 + dz));
  b.ball(C.gold, 0.66, 3.0, y + 0.62, -3.4, 0.55);
  b.dot(C.goldLight, 0.08, 3.0, y + 0.82, -3.4);
  b.cyl(C.goldDark, 0.3, 0.05, -3.2, y, -3.4);                                // the gold coffee urn
  b.cyl(C.gold, 0.4, 0.46, -3.2, y + 0.05, -3.4);
  b.cyl(C.goldLight, 0.42, 0.03, -3.2, y + 0.3, -3.4);
  b.cone(C.gold, 0.4, 0.2, -3.2, y + 0.51, -3.4);
  b.dot(C.goldLight, 0.08, -3.2, y + 0.74, -3.4);
  b.box(C.goldDark, 0.18, 0.05, 0.05, -3.2, y + 0.2, -3.17);
  b.box(C.woodLight, 0.06, 0.1, 0.06, -3.2, y + 0.16, -3.12);
  [-1, 1].forEach((k) => b.box(C.gold, 0.05, 0.22, 0.05, -3.2 + k * 0.24, y + 0.2, -3.4));
  b.cyl(C.gold, 0.07, 0.3, 0.2, y, -3.4);                                     // three tier tray of pastries
  [[0.55, 0.0, 0xf4d9a0], [0.42, 0.28, 0xf2b6c4], [0.3, 0.52, 0xcfe6b8]].forEach(([dia, h, col], i) => {
    b.cyl(C.ivory, dia, 0.02, 0.2, y + 0.06 + h, -3.4);
    b.cyl(C.gold, dia + 0.02, 0.01, 0.2, y + 0.06 + h, -3.4);
    for (let k = 0; k < 4 - i; k++) {
      const a = (k / (4 - i)) * Math.PI * 2;
      b.ball(col, 0.1, 0.2 + Math.cos(a) * dia * 0.28, y + 0.13 + h, -3.4 - Math.sin(a) * dia * 0.28);
    }
  });
  for (let i = 0; i < 6; i++) {                                               // cups and saucers
    const cx = -1.7 + i * 0.26;
    b.cyl(C.ivory, 0.2, 0.012, cx, y, -3.15);
    b.cyl(C.white, 0.11, 0.07, cx, y + 0.012, -3.15);
    b.cyl(C.gold, 0.112, 0.012, cx, y + 0.07, -3.15);
  }
  b.cyl(C.ivory, 0.22, 0.03, -1.0, y, -3.75);                                 // sugar bowl, bell, flowers
  b.dot(C.gold, 0.06, -1.0, y + 0.06, -3.75);
  b.ball(C.gold, 0.2, 4.7, y + 0.08, -3.6, 0.7);
  b.dot(C.goldLight, 0.05, 4.7, y + 0.2, -3.6);
  b.cyl(C.gold, 0.1, 0.2, 1.8, y, -3.75);
  [0xf2a6b8, C.velvetLight, 0xffe08a, 0xffffff].forEach((col, i) => b.dot(col, 0.12, 1.8 + (i - 1.5) * 0.06, y + 0.3 + (i % 2) * 0.05, -3.75));
  // --- bar stools ---
  [-4.2, -3.0, 3.0, 4.2].forEach((x) => stool(b, 0, x, -2.2, Math.PI));
  // --- the back counter with the espresso machine ---
  solidBox(b, plan, C.wood, 0, -7.2, 13.4, 1.0, 0.95, 0);
  b.box(C.goldDark, 13.54, 0.04, 1.14, 0, 0.93, -7.2);
  b.box(C.marble, 13.5, 0.06, 1.1, 0, 0.95, -7.2);
  for (let i = 0; i < 13; i++) {
    const x = -6 + i;
    b.box(C.gold, 0.9, 0.7, 0.02, x, 0.12, -6.69);
    b.box(C.burgundyDark, 0.8, 0.6, 0.03, x, 0.17, -6.675);
  }
  const by = 1.01;
  b.box(C.goldDark, 1.3, 0.1, 0.62, -2.2, by, -7.2);                          // espresso machine
  b.box(C.steel, 1.2, 0.5, 0.55, -2.2, by + 0.1, -7.2);
  b.box(C.gold, 1.24, 0.04, 0.58, -2.2, by + 0.6, -7.2);
  b.box(C.gold, 1.24, 0.04, 0.58, -2.2, by + 0.1, -7.2);
  [-0.35, 0.35].forEach((k) => {
    b.cyl(C.goldLight, 0.28, 0.3, -2.2 + k, by + 0.64, -7.2);
    b.ball(C.gold, 0.28, -2.2 + k, by + 0.96, -7.2, 0.8);
    b.box(C.black, 0.22, 0.1, 0.12, -2.2 + k, by + 0.28, -6.9);
    b.box(C.woodMid, 0.05, 0.05, 0.26, -2.2 + k, by + 0.3, -6.74);
    b.cyl(C.gold, 0.03, 0.3, -2.2 + k * 1.7, by + 0.2, -6.92);
  });
  [-0.12, 0.12].forEach((k) => b.dot(C.white, 0.08, -2.2 + k, by + 0.46, -6.92));
  b.ball(C.gold, 0.18, -2.2, by + 1.02, -7.2);
  b.box(C.goldDark, 1.1, 0.03, 0.3, -2.2, by + 0.1, -6.8);
  b.box(C.steel, 0.34, 0.5, 0.32, 0.4, by, -7.2);                             // coffee grinder
  b.cone(C.woodMid, 0.3, 0.26, 0.4, by + 0.5, -7.2);
  b.box(C.gold, 0.36, 0.04, 0.34, 0.4, by + 0.3, -7.2);
  [[1.5, C.gold, 0.34], [1.9, C.burgundy, 0.28], [2.3, C.gold, 0.3], [2.7, C.blue, 0.26]].forEach(([x, col, h]) => {   // tea canisters
    b.cyl(col, 0.26, h, x, by, -7.2);
    b.cyl(C.goldLight, 0.28, 0.04, x, by + h, -7.2);
    b.cyl(C.gold, 0.28, 0.025, x, by + h * 0.5, -7.2);
  });
  b.ball(C.gold, 0.34, 4.4, by + 0.17, -7.2, 0.85);                           // kettle
  b.cone(C.gold, 0.24, 0.14, 4.4, by + 0.32, -7.2);
  b.box(C.gold, 0.2, 0.05, 0.05, 4.65, by + 0.22, -7.2);
  [5.3, 5.62].forEach((x) => { b.cyl(C.ivory, 0.26, 0.03, x, by, -7.2); b.cyl(C.ivory, 0.2, 0.03, x, by + 0.03, -7.2); b.cyl(C.ivory, 0.14, 0.03, x, by + 0.06, -7.2); });
  // --- the back wall: panel, shelves with jars and teapots, a big mirror ---
  wbox(b, 'n', C.woodMid, 0, 1.01, 13.4, 2.35, 0.06, 0.1);
  wbox(b, 'n', C.gold, 0, 3.3, 13.5, 0.08, 0.2, 0.4);
  [-6.7, 6.7].forEach((u) => wbox(b, 'n', C.gold, u, 1.01, 0.12, 2.35, 0.25, 0.5));
  art(b, 0, 'n', 0, 1.65, 3.0, 1.4, 'mirror', { off: 0.1 });
  const r = rng(11);
  const jarCols = [0xd9c7a0, 0x8fbf8a, 0xc86b5a, 0x7a9bc8, 0xe8e0cc, 0xb48fc4];
  [1.62, 2.12, 2.62].forEach((sy, si) => {
    [[-6.2, -1.9], [1.9, 6.2]].forEach(([xa, xb]) => {
      wbox(b, 'n', C.wood, (xa + xb) / 2, sy, xb - xa + 0.4, 0.04, 0.3, 0.4);
      wbox(b, 'n', C.gold, (xa + xb) / 2, sy - 0.02, xb - xa + 0.42, 0.025, 0.3, 0.42);
      let i = si;
      for (let x = xa + 0.25; x < xb - 0.1; x += 0.55, i++) {
        const [px, pz] = wpos('n', x, 0.3);
        const y = sy + 0.04;
        const kind = (i + si) % 4;
        if (kind === 0) {
          b.cyl(jarCols[Math.floor(r() * jarCols.length)], 0.22, 0.28, px, y, pz);
          b.cyl(C.gold, 0.24, 0.04, px, y + 0.28, pz);
        } else if (kind === 1) {
          b.ball(r() > 0.5 ? C.ivory : 0xe8d6b8, 0.28, px, y + 0.14, pz, 0.9);
          b.cyl(C.gold, 0.14, 0.03, px, y + 0.27, pz);
          b.dot(C.gold, 0.06, px, y + 0.33, pz);
          b.box(C.ivory, 0.05, 0.05, 0.14, px, y + 0.14, pz + 0.18);
          b.box(C.gold, 0.04, 0.16, 0.04, px, y + 0.06, pz - 0.18);
        } else if (kind === 2) {
          b.box(r() > 0.5 ? C.burgundy : C.blue, 0.2, 0.26, 0.2, px, y, pz);
          b.box(C.gold, 0.22, 0.04, 0.22, px, y + 0.13, pz);
        } else {
          for (let k = 0; k < 3; k++) { b.cyl(C.ivory, 0.22, 0.03, px, y + k * 0.05, pz); b.cyl(C.gold, 0.225, 0.01, px, y + k * 0.05 + 0.03, pz); }
          b.cyl(C.ivory, 0.1, 0.07, px, y + 0.15, pz);
        }
      }
    });
  });
}
function pastryCase(b) {
  const x = 7.0;
  const z = -3.4;
  solidBox(b, plan, C.wood, x, z, 2.6, 1.0, 0.7, 0);
  b.box(C.goldDark, 2.66, 0.05, 1.06, x, 0.68, z);
  for (let i = 0; i < 3; i++) {
    b.box(C.gold, 0.8, 0.5, 0.02, x - 0.85 + i * 0.85, 0.1, z + 0.51);
    b.box(C.burgundyDark, 0.72, 0.42, 0.03, x - 0.85 + i * 0.85, 0.14, z + 0.52);
  }
  [[-1.28, -0.48], [1.28, -0.48], [-1.28, 0.48], [1.28, 0.48]].forEach(([dx, dz]) => b.cyl(C.gold, 0.06, 0.6, x + dx, 0.73, z + dz));
  b.box(C.gold, 2.64, 0.04, 1.04, x, 1.33, z);
  [0.74, 1.02].forEach((y, lv) => {
    b.box(C.marble, 2.4 - lv * 0.3, 0.03, 0.82 - lv * 0.1, x, y, z);
    b.box(C.gold, 2.44 - lv * 0.3, 0.015, 0.86 - lv * 0.1, x, y - 0.012, z);
  });
  [-1.0, 1.0].forEach((dx) => b.cyl(C.gold, 0.04, 0.28, x + dx * 0.8, 0.77, z));
  const pastelCols = [0xf4b6c8, 0xbfe3b4, 0xf7e1a1, 0xc9b6e8, 0xf9c9a0];
  for (let i = 0; i < 9; i++) b.ball(pastelCols[i % 5], 0.11, x - 1.0 + i * 0.25, 0.83, z - 0.2 + (i % 2) * 0.12);   // macarons
  for (let i = 0; i < 4; i++) { b.box(0x7a4a2a, 0.2, 0.05, 0.07, x - 0.9 + i * 0.5, 0.77, z + 0.28); b.box(C.white, 0.2, 0.012, 0.05, x - 0.9 + i * 0.5, 0.82, z + 0.28); }
  for (let i = 0; i < 6; i++) {                                               // little cakes on the top tray
    const cx = x - 0.7 + i * 0.28;
    b.cyl(pastelCols[(i + 2) % 5], 0.14, 0.09, cx, 1.05, z + ((i % 2) ? 0.1 : -0.1));
    b.dot(0xc4162a, 0.05, cx, 1.16, z + ((i % 2) ? 0.1 : -0.1));
  }
}
function fireplace(b) {
  const T = 0;
  block(-12, -10.8, -1.85, 1.85, 0, 3.5);
  wbox(b, 'w', C.marble, 0, 0, 3.6, 3.45, 0.5, 1.0);                          // chimney breast
  wbox(b, 'w', C.goldDark, 0, 3.0, 3.7, 0.08, 1.0, 1.04);
  wbox(b, 'w', C.gold, 0, 3.28, 3.8, 0.17, 1.02, 1.08);
  wbox(b, 'w', C.black, 0, 0.12, 1.5, 1.18, 1.02, 0.04);                      // the opening
  wbox(b, 'w', 0xf7f0e0, -0.86, 0.04, 0.22, 1.5, 1.06, 0.12);
  wbox(b, 'w', 0xf7f0e0, 0.86, 0.04, 0.22, 1.5, 1.06, 0.12);
  wbox(b, 'w', 0xf7f0e0, 0, 1.3, 1.95, 0.2, 1.06, 0.12);
  wbox(b, 'w', C.gold, 0, 1.28, 1.99, 0.03, 1.07, 0.14);
  wbox(b, 'w', C.marbleDark, 0, 0, 2.5, 0.08, 1.3, 0.6);                      // hearth
  wbox(b, 'w', C.gold, -1.05, 0.2, 0.04, 0.35, 1.5, 0.04);                    // gold fender
  wbox(b, 'w', C.gold, 1.05, 0.2, 0.04, 0.35, 1.5, 0.04);
  wbox(b, 'w', C.gold, 0, 0.5, 2.1, 0.04, 1.5, 0.04);
  b.slab(0x4a2a14, 0.95, 0.16, 0.16, -10.9, 0.3, -0.25, 0, 0.25, 0);          // logs
  b.slab(0x5a3820, 0.95, 0.16, 0.16, -10.9, 0.3, 0.25, 0, -0.3, 0);
  b.slab(0x4a2a14, 0.9, 0.15, 0.15, -10.9, 0.46, 0, 0, 0.05, 0);
  [[0, 0.7], [-0.25, 0.5], [0.25, 0.5], [0, 0.4]].forEach(([dz, h], i) => {
    b.cone(i < 3 ? C.flame : C.flameLight, 0.3, h, -10.9, 0.52, dz);
  });
  b.cone(C.flameLight, 0.16, 0.4, -10.9, 0.55, 0.1);
  [-0.4, -0.2, 0.15, 0.35].forEach((dz) => b.dot(0xff3b1f, 0.08, -10.88, 0.2, dz));
  wbox(b, 'w', C.wood, 0, 1.52, 3.2, 0.1, 1.15, 0.32);                        // mantel
  wbox(b, 'w', C.gold, 0, 1.48, 3.26, 0.04, 1.15, 0.36);
  [-1.2, 1.2].forEach((u) => {
    const [cx] = wpos('w', u, 1.15);
    b.cyl(C.gold, 0.1, 0.34, cx, 1.62, u);
    b.cyl(C.ivory, 0.05, 0.16, cx, 1.96, u);
    b.dot(C.flameLight, 0.07, cx, 2.16, u);
  });
  [-0.55, 0.55].forEach((u, i) => {
    const [cx] = wpos('w', u, 1.15);
    b.ball(0xf3f6fb, 0.24, cx, 1.76, u, 1.1);
    b.cyl(C.blue, 0.13, 0.04, cx, 1.9, u);
    [0xf2a6b8, 0xc4162a, 0xffe08a].forEach((col, k) => b.dot(col, 0.1, cx + (k - 1) * 0.05, 2.03 + k * 0.03, u + (k - 1) * 0.04 + (i ? 0.05 : -0.05)));
  });
  const [clx] = wpos('w', 0, 1.15);                                           // carriage clock
  b.box(C.gold, 0.14, 0.26, 0.3, clx, 1.62, 0);
  b.dot(C.white, 0.14, clx + 0.08, 1.76, 0);
  art(b, 0, 'w', 0, 1.8, 2.1, 1.35, 'mirror', { off: 1.0 });                  // mirror above the mantel
  [-2.1, 2.1].forEach((z) => {                                                // flanking columns
    b.cyl(C.marbleDark, 0.5, 0.15, -11.5, 0, z);
    b.cyl(C.gold, 0.44, 0.08, -11.5, 0.15, z);
    b.cyl(C.marble, 0.36, 2.9, -11.5, 0.23, z);
    b.cyl(C.gold, 0.44, 0.1, -11.5, 3.13, z);
    b.box(C.gold, 0.5, 0.1, 0.5, -11.5, 3.23, z);
    block(-11.75, -11.25, z - 0.25, z + 0.25, 0, 3.5);
  });
  roundRug(b, 0, -9.4, 0, 3.4);
  sofa(b, 0, -9.4, -1.9, 'w', 1.05, 0.95);
  sofa(b, 0, -9.4, 1.9, 'w', 1.05, 0.95);
  solidBox(b, plan, C.gold, -9.3, 0, 0.18, 0.18, 0.5, 0);                     // little tea table
  b.cyl(C.gold, 0.6, 0.04, -9.3, 0.5, 0);
  b.cyl(C.marble, 0.56, 0.03, -9.3, 0.54, 0);
  b.cyl(C.ivory, 0.1, 0.07, -9.3, 0.57, 0);
}
function piano(b) {
  const x = -9.2;
  b.box(C.black, 1.5, 0.3, 1.25, x, 0.7, -5.525);                             // grand piano
  b.cyl(C.black, 1.5, 0.3, x, 0.7, -6.15);
  b.box(C.gold, 1.52, 0.03, 1.27, x, 0.7, -5.525);
  b.cyl(C.gold, 1.52, 0.03, x, 0.7, -6.15);
  b.box(C.black, 1.4, 0.05, 1.4, x, 1.0, -5.5);
  b.slab(C.black, 1.45, 0.05, 1.9, x - 0.45, 1.5, -5.7, 0, 0, 0.8);           // lid, propped open
  b.box(C.gold, 0.04, 0.5, 0.04, x + 0.5, 1.0, -5.1);
  b.box(C.ivory, 1.3, 0.06, 0.3, x, 0.9, -4.78);                              // keys
  for (let i = 0; i < 9; i++) b.box(C.black, 0.06, 0.04, 0.17, x - 0.55 + i * 0.138, 0.96, -4.85);
  b.box(C.woodMid, 1.0, 0.42, 0.04, x, 1.05, -5.0);                           // music stand and score
  b.box(C.ivory, 0.8, 0.3, 0.01, x, 1.1, -5.03);
  [[-0.65, -4.95], [0.65, -4.95], [0, -6.7]].forEach(([dx, z]) => { b.cyl(C.gold, 0.12, 0.7, x + dx, 0, z); b.cyl(C.goldLight, 0.17, 0.05, x + dx, 0, z); });
  block(x - 0.75, x + 0.75, -6.9, -4.6, 0, 1.05);
  stool(b, 0, x, -3.95, Math.PI);
}
function easel(b) {                                // standing menu board by the door
  const x = 3.7;
  const z = 6.5;
  b.slab(C.woodLight, 0.05, 1.5, 0.05, x - 0.4, 0.75, z - 0.2, -0.25, 0, 0);
  b.slab(C.woodLight, 0.05, 1.5, 0.05, x + 0.4, 0.75, z - 0.2, -0.25, 0, 0);
  b.box(C.gold, 1.06, 1.56, 0.06, x, 0.5, z);
  b.box(C.black, 0.92, 1.42, 0.03, x, 0.57, z + 0.035);
  b.box(C.gold, 0.7, 0.05, 0.02, x, 1.78, z + 0.055);
  b.box(C.gold, 0.5, 0.05, 0.02, x, 1.9, z + 0.055);
  const r = rng(5);
  for (let i = 0; i < 8; i++) {
    b.box(C.cream, 0.45 + r() * 0.25, 0.03, 0.02, x - 0.04, 1.62 - i * 0.14, z + 0.055);
    b.box(C.gold, 0.1, 0.03, 0.02, x + 0.33, 1.62 - i * 0.14, z + 0.055);
  }
  block(x - 0.55, x + 0.55, z - 0.3, z + 0.1, 0, 2.1);
}
function flowerStand(b, x, z) {
  b.cyl(C.marbleDark, 0.42, 0.1, x, 0, z);
  b.cyl(C.marble, 0.3, 0.8, x, 0.1, z);
  b.cyl(C.gold, 0.4, 0.06, x, 0.9, z);
  b.ball(0xf3f6fb, 0.5, x, 1.2, z, 1.1);
  b.cyl(C.blue, 0.26, 0.05, x, 1.42, z);
  const r = rng(21);
  const cols = [0xf2a6b8, 0xc4162a, 0xffffff, 0xffe08a, 0xc9a0e8];
  for (let i = 0; i < 14; i++) {
    const a = r() * 6.28;
    const rr = r() * 0.3;
    b.dot(cols[i % 5], 0.15, x + Math.cos(a) * rr, 1.62 + r() * 0.35, z + Math.sin(a) * rr);
  }
  for (let i = 0; i < 6; i++) b.dot(C.green, 0.12, x + (r() - 0.5) * 0.7, 1.55 + r() * 0.2, z + (r() - 0.5) * 0.7);
  block(x - 0.25, x + 0.25, z - 0.25, z + 0.25, 0, 1.0);
}
function trolley(b, x, z) {                        // a gold tea trolley
  [[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]].forEach(([dx, dz]) => {
    b.cyl(C.gold, 0.04, 0.85, x + dx, 0.06, z + dz);
    b.dot(C.black, 0.13, x + dx, 0.07, z + dz);
  });
  [0.25, 0.78].forEach((y) => { b.box(C.marble, 1.1, 0.03, 0.6, x, y, z); b.box(C.gold, 1.14, 0.015, 0.64, x, y - 0.012, z); });
  b.box(C.gold, 0.05, 0.05, 0.6, x + 0.62, 0.85, z);
  b.box(C.gold, 0.2, 0.04, 0.04, x + 0.52, 0.9, z + 0.3);
  tea(b, x, 0.81, z, 1);
  b.cyl(C.ivory, 0.3, 0.05, x - 0.2, 0.28, z);
  b.ball(0xf4b6c8, 0.12, x - 0.2, 0.37, z);
  block(x - 0.62, x + 0.62, z - 0.34, z + 0.34, 0, 0.9);
}

// ---------- the ground floor ----------
function groundFloor(b) {
  const f = 0;
  parquet(b, f, -10.6, 9.0, -2.7, 7.0);
  runner(b, f, 0, -2.45, 7.9, 2.6);
  wallPanelling(b, f);
  cornice(b, f);
  // windows with velvet curtains (the north ones behind the bar are hidden by it)
  [-9.6, 9.6].forEach((u) => curtain(b, f, 'n', u, 3.2));
  [-9.6, -4.8, 4.8, 9.6].forEach((u) => curtain(b, f, 's', u, 3.2));
  [-6.2, 6.2].forEach((u) => { curtain(b, f, 'w', u, 2.4); curtain(b, f, 'e', u, 2.4); });
  // paintings and mirrors
  art(b, f, 's', -7.2, 1.3, 0.9, 1.5, 'landscape');
  art(b, f, 's', 7.2, 1.3, 0.9, 1.5, 'landscape');
  art(b, f, 's', -2.2, 1.0, 1.1, 1.8, 'mirror');
  art(b, f, 's', 2.2, 1.0, 1.1, 1.8, 'portrait');
  art(b, f, 'n', -7.2, 1.3, 0.8, 1.5, 'portrait');
  art(b, f, 'n', 7.1, 1.3, 0.8, 1.5, 'landscape');
  art(b, f, 'w', -3.5, 1.2, 1.6, 1.7, 'portrait');
  art(b, f, 'w', 3.5, 1.2, 1.6, 1.7, 'landscape');
  // pillars: a colonnade at the entrance and two beside the bar
  [[-3.0, 5.2], [3.0, 5.2], [-6.6, -2.4], [6.6, -2.4]].forEach(([x, z]) => pillar(b, f, x, z));
  // chandeliers
  chandelier(b, f, 0, 0.2, 1.1);
  chandelier(b, f, 0, 4.4, 1.0);
  // the bar, pastry case, fireplace, piano
  bar(b);
  pastryCase(b);
  fireplace(b);
  piano(b);
  // 6 round tea tables with velvet chairs
  const along = [[-1, 0], [1, 0]];
  roundTable(b, f, -5.6, 0.6, along, 0);
  roundTable(b, f, -5.6, 3.2, along, 1);
  roundTable(b, f, 5.6, 0.6, along, 2);
  roundTable(b, f, 5.6, 3.2, along, 3);
  roundTable(b, f, -9.0, 3.4, along, 4);
  roundTable(b, f, 7.7, 2.0, along, 5);
  // two sofa booths along the south windows
  [-8.2, 8.2].forEach((bx) => {
    rectRug(b, f, bx, 6.1, 3.4, 2.3);
    sofa(b, f, bx, 7.45, 'n', 3.6, 0.95);
    rectTable(b, f, bx, 6.15, 1.8, 0.9);
    tea(b, bx, 0.8, 6.15, 2);
    vchair(b, f, bx - 0.7, 5.1, 0);
    vchair(b, f, bx + 0.7, 5.1, 0);
  });
  easel(b);
  flowerStand(b, -3.4, 7.25);
  trolley(b, 8.2, -1.2);
}

// ---------- floor 1 ----------
function library(b, f) {                           // a wall of books along the north wall
  const T = top(f);
  const x0 = -11.8;
  const x1 = 7.9;
  const bays = 6;
  const bw = (x1 - x0) / bays;
  block(x0, x1, -8, -7.35, T, T + 3.3);
  wbox(b, 'n', C.wood, (x0 + x1) / 2, T, x1 - x0, 3.05, 0.06, 0.1);
  wbox(b, 'n', C.gold, (x0 + x1) / 2, T + 3.05, x1 - x0 + 0.2, 0.2, 0.3, 0.6);
  wbox(b, 'n', C.goldDark, (x0 + x1) / 2, T + 3.0, x1 - x0 + 0.1, 0.05, 0.3, 0.55);
  const r = rng(77);
  const bookCols = [0x7b1c2e, 0x1c2a6b, 0x2f6b3a, 0x5a3820, 0x8a6a1a, 0x4a2a4a, 0xa33a2a, 0x2a4a5a, 0xcfbf9a];
  for (let k = 0; k <= bays; k++) {                                           // gold-capped dividers
    const u = x0 + k * bw;
    wbox(b, 'n', C.woodMid, u, T, 0.3, 3.0, 0.35, 0.7);
    wbox(b, 'n', C.gold, u, T + 2.94, 0.36, 0.1, 0.35, 0.76);
    wbox(b, 'n', C.gold, u, T, 0.36, 0.1, 0.35, 0.76);
  }
  for (let k = 0; k < bays; k++) {
    const a = x0 + k * bw + 0.15;
    const e = x0 + (k + 1) * bw - 0.15;
    for (let i = 0; i < 2; i++) {                                             // cabinet doors under the shelves
      const u = a + (e - a) * (0.25 + i * 0.5);
      wbox(b, 'n', C.burgundyDark, u, T + 0.08, (e - a) / 2 - 0.08, 0.78, 0.5, 0.06);
      wbox(b, 'n', C.gold, u, T + 0.05, (e - a) / 2 - 0.02, 0.84, 0.48, 0.04);
      wbox(b, 'n', C.goldLight, u + (i ? -0.2 : 0.2), T + 0.45, 0.07, 0.07, 0.55, 0.06);
    }
    [0.92, 1.42, 1.92, 2.42].forEach((sy, si) => {                            // shelves with books
      wbox(b, 'n', C.wood, (a + e) / 2, T + sy, e - a, 0.04, 0.3, 0.5);
      let x = a + 0.03;
      while (x < e - 0.12) {
        const w = 0.07 + r() * 0.1;
        const h = 0.3 + r() * 0.15;
        const col = bookCols[Math.floor(r() * bookCols.length)];
        const [px, pz] = wpos('n', x + w / 2, 0.3);
        b.box(col, w, h, 0.3, px, T + sy + 0.04, pz);
        if (r() > 0.6) b.box(C.gold, w + 0.005, 0.02, 0.31, px, T + sy + 0.04 + h * 0.7, pz);
        x += w + 0.005;
      }
      if (si === 2 && k % 2 === 0) {                                          // a few ornaments
        const [px, pz] = wpos('n', (a + e) / 2, 0.3);
        b.ball(C.gold, 0.2, px, T + sy + 0.16, pz);
      }
    });
  }
  const lx = -2.2;                                                            // rolling ladder
  [-0.28, 0.28].forEach((dx) => b.slab(C.woodLight, 0.06, 3.0, 0.06, lx + dx, T + 1.5, -7.2, -0.1, 0, 0));
  for (let i = 0; i < 9; i++) b.box(C.woodLight, 0.56, 0.04, 0.06, lx, T + 0.3 + i * 0.32, -7.05 - i * 0.032);
  b.box(C.gold, 0.7, 0.05, 0.05, lx, T + 3.0, -7.4);
}
function globe(b, f, x, z) {
  const T = top(f);
  b.cyl(C.woodLight, 0.6, 0.08, x, T, z);
  b.cyl(C.gold, 0.08, 0.85, x, T + 0.08, z);
  b.ball(0x2a5a8a, 0.7, x, T + 1.3, z);
  [[0.2, 0.1, 0.15], [-0.15, -0.05, 0.25], [0.05, 0.25, -0.2]].forEach(([dx, dy, dz]) => b.dot(0x4a8a4a, 0.22, x + dx, T + 1.3 + dy, z + dz));
  b.cyl(C.gold, 0.08, 0.1, x, T + 1.65, z);
  block(x - 0.3, x + 0.3, z - 0.3, z + 0.3, T, T + 1.0);
}
function chess(b, f, x, z) {
  const T = top(f);
  solidBox(b, plan, C.gold, x, z, 0.14, 0.14, 0.7, f);
  b.cyl(C.wood, 0.6, 0.05, x, T, z);
  b.box(C.wood, 1.0, 0.05, 1.0, x, T + 0.7, z);
  b.box(C.gold, 1.06, 0.03, 1.06, x, T + 0.69, z);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) b.box((i + j) % 2 ? C.parquetA : C.cream, 0.1, 0.012, 0.1, x - 0.35 + i * 0.1, T + 0.75, z - 0.35 + j * 0.1);
  const back = [C.ivory, C.black];                                            // pieces
  [[0, -0.3], [1, 0.3]].forEach(([side, dz]) => {
    for (let i = 0; i < 8; i += 2) {
      b.cyl(back[side], 0.06, 0.07, x - 0.35 + i * 0.1, T + 0.762, z + dz * 0.8);
      b.dot(back[side], 0.06, x - 0.35 + i * 0.1, T + 0.86, z + dz * 0.8);
    }
    b.cyl(back[side], 0.07, 0.12, x - 0.05, T + 0.762, z + dz);
    b.cyl(C.gold, 0.04, 0.03, x - 0.05, T + 0.882, z + dz);
  });
  block(x - 0.5, x + 0.5, z - 0.5, z + 0.5, T, T + 0.8);
  vchair(b, f, x, z - 0.95, 0);
  vchair(b, f, x, z + 0.95, Math.PI);
}
function readingDesk(b, f, x, z) {
  const T = top(f);
  rectTable(b, f, x, z, 1.8, 0.9);
  b.box(C.green, 0.3, 0.12, 0.2, x - 0.5, T + 0.77, z);                       // banker's lamp
  b.box(C.gold, 0.06, 0.2, 0.06, x - 0.5, T + 0.77, z - 0.05);
  b.box(C.black, 0.7, 0.012, 0.5, x + 0.2, T + 0.77, z);                      // open book
  b.box(C.ivory, 0.3, 0.02, 0.4, x + 0.05, T + 0.78, z);
  b.box(C.ivory, 0.3, 0.02, 0.4, x + 0.37, T + 0.78, z);
  vchair(b, f, x, z + 0.95, Math.PI);
}
function balcony(b, f) {                           // a seating row facing the windows, behind a gold balustrade
  const T = top(f);
  const ranges = [[-11.5, -3.0]];
  ranges.forEach(([xa, xb]) => {
    const w = xb - xa;
    const cx = (xa + xb) / 2;
    b.box(C.gold, w, 0.1, 0.22, cx, T + 0.95, 7.3);                            // top rail
    b.box(C.marble, w, 0.14, 0.26, cx, T, 7.3);                                // base rail
    b.box(C.marble, w, 0.12, 0.2, cx, T + 0.14, 7.3);
    for (let x = xa + 0.15; x < xb; x += 0.28) {
      b.cyl(C.ivory, 0.1, 0.66, x, T + 0.26, 7.3);
      b.cyl(C.gold, 0.13, 0.04, x, T + 0.26, 7.3);
      b.cyl(C.gold, 0.13, 0.04, x, T + 0.88, 7.3);
    }
    [xa, xb, cx].forEach((x) => { b.box(C.marble, 0.3, 1.1, 0.3, x, T, 7.3); b.ball(C.gold, 0.22, x, T + 1.22, 7.3); });
    for (let x = xa + 1.0; x < xb - 0.6; x += 2.0) {                           // flower boxes on the rail
      b.box(C.woodMid, 0.6, 0.15, 0.24, x, T + 1.05, 7.3);
      b.box(C.green, 0.55, 0.08, 0.2, x, T + 1.2, 7.3);
      [0xf2a6b8, 0xc4162a, 0xffe08a, 0xffffff].forEach((col, i) => b.dot(col, 0.1, x - 0.2 + i * 0.13, T + 1.3, 7.3));
    }
    block(xa - 0.15, xb + 0.15, 7.15, 7.45, T, T + 1.1);
  });
  [-10.0, -8.0, -6.0, -4.0].forEach((x) => vchair(b, f, x, 6.4, 0));
  [-9.0, -7.0, -5.0].forEach((x) => {                                         // tiny tables between the chairs
    b.cyl(C.gold, 0.1, 0.4, x, T, 6.4);
    b.cyl(C.marble, 0.46, 0.04, x, T + 0.4, 6.4);
    b.cyl(C.gold, 0.48, 0.02, x, T + 0.38, 6.4);
    b.cyl(C.ivory, 0.1, 0.07, x, T + 0.44, 6.4);
  });
}
function staffRoom(b, f) {
  const T = top(f);
  const wallCol = 0xeadcc0;
  const part = (x0, x1, z0, z1) => {              // a partition wall, drawn with panelling on both faces
    const w = x1 - x0;
    const d = z1 - z0;
    b.box(wallCol, w, 3.5, d, (x0 + x1) / 2, T, (z0 + z1) / 2);
    b.box(C.gold, w + (w > d ? 0.04 : 0), 0.06, d + (d > w ? 0.04 : 0), (x0 + x1) / 2, T + 3.35, (z0 + z1) / 2);
    block(x0, x1, z0, z1, T, T + 3.5);
  };
  part(8.1, 12, 4.15, 4.35);                      // north partition (the doorway is x 6.8 to 8.1)
  part(6.6, 6.8, 4.15, 8);                        // west partition
  b.box(C.woodMid, 3.9, 0.95, 0.04, 10.05, T, 4.37);                           // panelling inside the room
  b.box(C.gold, 3.9, 0.05, 0.05, 10.05, T + 0.95, 4.37);
  b.box(C.woodMid, 0.04, 0.95, 3.6, 6.82, T, 6.17);
  b.box(C.gold, 0.05, 0.05, 3.6, 6.82, T + 0.95, 6.17);
  [6.85, 8.05].forEach((x) => b.box(C.gold, 0.12, 2.55, 0.34, x, T, 4.25));      // gold archway
  b.box(C.gold, 1.4, 0.16, 0.34, 7.45, T + 2.45, 4.25);
  b.box(C.goldDark, 1.1, 0.08, 0.36, 7.45, T + 2.37, 4.25);
  b.box(C.velvet, 1.1, 0.4, 0.08, 7.45, T + 2.7, 4.12);
  b.box(C.gold, 0.7, 0.14, 0.04, 7.45, T + 2.83, 4.09);                        // little name plate
  b.cyl(C.gold, 0.3, 0.05, 7.45, T + 2.62, 4.0);
  curtain(b, f, 's', 9.6, 3.2);
  rectRug(b, f, 8.7, 6.4, 3.4, 2.6);
  addBed(b, plan, 10.6, 6.7, f, 0, C.woodMid, C.velvet);                      // the staff bed
  b.slab(C.gold, 1.3, 0.04, 0.06, 10.6, T + 1.0, 5.62, 0, 0, 0);
  [-0.6, 0.6].forEach((dx) => b.dot(C.goldLight, 0.1, 10.6 + dx, T + 1.0, 5.62));
  solidBox(b, plan, C.woodMid, 9.4, 5.85, 0.45, 0.45, 0.6, f);                  // bedside table with a lamp
  b.cyl(C.gold, 0.1, 0.22, 9.4, T + 0.6, 5.85);
  b.cone(C.cream, 0.26, 0.2, 9.4, T + 0.78, 5.85);
  for (let i = 0; i < 3; i++) {                                                // a row of lockers
    const x = 9.55 + i * 0.9;
    solidBox(b, plan, C.burgundy, x, 4.62, 0.86, 0.5, 2.0, f);
    b.box(C.gold, 0.7, 1.8, 0.02, x, T + 0.1, 4.875);
    b.box(C.burgundyDark, 0.62, 1.7, 0.03, x, T + 0.15, 4.88);
    b.box(C.gold, 0.1, 0.02, 0.03, x, T + 1.5, 4.9);
    b.dot(C.goldLight, 0.07, x + 0.25, T + 1.0, 4.9);
  }
  rectTable(b, f, 7.6, 6.5, 0.9, 0.9);                                         // small table and two chairs
  b.cyl(C.gold, 0.2, 0.3, 7.6, T + 0.77, 6.5);
  tea(b, 7.6, T + 0.77, 6.5, 0);
  vchair(b, f, 7.6, 5.55, 0);
  vchair(b, f, 6.95, 6.5, Math.PI / 2);
  solidBox(b, plan, C.wood, 8.9, 7.7, 1.4, 0.5, 0.85, f);                      // a dresser
  b.box(C.marble, 1.5, 0.05, 0.56, 8.9, T + 0.85, 7.7);
  [-0.35, 0.35].forEach((dx) => { b.box(C.burgundyDark, 0.6, 0.5, 0.03, 8.9 + dx, T + 0.15, 7.43); b.dot(C.goldLight, 0.06, 8.9 + dx, T + 0.4, 7.4); });
  chandelier(b, f, 9.2, 6.0, 0.6);
}
function lounge(b, f) {
  const T = top(f);
  parquet(b, f, -10.6, 9.0, -5.6, 4.0);
  rectRug(b, f, 0, 0.9, 8.0, 5.6);
  sofa(b, f, 0, -0.6, 's', 2.8, 0.95);
  sofa(b, f, -2.3, 1.0, 'e', 2.2, 0.95);
  sofa(b, f, 2.3, 1.0, 'w', 2.2, 0.95);
  sofa(b, f, -1.0, 2.6, 'n', 1.1, 0.95, C.velvetLight);
  sofa(b, f, 1.0, 2.6, 'n', 1.1, 0.95, C.velvetLight);
  solidBox(b, plan, C.gold, 0, 1.0, 0.2, 0.2, 0.4, f);                         // low marble table
  b.box(C.goldDark, 2.0, 0.05, 0.95, 0, T + 0.38, 1.0);
  b.box(C.marble, 2.2, 0.06, 1.1, 0, T + 0.42, 1.0);
  b.box(C.gold, 2.26, 0.025, 1.16, 0, T + 0.41, 1.0);
  block(-1.1, 1.1, 0.45, 1.55, T, T + 0.5);
  [[-0.9, 0.3], [0.9, 1.7]].forEach(([dx, dz]) => b.cyl(C.gold, 0.07, 0.4, dx, T, dz));
  tea(b, 0, T + 0.48, 1.0, 1);
  b.cyl(C.gold, 0.14, 0.22, 0.7, T + 0.48, 1.2);
  [0xf2a6b8, 0xffe08a, 0xffffff].forEach((col, i) => b.dot(col, 0.13, 0.65 + i * 0.05, T + 0.76 + (i % 2) * 0.05, 1.2));
  chandelier(b, f, 0, 1.0, 1.15);
  chandelier(b, f, 0, -4.6, 0.9);
  pillar(b, f, -6.2, -3.2);
  pillar(b, f, 6.2, -3.2);
  pillar(b, f, -6.2, 3.2);
  library(b, f);
  readingDesk(b, f, 4.0, -5.9);
  globe(b, f, -10.4, -6.3);
  chess(b, f, -8.2, 0.9);
  balcony(b, f);
  staffRoom(b, f);
  // grandfather clock on the west wall
  solidBox(b, plan, C.wood, -11.5, -3.0, 0.55, 0.4, 2.6, f);
  b.box(C.gold, 0.6, 0.08, 0.46, -11.5, T + 2.6, -3.0);
  b.box(C.gold, 0.4, 0.04, 0.02, -11.28, T + 0.2, -3.0);
  b.box(C.black, 0.34, 0.5, 0.02, -11.27, T + 0.5, -3.0);
  b.cyl(C.gold, 0.3, 0.03, -11.28, T + 2.0, -3.0);
  b.dot(C.white, 0.34, -11.26, T + 2.15, -3.0, 0.1);
  b.box(C.gold, 0.02, 0.1, 0.02, -11.25, T + 2.2, -3.0);
  b.cyl(C.gold, 0.12, 0.3, -11.5, T + 2.68, -3.0);
  // statue on a pedestal at the top of the stairs
  b.cyl(C.marbleDark, 0.55, 0.9, 11.3, T, -7.2);
  b.cyl(C.gold, 0.6, 0.06, 11.3, T + 0.9, -7.2);
  b.cyl(C.goldDark, 0.3, 0.6, 11.3, T + 0.96, -7.2);
  b.ball(C.gold, 0.28, 11.3, T + 1.7, -7.2);
  b.cone(C.gold, 0.4, 0.5, 11.3, T + 1.56, -7.2);
  block(11.0, 11.6, -7.5, -6.9, T, T + 2.0);
  // curtains, paintings, panelling
  wallPanelling(b, f);
  cornice(b, f);
  [9.6].forEach((u) => curtain(b, f, 'n', u, 3.2));
  [-9.6, -4.8, 4.8].forEach((u) => curtain(b, f, 's', u, 3.2));
  [-6.2, 6.2].forEach((u) => { curtain(b, f, 'w', u, 2.4); curtain(b, f, 'e', u, 2.4); });
  curtain(b, f, 'w', 0, 3.2);
  art(b, f, 's', -7.2, 1.3, 0.9, 1.5, 'portrait');
  art(b, f, 's', 0, 1.2, 2.4, 1.7, 'landscape');
  art(b, f, 'w', 3.5, 1.2, 1.6, 1.7, 'portrait');
  art(b, f, 'e', 0, 1.1, 5.2, 2.2, 'portrait');                                 // the royal portrait above the stairwell
}

export function build(b, c) {
  shell(b, plan, {
    floor: 0xf0e6d0, floorAlt: 0xe4d7bb,
    wall: C.burgundy, ceiling: 0xf6ecd6,
    trim: C.gold, glass: C.glass
  });
  for (let k = 0; k < plan.stairs.length; k++) addStairs(b, plan, k, { stair: 0x4a2a16, tread: C.red, trim: C.gold });
  groundFloor(b);
  lounge(b, 1);
}
