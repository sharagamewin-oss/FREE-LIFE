// =====================================================
// CIVIC BUILDING: GREEN FARM
// A working farm: a red barn at the back (14 x 8 m, 9 m tall, pitched roof, white cross-bar doors),
// a tall silo (4 m wide, 12 m tall, dome top), a small farmhouse-style shed, four long crop beds
// (green, yellow and orange, low and walkable), a scarecrow, a water trough, hay bales,
// a wooden fence round the lot with a gate, and the GREEN FARM sign on a tall wooden post gate.
// =====================================================
// Drawing space (the building's OWN directions, the same idea as a house):
//   origin (0, 0) = the middle of the 24 x 24 m lot.   x = right.
//   +z = the front (street side).   -z = the back.
//
// The sign board (drawn by index.js) is always a 10 x 2.5 m board at x = 0, z = 0.1, so the
// wooden sign gate stands there (between the crop beds and the barn yard) and the board hangs
// high enough (y 3.15 to 5.65) for players to walk under it.
//
// The door is the barn door: stand on the yard in front of the barn doors.
export const info = {
  id: 'farmland',
  name: 'Farmland',
  sign: 'GREEN FARM',            // the words on the sign board
  signY: 4.4,                    // middle of the sign board: it covers y 3.15 to 5.65
  height: 12,                    // real height: the top of the silo (players can fly over it)
  door: { x: -2.5, z: -0.9 },    // in front of the barn doors (barn front wall is at z = -2.4)
  collide: {
    // box = [centre x, centre z, width, depth, height]
    boxes: [
      [-2.5, -6.4, 14, 8, 9],            // the barn
      [8.0, -2.1, 3.6, 3.0, 4.4],        // the shed (with its chimney)
      [-6.375, 11, 9.25, 0.3, 1.0],      // front fence, left of the gate
      [6.375, 11, 9.25, 0.3, 1.0],       // front fence, right of the gate
      [-11, 0, 0.3, 22.3, 1.0],          // left fence
      [11, 0, 0.3, 22.3, 1.0],           // right fence
      [0, -11, 22.3, 0.3, 1.0],          // back fence
      [-9.3, 8.6, 0.8, 2.4, 0.75],       // the water trough
      [9.2, 3.0, 1.3, 1.4, 1.3],         // hay bale (round, lying)
      [9.5, 4.8, 1.4, 1.3, 1.3],         // hay bale (round, lying the other way)
      [9.2, 9.4, 1.3, 1.4, 1.3],         // hay bale (round)
      [9.9, 7.3, 1.1, 1.2, 1.1]          // stack of square hay bales
    ],
    // round = [x, z, radius, height]
    round: [
      [7.4, -7.0, 2.0, 12],              // the silo
      [-5.5, 0, 0.25, 6.2],              // the two tall posts of the sign gate
      [5.5, 0, 0.25, 6.2],
      [-1.6, 11, 0.2, 2.3],              // the two gate posts
      [1.6, 11, 0.2, 2.3],
      [-9.3, 5.5, 0.3, 2.5]              // the scarecrow
    ]
    // The four crop beds are NOT in these lists: you can walk over them.
  }
};

export function build(b, c) {
  const G = c.G;   // ground height (0.1)

  // ---------- Colours ----------
  const RED = 0xb7312c;
  const RED_DARK = 0x9c2823;
  const WHITE = 0xffffff;
  const ROOF_GREY = 0x6f747a;
  const ROOF_GREY_DARK = 0x4f5459;
  const WOOD = 0xb5793f;
  const WOOD_DARK = 0x7a4a2a;
  const CREAM = 0xf3e6c4;
  const BRICK = 0xb5533c;
  const STONE = 0xb8b0a0;
  const GRASS = 0x7fbf5f;
  const DIRT = 0xc9b183;
  const SOIL = 0x6b4a2e;
  const HAY = 0xe3b94f;
  const HAY_DARK = 0xc99a32;
  const STEEL = 0x6b7a88;
  const DARK_GLASS = 0x3e5568;

  // ---------- Ground: grass inside the fence, a dirt yard and a path ----------
  b.box(GRASS, 22.4, 0.03, 22.4, 0, G, 0);
  b.box(DIRT, 14.4, 0.06, 3.0, -2.5, G, -1.2);       // the yard in front of the barn
  b.box(DIRT, 3.0, 0.06, 10.7, 0, G, 5.65);          // the path from the gate to the yard

  // ---------- Fence round the lot, with a gate in the middle of the front ----------
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
  fenceX(-11, -11, 11);
  fenceZ(-11, -11, 11);
  fenceZ(11, -11, 11);

  // The gate: two tall posts with a beam over the path, a lantern on each post
  [-1.6, 1.6].forEach((x) => {
    b.box(WOOD_DARK, 0.3, 2.3, 0.3, x, G, 11);
    b.ball(0xffd54f, 0.26, x, G + 2.5, 11);
  });
  b.box(WOOD_DARK, 3.5, 0.2, 0.2, 0, G + 2.1, 11);

  // ---------- The sign gate: two tall wooden posts and a beam; the board hangs between them ----------
  b.box(WOOD_DARK, 10.4, 2.8, 0.06, 0, 3.0, 0.03);                   // backing behind the board
  [-5.5, 5.5].forEach((x) => {
    b.box(WOOD_DARK, 0.4, 6.1, 0.4, x, G, 0);                        // post
    b.box(WOOD, 0.55, 0.12, 0.55, x, G + 6.1, 0);                    // post cap
    b.ball(0xffd54f, 0.3, x, G + 6.4, 0);                            // lantern
    b.box(STONE, 0.7, 0.3, 0.7, x, G, 0);                            // stone foot
  });
  b.box(WOOD_DARK, 11.8, 0.4, 0.4, 0, 5.8, 0);                       // beam

  // =====================================================
  // THE BARN (red, at the back, door in the front wall)
  // =====================================================
  const BCX = -2.5;                  // middle of the barn (x)
  const BZF = -2.4;                  // front wall (z)
  const BZC = -6.4;                  // middle of the depth = the roof ridge
  const BX0 = BCX - 7;               // left end
  const BX1 = BCX + 7;               // right end
  const BWALL = 5.9;                 // walls: y 0.1 to 6.0
  const BTOP = G + BWALL;
  const BRISE = 2.8;                 // roof rise above the walls
  const BHALF_D = 4.0;               // ridge to wall
  const BOVER = 0.7;                 // the roof hangs out 0.7 m at the front and back

  b.box(RED, 14, BWALL, 8, BCX, G, BZC);

  // Boards on the front wall (thin darker lines)
  for (let i = 0; i <= 15; i++) {
    const x = BX0 + 0.45 + i * 0.88;
    if (Math.abs(x - BCX) > 2.4) b.box(RED_DARK, 0.05, BWALL - 0.2, 0.04, x, G, BZF);
  }

  // White corner boards
  [[BX0, BZF], [BX1, BZF], [BX0, BZC - 4], [BX1, BZC - 4]].forEach(([x, z], i) => {
    const sx = x === BX0 ? 1 : -1;
    const sz = i < 2 ? -1 : 1;
    b.box(WHITE, 0.44, BWALL, 0.44, x + sx * 0.16, G, z + sz * 0.16);
  });

  // Pitched grey roof (ridge along x, slopes to the front and the back)
  const BSLOPE = BRISE / BHALF_D;
  const BANG = Math.atan(BSLOPE);
  const BHALF = BHALF_D + BOVER;
  const BLEN = Math.hypot(BHALF, BHALF * BSLOPE);
  const BRIDGE_Y = BTOP + BRISE;                      // 8.8
  const BMID_Y = BRIDGE_Y - (BHALF / 2) * BSLOPE;
  [1, -1].forEach((side) => {
    const a = side * BANG;
    const cz = BZC + side * BHALF / 2;
    b.slab(ROOF_GREY, 14.8, 0.3, BLEN, BCX, BMID_Y, cz, a, 0, 0);
    [-2.4, -1.2, 0, 1.2, 2.4].forEach((t) => {        // metal roof ribs
      b.slab(ROOF_GREY_DARK, 14.6, 0.05, 0.08,
        BCX, BMID_Y + 0.17 * Math.cos(a) - t * Math.sin(a),
        cz + 0.17 * Math.sin(a) + t * Math.cos(a), a, 0, 0);
    });
    [-1, 1].forEach((sx) => {                         // white boards along the roof ends
      b.slab(WHITE, 0.12, 0.34, BLEN, BCX + sx * 7.36, BMID_Y, cz, a, 0, 0);
    });
  });
  b.box(ROOF_GREY_DARK, 14.9, 0.16, 0.6, BCX, BRIDGE_Y + 0.04, BZC);   // ridge cap: top of the barn = y 9.0

  // The red triangle under the roof at each end (made of 10 steps)
  const BSTEPS = 10;
  const BSTEP_H = BRISE / BSTEPS;
  for (let k = 0; k < BSTEPS; k++) {
    const hw = BHALF_D * (1 - ((k + 0.5) * BSTEP_H) / BRISE);
    [BX0 + 0.2, BX1 - 0.2].forEach((x) => b.box(RED, 0.4, BSTEP_H, hw * 2, x, BTOP + k * BSTEP_H, BZC));
  }
  // A small window high up in each end
  [BX0, BX1].forEach((x) => {
    const s = x === BX0 ? -1 : 1;
    b.box(WHITE, 0.12, 1.3, 1.3, x, BTOP + 0.35, BZC);
    b.box(DARK_GLASS, 0.14, 1.0, 1.0, x + s * 0.01, BTOP + 0.5, BZC);
    b.box(WHITE, 0.16, 1.0, 0.06, x + s * 0.01, BTOP + 0.5, BZC);
    b.box(WHITE, 0.16, 0.06, 1.0, x + s * 0.01, BTOP + 0.97, BZC);
  });

  // Two windows in the front wall, one each side of the doors
  [BCX - 4.9, BCX + 4.9].forEach((x) => {
    b.box(WHITE, 1.5, 1.4, 0.12, x, 1.9, BZF);
    b.box(DARK_GLASS, 1.2, 1.1, 0.14, x, 2.05, BZF);
    b.box(WHITE, 0.07, 1.1, 0.16, x, 2.05, BZF);
    b.box(WHITE, 1.2, 0.07, 0.16, x, 2.55, BZF);
  });

  // Hayloft window above the doors
  b.box(WHITE, 1.6, 1.2, 0.12, BCX, 4.55, BZF);
  b.box(0x2e1f1b, 1.3, 0.9, 0.14, BCX, 4.7, BZF);
  b.box(WHITE, 0.08, 0.9, 0.16, BCX, 4.7, BZF);

  // The big doors: white frame, red leaves, white cross-bars (X) on each leaf
  const DW = 4.4;
  const DH = 3.8;
  b.box(WHITE, DW + 0.4, 0.25, 0.16, BCX, G + DH, BZF);                        // frame: top
  [-1, 1].forEach((s) => b.box(WHITE, 0.2, DH + 0.25, 0.16, BCX + s * (DW / 2 + 0.1), G, BZF));
  b.box(0x4a4a4a, 5.2, 0.12, 0.14, BCX, G + DH + 0.35, BZF + 0.04);            // the sliding rail
  [-1, 1].forEach((s) => {
    const xc = BCX + s * 1.1;                                                  // middle of this leaf
    b.box(RED_DARK, 2.16, DH, 0.1, xc, G, BZF);                                // the leaf
    b.box(WHITE, 2.16, 0.16, 0.14, xc, G + DH - 0.16, BZF);                    // leaf frame: top
    b.box(WHITE, 2.16, 0.16, 0.14, xc, G, BZF);                                // bottom
    b.box(WHITE, 0.16, DH, 0.14, xc - 1.0, G, BZF);                            // left
    b.box(WHITE, 0.16, DH, 0.14, xc + 1.0, G, BZF);                            // right
    const iw = 2.16 - 0.32;                                                    // the X: two diagonals
    const ih = DH - 0.32;
    const dl = Math.hypot(iw, ih);
    const da = Math.atan2(ih, iw);
    b.slab(WHITE, dl, 0.16, 0.12, xc, G + DH / 2, BZF, 0, 0, da);
    b.slab(WHITE, dl, 0.16, 0.12, xc, G + DH / 2, BZF, 0, 0, -da);
    b.box(0x333333, 0.08, 0.45, 0.1, BCX + s * 0.2, G + 1.5, BZF + 0.07);      // handle
  });

  // =====================================================
  // THE SILO (tall, grey, dome top)
  // =====================================================
  const SIX = 7.4;
  const SIZ = -7.0;
  b.cyl(0x9aa7b1, 4.04, 0.5, SIX, G, SIZ);                                     // darker base
  b.cyl(0xc7ced4, 4.0, 10.9, SIX, G, SIZ);                                     // the tower (top at y 11.0)
  for (let y = 1.6; y < 11; y += 1.6) b.cyl(0x9aa7b1, 4.07, 0.1, SIX, G + y, SIZ);   // metal rings
  b.ball(0x8d9aa6, 4.0, SIX, 11.0, SIZ, 0.4);                                  // dome (top at y 11.8)
  b.ball(0x6b7a88, 0.4, SIX, 11.8, SIZ);                                       // little knob (top = 12.0)
  [-0.25, 0.25].forEach((dx) => b.box(STEEL, 0.06, 10.5, 0.06, SIX + dx, G + 0.3, SIZ + 2.0));   // ladder rails
  for (let y = 0.6; y < 10.6; y += 0.5) b.box(STEEL, 0.5, 0.04, 0.05, SIX, G + y, SIZ + 2.0);     // ladder rungs

  // =====================================================
  // THE SHED (farmhouse style: cream walls, brown pitched roof, chimney)
  // =====================================================
  const SHX = 8.0;
  const SHZ = -2.1;
  const SHF = SHZ + 1.5;               // its front wall (z = -0.6)
  const SH_WALL = 2.4;
  const SH_TOP = G + SH_WALL;
  const SH_RISE = 1.1;
  const SH_HALF_D = 1.5;
  const SH_OVER = 0.4;
  const SH_ROOF = 0x7a4a2a;
  b.box(CREAM, 3.6, SH_WALL, 3.0, SHX, G, SHZ);
  b.box(STONE, 3.64, 0.3, 3.04, SHX, G, SHZ);                                     // stone base
  const sSlope = SH_RISE / SH_HALF_D;
  const sAng = Math.atan(sSlope);
  const sHalf = SH_HALF_D + SH_OVER;
  const sLen = Math.hypot(sHalf, sHalf * sSlope);
  const sRidgeY = SH_TOP + SH_RISE;
  const sMidY = sRidgeY - (sHalf / 2) * sSlope;
  [1, -1].forEach((side) => {
    b.slab(SH_ROOF, 4.4, 0.18, sLen, SHX, sMidY, SHZ + side * sHalf / 2, side * sAng, 0, 0);
  });
  b.box(0x5c3a21, 4.5, 0.12, 0.35, SHX, sRidgeY - 0.04, SHZ);                   // ridge cap
  const sSteps = 6;
  const sStepH = SH_RISE / sSteps;
  for (let k = 0; k < sSteps; k++) {                                            // cream triangle at each end
    const hw = SH_HALF_D * (1 - ((k + 0.5) * sStepH) / SH_RISE);
    [-1, 1].forEach((sx) => b.box(CREAM, 0.3, sStepH, hw * 2, SHX + sx * 1.65, SH_TOP + k * sStepH, SHZ));
  }
  b.box(BRICK, 0.5, 1.7, 0.5, SHX - 1.3, SH_TOP, SHZ - 0.2);                    // chimney (top at y 4.2)
  b.box(0x8a3f2c, 0.65, 0.12, 0.65, SHX - 1.3, SH_TOP + 1.7, SHZ - 0.2);
  b.box(WOOD_DARK, 1.2, 2.05, 0.10, SHX - 0.5, G, SHF);                          // door frame
  b.box(WOOD, 1.0, 1.9, 0.14, SHX - 0.5, G, SHF);                                // door
  b.box(WOOD_DARK, 0.06, 1.9, 0.16, SHX - 0.5, G, SHF);                          // plank line
  b.ball(0xe0b04b, 0.1, SHX - 0.2, G + 1.0, SHF + 0.1);                          // handle
  b.box(STONE, 1.4, 0.15, 0.5, SHX - 0.5, G, SHF + 0.3);                         // doorstep
  b.box(WHITE, 0.95, 0.95, 0.10, SHX + 1.0, G + 1.0, SHF);                       // window frame
  b.box(0x9fd3f2, 0.75, 0.75, 0.14, SHX + 1.0, G + 1.1, SHF);                    // glass
  b.box(0xffffff, 0.05, 0.75, 0.16, SHX + 1.0, G + 1.1, SHF);
  [-0.6, 0.6].forEach((dx) => b.box(0x4a8a4a, 0.25, 0.85, 0.08, SHX + 1.0 + dx, G + 1.05, SHF));   // shutters

  // =====================================================
  // FOUR CROP BEDS (low, walkable: not in the collision list)
  // =====================================================
  const BED_Z0 = 1.8;
  const BED_Z1 = 9.8;
  const BED_ZC = (BED_Z0 + BED_Z1) / 2;

  function bed(cx, kind) {
    b.box(SOIL, 2.6, 0.16, 8.0, cx, G, BED_ZC);                                  // soil
    [-1.3, 1.3].forEach((dx) => b.box(WOOD, 0.1, 0.22, 8.1, cx + dx, G, BED_ZC)); // wooden edges
    [BED_Z0, BED_Z1].forEach((z) => b.box(WOOD, 2.7, 0.22, 0.1, cx, G, z));
    [-0.85, 0, 0.85].forEach((dx, r) => {
      const x = cx + dx;
      if (kind === 'green') {                                                    // lettuce and cabbages
        const greens = [0x5fae4a, 0x4a9a3c, 0x72bf55];
        b.box(greens[r], 0.6, 0.18, 7.4, x, G + 0.16, BED_ZC);
        for (let i = 0; i < 8; i++) b.ball(greens[(r + i) % 3], 0.55, x, G + 0.4, BED_Z0 + 0.5 + i * 0.97, 0.75);
      } else if (kind === 'yellow') {                                            // wheat
        b.box(0xd9a520, 0.5, 0.2, 7.4, x, G + 0.16, BED_ZC);
        for (let i = 0; i < 19; i++) {
          const jx = ((i * 7 + r * 3) % 5 - 2) * 0.05;
          const h = 0.5 + ((i + r) % 3) * 0.12;
          const z = BED_Z0 + 0.4 + i * 0.4;
          b.box(0xf2d04a, 0.07, h, 0.07, x + jx, G + 0.3, z);
          b.box(0xe0a82e, 0.1, 0.2, 0.1, x + jx, G + 0.3 + h, z);
        }
      } else {                                                                   // pumpkins
        b.box(0xc96a1b, 0.55, 0.14, 7.4, x, G + 0.16, BED_ZC);
        for (let i = 0; i < 7; i++) {
          const z = BED_Z0 + 0.6 + i * 1.1;
          b.ball(i % 2 === 0 ? 0xf28c28 : 0xe97a1c, 0.62, x, G + 0.5, z, 0.8);
          b.box(0x4a7a2a, 0.07, 0.12, 0.07, x, G + 0.72, z);
        }
      }
    });
  }
  bed(-6.5, 'green');
  bed(-3.2, 'yellow');
  bed(3.2, 'orange');
  bed(6.5, 'green');

  // =====================================================
  // SCARECROW (left of the beds)
  // =====================================================
  const CX = -9.3;
  const CZ = 5.5;
  const STRAW = 0xe8c85a;
  const SHIRT = 0xc0392b;
  b.cyl(WOOD_DARK, 0.16, 2.4, CX, G, CZ);                                        // pole
  b.box(WOOD_DARK, 1.9, 0.12, 0.12, CX, G + 1.6, CZ);                            // arms
  b.box(SHIRT, 0.7, 0.8, 0.3, CX, G + 1.0, CZ);                                  // shirt
  [-0.6, 0.6].forEach((dx) => {
    b.box(SHIRT, 0.5, 0.28, 0.28, CX + dx, G + 1.5, CZ);                         // sleeves
    b.ball(STRAW, 0.22, CX + dx * 1.55, G + 1.65, CZ);                           // straw hands
    b.box(0x5a4a42, 0.22, 0.7, 0.22, CX + dx * 0.27, G + 0.3, CZ);               // trousers
    b.box(STRAW, 0.3, 0.12, 0.2, CX + dx * 0.27, G + 0.2, CZ);                   // straw feet
  });
  b.box(STRAW, 0.5, 0.25, 0.2, CX, G + 0.8, CZ + 0.05);                          // straw out of the shirt
  b.ball(0xe8c27a, 0.45, CX, G + 2.05, CZ);                                      // head
  b.dot(0x222222, 0.07, CX - 0.1, G + 2.1, CZ + 0.21);                           // eyes
  b.dot(0x222222, 0.07, CX + 0.1, G + 2.1, CZ + 0.21);
  b.cyl(0x6b4a2b, 0.85, 0.06, CX, G + 2.25, CZ);                                 // hat brim
  b.cyl(0x6b4a2b, 0.42, 0.3, CX, G + 2.31, CZ);                                  // hat crown
  b.ball(0x1c1c1c, 0.22, CX - 0.8, G + 1.8, CZ);                                 // a crow on its arm
  b.box(0xf0a030, 0.06, 0.04, 0.1, CX - 0.8, G + 1.76, CZ + 0.14);               // beak

  // =====================================================
  // WATER TROUGH (left of the beds, near the gate)
  // =====================================================
  const TX = -9.3;
  const TZ = 8.6;
  [-0.9, 0.9].forEach((dz) => b.box(WOOD_DARK, 0.7, 0.15, 0.15, TX, G, TZ + dz));    // feet
  b.box(WOOD_DARK, 0.8, 0.12, 2.4, TX, G + 0.15, TZ);                              // bottom
  [-0.35, 0.35].forEach((dx) => b.box(WOOD, 0.1, 0.6, 2.4, TX + dx, G + 0.15, TZ)); // long sides
  [-1.15, 1.15].forEach((dz) => b.box(WOOD, 0.8, 0.6, 0.1, TX, G + 0.15, TZ + dz)); // ends
  b.box(0x5bb8e8, 0.6, 0.02, 2.2, TX, G + 0.5, TZ);                                // water
  b.cyl(STEEL, 0.12, 0.9, TX, G, TZ - 1.5);                                        // tap pipe
  b.box(STEEL, 0.1, 0.1, 0.35, TX, G + 0.8, TZ - 1.35);

  // =====================================================
  // HAY BALES (right of the beds)
  // =====================================================
  function roundBale(x, z, axis) {            // axis 'z' = ends face front and back, 'x' = ends face left and right
    const rx = axis === 'z' ? Math.PI / 2 : 0;
    const rz = axis === 'x' ? Math.PI / 2 : 0;
    b.cylRot(HAY, 1.3, 1.4, x, G + 0.65, z, rx, 0, rz);
    [-0.45, 0.45].forEach((d) => {            // two darker straps
      if (axis === 'z') b.cylRot(HAY_DARK, 1.33, 0.06, x, G + 0.65, z + d, rx, 0, rz);
      else b.cylRot(HAY_DARK, 1.33, 0.06, x + d, G + 0.65, z, rx, 0, rz);
    });
  }
  roundBale(9.2, 3.0, 'z');
  roundBale(9.5, 4.8, 'x');
  roundBale(9.2, 9.4, 'z');
  function squareBale(x, y, z) {
    b.box(HAY, 1.1, 0.5, 0.55, x, y, z);
    [-0.3, 0.3].forEach((dx) => b.box(HAY_DARK, 0.05, 0.52, 0.57, x + dx, y, z));
  }
  squareBale(9.9, G, 7.0);                    // two on the ground, one on top
  squareBale(9.9, G, 7.6);
  squareBale(9.9, G + 0.5, 7.3);
}
