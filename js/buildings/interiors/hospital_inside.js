// =====================================================
// INTERIOR: Hospital   (3 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see inside_common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './inside_common.js';

export const plan = makePlan(3);
plan.jobSpots.push({ id: 'reception', label: 'Reception desk', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  shell(b, plan, { floor: 0xcfe3ee, floorAlt: 0xe4f0f6, wall: 0xf6fafc, ceiling: 0xffffff, trim: 0x5b8fb5 });
  for (let k = 0; k < plan.stairs.length; k++) addStairs(b, plan, k);

  // Ground floor: a table with two chairs.
  solidBox(b, plan, 0x8a5a3a, 0, -3, 2.6, 1.2, 0.8, 0);
  addChair(b, plan, -0.8, -1.7, 0, Math.PI, 0x6e4f33);
  addChair(b, plan, 0.8, -1.7, 0, Math.PI, 0x6e4f33);

  // Floor 1: a table, a chair and a bed (to test sitting and sleeping upstairs).
  solidBox(b, plan, 0x8a5a3a, 0, -3, 2.6, 1.2, 0.8, 1);
  addChair(b, plan, 0, -1.7, 1, Math.PI, 0x6e4f33);
  addBed(b, plan, -5, 5.2, 1, 0);
}
