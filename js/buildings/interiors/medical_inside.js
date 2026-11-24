// =====================================================
// INTERIOR: Medical shop / pharmacy   (2 floors, joined by stairs)
// Floor 0: pharmacist counter, wall shelves of medicine boxes, 3 rows of customer shelves,
//          waiting bench (4 chairs), blood-pressure corner, green cross sign board.
// Floor 1: storage + compounding room, consultation room, staff room (bed + table).
// Clean white, green and teal. Helpers (see inside_common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './inside_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'counter', label: 'Pharmacist counter', x: 0, z: -5.2, floor: 0 });

// ---------- palette ----------
const WHITE = 0xf4faf6;
const MINT = 0xe3f1e8;
const GREEN = 0x2e9b5e;
const LGREEN = 0x8fd0a5;
const TEAL = 0x2a8f86;
const DTEAL = 0x1f6f68;
const STEEL = 0xc9d3ce;
const GRAY = 0x8d9a94;
const CARD = 0xcfa874;
const CHAIR = 0x2a8f86;
const MEDS = [0xe94f4f, 0xf2b134, 0x4aa3df, 0x7bc77b, 0xffffff, 0xb07ad0, 0xf08a4b, 0x2a8f86, 0xf5d0dc, 0xdfeee4];
const BW = [0.12, 0.16, 0.14, 0.18, 0.13];
const BH = [0.2, 0.26, 0.22, 0.3, 0.24];

// ---------- helpers ----------
// A green cross on a wall that faces +z (flat boxes).
function cross(b, cx, cy, cz, size, color) {
  b.box(color, size, size * 0.32, 0.04, cx, cy - size * 0.16, cz);
  b.box(color, size * 0.32, size, 0.04, cx, cy - size * 0.5, cz);
}

// Ceiling light panel.
function light(b, f, cx, cz) {
  const T = plan.floors[f].top;
  b.box(0xffffff, 1.4, 0.05, 0.4, cx, T + 3.43, cz);
}

// A pot plant (solid pot).
function plant(b, f, cx, cz, h = 0.9) {
  const T = plan.floors[f].top;
  solidBox(b, plan, WHITE, cx, cz, 0.5, 0.5, 0.4, f);
  b.box(0x4a3a2c, 0.4, 0.03, 0.4, cx, T + 0.4, cz);
  b.box(0x4f9a6a, 0.1, h, 0.1, cx, T + 0.4, cz);
  b.box(0x4f9a6a, 0.55, 0.3, 0.12, cx, T + 0.4 + h * 0.5, cz);
  b.box(0x4f9a6a, 0.12, 0.3, 0.55, cx, T + 0.4 + h * 0.7, cz);
  b.box(0x6fbf86, 0.4, 0.25, 0.4, cx, T + 0.4 + h, cz);
}

// A flat-topped round-ish table (box + turned copy), solid.
function table(b, f, cx, cz, size = 0.9, top = LGREEN) {
  const T = plan.floors[f].top;
  b.box(DTEAL, 0.12, 0.68, 0.12, cx, T, cz);
  b.box(DTEAL, size * 0.6, 0.04, size * 0.6, cx, T, cz);
  b.box(WHITE, size, 0.05, size, cx, T + 0.69, cz);
  b.slab(top, size, 0.06, size, cx, T + 0.725, cz, 0, Math.PI / 4, 0);
  plan.blocks.push([cx - size / 2, cx + size / 2, cz - size / 2, cz + size / 2, T, T + 0.76]);
}

// A bottle / flask on a surface at height y.
function bottle(b, cx, y, cz, color, h = 0.22, w = 0.1) {
  b.box(color, w, h, w, cx, y, cz);
  b.box(WHITE, w * 0.5, 0.05, w * 0.5, cx, y + h, cz);
  b.box(DTEAL, w * 0.6, 0.04, w * 0.6, cx, y + h + 0.05, cz);
}
function flask(b, cx, y, cz, color) {
  b.box(color, 0.16, 0.14, 0.16, cx, y, cz);
  b.box(color, 0.06, 0.12, 0.06, cx, y + 0.14, cz);
  b.box(0xffffff, 0.09, 0.03, 0.09, cx, y + 0.26, cz);
}

// A partition wall (solid, 2.4 m tall so it stays under the ceiling).
function partition(b, f, x0, x1, z0, z1) {
  const T = plan.floors[f].top;
  b.box(MINT, x1 - x0, 2.4, z1 - z0, (x0 + x1) / 2, T, (z0 + z1) / 2);
  b.box(TEAL, x1 - x0 + 0.04, 0.07, z1 - z0 + 0.04, (x0 + x1) / 2, T + 2.4, (z0 + z1) / 2);
  b.box(TEAL, x1 - x0 + 0.02, 0.12, z1 - z0 + 0.02, (x0 + x1) / 2, T, (z0 + z1) / 2);   // skirting
  plan.blocks.push([x0, x1, z0, z1, T, T + 2.4]);
}

// A row of small colour medicine boxes on a shelf board (front toward +z). Fills from x0 to x1.
function medRow(b, x0, x1, y, z, seed) {
  let x = x0 + 0.1;
  let i = seed;
  while (x < x1 - 0.12) {
    const w = BW[i % BW.length];
    const h = BH[(i * 3) % BH.length];
    b.box(MEDS[(i * 7) % MEDS.length], w, h, 0.2, x + w / 2, y, z);
    if (i % 3 === 0) b.box(WHITE, w * 0.8, 0.04, 0.21, x + w / 2, y + h * 0.55, z);     // a label stripe
    x += w + 0.025;
    i++;
  }
}

// A free-standing double-sided shop shelf. mode: 'aid' (first aid) | 'vit' (vitamins) | 'mix' | 'stock'.
function gondola(b, f, cx, cz, len, mode, h = 1.5) {
  const T = plan.floors[f].top;
  solidBox(b, plan, WHITE, cx, cz, len, 0.5, h, f);
  b.box(TEAL, len + 0.04, 0.1, 0.56, cx, T + h, cz);                               // cap
  const rows = [0.3, 0.75, 1.2];
  for (const side of [-1, 1]) {
    const zf = cz + side * 0.31;
    rows.forEach((y, r) => {
      if (y + 0.25 > h) return;
      b.box(STEEL, len - 0.04, 0.04, 0.13, cx, T + y - 0.04, zf);                  // shelf lip
      let x = cx - len / 2 + 0.15;
      let i = r * 5 + (side > 0 ? 3 : 0);
      while (x < cx + len / 2 - 0.15) {
        const k = mode === 'mix' ? (r % 2 ? 'vit' : 'aid') : mode;
        let w = 0.2;
        if (k === 'aid') {
          w = 0.2 + (i % 3) * 0.04;
          const col = [0xe94f4f, 0xffffff, GREEN, 0xf5d0dc, 0xffffff][i % 5];
          b.box(col, w, 0.16 + (i % 2) * 0.06, 0.1, x + w / 2, T + y, zf);          // first-aid boxes and kits
          if (col !== GREEN && col !== 0xe94f4f) b.box(0xe94f4f, 0.07, 0.07, 0.11, x + w / 2, T + y + 0.05, zf);
          else b.box(0xffffff, 0.07, 0.07, 0.11, x + w / 2, T + y + 0.05, zf);
        } else if (k === 'vit') {
          w = 0.11;
          const col = [0xf2b134, 0xf08a4b, 0x7bc77b, 0xf5d0dc, 0x4aa3df][i % 5];
          b.box(col, w, 0.2 + (i % 3) * 0.03, 0.1, x + w / 2, T + y, zf);           // vitamin bottles
          b.box(WHITE, w * 0.9, 0.04, 0.11, x + w / 2, T + y + 0.2 + (i % 3) * 0.03, zf);
        } else {
          w = 0.3 + (i % 3) * 0.06;
          b.box(i % 2 ? CARD : 0xe9d9b8, w, 0.28 + (i % 2) * 0.1, 0.16, x + w / 2, T + y, zf);   // stock cartons
        }
        x += w + 0.03;
        i++;
      }
    });
  }
}

// Wall stock unit (floor 1): tall shelf against the north wall with cartons.
function stockUnit(b, f, cx, cz, w, seed) {
  const T = plan.floors[f].top;
  solidBox(b, plan, MINT, cx, cz, w, 0.5, 2.4, f);
  b.box(TEAL, w, 0.06, 0.52, cx, T + 2.4, cz);
  const front = cz + 0.25;
  [0.12, 0.72, 1.32, 1.92].forEach((y, r) => {
    b.box(STEEL, w - 0.06, 0.05, 0.14, cx, T + y - 0.05, front);
    let x = cx - w / 2 + 0.1;
    let i = seed + r * 3;
    while (x < cx + w / 2 - 0.3) {
      const bw = [0.35, 0.5, 0.3, 0.45][i % 4];
      const bh = [0.32, 0.45, 0.38, 0.5][(i * 3) % 4];
      b.box([CARD, 0xe9d9b8, 0xdfeee4, LGREEN, 0xcfe9e4][(i * 5) % 5], bw, bh, 0.18, x + bw / 2, T + y, front - 0.02);
      x += bw + 0.04;
      i++;
    }
  });
}

export function build(b, c) {
  shell(b, plan, { floor: 0xdfe9e2, floorAlt: 0xcfdcd3, wall: 0xf2fbf4, ceiling: 0xffffff, trim: 0x4f9a6a });
  for (let k = 0; k < plan.stairs.length; k++) addStairs(b, plan, k);

  // =====================================================
  // FLOOR 0: the pharmacy
  // =====================================================
  const T0 = plan.floors[0].top;
  [-6, 0, 6].forEach((x) => [-1, 3].forEach((z) => light(b, 0, x, z)));

  // ---- pharmacist counter (job spot behind it at z -5.2) ----
  const CZ = -3.6;
  solidBox(b, plan, TEAL, 0, CZ, 9, 0.9, 1.0, 0);
  b.box(WHITE, 9.3, 0.06, 1.15, 0, T0 + 1.0, CZ + 0.05);                           // white counter top
  b.box(WHITE, 8.6, 0.75, 0.05, 0, T0 + 0.12, CZ + 0.47);                          // front panel
  b.box(GREEN, 8.6, 0.06, 0.07, 0, T0 + 0.9, CZ + 0.47);                           // green trim
  cross(b, 0, T0 + 0.75, CZ + 0.51, 0.5, GREEN);                                   // cross on the front
  const TOP = T0 + 1.06;
  // register
  b.box(0x3a4a45, 0.5, 0.16, 0.42, -2.6, TOP, CZ - 0.05);
  b.box(0x2f3a36, 0.34, 0.24, 0.04, -2.6, TOP + 0.16, CZ - 0.2);
  b.box(0x9fe0c0, 0.28, 0.16, 0.02, -2.6, TOP + 0.2, CZ - 0.17);                   // screen
  b.box(WHITE, 0.2, 0.18, 0.2, -1.95, TOP, CZ - 0.2);                              // receipt printer
  // medicine tray with boxes and bottles
  b.box(STEEL, 0.9, 0.04, 0.5, 0.3, TOP, CZ - 0.05);
  b.box(STEEL, 0.9, 0.08, 0.03, 0.3, TOP, CZ + 0.2);
  b.box(STEEL, 0.9, 0.08, 0.03, 0.3, TOP, CZ - 0.3);
  [[-0.05, 0xe94f4f], [0.15, 0x4aa3df], [0.35, 0xf2b134]].forEach(([dx, col]) => {
    b.box(col, 0.16, 0.22, 0.1, 0.3 + dx - 0.25 + 0.15, TOP + 0.04, CZ - 0.05);
  });
  bottle(b, 0.65, TOP + 0.04, CZ - 0.05, 0xf2b134, 0.2);
  // sanitiser, paper bags and a little scale
  bottle(b, 1.5, TOP, CZ + 0.1, 0x9fe0c0, 0.2, 0.12);
  b.box(0xe9d9b8, 0.3, 0.25, 0.14, 2.2, TOP, CZ - 0.1);
  b.box(0xe9d9b8, 0.3, 0.2, 0.14, 2.55, TOP, CZ - 0.1);
  b.box(STEEL, 0.4, 0.05, 0.3, 3.3, TOP, CZ);
  b.box(0x3a4a45, 0.12, 0.03, 0.05, 3.3, TOP + 0.05, CZ + 0.1);
  // a clear counter screen (frame only)
  b.box(0xd6efff, 0.03, 0.55, 0.5, -3.6, TOP, CZ - 0.05);
  b.box(0xd6efff, 0.03, 0.55, 0.5, 3.9, TOP, CZ - 0.05);

  // ---- tall wall shelves behind the counter, full of small coloured medicine boxes ----
  const SZ = -7.65;
  plan.blocks.push([-6.5, 6.5, SZ - 0.225, SZ + 0.225, T0, T0 + 2.8]);
  b.box(WHITE, 13, 2.8, 0.06, 0, T0, SZ - 0.19);                                   // back panel
  [-6.5, 6.5].forEach((x) => b.box(TEAL, 0.08, 2.8, 0.45, x, T0, SZ));            // sides
  b.box(TEAL, 13, 0.12, 0.45, 0, T0 + 2.8, SZ);                                    // top
  b.box(TEAL, 13, 0.3, 0.45, 0, T0, SZ);                                           // base
  [0.5, 1.0, 1.5, 2.0, 2.5].forEach((y, r) => {
    b.box(STEEL, 13, 0.04, 0.42, 0, T0 + y - 0.04, SZ);                            // shelf board
    medRow(b, -6.45, 6.45, T0 + y, SZ + 0.02, r * 11);
  });
  [-3.25, 0, 3.25].forEach((x) => b.box(TEAL, 0.05, 2.5, 0.4, x, T0 + 0.3, SZ));   // dividers

  // ---- green cross sign board (north wall) ----
  b.box(DTEAL, 2.6, 2.6, 0.06, -9.2, T0 + 0.75, -7.86);
  b.box(WHITE, 2.4, 2.4, 0.04, -9.2, T0 + 0.85, -7.82);
  cross(b, -9.2, T0 + 2.0, -7.79, 1.6, GREEN);

  // ---- medicine fridge (north-east) ----
  solidBox(b, plan, WHITE, 8.7, -7.2, 1.4, 0.7, 1.9, 0);
  b.box(0x9fe0c0, 1.1, 1.3, 0.03, 8.7, T0 + 0.3, -6.83);
  b.box(TEAL, 0.05, 0.6, 0.05, 8.2, T0 + 0.8, -6.8);
  b.box(TEAL, 1.4, 0.1, 0.7, 8.7, T0 + 1.9, -7.2);

  // ---- customer shelves: 3 rows (first aid, vitamins, mixed) ----
  gondola(b, 0, -6.5, -1.2, 7, 'aid');
  gondola(b, 0, -6.5, 0.8, 7, 'vit');
  gondola(b, 0, -6.5, 2.8, 7, 'mix');
  [-1.2, 0.8, 2.8].forEach((z, i) => {                                             // end-of-row signs
    b.box(GREEN, 0.04, 0.5, 0.5, -10.02, T0 + 1.5, z);
    b.box(WHITE, 0.05, 0.08, 0.3, -10.03, T0 + 1.72, z);
    b.box(WHITE, 0.05, 0.3, 0.08, -10.03, T0 + 1.6, z);
  });

  // ---- waiting bench: 4 chairs in a row on a bar ----
  b.box(DTEAL, 5.0, 0.07, 0.4, 5.6, T0 + 0.3, 7.2);
  [3.8, 5.0, 6.2, 7.4].forEach((x) => addChair(b, plan, x, 7.2, 0, Math.PI, CHAIR));
  b.box(MINT, 0.9, 0.02, 0.6, 5.6, T0, 6.3);                                       // little mat
  table(b, 0, 8.6, 6.4, 0.6);                                                      // side table with leaflets
  b.box(WHITE, 0.3, 0.02, 0.22, 8.6, T0 + 0.76, 6.4);
  b.box(0xe94f4f, 0.22, 0.02, 0.16, 8.62, T0 + 0.78, 6.42);

  // ---- blood-pressure check corner ----
  b.box(0xcfe9e4, 3.4, 0.02, 3.0, 7.3, T0, 1.0);                                   // rug
  addChair(b, plan, 6.6, 1.0, 0, Math.PI / 2, CHAIR);                              // looks toward +x
  table(b, 0, 8.1, 1.0, 0.8, 0xdfeee4);
  b.box(TEAL, 0.38, 0.2, 0.3, 8.0, T0 + 0.76, 1.0);                                // the machine
  b.box(0x2f3a36, 0.22, 0.1, 0.02, 7.9, T0 + 0.84, 0.84);                          // screen
  b.box(0xe94f4f, 0.04, 0.04, 0.04, 8.12, T0 + 0.9, 0.84);                         // button
  b.box(GRAY, 0.16, 0.3, 0.16, 8.32, T0 + 0.76, 1.1);                              // arm cuff
  b.box(DTEAL, 0.03, 0.03, 0.4, 8.2, T0 + 0.77, 1.0);                              // hose
  b.box(DTEAL, 0.9, 1.3, 0.05, 7.3, T0, -0.6);                                     // little stand sign
  b.box(WHITE, 0.8, 1.2, 0.03, 7.3, T0 + 0.05, -0.57);
  cross(b, 7.3, T0 + 1.0, -0.55, 0.5, GREEN);
  plan.blocks.push([6.85, 7.75, -0.65, -0.5, T0, T0 + 1.3]);

  // ---- plants beside the door ----
  plant(b, 0, -2.9, 7.4);
  plant(b, 0, 2.9, 7.4);

  // =====================================================
  // FLOOR 1: storage / compounding, consultation, staff room
  // =====================================================
  const T1 = plan.floors[1].top;
  [-6, 0, 6].forEach((x) => [-5, -1, 3].forEach((z) => light(b, 1, x, z)));

  // ---- storage: stock shelves along the north wall ----
  [-7.7, -5.1, -2.5, 0.1, 2.7].forEach((x, i) => stockUnit(b, 1, x, -7.6, 2.6, i * 2));
  gondola(b, 1, 7.0, -5.4, 4, 'stock', 1.8);                                       // a free-standing stock rack

  // ---- compounding area: a lab table with bottles ----
  b.box(0xcfe9e4, 4.0, 0.02, 2.4, -2.5, T1, -4.2);                                 // floor mat
  solidBox(b, plan, WHITE, -2.5, -4.2, 3.0, 1.1, 0.9, 1);
  b.box(TEAL, 3.1, 0.05, 1.2, -2.5, T1 + 0.9, -4.2);                               // lab top
  const LT = T1 + 0.95;
  [-3.7, -3.4, -3.1].forEach((x, i) => bottle(b, x, LT, -4.5, [0xf2b134, 0x7bc77b, 0x4aa3df][i], 0.24));
  [-2.5, -2.2].forEach((x, i) => flask(b, x, LT, -4.5, [0x9fe0c0, 0xf5d0dc][i]));
  b.box(WHITE, 0.3, 0.1, 0.3, -1.6, LT, -4.4);                                     // mortar
  b.box(STEEL, 0.1, 0.18, 0.1, -1.6, LT + 0.1, -4.4);                              // pestle
  b.box(STEEL, 0.4, 0.06, 0.3, -1.0, LT, -4.0);                                    // balance
  b.box(0x2f3a36, 0.14, 0.05, 0.05, -1.0, LT + 0.06, -3.88);
  [-3.7, -3.3, -2.9].forEach((x, i) => bottle(b, x, LT, -3.9, [0xe94f4f, 0xb07ad0, 0xf08a4b][i], 0.16, 0.12));
  addChair(b, plan, -3.3, -3.2, 1, Math.PI, CHAIR);
  addChair(b, plan, -1.7, -3.2, 1, Math.PI, CHAIR);

  // ---- consultation room (west): desk and 2 chairs ----
  partition(b, 1, -8.5, -2.5, 0.54, 0.66);                                         // north
  partition(b, 1, -8.5, -2.5, 6.34, 6.46);                                         // south
  partition(b, 1, -8.56, -8.44, 0.54, 6.46);                                       // west
  partition(b, 1, -2.56, -2.44, 0.54, 2.6);                                        // east, left of the door
  partition(b, 1, -2.56, -2.44, 4.0, 6.46);                                        // east, right of the door
  b.box(GREEN, 0.9, 0.04, 1.2, -2.5, T1, 3.3);                                     // door mat
  solidBox(b, plan, WHITE, -5.5, 2.4, 1.8, 0.8, 0.75, 1);                          // desk
  b.box(TEAL, 1.9, 0.05, 0.9, -5.5, T1 + 0.75, 2.4);
  b.box(0x2f3a36, 0.5, 0.32, 0.04, -5.5, T1 + 0.9, 2.2);                           // monitor
  b.box(STEEL, 0.1, 0.12, 0.1, -5.5, T1 + 0.8, 2.2);
  b.box(WHITE, 0.3, 0.02, 0.22, -5.0, T1 + 0.8, 2.6);                              // papers
  b.box(0xe94f4f, 0.08, 0.1, 0.08, -6.2, T1 + 0.8, 2.6);                           // mug
  addChair(b, plan, -5.5, 1.3, 1, 0, CHAIR);                                       // pharmacist, looks toward +z
  addChair(b, plan, -5.5, 3.5, 1, Math.PI, CHAIR);                                 // patient, looks toward -z
  solidBox(b, plan, MINT, -8.1, 5.3, 0.5, 1.6, 1.1, 1);                            // cabinet
  b.box(TEAL, 0.52, 0.04, 1.62, -8.1, T1 + 1.1, 5.3);
  b.box(GREEN, 0.04, 0.5, 0.5, -8.41, T1 + 1.6, 5.3);                              // wall sign
  plant(b, 1, -3.1, 5.8, 0.7);

  // ---- staff room (east): 1 bed and a table ----
  partition(b, 1, 3.0, 8.8, 0.54, 0.66);                                           // north
  partition(b, 1, 3.0, 8.8, 6.34, 6.46);                                           // south
  partition(b, 1, 8.74, 8.86, 0.54, 6.46);                                         // east
  partition(b, 1, 2.94, 3.06, 0.54, 2.6);                                          // west, left of the door
  partition(b, 1, 2.94, 3.06, 4.0, 6.46);                                          // west, right of the door
  b.box(LGREEN, 0.9, 0.04, 1.2, 3.0, T1, 3.3);                                     // door mat
  b.box(0xcfe9e4, 3.6, 0.02, 2.4, 5.8, T1, 3.0);                                   // rug
  table(b, 1, 5.2, 2.7, 0.9);
  addChair(b, plan, 4.4, 2.7, 1, Math.PI / 2, CHAIR);                              // looks toward +x
  addChair(b, plan, 6.0, 2.7, 1, -Math.PI / 2, CHAIR);                             // looks toward -x
  b.box(WHITE, 0.1, 0.1, 0.1, 5.0, T1 + 0.76, 2.7);                                // cup
  b.box(GREEN, 0.12, 0.14, 0.12, 5.4, T1 + 0.76, 2.7);                             // little vase
  addBed(b, plan, 7.8, 5.2, 1, 0, 0xcfd8d2, GREEN);
  solidBox(b, plan, WHITE, 5.8, 1.05, 3.0, 0.6, 0.9, 1);                           // kitchenette counter
  b.box(TEAL, 3.1, 0.05, 0.66, 5.8, T1 + 0.9, 1.05);
  b.box(STEEL, 0.22, 0.24, 0.22, 4.9, T1 + 0.95, 1.05);                            // kettle
  b.box(WHITE, 0.1, 0.1, 0.1, 5.5, T1 + 0.95, 1.0);
  b.box(WHITE, 0.1, 0.1, 0.1, 5.7, T1 + 0.95, 1.1);
  solidBox(b, plan, 0x7a8c82, 8.3, 1.4, 0.9, 0.55, 1.9, 1);                        // staff locker
  b.box(0xd9d2c0, 0.05, 0.2, 0.03, 8.12, T1 + 1.1, 1.7);
  b.box(0xd9d2c0, 0.05, 0.2, 0.03, 8.48, T1 + 1.1, 1.7);
}
