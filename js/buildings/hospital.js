// =====================================================
// CIVIC BUILDING: CITY HOSPITAL
// A white three-storey hospital, 20 x 11 m and 14 m tall (the top of the water tank).
// Light-blue window bands on every floor, a flat roof with a round helipad (blue disc, white H)
// and a small water tank, a big red cross above a glass entrance, a covered ambulance bay
// (flat canopy on four posts) with a parked ambulance, and benches in the forecourt.
// =====================================================
// Drawing space (the building's OWN directions, the same idea as a house):
//   origin (0, 0) = the middle of the 24 x 24 m lot.   x = right.
//   +z = the front (street side, the way the door faces).   -z = the back.
//   Body: x from -10 to 10, z from -11 to 0 (front wall at z = 0). Forecourt: z from 0 to 12.
//
// The sign board (drawn by index.js) is a 10 x 2.5 m board at z = 0.1, so nothing else
// is built in front of the wall where the board hangs (x -5.2 to 5.2, y 8.7 to 11.5).
export const info = {
  id: 'hospital',
  name: 'Hospital',
  sign: 'CITY HOSPITAL',         // the words on the sign board
  signY: 10.1,                   // middle of the sign board: it covers y 8.85 to 11.35 (third floor)
  height: 14,                    // real height: the top of the water tank (players can fly over it)
  door: { x: 0, z: 1.5 },        // in front of the glass entrance, in the middle of the front wall
  collide: {
    // box = [centre x, centre z, width, depth, height]
    boxes: [
      [0, -5.5, 20, 11, 14],             // the hospital building
      [7.0, 4.5, 2.1, 5.4, 2.7],         // the parked ambulance
      [-3.8, 4.0, 0.5, 1.8, 0.9],        // bench 1 (faces the path)
      [-3.8, 8.0, 0.5, 1.8, 0.9],        // bench 2 (faces the path)
      [-7.5, 3.0, 1.8, 0.5, 0.9]         // bench 3 (back to the hospital)
    ],
    // round = [x, z, radius, height]
    round: [
      [-2.5, 2.2, 0.2, 3.4],             // the two posts of the entrance canopy
      [2.5, 2.2, 0.2, 3.4],
      [4.35, 1.3, 0.2, 3.75],            // the four posts of the ambulance bay
      [9.65, 1.3, 0.2, 3.75],
      [4.35, 7.7, 0.2, 3.75],
      [9.65, 7.7, 0.2, 3.75],
      [-3.4, 0.7, 0.65, 1.2],            // the two planters beside the entrance
      [3.4, 0.7, 0.65, 1.2]
    ]
  }
};

export function build(b, c) {
  const G = c.G;   // ground height (0.1)

  // ---------- Colours ----------
  const WALL = 0xf8f9fb;          // white walls
  const TRIM = 0xdde3e8;          // light grey: plinth, belts, frames, roof edge
  const FRAME = 0xc3ced8;         // window frames
  const MULLION = 0xf2f6f9;       // thin white bars in the window bands
  const BAND = 0xa9d8f5;          // light-blue window glass
  const GLASS_CLEAR = 0xbfe6f5;   // the entrance glass
  const STEEL = 0x6b7a88;
  const RED = 0xd9232d;
  const BLUE = 0x2f6fb5;          // helipad
  const WHITE = 0xffffff;
  const NAVY = 0x2f4b66;          // frame behind the sign board
  const LEAF = 0x4f9e4a;
  const LEAF_LIGHT = 0x62b552;
  const WOOD = 0xb5793f;
  const ASPHALT = 0x6b727a;
  const YELLOW = 0xf2c14e;

  // ---------- Main sizes ----------
  const FLOOR_H = 4.0;                        // three floors of 4 m
  const WALL_H = FLOOR_H * 3;                 // 12 m of wall
  const TOP = G + WALL_H;                     // top of the walls (y = 12.1)
  const F2 = G + FLOOR_H;                     // floor 2 starts (y = 4.1)
  const F3 = G + FLOOR_H * 2;                 // floor 3 starts (y = 8.1)
  const DECK = TOP + 0.25;                    // the roof floor (y = 12.35)

  // ---------- Walls ----------
  b.box(WALL, 20, WALL_H, 11, 0, G, -5.5);

  // ---------- Corner pillars (stick out a little from the walls) ----------
  [[-1, 0], [1, 0], [-1, -11], [1, -11]].forEach(([sx, z0]) => {
    b.box(TRIM, 0.8, WALL_H, 0.86, sx * 9.66, G, z0 === 0 ? -0.37 : -10.63);
  });

  // Belts between the floors
  [3.9, 7.9].forEach((dy) => b.box(TRIM, 20.16, 0.2, 11.16, 0, G + dy, -5.5));

  // ---------- Window bands ----------
  // axis 'x' = a wall that faces front or back (length runs along x)
  // axis 'z' = a side wall (length runs along z); dir = +1 faces +x/+z, -1 faces -x/-z.
  function band(axis, c1, c2, y, h, w0, dir) {
    const len = c2 - c1;
    const mid = (c1 + c2) / 2;
    const part = (col, l, hh, dep, cc, yy, off) => {
      if (axis === 'x') b.box(col, l, hh, dep, cc, yy, w0 + dir * off);
      else b.box(col, dep, hh, l, w0 + dir * off, yy, cc);
    };
    part(FRAME, len + 0.3, h + 0.3, 0.10, mid, y - 0.15, 0);        // frame
    part(BAND, len, h, 0.14, mid, y, 0);                            // light-blue glass
    const n = Math.max(1, Math.round(len / 1.6));
    for (let i = 1; i < n; i++) part(MULLION, 0.07, h, 0.18, c1 + (len * i) / n, y, 0);
    part(TRIM, len + 0.4, 0.1, 0.3, mid, y - 0.25, 0.15);           // sill
  }

  const BAND_H = 1.8;
  const bandY = [G + 1.1, F2 + 1.1, F3 + 1.1];   // bottom of the glass on floors 1, 2, 3

  // Front wall (the door, the red cross and the sign board have their own places)
  [1, -1].forEach((s) => {
    const lo = (a, z) => [Math.min(s * a, s * z), Math.max(s * a, s * z)];
    band('x', ...lo(2.7, 9.2), bandY[0], BAND_H, 0, 1);    // floor 1: beside the entrance
    band('x', ...lo(2.6, 9.2), bandY[1], BAND_H, 0, 1);    // floor 2: beside the red cross
    band('x', ...lo(5.4, 9.2), bandY[2], BAND_H, 0, 1);    // floor 3: beside the sign board
  });
  // Side walls and back wall (full length, all three floors)
  bandY.forEach((y) => {
    band('z', -9.8, -1.2, y, BAND_H, 10, 1);
    band('z', -9.8, -1.2, y, BAND_H, -10, -1);
    band('x', -9.2, 9.2, y, BAND_H, -11, -1);
  });

  // Low stone plinth (the front is left open where the entrance is)
  b.box(TRIM, 7.9, 0.5, 0.1, -6.15, G, 0);
  b.box(TRIM, 7.9, 0.5, 0.1, 6.15, G, 0);
  b.box(TRIM, 0.1, 0.5, 11.1, -10.0, G, -5.5);
  b.box(TRIM, 0.1, 0.5, 11.1, 10.0, G, -5.5);
  b.box(TRIM, 20.1, 0.5, 0.1, 0, G, -11.0);

  // ---------- Sign backing (the board itself is drawn by index.js at z = 0.1) ----------
  b.box(NAVY, 10.4, 2.8, 0.06, 0, 8.7, 0.03);

  // ---------- Big red cross on the front, above the entrance ----------
  b.box(RED, 1.1, 3.4, 0.1, 0, 4.4, 0.0);        // upright
  b.box(RED, 3.4, 1.1, 0.1, 0, 5.55, 0.0);       // cross arm (same middle, y 5.55 to 6.65)

  // ---------- Glass entrance in the middle of the front wall ----------
  b.box(FRAME, 4.3, 3.2, 0.10, 0, G, 0.0);                       // frame
  b.box(GLASS_CLEAR, 3.9, 3.0, 0.14, 0, G, 0.0);                 // glass
  [-1.0, 0, 1.0].forEach((x) => b.box(STEEL, 0.08, 3.0, 0.18, x, G, 0.0));   // door edges and the middle split
  b.box(STEEL, 3.9, 0.08, 0.18, 0, G + 2.35, 0.0);               // bar across the top of the doors
  b.box(0x4a5560, 3.2, 0.03, 1.2, 0, G, 0.7);                    // doormat

  // Flat canopy over the entrance on two posts, with a red edge
  b.box(TRIM, 5.6, 0.2, 2.4, 0, 3.2, 1.2);
  b.box(RED, 5.6, 0.1, 0.06, 0, 3.25, 2.43);
  [-2.5, 2.5].forEach((x) => b.cyl(STEEL, 0.2, 3.1, x, G, 2.2));

  // ---------- Paths and paving ----------
  b.box(0xe9edf0, 4.2, 0.04, 11.5, 0, G, 5.75);                  // path from the street to the door

  // Planters beside the entrance
  [-3.4, 3.4].forEach((x, i) => {
    b.box(0xc8d0d8, 1.2, 0.5, 0.7, x, G, 0.7);
    b.ball(LEAF, 0.9, x - 0.25, G + 0.75, 0.7, 0.9);
    b.ball(LEAF_LIGHT, 0.8, x + 0.25, G + 0.72, 0.7, 0.9);
    b.dot(i === 0 ? 0xf48fb1 : 0xffd54f, 0.2, x, G + 1.05, 0.9);
  });

  // ---------- Flat roof, parapet and roof things ----------
  b.box(TRIM, 20.5, 0.25, 11.5, 0, TOP, -5.5);                   // roof floor (sticks out 0.25 m)
  b.box(TRIM, 20.5, 0.4, 0.3, 0, DECK, 0.1);                     // parapet: front
  b.box(TRIM, 20.5, 0.4, 0.3, 0, DECK, -11.1);                   // parapet: back
  b.box(TRIM, 0.3, 0.4, 10.9, -10.1, DECK, -5.5);                // parapet: left
  b.box(TRIM, 0.3, 0.4, 10.9, 10.1, DECK, -5.5);                 // parapet: right

  // Round helipad: white ring, blue disc, white H
  const HX = -4.5;
  const HZ = -5.5;
  b.cyl(WHITE, 7.8, 0.06, HX, DECK, HZ);
  b.cyl(BLUE, 7.2, 0.06, HX, DECK + 0.06, HZ);
  const HT = DECK + 0.12;                                        // top of the blue disc
  b.box(WHITE, 0.5, 0.03, 3.0, HX - 0.9, HT, HZ);                // H: left upright
  b.box(WHITE, 0.5, 0.03, 3.0, HX + 0.9, HT, HZ);                // H: right upright
  b.box(WHITE, 1.4, 0.03, 0.5, HX, HT, HZ);                      // H: bar in the middle
  for (let i = 0; i < 8; i++) {                                  // little lights round the edge
    const a = (i * Math.PI) / 4;
    b.dot(YELLOW, 0.18, HX + Math.cos(a) * 3.7, HT + 0.08, HZ + Math.sin(a) * 3.7);
  }

  // Stair head (the little roof house for the stairs)
  b.box(WALL, 2.6, 1.45, 2.2, 7.6, DECK, -3.3);
  b.box(TRIM, 2.8, 0.1, 2.4, 7.6, DECK + 1.45, -3.3);
  b.box(STEEL, 0.9, 1.2, 0.06, 7.6, DECK, -2.18);

  // Small water tank on four legs (its top is the highest point: y = 14.0)
  const TX = 7.6;
  const TZ = -8.6;
  [-0.6, 0.6].forEach((dx) => [-0.6, 0.6].forEach((dz) => b.box(STEEL, 0.14, 0.5, 0.14, TX + dx, DECK, TZ + dz)));
  b.box(STEEL, 1.7, 0.08, 1.7, TX, DECK + 0.5, TZ);              // platform
  b.cyl(0xcfd8e0, 1.5, 0.72, TX, DECK + 0.58, TZ);               // the tank
  b.cyl(STEEL, 1.56, 0.06, TX, DECK + 0.75, TZ);                 // two metal rings
  b.cyl(STEEL, 1.56, 0.06, TX, DECK + 1.1, TZ);
  b.cone(0xcfd8e0, 1.5, 0.35, TX, DECK + 1.3, TZ);               // lid (top = 14.0)
  [-0.15, 0.15].forEach((dz) => b.box(STEEL, 0.05, 1.45, 0.05, TX + 0.9, DECK, TZ + dz));   // ladder
  [0.3, 0.6, 0.9, 1.2].forEach((dy) => b.box(STEEL, 0.05, 0.04, 0.3, TX + 0.9, DECK + dy, TZ));

  // ---------- Covered ambulance bay (right side of the forecourt) ----------
  b.box(ASPHALT, 6.0, 0.03, 7.6, 7.0, G, 4.5);                   // dark floor
  [4.6, 9.4].forEach((x) => b.box(YELLOW, 0.1, 0.01, 6.0, x, G + 0.03, 4.5));   // yellow lines
  b.box(TRIM, 6.0, 0.25, 7.2, 7.0, 3.5, 4.5);                    // flat canopy
  b.box(RED, 6.0, 0.12, 0.06, 7.0, 3.56, 8.13);                  // red edge: front
  b.box(RED, 0.06, 0.12, 7.2, 3.97, 3.56, 4.5);                  // red edge: left
  b.box(RED, 0.06, 0.12, 7.2, 10.03, 3.56, 4.5);                 // red edge: right
  [[4.35, 1.3], [9.65, 1.3], [4.35, 7.7], [9.65, 7.7]].forEach(([x, z]) => b.cyl(STEEL, 0.3, 3.5, x, G, z));

  // ---------- The parked ambulance (static; nose points to the street) ----------
  const AX = 7.0;
  const AZ = 4.5;
  const GLASS_DARK = 0x3d5a73;
  b.box(0x3a4048, 1.9, 0.25, 5.3, AX, G + 0.3, AZ);                          // chassis
  b.box(WHITE, 2.1, 1.9, 3.3, AX, G + 0.55, AZ - 1.05);                      // box at the back
  b.box(WHITE, 2.1, 1.5, 1.2, AX, G + 0.55, AZ + 1.2);                       // cab
  b.box(WHITE, 2.1, 0.8, 0.9, AX, G + 0.55, AZ + 2.25);                      // bonnet
  b.box(GLASS_DARK, 1.8, 0.6, 0.05, AX, G + 1.4, AZ + 1.81);                 // windscreen
  [-1, 1].forEach((s) => {
    b.box(RED, 0.05, 0.3, 5.4, AX + s * 1.07, G + 1.0, AZ);                  // red stripe along the side
    b.box(GLASS_DARK, 0.05, 0.5, 0.9, AX + s * 1.07, G + 1.4, AZ + 1.2);     // cab side window
    b.box(RED, 0.05, 0.7, 0.2, AX + s * 1.07, G + 1.55, AZ - 1.2);           // red cross on the side
    b.box(RED, 0.05, 0.2, 0.7, AX + s * 1.07, G + 1.8, AZ - 1.2);
    [AZ - 1.6, AZ + 1.7].forEach((z) => {                                    // wheels
      b.cylRot(0x2b2f33, 0.8, 0.28, AX + s * 0.98, G + 0.4, z, 0, 0, Math.PI / 2);
      b.cylRot(0xcfd5da, 0.4, 0.3, AX + s * 0.98, G + 0.4, z, 0, 0, Math.PI / 2);
    });
    b.dot(0xfff3c4, 0.22, AX + s * 0.7, G + 0.78, AZ + 2.71);                // headlights
  });
  b.box(RED, 2.14, 0.3, 0.04, AX, G + 1.0, AZ + 2.72);                       // red stripe on the front
  b.box(RED, 2.14, 0.3, 0.04, AX, G + 1.0, AZ - 2.72);                       // red stripe on the back
  b.box(0xaab4bc, 0.04, 1.7, 0.04, AX, G + 0.65, AZ - 2.735);                // back doors split
  [-0.5, 0.5].forEach((dx) => b.box(GLASS_DARK, 0.5, 0.45, 0.04, AX + dx, G + 1.6, AZ - 2.72));   // back windows
  b.box(0x4a5058, 2.1, 0.25, 0.14, AX, G + 0.35, AZ + 2.77);                 // front bumper
  b.box(0x4a5058, 2.1, 0.25, 0.14, AX, G + 0.35, AZ - 2.77);                 // back bumper
  b.box(0xe53935, 0.8, 0.14, 0.3, AX - 0.45, G + 2.05, AZ + 1.2);            // light bar: red
  b.box(0x1e88e5, 0.8, 0.14, 0.3, AX + 0.45, G + 2.05, AZ + 1.2);            // light bar: blue

  // ---------- Benches in the forecourt ----------
  // face 'x+' = looks to the right (long side runs along z); face 'z+' = looks to the front.
  function bench(x, z, face) {
    const bb = (col, lw, h, ld, lu, y, lv) => {
      if (face === 'z+') b.box(col, lw, h, ld, x + lu, y, z + lv);
      else b.box(col, ld, h, lw, x + lv, y, z + lu);
    };
    bb(WOOD, 1.8, 0.07, 0.5, 0, G + 0.44, 0);                    // seat
    bb(WOOD, 1.8, 0.45, 0.06, 0, G + 0.51, -0.22);               // back rest
    [-0.8, 0.8].forEach((u) => bb(STEEL, 0.08, 0.44, 0.5, u, G, 0));   // legs
  }
  bench(-3.8, 4.0, 'x+');
  bench(-3.8, 8.0, 'x+');
  bench(-7.5, 3.0, 'z+');
}
