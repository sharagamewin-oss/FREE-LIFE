// =====================================================
// INTERIOR: Furniture shop   (2 floors, joined by stairs)
// Floor 0: sales desk, living-room sets (west), dining sets (east), wall boards, plants.
// Floor 1: bedroom showroom, wardrobes and dressers, kids' corner, lamp showroom, office corner.
// Helpers (see inside_common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './inside_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'sales', label: 'Sales desk', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  // warm wood + neutral palette
  const WOOD = 0x8a5a3a;
  const WOOD_L = 0xc29a68;
  const WOOD_D = 0x6e4f33;
  const OAK = 0xb98a58;
  const CREAM = 0xf2e9dc;
  const WHITE = 0xfffaf2;
  const BEIGE = 0xd9c7a8;
  const TAUPE = 0xb8a58c;
  const MOCHA = 0x8c7b6b;
  const CHAR = 0x5f5a55;
  const DARK = 0x2e2a27;
  const LEAF = 0x6f8f5a;
  const LEAF_D = 0x587848;
  const POT = 0xa9876a;

  shell(b, plan, { floor: 0xd2ad7c, floorAlt: 0xc29a68, wall: 0xf2e9dc, ceiling: 0xfffaf2, trim: 0x8a5a3a });
  for (let k = 0; k < plan.stairs.length; k++) addStairs(b, plan, k);

  const T0 = plan.floors[0].top;
  const T1 = plan.floors[1].top;

  // ---------- small helpers ----------

  // A computer. `top` = height of the desk top. dir = 1: screen faces +z, dir = -1: faces -z.
  const computer = (x, z, top, dir = 1) => {
    b.box(CHAR, 0.16, 0.14, 0.1, x, top, z - 0.18 * dir);
    b.box(DARK, 0.56, 0.34, 0.04, x, top + 0.14, z - 0.18 * dir);
    b.box(0xbfd4e8, 0.5, 0.28, 0.01, x, top + 0.17, z - 0.155 * dir);
    b.box(BEIGE, 0.42, 0.02, 0.14, x, top, z + 0.15 * dir);
  };

  // A sofa or armchair. face = the way the sitter looks: 'N' (-z), 'S' (+z), 'E' (+x), 'W' (-x).
  const sofa = (cx, cz, face, len, col, cushion, fl = 0) => {
    const T = plan.floors[fl].top;
    const hor = face === 'N' || face === 'S';
    const bx = face === 'E' ? -1 : face === 'W' ? 1 : 0;   // from the seat toward the back
    const bz = face === 'S' ? -1 : face === 'N' ? 1 : 0;
    solidBox(b, plan, col, cx, cz, hor ? len : 0.9, hor ? 0.9 : len, 0.42, fl);                     // seat base
    solidBox(b, plan, col, cx + bx * 0.34, cz + bz * 0.34, hor ? len : 0.22, hor ? 0.22 : len, 0.9, fl); // back
    [-1, 1].forEach((s) => {                                                                          // arms
      const ox = hor ? s * (len / 2 - 0.1) : 0;
      const oz = hor ? 0 : s * (len / 2 - 0.1);
      solidBox(b, plan, col, cx + ox, cz + oz, hor ? 0.2 : 0.9, hor ? 0.9 : 0.2, 0.62, fl);
    });
    b.box(cushion, hor ? len - 0.5 : 0.62, 0.1, hor ? 0.62 : len - 0.5, cx - bx * 0.1, T + 0.42, cz - bz * 0.1);
  };

  // A potted plant.
  const plant = (x, z, fl = 0) => {
    const T = plan.floors[fl].top;
    solidBox(b, plan, POT, x, z, 0.5, 0.5, 0.4, fl);
    b.box(WOOD_D, 0.08, 0.5, 0.08, x, T + 0.4, z);
    b.box(LEAF, 0.7, 0.5, 0.7, x, T + 0.8, z);
    b.box(LEAF_D, 0.5, 0.4, 0.5, x, T + 1.25, z);
  };

  // A dining table with `perSide` chairs on each long side.
  const dining = (cx, cz, perSide) => {
    const tw = perSide * 0.8;
    solidBox(b, plan, OAK, cx, cz, tw, 0.8, 0.72, 0);
    solidBox(b, plan, WOOD, cx, cz, tw + 0.1, 0.9, 0.05, 0, 0.72);
    b.box(TAUPE, tw - 0.3, 0.01, 0.2, cx, T0 + 0.77, cz);                 // table runner
    b.box(LEAF, 0.1, 0.2, 0.1, cx, T0 + 0.78, cz);                        // little vase
    for (let i = 0; i < perSide; i++) {
      const x = cx + (i - (perSide - 1) / 2) * 0.8;
      addChair(b, plan, x, cz - 0.8, 0, 0, WOOD_D);                       // north side, faces the table
      addChair(b, plan, x, cz + 0.8, 0, Math.PI, WOOD_D);                 // south side, faces the table
      b.box(CREAM, 0.28, 0.02, 0.28, x, T0 + 0.77, cz - 0.28);            // plates
      b.box(CREAM, 0.28, 0.02, 0.28, x, T0 + 0.77, cz + 0.28);
    }
  };

  // A wardrobe, dresser or shelf against a wall. front = the way its front faces:
  // 'S' (+z, against the north wall), 'N' (-z, south wall), 'E' (+x, west wall), 'W' (-x, east wall).
  // len = length along the wall, depth = distance from the wall.
  const piece = (cx, cz, len, depth, h, col, front, fl, kind) => {
    const T = plan.floors[fl].top;
    const hor = front === 'S' || front === 'N';
    const w = hor ? len : depth;
    const d = hor ? depth : len;
    solidBox(b, plan, col, cx, cz, w, d, h, fl);
    const fx = cx + (front === 'E' ? w / 2 + 0.01 : front === 'W' ? -(w / 2 + 0.01) : 0);
    const fz = cz + (front === 'S' ? d / 2 + 0.01 : front === 'N' ? -(d / 2 + 0.01) : 0);
    const det = (color, lw, hh, dd, along, y) => {
      if (hor) b.box(color, lw, hh, dd, cx + along, T + y, fz);
      else b.box(color, dd, hh, lw, fx, T + y, cz + along);
    };
    if (kind === 'wardrobe') {
      det(DARK, 0.02, h * 0.86, 0.02, 0, h * 0.07);                       // door gap
      det(TAUPE, 0.04, 0.25, 0.03, -0.12, h * 0.5 - 0.12);                // handles
      det(TAUPE, 0.04, 0.25, 0.03, 0.12, h * 0.5 - 0.12);
    } else if (kind === 'dresser') {
      det(DARK, len * 0.9, 0.02, 0.02, 0, h * 0.36);                      // drawer gaps
      det(DARK, len * 0.9, 0.02, 0.02, 0, h * 0.68);
      [0.18, 0.5, 0.82].forEach((k) => {                                  // knobs
        det(TAUPE, 0.1, 0.04, 0.03, -len * 0.2, h * k - 0.1);
        det(TAUPE, 0.1, 0.04, 0.03, len * 0.2, h * k - 0.1);
      });
    } else {                                                              // shelf
      [0.3, 0.6, 0.9].forEach((k) => det(DARK, len * 0.92, 0.03, 0.02, 0, h * k));
      [-0.6, -0.2, 0.3, 0.7].forEach((a, i) => det([WOOD_L, CREAM, TAUPE, WOOD_D][i], 0.18, 0.28, 0.03, a * len * 0.5, h * 0.3 + 0.04));
    }
  };

  // A wall board (price list / sign). wall: 'n' (north wall) or 'w' (west wall). pos = along the wall.
  const board = (wall, pos, y, w, h, fl = 0) => {
    const T = plan.floors[fl].top;
    const put = (col, lw, hh, dd, lp, yy, off) => {
      if (wall === 'n') b.box(col, lw, hh, dd, pos + lp, T + yy, -8 + off);
      else b.box(col, dd, hh, lw, -12 + off, T + yy, pos + lp);
    };
    put(WOOD, w, h, 0.05, 0, y, 0.025);
    put(CREAM, w - 0.12, h - 0.12, 0.02, 0, y + 0.06, 0.06);
    [0.22, 0.4, 0.58].forEach((k) => put(TAUPE, w - 0.4, 0.05, 0.02, 0, y + h - k, 0.075));
    put(WOOD_D, 0.28, 0.12, 0.02, w / 2 - 0.3, y + 0.1, 0.075);          // price tag
  };

  // =====================================================
  // FLOOR 0
  // =====================================================

  // --- sales desk at the job spot (x 0, z -5.2 stands behind it) ---
  solidBox(b, plan, WOOD, 0, -3.9, 2.6, 0.9, 0.8, 0);
  solidBox(b, plan, OAK, 0, -3.9, 2.8, 1.0, 0.06, 0, 0.8);
  b.box(WOOD_L, 2.2, 0.18, 0.02, 0, T0 + 0.5, -3.44);                     // sign strip on the front
  computer(-0.7, -3.9, T0 + 0.86, -1);                                    // screen faces the seller
  b.box(CREAM, 0.34, 0.04, 0.46, 0.55, T0 + 0.86, -3.85);                 // catalogue
  b.box(WOOD_L, 0.32, 0.03, 0.44, 0.55, T0 + 0.9, -3.85);
  b.box(CREAM, 0.3, 0.03, 0.4, 0.95, T0 + 0.86, -4.1);                    // second catalogue
  addChair(b, plan, -1.0, -5.0, 0, 0, WOOD_D);                            // seller's chair
  addChair(b, plan, -0.8, -2.7, 0, Math.PI, WOOD_D);                      // customer chairs
  addChair(b, plan, 0.8, -2.7, 0, Math.PI, WOOD_D);

  // --- living-room showroom, west side ---
  // set A: TV stand on the north wall, coffee table, sofa
  b.box(0xd9c7a8, 3.0, 0.02, 3.2, -8.5, T0, -6.0);                        // rug
  solidBox(b, plan, WOOD, -8.5, -7.55, 2.0, 0.5, 0.5, 0);                 // TV stand
  b.box(DARK, 0.14, 0.12, 0.1, -8.5, T0 + 0.5, -7.6);
  b.box(DARK, 1.2, 0.7, 0.06, -8.5, T0 + 0.6, -7.62);                     // TV
  b.box(0x3b4452, 1.12, 0.62, 0.01, -8.5, T0 + 0.64, -7.585);
  solidBox(b, plan, OAK, -8.5, -6.4, 1.2, 0.6, 0.4, 0);                   // coffee table
  sofa(-8.5, -5.1, 'N', 2.2, MOCHA, TAUPE, 0);
  // set B: sofa on the west wall, coffee table, armchair
  b.box(0xc9b89a, 3.6, 0.02, 2.8, -9.9, T0, 3.0);                         // rug
  sofa(-11.4, 3.0, 'E', 2.2, CHAR, 0x7a746c, 0);
  solidBox(b, plan, OAK, -9.9, 3.0, 0.6, 1.1, 0.4, 0);
  sofa(-8.7, 3.0, 'W', 1.0, TAUPE, CREAM, 0);
  // set C: sofa on the south wall, coffee table, armchair
  b.box(0xe3d8c6, 3.4, 0.02, 2.6, -6.4, T0, 6.4);                         // rug
  sofa(-5.6, 7.35, 'N', 2.0, 0xe3d8c6, CREAM, 0);
  solidBox(b, plan, OAK, -5.6, 5.9, 1.2, 0.6, 0.4, 0);
  sofa(-7.3, 5.9, 'E', 1.0, MOCHA, TAUPE, 0);
  // bookcase on the west wall
  piece(-11.7, -1.0, 2.0, 0.5, 1.8, WOOD, 'E', 0, 'shelf');

  // --- dining sets, east side ---
  dining(5.4, -4.8, 2);
  dining(6.6, 0.0, 3);
  dining(5.6, 5.2, 2);
  piece(10.2, -7.6, 2.2, 0.6, 1.0, WOOD, 'S', 0, 'dresser');              // sideboard on the north wall

  // --- wall-mounted price / sign boards ---
  [-7.2, -2.4, 2.4, 7.2].forEach((x) => board('n', x, 1.9, 1.1, 0.8, 0));
  [-3.3, 3.3].forEach((z) => board('w', z, 1.9, 1.1, 0.8, 0));

  // --- potted plants (corners, away from the door and the stairs) ---
  plant(-11.5, -7.5);
  plant(3.0, -7.5);
  plant(11.6, 7.6);
  plant(-11.5, 7.6);

  // =====================================================
  // FLOOR 1
  // =====================================================

  // --- bedroom showroom: 3 beds in different colours along the north wall ---
  addBed(b, plan, -10.6, -6.9, 1, 0, WOOD, 0xc08a7a);                     // terracotta
  addBed(b, plan, -7.6, -6.9, 1, 0, WOOD_L, 0x9fb09a);                    // sage
  addBed(b, plan, -4.6, -6.9, 1, 0, WOOD_D, 0xd9c08f);                    // sand
  [-10.6, -7.6, -4.6].forEach((x) => b.box(BEIGE, 1.9, 0.02, 1.1, x, T1, -4.9));   // rugs in front of the beds

  // --- wardrobes and dressers along the walls ---
  piece(-1.6, -7.6, 1.6, 0.6, 2.2, WOOD, 'S', 1, 'wardrobe');             // north wall, middle
  piece(0.1, -7.6, 1.6, 0.6, 2.2, WOOD_L, 'S', 1, 'wardrobe');
  piece(1.7, -7.65, 1.3, 0.5, 0.9, WOOD_D, 'S', 1, 'dresser');
  piece(4.8, -7.65, 1.4, 0.5, 0.9, WOOD_L, 'S', 1, 'dresser');            // north wall, east
  piece(6.6, -7.6, 1.6, 0.6, 2.2, WOOD, 'S', 1, 'wardrobe');
  piece(-5.8, 7.6, 1.6, 0.6, 2.2, WOOD, 'N', 1, 'wardrobe');              // south wall
  piece(-4.0, 7.65, 1.3, 0.5, 0.9, WOOD_L, 'N', 1, 'dresser');

  // --- kids' room corner (south-west): small bed, toy box, little table and stools ---
  b.box(0xe3b5a4, 2.0, 0.02, 1.4, -9.7, T1, 6.15);                        // rug
  solidBox(b, plan, WOOD_L, -10.6, 7.4, 1.7, 0.9, 0.3, 1);                // small bed frame
  solidBox(b, plan, WOOD_L, -11.46, 7.4, 0.08, 0.9, 0.75, 1);             // headboard
  b.box(CREAM, 1.55, 0.16, 0.8, -10.55, T1 + 0.3, 7.4);                   // mattress
  b.box(0xa9c4d6, 1.0, 0.06, 0.82, -10.2, T1 + 0.46, 7.4);                // blanket
  b.box(WHITE, 0.4, 0.1, 0.55, -11.05, T1 + 0.46, 7.4);                   // pillow
  solidBox(b, plan, WOOD, -8.7, 7.5, 0.8, 0.5, 0.45, 1);                  // toy box
  b.box(0xe8d08a, 0.2, 0.2, 0.2, -8.9, T1 + 0.45, 7.5);
  b.box(0xa9c4d6, 0.2, 0.2, 0.2, -8.6, T1 + 0.45, 7.5);
  solidBox(b, plan, OAK, -9.7, 5.7, 0.7, 0.7, 0.5, 1);                    // little table
  solidBox(b, plan, 0xe3b5a4, -10.35, 5.7, 0.3, 0.3, 0.3, 1);             // stools
  solidBox(b, plan, 0xa9c4d6, -9.05, 5.7, 0.3, 0.3, 0.3, 1);

  // --- lamp showroom: thin poles with box shades ---
  b.box(BEIGE, 5.4, 0.02, 5.6, 5.0, T1, 0);                               // rug
  const lamp = (x, z, shade, pole) => {
    solidBox(b, plan, pole, x, z, 0.34, 0.34, 0.06, 1);                   // base
    solidBox(b, plan, pole, x, z, 0.06, 0.06, 1.6, 1);                    // thin pole
    solidBox(b, plan, shade, x, z, 0.42, 0.42, 0.34, 1, 1.5);             // box shade
  };
  lamp(3.0, -1.8, CREAM, WOOD_D);
  lamp(5.0, -1.8, 0xe8d08a, CHAR);
  lamp(7.0, -1.8, 0xc08a7a, WOOD);
  lamp(3.0, 1.8, 0x9fb09a, WOOD);
  lamp(5.0, 1.8, WHITE, WOOD_D);
  lamp(7.0, 1.8, TAUPE, CHAR);

  // --- office furniture corner (south-east): 2 desks with chairs, and a bookcase ---
  [5.0, 8.2].forEach((x) => {
    solidBox(b, plan, WOOD, x, 7.4, 1.6, 0.8, 0.72, 1);
    solidBox(b, plan, OAK, x, 7.4, 1.7, 0.9, 0.05, 1, 0.72);
    b.box(WOOD_D, 0.5, 0.55, 0.02, x + 0.5, T1 + 0.1, 6.99);              // drawer front
    computer(x, 7.4, T1 + 0.77, -1);
    addChair(b, plan, x, 6.4, 1, 0, CHAR);
  });
  piece(11.7, 6.8, 1.8, 0.4, 1.9, WOOD, 'W', 1, 'shelf');

  // --- boards upstairs ---
  board('n', -7.2, 2.2, 1.1, 0.7, 1);
  board('n', 7.2, 2.5, 1.1, 0.7, 1);
}
