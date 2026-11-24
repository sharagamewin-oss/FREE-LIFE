// =====================================================
// INTERIOR: Food shop   (2 floors, joined by stairs)
// Ground floor: a grocery shop (checkout, aisles, fruit and veg, fridges, bakery, baskets).
// Floor 1: a storage warehouse, a freezer room, a packing table and a staff break room.
// Helpers (see inside_common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './inside_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'cashier', label: 'Cashier', x: 0, z: -5.2, floor: 0 });

// ---------- colours: fresh green / white / wood ----------
const GREEN = 0x4caf50;
const GREEN_D = 0x2e7d32;
const GREEN_L = 0xa5d6a7;
const WHITE = 0xffffff;
const CREAM = 0xf4f7ef;
const MINT = 0xe6f3de;
const WOOD = 0xc99a63;
const WOOD_D = 0x8d6137;
const WOOD_L = 0xe0bf8f;
const CARD = 0xd2ad78;          // cardboard
const STEEL = 0xaeb9b3;
const DARK = 0x2f3a36;
const GLASS = 0xcdeaf2;
const ICE = 0xe8f6f8;

const PRODUCT = [0xe53935, 0xfb8c00, 0xfdd835, 0x43a047, 0x1e88e5, 0x8e24aa, 0xf4f4ee, 0xff7043, 0x26a69a, 0xec407a];
const PRODUCE = [0xe53935, 0xfb8c00, 0xfdd835, 0x7cb342, 0x43a047, 0xd32f2f, 0x8e24aa, 0xff7043, 0xa5d6a7, 0xfff176];
const FROZEN = [0xcfe9f1, 0xffffff, 0xf8bbd0, 0xa5d6a7, 0x90caf9];
const BOXES = [0xd9b98a, 0xc9a46c, 0xe6cfa5, 0x5cb85c, 0xffffff];

const T1 = plan.floors[1].top;  // top of floor 1 (y = 4)

// ---------- small helpers ----------

// Rows of little product boxes on tiers (boards) along one face of a shelf.
//   axis 'z': the rows run along z, the face looks toward +x (dir 1) or -x (dir -1), at x = o.at
//   axis 'x': the rows run along x, the face looks toward +z (dir 1) or -z (dir -1), at z = o.at
//   a..b = start and end of the rows, ys = height of every board (absolute y)
function shelfRows(b, o) {
  const depth = o.depth;
  const n = Math.max(1, Math.floor((o.b - o.a) / o.step));
  const gap = (o.b - o.a) / n;
  const mid = o.at + o.dir * (0.02 + depth / 2);
  const bd = depth + 0.04;
  o.ys.forEach((y, t) => {
    if (o.axis === 'z') b.box(o.board, bd, 0.04, o.b - o.a, o.at + (o.dir * bd) / 2, y, (o.a + o.b) / 2);
    else b.box(o.board, o.b - o.a, 0.04, bd, (o.a + o.b) / 2, y, o.at + (o.dir * bd) / 2);
    for (let i = 0; i < n; i++) {
      const p = o.a + gap * (i + 0.5);
      const k = i + t + o.seed;
      const h = o.hMin + (k % 3) * o.hVar;
      const col = o.pal[(i * 3 + t * 5 + o.seed * 4 + (o.dir > 0 ? 2 : 0)) % o.pal.length];
      const x = o.axis === 'z' ? mid : p;
      const z = o.axis === 'z' ? p : mid;
      const yb = y + 0.04;
      if (k % 4 === 0) {                                               // a can or a jar
        b.cyl(col, depth + 0.02, h, x, yb, z);
      } else if (o.axis === 'z') {
        b.box(col, depth, h, o.w, x, yb, z);
        if (k % 2 === 0) b.box(WHITE, 0.012, h * 0.35, o.w * 0.7, x + o.dir * (depth / 2 + 0.006), yb + h * 0.35, z);
      } else {
        b.box(col, o.w, h, depth, x, yb, z);
        if (k % 2 === 0) b.box(WHITE, o.w * 0.7, h * 0.35, 0.012, x, yb + h * 0.35, z + o.dir * (depth / 2 + 0.006));
      }
    }
  });
}

// ---------- GROUND FLOOR ----------

// A double-sided shelf (aisle) that runs along z. Solid in the middle, products on both sides.
function gondola(b, cx, cz, len, seed) {
  const H = 1.9;
  solidBox(b, plan, CREAM, cx, cz, 0.7, len, H, 0);
  b.box(WOOD_D, 0.9, 0.12, len + 0.04, cx, 0, cz);                  // plinth
  b.box(GREEN, 1.0, 0.08, len + 0.06, cx, H, cz);                   // green top rail
  [-1, 1].forEach((side) => {
    shelfRows(b, {
      axis: 'z', at: cx + side * 0.35, dir: side, a: cz - len / 2 + 0.1, b: cz + len / 2 - 0.1, step: 0.55,
      ys: [0.12, 0.6, 1.08, 1.56], pal: PRODUCT, seed, depth: 0.14, w: 0.4, hMin: 0.26, hVar: 0.04, board: WOOD
    });
    b.box(GREEN, 0.7, 1.7, 0.03, cx, 0.12, cz + side * (len / 2 + 0.015));   // green end panels
  });
  // hanging aisle sign (above head height, so you can walk under it)
  [-1, 1].forEach((side) => {
    const sz = cz + side * (len / 2);
    b.box(GREEN, 1.0, 0.34, 0.06, cx, 2.5, sz);
    b.box(WHITE, 0.3, 0.2, 0.07, cx, 2.57, sz);
    [-0.4, 0.4].forEach((dx) => b.box(STEEL, 0.04, 0.56, 0.04, cx + dx, 2.84, sz));
  });
}

// The checkout counter (the cashier stands at x 0, z -5.2, behind it).
function checkout(b) {
  solidBox(b, plan, WOOD, 0, -4.0, 4.4, 0.9, 0.95, 0);              // counter, z -4.45 .. -3.55
  b.box(WHITE, 4.5, 0.05, 1.0, 0, 0.95, -4.0);                      // white top
  b.box(GREEN, 4.2, 0.6, 0.03, 0, 0.2, -3.535);                     // green front panel

  // conveyor strip (customer side, west half)
  b.box(DARK, 2.0, 0.04, 0.5, -1.1, 1.0, -3.85);
  b.box(STEEL, 2.04, 0.06, 0.04, -1.1, 1.0, -4.12);
  b.box(STEEL, 2.04, 0.06, 0.04, -1.1, 1.0, -3.58);
  for (let i = 0; i < 9; i++) b.box(0x56625c, 0.03, 0.01, 0.46, -1.9 + i * 0.22, 1.04, -3.85);
  b.box(GREEN, 0.05, 0.08, 0.5, -0.02, 1.04, -3.85);               // divider bar
  b.box(0x1e88e5, 0.12, 0.22, 0.12, -1.7, 1.04, -3.85);            // shopping on the belt
  b.box(0xfdd835, 0.18, 0.26, 0.1, -1.25, 1.04, -3.85);
  b.box(0xe53935, 0.14, 0.12, 0.14, -0.75, 1.04, -3.8);
  b.cyl(0x43a047, 0.12, 0.2, -0.4, 1.04, -3.9);

  // register (east half)
  solidBox(b, plan, CREAM, 1.2, -4.15, 0.55, 0.42, 0.16, 0, 1.0);
  b.box(GREEN, 0.5, 0.08, 0.02, 1.2, 1.04, -3.94);                  // cash drawer front
  b.box(STEEL, 0.05, 0.22, 0.05, 1.2, 1.16, -4.28);                 // screen pole
  b.box(DARK, 0.38, 0.26, 0.04, 1.2, 1.28, -4.3);                   // screen
  b.box(0x66bb6a, 0.32, 0.2, 0.01, 1.2, 1.31, -4.325);              // screen glow (faces the cashier)
  b.box(DARK, 0.12, 0.04, 0.2, 0.55, 1.0, -3.75);                   // card reader
  b.box(GREEN_L, 0.2, 0.12, 0.2, 1.9, 1.0, -3.8);                   // bag stand
  addChair(b, plan, 1.6, -5.5, 0, 0, WOOD_D);                       // a stool for the cashier
}

// Fridge row along the north wall (x -11.4 .. 8.1).
function fridgeRow(b) {
  const X0 = -11.4;
  const UNIT = 1.5;
  const N = 13;
  const Z = -7.6;
  solidBox(b, plan, WHITE, X0 + (UNIT * N) / 2, Z, UNIT * N, 0.8, 2.0, 0);
  for (let k = 0; k < N; k++) {
    const cx = X0 + UNIT * (k + 0.5);
    b.box(STEEL, 1.4, 1.8, 0.03, cx, 0.15, -7.185);                 // door frame
    b.box(GLASS, 1.28, 1.7, 0.03, cx, 0.2, -7.165);                 // glass
    [0.35, 0.85, 1.35].forEach((y, t) => {
      b.box(WHITE, 1.28, 0.03, 0.08, cx, y, -7.115);                // shelf lip
      for (let j = 0; j < 4; j++) {
        const h = 0.24 + ((k + t + j) % 3) * 0.05;
        b.box(PRODUCT[(k * 2 + t * 3 + j * 5) % PRODUCT.length], 0.2, h, 0.06, cx - 0.42 + j * 0.28, y + 0.03, -7.115);
      }
    });
    b.box(STEEL, 0.03, 0.6, 0.05, cx + 0.62, 0.7, -7.15);           // handle
    b.box(GREEN, UNIT - 0.02, 0.1, 0.8, cx, 2.0, Z);                // green cap
  }
}

// Fruit and vegetable stand: a long table of crates, crates on the floor, a striped awning.
function produceStand(b) {
  const cx = 6.5;
  solidBox(b, plan, WOOD, cx, 0.1, 1.2, 3.4, 0.7, 0);               // table, z -1.6 .. 1.8
  b.box(WOOD_D, 1.26, 0.05, 3.46, cx, 0.7, 0.1);
  let n = 0;
  [-0.28, 0.28].forEach((dx) => {
    for (let j = 0; j < 6; j++) {
      const x = cx + dx;
      const z = -1.35 + j * 0.58;
      const col = PRODUCE[(n * 3 + 1) % PRODUCE.length];
      const col2 = PRODUCE[(n * 3 + 4) % PRODUCE.length];
      b.box(WOOD_L, 0.5, 0.16, 0.5, x, 0.75, z);                    // the crate
      b.box(WOOD_D, 0.52, 0.03, 0.52, x, 0.82, z);                  // crate band
      b.box(col, 0.44, 0.08, 0.44, x, 0.91, z);                     // fruit / veg
      b.box(col, 0.34, 0.06, 0.34, x, 0.99, z);
      b.cyl(col2, 0.12, 0.1, x - 0.1, 1.05, z - 0.06);
      b.cyl(col2, 0.12, 0.1, x + 0.1, 1.05, z + 0.02);
      b.cyl(col2, 0.12, 0.1, x, 1.05, z + 0.1);
      n++;
    }
  });
  // crates on the floor
  [[6.1, -2.6, 2], [6.9, -2.6, 3], [6.5, 2.75, 2]].forEach(([x, z, count], idx) => {
    for (let i = 0; i < count; i++) {
      solidBox(b, plan, i % 2 ? WOOD : WOOD_L, x, z, 0.62, 0.46, 0.28, 0, i * 0.28);
      b.box(WOOD_D, 0.2, 0.05, 0.02, x, i * 0.28 + 0.12, z + 0.235);
    }
    b.box(PRODUCE[(idx * 3 + 2) % PRODUCE.length], 0.5, 0.1, 0.36, x, count * 0.28, z);
  });
  // awning: posts and green / white stripes
  [[5.4, -1.85], [7.6, -1.85], [5.4, 1.95], [7.6, 1.95]].forEach(([x, z]) => solidBox(b, plan, WOOD_D, x, z, 0.08, 0.08, 2.2, 0));
  for (let i = 0; i < 8; i++) b.box(i % 2 ? WHITE : GREEN, 0.3, 0.06, 4.1, 5.45 + i * 0.3, 2.2, 0);
  b.box(GREEN, 2.4, 0.15, 0.04, cx, 2.06, 2.07);
  b.box(GREEN, 2.4, 0.15, 0.04, cx, 2.06, -2.07);
}

// Bakery shelf on the north wall, and a bread table in front of it.
function bakery(b) {
  const cx = 9.9;
  const W = 3.6;
  solidBox(b, plan, WOOD, cx, -7.55, W, 0.9, 1.9, 0);               // z -8.0 .. -7.1
  b.box(GREEN, W + 0.1, 0.4, 0.08, cx, 1.95, -7.14);                // sign board
  b.box(WHITE, 0.6, 0.2, 0.09, cx, 2.05, -7.14);                    // loaf icon
  b.box(0xc68642, 0.5, 0.1, 0.1, cx, 2.1, -7.14);
  [0.45, 0.95, 1.45].forEach((y, t) => {
    b.box(WOOD_D, W - 0.1, 0.04, 0.24, cx, y, -6.98);               // board
    for (let i = 0; i < 9; i++) {
      const x = cx - W / 2 + 0.3 + i * 0.4;
      const kind = (i + t) % 3;
      if (kind === 0) {                                             // a loaf
        b.box(0xc68642, 0.34, 0.14, 0.2, x, y + 0.04, -6.98);
        b.box(0xd9a05b, 0.3, 0.04, 0.16, x, y + 0.18, -6.98);
      } else if (kind === 1) {                                      // two baguettes
        b.box(0xdba04a, 0.34, 0.07, 0.09, x, y + 0.04, -7.02);
        b.box(0xe6b25a, 0.34, 0.07, 0.09, x, y + 0.04, -6.92);
      } else {                                                      // rolls
        b.cyl(0xe3b172, 0.16, 0.08, x - 0.08, y + 0.04, -6.98);
        b.cyl(0xd9a05b, 0.16, 0.08, x + 0.08, y + 0.04, -6.98);
      }
    }
  });
  // bread table
  solidBox(b, plan, WOOD, 9.0, -5.0, 2.2, 0.9, 0.9, 0);
  b.box(WHITE, 2.3, 0.05, 1.0, 9.0, 0.9, -5.0);
  [8.3, 9.0, 9.7].forEach((x, i) => {
    b.box(WOOD_L, 0.55, 0.14, 0.42, x, 0.95, -5.0);                 // basket
    b.box(i === 1 ? 0xe6b25a : 0xc68642, 0.4, 0.12, 0.28, x, 1.09, -5.0);
    b.box(0xd9a05b, 0.3, 0.04, 0.2, x, 1.21, -5.0);
  });
}

// A little stack of shopping baskets (nested, so they look like one tall stack).
function basketStack(b, cx, cz) {
  solidBox(b, plan, WOOD, cx, cz, 0.62, 0.46, 0.3, 0);              // stand
  solidBox(b, plan, GREEN, cx, cz, 0.52, 0.4, 0.6, 0, 0.3);         // the baskets
  for (let i = 0; i < 6; i++) b.box(i % 2 ? GREEN_D : GREEN_L, 0.56, 0.03, 0.44, cx, 0.37 + i * 0.1, cz);
  b.box(WHITE, 0.04, 0.2, 0.04, cx - 0.2, 0.9, cz);
  b.box(WHITE, 0.04, 0.2, 0.04, cx + 0.2, 0.9, cz);
  b.box(WHITE, 0.44, 0.04, 0.04, cx, 1.1, cz);                      // handle
}

// ---------- FLOOR 1 ----------

// A wooden pallet with stacked crates (2 x 2 crates per layer).
function pallet(b, cx, cz, layers, seed) {
  solidBox(b, plan, WOOD_L, cx, cz, 1.2, 1.0, 0.14, 1);
  [-0.45, 0, 0.45].forEach((dx) => {
    b.box(WOOD_D, 0.22, 0.07, 0.02, cx + dx, T1 + 0.03, cz + 0.505);
    b.box(WOOD_D, 0.22, 0.07, 0.02, cx + dx, T1 + 0.03, cz - 0.505);
  });
  const cols = [GREEN, CARD, WOOD, GREEN_D];
  const spots = [[-0.3, -0.24], [0.3, -0.24], [-0.3, 0.24], [0.3, 0.24]];
  for (let L = 0; L < layers; L++) {
    const count = L === layers - 1 && seed % 2 === 1 ? 2 : 4;       // some top layers are half empty
    for (let s = 0; s < count; s++) {
      const [dx, dz] = spots[s];
      const lift = 0.14 + L * 0.32;
      solidBox(b, plan, cols[(L + s + seed) % cols.length], cx + dx, cz + dz, 0.56, 0.46, 0.32, 1, lift);
      b.box(DARK, 0.2, 0.05, 0.02, cx + dx, T1 + lift + 0.17, cz + dz + Math.sign(dz) * 0.235);   // handle slot
    }
  }
}

// A heavy shelf along the south wall, with cardboard boxes on it (faces north).
function rack(b, cx, len) {
  solidBox(b, plan, WOOD_D, cx, 7.55, len, 0.5, 2.4, 1);            // z 7.3 .. 7.8
  b.box(GREEN_D, len + 0.1, 0.1, 0.6, cx, T1 + 2.4, 7.55);          // green top beam
  shelfRows(b, {
    axis: 'x', at: 7.3, dir: -1, a: cx - len / 2 + 0.1, b: cx + len / 2 - 0.1, step: 0.55,
    ys: [T1 + 0.15, T1 + 0.85, T1 + 1.55], pal: BOXES, seed: 2, depth: 0.35, w: 0.5, hMin: 0.4, hVar: 0.08, board: WOOD
  });
}

function packingTable(b) {
  const x = 0;
  const z = -2.4;
  solidBox(b, plan, WHITE, x, z, 3.0, 1.1, 0.08, 1, 0.82);          // table top
  [[-1.4, -0.45], [1.4, -0.45], [-1.4, 0.45], [1.4, 0.45]].forEach(([dx, dz]) => b.box(WOOD_D, 0.08, 0.82, 0.08, x + dx, T1, z + dz));
  b.box(WOOD, 2.8, 0.04, 0.9, x, T1 + 0.25, z);                     // low shelf
  b.box(GREEN, 3.0, 0.08, 0.02, x, T1 + 0.74, z + 0.56);            // green apron
  b.box(CARD, 0.5, 0.3, 0.4, x - 0.8, T1 + 0.29, z);                // boxes on the low shelf
  b.box(CARD, 0.4, 0.22, 0.4, x + 0.5, T1 + 0.29, z);
  // on the table
  b.box(CARD, 0.6, 0.35, 0.45, x - 1.0, T1 + 0.9, z - 0.1);         // parcel
  b.box(0xe2c48f, 0.08, 0.01, 0.46, x - 1.0, T1 + 1.25, z - 0.1);   // tape
  b.box(CARD, 0.4, 0.25, 0.3, x - 0.4, T1 + 0.9, z + 0.15);
  b.box(GREEN, 0.16, 0.1, 0.1, x + 0.2, T1 + 0.9, z + 0.1);         // tape dispenser
  b.cyl(GREEN_L, 0.12, 0.1, x + 0.2, T1 + 0.9, z + 0.3);
  b.box(STEEL, 0.5, 0.05, 0.4, x + 0.9, T1 + 0.9, z);               // scale
  b.box(DARK, 0.2, 0.08, 0.04, x + 0.9, T1 + 0.95, z - 0.2);
  b.box(0x66bb6a, 0.16, 0.04, 0.01, x + 0.9, T1 + 0.97, z - 0.225);
  b.box(WOOD_D, 0.04, 0.22, 0.04, x - 0.1, T1 + 0.9, z - 0.42);     // paper roll stand
  b.box(WOOD_D, 0.04, 0.22, 0.04, x + 1.3, T1 + 0.9, z - 0.42);
  b.cylRot(0xdff3f7, 0.2, 1.2, x + 0.6, T1 + 1.05, z - 0.42, 0, 0, Math.PI / 2);   // bubble wrap roll
  // parcel trolley and a stack of cartons beside the table
  solidBox(b, plan, GREEN, -3.0, -2.4, 1.0, 0.65, 0.12, 1, 0.12);
  b.box(STEEL, 0.04, 0.9, 0.04, -3.45, T1 + 0.12, -2.7);
  b.box(STEEL, 0.04, 0.9, 0.04, -3.45, T1 + 0.12, -2.1);
  [0, 1].forEach((i) => solidBox(b, plan, i ? CARD : 0xc9a46c, -2.85, -2.4, 0.6, 0.5, 0.3, 1, 0.24 + i * 0.3));
  [0, 1, 2].forEach((i) => {
    solidBox(b, plan, CARD, 2.9, -2.4, 0.8, 0.6, 0.3, 1, i * 0.3);
    b.box(0xe2c48f, 0.08, 0.01, 0.62, 2.9, T1 + i * 0.3 + 0.3, -2.4);
  });
}

// Freezer room in the north-west corner: ice-white walls, a strip curtain door, chest freezers and racks.
function freezerRoom(b) {
  const H = 3.4;
  solidBox(b, plan, ICE, -10.75, -4.7, 2.5, 0.15, H, 1);            // south wall, left of the door
  solidBox(b, plan, ICE, -7.15, -4.7, 1.9, 0.15, H, 1);             // south wall, right of the door
  solidBox(b, plan, ICE, -6.2, -6.35, 0.15, 3.3, H, 1);             // east wall
  b.box(GREEN, 2.5, 0.3, 0.02, -10.75, T1, -4.615);                 // green kick strips on the outside
  b.box(GREEN, 1.9, 0.3, 0.02, -7.15, T1, -4.615);
  b.box(GREEN, 0.02, 0.3, 3.3, -6.115, T1, -6.35);
  // door (gap x -9.5 .. -8.1): frame, sign and a plastic strip curtain
  b.box(GREEN, 0.1, 2.5, 0.2, -9.5, T1, -4.7);
  b.box(GREEN, 0.1, 2.5, 0.2, -8.1, T1, -4.7);
  b.box(ICE, 1.4, 0.9, 0.15, -8.8, T1 + 2.5, -4.7);
  b.box(GREEN, 1.4, 0.4, 0.07, -8.8, T1 + 2.5, -4.6);
  b.box(WHITE, 0.3, 0.06, 0.08, -8.8, T1 + 2.67, -4.6);
  b.box(WHITE, 0.06, 0.3, 0.08, -8.8, T1 + 2.55, -4.6);
  for (let i = 0; i < 6; i++) b.box(0xbfe3ee, 0.16, 2.3, 0.02, -9.375 + i * 0.25, T1 + 0.1, -4.7);
  b.box(0xd5eef5, 5.5, 0.02, 3.1, -9.025, T1, -6.35);               // frosty floor
  // chest freezers along the north wall
  [-10.5, -8.9, -7.3].forEach((x) => {
    solidBox(b, plan, WHITE, x, -7.5, 1.4, 0.8, 0.85, 1);
    b.box(0xbfe3ee, 1.44, 0.06, 0.84, x, T1 + 0.85, -7.5);          // lid
    b.box(STEEL, 0.5, 0.04, 0.04, x, T1 + 0.9, -7.06);
    b.box(GREEN, 0.06, 0.06, 0.02, x + 0.55, T1 + 0.55, -7.095);    // status light
  });
  // frozen-food rack on the west wall
  solidBox(b, plan, 0xdcecef, -11.6, -6.0, 0.5, 1.8, 1.7, 1);
  shelfRows(b, {
    axis: 'z', at: -11.35, dir: 1, a: -6.85, b: -5.15, step: 0.4, ys: [T1 + 0.3, T1 + 0.8, T1 + 1.3],
    pal: FROZEN, seed: 1, depth: 0.2, w: 0.32, hMin: 0.22, hVar: 0.04, board: STEEL
  });
  // a little pallet of frozen cartons
  solidBox(b, plan, WOOD_L, -7.0, -5.6, 1.0, 0.8, 0.12, 1);
  [0, 1, 2].forEach((i) => solidBox(b, plan, FROZEN[i], -7.0, -5.6, 0.9, 0.7, 0.34, 1, 0.12 + i * 0.34));
}

// Staff break room in the south-east corner: 1 bed, a table and 3 chairs.
function breakRoom(b) {
  const H = 3.4;
  solidBox(b, plan, MINT, 8.775, 4.5, 6.45, 0.15, H, 1);            // north wall (x 5.55 .. 12)
  solidBox(b, plan, MINT, 5.625, 4.95, 0.15, 0.9, H, 1);            // west wall, north part
  solidBox(b, plan, MINT, 5.625, 7.4, 0.15, 1.2, H, 1);             // west wall, south part (door gap z 5.4 .. 6.8)
  b.box(MINT, 0.15, 1.0, 1.4, 5.625, T1 + 2.4, 6.1);                // above the door
  b.box(GREEN, 0.2, 2.4, 0.06, 5.625, T1, 5.4);
  b.box(GREEN, 0.2, 2.4, 0.06, 5.625, T1, 6.8);
  b.box(GREEN, 0.2, 0.08, 1.52, 5.625, T1 + 2.4, 6.1);
  b.box(GREEN_L, 2.6, 0.02, 2.0, 8.6, T1, 6.6);                     // rug

  // table and 3 chairs
  solidBox(b, plan, WOOD, 8.6, 6.6, 1.4, 0.9, 0.06, 1, 0.7);
  [[-0.62, -0.38], [0.62, -0.38], [-0.62, 0.38], [0.62, 0.38]].forEach(([dx, dz]) => b.box(WOOD_D, 0.06, 0.7, 0.06, 8.6 + dx, T1, 6.6 + dz));
  b.box(WHITE, 0.4, 0.02, 0.3, 8.6, T1 + 0.76, 6.6);                // table mat
  addChair(b, plan, 8.6, 5.65, 1, 0, GREEN);                        // north side, looks south
  addChair(b, plan, 8.6, 7.55, 1, Math.PI, GREEN);                  // south side, looks north
  addChair(b, plan, 7.4, 6.6, 1, Math.PI / 2, GREEN);               // west side, looks east

  // bed, bedside table and wardrobe
  addBed(b, plan, 11.2, 6.5, 1, 0, WOOD, 0x66bb6a);
  solidBox(b, plan, WOOD, 10.15, 5.65, 0.4, 0.4, 0.5, 1);
  b.cyl(WHITE, 0.1, 0.18, 10.15, T1 + 0.5, 5.65);
  b.box(GREEN_L, 0.2, 0.16, 0.2, 10.15, T1 + 0.68, 5.65);
  solidBox(b, plan, WOOD, 11.2, 4.9, 1.3, 0.6, 2.0, 1);
  b.box(WOOD_D, 0.02, 1.8, 0.02, 11.2, T1 + 0.1, 5.205);
  b.box(STEEL, 0.03, 0.3, 0.03, 11.1, T1 + 1.0, 5.215);
  b.box(STEEL, 0.03, 0.3, 0.03, 11.3, T1 + 1.0, 5.215);

  // little kitchen along the north wall
  solidBox(b, plan, WOOD_L, 7.2, 4.9, 1.6, 0.6, 0.9, 1);
  b.box(WHITE, 1.64, 0.04, 0.64, 7.2, T1 + 0.9, 4.9);
  b.box(CREAM, 0.5, 0.28, 0.38, 7.6, T1 + 0.94, 4.85);              // microwave
  b.box(DARK, 0.3, 0.18, 0.01, 7.52, T1 + 0.99, 5.045);
  b.cyl(GREEN, 0.16, 0.2, 6.75, T1 + 0.94, 4.9);                    // kettle
  [6.95, 7.1, 7.25].forEach((x) => b.cyl(WHITE, 0.07, 0.09, x, T1 + 0.94, 5.1));   // mugs
  solidBox(b, plan, WHITE, 8.5, 4.9, 0.6, 0.6, 1.0, 1);             // mini fridge
  b.box(GREEN, 0.04, 0.35, 0.03, 8.7, T1 + 0.5, 5.215);
  b.box(WOOD, 1.4, 0.9, 0.03, 9.6, T1 + 1.2, 4.59);                 // notice board
  [[9.2, 1.5, GREEN_L], [9.55, 1.7, 0xfdd835], [9.9, 1.45, WHITE]].forEach(([x, y, c]) => b.box(c, 0.2, 0.2, 0.01, x, T1 + y, 4.61));

  // plant by the door
  solidBox(b, plan, WOOD_D, 6.3, 7.5, 0.3, 0.3, 0.3, 1);
  b.box(GREEN, 0.4, 0.3, 0.4, 6.3, T1 + 0.3, 7.5);
  b.box(GREEN_D, 0.3, 0.3, 0.3, 6.3, T1 + 0.55, 7.5);
}

// ---------- build ----------
export function build(b, c) {
  shell(b, plan, { floor: 0xe2c79a, floorAlt: 0xd6b888, wall: 0xe6f4de, ceiling: 0xfbfff8, trim: 0x4a9a4f });
  for (let k = 0; k < plan.stairs.length; k++) addStairs(b, plan, k);

  // ---- Ground floor: the grocery shop ----
  checkout(b);
  fridgeRow(b);
  [-9.9, -7.2, -4.5, -1.8, 3.0].forEach((x, i) => gondola(b, x, 0.2, 4.4, i));   // 5 aisles of shelves
  produceStand(b);
  bakery(b);
  basketStack(b, -3.3, 7.4);                                                      // 2 basket stacks by the door
  basketStack(b, 3.3, 7.4);

  // ---- Floor 1: warehouse, freezer, packing table, break room ----
  freezerRoom(b);
  [[-3.6, 4], [-0.8, 3], [2.0, 2], [4.8, 4]].forEach(([x, L], i) => pallet(b, x, -7.35, L, i));   // along the north wall
  pallet(b, -7.2, -1.4, 4, 0);                                                    // west pile
  pallet(b, -7.2, -0.3, 3, 1);
  pallet(b, -4.8, 6.9, 3, 2);                                                     // south wall
  pallet(b, 3.9, 6.9, 2, 3);
  rack(b, -8.6, 3.6);
  packingTable(b);
  breakRoom(b);
}
