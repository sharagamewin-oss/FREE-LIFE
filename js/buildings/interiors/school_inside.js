// =====================================================
// INTERIOR: School   (2 floors, joined by stairs)
// Floor 0: classroom (blackboard, teacher desk at the job spot, 4 rows x 3 student desks, bookshelf,
//          notice board), reception/office by the door, a row of lockers.
// Floor 1: science lab, library, computer room (6 desks), staff room (bed, table, chairs).
// Yellow, cream and blue. Helpers (see inside_common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './inside_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'teach', label: 'Teach the class', x: 0, z: -5.2, floor: 0 });

// ---------- palette ----------
const YELLOW = 0xf2c94c;
const DYELLOW = 0xd9a93a;
const CREAM = 0xf6ecd2;
const CREAM2 = 0xeadbb5;
const BLUE = 0x3f78c4;
const DBLUE = 0x2b4f8f;
const LBLUE = 0xcfe3f7;
const BOARD = 0x1f3a52;
const WOODC = 0xc9a06a;
const WHITE = 0xfbf8ef;
const STEEL = 0xc4ccd3;
const DARK = 0x2f3a46;
const BOOKS = [0x3f78c4, 0xf2c94c, 0xe9d9b8, 0x2b4f8f, 0xd9a93a, 0x8fb8e8, 0xc0504d, 0x6fa86f];
const BW = [0.08, 0.11, 0.09, 0.12, 0.07, 0.1];
const BH = [0.34, 0.42, 0.3, 0.38, 0.36, 0.4];

// ---------- helpers ----------
const DIR = { '+z': [0, 1], '-z': [0, -1], '+x': [1, 0], '-x': [-1, 0] };

// A box placed in the local space of a piece of furniture that faces `face`.
// u = sideways, v = toward the front, y = height above the floor top.
function lbox(b, T, face, cx, cz, color, du, h, dv, u, y, v) {
  const [fx, fz] = DIR[face];
  const x = cx + u * fz + v * fx;
  const z = cz - u * fx + v * fz;
  const swap = Math.abs(fx) === 1;
  b.box(color, swap ? dv : du, h, swap ? du : dv, x, T + y, z);
}
function lblock(face, cx, cz, du, dv, T, y0, y1) {
  const swap = Math.abs(DIR[face][0]) === 1;
  const w = swap ? dv : du;
  const d = swap ? du : dv;
  plan.blocks.push([cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2, T + y0, T + y1]);
}

function light(b, f, cx, cz) {
  const T = plan.floors[f].top;
  b.box(0xffffff, 1.4, 0.05, 0.4, cx, T + 3.43, cz);
}

function plant(b, f, cx, cz, h = 0.9) {
  const T = plan.floors[f].top;
  solidBox(b, plan, YELLOW, cx, cz, 0.5, 0.5, 0.4, f);
  b.box(0x4a3a2c, 0.4, 0.03, 0.4, cx, T + 0.4, cz);
  b.box(0x4f9a6a, 0.1, h, 0.1, cx, T + 0.4, cz);
  b.box(0x4f9a6a, 0.55, 0.3, 0.12, cx, T + 0.4 + h * 0.5, cz);
  b.box(0x4f9a6a, 0.12, 0.3, 0.55, cx, T + 0.4 + h * 0.7, cz);
  b.box(0x6fbf86, 0.4, 0.25, 0.4, cx, T + 0.4 + h, cz);
}

// A tall bookshelf against a wall. `face` = the way its books look: '+z' (north wall), '-z' (south wall), '+x' (west wall).
function shelf(b, f, face, cx, cz, len, seed = 0, h = 2.2) {
  const T = plan.floors[f].top;
  const D = 0.45;
  lbox(b, T, face, cx, cz, DBLUE, len, h, D, 0, 0, 0);
  lblock(face, cx, cz, len, D, T, 0, h);
  lbox(b, T, face, cx, cz, YELLOW, len + 0.04, 0.06, D + 0.04, 0, h, 0);                // yellow top
  [0.12, 0.62, 1.12, 1.62].forEach((y, r) => {
    lbox(b, T, face, cx, cz, CREAM, len - 0.06, 0.05, 0.12, 0, y - 0.05, D / 2);        // board
    let u = -len / 2 + 0.1;
    let i = seed + r * 7;
    while (u < len / 2 - 0.2) {
      const bw = BW[i % BW.length];
      const bh = BH[(i * 3) % BH.length];
      lbox(b, T, face, cx, cz, BOOKS[(i * 5) % BOOKS.length], bw, bh, 0.18, u + bw / 2, y, D / 2 - 0.02);
      u += bw + 0.015;
      i++;
    }
  });
}

// Student desk (solid) and a few things on it.
function studentDesk(b, f, cx, cz, i) {
  const T = plan.floors[f].top;
  solidBox(b, plan, CREAM2, cx, cz, 1.2, 0.6, 0.7, f);
  b.box(YELLOW, 1.26, 0.05, 0.66, cx, T + 0.7, cz);
  b.box(DBLUE, 1.2, 0.08, 0.04, cx, T + 0.5, cz + 0.32);                                // front rail
  if (i % 3 === 0) b.box(BOOKS[i % BOOKS.length], 0.3, 0.05, 0.22, cx - 0.3, T + 0.75, cz);   // a book
  if (i % 3 === 1) b.box(WHITE, 0.3, 0.02, 0.22, cx + 0.2, T + 0.75, cz);                      // a paper
  if (i % 4 === 2) b.box(0xc0504d, 0.05, 0.12, 0.05, cx + 0.4, T + 0.75, cz - 0.1);            // a pencil pot
}

// A partition wall (solid, 2.4 m tall).
function partition(b, f, x0, x1, z0, z1) {
  const T = plan.floors[f].top;
  b.box(CREAM, x1 - x0, 2.4, z1 - z0, (x0 + x1) / 2, T, (z0 + z1) / 2);
  b.box(YELLOW, x1 - x0 + 0.04, 0.07, z1 - z0 + 0.04, (x0 + x1) / 2, T + 2.4, (z0 + z1) / 2);
  b.box(BLUE, x1 - x0 + 0.02, 0.12, z1 - z0 + 0.02, (x0 + x1) / 2, T, (z0 + z1) / 2);
  plan.blocks.push([x0, x1, z0, z1, T, T + 2.4]);
}

// A round-ish table (box + turned copy), solid.
function table(b, f, cx, cz, size = 1.0, top = YELLOW) {
  const T = plan.floors[f].top;
  b.box(DBLUE, 0.12, 0.68, 0.12, cx, T, cz);
  b.box(DBLUE, size * 0.6, 0.04, size * 0.6, cx, T, cz);
  b.box(CREAM, size, 0.05, size, cx, T + 0.69, cz);
  b.slab(top, size, 0.06, size, cx, T + 0.725, cz, 0, Math.PI / 4, 0);
  plan.blocks.push([cx - size / 2, cx + size / 2, cz - size / 2, cz + size / 2, T, T + 0.76]);
}

function beaker(b, cx, y, cz, color, h = 0.16) {
  b.box(color, 0.1, h, 0.1, cx, y, cz);
  b.box(WHITE, 0.12, 0.02, 0.12, cx, y + h, cz);
}
function flask(b, cx, y, cz, color) {
  b.box(color, 0.16, 0.13, 0.16, cx, y, cz);
  b.box(color, 0.06, 0.12, 0.06, cx, y + 0.13, cz);
  b.box(WHITE, 0.09, 0.03, 0.09, cx, y + 0.25, cz);
}

// A computer desk with a monitor (screen toward +z), keyboard and mouse.
function compDesk(b, f, cx, cz) {
  const T = plan.floors[f].top;
  solidBox(b, plan, WHITE, cx, cz, 1.6, 0.7, 0.75, f);
  b.box(BLUE, 1.66, 0.05, 0.76, cx, T + 0.75, cz);
  b.box(STEEL, 0.1, 0.1, 0.1, cx, T + 0.8, cz - 0.12);                                  // monitor stand
  b.box(DARK, 0.54, 0.34, 0.04, cx, T + 0.9, cz - 0.12);                                // monitor
  b.box(0x8fc4f0, 0.46, 0.27, 0.02, cx, T + 0.94, cz - 0.09);                           // screen
  b.box(CREAM, 0.42, 0.02, 0.14, cx, T + 0.8, cz + 0.14);                               // keyboard
  b.box(WHITE, 0.06, 0.03, 0.1, cx + 0.4, T + 0.8, cz + 0.14);                          // mouse
  b.box(YELLOW, 0.18, 0.4, 0.4, cx + 0.62, T + 0.8, cz - 0.05);                         // computer
}

// A lab table (solid) with beakers, flasks and a burner, and 2 stools (north and south).
function labTable(b, f, cx, cz, seed) {
  const T = plan.floors[f].top;
  solidBox(b, plan, WHITE, cx, cz, 2.2, 1.0, 0.9, f);
  b.box(BLUE, 2.3, 0.05, 1.1, cx, T + 0.9, cz);
  const y = T + 0.95;
  [-0.8, -0.55, -0.3].forEach((dx, i) => beaker(b, cx + dx, y, cz - 0.25, [YELLOW, 0x8fc4f0, 0x7bc77b][(i + seed) % 3]));
  flask(b, cx + 0.1, y, cz - 0.2, [0x8fc4f0, YELLOW][seed % 2]);
  flask(b, cx + 0.45, y, cz - 0.2, [YELLOW, 0x7bc77b][seed % 2]);
  b.box(STEEL, 0.14, 0.1, 0.14, cx + 0.85, y, cz + 0.2);                                // burner
  b.box(0xf08a4b, 0.05, 0.06, 0.05, cx + 0.85, y + 0.1, cz + 0.2);                      // flame
  b.box(WHITE, 0.4, 0.02, 0.3, cx - 0.6, y, cz + 0.25);                                 // notebook
  addChair(b, plan, cx, cz - 1.0, f, 0, YELLOW);                                        // north stool, looks +z
  addChair(b, plan, cx, cz + 1.0, f, Math.PI, YELLOW);                                  // south stool, looks -z
}

export function build(b, c) {
  shell(b, plan, { floor: 0xe9d6a0, floorAlt: 0xdcc68a, wall: 0xf6ecd2, ceiling: 0xfffaf0, trim: 0x3f78c4 });
  for (let k = 0; k < plan.stairs.length; k++) addStairs(b, plan, k);

  // =====================================================
  // FLOOR 0: classroom, reception, lockers
  // =====================================================
  const T0 = plan.floors[0].top;
  [-6, 0, 6].forEach((x) => [-3, 2].forEach((z) => light(b, 0, x, z)));

  // ---- big blackboard (north wall) with a yellow frame, chalk tray and alphabet banner ----
  b.box(YELLOW, 8.2, 1.9, 0.06, 0, T0 + 0.95, -7.86);
  b.box(BOARD, 7.9, 1.6, 0.04, 0, T0 + 1.1, -7.82);
  b.box(DYELLOW, 8.2, 0.08, 0.2, 0, T0 + 0.9, -7.78);                              // chalk tray
  [0.9, 0.15, 0.9, 0.5].forEach((_, i) => {
    b.box(CREAM, 2.2 + (i % 2) * 1.2, 0.04, 0.02, -1.5 + (i % 2) * 1.2, T0 + 2.4 - i * 0.28, -7.79);   // chalk writing
  });
  b.box(0x8fc4f0, 0.5, 0.5, 0.02, 3.0, T0 + 1.3, -7.79);                           // a chalk drawing
  [...Array(16).keys()].forEach((i) => {
    b.box([YELLOW, BLUE, CREAM2, 0x8fc4f0][i % 4], 0.34, 0.34, 0.03, -3.9 + i * 0.52, T0 + 2.85, -7.86);   // letter blocks
  });

  // ---- notice board (north wall, left) ----
  b.box(WOODC, 3.2, 1.5, 0.06, -9.2, T0 + 1.05, -7.86);
  b.box(0xd9a066, 3.0, 1.3, 0.04, -9.2, T0 + 1.15, -7.82);
  [[-10.2, 1.7, 0.5, 0.65, WHITE], [-9.5, 1.85, 0.45, 0.5, YELLOW], [-8.8, 1.7, 0.5, 0.7, LBLUE], [-8.2, 1.9, 0.5, 0.45, CREAM],
    [-10.0, 1.3, 0.6, 0.4, LBLUE], [-9.1, 1.3, 0.5, 0.35, WHITE], [-8.4, 1.35, 0.6, 0.4, YELLOW]].forEach(([x, y, w, h, col]) => {
    b.box(col, w, h, 0.02, x, T0 + y - 0.3, -7.79);                                // pinned papers
    b.box(0xc0504d, 0.05, 0.05, 0.03, x, T0 + y - 0.3 + h - 0.08, -7.78);          // pins
  });

  // ---- teacher's desk at the job spot (z -5.2 behind it) and chair ----
  solidBox(b, plan, DBLUE, 0, -4.0, 2.2, 0.8, 0.75, 0);
  b.box(YELLOW, 2.3, 0.05, 0.9, 0, T0 + 0.75, -4.0);
  b.box(CREAM, 2.0, 0.5, 0.03, 0, T0 + 0.15, -3.58);                               // front panel
  b.box(STEEL, 0.14, 0.04, 0.14, -0.7, T0 + 0.8, -4.0);                            // globe base
  b.box(0x5fa0e0, 0.26, 0.26, 0.26, -0.7, T0 + 0.84, -4.0);                        // globe
  b.box(0xc0504d, 0.12, 0.12, 0.12, 0.7, T0 + 0.8, -3.9);                          // apple
  b.box(BOOKS[0], 0.35, 0.06, 0.25, 0.3, T0 + 0.8, -4.1);
  b.box(BOOKS[1], 0.33, 0.06, 0.23, 0.3, T0 + 0.86, -4.1);
  b.box(WHITE, 0.3, 0.02, 0.22, -0.2, T0 + 0.8, -3.8);
  addChair(b, plan, 0, -5.2, 0, 0, DBLUE);                                         // teacher's chair, looks +z
  b.box(BLUE, 3.0, 0.02, 1.6, 0, T0, -5.9);                                        // blue rug behind the desk

  // ---- student desks: 4 rows of 3, each with a chair (looking at the blackboard) ----
  [-1.6, -0.1, 1.4, 2.9].forEach((z, r) => {
    [-3.6, 0, 3.6].forEach((x, k) => {
      studentDesk(b, 0, x, z, r * 3 + k);
      addChair(b, plan, x, z + 0.7, 0, Math.PI, BLUE);
    });
  });

  // ---- bookshelf (west wall) ----
  shelf(b, 0, '+x', -11.75, -5.0, 4.0, 3);

  // ---- a clock above the door ----
  b.box(DBLUE, 0.5, 0.5, 0.04, 0, T0 + 2.95, 7.95);
  b.box(CREAM, 0.42, 0.42, 0.03, 0, T0 + 2.99, 7.92);
  b.box(DARK, 0.04, 0.16, 0.02, 0, T0 + 3.2, 7.9);
  b.box(DARK, 0.12, 0.04, 0.02, 0.05, T0 + 3.2, 7.9);

  // ---- row of lockers along the south wall (west half) ----
  const LCX = -8.5;
  const LCZ = 7.7;
  lbox(b, T0, '-z', LCX, LCZ, DBLUE, 6.0, 1.9, 0.6, 0, 0, 0);
  lblock('-z', LCX, LCZ, 6.0, 0.6, T0, 0, 1.9);
  lbox(b, T0, '-z', LCX, LCZ, YELLOW, 6.04, 0.06, 0.64, 0, 1.9, 0);
  for (let i = 0; i < 12; i++) {
    const u = -2.75 + i * 0.5;
    lbox(b, T0, '-z', LCX, LCZ, i % 2 ? YELLOW : BLUE, 0.44, 1.74, 0.03, u, 0.08, 0.315);   // door
    [0, 1, 2].forEach((s) => lbox(b, T0, '-z', LCX, LCZ, DARK, 0.26, 0.02, 0.035, u, 1.4 + s * 0.08, 0.32));   // vents
    lbox(b, T0, '-z', LCX, LCZ, CREAM, 0.04, 0.14, 0.05, u + 0.14, 0.9, 0.33);               // handle
  }

  // ---- reception / office near the door ----
  b.box(LBLUE, 3.4, 0.02, 3.2, 6.0, T0, 6.0);                                      // office rug
  solidBox(b, plan, BLUE, 6.0, 5.8, 2.4, 0.8, 1.0, 0);                             // reception desk
  b.box(YELLOW, 2.5, 0.06, 0.9, 6.0, T0 + 1.0, 5.8);
  b.box(DARK, 0.5, 0.32, 0.04, 6.0, T0 + 1.15, 5.75);                              // monitor (screen toward the clerk)
  b.box(0x8fc4f0, 0.44, 0.26, 0.02, 6.0, T0 + 1.18, 5.72);
  b.box(CREAM, 0.4, 0.02, 0.14, 6.0, T0 + 1.06, 5.55);                             // keyboard
  b.box(STEEL, 0.14, 0.08, 0.14, 6.9, T0 + 1.06, 5.9);                             // bell
  b.box(WHITE, 0.3, 0.03, 0.22, 5.2, T0 + 1.06, 5.8);                              // papers
  addChair(b, plan, 6.0, 4.9, 0, 0, DBLUE);                                        // clerk, looks toward the door
  addChair(b, plan, 4.9, 7.2, 0, Math.PI, BLUE);                                   // visitor chairs
  addChair(b, plan, 7.1, 7.2, 0, Math.PI, BLUE);
  b.box(BLUE, 1.4, 0.3, 0.04, 6.0, T0 + 2.6, 7.94);                                // OFFICE sign
  b.box(YELLOW, 1.2, 0.06, 0.02, 6.0, T0 + 2.72, 7.91);
  plant(b, 0, 3.4, 7.4);

  // =====================================================
  // FLOOR 1: science lab, library, computer room, staff room
  // =====================================================
  const T1 = plan.floors[1].top;
  [-6, 0, 6].forEach((x) => [-5, -1, 3].forEach((z) => light(b, 1, x, z)));

  // ---- science lab (north-west): sink counter, 3 lab tables with stools ----
  b.box(LBLUE, 9.0, 0.02, 6.0, -5.0, T1, -4.6);                                    // floor mat
  solidBox(b, plan, WHITE, -5.0, -7.6, 8.0, 0.6, 0.9, 1);                          // sink counter
  b.box(BLUE, 8.1, 0.05, 0.7, -5.0, T1 + 0.9, -7.6);
  [-7.0, -3.0].forEach((x) => {
    b.box(STEEL, 0.5, 0.06, 0.35, x, T1 + 0.95, -7.5);                             // sink
    b.box(STEEL, 0.05, 0.25, 0.05, x, T1 + 0.95, -7.8);                            // tap
    b.box(STEEL, 0.05, 0.05, 0.15, x, T1 + 1.15, -7.72);
  });
  b.box(YELLOW, 8.0, 0.05, 0.3, -5.0, T1 + 1.5, -7.8);                             // wall shelf
  [-8.4, -7.6, -6.8, -5.4, -4.6, -3.8, -2.4, -1.6].forEach((x, i) => {
    flask(b, x, T1 + 1.55, -7.8, [YELLOW, 0x8fc4f0, 0x7bc77b][i % 3]);
  });
  [-7.5, -4.2, -0.9].forEach((x, i) => labTable(b, 1, x, -3.8, i));

  // ---- library (south-west): 4 bookshelves and 2 reading tables with chairs ----
  b.box(CREAM2, 7.0, 0.02, 7.0, -6.2, T1, 4.4);                                    // reading rug
  shelf(b, 1, '-z', -7.6, 7.75, 2.9, 1);
  shelf(b, 1, '-z', -4.6, 7.75, 2.9, 5);
  shelf(b, 1, '+x', -11.75, 5.3, 1.6, 9);
  shelf(b, 1, '+x', -11.75, 7.0, 1.6, 13);
  [-7.0, -4.2].forEach((x, i) => {
    solidBox(b, plan, CREAM2, x, 4.6, 1.6, 0.9, 0.7, 1);                           // reading table
    b.box(YELLOW, 1.7, 0.05, 1.0, x, T1 + 0.7, 4.6);
    b.box(BOOKS[i], 0.3, 0.05, 0.22, x - 0.35, T1 + 0.75, 4.6);                    // open books
    b.box(WHITE, 0.3, 0.02, 0.22, x + 0.3, T1 + 0.75, 4.55);
    addChair(b, plan, x, 3.85, 1, 0, BLUE);                                        // north chair, looks +z
    addChair(b, plan, x, 5.35, 1, Math.PI, BLUE);                                  // south chair, looks -z
  });

  // ---- computer room (north-east): 6 desks, monitor and chair each ----
  b.box(LBLUE, 7.8, 0.02, 5.2, 5.0, T1, -5.6);                                     // blue carpet
  [[2.4, -7.2], [5.0, -7.2], [7.6, -7.2], [2.4, -4.9], [5.0, -4.9], [7.6, -4.9]].forEach(([x, z]) => {
    compDesk(b, 1, x, z);
    addChair(b, plan, x, z + 0.9, 1, Math.PI, YELLOW);                             // looks toward the desk
  });

  // ---- staff room (south-east): 1 bed, a table and chairs ----
  partition(b, 1, 3.0, 8.8, 0.54, 0.66);                                           // north
  partition(b, 1, 3.0, 8.8, 6.34, 6.46);                                           // south
  partition(b, 1, 8.74, 8.86, 0.54, 6.46);                                         // east
  partition(b, 1, 2.94, 3.06, 0.54, 2.6);                                          // west, left of the door
  partition(b, 1, 2.94, 3.06, 4.0, 6.46);                                          // west, right of the door
  b.box(YELLOW, 0.9, 0.04, 1.2, 3.0, T1, 3.3);                                     // door mat
  b.box(LBLUE, 3.6, 0.02, 2.4, 5.8, T1, 3.0);                                      // rug
  table(b, 1, 5.2, 2.7, 0.9);
  addChair(b, plan, 4.4, 2.7, 1, Math.PI / 2, BLUE);                               // looks toward +x
  addChair(b, plan, 6.0, 2.7, 1, -Math.PI / 2, BLUE);                              // looks toward -x
  b.box(WHITE, 0.1, 0.1, 0.1, 5.0, T1 + 0.76, 2.7);                                // cup
  b.box(BLUE, 0.12, 0.14, 0.12, 5.4, T1 + 0.76, 2.7);                              // little vase
  addBed(b, plan, 7.8, 5.2, 1, 0, DBLUE, YELLOW);
  solidBox(b, plan, WHITE, 5.8, 1.05, 3.0, 0.6, 0.9, 1);                           // kitchenette counter
  b.box(BLUE, 3.1, 0.05, 0.66, 5.8, T1 + 0.9, 1.05);
  b.box(STEEL, 0.22, 0.24, 0.22, 4.9, T1 + 0.95, 1.05);                            // kettle
  b.box(YELLOW, 0.1, 0.1, 0.1, 5.5, T1 + 0.95, 1.0);
  b.box(WHITE, 0.1, 0.1, 0.1, 5.7, T1 + 0.95, 1.1);
  plant(b, 1, 8.3, 1.5, 0.8);
}
