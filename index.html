// =====================================================
// CIVIC BUILDINGS: the big town buildings that stand next to the houses.
// Each building lives in its own file in this folder, so different people can
// work on different buildings without touching each other's code.
// main.js calls createBuildings(ctx) once, the same way it calls createPets(ctx).
// =====================================================
import * as THREE from 'three';
import * as cafe from './cafe.js';
import * as hospital from './hospital.js';
import * as farmland from './farmland.js';
import * as company from './company.js';
import * as school from './school.js';
import * as park from './park.js';
import * as medical from './medical.js';
import * as food from './food.js';
import * as furniture from './furniture.js';
import * as police from './police.js';
import * as fire from './fire.js';
import * as candy from './candy.js';

// The inside of each building (see interiors/_common.js for how an interior is described).
import * as cafeIn from './interiors/cafe.js';
import * as hospitalIn from './interiors/hospital.js';
import * as farmlandIn from './interiors/farmland.js';
import * as companyIn from './interiors/company.js';
import * as schoolIn from './interiors/school.js';
import * as parkIn from './interiors/park.js';
import * as medicalIn from './interiors/medical.js';
import * as foodIn from './interiors/food.js';
import * as furnitureIn from './interiors/furniture.js';
import * as policeIn from './interiors/police.js';
import * as fireIn from './interiors/fire.js';
import * as candyIn from './interiors/candy.js';
import { shadeGeometry } from './interiors/_common.js';

// THE LIST. Each entry: id, name, cell (the plot-grid column gx and row gz it stands on), its outside
// (module) and its inside (interior).
// main.js leaves these 12 cells free of houses (it reads this list before it makes the plots).
export const BUILDINGS = [
  { id: 'cafe',      name: 'Cafe',           cell: { gx: 0,  gz: 1 },  module: cafe, interior: cafeIn },
  { id: 'hospital',  name: 'Hospital',       cell: { gx: -1, gz: -2 }, module: hospital, interior: hospitalIn },
  { id: 'farmland',  name: 'Farmland',       cell: { gx: -2, gz: -2 }, module: farmland, interior: farmlandIn },
  { id: 'company',   name: 'Company',        cell: { gx: 1,  gz: -2 }, module: company, interior: companyIn },
  { id: 'school',    name: 'School',         cell: { gx: -2, gz: -1 }, module: school, interior: schoolIn },
  { id: 'park',      name: 'Park',           cell: { gx: -2, gz: 0 },  module: park, interior: parkIn },
  { id: 'medical',   name: 'Medical Store',  cell: { gx: 0,  gz: -2 }, module: medical, interior: medicalIn },
  { id: 'food',      name: 'Food Store',     cell: { gx: -1, gz: 1 },  module: food, interior: foodIn },
  { id: 'furniture', name: 'Furniture Shop', cell: { gx: -2, gz: 1 },  module: furniture, interior: furnitureIn },
  { id: 'police',    name: 'Police Station', cell: { gx: 1,  gz: -1 }, module: police, interior: policeIn },
  { id: 'fire',      name: 'Fire Station',   cell: { gx: 1,  gz: 0 },  module: fire, interior: fireIn },
  { id: 'candy',     name: 'Candy Shop',     cell: { gx: 1,  gz: 1 },  module: candy, interior: candyIn }
];

const PAD_BORDER = 0xa8a294;   // the darker stone edge of the lot
const PAD_STONE = 0xc9c2b4;    // the paved lot
const SIGN_W = 10;             // the sign board is 10 x 2.5 m (the canvas is 512 x 128, the same 4 : 1)
const SIGN_H = 2.5;
const FAR_DISTANCE = 1200;     // buildings farther away than this are not drawn (the same limit as the houses)

// The sign board: cream with brown letters, like the sign on the Sunny Cafe booth.
function makeSignTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const g = canvas.getContext('2d');
  g.fillStyle = '#fff1d0';
  g.fillRect(0, 0, 512, 128);
  g.strokeStyle = '#7a3b22';
  g.lineWidth = 8;
  g.strokeRect(4, 4, 504, 120);
  g.fillStyle = '#7a3b22';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  let size = 64;
  g.font = `bold ${size}px sans-serif`;
  while (g.measureText(text).width > 470 && size > 20) {   // long words get smaller letters
    size -= 2;
    g.font = `bold ${size}px sans-serif`;
  }
  g.fillText(text, 256, 68);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// ctx (given by main.js):
//   scene        : the Three.js scene
//   makeBuilder  : the shape builder (joins many parts into ONE coloured shape)
//   plotPitch    : distance between plot centres (36 m)
//   plotSize     : the lot size (24 m)
//   ground       : the ground height of a lot (0.1 m)
//   facingFor    : (x, z) -> the direction the door looks (the same rule the houses use)
//   helpers      : small drawing helpers (frontWindow, sideWindow, fenceX, fenceZ, flowerBed, bush, makeRng)
export function createBuildings(ctx) {
  const { scene, makeBuilder, plotPitch, plotSize, ground, facingFor } = ctx;
  const buildCtx = Object.freeze(Object.assign({ G: ground }, ctx.helpers || {}));

  const material = new THREE.MeshLambertMaterial({ vertexColors: true });   // ONE material for all buildings
  const signGeo = new THREE.PlaneGeometry(SIGN_W, SIGN_H);
  const items = [];
  const byId = new Map();

  // ---------- The insides ----------
  // Each interior is built far away from the town (x = 8000 + 100 x the building's number, z = 0), the
  // same trick the house interiors use (they are at x = 5000 and up). The floors are stacked in height.
  // Every floor is its OWN mesh, and only the floor you are on and the ones directly above and below
  // it are drawn.
  const interiorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false });
  const interiors = new Map();

  // Cuts a building's geometry into one geometry per floor, by the height of every triangle.
  // A floor's part starts 0.5 m under its floor top (where its slab starts).
  function splitByFloor(geometry, plan) {
    const pos = geometry.attributes.position.array;
    const nor = geometry.attributes.normal.array;
    const col = geometry.attributes.color.array;
    const starts = plan.floors.map((f) => f.top - 0.5);
    const parts = plan.floors.map(() => ({ p: [], n: [], c: [] }));
    for (let t = 0; t < pos.length / 9; t++) {
      const cy = (pos[t * 9 + 1] + pos[t * 9 + 4] + pos[t * 9 + 7]) / 3;
      let f = 0;
      for (let i = 1; i < starts.length; i++) if (cy >= starts[i] - 1e-4) f = i;
      for (let k = 0; k < 9; k++) {
        parts[f].p.push(pos[t * 9 + k]);
        parts[f].n.push(nor[t * 9 + k]);
        parts[f].c.push(col[t * 9 + k]);
      }
    }
    return parts.map((part) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(part.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(part.n, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(part.c, 3));
      return g;
    });
  }

  // Builds the inside of a building the first time it is needed. Returns null if it cannot be built.
  //   { id, plan, x, z, group, show(floorIndex), hide() }
  function getBuildingInterior(id) {
    if (interiors.has(id)) return interiors.get(id);
    const index = BUILDINGS.findIndex((e) => e.id === id);
    const mod = index < 0 ? null : BUILDINGS[index].interior;
    if (!mod || !mod.plan || typeof mod.build !== 'function') return null;

    let room = null;
    try {
      const b = makeBuilder();
      mod.build(b, { G: 0 });
      const geometry = shadeGeometry(b.build());
      const plan = mod.plan;
      const ox = 8000 + 100 * index;
      const group = new THREE.Group();
      group.position.set(ox, 0, 0);
      const floors = splitByFloor(geometry, plan).map((g) => {
        const mesh = new THREE.Mesh(g, interiorMaterial);
        group.add(mesh);
        return mesh;
      });
      geometry.dispose();
      group.visible = false;
      scene.add(group);
      room = {
        id,
        plan,
        x: ox,
        z: 0,
        group,
        show(floorIndex) {                       // the floor you are on, and the ones right above and below
          group.visible = true;
          floors.forEach((m, i) => { m.visible = Math.abs(i - floorIndex) <= 1; });
        },
        hide() { group.visible = false; }
      };
    } catch (err) {
      console.warn(`Interior \"${id}\" could not be built:`, err);
    }
    interiors.set(id, room);
    return room;
  }

  BUILDINGS.forEach((entry) => {
    const mod = entry.module;
    const info = mod.info || {};
    const x = (entry.cell.gx + 0.5) * plotPitch;
    const z = (entry.cell.gz + 0.5) * plotPitch;
    const facing = facingFor(x, z);

    // ONE builder = ONE merged, vertex-coloured shape for the whole building.
    const b = makeBuilder();
    b.box(PAD_BORDER, plotSize, ground * 0.7, plotSize, 0, 0, 0);                    // paved lot, edge
    b.box(PAD_STONE, plotSize - 1, ground, plotSize - 1, 0, 0, 0);                    // paved lot, top
    let collide = info.collide || {};
    try {
      mod.build(b, buildCtx);
    } catch (err) {
      // A broken building file must never stop the game: show only the empty lot.
      console.warn(`Building "${entry.id}" could not be drawn:`, err);
      collide = {};
    }

    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = facing;

    const body = new THREE.Mesh(b.build(), material);
    group.add(body);

    const sign = new THREE.Mesh(signGeo, new THREE.MeshBasicMaterial({ map: makeSignTexture(info.sign || entry.name.toUpperCase()) }));
    sign.position.set(0, info.signY === undefined ? 6 : info.signY, 0.1);
    group.add(sign);

    scene.add(group);

    const item = {
      id: entry.id,
      name: info.name || entry.name,
      gx: entry.cell.gx,
      gz: entry.cell.gz,
      x,
      z,
      facing,
      door: info.door || { x: 0, z: 1.5 },
      collide: { boxes: collide.boxes || [], round: collide.round || [] },
      group
    };
    items.push(item);
    byId.set(item.id, item);
  });

  return {
    items,
    byId,
    getBuildingInterior,
    // Called a few times a second: hides every building while you are inside a house (or far away).
    update(playerX, playerZ, outdoors) {
      items.forEach((item) => {
        item.group.visible = outdoors && Math.hypot(item.x - playerX, item.z - playerZ) < FAR_DISTANCE;
      });
    }
  };
}
