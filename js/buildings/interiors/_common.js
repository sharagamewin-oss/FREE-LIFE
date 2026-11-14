// =====================================================
// FREE LIFE - js/buildings/interiors/_common.js
// Shared helpers for the inside of every civic building.
//
// Each interior file (cafe.js, hospital.js ...) does this:
//   export const plan = makePlan(2);            // 2 floors (the data: floors, stairs, walls, blocks ...)
//   export function build(b, c) {               // draws everything into the builder b
//     shell(b, plan, { floor, wall, ceiling, trim });
//     addStairs(b, plan, 0);                    // one call per flight (floor 0 -> 1, then 1 -> 2 ...)
//     solidBox(b, plan, color, cx, cz, w, d, h, floorIndex);   // furniture you cannot walk through
//     addChair(...), addBed(...)                // things you can sit on or sleep in
//   }
//
// LOCAL SPACE: the middle of the room is (0, 0). x = right, +z = toward the door, y = up.
// Every floor is 24 x 16 m (x -12..12, z -8..8). Floor tops are at y = 0, 4, 8.
// The door is in the middle of the south wall (+z), on the ground floor only.
//
// KEEP EVERY PART INSIDE ONE FLOOR BAND (from 0.5 m under the floor top to 3.5 m above it):
// the game cuts the building into one mesh per floor, and shows only the floor you are on and
// the ones directly above and below it.
// =====================================================

export const HALF_W = 12;
export const HALF_D = 8;
export const FLOOR_H = 4;       // from one floor top to the next
export const SLAB = 0.5;        // thickness of the floor between two floors
export const CLEAR = 3.5;       // from a floor top up to the ceiling
export const STAIR_W = 2.4;     // width of a staircase
export const STAIR_RUN = 8;     // length of a staircase (along z)
export const STEPS = 20;        // 20 steps of 0.2 m rise and 0.4 m run
const WALL_T = 0.3;
const DOOR_W = 2.4;
const DOOR_H = 2.7;
const RAIL_H = 1.1;

export const floorTop = (plan, i) => plan.floors[i].top;

// ---------- the plan (pure data) ----------
function subtractRect(rect, hole) {         // a rectangle minus a hole inside it = up to 4 rectangles
  const [x0, x1, z0, z1] = rect;
  const [hx0, hx1, hz0, hz1] = hole;
  const out = [];
  if (hz0 > z0) out.push([x0, x1, z0, hz0]);
  if (hz1 < z1) out.push([x0, x1, hz1, z1]);
  const zz0 = Math.max(z0, hz0);
  const zz1 = Math.min(z1, hz1);
  if (hx0 > x0) out.push([x0, hx0, zz0, zz1]);
  if (hx1 < x1) out.push([hx1, x1, zz0, zz1]);
  return out;
}

// One step of a flight: its z range and the height of its top.
export function stepInfo(st, i) {
  const run = STAIR_RUN / STEPS;
  const zA = st.east ? 4 - (i + 1) * run : -4 + i * run;
  const top = st.ramp.from + ((st.ramp.to - st.ramp.from) * (i + 0.5)) / STEPS;
  return { zA, zB: zA + run, top };
}

// Makes the plan for a building with `floorCount` floors, with all the stairs already placed.
// Flight 0 (floor 0 -> 1) is on the EAST wall and rises toward -z.
// Flight 1 (floor 1 -> 2) is on the WEST wall and rises toward +z. Then east again, and so on.
export function makePlan(floorCount) {
  const plan = {
    halfW: HALF_W,
    halfD: HALF_D,
    floors: [],
    spawn: { x: 0, z: 6.6, yaw: 0 },
    exit: { x: 0, z: 6.2, w: 4.4 },        // the "Go outside" zone: z beyond 6.2, within w/2 of x
    surfaces: [],                           // [x0, x1, z0, z1, top]   flat floors you can walk on
    ramps: [],                              // { x0, x1, z0, z1, up, from, to }   the stairs
    blocks: [],                             // [x0, x1, z0, z1, yFrom, yTo]   solid things
    holes: [],                              // { floor, rect }   openings in a floor (above a staircase)
    floorRects: [],                         // the drawn floor pieces of each floor
    stairs: [],                             // one entry per flight
    spots: [],                              // sit / sleep spots: { kind: 'sit'|'sleep', x, y, z, a }
    jobSpots: []                            // { id, label, x, z, floor }   (jobs come later)
  };

  for (let i = 0; i < floorCount; i++) {
    plan.floors.push({ top: i * FLOOR_H, ceiling: i * FLOOR_H + CLEAR });
  }

  for (let k = 0; k < floorCount - 1; k++) {
    const east = k % 2 === 0;
    const x0 = east ? HALF_W - STAIR_W : -HALF_W;
    const x1 = east ? HALF_W : -HALF_W + STAIR_W;
    const from = plan.floors[k].top;
    const to = plan.floors[k + 1].top;
    const ramp = { x0, x1, z0: -4, z1: 4, up: east ? '-z' : '+z', from, to };
    const st = { k, east, ramp, hole: [x0, x1, -4, 4] };
    plan.stairs.push(st);
    plan.ramps.push(ramp);
    plan.holes.push({ floor: k + 1, rect: st.hole });

    // The solid side of the flight (the open side), one block per step, rising with the steps.
    const sx0 = east ? x0 - 0.12 : x1;
    const sx1 = east ? x0 : x1 + 0.12;
    for (let i = 0; i < STEPS; i++) {
      const s = stepInfo(st, i);
      plan.blocks.push([sx0, sx1, s.zA, s.zB, from, s.top + RAIL_H]);
    }
    // Close the open end under the flight (where the steps are high above the floor).
    if (east) plan.blocks.push([x0, x1, -4, -3.9, from, from + 3]);
    else plan.blocks.push([x0, x1, 3.9, 4, from, from + 3]);

    // Railings round the opening, on the upper floor. The edge where the stairs arrive stays open.
    const T = to;
    const side = east ? [x0 - 0.1, x0] : [x1, x1 + 0.1];
    plan.blocks.push([side[0], side[1], -4, 4, T, T + RAIL_H]);
    if (east) plan.blocks.push([x0, x1, 4, 4.1, T, T + RAIL_H]);     // the bottom end (south)
    else plan.blocks.push([x0, x1, -4.1, -4, T, T + RAIL_H]);        // the bottom end (north)
  }

  // The floors you can walk on (an upper floor has a hole above the flight that arrives on it).
  plan.floors.forEach((f, i) => {
    let rects = [[-HALF_W, HALF_W, -HALF_D, HALF_D]];
    plan.holes.filter((h) => h.floor === i).forEach((h) => {
      rects = rects.flatMap((r) => subtractRect(r, h.rect));
    });
    plan.floorRects.push(rects);
    rects.forEach((r) => plan.surfaces.push([r[0], r[1], r[2], r[3], f.top]));
  });

  return plan;
}

// ---------- drawing ----------
// Does floor i have a staircase on the east (+1) or west (-1) wall?
function stairOnSide(plan, i, east) {
  return plan.stairs.some((st) => st.east === east && (st.k === i || st.k + 1 === i));
}

// Floors, ceilings, the four walls, the door opening (ground floor, south wall) and window bands.
// opts: { floor, floorAlt, wall, ceiling, trim, glass }  (all colours, like 0xd9c7a8)
export function shell(b, plan, opts = {}) {
  const FLOOR = opts.floor === undefined ? 0xc8a878 : opts.floor;
  const FLOOR2 = opts.floorAlt === undefined ? FLOOR : opts.floorAlt;
  const WALL = opts.wall === undefined ? 0xefe6d6 : opts.wall;
  const CEIL = opts.ceiling === undefined ? 0xf7f3ea : opts.ceiling;
  const TRIM = opts.trim === undefined ? 0x7a5a3a : opts.trim;
  const GLASS = opts.glass === undefined ? 0xd6efff : opts.glass;
  const last = plan.floors.length - 1;

  plan.floors.forEach((f, i) => {
    const T = f.top;

    // --- the floor (2 m wide strips, in two tones, so the floor does not look flat) ---
    plan.floorRects[i].forEach((r) => {
      const [x0, x1, z0, z1] = r;
      const cz = (z0 + z1) / 2;
      const d = z1 - z0;
      const body = i === 0 ? FLOOR : CEIL;
      if (i === 0) b.box(0x8d8579, x1 - x0, 0.25, d, (x0 + x1) / 2, -0.3, cz);         // ground under the floor
      else b.box(body, x1 - x0, SLAB - 0.05, d, (x0 + x1) / 2, T - SLAB, cz);           // the slab (the ceiling of the floor below)
      for (let sx = x0, n = 0; sx < x1 - 0.001; n++) {
        const ex = Math.min(x1, sx + 2);
        b.box(n % 2 === 0 ? FLOOR : FLOOR2, ex - sx, 0.05, d, (sx + ex) / 2, T - 0.05, cz);
        sx = ex;
      }
    });

    // --- the walls of this floor ---
    const yb = i === 0 ? -0.3 : T - SLAB;
    const yt = i === last ? T + FLOOR_H : T + CLEAR;
    const h = yt - yb;
    b.box(WALL, 24.6, h, WALL_T, 0, yb, -HALF_D - WALL_T / 2);                          // north
    b.box(WALL, WALL_T, h, 16, -HALF_W - WALL_T / 2, yb, 0);                            // west
    b.box(WALL, WALL_T, h, 16, HALF_W + WALL_T / 2, yb, 0);                             // east
    if (i === 0) {                                                                      // south, with the door opening
      const half = (12.3 - DOOR_W / 2);
      b.box(WALL, half, h, WALL_T, -(DOOR_W / 2 + half / 2), yb, HALF_D + WALL_T / 2);
      b.box(WALL, half, h, WALL_T, DOOR_W / 2 + half / 2, yb, HALF_D + WALL_T / 2);
      b.box(WALL, DOOR_W, yt - DOOR_H, WALL_T, 0, DOOR_H, HALF_D + WALL_T / 2);
    } else {
      b.box(WALL, 24.6, h, WALL_T, 0, yb, HALF_D + WALL_T / 2);
    }

    // --- skirting boards ---
    b.box(TRIM, 24, 0.18, 0.06, 0, T, -HALF_D + 0.03);
    b.box(TRIM, 0.06, 0.18, 16, -HALF_W + 0.03, T, 0);
    b.box(TRIM, 0.06, 0.18, 16, HALF_W - 0.03, T, 0);
    if (i === 0) {
      b.box(TRIM, 10.8, 0.18, 0.06, -6.6, T, HALF_D - 0.03);
      b.box(TRIM, 10.8, 0.18, 0.06, 6.6, T, HALF_D - 0.03);
    } else {
      b.box(TRIM, 24, 0.18, 0.06, 0, T, HALF_D - 0.03);
    }

    // --- window bands (a frame and a bright glass pane) ---
    const win = (cx, cz, w, wall) => {                  // wall: 'n' | 's' | 'e' | 'w'
      const y = T + 1.3;
      if (wall === 'n' || wall === 's') {
        const z = wall === 'n' ? -HALF_D : HALF_D;
        const dir = wall === 'n' ? 1 : -1;
        b.box(TRIM, w + 0.3, 1.8, 0.04, cx, y - 0.15, z + dir * 0.02);
        b.box(GLASS, w, 1.5, 0.06, cx, y, z + dir * 0.03);
        b.box(TRIM, 0.06, 1.5, 0.08, cx, y, z + dir * 0.05);
      } else {
        const x = wall === 'w' ? -HALF_W : HALF_W;
        const dir = wall === 'w' ? 1 : -1;
        b.box(TRIM, 0.04, 1.8, w + 0.3, x + dir * 0.02, y - 0.15, cz);
        b.box(GLASS, 0.06, 1.5, w, x + dir * 0.03, y, cz);
        b.box(TRIM, 0.08, 1.5, 0.06, x + dir * 0.05, y, cz);
      }
    };
    [-9.6, -4.8, 0, 4.8, 9.6].forEach((x) => win(x, 0, 3.2, 'n'));
    [-9.6, -4.8, 4.8, 9.6].forEach((x) => win(x, 0, 3.2, 's'));
    [['w', false], ['e', true]].forEach(([wall, east]) => {
      [-6.2, 6.2].forEach((z) => win(0, z, 2.4, wall));
      if (!stairOnSide(plan, i, east)) win(0, 0, 3.2, wall);
    });

    // --- the door (ground floor) ---
    if (i === 0) {
      b.box(TRIM, 0.2, DOOR_H, 0.4, -DOOR_W / 2 - 0.1, 0, HALF_D);
      b.box(TRIM, 0.2, DOOR_H, 0.4, DOOR_W / 2 + 0.1, 0, HALF_D);
      b.box(TRIM, DOOR_W + 0.4, 0.2, 0.4, 0, DOOR_H, HALF_D);
      b.box(0x8a3b2e, DOOR_W, 0.03, 1.2, 0, 0, HALF_D - 0.9);                          // doormat
    }
  });

  // --- the roof slab of the top floor (its underside is the ceiling) ---
  const tl = plan.floors[last].top;
  b.box(CEIL, 24, SLAB, 16, 0, tl + CLEAR, 0);
}

// One flight of stairs (from floor `k` up to floor `k + 1`): solid steps, a solid side wall and
// railings round the opening on the floor above. (Walking is done by the ramp in the plan.)
export function addStairs(b, plan, k, opts = {}) {
  const st = plan.stairs[k];
  if (!st) return;
  const BODY = opts.stair === undefined ? 0x9c7a55 : opts.stair;
  const TREAD = opts.tread === undefined ? 0xc9a577 : opts.tread;
  const TRIM = opts.trim === undefined ? 0x6e4f33 : opts.trim;
  const { ramp } = st;
  const cx = (ramp.x0 + ramp.x1) / 2;
  const sx = st.east ? ramp.x0 - 0.06 : ramp.x1 + 0.06;

  for (let i = 0; i < STEPS; i++) {
    const s = stepInfo(st, i);
    const cz = (s.zA + s.zB) / 2;
    b.box(BODY, STAIR_W, s.top - ramp.from, 0.4, cx, ramp.from, cz);                 // the step (solid down to the floor)
    b.box(TREAD, STAIR_W - 0.02, 0.03, 0.42, cx, s.top - 0.01, cz);                  // its lighter top
    b.box(TRIM, 0.12, s.top + 1.0 - ramp.from, 0.4, sx, ramp.from, cz);              // the solid side wall
  }

  // Railings round the opening on the upper floor.
  const T = ramp.to;
  const rail = (x0, x1, z0, z1) => {
    const alongZ = (z1 - z0) > (x1 - x0);
    const len = alongZ ? z1 - z0 : x1 - x0;
    const mx = (x0 + x1) / 2;
    const mz = (z0 + z1) / 2;
    if (alongZ) {
      b.box(TRIM, 0.08, 0.08, len, mx, T + 1.0, mz);
      b.box(TRIM, 0.05, 0.05, len, mx, T + 0.5, mz);
    } else {
      b.box(TRIM, len, 0.08, 0.08, mx, T + 1.0, mz);
      b.box(TRIM, len, 0.05, 0.05, mx, T + 0.5, mz);
    }
    const n = Math.max(1, Math.round(len / 1.0));
    for (let i = 0; i <= n; i++) {
      const t = -len / 2 + (len * i) / n;
      if (alongZ) b.box(TRIM, 0.06, 1.0, 0.06, mx, T, mz + t);
      else b.box(TRIM, 0.06, 1.0, 0.06, mx + t, T, mz);
    }
  };
  if (st.east) {
    rail(ramp.x0 - 0.05, ramp.x0 - 0.05, -4, 4);
    rail(ramp.x0, ramp.x1, 4.05, 4.05);
  } else {
    rail(ramp.x1 + 0.05, ramp.x1 + 0.05, -4, 4);
    rail(ramp.x0, ramp.x1, -4.05, -4.05);
  }
}

// A piece of furniture you cannot walk through. (cx, cz) = its middle, w x d on the floor, h tall.
// `lift` raises it off the floor (for things on a shelf).
export function solidBox(b, plan, color, cx, cz, w, d, h, floorIndex = 0, lift = 0) {
  const T = plan.floors[floorIndex].top + lift;
  b.box(color, w, h, d, cx, T, cz);
  plan.blocks.push([cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2, T, T + h]);
}

// A chair or stool you can sit on (press Q). It looks toward the angle `a`
// (a = 0 looks toward +z, the door). Not solid, so you can walk up to it.
export function addChair(b, plan, cx, cz, floorIndex = 0, a = 0, color = 0x8a5a3a) {
  const T = plan.floors[floorIndex].top;
  const s = Math.sin(a);
  const c = Math.cos(a);
  const at = (lx, lz) => [cx + c * lx + s * lz, cz - s * lx + c * lz];
  b.slab(color, 0.5, 0.06, 0.5, cx, T + 0.46, cz, 0, a, 0);                          // seat
  const [bx, bz] = at(0, -0.22);
  b.slab(color, 0.5, 0.5, 0.05, bx, T + 0.74, bz, 0, a, 0);                          // back
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([lx, lz]) => {
    const [x, z] = at(lx, lz);
    b.box(color, 0.05, 0.44, 0.05, x, T, z);                                         // legs
  });
  plan.spots.push({ kind: 'sit', x: cx, y: T + 0.5, z: cz, a });
}

// A single bed you can sleep in (press Z). The head is toward -z when a = 0.
export function addBed(b, plan, cx, cz, floorIndex = 0, a = 0, color = 0x8a5a3a, cover = 0x5b8fc4) {
  const T = plan.floors[floorIndex].top;
  const s = Math.sin(a);
  const c = Math.cos(a);
  const at = (lx, lz) => [cx + c * lx + s * lz, cz - s * lx + c * lz];
  b.slab(color, 1.3, 0.3, 2.1, cx, T + 0.27, cz, 0, a, 0);                           // frame
  b.slab(0xfaf6ee, 1.2, 0.22, 2.0, cx, T + 0.52, cz, 0, a, 0);                       // mattress
  const [qx, qz] = at(0, 0.3);
  b.slab(cover, 1.22, 0.1, 1.4, qx, T + 0.68, qz, 0, a, 0);                          // cover
  const [px, pz] = at(0, -0.8);
  b.slab(0xffffff, 0.8, 0.14, 0.4, px, T + 0.72, pz, 0, a, 0);                       // pillow
  const [hx, hz] = at(0, -1.05);
  b.slab(color, 1.3, 0.9, 0.08, hx, T + 0.45, hz, 0, a, 0);                          // headboard
  const hw = 0.65;
  const hd = 1.05;
  const x0 = Math.min(...[[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([lx, lz]) => at(lx, lz)[0]));
  const x1 = Math.max(...[[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([lx, lz]) => at(lx, lz)[0]));
  const z0 = Math.min(...[[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([lx, lz]) => at(lx, lz)[1]));
  const z1 = Math.max(...[[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([lx, lz]) => at(lx, lz)[1]));
  plan.blocks.push([x0, x1, z0, z1, T, T + 0.8]);
  plan.spots.push({ kind: 'sleep', x: cx, y: T + 0.72, z: cz, a });
}

// Bakes simple shading into the vertex colours, so the rooms do not look flat without any light:
// tops 1.0, front and back faces 0.85, side faces 0.75, undersides 0.55.
export function shadeGeometry(geometry) {
  const n = geometry.attributes.normal;
  const c = geometry.attributes.color;
  for (let i = 0; i < n.count; i++) {
    const nx = n.getX(i);
    const ny = n.getY(i);
    const nz = n.getZ(i);
    let k;
    if (ny > 0.5) k = 1.0;
    else if (ny < -0.5) k = 0.55;
    else k = Math.abs(nz) > Math.abs(nx) ? 0.85 : 0.75;
    c.setXYZ(i, c.getX(i) * k, c.getY(i) * k, c.getZ(i) * k);
  }
  c.needsUpdate = true;
  return geometry;
}
