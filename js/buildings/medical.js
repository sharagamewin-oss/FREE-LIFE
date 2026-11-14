// =====================================================
// CIVIC BUILDING: MEDICAL SHOP (a pharmacy)
// A white and soft-green building, 18 x 10 m and 8 m tall, with a flat roof and a big green cross
// sign on a pole. On the front wall: a glass double door in the middle, a big display window on each
// side with shelves of small coloured boxes and bottles, and a green and white striped awning.
// In the forecourt: a bench, a bin and two planters.
// =====================================================
// Drawing space (the building's OWN directions, the same idea as a house):
//   origin (0, 0) = middle of the 24 x 24 m lot.   x = right.   +z = front (street side).
//   Body: x from -9 to 9, z from -10 to 0 (front wall at z = 0), 8 m tall.
//   Forecourt: z from 0 to 12.
//
// The sign board (drawn by index.js) is a 10 x 2.5 m board at x = 0, z = 0.1. It hangs above the
// awning (y 4.75 to 7.25), so signY is 6.0.
//
// The door is in the middle of the front wall, under the awning.
export const info = {
  id: 'medical',
  name: 'Medical Store',
  sign: 'MEDICAL SHOP',          // the words on the sign board
  signY: 6.0,                    // middle of the sign board: it covers y 4.75 to 7.25
  height: 8,                     // the building (the cross sign on the roof rises to about 13 m)
  door: { x: 0, z: 1.5 },        // under the awning, in front of the glass door
  collide: {
    // box = [centre x, centre z, width, depth, height]
    boxes: [
      [0, -5, 18, 10, 8],                // the pharmacy
      [-5.2, 4.5, 0.5, 1.8, 0.9]         // the bench
    ],
    // round = [x, z, radius, height]
    round: [
      [-2.7, 2.6, 0.6, 1.3],             // the two planters
      [2.7, 2.6, 0.6, 1.3],
      [3.8, 3.4, 0.3, 1.0],              // the bin
      [0, -2.2, 0.15, 11]              // the pole of the cross sign
    ]
  }
};

export function build(b, c) {
  const G = c.G;               // ground height (0.1)
  const TOP = G + 8;           // the top of the walls

  // ---------- Colours ----------
  const WHITE = 0xf8f8f4;
  const SOFT_GREEN = 0xc3e4be;
  const MID_GREEN = 0x8cc99a;
  const GREEN = 0x2e9e5b;
  const GREEN_DARK = 0x1f7a44;
  const STONE = 0xc9c2b4;
  const STONE_DARK = 0xa8a294;
  const GREY = 0x8a8f94;
  const GREY_DARK = 0x5d6369;
  const BACKDROP = 0xe4f3ee;
  const GLASS = 0xcfeaf2;
  const WOOD = 0xb5793f;
  const WOOD_DARK = 0x7a4a2a;
  const LEAF = 0x62b552;
  const FLOWERS = [0xf48fb1, 0xffd54f, 0xffffff, 0xff8a65, 0xb388eb];
  const PACKS = [0xff8a80, 0xffd180, 0x80d8ff, 0xb9f6ca, 0xea80fc, 0xfff59d, 0xffffff, 0x90caf9, 0xf48fb1];
  const BOTTLES = [0xd98b3a, 0x4fa3d9, 0x5fb36a, 0xe0e0e0];

  // A small random number maker with a fixed seed, so the shelves look the same every visit.
  let seed = 7001;
  const rng = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (list) => list[Math.floor(rng() * list.length)];

  // =====================================================
  // THE BODY: white walls, soft-green base and piers, flat roof with a parapet
  // =====================================================
  b.box(WHITE, 18, 8, 10, 0, G, -5);
  b.box(SOFT_GREEN, 18.14, 0.8, 10.14, 0, G, -5);                          // soft-green base
  b.box(STONE_DARK, 18.3, 0.12, 10.3, 0, G, -5);                           // stone footing
  b.box(WHITE, 18.5, 0.35, 10.5, 0, TOP - 0.35, -5);                       // cornice
  b.box(SOFT_GREEN, 18.2, 0.3, 0.06, 0, TOP - 0.6, 0.03);                  // soft-green band under the cornice
  // The flat roof, with a parapet round it
  b.box(GREY, 17.6, 0.08, 9.6, 0, TOP, -5);
  b.box(WHITE, 18.5, 0.7, 0.3, 0, TOP, -0.1);                              // parapet: front
  b.box(WHITE, 18.5, 0.7, 0.3, 0, TOP, -9.9);                              // back
  b.box(WHITE, 0.3, 0.7, 10.5, -9.1, TOP, -5);                             // left
  b.box(WHITE, 0.3, 0.7, 10.5, 9.1, TOP, -5);                              // right
  b.box(GREEN, 18.7, 0.1, 0.5, 0, TOP + 0.7, -0.1);                        // green cap on the front parapet
  b.box(GREEN, 18.7, 0.1, 0.5, 0, TOP + 0.7, -9.9);
  b.box(GREEN, 0.5, 0.1, 10.7, -9.1, TOP + 0.7, -5);
  b.box(GREEN, 0.5, 0.1, 10.7, 9.1, TOP + 0.7, -5);

  // Things on the roof: two air units, a skylight and two vent pipes
  [[-5.5, -6.5], [5.5, -7.2]].forEach(([x, z]) => {
    b.box(GREY, 1.8, 0.9, 1.3, x, TOP + 0.08, z);
    b.cyl(GREY_DARK, 0.9, 0.06, x, TOP + 0.98, z);
    b.box(GREY_DARK, 1.9, 0.08, 1.4, x, TOP + 0.08, z);
  });
  b.box(MID_GREEN, 2.4, 0.4, 1.6, 6.2, TOP + 0.08, -3.4);
  b.box(GLASS, 2.0, 0.1, 1.2, 6.2, TOP + 0.48, -3.4);
  [[-6.8, -3.6], [-7.6, -3.9]].forEach(([x, z]) => {
    b.cyl(GREY, 0.3, 0.9, x, TOP + 0.08, z);
    b.cyl(GREY_DARK, 0.4, 0.08, x, TOP + 0.98, z);
  });

  // ---------- The big green cross sign on a pole ----------
  const CZ = -2.2;                       // the pole stands just behind the front parapet
  const CY = TOP + 3.5;                  // the middle of the cross
  b.box(GREY_DARK, 1.0, 0.12, 1.0, 0, TOP + 0.08, CZ);                     // base plate
  b.cyl(GREY, 0.3, 2.7, 0, TOP + 0.2, CZ);                                 // the pole
  b.box(GREEN, 1.1, 3.0, 0.4, 0, CY - 1.5, CZ);                            // the cross: up and down
  b.box(GREEN, 3.0, 1.1, 0.4, 0, CY - 0.55, CZ);                           //            left and right
  [-1, 1].forEach((s) => {                                                 // a white cross inside it, on both faces
    b.box(WHITE, 0.5, 2.5, 0.05, 0, CY - 1.25, CZ + s * 0.2);
    b.box(WHITE, 2.5, 0.5, 0.05, 0, CY - 0.25, CZ + s * 0.2);
  });
  b.box(GREEN_DARK, 1.2, 0.1, 0.5, 0, CY + 1.5, CZ);                       // cap on top of the cross

  // =====================================================
  // THE FRONT WALL (z = 0)
  // =====================================================
  // The board behind the sign (green frame; the sign itself is drawn by index.js at z = 0.1)
  b.box(GREEN, 10.6, 3.0, 0.06, 0, 4.5, 0.04);
  b.box(WHITE, 10.3, 2.7, 0.06, 0, 4.65, 0.07);

  // Soft-green piers: at the corners, and between the door and the windows
  // (the corner piers go all the way up; the two in the middle stop under the sign board)
  [-8.7, 8.7].forEach((x) => b.box(SOFT_GREEN, 0.7, 7.2, 0.14, x, G + 0.8, 0.06));
  [-1.95, 1.95].forEach((x) => b.box(SOFT_GREEN, 0.7, 3.5, 0.14, x, G + 0.8, 0.06));

  // ---------- The glass double door (in the middle) ----------
  b.box(SOFT_GREEN, 2.7, 3.4, 0.2, 0, G, 0.1);                             // door surround
  b.box(WHITE, 2.4, 3.1, 0.16, 0, G, 0.2);                                 // frame
  [-0.5, 0.5].forEach((x) => {
    b.box(GLASS, 0.9, 2.7, 0.1, x, G, 0.3);                                // glass leaf
    b.box(WHITE, 1.0, 0.1, 0.12, x, G + 1.3, 0.31);                        // cross bar
  });
  b.box(WHITE, 2.2, 0.28, 0.12, 0, G + 2.8, 0.3);                          // transom (above the doors)
  b.box(GREEN, 0.14, 0.7, 0.08, -0.12, G + 1.0, 0.37);                     // door handles
  b.box(GREEN, 0.14, 0.7, 0.08, 0.12, G + 1.0, 0.37);
  b.box(STONE, 3.2, 0.12, 1.0, 0, G, 0.55);                                // door step
  // a small green cross by the door
  b.box(GREEN, 0.18, 0.62, 0.06, 1.95, G + 2.2, 0.15);
  b.box(GREEN, 0.62, 0.18, 0.06, 1.95, G + 2.42, 0.15);
  b.box(GREEN, 0.18, 0.62, 0.06, -1.95, G + 2.2, 0.15);
  b.box(GREEN, 0.62, 0.18, 0.06, -1.95, G + 2.42, 0.15);

  // ---------- The two big display windows, with shelves of small coloured boxes ----------
  [-1, 1].forEach((s) => {
    const cx = s * 5.2;                                                    // middle of the window
    const W = 5.6;                                                         // inside width
    const Y1 = G + 0.8;                                                    // the sill top
    const Y2 = G + 3.5;                                                    // the window top
    b.box(STONE, W + 0.5, 0.3, 0.55, cx, G + 0.5, 0.22);                   // sill
    b.box(BACKDROP, W, Y2 - Y1, 0.06, cx, Y1, 0.03);                       // the pale wall at the back of the display
    // frame
    b.box(WHITE, W + 0.5, 0.22, 0.3, cx, Y2, 0.15);                        // top
    b.box(WHITE, 0.25, Y2 - Y1 + 0.22, 0.3, cx - W / 2 - 0.12, Y1, 0.15);  // sides
    b.box(WHITE, 0.25, Y2 - Y1 + 0.22, 0.3, cx + W / 2 + 0.12, Y1, 0.15);
    b.box(GREEN, W + 0.8, 0.12, 0.34, cx, Y2 + 0.22, 0.15);               // green lintel
    [-W / 6, W / 6].forEach((mx) => b.box(WHITE, 0.07, Y2 - Y1, 0.1, cx + mx, Y1, 0.46));   // thin bars

    // four shelves, each with a row of small boxes and bottles
    [0.8, 1.5, 2.2, 2.9].forEach((dy, row) => {
      const sy = G + dy;
      if (row > 0) b.box(WOOD, W - 0.1, 0.05, 0.4, cx, sy - 0.05, 0.24);   // the shelf plank
      let x = cx - W / 2 + 0.3;
      while (x < cx + W / 2 - 0.3) {
        const wide = 0.24 + rng() * 0.12;
        const tall = 0.3 + rng() * 0.22;
        if (rng() < 0.28) {                                                // a bottle with a white cap
          const col = pick(BOTTLES);
          b.cyl(col, 0.2, tall, x, sy, 0.24);
          b.cyl(WHITE, 0.12, 0.08, x, sy + tall, 0.24);
        } else {                                                           // a small box
          b.box(pick(PACKS), wide, tall, 0.2, x, sy, 0.24);
          if (rng() < 0.4) b.box(GREEN, wide * 0.5, 0.06, 0.02, x, sy + tall * 0.55, 0.35);   // a green label
        }
        x += wide + 0.07;
      }
    });
  });

  // =====================================================
  // THE GREEN AND WHITE AWNING (over the door and both windows)
  // =====================================================
  const AW_TOP = G + 4.35;               // height of the awning at the wall
  const AW_TILT = 0.35;                  // it slopes down towards the street
  const AW_LEN = 1.95;                   // length of the slope
  const AW_DROP = AW_LEN * Math.sin(AW_TILT);
  const AW_REACH = AW_LEN * Math.cos(AW_TILT);
  const STRIPES = 20;
  const STRIPE_W = 17.6 / STRIPES;
  for (let i = 0; i < STRIPES; i++) {
    const x = -8.8 + STRIPE_W * (i + 0.5);
    const col = i % 2 === 0 ? GREEN : WHITE;
    b.slab(col, STRIPE_W, 0.06, AW_LEN, x, AW_TOP - AW_DROP / 2, 0.05 + AW_REACH / 2, AW_TILT, 0, 0);
    b.box(col, STRIPE_W, 0.4, 0.05, x, AW_TOP - AW_DROP - 0.4, 0.05 + AW_REACH);   // the hanging valance
  }
  [-8.6, -4.4, 4.4, 8.6].forEach((x) => {                                          // thin beams under the awning
    b.slab(GREY, 0.07, 0.07, AW_LEN, x, AW_TOP - AW_DROP / 2 - 0.08, 0.05 + AW_REACH / 2, AW_TILT, 0, 0);
  });

  // =====================================================
  // THE SIDES AND THE BACK: small windows
  // =====================================================
  [-1, 1].forEach((s) => {
    [-2.5, -5, -7.5].forEach((z) => {
      b.box(WHITE, 0.16, 1.9, 1.9, s * 9.03, G + 2.2, z);                          // frame
      b.box(GLASS, 0.2, 1.5, 1.5, s * 9.04, G + 2.4, z);                           // glass
      b.box(WHITE, 0.24, 0.08, 1.5, s * 9.06, G + 3.1, z);                         // cross bar
      b.box(SOFT_GREEN, 0.24, 1.9, 0.3, s * 9.06, G + 2.2, z - 1.1);               // shutters
      b.box(SOFT_GREEN, 0.24, 1.9, 0.3, s * 9.06, G + 2.2, z + 1.1);
    });
  });
  b.box(GREEN_DARK, 1.6, 2.5, 0.16, 5, G, -10.04);                                 // back door (shut)
  b.box(WHITE, 1.9, 0.12, 0.3, 5, G + 2.5, -10.08);

  // =====================================================
  // THE FORECOURT: tiled path, two lawns, bench, bin, two planters
  // =====================================================
  // The path from the street to the door (light stone tiles with thin lines)
  b.box(0xe6e0d4, 3.2, 0.03, 11.2, 0, G, 6.4);
  for (let z = 1; z < 12; z += 1.0) b.box(0xcfc8b8, 3.2, 0.035, 0.05, 0, G, z);
  b.box(0xcfc8b8, 0.05, 0.035, 11.2, -0.8, G, 6.4);
  b.box(0xcfc8b8, 0.05, 0.035, 11.2, 0.8, G, 6.4);
  b.box(STONE_DARK, 0.18, 0.06, 11.2, -1.69, G, 6.4);                              // kerbs
  b.box(STONE_DARK, 0.18, 0.06, 11.2, 1.69, G, 6.4);

  // Two lawn patches with a stone edge and a few flowers
  [[-7.2, 9.0], [7.2, 9.0]].forEach(([x, z], idx) => {
    b.box(STONE_DARK, 6.4, 0.1, 3.4, x, G, z);
    b.box(0x6fbf55, 6.0, 0.14, 3.0, x, G, z);
    b.flexUp(G + 0.1, G + 0.6, 0.9);
    for (let i = 0; i < 9; i++) {
      b.dot(pick(FLOWERS), 0.3, x + (rng() - 0.5) * 5.2, G + 0.3, z + (rng() - 0.5) * 2.2);
    }
    b.flex(0);
    b.flex(0.5);
    b.ball(LEAF, 1.3, x + (idx ? -2.3 : 2.3), G + 0.6, z + 0.9, 0.85);            // a round bush
    b.flex(0);
  });

  // Two planters, one on each side of the path
  [-2.7, 2.7].forEach((x, idx) => {
    const z = 2.6;
    b.box(GREEN, 1.2, 0.7, 1.0, x, G, z);                                          // the box
    b.box(WHITE, 1.28, 0.08, 1.08, x, G + 0.66, z);                                // white rim
    b.box(0x6b4a2e, 1.0, 0.1, 0.8, x, G + 0.7, z);                                 // soil
    b.flex(0.5);
    b.ball(LEAF, 0.9, x - 0.25, G + 1.05, z, 0.85);
    b.ball(0x4f9e4a, 0.7, x + 0.3, G + 1.0, z + 0.1, 0.85);
    b.flex(0);
    b.flexUp(G + 0.9, G + 1.5, 0.9);
    for (let i = 0; i < 6; i++) {
      b.dot(FLOWERS[(i + idx * 2) % FLOWERS.length], 0.28, x + (rng() - 0.5) * 0.9, G + 1.35 + rng() * 0.15, z + (rng() - 0.5) * 0.6);
    }
    b.flex(0);
  });

  // A bin (green, with a lid and a white band)
  b.cyl(GREEN_DARK, 0.6, 0.95, 3.8, G, 3.4);
  b.cyl(WHITE, 0.62, 0.12, 3.8, G + 0.45, 3.4);
  b.cyl(GREY_DARK, 0.68, 0.1, 3.8, G + 0.95, 3.4);
  b.cyl(GREY, 0.2, 0.08, 3.8, G + 1.05, 3.4);

  // A bench by the path, looking at the path (it turns to look to the right)
  const BX = -5.2;
  const BZ = 4.5;
  // the seat runs along z; the back is on the left (x smaller)
  b.box(WOOD, 0.5, 0.08, 1.8, BX, G + 0.45, BZ);                                   // seat
  b.box(WOOD, 0.07, 0.45, 1.8, BX - 0.23, G + 0.55, BZ);                           // back
  b.box(WOOD_DARK, 0.45, 0.45, 0.1, BX, G, BZ - 0.8);                              // legs
  b.box(WOOD_DARK, 0.45, 0.45, 0.1, BX, G, BZ + 0.8);
  b.box(WOOD_DARK, 0.08, 0.3, 0.08, BX - 0.23, G + 0.5, BZ - 0.82);                // back supports
  b.box(WOOD_DARK, 0.08, 0.3, 0.08, BX - 0.23, G + 0.5, BZ + 0.82);
}
