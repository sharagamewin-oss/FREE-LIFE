// =====================================================
// CIVIC BUILDING: CENTRAL PARK
// No big building: the whole lot is a green, lively park.
//   - a welcome arch with the CENTRAL PARK sign (posts at x = -5.5 and 5.5, the board hangs between them)
//   - a stone fountain in the middle of the park with a tall centre jet, on a sandy plaza
//   - curved sandy paths, a small pond with a stone edge (and two ducks), 8 benches
//   - 12 trees (round and pine, 4.5 to 9 m tall), flower beds, bushes and wild flowers
//   - a round gazebo (6.2 m wide, pitched roof on 6 posts) at the back
// =====================================================
// Drawing space (the building's OWN directions, the same idea as a house):
//   origin (0, 0) = the middle of the 24 x 24 m lot.   x = right.
//   +z = the front (street side).   -z = the back.
//
// The sign board (drawn by index.js) is always a 10 x 2.5 m board at x = 0, z = 0.1, so the welcome
// arch stands there. The board covers y 3.15 to 5.65, so players walk under it.
//
// The door is the gazebo steps: stand on the sand in front of the steps.
//
// SOLID: the fountain, the 6 gazebo posts and the tree trunks. Everything else you can walk over.

// ---------- Where things stand (shared by info and build) ----------
const FOUNTAIN = { x: 0, z: -2.0 };
const GAZEBO = { x: 0, z: -8.5, floorR: 3.1, postR: 2.7 };
const POND = { x: -7, z: 5.2, r: 2.5 };

// [x, z, height, 'round' or 'pine']
const TREES = [
  [-8.4, -8.4, 9.0, 'round'],
  [8.4, -8.6, 9.0, 'pine'],
  [-9.3, -3.6, 8.0, 'pine'],
  [8.9, -3.3, 7.5, 'round'],
  [-6.0, -10.0, 6.0, 'round'],
  [6.8, -10.2, 7.0, 'pine'],
  [-10.0, -1.0, 5.5, 'round'],
  [10.0, 0.0, 6.5, 'pine'],
  [-9.8, 9.8, 5.5, 'pine'],
  [9.6, 9.8, 5.5, 'round'],
  [5.0, 7.4, 4.5, 'round'],
  [4.0, 5.4, 5.0, 'pine']
];

const trunkRadius = (h) => (0.4 + h * 0.035) / 2;

// The posts of the gazebo (6 of them; the gap between the two front posts is where the steps are).
const POST_ANGLES = [30, 90, 150, 210, 270, 330].map((d) => (d * Math.PI) / 180);
const POSTS = POST_ANGLES.map((a) => [
  GAZEBO.x + GAZEBO.postR * Math.sin(a),
  GAZEBO.z + GAZEBO.postR * Math.cos(a)
]);

// [x, z, facing angle]: facing 0 looks to +z (the street), PI/2 looks to +x, PI looks to -z, -PI/2 looks to -x
const BENCHES = [
  [-4.3, -2.0, Math.PI / 2],        // by the fountain, left
  [4.3, -2.0, -Math.PI / 2],        // by the fountain, right
  [-1.3, 2.6, Math.PI / 2],         // by the front path
  [3.6, 9.0, -Math.PI / 2],         // by the front path, further out
  [-3.2, 5.2, -Math.PI / 2],        // facing the pond
  [5.6, -5.4, Math.PI / 2],         // by the right back path
  [-5.6, -5.4, -Math.PI / 2],       // by the left back path
  [5.0, -8.6, -Math.PI / 2]         // beside the gazebo
];

// Flower beds: [x, z, width, depth]
const BEDS = [
  [-7.4, 0.9, 3.6, 1.8],
  [7.4, 0.9, 3.6, 1.8],
  [7.0, 10.2, 4.0, 2.0],
  [-3.9, -4.9, 2.4, 1.6],
  [3.9, -4.9, 2.4, 1.6]
];

// ---------- The sandy paths: lists of points, drawn as overlapping discs ----------
const PATH_W = 1.9;
function curve(p0, p1, p2, steps) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    pts.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
  }
  return pts;
}
const PATHS = [];
{
  // A: the front path, an S shape from the street to the arch
  const a = [];
  for (let z = 12; z >= 0; z -= 0.6) a.push([2.4 * Math.sin((z * Math.PI) / 6), z]);
  PATHS.push(a);
  // B: through the arch to the plaza
  PATHS.push([[0, 0], [0, -0.7], [0, -1.4]]);
  // C and D: from the plaza to the back left and back right
  PATHS.push(curve([2.6, -2.0], [7.2, -1.4], [7.4, -6.6], 14));
  PATHS.push(curve([-2.6, -2.0], [-7.2, -1.4], [-7.4, -6.6], 14));
  // E: a branch from the front path out to the right
  PATHS.push(curve([2.4, 3.0], [6.2, 2.6], [8.4, 6.6], 12));
  // F: a branch from the front path to the pond
  PATHS.push(curve([-2.2, 9.0], [-5.6, 9.4], [-8.6, 8.2], 11));
  // G: from the plaza to the gazebo steps
  PATHS.push([[0, -3.9], [0, -4.4], [0, -4.7]]);
}

function nearPath(x, z, margin) {
  for (const p of PATHS) {
    for (const [px, pz] of p) {
      if (Math.hypot(x - px, z - pz) < PATH_W / 2 + margin) return true;
    }
  }
  return false;
}

export const info = {
  id: 'park',
  name: 'Park',
  sign: 'CENTRAL PARK',          // the words on the sign board
  signY: 4.4,                    // middle of the sign board: it covers y 3.15 to 5.65
  height: 9,                     // real height: the tallest trees (players can fly over it)
  door: { x: 0, z: -4.4 },       // on the sand in front of the gazebo steps
  collide: {
    // box = [centre x, centre z, width, depth, height]
    boxes: [],
    // round = [x, z, radius, height]
    round: [
      [FOUNTAIN.x, FOUNTAIN.z, 1.6, 0.95],       // the fountain basin
      [FOUNTAIN.x, FOUNTAIN.z, 0.45, 5.4],       // the fountain column and jet
      ...POSTS.map(([x, z]) => [x, z, 0.16, 3.5]),                    // the 6 gazebo posts
      ...TREES.map(([x, z, h]) => [x, z, trunkRadius(h), h * 0.45])   // the tree trunks
    ]
  }
};

// A small random number maker with a fixed seed, so the park looks the same every visit.
function localRng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function build(b, c) {
  const G = c.G;               // ground height of the lot (0.1)
  const Y0 = G + 0.04;         // the top of the lawn
  const rng = (c.makeRng || localRng)(2468);
  const pick = (list) => list[Math.floor(rng() * list.length)];

  // ---------- Colours ----------
  const GRASS = 0x6fbf55;
  const GRASS_LIGHT = 0x86cc62;
  const GRASS_DARK = 0x5aa84a;
  const SAND = 0xe8d6a6;
  const SAND_EDGE = 0xcdb98a;
  const STONE = 0xb8b0a0;
  const STONE_LIGHT = 0xd2cbbb;
  const STONE_DARK = 0x9a9384;
  const WATER = 0x58b4e6;
  const WATER_LIGHT = 0xd9f2ff;
  const WOOD = 0xb5793f;
  const WOOD_DARK = 0x6e4526;
  const CREAM = 0xfff1d0;
  const TRUNK = 0x7a5232;
  const LEAVES = [0x4fa64a, 0x62b552, 0x3f9a4f, 0x73c05a];
  const PINES = [0x2f7d4a, 0x3a8f55, 0x2a6f43];
  const FLOWERS = [0xf48fb1, 0xffd54f, 0xffffff, 0xff8a65, 0xb388eb, 0xe57373];

  // ---------- The lawn: the whole lot is green, with lighter and darker patches ----------
  b.box(GRASS, 23.8, 0.04, 23.8, 0, G, 0);
  for (let i = 0; i < 16; i++) {
    const x = (rng() - 0.5) * 20;
    const z = (rng() - 0.5) * 20;
    b.cyl(i % 2 ? GRASS_LIGHT : GRASS_DARK, 3 + rng() * 4, 0.012, x, Y0, z);
  }

  // ---------- Sandy paths (an edge layer first, then the sand on top) ----------
  PATHS.forEach((pts) => pts.forEach(([x, z]) => b.cyl(SAND_EDGE, PATH_W + 0.28, 0.025, x, Y0, z)));
  b.cyl(SAND_EDGE, 6.0, 0.025, FOUNTAIN.x, Y0, FOUNTAIN.z);                   // plaza edge
  PATHS.forEach((pts) => pts.forEach(([x, z]) => b.cyl(SAND, PATH_W, 0.04, x, Y0, z)));
  b.cyl(SAND, 5.7, 0.04, FOUNTAIN.x, Y0, FOUNTAIN.z);                         // the plaza round the fountain
  b.cyl(SAND, 2.6, 0.04, 0, Y0, -4.4);                                        // sand in front of the steps

  // =====================================================
  // THE WELCOME ARCH (the sign board hangs between the two posts)
  // =====================================================
  b.box(WOOD_DARK, 10.4, 2.8, 0.06, 0, 3.0, 0.03);                            // backing behind the board
  [-5.5, 5.5].forEach((x) => {
    b.box(STONE, 0.95, 0.4, 0.95, x, G, 0);                                   // stone foot
    b.box(WOOD_DARK, 0.55, 5.9, 0.55, x, G + 0.4, 0);                         // post
    b.box(WOOD, 0.8, 0.14, 0.8, x, G + 6.3, 0);                               // post cap
    b.ball(0xffd54f, 0.34, x, G + 6.65, 0);                                   // lantern
  });
  b.box(WOOD_DARK, 11.8, 0.4, 0.45, 0, G + 5.9, 0);                           // beam
  // A garland of leaves and flowers over the top and down the posts
  b.flex(0.45);
  for (let i = 0; i <= 14; i++) {
    const x = -5.6 + (11.2 * i) / 14;
    const arch = 1.0 * (1 - Math.pow(x / 5.8, 2));
    b.ball(pick(LEAVES), 0.75, x, G + 6.35 + arch, 0, 0.8);
    if (i % 2 === 0) b.dot(pick(FLOWERS), 0.34, x, G + 6.65 + arch, 0.25);
  }
  [-5.5, 5.5].forEach((px) => {
    for (let k = 0; k < 6; k++) {
      b.ball(pick(LEAVES), 0.6, px + (k % 2 ? 0.3 : -0.3), G + 0.9 + k * 0.85, 0.28, 0.9);
      if (k % 2 === 0) b.dot(pick(FLOWERS), 0.3, px + (k % 2 ? -0.1 : 0.1), G + 1.1 + k * 0.85, 0.5);
    }
  });
  b.flex(0);

  // =====================================================
  // THE FOUNTAIN (stone, round basin, tall centre jet)
  // =====================================================
  const FX = FOUNTAIN.x;
  const FZ = FOUNTAIN.z;
  b.cyl(STONE_LIGHT, 4.2, 0.08, FX, Y0, FZ);                                  // paving ring
  b.cyl(STONE, 3.3, 0.55, FX, Y0, FZ);                                        // the basin
  for (let k = 0; k < 20; k++) {                                              // the rim, a ring of stone blocks
    const a = (k * Math.PI * 2) / 20;
    b.slab(STONE_LIGHT, 0.6, 0.36, 0.34, FX + 1.5 * Math.sin(a), Y0 + 0.73, FZ + 1.5 * Math.cos(a), 0, a, 0);
  }
  b.cyl(WATER, 2.7, 0.75, FX, Y0, FZ);                                        // the water (top at 0.75)
  b.cyl(STONE, 0.8, 1.0, FX, Y0 + 0.5, FZ);                                   // pedestal
  b.cyl(STONE_LIGHT, 1.9, 0.18, FX, Y0 + 1.05, FZ);                           // lower plate
  b.cyl(STONE, 0.5, 0.6, FX, Y0 + 1.23, FZ);                                  // upper column
  b.cyl(STONE_LIGHT, 1.0, 0.14, FX, Y0 + 1.7, FZ);                            // top bowl
  b.cyl(WATER_LIGHT, 0.14, 3.3, FX, Y0 + 1.84, FZ);                           // the tall centre jet
  b.ball(WATER_LIGHT, 0.45, FX, Y0 + 5.25, FZ, 1.3);                          // the splash on top
  b.flex(0.15);
  for (let k = 0; k < 6; k++) {                                               // six small arcs falling into the basin
    const a = (k * Math.PI * 2) / 6;
    for (let s = 0; s <= 6; s++) {
      const t = s / 6;
      const r = 0.35 + t * 1.0;
      const y = 1.9 - 1.15 * t + 1.4 * t * (1 - t);
      b.dot(WATER_LIGHT, 0.14, FX + r * Math.sin(a), Y0 + y, FZ + r * Math.cos(a));
    }
  }
  b.flex(0);

  // =====================================================
  // THE POND (flat blue disc with a stone edge, rocks, lily pads, two ducks)
  // =====================================================
  const PX = POND.x;
  const PZ = POND.z;
  b.cyl(STONE, 5.7, 0.14, PX, Y0, PZ);                                        // stone edge
  b.cyl(WATER, 5.0, 0.17, PX, Y0, PZ);                                        // the water
  for (let k = 0; k < 14; k++) {                                              // rocks round the edge
    const a = (k * Math.PI * 2) / 14 + rng() * 0.2;
    const s = 0.5 + rng() * 0.4;
    b.ball(k % 2 ? STONE_DARK : STONE, s, PX + 2.7 * Math.sin(a), Y0 + s * 0.3, PZ + 2.7 * Math.cos(a), 0.7);
  }
  [[-0.9, 0.6], [0.8, -0.7], [1.2, 0.9], [-0.4, -1.1], [0.1, 0.2]].forEach(([dx, dz], i) => {
    b.cyl(0x4f9d45, 0.55, 0.02, PX + dx, Y0 + 0.17, PZ + dz);                 // lily pad
    if (i % 2 === 0) b.dot(0xf8bbd0, 0.2, PX + dx, Y0 + 0.24, PZ + dz);       // lily flower
  });
  [[-1.2, -0.2, 0.7], [1.5, 0.3, -2.3]].forEach(([dx, dz, turn]) => {         // ducks
    const dxp = PX + dx;
    const dzp = PZ + dz;
    b.ellip(0xffffff, 0.5, 0.3, 0.7, dxp, Y0 + 0.33, dzp, 0, turn, 0);
    b.ball(0x5b8f3c, 0.26, dxp + 0.26 * Math.sin(turn), Y0 + 0.6, dzp + 0.26 * Math.cos(turn));
    b.dot(0xff9f1c, 0.13, dxp + 0.42 * Math.sin(turn), Y0 + 0.58, dzp + 0.42 * Math.cos(turn));
  });

  // =====================================================
  // THE GAZEBO (round, 6.2 m wide, pitched roof on 6 posts, steps at the front)
  // =====================================================
  const GX = GAZEBO.x;
  const GZ = GAZEBO.z;
  const floorTop = G + 0.35;
  b.cyl(STONE_DARK, 6.5, 0.2, GX, G, GZ);                                     // stone base
  b.cyl(0xc89b66, 6.2, 0.35, GX, G, GZ);                                      // wooden floor
  b.cyl(0xe0c08c, 2.6, 0.02, GX, floorTop, GZ);                               // floor medallion
  b.box(0xc89b66, 2.4, 0.24, 0.5, GX, G, GZ + GAZEBO.floorR - 0.1 + 0.2);     // upper step
  b.box(STONE_LIGHT, 2.4, 0.12, 0.5, GX, G, GZ + GAZEBO.floorR + 0.45);       // lower step
  POSTS.forEach(([x, z]) => {
    b.cyl(CREAM, 0.32, 3.2, x, floorTop, z);                                  // post
    b.box(WOOD_DARK, 0.5, 0.12, 0.5, x, floorTop, z);                         // post foot
  });
  b.cyl(WOOD_DARK, 6.3, 0.22, GX, floorTop + 3.2, GZ);                        // the ring beam on top of the posts
  b.cone(0xb5533c, 7.0, 2.4, GX, floorTop + 3.4, GZ);                         // the pitched roof
  b.cyl(0x9c4430, 6.4, 0.1, GX, floorTop + 3.4, GZ);                          // roof trim
  b.cyl(WOOD_DARK, 0.12, 0.5, GX, floorTop + 5.75, GZ);                       // finial pole
  b.ball(0xffd54f, 0.34, GX, floorTop + 6.35, GZ);                            // finial ball
  b.cyl(WOOD_DARK, 0.04, 0.8, GX, floorTop + 2.5, GZ);                        // hanging lantern
  b.ball(0xffd54f, 0.32, GX, floorTop + 2.3, GZ);
  [[-1.5, 1], [1.5, 1]].forEach(([dx, s]) => {                                // flower tubs at the steps
    b.cyl(WOOD, 0.7, 0.5, GX + dx, G, GZ + GAZEBO.floorR + 0.55);
    b.flexUp(G + 0.5, G + 1.1, 0.8);
    b.ball(0x62b552, 0.7, GX + dx, G + 0.75, GZ + GAZEBO.floorR + 0.55, 0.8);
    b.dot(FLOWERS[s], 0.26, GX + dx + 0.1, G + 1.1, GZ + GAZEBO.floorR + 0.55);
    b.flex(0);
  });

  // =====================================================
  // TREES (round and pine; the trunks are solid)
  // =====================================================
  function roundTree(x, z, H) {
    const trunkH = H * 0.42;
    b.cyl(TRUNK, trunkRadius(H) * 2, trunkH + H * 0.22, x, G, z);
    const cy = G + trunkH + H * 0.2;
    b.flex(0.3);
    b.ball(pick(LEAVES), H * 0.62, x, cy, z, 0.9);
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6 + rng();
      b.ball(pick(LEAVES), H * 0.4, x + Math.cos(a) * H * 0.17, cy + (rng() - 0.3) * H * 0.08, z + Math.sin(a) * H * 0.17, 0.9);
    }
    b.ball(pick(LEAVES), H * 0.38, x, G + H * 0.81, z, 0.9);
    b.flex(0);
  }

  function pineTree(x, z, H) {
    b.cyl(TRUNK, trunkRadius(H) * 2, H * 0.3, x, G, z);
    const n = H >= 7 ? 5 : 4;
    b.flexUp(G + H * 0.2, G + H, 0.35);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      b.cone(PINES[i % PINES.length], H * (0.46 - 0.3 * t), H * 0.27, x, G + H * (0.15 + 0.58 * t), z);
    }
    b.flex(0);
  }

  TREES.forEach(([x, z, h, kind]) => (kind === 'pine' ? pineTree(x, z, h) : roundTree(x, z, h)));

  // =====================================================
  // BENCHES (8)
  // =====================================================
  function bench(x, z, face) {
    const cs = Math.cos(face);
    const sn = Math.sin(face);
    const swap = Math.abs(sn) > 0.5;      // turned a quarter: width and depth swap
    function part(color, w, h, d, lx, y, lz) {
      const px = x + lx * cs + lz * sn;
      const pz = z - lx * sn + lz * cs;
      b.box(color, swap ? d : w, h, swap ? w : d, px, y, pz);
    }
    part(WOOD, 1.8, 0.08, 0.5, 0, Y0 + 0.45, 0);              // seat
    part(WOOD, 1.8, 0.45, 0.07, 0, Y0 + 0.55, -0.23);          // back
    part(WOOD_DARK, 0.1, 0.45, 0.45, -0.8, Y0, 0);             // legs
    part(WOOD_DARK, 0.1, 0.45, 0.45, 0.8, Y0, 0);
    part(WOOD_DARK, 0.08, 0.3, 0.08, -0.82, Y0 + 0.5, -0.23);  // back supports
    part(WOOD_DARK, 0.08, 0.3, 0.08, 0.82, Y0 + 0.5, -0.23);
  }
  BENCHES.forEach(([x, z, f]) => bench(x, z, f));

  // =====================================================
  // FLOWER BEDS, BUSHES AND WILD FLOWERS
  // =====================================================
  BEDS.forEach(([x, z, w, d], idx) => {
    b.box(STONE, w, 0.22, d, x, Y0, z);                                       // stone border
    b.box(0x6b4a2e, w - 0.3, 0.26, d - 0.3, x, Y0, z);                        // soil
    const cols = [FLOWERS[idx % 6], FLOWERS[(idx + 1) % 6], FLOWERS[(idx + 3) % 6]];
    const n = Math.round(w * d * 1.6);
    b.flexUp(Y0 + 0.2, Y0 + 0.95, 0.9);
    for (let i = 0; i < n; i++) {
      const fx = x + (rng() - 0.5) * (w - 0.7);
      const fz = z + (rng() - 0.5) * (d - 0.7);
      b.dot(0x5fae4e, 0.4, fx, Y0 + 0.4, fz);
      b.dot(cols[i % 3], 0.4, fx, Y0 + 0.72, fz);
    }
    b.flex(0);
  });

  // Round bushes along the edges and next to the arch
  b.flex(0.5);
  [[-11, 6.6], [-11, -7.2], [11, -7.6], [11, 6.8], [-8.2, 11], [8.2, 11.4], [-11, -11], [11, -11],
   [-4.6, 0.6], [4.6, 0.6], [-4.4, 11], [11, 3]].forEach(([x, z]) => {
    const s = 1.1 + rng() * 0.5;
    b.ball(pick(LEAVES), s, x, Y0 + s * 0.4, z, 0.85);
  });
  b.flex(0);

  // Wild flowers scattered on the lawn (not on paths, the plaza, the pond, the gazebo or the beds)
  b.flexUp(Y0, Y0 + 0.5, 0.9);
  let placed = 0;
  for (let tries = 0; tries < 400 && placed < 60; tries++) {
    const x = (rng() - 0.5) * 22;
    const z = (rng() - 0.5) * 22;
    if (nearPath(x, z, 0.5)) continue;
    if (Math.hypot(x - FX, z - FZ) < 3.6) continue;
    if (Math.hypot(x - PX, z - PZ) < 3.5) continue;
    if (Math.hypot(x - GX, z - GZ) < 4.2) continue;
    if (BEDS.some(([bx, bz, w, d]) => Math.abs(x - bx) < w / 2 + 0.5 && Math.abs(z - bz) < d / 2 + 0.5)) continue;
    if (TREES.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 1.2)) continue;
    if (BENCHES.some(([bx, bz]) => Math.hypot(x - bx, z - bz) < 1.4)) continue;
    b.dot(pick(FLOWERS), 0.26, x, Y0 + 0.2, z);
    placed++;
  }
  b.flex(0);
}
