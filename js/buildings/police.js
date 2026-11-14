// =====================================================
// CIVIC BUILDING: POLICE STATION
// Navy blue and white walls, a flat roof with a blue-and-red light bar and an antenna mast,
// a stone entrance with 3 steps and a gold badge above the door, barred windows, and a
// forecourt with 2 parked police cars, a flagpole and low barriers.
// =====================================================
// Drawing space (the building's OWN directions, like a house):
//   origin (0, 0) = middle of the 24 x 24 m lot.   x = right.   +z = front (street side).
//   Body: x from -10 to 10, z from -11 to 0 (front wall at z = 0), 9 m tall.
//   Forecourt: z from 0 to 12.   The door is in the middle of the front wall.
export const info = {
  id: 'police',
  name: 'Police Station',
  sign: 'POLICE STATION',        // the words on the sign board
  signY: 6.95,                   // the board covers y 5.7 to 8.2 (on the white upper wall)
  height: 9,                     // real height of the building (players can fly over it)
  door: { x: 0, z: 1.5 },        // on the steps in front of the door, in the middle of the front wall
  collide: {
    // box   = [centre x, centre z, width, depth, height]
    boxes: [
      [0, -5.5, 20, 11, 9],          // the police station building
      [0, -1.3, 3.6, 0.9, 9.9],      // the light bar on the roof
      [-6.2, 4.2, 4.5, 1.95, 1.9],   // the two parked police cars
      [6.2, 4.2, 4.5, 1.95, 1.9],
      [-8.4, 10.8, 2.4, 0.5, 0.95],  // the four low barriers
      [-5.6, 10.8, 2.4, 0.5, 0.95],
      [5.6, 10.8, 2.4, 0.5, 0.95],
      [8.4, 10.8, 2.4, 0.5, 0.95]
    ],
    // round = [x, z, radius, height]
    round: [
      [-9.7, 8.5, 0.5, 8.0],         // the flagpole
      [7.0, -8.0, 0.3, 13.3]         // the antenna mast on the roof
    ]
  }
};

export function build(b, c) {
  const G = c.G;   // ground height (0.1)

  // ---------- Colours ----------
  const NAVY = 0x1b2f5c;
  const NAVY_DARK = 0x12203f;
  const WHITE = 0xf4f6fa;
  const RED = 0xd32f2f;
  const BLUE_LIGHT = 0x2f6bff;
  const RED_LIGHT = 0xff3b3b;
  const GOLD = 0xe6b422;
  const STONE = 0xcfc8b8;
  const STONE_DARK = 0x9a958a;
  const GLASS = 0x8fb4d6;
  const BARS = 0x20252b;
  const STEEL = 0x8b929b;
  const ROOF_DECK = 0x44474f;
  const TIRE = 0x1d1d20;
  const HUB = 0xb7bcc4;
  const CAR_GLASS = 0x2a3646;
  const CAR_DARK = 0x3b3f47;
  const CAR_BLUE = 0x1f5fd0;

  // ---------- Walls: navy below, white above ----------
  const WALL_TOP = 8.7;
  b.box(NAVY, 20, WALL_TOP - G, 11, 0, G, -5.5);                      // the whole body in navy
  b.box(WHITE, 20.1, WALL_TOP - 4.4, 11.1, 0, 4.4, -5.5);             // white upper wall (y 4.4 to 8.7)
  b.box(RED, 20.16, 0.1, 11.16, 0, 4.3, -5.5);                        // thin red line between
  b.box(NAVY, 20.14, 0.25, 11.14, 0, WALL_TOP - 0.25, -5.5);          // navy band under the roof edge
  b.box(STONE_DARK, 20.14, 0.4, 11.14, 0, G, -5.5);                   // stone base (y 0.1 to 0.5)
  [[-9.85, -0.1], [9.85, -0.1], [-9.85, -10.9], [9.85, -10.9]].forEach(([x, z]) => {
    b.box(WHITE, 0.5, 3.8, 0.5, x, 0.5, z);                           // white corner pillars (lower wall)
  });

  // ---------- Flat roof with a white edge wall (parapet) ----------
  b.box(ROOF_DECK, 19.4, 0.1, 10.4, 0, WALL_TOP, -5.5);               // roof floor (top y 8.8)
  b.box(WHITE, 20.5, 0.3, 0.3, 0, WALL_TOP, 0.1);                     // parapet front
  b.box(WHITE, 20.5, 0.3, 0.3, 0, WALL_TOP, -11.1);                   // parapet back
  b.box(WHITE, 0.3, 0.3, 11.3, -10.1, WALL_TOP, -5.45);               // parapet left
  b.box(WHITE, 0.3, 0.3, 11.3, 10.1, WALL_TOP, -5.45);                // parapet right

  // ---------- Roof light bar (blue and red), on a small white block ----------
  b.box(WHITE, 3.6, 0.4, 0.9, 0, 8.8, -1.3);
  b.box(0x2a2d33, 3.0, 0.12, 0.5, 0, 9.2, -1.3);                      // black base of the bar
  b.box(BLUE_LIGHT, 1.4, 0.3, 0.44, -0.75, 9.32, -1.3);               // blue half
  b.box(RED_LIGHT, 1.4, 0.3, 0.44, 0.75, 9.32, -1.3);                 // red half
  b.ellip(0x8fb2ff, 1.4, 0.34, 0.44, -0.75, 9.62, -1.3);              // domes
  b.ellip(0xff8f8f, 1.4, 0.34, 0.44, 0.75, 9.62, -1.3);
  b.box(0x2a2d33, 0.1, 0.5, 0.52, -1.55, 9.2, -1.3);                  // end caps
  b.box(0x2a2d33, 0.1, 0.5, 0.52, 1.55, 9.2, -1.3);

  // ---------- Antenna mast and a small dish on the roof ----------
  b.box(CAR_DARK, 0.6, 0.4, 0.6, 7.0, 8.8, -8.0);
  b.cyl(STEEL, 0.12, 4.0, 7.0, 9.2, -8.0);                            // mast (to y 13.2)
  b.box(STEEL, 1.6, 0.05, 0.05, 7.0, 10.8, -8.0);                     // crossbars
  b.box(STEEL, 1.1, 0.05, 0.05, 7.0, 11.8, -8.0);
  b.box(STEEL, 0.7, 0.05, 0.05, 7.0, 12.6, -8.0);
  b.ball(RED_LIGHT, 0.22, 7.0, 13.3, -8.0);                           // red beacon on top
  b.cyl(STEEL, 0.2, 0.8, -7.0, 8.8, -8.5);                            // dish
  b.ellip(0xdde3ea, 1.5, 0.3, 1.5, -7.0, 9.8, -8.4, 0.9, 0, 0);
  b.cyl(STEEL, 0.05, 0.6, -7.0, 9.8, -8.0);

  // ---------- Barred windows ----------
  // front: cy = the TOP edge of the glass.  Bars are thin steel rods in front of the glass.
  function frontWindow(cx, cy, w, h) {
    const by = cy - h;                                                     // bottom edge of the glass
    b.box(STONE, w + 0.5, 0.12, 0.3, cx, by - 0.17, 0.1);                  // stone sill
    b.box(WHITE, w + 0.2, h + 0.2, 0.1, cx, by - 0.1, 0.03);               // white frame
    b.box(GLASS, w, h, 0.08, cx, by, 0.09);                                // glass
    const n = Math.round(w / 0.2);
    for (let i = 0; i <= n; i++) {
      b.box(BARS, 0.05, h + 0.1, 0.05, cx - w / 2 + (w / n) * i, by - 0.05, 0.17);   // vertical bars
    }
    b.box(BARS, w + 0.1, 0.06, 0.06, cx, cy - 0.03, 0.17);                 // cross rails
    b.box(BARS, w + 0.1, 0.06, 0.06, cx, by - 0.03, 0.17);
    b.box(BARS, w + 0.1, 0.06, 0.06, cx, by + h / 2 - 0.03, 0.17);
  }
  // sides: the same, on the left and right walls
  function sideWindow(sx, z, cy, w, h) {
    const X = sx * 10;
    const by = cy - h;
    b.box(STONE, 0.3, 0.12, w + 0.5, X + sx * 0.1, by - 0.17, z);
    b.box(WHITE, 0.1, h + 0.2, w + 0.2, X + sx * 0.03, by - 0.1, z);
    b.box(GLASS, 0.08, h, w, X + sx * 0.09, by, z);
    const n = Math.round(w / 0.2);
    for (let i = 0; i <= n; i++) {
      b.box(BARS, 0.05, h + 0.1, 0.05, X + sx * 0.17, by - 0.05, z - w / 2 + (w / n) * i);
    }
    b.box(BARS, 0.06, 0.06, w + 0.1, X + sx * 0.17, cy - 0.03, z);
    b.box(BARS, 0.06, 0.06, w + 0.1, X + sx * 0.17, by - 0.03, z);
    b.box(BARS, 0.06, 0.06, w + 0.1, X + sx * 0.17, by + h / 2 - 0.03, z);
  }
  // front: lower row (y 1.35 to 3.15) and upper row (y 5.3 to 7.1)
  [-7.6, -4.4, 4.4, 7.6].forEach((x) => frontWindow(x, 3.15, 1.5, 1.8));
  [-8.6, -6.6, 6.6, 8.6].forEach((x) => frontWindow(x, 7.1, 1.5, 1.8));
  // sides: 3 lower and 3 upper windows on each side
  [-2.5, -5.5, -8.5].forEach((z) => {
    [-1, 1].forEach((sx) => {
      sideWindow(sx, z, 3.15, 1.5, 1.8);
      sideWindow(sx, z, 7.1, 1.5, 1.8);
    });
  });

  // ---------- Stone entrance: 3 steps, two pillars, lintel, pediment, gold badge ----------
  b.box(STONE, 5.0, 0.12, 0.8, 0, G, 2.0);                             // step 1 (lowest)   top y 0.22
  b.box(STONE, 4.5, 0.24, 0.8, 0, G, 1.2);                             // step 2            top y 0.34
  b.box(STONE, 4.0, 0.36, 0.8, 0, G, 0.4);                             // step 3 (landing)  top y 0.46
  b.box(STONE_DARK, 5.0, 0.03, 0.06, 0, G + 0.12, 2.37);               // step edges
  b.box(STONE_DARK, 4.5, 0.03, 0.06, 0, G + 0.24, 1.57);
  b.box(STONE_DARK, 4.0, 0.03, 0.06, 0, G + 0.36, 0.77);
  const SILL = G + 0.36;                                               // door floor level (0.46)
  [-1.55, 1.55].forEach((x) => {
    b.box(STONE, 0.5, 3.4 - SILL, 0.5, x, SILL, 0.25);                 // stone pillars
    b.box(STONE_DARK, 0.62, 0.14, 0.62, x, SILL, 0.3);                 // pillar foot
    b.box(STONE_DARK, 0.62, 0.14, 0.62, x, 3.4, 0.3);                  // pillar top
  });
  b.box(STONE, 4.1, 0.4, 0.8, 0, 3.1, 0.4);                            // stone lintel over the door
  b.box(STONE_DARK, 4.3, 0.1, 0.9, 0, 3.5, 0.45);                      // cornice
  b.gable(STONE, 4.3, 0.6, 0.9, 0, 3.6, 0.45);                         // little triangular pediment
  // gold badge above the door
  b.cylZ(GOLD, 1.3, 0.12, 0, 4.9, 0.1);                                // gold ring
  b.cylZ(NAVY, 1.02, 0.14, 0, 4.9, 0.1);                               // navy centre
  for (let k = 0; k < 5; k++) {
    b.slab(GOLD, 0.1, 0.78, 0.03, 0, 4.9, 0.18, 0, 0, (k * Math.PI) / 5);   // star rays
  }
  b.ball(GOLD, 0.2, 0, 4.9, 0.18);                                     // star middle
  // blue police lamps on the wall beside the entrance
  [-2.6, 2.6].forEach((x) => {
    b.box(STEEL, 0.08, 0.08, 0.3, x, 3.0, 0.15);
    b.box(0x2f6bff, 0.34, 0.46, 0.34, x, 3.08, 0.38);
    b.box(WHITE, 0.4, 0.07, 0.4, x, 3.54, 0.38);
  });
  // the door (double, navy with glass)
  b.box(WHITE, 2.7, 0.12, 0.2, 0, SILL + 2.6, 0.05);                   // door frame top
  b.box(WHITE, 0.1, 2.6, 0.2, -1.25, SILL, 0.05);
  b.box(WHITE, 0.1, 2.6, 0.2, 1.25, SILL, 0.05);
  [-0.6, 0.6].forEach((x) => {
    b.box(NAVY_DARK, 1.1, 2.55, 0.08, x, SILL, 0.04);                  // door leaf
    b.box(GLASS, 0.7, 1.2, 0.04, x, SILL + 0.85, 0.09);                // glass pane
    b.box(WHITE, 0.07, 1.25, 0.05, x, SILL + 0.85, 0.095);             // glass bar
  });
  b.box(GOLD, 0.05, 0.6, 0.06, -0.14, SILL + 1.0, 0.14);               // gold handles
  b.box(GOLD, 0.05, 0.6, 0.06, 0.14, SILL + 1.0, 0.14);

  // ---------- Police cars (white, blue stripe, roof light bar), parked side by side ----------
  // dir: 1 = nose points to +x, -1 = nose points to -x.  Local: lx = across the car, lz = along it (nose = +z).
  function policeCar(cx, cz, dir) {
    const P = (col, w, h, d, lx, ly, lz) => {
      if (dir === 1) b.box(col, d, h, w, cx + lz, G + ly, cz - lx);
      else b.box(col, d, h, w, cx - lz, G + ly, cz + lx);
    };
    const E = (col, sx, sy, sz, lx, ly, lz) => {
      if (dir === 1) b.ellip(col, sz, sy, sx, cx + lz, G + ly, cz - lx);
      else b.ellip(col, sz, sy, sx, cx - lz, G + ly, cz + lx);
    };
    const W = (lx, lz) => {
      const x = dir === 1 ? cx + lz : cx - lz;
      const z = dir === 1 ? cz - lx : cz + lx;
      b.cylZ(TIRE, 0.62, 0.24, x, G + 0.31, z);
      b.cylZ(HUB, 0.34, 0.26, x, G + 0.31, z);
    };
    const CW = 0xf7f8fa;                                                 // car white
    P(CAR_DARK, 1.7, 0.12, 4.2, 0, 0.2, 0);                             // under skirt
    P(CW, 1.8, 0.62, 4.4, 0, 0.28, 0);                                  // lower body
    P(CAR_BLUE, 1.82, 0.18, 4.0, 0, 0.48, -0.05);                       // blue stripe along both sides
    P(CW, 1.74, 0.06, 1.3, 0, 0.9, 1.5);                                // hood
    P(CW, 1.74, 0.06, 0.7, 0, 0.9, -1.85);                              // boot
    P(CW, 1.5, 0.5, 2.4, 0, 0.9, -0.3);                                 // cabin
    P(CAR_GLASS, 1.54, 0.3, 2.2, 0, 1.0, -0.3);                         // side windows
    P(CAR_GLASS, 1.4, 0.3, 0.04, 0, 1.0, 0.92);                         // windscreen
    P(CAR_GLASS, 1.4, 0.3, 0.04, 0, 1.0, -1.52);                        // rear window
    [0.85, -0.3, -1.4].forEach((lz) => P(CW, 1.56, 0.32, 0.1, 0, 1.0, lz));          // window pillars
    P(CW, 1.56, 0.08, 2.5, 0, 1.4, -0.3);                               // roof
    [0.85, -0.3, -1.4].forEach((lz) => P(CAR_DARK, 1.82, 0.56, 0.025, 0, 0.31, lz)); // door lines
    P(CAR_DARK, 1.84, 0.22, 0.14, 0, 0.22, 2.2);                        // bumpers
    P(CAR_DARK, 1.84, 0.22, 0.14, 0, 0.22, -2.2);
    P(CAR_DARK, 0.7, 0.14, 0.04, 0, 0.5, 2.22);                         // grille
    [-0.6, 0.6].forEach((lx) => {
      P(0xffe9a0, 0.36, 0.14, 0.04, lx, 0.62, 2.22);                    // headlights
      P(0xe53935, 0.4, 0.14, 0.04, lx, 0.62, -2.22);                    // tail lights
      P(CAR_DARK, 0.1, 0.12, 0.16, lx * 1.55, 1.05, 0.7);               // mirrors
    });
    // roof light bar
    P(CAR_DARK, 1.1, 0.08, 0.34, 0, 1.48, -0.3);
    P(BLUE_LIGHT, 0.5, 0.14, 0.3, -0.28, 1.56, -0.3);
    P(RED_LIGHT, 0.5, 0.14, 0.3, 0.28, 1.56, -0.3);
    E(0x8fb2ff, 0.5, 0.22, 0.3, -0.28, 1.72, -0.3);
    E(0xff8f8f, 0.5, 0.22, 0.3, 0.28, 1.72, -0.3);
    // wheels
    [[-0.85, 1.35], [0.85, 1.35], [-0.85, -1.35], [0.85, -1.35]].forEach(([lx, lz]) => W(lx, lz));
  }
  policeCar(-6.2, 4.2, 1);       // left car, nose toward the path to the door
  policeCar(6.2, 4.2, -1);       // right car, nose toward the path to the door

  // ---------- Flagpole ----------
  const FX = -9.7;
  const FZ = 8.5;
  b.cyl(STONE, 0.9, 0.25, FX, G, FZ);                                  // round base
  b.cyl(GOLD, 0.3, 0.06, FX, G + 0.25, FZ);
  b.cyl(STEEL, 0.14, 7.4, FX, G + 0.25, FZ);                           // pole
  b.ball(GOLD, 0.3, FX, 7.9, FZ);                                      // golden top
  b.box(NAVY, 1.9, 0.55, 0.04, FX + 1.0, 7.0, FZ);                     // flag: navy top ...
  b.box(WHITE, 1.9, 0.45, 0.04, FX + 1.0, 6.55, FZ);                   // ... white bottom
  b.box(RED, 1.9, 0.06, 0.05, FX + 1.0, 6.52, FZ);                     // red edge
  b.ball(GOLD, 0.3, FX + 0.45, 7.27, FZ + 0.03, 0.3);                  // gold badge dot on the flag
  b.cyl(STEEL, 0.05, 0.4, FX + 0.07, 7.2, FZ);                         // flag arm

  // ---------- Low barriers across the front of the forecourt (a wide gap in the middle) ----------
  [-8.4, -5.6, 5.6, 8.4].forEach((x) => {
    const z = 10.8;
    b.box(CAR_DARK, 0.14, 0.26, 0.6, x - 0.9, G, z);                   // feet
    b.box(CAR_DARK, 0.14, 0.26, 0.6, x + 0.9, G, z);
    b.box(WHITE, 2.4, 0.7, 0.3, x, G + 0.25, z);                       // white body
    b.box(CAR_BLUE, 2.42, 0.16, 0.32, x, G + 0.79, z);                 // blue top stripe
    b.box(RED, 0.5, 0.26, 0.32, x - 0.65, G + 0.42, z);                // red panels
    b.box(RED, 0.5, 0.26, 0.32, x + 0.65, G + 0.42, z);
  });
}
