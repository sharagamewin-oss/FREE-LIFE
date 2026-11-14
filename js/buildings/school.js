// =====================================================
// CIVIC BUILDING: SCHOOL   (PLACEHOLDER - replace this whole file later)
// =====================================================
// The rules every building file follows (do not change the names or the shape):
//   export const info   : the facts about the building (sign text, door, collision).
//   export function build(b, c) : draws the building into the shape builder `b`.
//
// Drawing space (the building's OWN directions, the same idea as a house):
//   origin (0, 0) = the middle of the 24 x 24 m lot.   x = right.
//   +z = the front (street side, the way the door faces).   -z = the back.
//   The lot goes from -12 to 12 in both x and z.
//   Default body: x from -10 to 10, z from -11 to 0. The forecourt is z from 0 to 12.
//   The front wall is at z = 0. The sign board sits just in front of it (z = 0.1).
//
// `c.G` is the ground height (0.1). Start every part at y = c.G.
// `c` also carries helpers (frontWindow, sideWindow, fenceX, fenceZ, flowerBed, bush, makeRng).
// Everything must go into the ONE builder `b` (one merged shape). No textures, no new lights.
export const info = {
  id: 'school',
  name: 'School',
  sign: 'SCHOOL',        // the words on the sign board
  signY: 6,                      // height of the middle of the sign board (metres)
  height: 9,                     // real height of the building (players can fly over it)
  door: { x: 0, z: 1.5 },        // where you stand to use the door (in front of the front wall)
  collide: {
    // box   = [centre x, centre z, width, depth, height]
    boxes: [[0, -5.5, 20, 11, 9]],
    // round = [x, z, radius, height]
    round: []
  }
};

export function build(b, c) {
  // Placeholder: just one 20 x 11 m box, 9 m tall.
  b.box(0xe0b04b, 20, 9, 11, 0, c.G, -5.5);
}
