// =====================================================
// CIVIC BUILDING: SUNNY CAFE
// A cosy two-storey cafe with a terracotta pitched roof, a striped awning, flower boxes,
// and a fenced terrace in front with 5 round tables, umbrellas, chairs and potted plants.
// =====================================================
// Drawing space (the building's OWN directions, like a house):
//   origin (0, 0) = middle of the 24 x 24 m lot.   x = right.   +z = front (street side).
//   Body: x from -10 to 10, z from -11 to 0 (front wall at z = 0), 8 m tall (to the top of the ridge).
//   Forecourt (the terrace): z from 0 to 12, fenced at z = 11 and at x = -11 and x = 11.
//
// The sign board (drawn by index.js) is a 10 x 2.5 m board at z = 0.1. It must fit between the
// top of the door/windows and the front edge of the roof, so signY is 3.85 (not the default 6).
export const info = {
  id: 'cafe',
  name: 'Cafe',
  sign: 'SUNNY CAFE',
  signY: 3.85,                   // middle of the sign board: it covers y 2.6 to 5.1 on the upper wall
  height: 8,                     // real height (the ridge of the roof); players can fly over it
  door: { x: 0, z: 1.5 },        // under the awning, in the middle of the front wall
  collide: {
    // box = [centre x, centre z, width, depth, height]
    boxes: [
      [0, -5.5, 20, 11, 8],              // the cafe building
      [-6.4, -4.0, 1.3, 1.3, 9.7],       // the chimney (rises above the roof)
      [-6.375, 11, 9.25, 0.3, 1.0],      // front fence, left of the gate
      [6.375, 11, 9.25, 0.3, 1.0],       // front fence, right of the gate
      [-11, 5.8, 0.3, 10.4, 1.0],        // left fence
      [11, 5.8, 0.3, 10.4, 1.0]          // right fence
    ],
    // round = [x, z, radius, height]
    round: [
      [-7.8, 4.2, 0.85, 0.9],            // 5 round tables (with their chairs)
      [-4.0, 7.6, 0.85, 0.9],
      [7.8, 4.2, 0.85, 0.9],
      [4.0, 7.6, 0.85, 0.9],
      [-8.0, 9.2, 0.85, 0.9],
      [-1.6, 11, 0.2, 2.3],              // the two gate posts
      [1.6, 11, 0.2, 2.3],
      [-1.5, 0.9, 0.45, 1.2],            // potted plants (next to the door)
      [1.5, 0.9, 0.45, 1.2],
      [-9.4, 1.0, 0.55, 1.4],            // (front corners)
      [9.4, 1.0, 0.55, 1.4],
      [-2.4, 10.2, 0.5, 1.3],            // (beside the gate)
      [2.4, 10.2, 0.5, 1.3],
      [8.8, 9.7, 0.6, 1.5],              // (back right corner of the terrace)
      [7.3, 10.2, 0.45, 1.2]
    ]
  }
};

export function build(b, c) {
  const G = c.G;   // ground height (0.1)

  // ---------- Colours ----------
  const CREAM = 0xf6e8c8;
  const CREAM_DARK = 0xe3cfa5;
  const TERRA = 0xc4623a;
  const TERRA_DARK = 0x9e4a2b;
  const WOOD = 0xb5793f;
  const WOOD_DARK = 0x7a4a2a;
  const GLASS = 0xbfe6f5;
  const RED = 0xd9423a;
  const STRIPE_CREAM = 0xfff1d0;
  const LEAF = 0x62b552;
  const LEAF_DARK = 0x4f9e4a;
  const BRICK = 0xb5533c;
  const FLOWERS = [0xf48fb1, 0xffd54f, 0xffffff, 0xff8a65, 0xe53935];

  // ---------- Main sizes ----------
  const WALL_H = 5.3;               // two storeys: ground floor to y = 3.2, upper floor to y = 5.4
  const TOP = G + WALL_H;           // top of the walls (y = 5.4)
  const RIDGE_Z = -5.5;             // the roof ridge runs along x, in the middle of the depth
  const HALF_D = 5.5;               // from the ridge to the front wall
  const RISE = 2.4;                 // how much the roof rises above the walls
  const OVER = 0.7;                 // the roof hangs out 0.7 m past the walls (front and back)

  // ---------- Walls ----------
  b.box(CREAM, 20, WALL_H, 11, 0, G, -5.5);
  b.box(CREAM_DARK, 20.12, 0.5, 11.12, 0, G, -5.5);                 // low stone base
  b.box(CREAM_DARK, 20.12, 0.22, 11.12, 0, G + 3.0, -5.5);          // belt between the two floors
  [[-1, 0], [1, 0], [-1, -11], [1, -11]].forEach(([sx, z0]) => {    // corner stones
    b.box(CREAM_DARK, 0.76, WALL_H, 0.76, sx * 9.68, G, z0 === 0 ? -0.32 : -10.68);
  });

  // ---------- Pitched terracotta roof (ridge along x, slopes to the front and the back) ----------
  const SLOPE = RISE / HALF_D;
  const ANG = Math.atan(SLOPE);
  const HALF = HALF_D + OVER;                       // ridge to eave, measured flat
  const LEN = Math.hypot(HALF, HALF * SLOPE);       // length of one roof slab
  const RIDGE_Y = TOP + RISE;                       // the roof plane at the ridge
  const MID_Y = RIDGE_Y - (HALF / 2) * SLOPE;
  [1, -1].forEach((side) => {                       // +1 = front slope, -1 = back slope
    const a = side * ANG;
    const cz = RIDGE_Z + side * HALF / 2;
    b.slab(TERRA, 20.8, 0.3, LEN, 0, MID_Y, cz, a, 0, 0);
    [-2.6, -1.3, 0, 1.3, 2.6].forEach((t) => {      // rows of roof tiles
      b.slab(TERRA_DARK, 20.6, 0.05, 0.08,
        0, MID_Y + 0.17 * Math.cos(a) - t * Math.sin(a),
        cz + 0.17 * Math.sin(a) + t * Math.cos(a), a, 0, 0);
    });
  });
  b.box(TERRA_DARK, 20.9, 0.16, 0.6, 0, 7.84, RIDGE_Z);             // ridge cap (top of the building = 8.0)

  // The triangle under the roof at each end of the building, made of 8 steps.
  const STEPS = 8;
  const STEP_H = RISE / STEPS;
  for (let k = 0; k < STEPS; k++) {
    const hw = HALF_D * (1 - ((k + 0.5) * STEP_H) / RISE);
    [-1, 1].forEach((sx) => b.box(CREAM, 0.4, STEP_H, hw * 2, sx * 9.8, TOP + k * STEP_H, RIDGE_Z));
  }

  // ---------- Chimney ----------
  b.box(BRICK, 1.3, 2.7, 1.3, -6.4, 6.5, -4.0);
  b.box(CREAM_DARK, 1.6, 0.2, 1.6, -6.4, 9.2, -4.0);
  b.box(0x5a4a42, 0.5, 0.25, 0.5, -6.4, 9.4, -4.0);       // chimney pot

  // ---------- Sign backing (the board itself is drawn by index.js at z = 0.1) ----------
  b.box(WOOD_DARK, 10.4, 2.8, 0.06, 0, 2.45, 0.03);

  // ---------- Windows ----------
  function frontWindow(x, y, w, h) {                // (x, y) = middle-bottom of the glass
    b.box(WOOD_DARK, w + 0.3, h + 0.3, 0.12, x, y - 0.15, 0.01);   // frame
    b.box(GLASS, w, h, 0.12, x, y, 0.04);                          // glass
    b.box(WOOD_DARK, 0.06, h, 0.04, x, y, 0.11);                   // upright bar
    b.box(WOOD_DARK, w, 0.06, 0.04, x, y + h / 2 - 0.03, 0.11);    // cross bar
    b.box(CREAM_DARK, w + 0.5, 0.08, 0.3, x, y - 0.22, 0.12);      // sill
  }
  function sideWindow(side, z, y, w, h) {           // side = +1 right wall, -1 left wall
    b.box(WOOD_DARK, 0.12, h + 0.3, w + 0.3, side * 10.01, y - 0.15, z);
    b.box(GLASS, 0.12, h, w, side * 10.04, y, z);
    b.box(WOOD_DARK, 0.04, h, 0.06, side * 10.11, y, z);
    b.box(WOOD_DARK, 0.04, 0.06, w, side * 10.11, y + h / 2 - 0.03, z);
  }

  // Large ground-floor windows (two on each side of the door)
  [-7.9, -3.9, 3.9, 7.9].forEach((x) => frontWindow(x, G + 0.85, 3.0, 1.45));
  // Upper windows (the sign board is in the middle), each with a flower box under it
  [-8.7, -6.4, 6.4, 8.7].forEach((x, wi) => {
    frontWindow(x, 3.7, 1.5, 1.3);
    b.box(WOOD, 1.9, 0.35, 0.42, x, 3.2, 0.21);                    // flower box
    [-0.6, 0, 0.6].forEach((dx) => b.ball(LEAF, 0.55, x + dx, 3.78, 0.21, 0.8));
    for (let i = 0; i < 6; i++) {
      b.dot(FLOWERS[(i + wi) % FLOWERS.length], 0.2, x - 0.75 + i * 0.3, 3.98 + (i % 2) * 0.1, 0.12 + (i % 3) * 0.1);
    }
  });
  // Side windows
  [-1, 1].forEach((side) => {
    [-3.2, -7.8].forEach((z) => {
      sideWindow(side, z, G + 0.85, 1.4, 1.45);
      sideWindow(side, z, 3.7, 1.4, 1.3);
    });
  });

  // ---------- Front door ----------
  b.box(WOOD_DARK, 2.1, 2.55, 0.12, 0, G, 0.01);                    // door frame
  b.box(WOOD, 1.7, 2.3, 0.08, 0, G, 0.06);                          // door
  b.box(GLASS, 1.2, 1.0, 0.04, 0, G + 1.0, 0.1);                    // glass panel
  b.ball(0xe0b04b, 0.12, 0.55, G + 1.1, 0.14);                      // handle
  b.box(0x7a3b22, 1.6, 0.03, 0.8, 0, G, 0.55);                      // doormat

  // ---------- Striped red and cream awning over the door ----------
  const AWN_BACK_Y = 2.55;                                          // where it is fixed to the wall
  const AWN_FRONT_Y = 2.1;                                          // front edge
  const AWN_D = 1.6;                                                // how far it reaches out
  const AWN_ANG = Math.atan((AWN_BACK_Y - AWN_FRONT_Y) / AWN_D);
  const AWN_LEN = Math.hypot(AWN_D, AWN_BACK_Y - AWN_FRONT_Y);
  for (let i = 0; i < 11; i++) {
    const x = -2.0 + i * 0.4;
    const col = i % 2 === 0 ? RED : STRIPE_CREAM;
    b.slab(col, 0.4, 0.07, AWN_LEN, x, (AWN_BACK_Y + AWN_FRONT_Y) / 2, AWN_D / 2, AWN_ANG, 0, 0);
    b.box(col, 0.4, 0.28, 0.06, x, AWN_FRONT_Y - 0.28, AWN_D);     // hanging edge
  }

  // ---------- The terrace floor and the path from the gate to the door ----------
  b.box(0xd8c9a8, 19.6, 0.04, 10.5, 0, G, 5.4);
  b.box(0xe8dcc0, 1.9, 0.07, 9.6, 0, G, 6.1);

  // ---------- Low wooden fence with a gate in the middle ----------
  function fenceX(z, x1, x2) {
    const len = x2 - x1;
    const n = Math.max(1, Math.round(len / 1.5));
    for (let i = 0; i <= n; i++) b.box(WOOD, 0.16, 1.0, 0.16, x1 + (len * i) / n, G, z);
    b.box(WOOD, len, 0.1, 0.07, (x1 + x2) / 2, G + 0.3, z);
    b.box(WOOD, len, 0.1, 0.07, (x1 + x2) / 2, G + 0.7, z);
  }
  function fenceZ(x, z1, z2) {
    const len = z2 - z1;
    const n = Math.max(1, Math.round(len / 1.5));
    for (let i = 0; i <= n; i++) b.box(WOOD, 0.16, 1.0, 0.16, x, G, z1 + (len * i) / n);
    b.box(WOOD, 0.07, 0.1, len, x, G + 0.3, (z1 + z2) / 2);
    b.box(WOOD, 0.07, 0.1, len, x, G + 0.7, (z1 + z2) / 2);
  }
  fenceX(11, -11, -1.75);
  fenceX(11, 1.75, 11);
  fenceZ(-11, 0.6, 11);
  fenceZ(11, 0.6, 11);

  // The gate: two tall posts with a beam over the path, and a little lantern on each post.
  [-1.6, 1.6].forEach((x) => {
    b.box(WOOD_DARK, 0.3, 2.3, 0.3, x, G, 11);
    b.ball(0xffd54f, 0.26, x, G + 2.5, 11);
  });
  b.box(WOOD_DARK, 3.5, 0.2, 0.2, 0, G + 2.1, 11);

  // ---------- Tables, umbrellas and chairs ----------
  function chair(tx, tz, ang, dist, color) {        // a chair that faces the table
    const s = Math.sin(ang);
    const co = Math.cos(ang);
    const cx = tx + s * dist;
    const cz = tz + co * dist;
    b.slab(color, 0.46, 0.05, 0.46, cx, G + 0.43, cz, 0, ang, 0);                          // seat
    b.slab(color, 0.46, 0.46, 0.04, cx + s * 0.21, G + 0.73, cz + co * 0.21, 0, ang, 0);   // back
    [-0.2, 0.2].forEach((lx) => {                                                          // two side frames
      b.slab(color, 0.04, 0.42, 0.42, cx + co * lx, G + 0.21, cz - s * lx, 0, ang, 0);
    });
  }

  [
    [-7.8, 4.2, RED, 0.4],
    [-4.0, 7.6, STRIPE_CREAM, 0.9],
    [7.8, 4.2, STRIPE_CREAM, 0.2],
    [4.0, 7.6, RED, 1.2],
    [-8.0, 9.2, 0xf2c14e, 0.7]
  ].forEach(([x, z, umbrella, turn]) => {
    b.box(WOOD_DARK, 0.6, 0.06, 0.6, x, G, z);                        // table foot
    b.cyl(WOOD_DARK, 0.12, 0.7, x, G + 0.06, z);                   // table leg
    b.cyl(0xfff4e0, 1.2, 0.06, x, G + 0.76, z);                    // round top with a cloth
    b.box(0xe9e2d0, 0.12, 0.12, 0.12, x, G + 0.82, z);                // little vase
    b.dot(FLOWERS[Math.floor(turn * 3) % FLOWERS.length], 0.16, x, G + 1.0, z);
    b.cyl(0x6b4a2b, 0.07, 2.4, x, G + 0.06, z);                    // umbrella pole
    b.cone(umbrella, 3.0, 0.5, x, 2.1, z);                         // umbrella
    b.ball(0xe0b04b, 0.14, x, 2.65, z);                            // tip
    for (let k = 0; k < 4; k++) chair(x, z, turn + (k * Math.PI) / 2, 0.95, k % 2 === 0 ? WOOD : WOOD_DARK);
  });

  // ---------- Potted plants ----------
  function plant(x, z, s) {
    b.cyl(TERRA, 0.9 * s, 0.7 * s, x, G, z);
    b.cyl(TERRA_DARK, 1.0 * s, 0.12 * s, x, G + 0.6 * s, z);
    b.ball(LEAF, 1.1 * s, x, G + 1.2 * s, z, 0.9);
    b.ball(LEAF_DARK, 0.7 * s, x + 0.25 * s, G + 1.55 * s, z - 0.1 * s);
    b.dot(0xf48fb1, 0.2 * s, x - 0.3 * s, G + 1.5 * s, z + 0.3 * s);
    b.dot(0xffd54f, 0.2 * s, x + 0.35 * s, G + 1.7 * s, z + 0.15 * s);
  }
  [
    [-1.5, 0.9, 0.9], [1.5, 0.9, 0.9],          // beside the door
    [-9.4, 1.0, 1.1], [9.4, 1.0, 1.1],          // front corners
    [-2.4, 10.2, 1.0], [2.4, 10.2, 1.0],        // beside the gate
    [8.8, 9.7, 1.2], [7.3, 10.2, 0.9]           // back right corner of the terrace
  ].forEach(([x, z, s]) => plant(x, z, s));
}
