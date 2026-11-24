// =====================================================
// INTERIOR: Fire station   (2 floors, joined by stairs)
// Floor 0: truck bay with a fire truck, gear wall, equipment racks, tool bench, water tank, dispatch desk.
// Floor 1: crew dormitory, common room, kitchen, locker room, training corner.
// Helpers (see inside_common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './inside_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'truck', label: 'Clean the truck', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  // red / grey / white palette
  const RED = 0xc23a2e;
  const RED_D = 0x9c2a20;
  const GREY = 0x8a919b;
  const GREY_D = 0x59616c;
  const GREY_L = 0xc4c9d0;
  const WHITE = 0xf4f6f8;
  const DARK = 0x2b2f36;
  const GLASS = 0xbfd4e8;

  shell(b, plan, { floor: 0x9aa1ab, floorAlt: 0x8a919b, wall: 0xe9edf2, ceiling: 0xf7f9fb, trim: 0xb3261e });
  for (let k = 0; k < plan.stairs.length; k++) addStairs(b, plan, k);

  const T0 = plan.floors[0].top;
  const T1 = plan.floors[1].top;

  // ---------- small helpers ----------

  const computer = (x, z, top, dir = 1) => {              // dir 1: screen faces +z, -1: faces -z
    b.box(GREY_D, 0.16, 0.14, 0.1, x, top, z - 0.18 * dir);
    b.box(DARK, 0.56, 0.34, 0.04, x, top + 0.14, z - 0.18 * dir);
    b.box(GLASS, 0.5, 0.28, 0.01, x, top + 0.17, z - 0.155 * dir);
    b.box(GREY_L, 0.42, 0.02, 0.14, x, top, z + 0.15 * dir);
  };

  // A sofa. face = the way the sitter looks: 'N' (-z), 'S' (+z), 'E' (+x), 'W' (-x).
  const sofa = (cx, cz, face, len, col, cushion, fl) => {
    const T = plan.floors[fl].top;
    const hor = face === 'N' || face === 'S';
    const bx = face === 'E' ? -1 : face === 'W' ? 1 : 0;
    const bz = face === 'S' ? -1 : face === 'N' ? 1 : 0;
    solidBox(b, plan, col, cx, cz, hor ? len : 0.9, hor ? 0.9 : len, 0.42, fl);
    solidBox(b, plan, col, cx + bx * 0.34, cz + bz * 0.34, hor ? len : 0.22, hor ? 0.22 : len, 0.9, fl);
    [-1, 1].forEach((s) => {
      const ox = hor ? s * (len / 2 - 0.1) : 0;
      const oz = hor ? 0 : s * (len / 2 - 0.1);
      solidBox(b, plan, col, cx + ox, cz + oz, hor ? 0.2 : 0.9, hor ? 0.9 : 0.2, 0.62, fl);
    });
    b.box(cushion, hor ? len - 0.5 : 0.62, 0.1, hor ? 0.62 : len - 0.5, cx - bx * 0.1, T + 0.42, cz - bz * 0.1);
  };

  // An equipment rack on a north / south wall, with hose rolls and helmets on its front.
  // front 'S' = faces +z (against the north wall), 'N' = faces -z (against the south wall).
  const rack = (cx, cz, len, front) => {
    solidBox(b, plan, GREY_D, cx, cz, len, 0.45, 2.0, 0);
    const fz = cz + (front === 'S' ? 0.225 + 0.08 : -(0.225 + 0.08));
    [0.45, 0.95, 1.45].forEach((y) => b.box(GREY_L, len * 0.94, 0.04, 0.06, cx, T0 + y, cz + (front === 'S' ? 0.24 : -0.24)));
    [-0.75, 0, 0.75].forEach((o, i) => {
      b.box(i % 2 === 0 ? RED : WHITE, 0.55, 0.38, 0.16, cx + o, T0 + 0.5, fz);      // hose rolls
      b.box(i % 2 === 0 ? WHITE : RED, 0.55, 0.38, 0.16, cx + o, T0 + 1.0, fz);
      b.box(i % 2 === 0 ? RED : WHITE, 0.3, 0.22, 0.34, cx + o, T0 + 1.5, fz);       // helmets
      b.box(DARK, 0.34, 0.03, 0.38, cx + o, T0 + 1.5, fz);                           // helmet brim
    });
  };

  // =====================================================
  // FLOOR 0
  // =====================================================

  // --- bay markings on the floor (they stop before the door area) ---
  b.box(WHITE, 0.1, 0.02, 8.2, -3.2, T0, -0.2);
  b.box(WHITE, 0.1, 0.02, 8.2, 3.2, T0, -0.2);
  b.box(RED, 6.5, 0.02, 0.15, 0, T0, 3.9);
  b.box(RED, 6.5, 0.02, 0.15, 0, T0, -4.3);

  // --- the fire truck (nose toward the door, parked behind the job spot) ---
  solidBox(b, plan, GREY_D, 0, -0.4, 2.0, 6.0, 0.3, 0, 0.2);              // chassis
  solidBox(b, plan, RED, 0, -0.4, 2.4, 6.2, 1.3, 0, 0.5);                 // lower body
  solidBox(b, plan, RED, 0, -1.3, 2.4, 4.4, 0.5, 0, 1.8);                 // rear equipment body
  solidBox(b, plan, RED, 0, 1.8, 2.4, 1.8, 0.9, 0, 1.8);                  // cab
  solidBox(b, plan, GREY_L, 0, 2.85, 2.5, 0.3, 0.35, 0, 0.4);             // front bumper
  [1.9, -1.5, -2.7].forEach((z) => [-1.25, 1.25].forEach((x) => {         // 6 wheels (two crossed boxes)
    solidBox(b, plan, DARK, x, z, 0.36, 0.7, 1.0, 0);
    solidBox(b, plan, DARK, x, z, 0.36, 1.0, 0.7, 0, 0.15);
    b.box(GREY_L, 0.04, 0.4, 0.4, x + Math.sign(x) * 0.2, T0 + 0.3, z);   // hub cap
  }));
  [-1, 1].forEach((s) => {                                                // sides
    b.box(WHITE, 0.03, 0.12, 6.0, s * 1.215, T0 + 1.05, -0.4);            // white stripe
    [-2.7, -1.4, -0.1].forEach((z) => {
      b.box(GREY_L, 0.03, 0.45, 1.1, s * 1.215, T0 + 1.3, z);             // roller doors
      b.box(GREY_L, 0.03, 0.4, 1.1, s * 1.215, T0 + 1.85, z);
      b.box(DARK, 0.04, 0.05, 0.3, s * 1.22, T0 + 1.55, z);              // handles
    });
    b.box(GLASS, 0.04, 0.55, 1.1, s * 1.215, T0 + 1.95, 1.8);             // cab side windows
    b.box(RED_D, 0.3, 0.1, 0.26, s * 0.5, T0 + 2.86, 1.8);                // roof lights
  });
  b.box(GLASS, 2.1, 0.55, 0.04, 0, T0 + 1.95, 2.72);                      // windscreen
  b.box(GREY_D, 1.6, 0.4, 0.03, 0, T0 + 0.85, 2.72);                      // grille
  [-0.9, 0.9].forEach((x) => b.box(0xfff3c4, 0.3, 0.2, 0.04, x, T0 + 1.0, 2.72));   // headlights
  solidBox(b, plan, WHITE, 0, 1.8, 1.6, 0.3, 0.16, 0, 2.7);               // roof light bar
  [-0.4, 0.4].forEach((x) => solidBox(b, plan, GREY_L, x, -1.3, 0.08, 3.9, 0.08, 0, 2.3));   // ladder rails
  for (let z = -3.1; z <= 0.55; z += 0.4) b.box(GREY_L, 0.8, 0.04, 0.05, 0, T0 + 2.38, z);    // ladder rungs
  solidBox(b, plan, RED_D, 0, -3.95, 0.8, 0.8, 0.8, 0, 1.05);             // hose reel (coiled hose)
  [-1, 1].forEach((s) => b.box(GREY_L, 0.06, 1.0, 1.0, s * 0.43, T0 + 0.95, -3.95));   // reel flanges
  b.box(GREY_L, 0.12, 0.12, 0.3, 0, T0 + 1.4, -4.4);                      // reel handle
  // bucket and squeegee near the job spot
  b.box(GREY_L, 0.3, 0.3, 0.3, -1.0, T0, -5.0);
  b.box(0x9ec9e8, 0.26, 0.02, 0.26, -1.0, T0 + 0.28, -5.0);
  b.box(GREY_D, 0.04, 0.9, 0.04, -1.5, T0, -5.2);

  // --- gear wall (west wall): boot shelf, pegs, firefighter suits and helmets ---
  solidBox(b, plan, GREY_D, -11.75, -3.6, 0.5, 5.8, 0.3, 0);              // boot shelf
  b.box(GREY, 0.06, 1.6, 5.8, -11.97, T0 + 0.9, -3.6);                    // gear board
  b.box(WHITE, 0.07, 0.06, 5.8, -11.96, T0 + 2.4, -3.6);                  // label strip
  for (let i = 0; i < 6; i++) {
    const z = -6.0 + i * 0.95;
    const col = i % 2 === 0 ? RED : GREY_D;
    b.box(GREY_L, 0.16, 0.05, 0.05, -11.88, T0 + 2.15, z);                // peg
    b.box(col, 0.24, 0.65, 0.5, -11.8, T0 + 1.5, z);                      // coat
    b.box(WHITE, 0.26, 0.06, 0.5, -11.8, T0 + 1.8, z);                    // reflective stripe
    b.box(col === RED ? RED_D : DARK, 0.22, 0.75, 0.4, -11.8, T0 + 0.75, z);   // trousers
    b.box(i % 2 === 0 ? WHITE : RED, 0.3, 0.2, 0.32, -11.8, T0 + 2.2, z);  // helmet
    b.box(DARK, 0.26, 0.2, 0.15, -11.7, T0 + 0.3, z - 0.12);              // boots
    b.box(DARK, 0.26, 0.2, 0.15, -11.7, T0 + 0.3, z + 0.12);
  }

  // --- equipment racks with hoses and helmets (north and south walls) ---
  rack(-7.8, -7.775, 2.2, 'S');
  rack(-5.3, -7.775, 2.2, 'S');
  rack(-8.0, 7.775, 2.2, 'N');
  rack(-5.5, 7.775, 2.2, 'N');

  // --- dispatch desk with a radio ---
  solidBox(b, plan, GREY_D, 3.2, -7.4, 1.8, 0.8, 0.74, 0);
  solidBox(b, plan, WHITE, 3.2, -7.4, 1.9, 0.9, 0.05, 0, 0.74);
  b.box(DARK, 0.45, 0.14, 0.3, 2.65, T0 + 0.79, -7.45);                   // radio
  b.box(RED, 0.08, 0.04, 0.02, 2.55, T0 + 0.9, -7.29);                    // radio lights
  b.box(GREY_L, 0.14, 0.04, 0.02, 2.8, T0 + 0.9, -7.29);
  b.box(DARK, 0.03, 0.6, 0.03, 2.45, T0 + 0.79, -7.65);                   // antenna
  b.box(DARK, 0.1, 0.15, 0.1, 3.3, T0 + 0.79, -7.0);                      // microphone
  computer(3.8, -7.4, T0 + 0.79, 1);
  addChair(b, plan, 3.2, -6.3, 0, Math.PI, RED_D);
  b.box(WHITE, 1.6, 0.9, 0.03, 3.2, T0 + 1.3, -7.96);                     // map board
  [-0.5, 0.1, 0.5].forEach((o) => b.box(RED, 0.08, 0.08, 0.02, 3.2 + o, T0 + 1.7, -7.93));

  // --- tool bench ---
  solidBox(b, plan, GREY_D, 7.0, -7.5, 2.4, 0.7, 0.9, 0);
  solidBox(b, plan, GREY_L, 7.0, -7.5, 2.5, 0.8, 0.05, 0, 0.9);
  b.box(WHITE, 2.2, 0.9, 0.03, 7.0, T0 + 1.3, -7.96);                     // pegboard
  [-0.9, -0.45, 0, 0.45, 0.9].forEach((o, i) => b.box(i % 2 === 0 ? RED : DARK, 0.06, 0.5, 0.03, 7.0 + o, T0 + 1.5, -7.93));
  b.box(DARK, 0.2, 0.2, 0.2, 6.1, T0 + 0.95, -7.4);                       // vise
  b.box(RED, 0.4, 0.12, 0.2, 7.4, T0 + 0.95, -7.4);                       // tool box

  // --- water tank ---
  solidBox(b, plan, GREY, 10.6, -6.9, 1.7, 1.7, 2.0, 0);
  [0.5, 1.3].forEach((y) => b.box(GREY_D, 1.74, 0.08, 1.74, 10.6, T0 + y, -6.9));
  b.box(GREY_L, 0.8, 0.15, 0.8, 10.6, T0 + 2.0, -6.9);                    // top hatch
  b.box(WHITE, 0.25, 0.25, 0.04, 10.6, T0 + 1.6, -6.03);                  // gauge
  b.box(RED, 0.3, 0.3, 0.06, 10.2, T0 + 0.7, -6.02);                       // valve wheel
  b.box(RED, 1.2, 0.25, 0.02, 10.6, T0 + 1.0, -6.03);                     // label stripe

  // =====================================================
  // FLOOR 1
  // =====================================================

  // --- crew dormitory: 4 beds along the north wall ---
  const covers = [RED, WHITE, GREY, RED_D];
  [-10.6, -8.0, -5.4, -2.8].forEach((x, i) => addBed(b, plan, x, -6.9, 1, 0, GREY_D, covers[i]));
  [-9.3, -6.7, -4.1].forEach((x) => {
    solidBox(b, plan, GREY, x, -7.65, 0.5, 0.5, 0.9, 1);                  // bedside lockers
    b.box(GREY_L, 0.06, 0.2, 0.03, x + 0.1, T1 + 0.5, -7.39);
  });
  b.box(RED_D, 8.6, 0.02, 1.0, -6.7, T1, -4.8);                           // runner rug

  // --- common room: sofa, table, 4 chairs ---
  b.box(GREY_L, 3.6, 0.02, 3.0, -6.0, T1, 1.1);                           // rug
  solidBox(b, plan, GREY_D, -6.0, 1.0, 1.6, 0.8, 0.72, 1);                // table
  solidBox(b, plan, WHITE, -6.0, 1.0, 1.7, 0.9, 0.05, 1, 0.72);
  [-6.4, -5.6].forEach((x) => {
    addChair(b, plan, x, 0.2, 1, 0, RED_D);                               // north side
    addChair(b, plan, x, 1.8, 1, Math.PI, RED_D);                         // south side
  });
  sofa(-6.0, 7.35, 'N', 2.2, RED, 0xd96a5f, 1);
  solidBox(b, plan, GREY, -6.0, 5.9, 1.2, 0.6, 0.4, 1);                   // low table

  // --- kitchen: counter, stove, fridge (south wall, east of the door area) ---
  solidBox(b, plan, GREY_D, 5.3, 7.65, 2.6, 0.7, 0.9, 1);                 // counter
  solidBox(b, plan, WHITE, 5.3, 7.65, 2.7, 0.7, 0.05, 1, 0.9);
  b.box(GREY_L, 0.6, 0.04, 0.4, 4.7, T1 + 0.95, 7.65);                    // sink
  b.box(GREY_L, 0.05, 0.3, 0.05, 4.7, T1 + 0.95, 7.9);                    // tap
  [-0.6, 0, 0.6].forEach((o) => b.box(DARK, 0.5, 0.02, 0.02, 5.6 + o, T1 + 0.5, 7.29));   // cupboard gaps
  solidBox(b, plan, GREY_L, 7.2, 7.65, 0.8, 0.7, 0.9, 1);                 // stove
  [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]].forEach(([ox, oz]) => b.box(DARK, 0.2, 0.02, 0.2, 7.2 + ox, T1 + 0.9, 7.65 + oz));
  b.box(DARK, 0.6, 0.4, 0.02, 7.2, T1 + 0.2, 7.29);                       // oven door
  b.box(GREY_L, 0.8, 0.3, 0.5, 7.2, T1 + 2.0, 7.75);                      // range hood
  solidBox(b, plan, 0xe4e8ec, 8.4, 7.65, 0.9, 0.7, 1.9, 1);               // fridge
  b.box(GREY_D, 0.04, 0.5, 0.03, 8.0, T1 + 1.0, 7.29);                    // fridge handle

  // --- locker room: lockers along the north wall with a bench ---
  for (let i = 0; i < 10; i++) {
    const x = 1.2 + 0.6 * i;
    solidBox(b, plan, i % 2 === 0 ? GREY_D : RED_D, x, -7.7, 0.55, 0.5, 1.9, 1);
    b.box(GREY_L, 0.05, 0.2, 0.03, x + 0.15, T1 + 1.1, -7.44);
    [1.55, 1.62, 1.69].forEach((y) => b.box(DARK, 0.32, 0.02, 0.02, x, T1 + y, -7.44));
  }
  solidBox(b, plan, GREY, 3.9, -6.5, 2.6, 0.5, 0.45, 1);                  // bench

  // --- training corner: punching bag and weights ---
  b.box(0x3a3f47, 4.6, 0.02, 5.2, 5.8, T1, -0.2);                         // rubber mat
  b.box(GREY_D, 0.4, 0.1, 0.4, 6.8, T1 + 3.2, -1.6);                      // ceiling bracket
  b.box(GREY_L, 0.04, 1.2, 0.04, 6.8, T1 + 2.0, -1.6);                    // chain
  solidBox(b, plan, RED, 6.8, -1.6, 0.45, 0.45, 1.1, 1, 0.9);             // punching bag
  b.box(WHITE, 0.47, 0.08, 0.47, 6.8, T1 + 1.5, -1.6);                    // bag stripe
  solidBox(b, plan, GREY_D, 4.6, 0.9, 0.5, 1.3, 0.42, 1);                 // weight bench
  b.box(DARK, 0.46, 0.08, 1.2, 4.6, T1 + 0.42, 0.9);
  [3.95, 5.25].forEach((x) => solidBox(b, plan, GREY_L, x, 0.0, 0.08, 0.08, 1.1, 1));   // barbell stand
  b.box(GREY_L, 1.7, 0.04, 0.04, 4.6, T1 + 1.1, 0.0);                     // barbell
  [-0.8, 0.8].forEach((o) => b.box(DARK, 0.06, 0.4, 0.4, 4.6 + o, T1 + 0.9, 0.0));       // plates
  solidBox(b, plan, DARK, 3.6, 2.2, 0.5, 0.5, 0.4, 1);                    // plate stack
  solidBox(b, plan, GREY_D, 7.2, 1.9, 1.6, 0.5, 0.7, 1);                  // dumbbell rack
  [-0.6, -0.3, 0, 0.3, 0.6].forEach((o) => b.box(DARK, 0.2, 0.14, 0.14, 7.2 + o, T1 + 0.7, 1.9));
}
