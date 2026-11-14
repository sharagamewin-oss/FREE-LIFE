// =====================================================
// CIVIC BUILDING: FRESH FOOD SHOP (a small supermarket)
// 20 x 11 m and 7.5 m tall. Warm orange walls with white corner piers and a white base, a green roof
// edge (fascia and parapet), a wide glass front with stock shelves showing through, a glass double
// door in the middle, and a striped green and white awning over the whole front.
// In the forecourt: four tables with crates of red, orange and green fruit and vegetables,
// a shopping-cart rack and a bench.
// =====================================================
// Drawing space (the building's OWN directions, the same idea as a house):
//   origin (0, 0) = middle of the 24 x 24 m lot.   x = right.   +z = front (street side).
//   Body: x from -10 to 10, z from -11 to 0 (front wall at z = 0), 7.5 m tall.
//   Forecourt: z from 0 to 12.
//
// The sign board (drawn by index.js) is a 10 x 2.5 m board at x = 0, z = 0.1. It hangs above the
// awning (y 4.45 to 6.95), so signY is 5.7.
//
// The door is in the middle of the front wall, under the awning.
// SOLID: the building, the four crate tables, the cart rack and the bench.
export const info = {
  id: 'food',
  name: 'Food Store',
  sign: 'FRESH FOOD SHOP',       // the words on the sign board
  signY: 5.7,                    // middle of the sign board: it covers y 4.45 to 6.95
  height: 7.5,                   // real height of the building (players can fly over it)
  door: { x: 0, z: 1.5 },        // under the awning, in front of the glass doors
  collide: {
    // box = [centre x, centre z, width, depth, height]
    boxes: [
      [0, -5.5, 20, 11, 7.5],            // the shop
      [-7.0, 3.6, 2.4, 0.95, 1.2],       // crate tables
      [-3.9, 3.6, 2.4, 0.95, 1.2],
      [4.2, 3.6, 2.4, 0.95, 1.2],
      [-7.0, 6.9, 2.4, 0.95, 1.2],
      [8.0, 2.6, 3.1, 1.0, 1.2],         // the shopping-cart rack
      [6.2, 6.8, 0.5, 1.8, 0.9]          // the bench
    ],
    // round = [x, z, radius, height]
    round: []
  }
};

export function build(b, c) {
  const G = c.G;               // ground height (0.1)
  const TOP = G + 7.5;         // the top of the walls

  // ---------- Colours ----------
  const ORANGE = 0xf4a259;
  const ORANGE_DARK = 0xe08a3c;
  const WHITE = 0xfaf7f0;
  const GREEN = 0x2e9e57;
  const GREEN_DARK = 0x1f7a42;
  const GLASS = 0xbfe6f5;
  const GLASS_SHINE = 0xe6f7fc;
  const STONE = 0xc9c2b4;
  const STONE_DARK = 0xa8a294;
  const GREY = 0x8a8f94;
  const GREY_DARK = 0x5d6369;
  const WOOD = 0xb5793f;
  const WOOD_DARK = 0x7a4a2a;
  const CRATE = 0xd9a566;
  const RED = 0xe53935;
  const ORANGE_FRUIT = 0xff9800;
  const GREEN_VEG = 0x4caf50;
  const PACKS = [0xe53935, 0xff9800, 0x4caf50, 0xffeb3b, 0xffffff, 0x81c784, 0xff7043];

  // A small random number maker with a fixed seed, so the shelves look the same every visit.
  let seed = 5150;
  const rng = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (list) => list[Math.floor(rng() * list.length)];
