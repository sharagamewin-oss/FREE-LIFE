// =====================================================
// FREE LIFE - js/buildings/walk.js
// Walking inside a civic building: which floor is under your feet, and what blocks you.
// Pure functions (no Three.js), so they are easy to test on their own.
// Everything is in the room's LOCAL space: x/z measured from the middle of the room, y up.
// =====================================================

export const STEP_UP = 0.7;       // you can step up onto something this much higher than your feet
export const BODY_HEIGHT = 1.8;   // how tall the player is (for blocks that hang over your head)

const EPS = 0.001;

// How high is a ramp (a staircase) at the point (x, z)?
// ramp = { x0, x1, z0, z1, up: '-z' | '+z' | '-x' | '+x', from, to }
// "up" says in which direction the ramp climbs: height goes from "from" to "to".
export function rampHeight(r, x, z) {
  let t;
  if (r.up === '-z') t = (r.z1 - z) / (r.z1 - r.z0);
  else if (r.up === '+z') t = (z - r.z0) / (r.z1 - r.z0);
  else if (r.up === '-x') t = (r.x1 - x) / (r.x1 - r.x0);
  else t = (x - r.x0) / (r.x1 - r.x0);
  t = Math.max(0, Math.min(1, t));
  return r.from + (r.to - r.from) * t;
}

function inside(x, z, x0, x1, z0, z1) {
  return x >= x0 - EPS && x <= x1 + EPS && z >= z0 - EPS && z <= z1 + EPS;
}

// The height of the floor under the player at (x, z), whose feet are at feetY.
// Rule: look at every flat surface and every ramp that contains (x, z), keep the ones whose top
// is at most STEP_UP above your feet, and take the HIGHEST of those.
// If none qualifies we return feetY (keep the current height): the player never falls.
export function floorAt(plan, x, z, feetY) {
  let best = -Infinity;
  const limit = feetY + STEP_UP;
  for (const s of plan.surfaces) {
    if (s[4] <= limit && s[4] > best && inside(x, z, s[0], s[1], s[2], s[3])) best = s[4];
  }
  for (const r of plan.ramps) {
    if (!inside(x, z, r.x0, r.x1, r.z0, r.z1)) continue;
    const h = rampHeight(r, x, z);
    if (h <= limit && h > best) best = h;
  }
  return best === -Infinity ? feetY : best;
}

// Which floor (0, 1, 2 ...) is the player on? The highest floor whose top is within STEP_UP of the feet.
export function floorIndexAt(plan, feetY) {
  let idx = 0;
  plan.floors.forEach((f, i) => { if (f.top <= feetY + STEP_UP) idx = i; });
  return idx;
}

// Pushes a circle (the player, with the given radius) out of the room walls and out of every block.
// A block [x0, x1, z0, z1, yFrom, yTo] counts only while  feetY < yTo  and  feetY + BODY_HEIGHT > yFrom.
// Returns { x, z } (the corrected position).
export function pushOut(plan, x, z, feetY, radius) {
  const maxX = plan.halfW - radius;
  const maxZ = plan.halfD - radius;
  const head = feetY + BODY_HEIGHT;
  for (let pass = 0; pass < 3; pass++) {            // a few passes, so corners settle
    for (const b of plan.blocks) {
      if (!(feetY < b[5] && head > b[4])) continue;
      const nx = Math.max(b[0], Math.min(b[1], x));  // the closest point of the block to the player
      const nz = Math.max(b[2], Math.min(b[3], z));
      let dx = x - nx;
      let dz = z - nz;
      const d = Math.hypot(dx, dz);
      if (d >= radius) continue;
      if (d > 1e-6) {                                // outside the block, but too close: push away
        x = nx + (dx / d) * radius;
        z = nz + (dz / d) * radius;
      } else {                                       // right inside the block: leave through the nearest side
        const left = x - b[0];
        const right = b[1] - x;
        const front = z - b[2];
        const back = b[3] - z;
        const m = Math.min(left, right, front, back);
        if (m === left) x = b[0] - radius;
        else if (m === right) x = b[1] + radius;
        else if (m === front) z = b[2] - radius;
        else z = b[3] + radius;
      }
    }
    x = Math.max(-maxX, Math.min(maxX, x));
    z = Math.max(-maxZ, Math.min(maxZ, z));
  }
  return { x, z };
}

// How high is the ceiling above the point (x, z), for someone standing with their feet at feetY?
// It is the underside of the first floor slab above their head (an opening above a staircase has no
// slab, so the ceiling there is higher), or the roof. Used to keep the camera inside the building.
export function ceilingAt(plan, x, z, feetY) {
  const last = plan.floors.length - 1;
  let best = plan.floors[last].ceiling;                       // the roof
  for (let j = 0; j < last; j++) {
    const c = plan.floors[j].ceiling;                         // underside of the slab of floor j + 1
    if (c < feetY + 1.0 || c >= best) continue;               // not above the head, or not lower than what we have
    const rects = plan.floorRects[j + 1];
    for (const r of rects) {
      if (x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3]) { best = c; break; }
    }
  }
  return best;
}
