// =====================================================
// INTERIOR: Police station   (2 floors, joined by stairs)
// Floor 0: front desk, waiting area, reception board, holding cells, evidence cabinets.
// Floor 1: open office, meeting room, locker room, officer rest area (bunk beds).
// Helpers (see inside_common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './inside_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'desk', label: 'Front desk', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  const NAVY = 0x1f3a6e;
  const NAVY_L = 0x2d4a85;
  const GREY_D = 0x59657a;
  const GREY = 0x7d8799;
  const GREY_L = 0xb8c0cc;
  const WHITE = 0xf4f7fb;
  const PAPER = 0xffffff;
  const DARK = 0x1b2230;
  const SCREEN = 0x8fb4e8;
  const CHAIR = 0x2d3f66;

  shell(b, plan, { floor: 0x8a94a3, floorAlt: 0x7a8494, wall: 0xdfe5ee, ceiling: 0xf4f7fb, trim: 0x1f3a6e });
  for (let k = 0; k < plan.stairs.length; k++) addStairs(b, plan, k);

  const T0 = plan.floors[0].top;
  const T1 = plan.floors[1].top;

  // A computer (box monitor, stand, keyboard). `top` = height of the desk top.
  // dir = 1: the screen faces +z. dir = -1: the screen faces -z.
  const computer = (x, z, top, dir = 1) => {
    b.box(GREY_D, 0.16, 0.14, 0.1, x, top, z - 0.18 * dir);              // stand
    b.box(DARK, 0.56, 0.34, 0.04, x, top + 0.14, z - 0.18 * dir);        // monitor
    b.box(SCREEN, 0.5, 0.28, 0.01, x, top + 0.17, z - 0.155 * dir);     // screen
    b.box(GREY_L, 0.42, 0.02, 0.14, x, top, z + 0.15 * dir);             // keyboard
  };

  // An office desk with a computer on it (screen faces +z).
  const desk = (x, z, fl) => {
    const T = plan.floors[fl].top;
    solidBox(b, plan, GREY, x, z, 1.6, 0.8, 0.72, fl);
    solidBox(b, plan, WHITE, x, z, 1.7, 0.9, 0.05, fl, 0.72);
    b.box(GREY_D, 0.5, 0.55, 0.02, x + 0.5, T + 0.1, z + 0.41);          // drawer front
    computer(x, z, T + 0.77, 1);
  };

  // =====================================================
  // FLOOR 0
  // =====================================================

  // --- front desk / counter (job spot at x 0, z -5.2 stands behind it) ---
  solidBox(b, plan, NAVY, 0, -3.8, 8, 0.8, 1.0, 0);
  solidBox(b, plan, WHITE, 0, -3.8, 8.3, 1.0, 0.08, 0, 1.0);             // counter top
  b.box(GREY_L, 7.6, 0.08, 0.02, 0, T0 + 0.55, -3.39);                   // stripe on the front
  computer(-1.5, -3.8, T0 + 1.08, -1);                                   // screens face the officers
  computer(1.5, -3.8, T0 + 1.08, -1);
  addChair(b, plan, -1.5, -5.0, 0, 0, CHAIR);                            // two chairs behind the desk
  addChair(b, plan, 1.5, -5.0, 0, 0, CHAIR);

  // --- evidence / filing cabinets along the north wall ---
  for (let i = 0; i < 14; i++) {
    const x = -6.5 + i;
    solidBox(b, plan, 0x6b7a90, x, -7.6, 0.96, 0.6, 1.8, 0);
    b.box(DARK, 0.9, 0.02, 0.02, x, T0 + 0.6, -7.29);                    // drawer gaps
    b.box(DARK, 0.9, 0.02, 0.02, x, T0 + 1.2, -7.29);
    b.box(GREY_L, 0.3, 0.04, 0.03, x, T0 + 0.35, -7.285);                // handles
    b.box(GREY_L, 0.3, 0.04, 0.03, x, T0 + 0.95, -7.285);
    b.box(GREY_L, 0.3, 0.04, 0.03, x, T0 + 1.5, -7.285);
  }
  [-6.5, -3.5, 3.5, 6.5].forEach((x) => {                                // evidence boxes on top
    b.box(0xdfe5ee, 0.7, 0.3, 0.4, x, T0 + 1.8, -7.6);
    b.box(GREY_L, 0.4, 0.2, 0.3, x + 0.1, T0 + 2.1, -7.6);
  });

  // --- reception board on the north wall (above the cabinets) ---
  b.box(NAVY, 3.4, 1.0, 0.04, 0, T0 + 2.0, -7.84);
  b.box(GREY_L, 3.2, 0.8, 0.02, 0, T0 + 2.1, -7.805);
  [-1.05, 0, 1.05].forEach((x) => b.box(PAPER, 0.8, 0.55, 0.01, x, T0 + 2.22, -7.785));

  // --- waiting area near the door: rows of chairs on both sides (the door area stays clear) ---
  [5.0, 6.2].forEach((z) => {
    [-6.5, -5.85, -5.2].forEach((x) => addChair(b, plan, x, z, 0, Math.PI, GREY_D));
    [5.2, 5.85, 6.5].forEach((x) => addChair(b, plan, x, z, 0, Math.PI, GREY_D));
  });
  solidBox(b, plan, GREY, -3.9, 5.6, 0.8, 0.8, 0.45, 0);                 // low side tables
  solidBox(b, plan, GREY, 3.9, 5.6, 0.8, 0.8, 0.45, 0);

  // --- holding area: 3 cells on the west side, open doorway in each ---
  const cells = [-5.5, -2.5, 0.5];                                       // z of each cell's middle
  [-7, -4, -1, 2].forEach((z) => {
    solidBox(b, plan, GREY, -10.2, z, 3.6, 0.2, 2.8, 0);                 // walls between cells
    b.box(NAVY, 3.6, 0.08, 0.28, -10.2, T0 + 2.8, z);
  });
  solidBox(b, plan, NAVY, -8.4, -2.5, 0.2, 9.2, 0.5, 0, 2.3);            // beam over the cell fronts
  cells.forEach((z) => {
    [-1, 1].forEach((s) => {
      solidBox(b, plan, NAVY, -8.4, z + s * 0.6, 0.12, 0.12, 2.3, 0);    // door posts
      solidBox(b, plan, GREY_L, -8.4, z + s * 0.9, 0.07, 0.07, 2.3, 0);  // bars
      solidBox(b, plan, GREY_L, -8.4, z + s * 1.2, 0.07, 0.07, 2.3, 0);
      b.box(GREY_L, 0.05, 0.05, 0.8, -8.4, T0 + 1.2, z + s * 1.0);       // cross rail
    });
    addBed(b, plan, -10.9, z, 0, 0, GREY_D, NAVY_L);                     // bed inside the cell
    solidBox(b, plan, GREY_L, -9.3, z + 1.05, 0.55, 0.45, 0.5, 0);       // steel toilet
  });

  // =====================================================
  // FLOOR 1
  // =====================================================

  // --- open office: 4 desks, each with a chair and a computer ---
  [[-5.5, 0.5], [-1.5, 0.5], [-5.5, 4.5], [-1.5, 4.5]].forEach(([x, z]) => {
    desk(x, z, 1);
    addChair(b, plan, x, z + 0.85, 1, Math.PI, CHAIR);
  });

  // --- meeting table with 6 chairs ---
  solidBox(b, plan, GREY, 4, -0.5, 3.0, 1.2, 0.72, 1);
  solidBox(b, plan, WHITE, 4, -0.5, 3.2, 1.4, 0.06, 1, 0.72);
  [3.2, 4.0, 4.8].forEach((x) => {
    addChair(b, plan, x, -1.8, 1, 0, CHAIR);                             // north side, facing the table
    addChair(b, plan, x, 0.8, 1, Math.PI, CHAIR);                        // south side, facing the table
    b.box(PAPER, 0.3, 0.01, 0.4, x, T1 + 0.78, -0.9);                    // papers
    b.box(PAPER, 0.3, 0.01, 0.4, x, T1 + 0.78, -0.1);
  });

  // --- locker room (north-west corner, doorway on its south side) ---
  solidBox(b, plan, 0xe8edf4, -5.0, -6.2, 0.2, 3.6, 2.8, 1);             // east wall of the locker room
  solidBox(b, plan, 0xe8edf4, -9.5, -4.4, 5.0, 0.2, 2.8, 1);             // south wall (gap at x -7 .. -5)
  solidBox(b, plan, NAVY, -6.0, -4.4, 2.0, 0.2, 0.5, 1, 2.3);            // beam over the doorway
  for (let i = 0; i < 10; i++) {
    const x = -11.65 + 0.6 * i;
    solidBox(b, plan, i % 2 === 0 ? GREY_D : NAVY_L, x, -7.7, 0.55, 0.5, 1.9, 1);
    b.box(GREY_L, 0.05, 0.2, 0.03, x + 0.15, T1 + 1.1, -7.44);           // handle
    [1.55, 1.62, 1.69].forEach((y) => b.box(DARK, 0.32, 0.02, 0.02, x, T1 + y, -7.44));   // vents
  }
  solidBox(b, plan, GREY, -8.6, -5.9, 2.6, 0.5, 0.45, 1);                // bench

  // --- officer rest area: 2 bunk beds (lower bunk = real bed, upper bunk = frame) ---
  [11.0, 8.6].forEach((x) => {
    const z = 6.6;
    addBed(b, plan, x, z, 1, 0, 0x4a5568, NAVY_L);                       // lower bunk (you can sleep here)
    [[-0.68, -1.08], [0.68, -1.08], [-0.68, 1.08], [0.68, 1.08]].forEach(([px, pz]) => {
      solidBox(b, plan, 0x4a5568, x + px, z + pz, 0.06, 0.06, 1.9, 1);   // posts
    });
    b.box(0x4a5568, 1.4, 0.1, 2.2, x, T1 + 1.35, z);                     // upper bunk
    b.box(0xfaf6ee, 1.2, 0.14, 2.0, x, T1 + 1.45, z);
    b.box(NAVY_L, 1.22, 0.06, 1.4, x, T1 + 1.59, z + 0.3);
    b.box(PAPER, 0.8, 0.1, 0.4, x, T1 + 1.59, z - 0.8);
    solidBox(b, plan, GREY_L, x, z + 1.15, 0.6, 0.06, 1.5, 1);           // ladder
    [0.35, 0.7, 1.05, 1.4].forEach((y) => b.box(GREY_D, 0.5, 0.04, 0.04, x, T1 + y, z + 1.19));
  });
}
