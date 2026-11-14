// =====================================================
// CIVIC BUILDING: CANDY SHOP
// Pastel pink and mint walls, a "cake" roof with white icing drips, giant lollipops on the roof
// and in the forecourt, swirly candy-cane columns beside the door, a giant donut on the sign,
// a pink and white striped awning, and a forecourt with a candy-jar table and two benches.
// =====================================================
// Drawing space (the building's OWN directions, like a house):
//   origin (0, 0) = middle of the 24 x 24 m lot.   x = right.   +z = front (street side).
//   Body: x from -9 to 9 (18 m wide), z from -11 to 0 (front wall at z = 0), 8 m tall (to the top of the icing).
//   Forecourt: z from 0 to 12.   The door is in the middle of the front wall.
export const info = {
  id: 'candy',
  name: 'Candy Shop',
  sign: 'CANDY SHOP',            // the words on the sign board
  signY: 5.65,                   // the board covers y 4.4 to 6.9, above the awning and below the roof
  height: 8,                     // real height of the building (the lollipops on the roof stand above it)
  door: { x: 0, z: 1.5 },        // under the awning, in the middle of the front wall
  collide: {
    // box   = [centre x, centre z, width, depth, height]
    boxes: [
      [0, -5.5, 18, 11, 8],          // the candy shop building
      [-5.2, 4.8, 3.4, 1.5, 1.7],    // candy-jar display table
      [4.3, 4.6, 1.9, 0.7, 0.95],    // the two benches
      [6.9, 4.6, 1.9, 0.7, 0.95]
    ],
    // round = [x, z, radius, height]
    round: [
      [-2.0, 0.55, 0.35, 3.4],       // the two candy-cane columns beside the door
      [2.0, 0.55, 0.35, 3.4],
      [-7.8, 2.55, 0.15, 3.2],       // the two awning posts
      [7.8, 2.55, 0.15, 3.2],
      [-8.4, 3.0, 0.35, 4.4],        // forecourt lollipops (big, in front)
      [8.4, 3.0, 0.35, 4.4],
      [-8.6, 9.4, 0.3, 3.2],         // forecourt lollipops (small, at the back corners)
      [8.6, 9.4, 0.3, 3.2],
      [-6.8, -3.6, 0.35, 11.3],      // lollipops on the roof
      [6.3, -2.6, 0.35, 10.7],
      [0.5, -8.0, 0.35, 11.9]
    ]
  }
};

export function build(b, c) {
  const G = c.G;   // ground height (0.1)

  // ---------- Colours ----------
  const PINK = 0xf9c6da;          // pastel pink wall
  const PINK_DEEP = 0xf48fb1;
  const HOT = 0xe8508a;
  const MINT = 0xbdebd6;          // pastel mint wall
  const MINT_DEEP = 0x7fd1b0;
  const WHITE = 0xfff8fb;
  const CHOC = 0x7a4a3a;
  const CHOC_LIGHT = 0x8d5a45;
  const CAKE = 0x8a5a44;
  const GLASS = 0xdff3fb;
  const SHINE = 0xffffff;
  const CANDY_COLS = [0xff6fa5, 0xffd966, 0x6fd9b0, 0xc7b2f0, 0xff9f5a, 0x7ec8ff, 0xff5252, 0xffffff];

  // a repeatable "random" so the sprinkles are the same every visit
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  // ---------- Walls: pink below, mint above, white scallop trim between ----------
  const WALL_TOP = 7.0;
  b.box(PINK, 18, WALL_TOP - G, 11, 0, G, -5.5);                       // the whole body in pink
  b.box(MINT, 18.1, WALL_TOP - 3.9, 11.1, 0, 3.9, -5.5);               // mint upper wall (y 3.9 to 7.0)
  b.box(MINT_DEEP, 18.14, 0.4, 11.14, 0, G, -5.5);                     // mint base (y 0.1 to 0.5)
  for (let x = -8.5; x <= 8.5; x += 0.9) {
    b.ellip(WHITE, 1.0, 0.5, 0.3, x, 3.9, 0.06);                       // scallop trim, front
  }
  for (let z = -0.6; z > -10.9; z -= 0.9) {
    b.ellip(WHITE, 0.3, 0.5, 1.0, -9.05, 3.9, z);                      // scallop trim, sides
    b.ellip(WHITE, 0.3, 0.5, 1.0, 9.05, 3.9, z);
  }

  // ---------- Cake roof with white icing, sprinkles and drips ----------
  b.box(CAKE, 18.4, 0.5, 11.4, 0, WALL_TOP, -5.5);                     // chocolate cake layer (y 7.0 to 7.5)
  b.box(WHITE, 18.5, 0.35, 11.5, 0, 7.5, -5.5);                        // icing (y 7.5 to 7.85)
  for (let x = -9.0; x <= 9.0; x += 0.55) {
    b.ellip(WHITE, 0.6, 0.3, 0.5, x, 7.86, 0.18);                      // piping along the front edge
  }
  for (let z = -0.6; z > -11.0; z -= 0.55) {
    b.ellip(WHITE, 0.5, 0.3, 0.6, -9.1, 7.86, z);                      // piping along the sides
    b.ellip(WHITE, 0.5, 0.3, 0.6, 9.1, 7.86, z);
  }
  for (let i = 0; i < 40; i++) {
    b.dot(CANDY_COLS[Math.floor(rnd() * 7)], 0.14, -8.4 + rnd() * 16.8, 7.9, -10.4 + rnd() * 10.0);   // sprinkles
  }
  // drips (front): short in the middle so they stay above the sign
  for (let i = 0; i < 19; i++) {
    const x = -8.5 + i * 0.9;
    const mid = Math.abs(x) < 5.4;
    const L = mid ? 0.3 + ((i * 3) % 3) * 0.07 : 0.55 + ((i * 37) % 7) * 0.13;
    b.cyl(WHITE, 0.28, L - 0.16, x, 7.55 - L + 0.16, 0.3);
    b.ball(WHITE, 0.32, x, 7.55 - L + 0.16, 0.3);
  }
  // drips (sides)
  for (let i = 0; i < 11; i++) {
    const z = -0.9 - i * 0.95;
    const L = 0.5 + ((i * 29) % 7) * 0.13;
    [-9.28, 9.28].forEach((x) => {
      b.cyl(WHITE, 0.28, L - 0.16, x, 7.55 - L + 0.16, z);
      b.ball(WHITE, 0.32, x, 7.55 - L + 0.16, z);
    });
  }

  // ---------- Lollipop (stick = cylinder, candy = big coloured ball with a white swirl) ----------
  function lollipop(x, y0, z, stickH, dia, colA, colB, colC) {
    b.cyl(WHITE, 0.16, stickH, x, y0, z);                              // stick
    for (let k = 0; k < stickH - 0.2; k += 0.4) {
      b.cyl(colA, 0.19, 0.14, x, y0 + k + 0.05, z);                    // coloured rings on the stick
    }
    const yc = y0 + stickH + dia / 2;
    b.ball(colA, dia, x, yc, z);                                       // the candy
    const r = dia / 2 + 0.01;
    const N = 28;
    for (let k = 0; k < 2; k++) {                                      // two interleaved swirls
      for (let i = 0; i < N; i++) {
        const s = Math.sqrt((i + 0.5) / N) * 0.97;
        const th = s * Math.PI * 2 * 2.2 + k * Math.PI;
        b.dot(k === 0 ? colB : colC, dia * 0.07, x + r * s * Math.cos(th), yc + r * s * Math.sin(th), z + r * Math.sqrt(1 - s * s));
      }
    }
    // little bow under the candy
    b.ellip(HOT, 0.5, 0.26, 0.16, x - 0.22, y0 + stickH - 0.05, z, 0, 0, 0.35);
    b.ellip(HOT, 0.5, 0.26, 0.16, x + 0.22, y0 + stickH - 0.05, z, 0, 0, -0.35);
    b.ball(HOT, 0.16, x, y0 + stickH - 0.05, z);
  }
  // on the roof (they stand on the icing, y 7.85)
  lollipop(-6.8, 7.85, -3.6, 1.4, 2.0, 0xff6fa5, 0xffffff, 0xffc0d8);
  lollipop(6.3, 7.85, -2.6, 1.0, 1.8, 0x6fd9b0, 0xffffff, 0xc9f4e3);
  lollipop(0.5, 7.85, -8.0, 1.8, 2.2, 0xb79cf0, 0xffffff, 0xdcd0fa);
  // in the forecourt
  lollipop(-8.4, G, 3.0, 2.2, 2.0, 0xff9f5a, 0xffffff, 0xffd9b8);
  lollipop(8.4, G, 3.0, 2.2, 2.0, 0x7ec8ff, 0xffffff, 0xcfeaff);
  lollipop(-8.6, G, 9.4, 1.4, 1.5, 0xff6fa5, 0xffffff, 0xffc0d8);
  lollipop(8.6, G, 9.4, 1.4, 1.5, 0x6fd9b0, 0xffffff, 0xc9f4e3);

  // ---------- Sign frame and the giant donut ----------
  b.box(HOT, 10.4, 2.7, 0.05, 0, 4.3, 0);                              // frame behind the sign board
  b.box(WHITE, 10.2, 2.5, 0.06, 0, 4.4, 0);
  // the donut: a ring of balls (dough), pink icing on the front, and sprinkles
  {
    const DX = -6.3;
    const DY = 5.65;
    const DZ = 0.42;
    const R = 0.9;
    const N = 20;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      b.ball(0xe3a76f, 0.8, DX + R * Math.cos(a), DY + R * Math.sin(a), DZ);            // dough
    }
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      b.ellip(0xff8fb8, 0.86, 0.86, 0.5, DX + R * Math.cos(a), DY + R * Math.sin(a), DZ + 0.18);   // icing
    }
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + 0.1;
      const rr = R + (((i * 7) % 5) - 2) * 0.12;
      b.dot(CANDY_COLS[i % 8], 0.11, DX + rr * Math.cos(a), DY + rr * Math.sin(a), DZ + 0.47);  // sprinkles
    }
  }

  // ---------- Windows (pastel frame, glass, and a ledge with gumballs) ----------
  [-5.2, 5.2].forEach((cx) => {
    b.box(PINK_DEEP, 2.9, 2.05, 0.1, cx, 1.05, 0.03);                  // frame
    b.box(GLASS, 2.6, 1.85, 0.08, cx, 1.15, 0.09);                     // glass
    b.slab(SHINE, 0.2, 1.7, 0.02, cx - 0.7, 2.05, 0.14, 0, 0, 0.4);    // shine
    b.slab(SHINE, 0.08, 1.7, 0.02, cx - 0.35, 2.05, 0.14, 0, 0, 0.4);
    for (let k = -2; k <= 2; k++) {
      b.ellip(WHITE, 0.6, 0.35, 0.2, cx + k * 0.55, 3.1, 0.08);        // white scallops on top
    }
    b.box(WHITE, 3.2, 0.12, 0.55, cx, 0.95, 0.28);                     // ledge
    for (let k = 0; k < 8; k++) {
      b.ball(CANDY_COLS[k], 0.28, cx - 1.2 + k * 0.34, 1.21, 0.3);     // gumballs on the ledge
    }
  });

  // round side windows (portholes)
  [-3.5, -7.5].forEach((z) => {
    [-9.0, 9.0].forEach((x) => {
      b.cylRot(HOT, 1.5, 0.14, x, 5.3, z, 0, 0, Math.PI / 2);          // frame
      b.cylRot(GLASS, 1.2, 0.18, x, 5.3, z, 0, 0, Math.PI / 2);        // glass
    });
  });

  // ---------- Door (chocolate-bar door in the middle of the front wall) ----------
  b.box(PINK_DEEP, 0.2, 3.0, 0.2, -1.1, G, 0.05);                      // frame
  b.box(PINK_DEEP, 0.2, 3.0, 0.2, 1.1, G, 0.05);
  b.box(PINK_DEEP, 2.4, 0.2, 0.2, 0, 2.9, 0.05);
  for (let k = -3; k <= 3; k++) {
    b.ellip(WHITE, 0.4, 0.32, 0.2, k * 0.34, 3.12, 0.08);              // white scallops above the door
  }
  [-0.5, 0.5].forEach((x) => {
    b.box(CHOC, 1.0, 2.8, 0.08, x, G, 0.04);                           // door leaf
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 4; row++) {
        b.box(CHOC_LIGHT, 0.38, 0.55, 0.04, x - 0.21 + col * 0.42, G + 0.12 + row * 0.66, 0.1);   // chocolate squares
      }
    }
  });
  b.ball(HOT, 0.2, -0.15, 1.5, 0.15);                                  // handles
  b.ball(HOT, 0.2, 0.15, 1.5, 0.15);

  // ---------- Candy-cane columns beside the door (white with red spiral stripes) ----------
  function candyPole(x, z, h, dia, stripeW, stripeCol) {
    const r = dia / 2;
    b.cyl(WHITE, dia, h, x, G, z);
    let i = 0;
    for (let y = G + 0.06; y < G + h - 0.05; y += 0.12, i++) {
      const th = i * 0.5;
      [th, th + Math.PI].forEach((t) => {
        const ry = Math.atan2(-Math.cos(t), -Math.sin(t));
        b.slab(stripeCol, stripeW, 0.14, 0.04, x + (r + 0.01) * Math.cos(t), y, z + (r + 0.01) * Math.sin(t), 0, ry, 0);
      });
    }
  }
  [-2.0, 2.0].forEach((x) => {
    candyPole(x, 0.55, 3.3, 0.42, 0.15, 0xe53935);
    b.cyl(PINK_DEEP, 0.6, 0.15, x, G, 0.55);                           // base ring
    b.ellip(PINK_DEEP, 0.6, 0.35, 0.6, x, G + 3.38, 0.55);             // pink cap
    b.ball(WHITE, 0.2, x, G + 3.62, 0.55);
  });

  // ---------- Striped awning (pink and white) ----------
  const AW_FROM_Y = 4.0;
  const AW_TO_Y = 3.2;
  const AW_Z = 2.7;
  const AW_LEN = Math.hypot(AW_Z, AW_FROM_Y - AW_TO_Y);
  const AW_TILT = Math.atan2(AW_FROM_Y - AW_TO_Y, AW_Z);
  for (let i = 0; i < 16; i++) {
    const x = -7.5 + i;
    const col = i % 2 === 0 ? PINK_DEEP : WHITE;
    b.slab(col, 1.0, 0.06, AW_LEN, x, (AW_FROM_Y + AW_TO_Y) / 2, AW_Z / 2 + 0.03, AW_TILT, 0, 0);
    b.box(col, 1.0, 0.22, 0.05, x, AW_TO_Y - 0.22, AW_Z + 0.03);       // front flap
    b.ellip(col, 1.0, 0.44, 0.05, x, AW_TO_Y - 0.22, AW_Z + 0.03);     // rounded scallop edge
  }
  [-7.8, 7.8].forEach((x) => {
    candyPole(x, 2.55, 3.1, 0.2, 0.09, 0xe8508a);                      // pink candy posts at both ends
  });

  // ---------- Checkerboard path from the street to the door ----------
  for (let row = 0; row < 11; row++) {
    for (let col = -1; col <= 1; col++) {
      b.box((row + col) % 2 === 0 ? PINK : WHITE, 1.0, 0.02, 1.0, col, G, 0.5 + row);
    }
  }

  // ---------- Candy-jar display table ----------
  {
    const TX = -5.2;
    const TZ = 4.8;
    b.box(WHITE, 3.2, 0.08, 1.3, TX, 0.82, TZ);                        // table top (y 0.82 to 0.9)
    [[-1.5, -0.55], [1.5, -0.55], [-1.5, 0.55], [1.5, 0.55]].forEach(([lx, lz]) => {
      b.box(PINK_DEEP, 0.1, 0.72, 0.1, TX + lx, G, TZ + lz);           // legs
    });
    for (let k = 0; k < 8; k++) {
      b.box(k % 2 === 0 ? PINK_DEEP : WHITE, 0.4, 0.3, 0.03, TX - 1.4 + k * 0.4, 0.52, TZ + 0.67);   // striped front skirt
    }
    b.box(MINT_DEEP, 3.0, 0.28, 0.5, TX, 0.9, TZ - 0.35);             // raised back shelf (top y 1.18)
    function jar(x, y, z, col, dia, h) {
      b.cyl(col, dia, h * 0.8, x, y, z);                               // the candy inside
      b.cyl(GLASS, dia + 0.04, 0.05, x, y, z);                         // glass base ring
      b.cyl(GLASS, dia * 0.8, 0.1, x, y + h * 0.8, z);                 // glass neck
      b.cyl(HOT, dia * 0.9, 0.1, x, y + h * 0.8 + 0.1, z);             // lid
      b.ball(HOT, 0.12, x, y + h * 0.8 + 0.24, z);                     // lid knob
      b.box(SHINE, 0.05, h * 0.6, 0.03, x - dia * 0.25, y + 0.08, z + dia * 0.5);   // glass shine
    }
    for (let i = 0; i < 5; i++) {
      jar(TX - 1.2 + i * 0.6, 1.18, TZ - 0.38, CANDY_COLS[(i + 2) % 8], 0.44, 0.62);   // back row
    }
    for (let i = 0; i < 4; i++) {
      jar(TX - 1.17 + i * 0.78, 0.9, TZ + 0.3, CANDY_COLS[i % 8], 0.5, 0.55);          // front row
    }
  }

  // ---------- Two benches ----------
  function bench(x, z) {
    for (let k = -1; k <= 1; k++) {
      b.box(k === 0 ? WHITE : PINK_DEEP, 1.8, 0.06, 0.15, x, 0.45, z + k * 0.17);   // seat slats
    }
    [0, 1, 2].forEach((k) => {
      b.box(k === 1 ? WHITE : MINT_DEEP, 1.8, 0.12, 0.04, x, 0.62 + k * 0.17, z - 0.25);   // back slats
    });
    [-0.8, 0.8].forEach((lx) => {
      b.box(WHITE, 0.08, 0.45, 0.5, x + lx, G, z);                     // side legs
      b.box(WHITE, 0.07, 0.95, 0.07, x + lx, G, z - 0.25);             // back posts
      b.ball(HOT, 0.14, x + lx, 1.08, z - 0.25);                       // pink top knobs
    });
  }
  bench(4.3, 4.6);
  bench(6.9, 4.6);
}
