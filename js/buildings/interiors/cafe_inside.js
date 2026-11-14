################################################################
# FILE: js/buildings/interiors/cafe.js
################################################################
// =====================================================
// INTERIOR: Cafe   (2 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see _common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'serve', label: 'Serve customers', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  shell(b, plan, { floor: 0xc89a63, floorAlt: 0xb98650, wall: 0xf3e6cf, ceiling: 0xfbf6ea, trim: 0x7a4a2a });
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

################################################################
# FILE: js/buildings/interiors/hospital.js
################################################################
// =====================================================
// INTERIOR: Hospital   (3 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see _common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './_common.js';

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

################################################################
# FILE: js/buildings/interiors/farmland.js
################################################################
// =====================================================
// INTERIOR: Barn   (2 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see _common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'milk', label: 'Milk the cows', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  shell(b, plan, { floor: 0x9a6a40, floorAlt: 0x8a5a34, wall: 0x8a5a3a, ceiling: 0x6e4a30, trim: 0x4a2f1c });
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

################################################################
# FILE: js/buildings/interiors/company.js
################################################################
// =====================================================
// INTERIOR: Company   (3 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see _common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './_common.js';

export const plan = makePlan(3);
plan.jobSpots.push({ id: 'desk', label: 'Office desk', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  shell(b, plan, { floor: 0x9aa3ad, floorAlt: 0xb4bcc5, wall: 0xe9edf1, ceiling: 0xf8fafc, trim: 0x3f5f8f });
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

################################################################
# FILE: js/buildings/interiors/school.js
################################################################
// =====================================================
// INTERIOR: School   (2 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see _common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'teach', label: 'Teach the class', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  shell(b, plan, { floor: 0xc9a66b, floorAlt: 0xb89358, wall: 0xf6e7a8, ceiling: 0xfff8dc, trim: 0x8a5a2a });
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

################################################################
# FILE: js/buildings/interiors/park.js
################################################################
// =====================================================
// INTERIOR: Pavilion   (2 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see _common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'garden', label: 'Water the plants', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  shell(b, plan, { floor: 0xb9d29a, floorAlt: 0xa6c485, wall: 0xe9f3dc, ceiling: 0xfbfff5, trim: 0x6a8a4a });
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

################################################################
# FILE: js/buildings/interiors/medical.js
################################################################
// =====================================================
// INTERIOR: Medical shop   (2 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see _common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'counter', label: 'Pharmacist counter', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  shell(b, plan, { floor: 0xdfe9e2, floorAlt: 0xcfdcd3, wall: 0xf2fbf4, ceiling: 0xffffff, trim: 0x4f9a6a });
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

################################################################
# FILE: js/buildings/interiors/food.js
################################################################
// =====================================================
// INTERIOR: Food shop   (2 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see _common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'cashier', label: 'Cashier', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  shell(b, plan, { floor: 0xe0c9a0, floorAlt: 0xd1b88c, wall: 0xfbe3c4, ceiling: 0xfff6e8, trim: 0xd9822b });
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

################################################################
# FILE: js/buildings/interiors/furniture.js
################################################################
// =====================================================
// INTERIOR: Furniture shop   (2 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see _common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'sales', label: 'Sales desk', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  shell(b, plan, { floor: 0xd2ad7c, floorAlt: 0xc29a68, wall: 0xf2e9dc, ceiling: 0xfffaf2, trim: 0x8a5a3a });
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

################################################################
# FILE: js/buildings/interiors/police.js
################################################################
// =====================================================
// INTERIOR: Police station   (2 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see _common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'desk', label: 'Front desk', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  shell(b, plan, { floor: 0x8a94a3, floorAlt: 0x7a8494, wall: 0xdfe5ee, ceiling: 0xf4f7fb, trim: 0x1f3a6e });
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

################################################################
# FILE: js/buildings/interiors/fire.js
################################################################
// =====================================================
// INTERIOR: Fire station   (2 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see _common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'truck', label: 'Clean the truck', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  shell(b, plan, { floor: 0x8e8a86, floorAlt: 0x7e7a76, wall: 0xe9d5cf, ceiling: 0xf8efec, trim: 0xb3382c });
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

################################################################
# FILE: js/buildings/interiors/candy.js
################################################################
// =====================================================
// INTERIOR: Candy shop   (2 floors, joined by stairs)
// PLACEHOLDER. A simple furnished shell so you can already walk up and down.
// Replace this file with the real interior (keep the exports `plan` and `build`).
// Helpers (see _common.js): makePlan, shell, addStairs, solidBox, addChair, addBed.
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed } from './_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'sell', label: 'Sell candy', x: 0, z: -5.2, floor: 0 });

export function build(b, c) {
  shell(b, plan, { floor: 0xf5d7e3, floorAlt: 0xe9c4d4, wall: 0xfde8f0, ceiling: 0xfffafc, trim: 0xd96a97 });
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
