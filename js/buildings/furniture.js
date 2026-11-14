// =====================================================
// CIVIC BUILDING: HOME & FURNITURE SHOWROOM
// Wood-tone walls, a dark flat roof, a large sign board, two very large display windows
// (recessed bays with a sofa, lamps and tables inside) and a forecourt with a sofa,
// two chairs and a wardrobe on display, with a planter at each corner.
// =====================================================
// Drawing space (the building's OWN directions, like a house):
//   origin (0, 0) = middle of the 24 x 24 m lot.   x = right.   +z = front (street side).
//   Body: x from -10 to 10, z from -11 to 0 (front wall at z = 0), 8 m tall.
//   Forecourt: z from 0 to 12.   The door is in the middle, between the two windows.
export const info = {
  id: 'furniture',
  name: 'Furniture Shop',
  sign: 'HOME & FURNITURE',      // the words on the sign board
  signY: 6.1,                    // the board covers y 4.85 to 7.35, on the wall above the windows
  height: 8,                     // real height of the building (players can fly over it)
  door: { x: 0, z: 1.5 },        // in front of the door, in the middle between the windows
  collide: {
    // box   = [centre x, centre z, width, depth, height]
    boxes: [
      [0, -5.5, 20, 11, 8],          // the showroom building
      [-6.2, 4.6, 2.9, 1.0, 1.1],    // forecourt sofa
      [7.0, 4.5, 1.8, 0.8, 2.4],     // forecourt wardrobe
      [-3.0, 6.8, 0.8, 0.8, 1.2],    // the two forecourt chairs
      [3.0, 6.8, 0.8, 0.8, 1.2]
    ],
    // round = [x, z, radius, height]
    round: [
      [-10.4, 1.3, 0.8, 1.6],        // the four corner planters
      [10.4, 1.3, 0.8, 1.6],
      [-10.4, 10.8, 0.8, 1.6],
      [10.4, 10.8, 0.8, 1.6]
    ]
  }
};

export function build(b, c) {
  const G = c.G;   // ground height (0.1)

  // ---------- Colours ----------
  const WOOD = 0xb5834f;           // wall wood
  const WOOD_DARK = 0x8a5a33;      // wall battens
  const WOOD_LIGHT = 0xd9b98a;     // light wood (floors, platforms)
  const WALNUT = 0x7b4b2a;         // furniture wood
  const WALNUT_LIGHT = 0x96623a;
  const BROWN_DARK = 0x4a3322;
  const ROOF = 0x34343a;
  const METAL = 0x2b2b30;
  const CREAM = 0xf3e6cf;
  const GLASS = 0xbfe6f5;
  const SHINE = 0xe6f6fc;
  const BRASS = 0xd8b25a;
  const SOFA_BLUE = 0x4f8596;
  const SOFA_MUSTARD = 0xe0a73a;
  const CUSHION = 0xf2e2c0;
  const LEAF = 0x62b552;
  const LEAF_DARK = 0x4f9e4a;
  const LAMP_SHADE = 0xfff0c8;
  const TERRA = 0xc4623a;

  // ---------- Sizes ----------
  const WALL_TOP = 7.7;                // walls end here; the dark roof slab is 0.3 thick (top y = 8.0)
  const WALL_H = WALL_TOP - G;
  const WIN_X = 5.5;                   // the two windows are centred at x = -5.5 and x = +5.5
  const WIN_W = 6.6;                   // very large: 6.6 m wide ...
  const WIN_BOTTOM = 0.52;             // ... and from y = 0.52 ...
  const WIN_TOP = 4.5;                 // ... to y = 4.5 (nearly 4 m tall)
  const BAY_D = 2.5;                   // the display bays go 2.5 m into the building
  const FY = 0.54;                     // floor level inside the bays (top of the rug)

  // ---------- Walls: front zone (piers, lintel) and the solid rest ----------
  b.box(WOOD, 20, WALL_H, 8.5, 0, G, -6.75);                       // the solid part (z -11 to -2.5)
  b.box(WOOD, 1.2, WALL_H, BAY_D, -9.4, G, -BAY_D / 2);            // left corner pier
  b.box(WOOD, 1.2, WALL_H, BAY_D, 9.4, G, -BAY_D / 2);             // right corner pier
  b.box(WOOD, 4.4, WALL_H, BAY_D, 0, G, -BAY_D / 2);               // middle pier (the door is here)
  [-WIN_X, WIN_X].forEach((cx) => {
    b.box(WOOD, WIN_W, WALL_TOP - WIN_TOP, BAY_D, cx, WIN_TOP, -BAY_D / 2);   // wall above the window
  });
  b.box(BROWN_DARK, 20.12, 0.4, 11.12, 0, G, -5.5);                // dark base all round (y 0.1 to 0.5)

  // wooden battens (thin vertical boards) on the front pillars and the wall above the windows
  [-9.7, -9.1].forEach((x) => { b.box(WOOD_DARK, 0.12, WALL_H - 0.5, 0.06, x, 0.5, 0.02); });
  [9.1, 9.7].forEach((x) => { b.box(WOOD_DARK, 0.12, WALL_H - 0.5, 0.06, x, 0.5, 0.02); });
  [-1.9, -1.5, 1.5, 1.9].forEach((x) => { b.box(WOOD_DARK, 0.12, WALL_H - 3.8, 0.06, x, 3.8, 0.02); });
  for (let x = 5.9; x <= 9.0; x += 0.5) {
    b.box(WOOD_DARK, 0.1, WALL_TOP - WIN_TOP, 0.05, x, WIN_TOP, 0.02);
    b.box(WOOD_DARK, 0.1, WALL_TOP - WIN_TOP, 0.05, -x, WIN_TOP, 0.02);
  }
  // battens on the side and back walls
  for (let i = 0; i < 12; i++) {
    const z = -0.6 - i * 0.9;
    b.box(WOOD_DARK, 0.08, WALL_H - 0.5, 0.12, -10.0, 0.5, z);
    b.box(WOOD_DARK, 0.08, WALL_H - 0.5, 0.12, 10.0, 0.5, z);
  }
  for (let i = 0; i < 21; i++) {
    b.box(WOOD_DARK, 0.12, WALL_H - 0.5, 0.08, -9.8 + i * 0.98, 0.5, -11.0);
  }

  // small high windows on the side walls
  [-3.5, -7.5].forEach((z) => {
    [-10, 10].forEach((x) => {
      b.box(METAL, 0.1, 1.1, 2.1, x, 5.0, z);
      b.box(GLASS, 0.14, 0.9, 1.9, x, 5.1, z);
    });
  });

  // ---------- Dark flat roof ----------
  b.box(ROOF, 20.8, 0.3, 11.8, 0, WALL_TOP, -5.5);                 // y 7.7 to 8.0
  b.box(0x1f1f24, 20.9, 0.08, 11.9, 0, WALL_TOP - 0.06, -5.5);     // dark shadow line under the edge

  // ---------- Large sign board (the HOME & FURNITURE sign is drawn on top of this) ----------
  b.box(BROWN_DARK, 11.0, 3.0, 0.05, 0, 4.6, 0);                   // frame
  b.box(0x6b4a2b, 10.6, 2.7, 0.07, 0, 4.75, 0);                    // inner board
  [-5.2, 5.2].forEach((x) => {
    b.box(BRASS, 0.18, 0.18, 0.1, x, 7.3, 0.01);                   // brass corner studs
    b.box(BRASS, 0.18, 0.18, 0.1, x, 4.9, 0.01);
  });

  // ---------- Display windows: frames and glass shine ----------
  [-WIN_X, WIN_X].forEach((cx) => {
    const h = WIN_TOP - WIN_BOTTOM;
    b.box(METAL, WIN_W, 0.14, 0.12, cx, WIN_TOP - 0.14, 0.01);                  // top rail
    b.box(METAL, WIN_W, 0.14, 0.12, cx, WIN_BOTTOM, 0.01);                      // bottom rail
    b.box(METAL, 0.12, h, 0.12, cx - WIN_W / 2 + 0.06, WIN_BOTTOM, 0.01);       // side bars
    b.box(METAL, 0.12, h, 0.12, cx + WIN_W / 2 - 0.06, WIN_BOTTOM, 0.01);
    // a slanted shine on the glass, so it reads as glass
    b.slab(SHINE, 0.3, 3.2, 0.02, cx - 1.8, 2.5, 0.05, 0, 0, 0.45);
    b.slab(SHINE, 0.12, 3.2, 0.02, cx - 1.3, 2.5, 0.05, 0, 0, 0.45);
    b.slab(SHINE, 0.3, 3.2, 0.02, cx + 1.9, 2.5, 0.05, 0, 0, 0.45);
  });

  // ---------- Inside the display bays: room walls, ceiling, floor, rug ----------
  [-WIN_X, WIN_X].forEach((cx) => {
    const ih = WIN_TOP - WIN_BOTTOM - 0.04;
    b.box(WOOD_LIGHT, WIN_W, WIN_BOTTOM - G + 0.02, BAY_D, cx, G, -BAY_D / 2);         // floor block
    b.box(CREAM, WIN_W - 0.08, ih, 0.04, cx, WIN_BOTTOM, -BAY_D + 0.02);             // back wall
    b.box(CREAM, 0.04, ih, BAY_D - 0.06, cx - WIN_W / 2 + 0.02, WIN_BOTTOM, -BAY_D / 2 - 0.03);   // side walls
    b.box(CREAM, 0.04, ih, BAY_D - 0.06, cx + WIN_W / 2 - 0.02, WIN_BOTTOM, -BAY_D / 2 - 0.03);
    b.box(0xfff8e8, WIN_W - 0.1, 0.04, BAY_D - 0.06, cx, WIN_TOP - 0.04, -BAY_D / 2 - 0.03);    // bright ceiling
  });

  // ---------- Little furniture helpers (all made of boxes) ----------
  // dir: 0 = facing +z (the street), 1 = facing +x, -1 = facing -x
  // part(col, w, h, d, lx, ly, lz): a box in the furniture's own directions (lx right, lz forward)
  function part(col, w, h, d, x, y, z, lx, ly, lz, dir) {
    if (dir === 0) b.box(col, w, h, d, x + lx, y + ly, z + lz);
    else if (dir === 1) b.box(col, d, h, w, x + lz, y + ly, z - lx);
    else b.box(col, d, h, w, x - lz, y + ly, z + lx);
  }

  function sofa(x, y, z, w, col, dir = 0) {
    const p = (...a) => part(a[0], a[1], a[2], a[3], x, y, z, a[4], a[5], a[6], dir);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      p(BROWN_DARK, 0.08, 0.12, 0.08, sx * (w / 2 - 0.1), 0, sz * 0.35);         // legs
    });
    p(col, w, 0.32, 0.9, 0, 0.12, 0);                                           // base
    p(col, w, 0.6, 0.22, 0, 0.44, -0.34);                                       // back
    p(col, 0.26, 0.42, 0.9, -(w / 2 - 0.13), 0.44, 0);                          // arms
    p(col, 0.26, 0.42, 0.9, (w / 2 - 0.13), 0.44, 0);
    const cw = (w - 0.52) / 2;
    p(CUSHION, cw - 0.02, 0.14, 0.62, -cw / 2 - 0.01, 0.44, 0.1);              // seat cushions
    p(CUSHION, cw - 0.02, 0.14, 0.62, cw / 2 + 0.01, 0.44, 0.1);
    p(CUSHION, cw - 0.06, 0.42, 0.14, -cw / 2 - 0.01, 0.58, -0.17);            // back cushions
    p(CUSHION, cw - 0.06, 0.42, 0.14, cw / 2 + 0.01, 0.58, -0.17);
  }

  function chair(x, y, z, col, dir = 0, s = 1) {
    const p = (...a) => part(a[0], a[1], a[2], a[3], x, y, z, a[4], a[5], a[6], dir);
    const k = 0.25 * s;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      p(WALNUT, 0.06 * s, 0.44 * s, 0.06 * s, sx * k, 0, sz * k);              // legs
    });
    p(WALNUT, 0.58 * s, 0.07 * s, 0.58 * s, 0, 0.44 * s, 0);                    // seat board
    p(col, 0.5 * s, 0.08 * s, 0.5 * s, 0, 0.51 * s, 0.01);                      // seat cushion
    p(WALNUT, 0.06 * s, 0.55 * s, 0.06 * s, -k, 0.51 * s, -k);                  // back posts
    p(WALNUT, 0.06 * s, 0.55 * s, 0.06 * s, k, 0.51 * s, -k);
    p(col, 0.5 * s, 0.34 * s, 0.07 * s, 0, 0.7 * s, -k);                        // back pad
  }

  function table(x, y, z, w, d, h, col = WALNUT) {
    b.box(col, w, 0.07, d, x, y + h - 0.07, z);                                 // top
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      b.box(col, 0.07, h - 0.07, 0.07, x + sx * (w / 2 - 0.08), y, z + sz * (d / 2 - 0.08));   // legs
    });
  }

  function floorLamp(x, y, z) {
    b.cyl(METAL, 0.32, 0.04, x, y, z);                                          // base
    b.cyl(BRASS, 0.04, 1.5, x, y, z);                                           // pole
    b.cyl(LAMP_SHADE, 0.46, 0.38, x, y + 1.45, z);                              // shade
    b.cyl(0xffe9a0, 0.2, 0.06, x, y + 1.4, z);                                  // glowing bulb under the shade
  }

  function tableLamp(x, y, z) {
    b.cyl(BRASS, 0.16, 0.05, x, y, z);
    b.cyl(BRASS, 0.05, 0.3, x, y, z);
    b.cyl(LAMP_SHADE, 0.3, 0.24, x, y + 0.28, z);
  }

  function pendant(x, z, topY, lowY) {
    b.cyl(METAL, 0.025, topY - lowY, x, lowY, z);                               // cord
    b.cone(0xf0d9a0, 0.7, 0.34, x, lowY - 0.3, z);                              // dome shade
    b.ball(0xffe9a0, 0.16, x, lowY - 0.32, z);                                  // bulb
  }

  function plant(x, y, z, size = 1) {
    b.cyl(TERRA, 0.4 * size, 0.38 * size, x, y, z);
    b.ball(LEAF, 0.62 * size, x, y + 0.62 * size, z);
    b.ball(LEAF_DARK, 0.4 * size, x + 0.14 * size, y + 0.9 * size, z + 0.05 * size);
  }

  function picture(x, y, z, w, h, cols) {                                       // hangs on the back wall
    b.box(METAL, w, h, 0.05, x, y, z);
    const iw = (w - 0.12) / cols.length;
    cols.forEach((col, i) => {
      b.box(col, iw, h - 0.12, 0.03, x - (w - 0.12) / 2 + iw * (i + 0.5), y + 0.06, z + 0.03);
    });
  }

  // ---------- LEFT window: a living room (sofa, coffee table, floor lamp, plant, picture) ----------
  {
    const cx = -WIN_X;
    const backZ = -BAY_D + 0.04;
    b.box(TERRA, 3.8, 0.03, 1.9, cx - 0.4, FY - 0.02, -1.45);                  // rug
    sofa(cx - 0.4, FY, backZ + 0.6, 2.8, SOFA_BLUE);
    table(cx - 0.4, FY, -0.9, 1.2, 0.6, 0.42, WALNUT_LIGHT);                  // coffee table
    b.cyl(0xd9d4c8, 0.22, 0.12, cx - 0.6, FY + 0.42, -0.9);                    // a bowl on it
    b.box(0x8bb06b, 0.3, 0.05, 0.2, cx - 0.1, FY + 0.42, -0.9);                // a book
    floorLamp(cx - 2.4, FY, backZ + 0.45);
    plant(cx + 2.3, FY, backZ + 0.5, 1.2);
    picture(cx - 0.4, 2.2, backZ + 0.02, 1.8, 1.0, [0xe0a73a, 0xc4623a, 0x4f8596]);
  }

  // ---------- RIGHT window: a dining room (table, chairs, sideboard with lamp, pendant, shelves) ----------
  {
    const cx = WIN_X;
    const backZ = -BAY_D + 0.04;
    b.box(0xe8dcc0, 3.6, 0.03, 2.0, cx + 0.3, FY - 0.02, -1.35);               // rug
    table(cx + 0.3, FY, -1.3, 1.7, 0.95, 0.78);                                // dining table
    chair(cx - 1.0, FY, -1.3, SOFA_MUSTARD, 1);                                // chairs, facing the table
    chair(cx + 1.6, FY, -1.3, SOFA_MUSTARD, -1);
    b.cyl(0xe8e2d4, 0.3, 0.1, cx + 0.3, FY + 0.78, -1.3);                      // a plate bowl in the middle
    pendant(cx + 0.3, -1.3, WIN_TOP - 0.04, FY + 1.95);                         // hanging lamp
    // sideboard with a table lamp
    b.box(WALNUT, 1.9, 0.72, 0.5, cx - 1.9, FY + 0.12, backZ + 0.3);
    b.box(WALNUT_LIGHT, 0.88, 0.5, 0.02, cx - 2.38, FY + 0.22, backZ + 0.56);
    b.box(WALNUT_LIGHT, 0.88, 0.5, 0.02, cx - 1.42, FY + 0.22, backZ + 0.56);
    [[-0.85, -0.2], [0.85, -0.2], [-0.85, 0.2], [0.85, 0.2]].forEach(([lx, lz]) => {
      b.box(BROWN_DARK, 0.06, 0.12, 0.06, cx - 1.9 + lx, FY, backZ + 0.3 + lz);
    });
    tableLamp(cx - 2.4, FY + 0.84, backZ + 0.3);
    // tall bookshelf with coloured books
    const sx = cx + 2.55;
    b.box(WALNUT, 1.1, 2.3, 0.4, sx, FY, backZ + 0.24);
    const bookCols = [0xb5483a, 0x3f6f8f, 0xd9a441, 0x4f7f55, 0x7a4f8a, 0xe8dcc8];
    for (let row = 0; row < 4; row++) {
      b.box(CREAM, 0.96, 0.46, 0.3, sx, FY + 0.12 + row * 0.55, backZ + 0.32);     // dark-lit shelf space
      for (let k = 0; k < 6; k++) {
        const bh = 0.3 + ((k * 7 + row * 3) % 4) * 0.04;
        b.box(bookCols[(k + row) % bookCols.length], 0.1, bh, 0.22, sx - 0.4 + k * 0.16, FY + 0.12 + row * 0.55, backZ + 0.34);
      }
    }
    picture(cx - 0.3, 2.9, backZ + 0.02, 1.4, 0.9, [0x4f8596, 0xf2e2c0, 0xc4623a, 0x8bb06b]);
  }

  // ---------- Door (double wooden door with glass panes, between the windows) ----------
  b.box(METAL, 0.16, 3.0, 0.2, -1.25, G, 0.05);                      // door frame
  b.box(METAL, 0.16, 3.0, 0.2, 1.25, G, 0.05);
  b.box(METAL, 2.66, 0.16, 0.2, 0, 2.94, 0.05);
  [-0.6, 0.6].forEach((x) => {
    b.box(BROWN_DARK, 1.12, 2.82, 0.08, x, G, 0.04);                 // door leaf
    b.box(GLASS, 0.7, 1.4, 0.04, x, 0.9, 0.09);                      // glass pane
    b.box(SHINE, 0.1, 1.4, 0.045, x - 0.14, 0.9, 0.09);              // shine
    b.box(0x6b4a2b, 0.8, 0.9, 0.03, x, 0.3, 0.09);                   // lower panel
  });
  b.box(BRASS, 0.05, 0.7, 0.06, -0.14, 1.1, 0.14);                   // handles
  b.box(BRASS, 0.05, 0.7, 0.06, 0.14, 1.1, 0.14);
  b.box(METAL, 3.4, 0.14, 1.3, 0, 3.25, 0.65);                       // little canopy over the door
  b.box(WOOD_DARK, 3.2, 0.06, 1.2, 0, 3.39, 0.65);
  b.box(0xb8b4aa, 3.0, 0.06, 1.0, 0, G, 0.5);                        // stone threshold
  b.box(0x6b4a2b, 1.8, 0.04, 0.6, 0, G + 0.06, 0.6);                 // doormat

  // ---------- Forecourt display: sofa, two chairs, wardrobe (each on a low wooden platform) ----------
  const PLAT = G + 0.12;
  // sofa on the left
  b.box(WOOD_LIGHT, 4.0, 0.12, 2.0, -6.2, G, 4.8);
  b.box(TERRA, 3.5, 0.03, 1.6, -6.2, PLAT, 4.8);
  sofa(-6.2, PLAT + 0.03, 4.6, 2.8, SOFA_MUSTARD);
  // wardrobe on the right
  b.box(WOOD_LIGHT, 2.6, 0.12, 1.6, 7.0, G, 4.5);
  {
    const wx = 7.0;
    const wz = 4.5;
    const wy = PLAT;
    b.box(WALNUT, 1.7, 2.3, 0.75, wx, wy + 0.1, wz);                           // body
    b.box(WALNUT_LIGHT, 1.9, 0.14, 0.85, wx, wy + 2.4, wz);                    // top crown
    b.box(BROWN_DARK, 1.6, 0.1, 0.7, wx, wy, wz);                              // base
    b.box(WALNUT_LIGHT, 0.74, 1.95, 0.03, wx - 0.4, wy + 0.3, wz + 0.38);      // left door panel
    b.box(WALNUT_LIGHT, 0.74, 1.95, 0.03, wx + 0.4, wy + 0.3, wz + 0.38);      // right door panel
    b.box(BROWN_DARK, 0.04, 2.1, 0.04, wx, wy + 0.22, wz + 0.39);              // door gap line
    b.box(BRASS, 0.05, 0.28, 0.05, wx - 0.08, wy + 1.15, wz + 0.42);           // handles
    b.box(BRASS, 0.05, 0.28, 0.05, wx + 0.08, wy + 1.15, wz + 0.42);
  }
  // two chairs facing each other across the path to the door
  b.box(WOOD_LIGHT, 1.5, 0.12, 1.5, -3.0, G, 6.8);
  b.box(WOOD_LIGHT, 1.5, 0.12, 1.5, 3.0, G, 6.8);
  chair(-3.0, PLAT, 6.8, SOFA_BLUE, 1, 1.25);
  chair(3.0, PLAT, 6.8, SOFA_BLUE, -1, 1.25);

  // ---------- Planters at the four corners ----------
  [[-10.4, 1.3], [10.4, 1.3], [-10.4, 10.8], [10.4, 10.8]].forEach(([px, pz]) => {
    b.box(WALNUT, 1.3, 0.7, 1.3, px, G, pz);                                  // wooden box
    b.box(BROWN_DARK, 1.4, 0.1, 1.4, px, G + 0.6, pz);                        // rim
    b.box(0x4a3322, 1.1, 0.04, 1.1, px, G + 0.7, pz);                         // soil
    b.ball(LEAF, 1.0, px, G + 1.25, pz);                                      // bush
    b.ball(LEAF_DARK, 0.7, px + 0.28, G + 1.5, pz - 0.15);
    b.ball(LEAF, 0.6, px - 0.3, G + 1.4, pz + 0.2);
    [[-0.2, 0.3], [0.25, 0.25], [0.05, -0.3]].forEach(([dx, dz], i) => {
      b.dot([0xf48fb1, 0xffd54f, 0xffffff][i], 0.16, px + dx, G + 1.55, pz + dz);   // tiny flowers
    });
  });
}
