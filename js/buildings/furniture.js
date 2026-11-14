// =====================================================
// CIVIC BUILDING: HOME & FURNITURE (a furniture showroom)
// 20 x 11 m and 8 m tall. Wood-tone walls with plank lines, a dark flat roof with a large sign board,
// and two very large display bays (7.2 x 3.7 m) on the front. Inside the bays: a sofa and a floor
// lamp on the left, a dining table (with a vase and two chairs) on the right. The door is in the
// middle, between the two windows.
// In the forecourt: a sofa and two chairs and a wardrobe on display stands, and a planter in each corner.
// =====================================================
// Drawing space (the building's OWN directions, the same idea as a house):
//   origin (0, 0) = middle of the 24 x 24 m lot.   x = right.   +z = front (street side).
//   Body: x from -10 to 10, z from -11 to 0 (front wall at z = 0), 8 m tall.
//   Forecourt: z from 0 to 12.
//
// The sign board (drawn by index.js) is a 10 x 2.5 m board at x = 0, z = 0.1. It sits above the
// windows in a big dark wooden frame (y 4.95 to 7.45), so signY is 6.2.
//
// The door is in the middle of the front wall, between the two display windows.
// The display bays have no glass you can see through (the game has no see-through glass), so they are
// open cases with thin frames: the furniture inside can always be seen.
// SOLID: the building, the two display bays, the forecourt sofa, chairs and wardrobe, and the planters.
export const info = {
  id: 'furniture',
  name: 'Furniture Shop',
  sign: 'HOME & FURNITURE',      // the words on the sign board
  signY: 6.2,                    // middle of the sign board: it covers y 4.95 to 7.45
  height: 8,                     // real height of the building (players can fly over it)
  door: { x: 0, z: 1.5 },        // in front of the door, between the windows
  collide: {
    // box = [centre x, centre z, width, depth, height]
    boxes: [
      [0, -5.5, 20, 11, 8],              // the showroom
      [-5.8, 0.88, 7.6, 1.75, 4.6],      // the left display bay
      [5.8, 0.88, 7.6, 1.75, 4.6],       // the right display bay
      [-7.0, 6.7, 2.4, 0.9, 1.0],        // the sofa on display
      [-9.6, 6.7, 0.9, 0.9, 1.0],        // the two chairs
      [-4.4, 6.7, 0.9, 0.9, 1.0],
      [7.0, 6.7, 2.4, 0.75, 2.6]         // the wardrobe
    ],
    // round = [x, z, radius, height]
    round: [
      [-10.3, 1.3, 0.65, 1.3],           // the four corner planters
      [10.3, 1.3, 0.65, 1.3],
      [-10.3, 11.0, 0.65, 1.3],
      [10.3, 11.0, 0.65, 1.3]
    ]
  }
};

export function build(b, c) {
  const G = c.G;               // ground height (0.1)
  const TOP = G + 8;           // the top of the walls

  // ---------- Colours ----------
  const WALL = 0xb98a58;
  const WALL_LINE = 0xa07745;
  const WOOD = 0x8a5a36;
  const WOOD_LIGHT = 0xd2a36a;
  const DARK_WOOD = 0x4a3220;
  const DARK = 0x33373c;
  const DARKER = 0x24272b;
  const CREAM = 0xf1e4cd;
  const GLASS = 0xbfe6f5;
  const STONE = 0xc9c2b4;
  const STONE_DARK = 0xa8a294;
  const GREY = 0x8a8f94;
  const GREY_DARK = 0x5d6369;
  const SOFA_BLUE = 0x6d8aa3;
  const SOFA_BLUE_LIGHT = 0x86a3bb;
  const SOFA_GREEN = 0x6a9a72;
  const LEAF = 0x62b552;
  const GOLD = 0xe6b84a;
  const FLOWERS = [0xf48fb1, 0xffd54f, 0xffffff, 0xff8a65, 0xb388eb];
