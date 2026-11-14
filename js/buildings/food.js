// =====================================================
// CIVIC BUILDING: FRESH FOOD SHOP
// A small supermarket: warm orange and white walls, a green roof edge, a wide glass front,
// a striped green and white awning, and a forecourt with fruit and vegetable crate tables,
// a shopping-cart rack and a bench.
// =====================================================
// Drawing space (the building's OWN directions, like a house):
//   origin (0, 0) = middle of the 24 x 24 m lot.   x = right.   +z = front (street side).
//   Body: x from -10 to 10, z from -11 to 0 (front wall at z = 0), 7.5 m tall.
//   Forecourt: z from 0 to 12.
export const info = {
  id: 'food',
  name: 'Food Store',
  sign: 'FRESH FOOD SHOP',       // the words on the sign board
  signY: 5.5,                    // the board covers y 4.25 to 6.75 (the white band, above the awning)
  height: 7.5,                   // real height of the building (players can fly over it)
  door: { x: 0, z: 1.5 },        // under the awning, in the middle of the front wall
  collide: {
    // box   = [centre x, centre z, width, depth, height]
    boxes: [
      [0, -5.5, 20, 11, 7.5],        // the shop building
      [-7.4, 4.5, 2.2, 1.0, 1.2],    // 6 crate tables
      [-3.9, 4.5, 2.2, 1.0, 1.2],
      [3.9, 4.5, 2.2, 1.0, 1.2],
      [7.4, 4.5, 2.2, 1.0, 1.2],
      [-5.7, 8.2, 2.2, 1.0, 1.2],
      [5.7, 8.2, 2.2, 1.0, 1.2],
      [-5.8, 1.4, 3.0, 0.9, 1.6]     // the shopping-cart rack
    ],
    // round = [x, z, radius, height]
    round: [
      [-8.9, 2.55, 0.15, 3.2],       // the two awning posts
      [8.9, 2.55, 0.15, 3.2]
    ]
  }
};

export function build(b, c) {
  const G = c.G;   // ground height (0.1)

  // ---------- Colours ----------
  const ORANGE = 0xf0902f;
  const ORANGE_DARK = 0xc9601a;
  const WHITE = 0xfff6e8;
  const GREEN = 0x2f9e44;
  const GREEN_DARK = 0x237a34;
  const GLASS = 0xbfe6f5;
  const GLASS_DARK = 0x9ccfe0;
  const SHINE = 0xe6f6fc;
  const FRAME = 0xfffaf0;
  const WOOD = 0xb5793f;
  const WOOD_DARK = 0x7a4a2a;
  const STEEL = 0x7a8791;
  const CRATE_RED = 0xd9423a;
  const CRATE_ORANGE = 0xf28c28;
  const CRATE_GREEN = 0x3f9e3f;
  const APPLE = 0xe53935;
  const ORANGE_FRUIT = 0xffa726;
  const CABBAGE = 0x7bc043;

  // ---------- Main sizes ----------
  const WALL_TOP = 7.0;                    // the walls end here; the green roof edge sits on top
  const WALL_H = WALL_TOP - G;

  // ---------- Walls: orange below, white band above ----------
  b.box(ORANGE, 20, WALL_H, 11, 0, G, -5.5);
  b.box(ORANGE_DARK, 20.12, 0.45, 11.12, 0, G, -5.5);              // darker base all round
  b.box(WHITE, 20.1, 2.7, 11.1, 0, 4.3, -5.5);                     // white band (the sign sits on it)
  b.box(ORANGE_DARK, 20.14, 0.14, 11.14, 0, 4.2, -5.5);            // thin line between orange and white

  // white corner posts
  [[-9.9, -0.05], [9.9, -0.05], [-9.9, -10.95], [9.9, -10.95]].forEach(([x, z]) => {
    b.box(WHITE, 0.5, WALL_H, 0.5, x, G, z);
  });

  // ---------- Green roof edge ----------
  b.box(GREEN, 20.8, 0.5, 11.8, 0, WALL_TOP - 0.05, -5.5);          // y 6.95 to 7.45
  b.box(GREEN_DARK, 20.2, 0.1, 11.2, 0, 7.4, -5.5);                 // top lip (y 7.5)

  // ---------- Round fruit badge on the white band (left and right of the sign) ----------
  [-8, 8].forEach((x) => {
    b.ball(APPLE, 1.3, x, 5.5, 0.35, 1);
    b.cone(GREEN, 0.34, 0.5, x + 0.1, 6.0, 0.35);
    b.ball(GREEN, 0.36, x + 0.3, 6.35, 0.35, 0.5);
  });

  // ---------- Wide glass front ----------
  // glass y from 0.6 to 3.1; the door gap is x from -1.3 to 1.3
  b.box(GLASS, 7.2, 2.5, 0.15, -4.9, 0.6, 0.02);
  b.box(GLASS, 7.2, 2.5, 0.15, 4.9, 0.6, 0.02);
  // shiny streaks on the panes
  [-7.3, -4.9, -2.5, 2.5, 4.9, 7.3].forEach((x) => {
    b.slab(SHINE, 0.22, 2.2, 0.03, x - 0.4, 1.9, 0.11, 0, 0, 0.35);
    b.slab(SHINE, 0.1, 2.0, 0.03, x - 0.05, 1.9, 0.11, 0, 0, 0.35);
  });
  // white frame: posts between panes, top and bottom rails
  [-8.5, -6.1, -3.7, 3.7, 6.1, 8.5].forEach((x) => b.box(FRAME, 0.16, 2.6, 0.2, x, 0.55, 0.06));
  b.box(FRAME, 17.2, 0.14, 0.2, 0, 3.05, 0.06);
  b.box(FRAME, 17.2, 0.14, 0.2, 0, 0.5, 0.06);
  // orange panel under the glass (so the shop looks solid)
  b.box(ORANGE_DARK, 17.2, 0.4, 0.12, 0, G, 0.05);

  // ---------- Door (double glass door) ----------
  b.box(FRAME, 0.2, 2.6, 0.24, -1.3, 0.5, 0.07);                   // door posts
  b.box(FRAME, 0.2, 2.6, 0.24, 1.3, 0.5, 0.07);
  b.box(FRAME, 2.7, 0.2, 0.24, 0, 2.95, 0.07);                     // door header
  b.box(GLASS_DARK, 1.1, 2.4, 0.1, -0.56, 0.55, 0.05);             // left leaf
  b.box(GLASS_DARK, 1.1, 2.4, 0.1, 0.56, 0.55, 0.05);              // right leaf
  b.box(FRAME, 0.07, 2.4, 0.16, 0, 0.55, 0.06);                    // middle bar
  b.box(0x9aa5ad, 0.05, 0.7, 0.05, -0.2, 1.1, 0.16);               // door handles
  b.box(0x9aa5ad, 0.05, 0.7, 0.05, 0.2, 1.1, 0.16);
  b.box(0xd9c7a0, 2.6, 0.04, 1.0, 0, G, 0.55);                     // welcome mat strip
  b.box(0x8a5a3a, 2.0, 0.045, 0.7, 0, G, 0.55);

  // ---------- Side windows (3 on each side) ----------
  [-3, -6, -9].forEach((z) => {
    [-10, 10].forEach((x) => {
      b.box(FRAME, 0.1, 1.4, 1.8, x, 1.8, z);
      b.box(GLASS, 0.14, 1.2, 1.6, x, 1.9, z);
    });
  });

  // ---------- Striped awning (green and white) ----------
  // runs from the wall (y 3.95) down to the front edge (y 3.15, z 2.7), 18 m wide
  const AW_FROM_Y = 3.95;
  const AW_TO_Y = 3.15;
  const AW_Z = 2.7;
  const AW_LEN = Math.hypot(AW_Z, AW_FROM_Y - AW_TO_Y);
  const AW_TILT = Math.atan2(AW_FROM_Y - AW_TO_Y, AW_Z);
  for (let i = 0; i < 18; i++) {
    const x = -8.5 + i;
    const col = i % 2 === 0 ? GREEN : WHITE;
    b.slab(col, 1.0, 0.06, AW_LEN, x, (AW_FROM_Y + AW_TO_Y) / 2, AW_Z / 2 + 0.03, AW_TILT, 0, 0);
    b.box(col, 1.0, 0.22, 0.05, x, AW_TO_Y - 0.22, AW_Z + 0.03);   // front flap
    b.ellip(col, 1.0, 0.44, 0.05, x, AW_TO_Y - 0.22, AW_Z + 0.03);  // rounded scallop edge
  }
  // awning posts at both ends
  [-8.9, 8.9].forEach((x) => {
    b.cyl(WHITE, 0.14, 3.05, x, G, 2.55);
    b.cyl(GREEN_DARK, 0.2, 0.15, x, G, 2.55);
  });

  // ---------- Crate tables with fruit and vegetables ----------
  // each table: wooden top 2.2 x 1.0 m, three coloured crates with produce on top
  const orders = [
    [CRATE_RED, CRATE_ORANGE, CRATE_GREEN],
    [CRATE_ORANGE, CRATE_GREEN, CRATE_RED],
    [CRATE_GREEN, CRATE_RED, CRATE_ORANGE],
    [CRATE_RED, CRATE_GREEN, CRATE_ORANGE],
    [CRATE_ORANGE, CRATE_RED, CRATE_GREEN],
    [CRATE_GREEN, CRATE_ORANGE, CRATE_RED]
  ];
  const tables = [[-7.4, 4.5], [-3.9, 4.5], [3.9, 4.5], [7.4, 4.5], [-5.7, 8.2], [5.7, 8.2]];

  tables.forEach(([tx, tz], t) => {
    const topY = G + 0.8;
    // table: legs, shelf, top
    [[-1.0, -0.4], [1.0, -0.4], [-1.0, 0.4], [1.0, 0.4]].forEach(([lx, lz]) => {
      b.box(WOOD_DARK, 0.1, 0.8, 0.1, tx + lx, G, tz + lz);
    });
    b.box(WOOD_DARK, 2.0, 0.05, 0.8, tx, G + 0.25, tz);
    b.box(WOOD, 2.2, 0.08, 1.0, tx, topY - 0.08, tz);
    // striped table skirt (green and white) at the front
    for (let k = 0; k < 4; k++) {
      b.box(k % 2 === 0 ? GREEN : WHITE, 0.55, 0.18, 0.04, tx - 0.825 + k * 0.55, topY - 0.26, tz + 0.52);
    }

    // three crates
    orders[t].forEach((crateCol, i) => {
      const cx = tx + (i - 1) * 0.7;
      b.box(crateCol, 0.62, 0.32, 0.8, cx, topY, tz);
      b.box(WHITE, 0.4, 0.07, 0.02, cx, topY + 0.12, tz + 0.41);   // little label
      const y = topY + 0.32 + 0.09;
      if (crateCol === CRATE_RED) {                                 // apples
        [[-0.15, -0.22], [0.15, -0.22], [-0.15, 0.02], [0.15, 0.02], [0, 0.26], [0, -0.1]].forEach(([dx, dz]) => {
          b.ball(APPLE, 0.21, cx + dx, y, tz + dz);
        });
      } else if (crateCol === CRATE_ORANGE) {                       // oranges
        [[-0.15, -0.22], [0.15, -0.22], [-0.15, 0.02], [0.15, 0.02], [0, 0.26], [0, -0.1]].forEach(([dx, dz]) => {
          b.ball(ORANGE_FRUIT, 0.21, cx + dx, y, tz + dz);
        });
      } else {                                                      // cabbages
        [[-0.12, -0.2], [0.14, -0.2], [-0.12, 0.12], [0.14, 0.12]].forEach(([dx, dz]) => {
          b.ball(CABBAGE, 0.27, cx + dx, y + 0.03, tz + dz);
        });
      }
    });
  });

  // ---------- Shopping-cart rack (left of the door, under the awning) ----------
  const RX = -5.8;
  const RZ = 1.4;
  b.box(STEEL, 3.0, 0.1, 0.9, RX, G + 0.05, RZ);                    // base frame
  [[-1.45, -0.42], [1.45, -0.42], [-1.45, 0.42], [1.45, 0.42]].forEach(([dx, dz]) => {
    b.cyl(STEEL, 0.08, 1.45, RX + dx, G + 0.1, RZ + dz);            // corner posts
  });
  b.box(GREEN, 3.2, 0.08, 1.1, RX, G + 1.55, RZ);                   // little green roof
  b.box(WHITE, 2.4, 0.2, 0.03, RX, G + 1.32, RZ + 0.45);            // "carts" board
  for (let i = 0; i < 6; i++) {
    const cx = RX - 1.05 + i * 0.4;
    const y = G + 0.38 + i * 0.03;
    b.box(i % 2 === 0 ? 0xc5ccd3 : 0xaab3bb, 0.9, 0.4, 0.6 - i * 0.01, cx, y, RZ);    // wire basket
    b.cylZ(0xe53935, 0.05, 0.6, cx - 0.47, y + 0.65, RZ);                             // red handle
    b.box(STEEL, 0.04, 0.65, 0.04, cx - 0.47, y, RZ - 0.28);                          // handle posts
    b.box(STEEL, 0.04, 0.65, 0.04, cx - 0.47, y, RZ + 0.28);
  }

  // ---------- Bench (right of the door, against the wall) ----------
  const BX = 5.5;
  const BZ = 1.0;
  b.box(GREEN_DARK, 1.8, 0.07, 0.5, BX, G + 0.43, BZ);                // seat
  b.box(GREEN_DARK, 1.8, 0.42, 0.06, BX, G + 0.6, BZ - 0.22);         // back rest
  b.box(0x3e4a42, 0.08, 0.43, 0.45, BX - 0.8, G, BZ);                 // legs
  b.box(0x3e4a42, 0.08, 0.43, 0.45, BX + 0.8, G, BZ);
  b.box(0x3e4a42, 0.07, 0.4, 0.07, BX - 0.8, G + 0.45, BZ - 0.22);    // back rest supports
  b.box(0x3e4a42, 0.07, 0.4, 0.07, BX + 0.8, G + 0.45, BZ - 0.22);
}
