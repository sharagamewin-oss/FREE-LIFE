// =====================================================
// CIVIC BUILDING: FREE LIFE CORP
// A modern six-floor office building, 20 x 11 m and 22 m tall (the top of the flagpole).
// Blue-tinted glass bands between white floor slabs, a double-height glass lobby with a flat
// entrance canopy, a small crown on the roof with a big logo block, and a flagpole.
// In the forecourt: a stone plaza with 2 steps, planters, benches and two lamp posts.
// =====================================================
// Drawing space (the building's OWN directions, the same idea as a house):
//   origin (0, 0) = the middle of the 24 x 24 m lot.   x = right.
//   +z = the front (street side, the way the door faces).   -z = the back.
//   Body: x from -10 to 10, z from -11 to 0 (front wall at z = 0). Forecourt: z from 0 to 12.
//
// The sign board (drawn by index.js) is a 10 x 2.5 m board at z = 0.1. It hangs on the front
// glass wall in the gap between the first two floor slabs (y 4.3 to 6.8), just above the canopy.
// The two plaza steps are only for looks: the ground in the game is flat, so you just walk over them.
export const info = {
  id: 'company',
  name: 'Company',
  sign: 'FREE LIFE CORP',        // the words on the sign board
  signY: 5.55,                   // middle of the sign board: it covers y 4.3 to 6.8
  height: 22,                    // real height: the top of the flagpole (players can fly over it)
  door: { x: 0, z: 1.5 },        // on the plaza, in front of the glass doors in the middle of the lobby
  collide: {
    // box = [centre x, centre z, width, depth, height]
    boxes: [
      [0, -5.5, 20, 11, 22],             // the office building
      [-5.0, 1.2, 0.8, 1.8, 1.2],        // long planter beside the entrance (left)
      [5.0, 1.2, 0.8, 1.8, 1.2],         // long planter beside the entrance (right)
      [-8.2, 4.0, 0.5, 1.8, 0.9],        // bench (faces the plaza)
      [8.2, 4.0, 0.5, 1.8, 0.9],         // bench (faces the plaza)
      [-3.0, 9.0, 1.8, 0.5, 0.9],        // bench (faces the building)
      [3.0, 9.0, 1.8, 0.5, 0.9]          // bench (faces the building)
    ],
    // round = [x, z, radius, height]
    round: [
      [-3.2, 3.0, 0.2, 3.4],             // the two posts of the entrance canopy
      [3.2, 3.0, 0.2, 3.4],
      [-5.2, 5.0, 0.7, 1.4],             // round planters at the front corners of the plaza
      [5.2, 5.0, 0.7, 1.4],
      [-6.9, 6.8, 0.15, 3.6],            // lamp posts
      [6.9, 6.8, 0.15, 3.6]
    ]
    // The plaza steps are NOT in these lists: you can walk over them.
  }
};

export function build(b, c) {
  const G = c.G;   // ground height (0.1)

  // ---------- Colours ----------
  const WHITE = 0xf6f8fa;           // floor slabs, mullions, corner fins
  const GLASS = 0x4f93cf;           // blue-tinted glass of the office floors
  const LOBBY_GLASS = 0x9fd0ee;     // lighter glass of the lobby
  const DOOR_GLASS = 0x6fb0dc;
  const BLUE_DARK = 0x1f4e8c;       // logo block, canopy edge, flag
  const NAVY = 0x2f4b66;
  const GREY = 0xdde3e8;
  const STEEL = 0x4a5560;
  const STONE_1 = 0xc4cad1;         // plaza step 1
  const STONE_2 = 0xe3e7eb;         // plaza top
  const STONE_LINE = 0xb0b8c0;
  const PLANTER = 0xb8bec6;
  const LEAF = 0x4f9e4a;
  const LEAF_LIGHT = 0x62b552;
  const WOOD = 0xb5793f;

  // ---------- Floor heights ----------
  // Lobby 4.0 m + five office floors of 2.9 m = six floors, walls up to y = 18.6.
  const LOBBY_TOP = G + 3.8;                      // top of the lobby glass (y 3.9)
  const TOP = G + 4.0 + 2.9 * 5;                  // top of the walls (y 18.6)
  const SLABS = [4.1, 7.0, 9.9, 12.8, 15.7];      // middle height of each floor slab
  const DECK = TOP + 0.4;                         // the roof floor (y 19.0)

  // ---------- Glass body ----------
  b.box(LOBBY_GLASS, 20, 3.8, 11, 0, G, -5.5);                  // lobby: light glass
  b.box(GLASS, 20, TOP - LOBBY_TOP, 11, 0, LOBBY_TOP, -5.5);    // office floors: blue glass

  // White floor slabs (stick out a little all round)
  SLABS.forEach((y) => b.box(WHITE, 20.24, 0.4, 11.24, 0, y - 0.2, -5.5));

  // White corner fins, full height
  [[-9.85, -0.05], [9.85, -0.05], [-9.85, -10.95], [9.85, -10.95]].forEach(([x, z]) => {
    b.box(WHITE, 0.5, TOP - G, 0.5, x, G, z);
  });

  // Thin white vertical bars (mullions) on the office floors: front, back and both sides
  for (let i = 0; i < 11; i++) {
    const x = -9.0 + i * 1.8;
    b.box(WHITE, 0.08, TOP - 4.3, 0.1, x, 4.3, 0.0);            // front
    b.box(WHITE, 0.08, TOP - 4.3, 0.1, x, 4.3, -11.0);          // back
  }
  for (let i = 0; i < 6; i++) {
    const z = -1.5 - i * 1.6;
    b.box(WHITE, 0.1, TOP - 4.3, 0.08, 10.0, 4.3, z);           // right side
    b.box(WHITE, 0.1, TOP - 4.3, 0.08, -10.0, 4.3, z);          // left side
  }

  // ---------- Glass lobby (double height) ----------
  // Bars on the front, left and right of the doors
  for (let i = 0; i < 13; i++) {
    const x = -9.6 + i * 1.6;
    if (Math.abs(x) > 2.4) b.box(WHITE, 0.1, 3.8, 0.12, x, G, 0.0);
  }
  [-1, 1].forEach((s) => b.box(WHITE, 7.4, 0.1, 0.12, s * 5.9, G + 3.0, 0.0));   // bar across the front glass
  for (let i = 0; i < 6; i++) {                                                  // sides and back
    const z = -1.5 - i * 1.6;
    b.box(WHITE, 0.12, 3.8, 0.1, 10.0, G, z);
    b.box(WHITE, 0.12, 3.8, 0.1, -10.0, G, z);
  }
  for (let i = 0; i < 12; i++) b.box(WHITE, 0.1, 3.8, 0.12, -9.9 + i * 1.8, G, -11.0);

  // Glass entrance doors in the middle of the lobby
  b.box(WHITE, 4.2, 3.2, 0.12, 0, G, 0.0);                                       // frame
  b.box(DOOR_GLASS, 3.8, 3.0, 0.14, 0, G, 0.0);                                  // glass
  [-1.0, 0, 1.0].forEach((x) => b.box(WHITE, 0.08, 3.0, 0.18, x, G, 0.0));        // door edges, middle split
  b.box(WHITE, 3.8, 0.08, 0.18, 0, G + 2.4, 0.0);                                // bar across the top
  [-0.25, 0.25].forEach((x) => b.box(STEEL, 0.05, 0.6, 0.06, x, G + 1.0, 0.1));  // door handles

  // Flat entrance canopy on two thin posts, with a blue edge
  b.box(WHITE, 7.0, 0.25, 3.2, 0, 3.3, 1.6);
  b.box(BLUE_DARK, 7.0, 0.1, 0.06, 0, 3.35, 3.23);
  [-3.2, 3.2].forEach((x) => b.cyl(GREY, 0.25, 3.3, x, G, 3.0));

  // ---------- Sign backing (the board is drawn by index.js at z = 0.1, y 4.3 to 6.8) ----------
  b.box(NAVY, 10.3, 2.5, 0.04, 0, 4.3, 0.02);

  // ---------- Roof, parapet, crown, logo block ----------
  b.box(WHITE, 20.5, 0.4, 11.5, 0, TOP, -5.5);                  // roof floor (sticks out 0.25 m)
  b.box(WHITE, 20.5, 0.5, 0.2, 0, DECK, 0.15);                  // low parapet: front
  b.box(WHITE, 20.5, 0.5, 0.2, 0, DECK, -11.15);                // back
  b.box(WHITE, 0.2, 0.5, 10.9, -10.15, DECK, -5.5);             // left
  b.box(WHITE, 0.2, 0.5, 10.9, 10.15, DECK, -5.5);              // right

  b.box(0xe8edf1, 9.0, 0.9, 5.0, 0, DECK, -5.5);                // the crown (y 19.0 to 19.9)
  b.box(BLUE_DARK, 9.04, 0.2, 5.04, 0, DECK + 0.4, -5.5);       // blue stripe round the crown
  b.box(BLUE_DARK, 5.2, 1.7, 1.0, 0, DECK + 0.9, -3.8);         // the big logo block (y 19.9 to 21.6)
  // Emblem on the front of the logo block: a white ring with a dot, and two white bars
  const LZ = -3.3;                                              // front face of the logo block
  const LY = DECK + 0.9 + 0.85;                                 // middle height of the logo block
  b.cylRot(WHITE, 1.1, 0.08, 0, LY, LZ, Math.PI / 2, 0, 0);
  b.cylRot(BLUE_DARK, 0.7, 0.1, 0, LY, LZ, Math.PI / 2, 0, 0);
  b.cylRot(WHITE, 0.3, 0.12, 0, LY, LZ, Math.PI / 2, 0, 0);
  [-1.5, 1.5].forEach((x) => b.box(WHITE, 1.3, 0.22, 0.06, x, LY - 0.11, LZ));

  // Roof machines
  [-6.5, 6.5].forEach((x) => b.box(0xcfd8e0, 1.6, 0.7, 1.1, x, DECK, -9.0));

  // Flagpole (top ball = y 22.0, the highest point) with a blue flag
  const FX = 8.8;
  const FZ = -2.0;
  b.box(GREY, 0.5, 0.15, 0.5, FX, DECK, FZ);                    // base
  b.cyl(0xc7ced4, 0.12, 2.8, FX, DECK, FZ);                     // pole (up to y 21.8)
  b.ball(0xe0b04b, 0.2, FX, 21.9, FZ);                          // gold ball on top
  b.box(BLUE_DARK, 1.7, 1.0, 0.03, FX - 0.06 - 0.85, 20.8, FZ); // flag
  b.box(WHITE, 1.7, 0.2, 0.04, FX - 0.06 - 0.85, 21.1, FZ);     // white stripe on the flag

  // ---------- Stone plaza with 2 steps (looks only: the ground is flat) ----------
  b.box(STONE_1, 13.2, 0.07, 6.4, 0, G, 3.2);                   // step 1 (lowest, widest)
  b.box(STONE_2, 11.6, 0.14, 5.6, 0, G, 2.8);                   // plaza top (step 2)
  const PT = G + 0.14;                                          // top of the plaza
  [1.4, 2.8, 4.2].forEach((z) => b.box(STONE_LINE, 11.6, 0.01, 0.04, 0, PT, z));         // paving lines
  [-4.35, -2.9, -1.45, 0, 1.45, 2.9, 4.35].forEach((x) => b.box(STONE_LINE, 0.04, 0.01, 5.6, x, PT, 2.8));
  b.box(0xd5d9dd, 3.4, 0.04, 5.2, 0, G, 9.0);                   // path from the street to the plaza

  // ---------- Planters ----------
  [-5.0, 5.0].forEach((x) => {                                   // long planters beside the entrance
    b.box(PLANTER, 0.8, 0.6, 1.8, x, PT, 1.2);
    [-0.5, 0, 0.5].forEach((dz, i) => b.ball(i === 1 ? LEAF_LIGHT : LEAF, 0.75, x, PT + 0.85, 1.2 + dz, 0.9));
  });
  [-5.2, 5.2].forEach((x) => {                                   // round planters at the plaza corners
    b.cyl(PLANTER, 1.2, 0.6, x, PT, 5.0);
    b.ball(LEAF, 1.1, x, PT + 0.95, 5.0, 0.9);
    b.dot(x < 0 ? 0xf48fb1 : 0xffd54f, 0.2, x, PT + 1.5, 5.0);
  });

  // ---------- Lamp posts ----------
  [-6.9, 6.9].forEach((x) => {
    b.cyl(STEEL, 0.12, 3.4, x, G, 6.8);
    b.ball(0xfff1b8, 0.4, x, G + 3.55, 6.8);
  });

  // ---------- Benches ----------
  // face 'x+' / 'x-' = looks right / left (long side runs along z); 'z-' = looks toward the building.
  function bench(x, z, face) {
    const bb = (col, lw, h, ld, lu, y, lv) => {
      if (face === 'z-') b.box(col, lw, h, ld, x + lu, y, z - lv);
      else if (face === 'x+') b.box(col, ld, h, lw, x + lv, y, z + lu);
      else b.box(col, ld, h, lw, x - lv, y, z + lu);
    };
    bb(WOOD, 1.8, 0.07, 0.5, 0, G + 0.44, 0);                    // seat
    bb(WOOD, 1.8, 0.45, 0.06, 0, G + 0.51, -0.22);               // back rest
    [-0.8, 0.8].forEach((u) => bb(STEEL, 0.08, 0.44, 0.5, u, G, 0));   // legs
  }
  bench(-8.2, 4.0, 'x+');
  bench(8.2, 4.0, 'x-');
  bench(-3.0, 9.0, 'z-');
  bench(3.0, 9.0, 'z-');
}
