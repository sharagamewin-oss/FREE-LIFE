// =====================================================
// INTERIOR: Cafe   (2 floors, joined by stairs)
// Floor 0: barista counter, coffee shelf, tables, window bench, menu board, pastry fridge.
// Floor 1: quiet lounge (sofas, bookshelf wall, small tables) and a staff area (bed + locker).
// Warm brown and cream. Helpers (see inside_common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './inside_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'serve', label: 'Serve customers', x: 0, z: -5.2, floor: 0 });

// ---------- palette ----------
const CREAM = 0xf3e6cf;
const CREAM2 = 0xe9d9b8;
const MILK = 0xfbf6ea;
const CARAMEL = 0xc89a63;
const WOOD = 0x8a5a3a;
const DARK = 0x5b3a22;
const MID = 0x7a4a2a;
const CHAIR = 0x6e4f33;
const TERRA = 0xb5653a;
const LEAF = 0x6f8f5a;
const LAMP = 0xffd98a;

// ---------- small helpers ----------
const DIR = { '+z': [0, 1], '-z': [0, -1], '+x': [1, 0], '-x': [-1, 0] };
const ANGLE = { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 };

// A box placed in the local space of a piece of furniture that faces `face`.
// u = sideways, v = toward the front, y = height above the floor top, du x dv = size across / front-back.
function lbox(b, T, face, cx, cz, color, du, h, dv, u, y, v) {
  const [fx, fz] = DIR[face];
  const rx = fz;
  const rz = -fx;
  const x = cx + u * rx + v * fx;
  const z = cz + u * rz + v * fz;
  const swap = Math.abs(fx) === 1;
  b.box(color, swap ? dv : du, h, swap ? du : dv, x, T + y, z);
}

// Solid footprint of a piece of furniture that faces `face`.
function lblock(face, cx, cz, du, dv, T, y0, y1) {
  const swap = Math.abs(DIR[face][0]) === 1;
  const w = swap ? dv : du;
  const d = swap ? du : dv;
  plan.blocks.push([cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2, T + y0, T + y1]);
}

// A sit spot on a sofa or bench (not drawn, the furniture is drawn separately).
function sitSpot(T, face, cx, cz, u, v, y = 0.5) {
  const [fx, fz] = DIR[face];
  plan.spots.push({ kind: 'sit', x: cx + u * fz + v * fx, y: T + y, z: cz - u * fx + v * fz, a: ANGLE[face] });
}

// A round-ish table (a box top plus a turned copy makes an octagon) with a pedestal. Solid.
function table(b, f, cx, cz, size = 1.1, color = WOOD, topColor = CARAMEL) {
  const T = plan.floors[f].top;
  b.box(DARK, 0.14, 0.68, 0.14, cx, T, cz);                                     // pedestal
  b.box(DARK, size * 0.6, 0.04, size * 0.6, cx, T, cz);                         // foot
  b.box(color, size, 0.05, size, cx, T + 0.69, cz);                             // top
  b.slab(topColor, size, 0.06, size, cx, T + 0.725, cz, 0, Math.PI / 4, 0);     // turned top
  plan.blocks.push([cx - size / 2, cx + size / 2, cz - size / 2, cz + size / 2, T, T + 0.76]);
}

// A table with two chairs facing each other across it (left and right of the table).
function tableSet(b, f, cx, cz, size = 1.1, gap = 0.95) {
  table(b, f, cx, cz, size);
  addChair(b, plan, cx - gap, cz, f, Math.PI / 2, CHAIR);     // looks toward +x
  addChair(b, plan, cx + gap, cz, f, -Math.PI / 2, CHAIR);    // looks toward -x
}

// A hanging lamp above (cx, cz).
function pendant(b, f, cx, cz) {
  const T = plan.floors[f].top;
  b.box(DARK, 0.02, 0.9, 0.02, cx, T + 2.5, cz);
  b.box(LAMP, 0.42, 0.18, 0.42, cx, T + 2.35, cz);
  b.box(CREAM, 0.46, 0.04, 0.46, cx, T + 2.53, cz);
}

// A pot plant (solid pot, leaves are just for looks).
function plant(b, f, cx, cz, h = 1.0) {
  const T = plan.floors[f].top;
  solidBox(b, plan, TERRA, cx, cz, 0.5, 0.5, 0.4, f);
  b.box(0x4a2f1c, 0.4, 0.03, 0.4, cx, T + 0.4, cz);
  b.box(LEAF, 0.1, h, 0.1, cx, T + 0.4, cz);
  b.box(LEAF, 0.55, 0.3, 0.12, cx, T + 0.4 + h * 0.5, cz);
  b.box(LEAF, 0.12, 0.3, 0.55, cx, T + 0.4 + h * 0.7, cz);
  b.box(0x82a56b, 0.4, 0.25, 0.4, cx, T + 0.4 + h, cz);
}

// A cushioned bench with a back cushion. `face` = the way you look when you sit on it.
function bench(b, f, face, cx, cz, len, spotsEvery = 1.8) {
  const T = plan.floors[f].top;
  lbox(b, T, face, cx, cz, DARK, len, 0.36, 0.8, 0, 0, 0);                      // wooden base
  lbox(b, T, face, cx, cz, CREAM, len - 0.1, 0.14, 0.72, 0, 0.36, 0.02);        // seat cushion
  lbox(b, T, face, cx, cz, CREAM2, len - 0.1, 0.5, 0.14, 0, 0.5, -0.33);        // back cushion
  lblock(face, cx, cz, len, 0.8, T, 0, 0.5);
  const n = Math.max(1, Math.floor(len / spotsEvery));
  for (let i = 0; i < n; i++) sitSpot(T, face, cx, cz, -len / 2 + (len * (i + 0.5)) / n, 0.05, 0.5);
}

// A sofa (seat, back and two arms made of boxes). Solid. Seats 2 (or 3 if it is long).
function sofa(b, f, face, cx, cz, len, color = CARAMEL, cushion = CREAM) {
  const T = plan.floors[f].top;
  const D = 0.95;
  lbox(b, T, face, cx, cz, color, len, 0.4, D, 0, 0, 0);                         // base
  lbox(b, T, face, cx, cz, cushion, len - 0.55, 0.14, 0.68, 0, 0.4, 0.1);        // seat cushion
  lbox(b, T, face, cx, cz, color, len, 0.62, 0.25, 0, 0.4, -(D - 0.25) / 2);     // back
  lbox(b, T, face, cx, cz, cushion, len - 0.6, 0.38, 0.14, 0, 0.54, -0.2);       // back cushion
  lbox(b, T, face, cx, cz, color, 0.25, 0.3, D - 0.25, -(len / 2 - 0.125), 0.4, 0.125);   // arms
  lbox(b, T, face, cx, cz, color, 0.25, 0.3, D - 0.25, len / 2 - 0.125, 0.4, 0.125);
  lbox(b, T, face, cx, cz, TERRA, 0.4, 0.4, 0.12, -len / 4, 0.54, -0.1);        // a pillow
  lblock(face, cx, cz, len, D, T, 0, 0.95);
  const n = len > 2.7 ? 3 : 2;
  for (let i = 0; i < n; i++) sitSpot(T, face, cx, cz, -len / 2 + (len * (i + 0.5)) / n, 0.1, 0.55);
}

// A tall bookcase with rows of books on its front (it faces +z, standing against the north wall).
const BOOK_COLORS = [0x8a3b2e, 0x2f5d62, 0xd9b36a, 0x4a3a6a, 0x6f8f5a, 0xb5653a, 0x3a3a3a, 0xe6d3a8];
const BOOK_W = [0.08, 0.11, 0.09, 0.12, 0.07, 0.1];
const BOOK_H = [0.34, 0.42, 0.3, 0.38, 0.36, 0.4];
function bookcase(b, f, cx, cz, w, seed = 0) {
  const T = plan.floors[f].top;
  solidBox(b, plan, DARK, cx, cz, w, 0.45, 2.5, f);
  const front = cz + 0.225;
  const rows = [0.12, 0.66, 1.2, 1.74];
  rows.forEach((y, r) => {
    b.box(MID, w - 0.1, 0.05, 0.12, cx, T + y - 0.05 + 0.0, front);                // the board
    let x = cx - w / 2 + 0.12;
    let i = seed + r * 7;
    while (x < cx + w / 2 - 0.2) {
      const bw = BOOK_W[i % BOOK_W.length];
      const bh = BOOK_H[(i * 3) % BOOK_H.length];
      b.box(BOOK_COLORS[(i * 5) % BOOK_COLORS.length], bw, bh, 0.18, x + bw / 2, T + y, front - 0.02);
      x += bw + 0.015;
      i++;
    }
  });
  b.box(MID, w, 0.06, 0.5, cx, T + 2.5, cz);                                       // top board
}

export function build(b, c) {
  shell(b, plan, { floor: 0xc89a63, floorAlt: 0xb98650, wall: 0xf3e6cf, ceiling: 0xfbf6ea, trim: 0x7a4a2a });
  for (let k = 0; k < plan.stairs.length; k++) addStairs(b, plan, k);

  // =====================================================
  // FLOOR 0: the cafe
  // =====================================================
  const T0 = plan.floors[0].top;

  // ---- barista counter (the job spot is behind it at z -5.2) ----
  const CZ = -3.6;
  solidBox(b, plan, MID, 0, CZ, 9, 0.9, 1.0, 0);
  b.box(CREAM, 9.3, 0.06, 1.15, 0, T0 + 1.0, CZ + 0.05);                           // cream counter top
  b.box(DARK, 8.6, 0.75, 0.05, 0, T0 + 0.12, CZ + 0.47);                           // front panel
  b.box(CARAMEL, 8.6, 0.06, 0.07, 0, T0 + 0.9, CZ + 0.47);                         // front trim
  const TOP = T0 + 1.06;

  // coffee machine
  b.box(0xb9b3a8, 0.8, 0.5, 0.5, -2.8, TOP, CZ - 0.1);
  b.box(0x3b2a20, 0.84, 0.14, 0.54, -2.8, TOP + 0.5, CZ - 0.1);
  b.box(0x2a2a2a, 0.12, 0.14, 0.12, -3.0, TOP + 0.08, CZ + 0.15);
  b.box(0x2a2a2a, 0.12, 0.14, 0.12, -2.6, TOP + 0.08, CZ + 0.15);
  b.box(0x3b2a20, 0.7, 0.03, 0.2, -2.8, TOP, CZ + 0.2);                            // drip tray
  // grinder
  b.box(0x3b2a20, 0.28, 0.5, 0.28, -1.9, TOP, CZ - 0.2);
  b.box(CARAMEL, 0.34, 0.16, 0.34, -1.9, TOP + 0.5, CZ - 0.2);
  // cups, a stack of saucers, a till
  [[-1.1, 0], [-0.85, 0.05], [-0.6, -0.05], [-0.3, 0.05], [0.0, 0]].forEach(([x, dz], i) => {
    b.box(i % 2 ? CREAM : MILK, 0.12, 0.1, 0.12, x, TOP, CZ + dz);
  });
  b.box(MILK, 0.3, 0.08, 0.3, 0.55, TOP, CZ - 0.05);
  b.box(CREAM2, 0.26, 0.06, 0.26, 0.55, TOP + 0.08, CZ - 0.05);
  b.box(0x2f2f2f, 0.4, 0.2, 0.3, 1.3, TOP, CZ - 0.1);
  // cake display case
  b.box(CREAM, 1.5, 0.1, 0.7, 3.0, TOP, CZ);
  b.box(0xe8a0b0, 0.3, 0.2, 0.3, 2.55, TOP + 0.1, CZ - 0.05);
  b.box(0x6b3f2a, 0.3, 0.2, 0.3, 2.95, TOP + 0.1, CZ - 0.05);
  b.box(0xf0d9a0, 0.3, 0.2, 0.3, 3.35, TOP + 0.1, CZ - 0.05);
  [[-0.72, -0.32], [0.72, -0.32], [-0.72, 0.32], [0.72, 0.32]].forEach(([dx, dz]) => {
    b.box(DARK, 0.04, 0.42, 0.04, 3.0 + dx, TOP + 0.1, CZ + dz);                    // frame posts
  });
  b.box(0xd6efff, 1.5, 0.03, 0.7, 3.0, TOP + 0.52, CZ);                            // glass lid
  b.box(0xd6efff, 1.46, 0.3, 0.02, 3.0, TOP + 0.12, CZ + 0.33);                    // glass front

  // ---- back shelf with coffee jars (north wall, behind the counter) ----
  const SZ = -7.65;
  solidBox(b, plan, DARK, 0, SZ, 7, 0.4, 0.12, 0);                                 // plinth (solid)
  plan.blocks.push([-3.5, 3.5, SZ - 0.2, SZ + 0.2, T0 + 0.12, T0 + 2.2]);
  b.box(DARK, 0.08, 2.2, 0.4, -3.5, T0, SZ);
  b.box(DARK, 0.08, 2.2, 0.4, 3.5, T0, SZ);
  b.box(MID, 7, 2.2, 0.06, 0, T0, SZ - 0.17);                                      // back panel
  [0.62, 1.22, 1.82].forEach((y, r) => {
    b.box(WOOD, 7, 0.05, 0.4, 0, T0 + y - 0.05, SZ);                               // shelf board
    for (let x = -3.2, i = r; x <= 3.21; x += 0.55, i++) {
      const jarH = 0.26 + ((i * 3) % 3) * 0.04;
      b.box(i % 2 ? CREAM : 0xd9c3a0, 0.28, jarH, 0.28, x, T0 + y, SZ + 0.02);     // glass-ish jar
      b.box(i % 3 === 0 ? DARK : 0x3b2a20, 0.22, jarH * 0.7, 0.22, x, T0 + y, SZ + 0.02);   // coffee beans
      b.box(WOOD, 0.3, 0.05, 0.3, x, T0 + y + jarH, SZ + 0.02);                    // lid
    }
  });
  b.box(DARK, 7.16, 0.08, 0.44, 0, T0 + 2.2, SZ);                                  // top board

  // ---- menu board (north wall) ----
  b.box(WOOD, 3.6, 1.9, 0.06, -8.3, T0 + 1.05, -7.86);
  b.box(0x2f3a33, 3.4, 1.7, 0.04, -8.3, T0 + 1.15, -7.82);
  b.box(CREAM, 2.0, 0.06, 0.02, -8.3, T0 + 2.5, -7.79);                            // title
  [0, 1, 2, 3, 4].forEach((i) => {
    b.box(CREAM2, 1.5 + (i % 2) * 0.4, 0.04, 0.02, -8.55 + (i % 2) * 0.2, T0 + 2.15 - i * 0.22, -7.79);
    b.box(CARAMEL, 0.35, 0.04, 0.02, -7.1, T0 + 2.15 - i * 0.22, -7.79);           // price
  });

  // ---- pastry display fridge ----
  const FX = 6.8;
  const FZ = -7.3;
  solidBox(b, plan, CREAM2, FX, FZ, 2.2, 1.1, 1.8, 0);
  b.box(0x3a2a20, 1.9, 1.4, 0.03, FX, T0 + 0.25, FZ + 0.55);                       // dark inside
  [0.5, 0.95, 1.4].forEach((y, r) => {
    b.box(MILK, 1.9, 0.03, 0.4, FX, T0 + y, FZ + 0.72);                            // glass shelf
    [-0.75, -0.35, 0.05, 0.45, 0.8].forEach((dx, i) => {
      const col = [0xd9a35b, 0xe8a0b0, 0x6b3f2a, 0xf0d9a0, 0xc77b4a][(i + r) % 5];
      b.box(col, 0.26, 0.12, 0.22, FX + dx, T0 + y + 0.03, FZ + 0.72);             // pastries
    });
  });
  b.box(0xd6efff, 0.04, 1.45, 0.04, FX - 0.95, T0 + 0.25, FZ + 0.9);               // glass frame
  b.box(0xd6efff, 0.04, 1.45, 0.04, FX + 0.95, T0 + 0.25, FZ + 0.9);
  b.box(0xd6efff, 1.9, 0.04, 0.04, FX, T0 + 1.68, FZ + 0.9);
  b.box(DARK, 2.2, 0.1, 1.1, FX, T0 + 1.8, FZ);                                    // top
  b.box(TERRA, 1.6, 0.14, 0.05, FX, T0 + 1.62, FZ + 0.56);                         // sign strip

  // ---- tables (6) with 2 chairs each ----
  const tables = [[-8.2, -0.8], [-4.2, -0.8], [4.5, -0.8], [-7.4, 3.0], [-3.9, 3.6], [6.6, 3.0]];
  tables.forEach(([x, z]) => {
    tableSet(b, 0, x, z);
    pendant(b, 0, x, z);
    b.box(MILK, 0.1, 0.1, 0.1, x - 0.2, T0 + 0.76, z + 0.1);                      // a cup
    b.box(TERRA, 0.12, 0.14, 0.12, x + 0.2, T0 + 0.76, z - 0.1);                   // a little vase
  });

  // ---- cushioned window bench along the south wall (left and right of the door) ----
  bench(b, 0, '-z', -7.6, 7.55, 8.0);
  bench(b, 0, '-z', 6.4, 7.55, 5.6);

  // ---- plants beside the door ----
  plant(b, 0, -2.9, 7.4);
  plant(b, 0, 2.9, 7.4);

  // ---- a warm rug in front of the counter ----
  b.box(CREAM2, 6, 0.02, 1.6, 0, T0, -2.0);
  b.box(TERRA, 6, 0.025, 0.08, 0, T0, -2.8);
  b.box(TERRA, 6, 0.025, 0.08, 0, T0, -1.2);

  // =====================================================
  // FLOOR 1: a quiet lounge and the staff area
  // =====================================================
  const T1 = plan.floors[1].top;

  // ---- bookshelf wall (north) ----
  [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5].forEach((x, i) => bookcase(b, 1, x, -7.6, 3.0, i * 2));

  // ---- lounge: 3 sofas around a low table, on a rug ----
  const LX = 2.0;
  const LZ = 0.5;
  b.box(CREAM2, 5.8, 0.02, 4.0, LX, T1, LZ);
  b.box(TERRA, 5.8, 0.025, 0.1, LX, T1, LZ - 1.95);
  b.box(TERRA, 5.8, 0.025, 0.1, LX, T1, LZ + 1.95);
  solidBox(b, plan, MID, LX, LZ, 1.8, 1.0, 0.4, 1);                                // low table
  b.box(CARAMEL, 1.9, 0.05, 1.1, LX, T1 + 0.4, LZ);
  b.box(MILK, 0.12, 0.1, 0.12, LX - 0.3, T1 + 0.45, LZ);                           // cups
  b.box(CREAM, 0.12, 0.1, 0.12, LX + 0.3, T1 + 0.45, LZ + 0.1);
  sofa(b, 1, '+z', LX, LZ - 1.5, 2.2, CARAMEL, CREAM);       // north sofa, looks south
  sofa(b, 1, '+x', LX - 1.95, LZ, 2.4, WOOD, CREAM2);        // west sofa, looks east
  sofa(b, 1, '-x', LX + 1.95, LZ, 2.4, WOOD, CREAM2);        // east sofa, looks west
  // a standing lamp
  solidBox(b, plan, DARK, 5.2, -2.6, 0.2, 0.2, 0.06, 1);
  b.box(DARK, 0.06, 1.6, 0.06, 5.2, T1 + 0.06, -2.6);
  b.box(LAMP, 0.4, 0.3, 0.4, 5.2, T1 + 1.55, -2.6);

  // ---- 4 small tables with chairs ----
  [[7.6, -4.2], [7.6, 0.4], [7.6, 4.8], [-5.8, -4.2]].forEach(([x, z]) => {
    tableSet(b, 1, x, z, 0.85, 0.8);
    b.box(MILK, 0.1, 0.1, 0.1, x, T1 + 0.76, z);
  });

  // ---- staff area: a bed and a locker (south-west corner) ----
  b.box(0xa98860, 5.2, 0.02, 3.6, -6.4, T1, 5.6);                                  // staff rug
  addBed(b, plan, -5.6, 5.6, 1, 0, WOOD, 0xb5653a);
  solidBox(b, plan, MID, -4.4, 7.55, 0.6, 0.5, 0.55, 1);                           // bedside table
  b.box(LAMP, 0.2, 0.2, 0.2, -4.4, T1 + 0.55, 7.55);
  solidBox(b, plan, 0x7a8c82, -8.6, 7.6, 0.9, 0.55, 1.9, 1);                       // locker
  b.box(0x66786e, 0.02, 1.7, 0.02, -8.6, T1 + 0.1, 7.31);                          // door gap
  b.box(0xd9d2c0, 0.05, 0.2, 0.03, -8.78, T1 + 1.1, 7.31);                         // handles
  b.box(0xd9d2c0, 0.05, 0.2, 0.03, -8.42, T1 + 1.1, 7.31);
  b.box(0x8aa095, 0.9, 0.04, 0.55, -8.6, T1 + 1.9, 7.6);                           // locker top
  plant(b, 1, -3.2, 7.4, 0.8);
  plant(b, 1, 9.5, 7.3, 1.0);
}
