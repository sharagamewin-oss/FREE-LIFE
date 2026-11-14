// =====================================================
// CIVIC BUILDING: FIRE STATION
// A red brick fire station, 20 x 11 m and 9.5 m tall, with a grey flat roof, three wide white
// garage doors with yellow bands, a small side door, and a tall hose tower at the front-right
// corner rising to 15 m with a small lookout on top.
// In the forecourt: one parked fire truck (static), a fire hydrant and a pole sign.
// =====================================================
// Drawing space (the building's OWN directions, the same idea as a house):
//   origin (0, 0) = the middle of the 24 x 24 m lot.   x = right.
//   +z = the front (street side, the way the doors face).   -z = the back.
//   Body: x from -10 to 10, z from -11 to 0 (front wall at z = 0). Forecourt: z from 0 to 12.
//
// The sign board (drawn by index.js) is always a 10 x 2.5 m board at z = 0.1, so it hangs on the
// front wall above the garage doors (y 5.4 to 7.9), held in a steel pole frame.
// The red pole sign with the fire emblem stands in the forecourt.
export const info = {
  id: 'fire',
  name: 'Fire Station',
  sign: 'FIRE STATION',          // the words on the sign board
  signY: 6.65,                   // middle of the sign board: it covers y 5.4 to 7.9
  height: 15,                    // real height: the top of the hose tower (players can fly over the rest)
  door: { x: 5.45, z: 1.5 },     // in front of the small side door, right of the garage doors
  collide: {
    // box = [centre x, centre z, width, depth, height]
    boxes: [
      [0, -5.5, 20, 11, 9.5],            // the fire station building
      [8.65, -1.35, 3.3, 3.3, 15],       // the hose tower: solid all the way up to 15 m
      [-2.6, 5.9, 2.6, 8.0, 3.3]         // the parked fire truck
    ],
    // round = [x, z, radius, height]
    round: [
      [8.2, 4.0, 0.25, 0.9],             // the fire hydrant
      [9.0, 8.5, 0.2, 5.0]               // the pole sign
    ]
  }
};

export function build(b, c) {
  const G = c.G;   // ground height (0.1)

  // ---------- Colours ----------
  const BRICK = 0xa8432e;          // red brick walls
  const MORTAR = 0xcbbba0;         // light lines between the brick courses
  const STONE_L = 0xc9c3b8;        // light stone: cornice, coping
  const GREY = 0xd5d9dd;           // door frames
  const ROOF = 0x7b8188;           // grey flat roof
  const ROOF_D = 0x5f656b;
  const WHITE = 0xf6f8fa;
  const YELLOW = 0xf2c14e;
  const STEEL = 0x555d66;
  const GLASS = 0x5c7a96;
  const DARK = 0x2e3640;
  const RED = 0xc8202a;            // fire truck and pole sign
  const NAVY = 0x2f4b66;

  // ---------- Main sizes ----------
  const WALL_H = 8.8;
  const TOP = G + WALL_H;          // top of the walls (y 8.9)
  const DECK = TOP + 0.25;         // the roof floor (y 9.15)

  // ---------- Walls ----------
  b.box(BRICK, 20, WALL_H, 11, 0, G, -5.5);

  // Brick courses: thin light lines every 0.5 m on all four walls
  for (let i = 0; i < 17; i++) {
    const y = G + 0.25 + i * 0.5;
    b.box(MORTAR, 20, 0.035, 0.03, 0, y, 0.0);                  // front
    b.box(MORTAR, 20, 0.035, 0.03, 0, y, -11.0);                // back
    b.box(MORTAR, 0.03, 0.035, 11, -10.0, y, -5.5);             // left
    b.box(MORTAR, 0.03, 0.035, 11, 10.0, y, -5.5);              // right
  }

  // Stone base on the sides and the back (the front is left open for the doors)
  b.box(0x8e8a83, 0.1, 0.5, 11.1, -10.0, G, -5.5);
  b.box(0x8e8a83, 0.1, 0.5, 11.1, 10.0, G, -5.5);
  b.box(0x8e8a83, 20.1, 0.5, 0.1, 0, G, -11.0);

  // Stone band under the roof (cornice)
  b.box(STONE_L, 20.3, 0.3, 11.3, 0, TOP - 0.3, -5.5);

  // ---------- Grey flat roof with a brick parapet ----------
  b.box(ROOF, 20.2, 0.25, 11.2, 0, TOP, -5.5);
  b.box(BRICK, 20.2, 0.29, 0.25, 0, DECK, -0.025);              // parapet: front
  b.box(BRICK, 20.2, 0.29, 0.25, 0, DECK, -10.975);             // back
  b.box(BRICK, 0.25, 0.29, 10.7, -9.975, DECK, -5.5);           // left
  b.box(BRICK, 0.25, 0.29, 10.7, 9.975, DECK, -5.5);            // right
  b.box(STONE_L, 20.3, 0.06, 0.35, 0, DECK + 0.29, -0.025);     // stone coping on top (top = y 9.5)
  b.box(STONE_L, 20.3, 0.06, 0.35, 0, DECK + 0.29, -10.975);
  b.box(STONE_L, 0.35, 0.06, 10.8, -9.975, DECK + 0.29, -5.5);
  b.box(STONE_L, 0.35, 0.06, 10.8, 9.975, DECK + 0.29, -5.5);

  // ---------- Three wide garage doors in a row (white with yellow bands) ----------
  const DW = 4.0;
  const DH = 4.2;
  [-7.5, -2.6, 2.3].forEach((cx) => {
    b.box(GREY, DW + 0.5, 0.35, 0.16, cx, G + DH, 0.0);                          // lintel
    [-1, 1].forEach((s) => b.box(GREY, 0.25, DH + 0.35, 0.16, cx + s * (DW / 2 + 0.125), G, 0.0));   // sides
    b.box(WHITE, DW, DH, 0.12, cx, G, 0.0);                                      // the door
    [0.55, 1.8, 2.45].forEach((y) => b.box(0xaeb4ba, DW, 0.03, 0.14, cx, G + y, 0.0));   // panel lines
    [1.1, 2.7].forEach((y) => b.box(YELLOW, DW, 0.45, 0.14, cx, G + y, 0.0));            // yellow bands
    for (let i = 0; i < 4; i++) b.box(DARK, 0.7, 0.4, 0.15, cx - 1.35 + i * 0.9, G + 3.4, 0.0);   // little windows
  });

  // ---------- Small side door (the player door) ----------
  const SDX = 5.45;
  b.box(GREY, 1.25, 2.3, 0.10, SDX, G, 0.0);                    // frame
  b.box(0x2e4a6b, 0.95, 2.1, 0.14, SDX, G, 0.0);                // blue steel door
  b.box(DARK, 0.4, 0.5, 0.16, SDX, G + 1.35, 0.0);              // little window
  b.box(0xc7ced4, 0.06, 0.2, 0.08, SDX + 0.3, G + 1.0, 0.1);    // handle
  b.box(0xaeb4ba, 1.6, 0.1, 0.6, SDX, G, 0.3);                  // step
  b.box(STEEL, 0.06, 0.06, 0.3, SDX, G + 2.55, 0.15);           // lamp bracket
  b.ball(0xe53935, 0.28, SDX, G + 2.6, 0.32);                   // red lamp over the door

  // ---------- Upper windows ----------
  // axis 'x' = a wall facing front or back, axis 'z' = a side wall; dir = +1 or -1 (outwards)
  function win(axis, cc, y, w0, dir) {
    const part = (col, ww, hh, dep, yy, off) => {
      if (axis === 'x') b.box(col, ww, hh, dep, cc, yy, w0 + dir * off);
      else b.box(col, dep, hh, ww, w0 + dir * off, yy, cc);
    };
    part(GREY, 1.4, 1.9, 0.10, y - 0.15, 0);                    // frame
    part(GLASS, 1.1, 1.6, 0.14, y, 0);                          // glass
    part(GREY, 0.06, 1.6, 0.16, y, 0);                          // middle bar
    part(GREY, 1.1, 0.06, 0.16, y + 0.8, 0);                    // cross bar
    part(STONE_L, 1.6, 0.1, 0.3, y - 0.25, 0.15);               // sill
  }
  [-8.4, -6.2, 6.2].forEach((x) => win('x', x, 5.6, 0, 1));     // front, above the doors
  [-6.0, -2.0, 2.0, 6.0].forEach((x) => win('x', x, 5.6, -11, -1));   // back
  [-5.4, -8.2].forEach((z) => {
    win('z', z, 5.6, 10, 1);                                    // right side
    win('z', z, 5.6, -10, -1);                                  // left side
  });
  [-5.4, -8.2].forEach((z) => {
    win('z', z, 2.2, -10, -1);                                  // lower windows, left side
  });

  // ---------- Sign backing and steel pole frame (the board is drawn by index.js, y 5.4 to 7.9) ----------
  b.box(NAVY, 10.3, 2.5, 0.04, 0, 5.4, 0.02);
  [-5.3, 5.3].forEach((x) => b.box(STEEL, 0.25, 3.75, 0.25, x, 4.65, 0.12));   // two steel poles
  b.box(STEEL, 10.85, 0.14, 0.2, 0, 7.95, 0.12);                               // top rail
  b.box(STEEL, 10.85, 0.14, 0.2, 0, 5.25, 0.12);                               // bottom rail

  // =====================================================
  // THE HOSE TOWER (front-right corner, rises to 15 m)
  // =====================================================
  const TX = 8.65;
  const TZ = -1.35;
  b.box(BRICK, 3.3, 11.4, 3.3, TX, G, TZ);                       // shaft (y 0.1 to 11.5)
  for (let i = 0; i < 23; i++) {                                 // brick courses on the tower
    const y = G + 0.25 + i * 0.5;
    b.box(MORTAR, 3.3, 0.035, 0.03, TX, y, TZ + 1.65);           // front
    b.box(MORTAR, 0.03, 0.035, 3.3, TX + 1.65, y, TZ);           // right
    if (y > 9.6) {
      b.box(MORTAR, 0.03, 0.035, 3.3, TX - 1.65, y, TZ);         // left (above the roof)
      b.box(MORTAR, 3.3, 0.035, 0.03, TX, y, TZ - 1.65);         // back (above the roof)
    }
  }
  // Tall slit windows
  [5.4, 9.9].forEach((y) => {
    b.box(GREY, 0.6, 1.7, 0.10, TX, y, TZ + 1.65);               // front
    b.box(DARK, 0.36, 1.5, 0.12, TX, y + 0.1, TZ + 1.65);
    b.box(GREY, 0.10, 1.7, 0.6, TX + 1.65, y, TZ);               // right
    b.box(DARK, 0.12, 1.5, 0.36, TX + 1.65, y + 0.1, TZ);
  });
  b.box(STONE_L, 3.7, 0.3, 3.7, TX, 11.5, TZ);                   // stone band at the top of the shaft
  b.box(0x6b7280, 3.9, 0.2, 3.9, TX, 11.8, TZ);                  // lookout floor (y 11.8 to 12.0)
  // Lookout cabin: brick rail round the bottom, glass above, white corner posts
  b.box(BRICK, 3.0, 0.55, 3.0, TX, 12.0, TZ);
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => b.box(WHITE, 0.25, 1.5, 0.25, TX + sx * 1.4, 12.0, TZ + sz * 1.4));
  [[0, 1.4, 2.55, 0.08], [0, -1.4, 2.55, 0.08], [1.4, 0, 0.08, 2.55], [-1.4, 0, 0.08, 2.55]].forEach(([dx, dz, w, d]) => {
    b.box(GLASS, w, 0.95, d, TX + dx, 12.55, TZ + dz);
    if (dx === 0) b.box(WHITE, 0.06, 0.95, 0.1, TX, 12.55, TZ + dz);
    else b.box(WHITE, 0.1, 0.95, 0.06, TX + dx, 12.55, TZ);
  });
  b.box(ROOF_D, 3.6, 0.2, 3.6, TX, 13.5, TZ);                    // lookout roof
  [3.2, 2.7, 2.2, 1.7, 1.2, 0.7].forEach((s, k) => b.box(ROOF_D, s, 0.2, s, TX, 13.7 + k * 0.2, TZ));   // stepped pyramid top
  b.ball(0xe0b04b, 0.2, TX, 14.9, TZ);                           // gold ball (top of the tower = y 15.0)

  // =====================================================
  // FORECOURT: apron, fire truck, hydrant, pole sign
  // =====================================================
  b.box(0xa7adb3, 16.8, 0.04, 10.0, -1.6, G, 5.0);                // concrete apron in front of the doors
  b.box(YELLOW, 16.8, 0.01, 0.15, -1.6, G + 0.04, 9.95);          // yellow line along its edge

  // ---------- The parked fire truck (static; nose points to the street) ----------
  const FX = -2.6;
  const FZ = 6.0;
  b.box(0x2f343a, 2.2, 0.3, 7.6, FX, G + 0.45, FZ - 0.2);                         // chassis
  b.box(RED, 2.5, 1.7, 5.0, FX, G + 0.75, FZ - 1.4);                              // body at the back
  b.box(RED, 2.5, 2.05, 2.35, FX, G + 0.75, FZ + 2.275);                          // cab
  b.box(GLASS, 2.1, 0.85, 0.05, FX, G + 1.75, FZ + 3.47);                         // windscreen
  b.box(0x3a3f45, 1.6, 0.6, 0.05, FX, G + 1.15, FZ + 3.47);                       // grille
  [-0.9, 0.9].forEach((x) => b.box(0xfff3c4, 0.3, 0.2, 0.05, FX + x, G + 1.15, FZ + 3.47));   // headlights
  b.box(0xc7ced4, 2.6, 0.25, 0.3, FX, G + 0.5, FZ + 3.55);                        // front bumper
  b.box(0x4a5058, 2.5, 0.25, 0.3, FX, G + 0.5, FZ - 4.0);                         // back bumper
  b.box(WHITE, 2.54, 0.2, 0.05, FX, G + 0.85, FZ + 3.47);                         // white stripe: front
  b.box(WHITE, 2.54, 0.2, 0.05, FX, G + 0.85, FZ - 3.92);                         // white stripe: back
  [-1, 1].forEach((s) => {
    b.box(WHITE, 0.05, 0.2, 7.35, FX + s * 1.27, G + 0.85, FZ - 0.225);           // white stripe along the side
    b.box(GLASS, 0.05, 0.75, 1.1, FX + s * 1.26, G + 1.85, FZ + 2.4);             // cab side window
    [-3.1, -1.7, -0.3].forEach((dz) => b.box(0xb4bbc2, 0.05, 1.0, 1.25, FX + s * 1.27, G + 1.15, FZ + dz));   // roller shutters
    [FZ + 2.7, FZ - 1.9, FZ - 3.1].forEach((z) => {                               // wheels
      b.cylRot(0x24282c, 1.1, 0.4, FX + s * 1.1, G + 0.55, z, 0, 0, Math.PI / 2);
      b.cylRot(0xcfd5da, 0.55, 0.42, FX + s * 1.1, G + 0.55, z, 0, 0, Math.PI / 2);
    });
    b.box(STEEL, 0.1, 0.5, 0.1, FX + s * 0.35, G + 2.45, FZ - 3.2);               // ladder supports
    b.box(STEEL, 0.1, 0.5, 0.1, FX + s * 0.35, G + 2.45, FZ - 0.8);
    b.box(STEEL, 0.1, 0.25, 0.1, FX + s * 0.35, G + 2.8, FZ + 2.0);
    b.box(0xcfd5da, 0.08, 0.1, 6.4, FX + s * 0.35, G + 3.05, FZ - 0.6);           // ladder rails
  });
  for (let i = 0; i < 16; i++) b.box(0xcfd5da, 0.78, 0.05, 0.05, FX, G + 3.1, FZ - 3.6 + i * 0.4);   // ladder rungs
  b.box(0xe53935, 0.7, 0.15, 0.3, FX - 0.4, G + 2.8, FZ + 3.0);                   // light bar: red
  b.box(0x1e88e5, 0.7, 0.15, 0.3, FX + 0.4, G + 2.8, FZ + 3.0);                   // light bar: blue
  b.box(0x8a9096, 1.8, 0.1, 0.45, FX, G + 0.55, FZ - 4.2);                        // back step

  // ---------- Fire hydrant ----------
  const HX = 8.2;
  const HZ = 4.0;
  b.cyl(0x9aa0a6, 0.42, 0.08, HX, G, HZ);                                         // base
  b.cyl(0xd22b2b, 0.34, 0.6, HX, G + 0.08, HZ);                                   // body
  b.ball(0xd22b2b, 0.36, HX, G + 0.68, HZ, 0.7);                                  // dome
  b.ball(0xe0b04b, 0.12, HX, G + 0.82, HZ);                                       // top nut
  b.cylRot(0xcfd3d6, 0.13, 0.55, HX, G + 0.4, HZ, 0, 0, Math.PI / 2);             // side nozzles
  b.cylRot(0xcfd3d6, 0.16, 0.2, HX, G + 0.3, HZ + 0.2, Math.PI / 2, 0, 0);        // front nozzle

  // ---------- Pole sign (red panel with the fire emblem, faces the street) ----------
  const PX = 9.0;
  const PZ = 8.5;
  b.box(STEEL, 0.6, 0.2, 0.6, PX, G, PZ);                                         // base
  b.cyl(STEEL, 0.22, 4.6, PX, G + 0.2, PZ);                                       // pole (up to y 4.9)
  b.box(RED, 2.0, 1.5, 0.12, PX, G + 3.2, PZ + 0.0);                              // red panel
  b.box(YELLOW, 2.0, 0.2, 0.14, PX, G + 3.0, PZ);                                 // yellow band under it
  b.box(STEEL, 2.1, 0.1, 0.16, PX, G + 4.7, PZ);                                  // top cap
  b.cylRot(WHITE, 1.1, 0.04, PX, G + 3.95, PZ + 0.07, Math.PI / 2, 0, 0);         // white ring
  b.cylRot(RED, 0.8, 0.05, PX, G + 3.95, PZ + 0.08, Math.PI / 2, 0, 0);           // red inside
  b.slab(WHITE, 0.62, 0.1, 0.05, PX, G + 3.95, PZ + 0.12, 0, 0, Math.PI / 4);     // white X (maltese cross)
  b.slab(WHITE, 0.62, 0.1, 0.05, PX, G + 3.95, PZ + 0.12, 0, 0, -Math.PI / 4);
}
