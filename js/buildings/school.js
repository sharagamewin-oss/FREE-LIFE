// =====================================================
// CIVIC BUILDING: SUNRISE SCHOOL
// Two floors with warm yellow walls and a red roof, rows of tall windows, and a central clock
// tower (clock face on the front, a small bell inside) rising to 14 m. In front is a fenced
// playground: a slide, two swings, a seesaw, a sandbox and a flagpole.
// =====================================================
// Drawing space (the building's OWN directions, like a house):
//   origin (0, 0) = middle of the 24 x 24 m lot.   x = right.   +z = front (street side).
//   Body: x from -10 to 10, z from -11 to 0 (front wall at z = 0), 9 m tall to the top of the ridge.
//   Clock tower: x from -2.8 to 2.8, z from -5.54 to 0.06, 14 m tall. The door is at its foot.
//   Forecourt (the playground): z from 0 to 12, fenced at z = 11 and at x = -11 and x = 11.
//
// The sign board (drawn by index.js) is a 10 x 2.5 m board at z = 0.1. It hangs on the upper
// wall between the door canopy and the roof edge, so signY is 5.2 (not the default 6).
export const info = {
  id: 'school',
  name: 'School',
  sign: 'SUNRISE SCHOOL',
  signY: 5.2,                    // middle of the sign board: it covers y 3.95 to 6.45
  height: 14,                    // the top of the clock tower (the main building is 9 m)
  door: { x: 0, z: 1.5 },        // in front of the door at the foot of the tower
  collide: {
    // box = [centre x, centre z, width, depth, height]
    boxes: [
      [0, -5.5, 20, 11, 9],              // the school building
      [0, -2.74, 5.6, 5.6, 14],          // the clock tower (rises above the roof)
      [-6.375, 11, 9.25, 0.3, 1.0],      // front fence, left of the gate
      [6.375, 11, 9.25, 0.3, 1.0],       // front fence, right of the gate
      [-11, 5.8, 0.3, 10.4, 1.0],        // left fence
      [11, 5.8, 0.3, 10.4, 1.0],         // right fence
      [-8.2, 4.9, 1.4, 4.4, 2.0],        // slide (ladder, platform and slope)
      [-6.8, 8.4, 0.3, 1.8, 2.4],        // swing frame, left end
      [-3.2, 8.4, 0.3, 1.8, 2.4],        // swing frame, right end
      [5.6, 5.2, 3.4, 0.6, 1.0]          // seesaw
    ],
    // round = [x, z, radius, height]
    round: [
      [-1.6, 11, 0.2, 1.5],              // the two gate posts
      [1.6, 11, 0.2, 1.5],
      [7.4, 2.4, 0.35, 7.4]              // flagpole
    ]
  }
};

export function build(b, c) {
  const G = c.G;   // ground height (0.1)

  // ---------- Colours ----------
  const YELLOW = 0xf2c94c;          // warm yellow walls
  const YELLOW_DARK = 0xd9a93a;
  const CREAM = 0xfff0c2;           // window frames, belt
  const RED = 0xc0392b;             // roof
  const RED_DARK = 0x8e2b20;
  const WOOD_DARK = 0x6b3a22;
  const GLASS = 0xbfe6f5;
  const GOLD = 0xe0b04b;
  const FENCE_WHITE = 0xfff4e0;
  const STONE = 0xd8c9a8;
  const STONE_LIGHT = 0xe8dcc0;
  const BLUE = 0x3b7dd8;            // playground frames

  // ---------- Main sizes ----------
  const WALL_H = 7.0;               // two floors: ground floor to y = 3.6, upper floor to y = 7.1
  const TOP = G + WALL_H;           // top of the walls (7.1)
  const RIDGE_Z = -5.5;             // the roof ridge runs along x, in the middle of the depth
  const HALF_D = 5.5;               // from the ridge to the front wall
  const RISE = 1.7;                 // how much the roof rises above the walls
  const OVER = 0.7;                 // the roof hangs out past the walls (front and back)
  const TZ = -2.74;                 // the clock tower is a 5.6 m square; this is its middle z

  // ---------- Walls ----------
  b.box(YELLOW, 20, WALL_H, 11, 0, G, -5.5);
  b.box(YELLOW_DARK, 20.12, 0.5, 11.12, 0, G, -5.5);               // low base
  b.box(CREAM, 20.12, 0.22, 11.12, 0, G + 3.4, -5.5);              // belt between the two floors
  [[-1, 0], [1, 0], [-1, -11], [1, -11]].forEach(([sx, z0]) => {   // corner stones
    b.box(YELLOW_DARK, 0.76, WALL_H, 0.76, sx * 9.68, G, z0 === 0 ? -0.32 : -10.68);
  });

  // ---------- Red roof (ridge along x). It stops at the tower, which rises through it. ----------
  const SLOPE = RISE / HALF_D;
  const ANG = Math.atan(SLOPE);
  const HALF = HALF_D + OVER;
  const LEN = Math.hypot(HALF, HALF * SLOPE);
  const RIDGE_Y = TOP + RISE;                       // the roof plane at the ridge (8.8)
  const MID_Y = RIDGE_Y - (HALF / 2) * SLOPE;
  function roofPiece(side, x0, x1) {                // side +1 = front slope, -1 = back slope
    const a = side * ANG;
    const cx = (x0 + x1) / 2;
    const cz = RIDGE_Z + side * HALF / 2;
    b.slab(RED, x1 - x0, 0.3, LEN, cx, MID_Y, cz, a, 0, 0);
    [-2.4, -1.2, 0, 1.2, 2.4].forEach((t) => {      // rows of roof tiles
      b.slab(RED_DARK, x1 - x0 - 0.2, 0.05, 0.08,
        cx, MID_Y + 0.17 * Math.cos(a) - t * Math.sin(a),
        cz + 0.17 * Math.sin(a) + t * Math.cos(a), a, 0, 0);
    });
  }
  roofPiece(1, -10.4, -2.75);                       // front slope, left of the tower
  roofPiece(1, 2.75, 10.4);                         // front slope, right of the tower
  roofPiece(-1, -10.4, 10.4);                       // back slope (whole width)
  b.box(RED_DARK, 7.75, 0.16, 0.6, -6.575, 8.84, RIDGE_Z);          // ridge caps (top = 9.0)
  b.box(RED_DARK, 7.75, 0.16, 0.6, 6.575, 8.84, RIDGE_Z);

  // The triangle under the roof at each end of the building, made of 6 steps.
  const STEPS = 6;
  const STEP_H = RISE / STEPS;
  for (let k = 0; k < STEPS; k++) {
    const hw = HALF_D * (1 - ((k + 0.5) * STEP_H) / RISE);
    [-1, 1].forEach((sx) => b.box(YELLOW, 0.4, STEP_H, hw * 2, sx * 9.8, TOP + k * STEP_H, RIDGE_Z));
  }

  // ---------- Sign backing (the board itself is drawn by index.js at z = 0.1) ----------
  b.box(WOOD_DARK, 10.4, 2.7, 0.06, 0, 3.85, 0.03);

  // ---------- Windows ----------
  function frontWindow(x, y, w, h) {                // (x, y) = middle-bottom of the glass
    b.box(CREAM, w + 0.3, h + 0.3, 0.12, x, y - 0.15, 0.01);       // frame
    b.box(GLASS, w, h, 0.12, x, y, 0.04);                          // glass
    b.box(CREAM, 0.06, h, 0.04, x, y, 0.11);                       // upright bar
    b.box(CREAM, w, 0.06, 0.04, x, y + h / 3 - 0.03, 0.11);        // two cross bars
    b.box(CREAM, w, 0.06, 0.04, x, y + (2 * h) / 3 - 0.03, 0.11);
    b.box(YELLOW_DARK, w + 0.5, 0.08, 0.3, x, y - 0.22, 0.12);     // sill
  }
  function sideWindow(side, z, y, w, h) {           // side = +1 right wall, -1 left wall
    b.box(CREAM, 0.12, h + 0.3, w + 0.3, side * 10.01, y - 0.15, z);
    b.box(GLASS, 0.12, h, w, side * 10.04, y, z);
    b.box(CREAM, 0.04, h, 0.06, side * 10.11, y, z);
    b.box(CREAM, 0.04, 0.06, w, side * 10.11, y + h / 2 - 0.03, z);
  }
  // Ground floor: three tall windows on each side of the door
  [-8.2, -6.0, -3.8, 3.8, 6.0, 8.2].forEach((x) => frontWindow(x, G + 0.85, 1.5, 2.3));
  // Upper floor: two tall windows on each side (the sign board is in the middle)
  [-8.5, -6.4, 6.4, 8.5].forEach((x) => frontWindow(x, 4.4, 1.3, 2.2));
  // Side windows, both floors
  [-1, 1].forEach((side) => {
    [-3.2, -7.8].forEach((z) => {
      sideWindow(side, z, G + 0.85, 1.4, 2.3);
      sideWindow(side, z, 4.4, 1.4, 2.2);
    });
  });

  // ---------- Front door (at the foot of the tower) with a little canopy ----------
  b.box(CREAM, 2.6, 3.3, 0.12, 0, G, 0.01);                         // door frame
  [-1, 1].forEach((sx) => {
    b.box(WOOD_DARK, 1.1, 3.0, 0.08, sx * 0.57, G, 0.06);           // two door leaves
    b.box(GLASS, 0.7, 1.0, 0.04, sx * 0.57, G + 1.5, 0.1);          // window in each leaf
    b.ball(GOLD, 0.12, sx * 0.14, G + 1.3, 0.13);                   // door handles
  });
  b.box(RED, 3.4, 0.12, 1.0, 0, G + 3.25, 0.5);                     // canopy over the door
  b.box(RED_DARK, 3.4, 0.06, 0.06, 0, G + 3.19, 1.0);               // canopy edge
  b.box(STONE_LIGHT, 3.0, 0.05, 1.2, 0, G, 0.6);                    // doorstep

  // ---------- Clock tower ----------
  b.box(YELLOW, 5.6, 11.0, 5.6, 0, G, TZ);                          // the tower shaft (top = 11.1)
  [-1, 1].forEach((sx) => b.box(YELLOW_DARK, 0.5, 11.0, 0.5, sx * 2.55, G, 0.08 - 0.25));   // front corner stones
  b.box(YELLOW_DARK, 6.0, 0.25, 6.0, 0, 11.1, TZ);                  // cornice

  // The clock face (a round white face with a gold rim, centre at y = 9.7)
  const CLOCK_Y = 9.7;
  b.cylZ(GOLD, 2.8, 0.12, 0, CLOCK_Y, 0.1);                         // rim
  b.cylZ(0xfffaf0, 2.45, 0.12, 0, CLOCK_Y, 0.12);                   // face
  for (let i = 0; i < 12; i++) {                                    // hour marks
    const a = (i * Math.PI) / 6;
    const big = i % 3 === 0;
    b.slab(0x2b2b2b, big ? 0.1 : 0.06, big ? 0.36 : 0.2, 0.04,
      1.0 * Math.sin(a), CLOCK_Y + 1.0 * Math.cos(a), 0.2, 0, 0, -a);
  }
  const hourA = (305 * Math.PI) / 180;                              // the clock shows ten past ten
  const minA = (60 * Math.PI) / 180;
  b.slab(0x2b2b2b, 0.1, 0.65, 0.04, 0.325 * Math.sin(hourA), CLOCK_Y + 0.325 * Math.cos(hourA), 0.23, 0, 0, -hourA);
  b.slab(0x2b2b2b, 0.07, 0.95, 0.04, 0.475 * Math.sin(minA), CLOCK_Y + 0.475 * Math.cos(minA), 0.25, 0, 0, -minA);
  b.ball(GOLD, 0.18, 0, CLOCK_Y, 0.26);                             // centre cap

  // The bell room above the cornice: four posts, open on all sides, with a small bell inside
  [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]].forEach(([dx, dz]) => {
    b.box(CREAM, 0.4, 1.4, 0.4, dx, 11.35, TZ + dz);
  });
  b.box(CREAM, 4.2, 0.2, 0.4, 0, 12.55, TZ - 1.9);                  // beams along the top
  b.box(CREAM, 4.2, 0.2, 0.4, 0, 12.55, TZ + 1.9);
  b.box(CREAM, 0.4, 0.2, 4.2, -1.9, 12.55, TZ);
  b.box(CREAM, 0.4, 0.2, 4.2, 1.9, 12.55, TZ);
  b.box(WOOD_DARK, 3.4, 0.15, 0.15, 0, 12.3, TZ);                   // the bell's axle
  b.cone(GOLD, 1.0, 0.75, 0, 11.5, TZ);                             // the bell
  b.ball(GOLD, 0.4, 0, 12.2, TZ);                                   // rounded top of the bell
  b.cyl(0xb8860b, 1.08, 0.08, 0, 11.46, TZ);                        // rim of the bell
  b.ball(0x5a4a42, 0.16, 0, 11.5, TZ);                              // clapper
  b.pyramid(RED, 5.0, 1.0, 5.0, 0, 12.75, TZ);                      // pointed red roof
  b.cone(GOLD, 0.2, 0.25, 0, 13.75, TZ);                            // tip (top of the tower = 14.0)

  // ---------- Forecourt floor, play mat and the path ----------
  b.box(STONE, 19.6, 0.04, 10.4, 0, G, 5.4);                        // paving
  b.box(0x6fae5a, 7.8, 0.06, 8.0, -6.2, G, 6.4);                    // soft green play mat
  b.box(STONE_LIGHT, 1.9, 0.07, 9.8, 0, G, 6.0);                    // path from the gate to the door

  // ---------- Low white fence with a gate in the middle ----------
  function fenceX(z, x1, x2) {
    const len = x2 - x1;
    const n = Math.max(1, Math.round(len / 1.5));
    for (let i = 0; i <= n; i++) b.box(FENCE_WHITE, 0.16, 1.0, 0.16, x1 + (len * i) / n, G, z);
    b.box(FENCE_WHITE, len, 0.1, 0.07, (x1 + x2) / 2, G + 0.3, z);
    b.box(FENCE_WHITE, len, 0.1, 0.07, (x1 + x2) / 2, G + 0.7, z);
  }
  function fenceZ(x, z1, z2) {
    const len = z2 - z1;
    const n = Math.max(1, Math.round(len / 1.5));
    for (let i = 0; i <= n; i++) b.box(FENCE_WHITE, 0.16, 1.0, 0.16, x, G, z1 + (len * i) / n);
    b.box(FENCE_WHITE, 0.07, 0.1, len, x, G + 0.3, (z1 + z2) / 2);
    b.box(FENCE_WHITE, 0.07, 0.1, len, x, G + 0.7, (z1 + z2) / 2);
  }
  fenceX(11, -11, -1.75);
  fenceX(11, 1.75, 11);
  fenceZ(-11, 0.6, 11);
  fenceZ(11, 0.6, 11);
  [-1.6, 1.6].forEach((x) => {                                      // the gate: two red posts with golden balls
    b.box(RED, 0.3, 1.5, 0.3, x, G, 11);
    b.ball(GOLD, 0.34, x, G + 1.6, 11);
  });

  // ---------- Slide (left side) ----------
  const SX = -8.2;
  const PLAT_Z = 3.6;
  b.box(YELLOW, 1.2, 0.1, 1.2, SX, G + 1.8, PLAT_Z);                // platform (top = 2.0)
  [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].forEach(([dx, dz]) => {
    b.box(BLUE, 0.1, 1.8, 0.1, SX + dx, G, PLAT_Z + dz);            // four posts
  });
  b.box(BLUE, 1.2, 0.5, 0.05, SX, G + 1.9, PLAT_Z - 0.58);          // back rail
  [-0.3, 0.3].forEach((dx) => b.box(BLUE, 0.06, 1.9, 0.06, SX + dx, G, PLAT_Z - 0.85));   // ladder sides
  for (let i = 0; i < 6; i++) b.box(BLUE, 0.6, 0.05, 0.06, SX, G + 0.3 + i * 0.3, PLAT_Z - 0.85);   // rungs
  const SL_RUN = 2.8;                                               // how far the slope reaches (z from 4.2 to 7.0)
  const SL_DROP = 1.75;
  const SL_ANG = Math.atan(SL_DROP / SL_RUN);
  const SL_LEN = Math.hypot(SL_RUN, SL_DROP);
  const SL_Z = PLAT_Z + 0.6 + SL_RUN / 2;
  const SL_Y = 2.0 - SL_DROP / 2;
  b.slab(RED, 0.7, 0.06, SL_LEN, SX, SL_Y, SL_Z, SL_ANG, 0, 0);    // the slope
  [-0.38, 0.38].forEach((dx) => {                                   // side rails of the slope
    b.slab(RED_DARK, 0.05, 0.18, SL_LEN, SX + dx, SL_Y + 0.1 * Math.cos(SL_ANG), SL_Z + 0.1 * Math.sin(SL_ANG), SL_ANG, 0, 0);
    b.box(BLUE, 0.06, 1.0, 0.06, SX + dx * 0.9, G, SL_Z);           // leg under the slope
  });

  // ---------- Swings (two seats on one frame, left side) ----------
  const WX = -5.0;
  const WZ = 8.4;
  const BAR_Y = 2.4;
  b.cylRot(BLUE, 0.12, 3.8, WX, BAR_Y, WZ, 0, 0, Math.PI / 2);      // top bar
  const LEG_H = BAR_Y - G;                                          // the legs go from the ground up to the bar
  const LEG_A = Math.atan(0.8 / LEG_H);
  const LEG_L = Math.hypot(LEG_H, 0.8);
  [-1.8, 1.8].forEach((dx) => {                                     // two A-shaped ends
    b.slab(BLUE, 0.1, LEG_L, 0.1, WX + dx, G + LEG_H / 2 + 0.03, WZ + 0.4, -LEG_A, 0, 0);
    b.slab(BLUE, 0.1, LEG_L, 0.1, WX + dx, G + LEG_H / 2 + 0.03, WZ - 0.4, LEG_A, 0, 0);
  });
  [[-0.6, 0, 0xd9423a], [0.6, 0.35, 0xf2c94c]].forEach(([dx, swing, color]) => {   // second swing is swung forward
    const rope = 1.85;
    const seatZ = WZ + rope * Math.sin(swing);
    const seatY = BAR_Y - rope * Math.cos(swing);
    [-0.2, 0.2].forEach((rx) => {
      b.slab(0x555555, 0.03, rope, 0.03, WX + dx + rx, (BAR_Y + seatY) / 2, (WZ + seatZ) / 2, -swing, 0, 0);
    });
    b.slab(color, 0.5, 0.06, 0.25, WX + dx, seatY, seatZ, -swing, 0, 0);
  });

  // ---------- Seesaw (right side) ----------
  b.box(BLUE, 0.3, 0.55, 0.5, 5.6, G, 5.2);                         // the support in the middle
  b.slab(0xe0a030, 3.2, 0.08, 0.4, 5.6, G + 0.62, 5.2, 0, 0, 0.16); // the plank, tilted
  [-1, 1].forEach((s) => {                                          // a handle at each end
    b.slab(BLUE, 0.05, 0.3, 0.05, 5.6 + s * 1.45, G + 0.62 + s * 1.45 * 0.16 + 0.17, 5.2, 0, 0, 0);
  });

  // ---------- Sandbox (right side) ----------
  const BX = 7.2;
  const BZ = 8.6;
  b.box(0xe6cf8f, 3.0, 0.22, 3.0, BX, G, BZ);                       // the sand
  [-1, 1].forEach((s) => {
    b.box(0xb5793f, 3.2, 0.3, 0.14, BX, G, BZ + s * 1.53);          // wooden border boards
    b.box(0xb5793f, 0.14, 0.3, 3.2, BX + s * 1.53, G, BZ);
  });
  b.cone(0xdcc17a, 1.0, 0.45, BX + 0.5, G + 0.22, BZ + 0.3);        // a sand hill
  b.cyl(0xd9423a, 0.28, 0.22, BX - 0.6, G + 0.22, BZ - 0.4);        // a toy bucket

  // ---------- Flagpole (a red and yellow school flag) ----------
  b.cyl(STONE_LIGHT, 0.7, 0.2, 7.4, G, 2.4);
  b.cyl(0xcfcfcf, 0.1, 7.0, 7.4, G + 0.2, 2.4);                     // the pole (top = 7.3)
  b.ball(GOLD, 0.2, 7.4, G + 7.3, 2.4);
  b.box(RED, 1.4, 0.4, 0.03, 8.15, 6.8, 2.4);                       // flag, top half
  b.box(0xf2c94c, 1.4, 0.4, 0.03, 8.15, 6.4, 2.4);                  // flag, bottom half
}
