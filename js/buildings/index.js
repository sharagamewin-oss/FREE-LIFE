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

// THE LIST. Each entry: id, name, cell (the plot-grid column gx and row gz it stands on), and its module.
// main.js leaves these 12 cells free of houses (it reads this list before it makes the plots).
export const BUILDINGS = [
  { id: 'cafe',      name: 'Cafe',           cell: { gx: 0,  gz: 1 },  module: cafe },
  { id: 'hospital',  name: 'Hospital',       cell: { gx: -1, gz: -2 }, module: hospital },
  { id: 'farmland',  name: 'Farmland',       cell: { gx: -2, gz: -2 }, module: farmland },
  { id: 'company',   name: 'Company',        cell: { gx: 1,  gz: -2 }, module: company },
  { id: 'school',    name: 'School',         cell: { gx: -2, gz: -1 }, module: school },
  { id: 'park',      name: 'Park',           cell: { gx: -2, gz: 0 },  module: park },
  { id: 'medical',   name: 'Medical Store',  cell: { gx: 0,  gz: -2 }, module: medical },
  { id: 'food',      name: 'Food Store',     cell: { gx: -1, gz: 1 },  module: food },
  { id: 'furniture', name: 'Furniture Shop', cell: { gx: -2, gz: 1 },  module: furniture },
  { id: 'police',    name: 'Police Station', cell: { gx: 1,  gz: -1 }, module: police },
  { id: 'fire',      name: 'Fire Station',   cell: { gx: 1,  gz: 0 },  module: fire },
  { id: 'candy',     name: 'Candy Shop',     cell: { gx: 1,  gz: 1 },  module: candy }
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
    // Called a few times a second: hides every building while you are inside a house (or far away).
    update(playerX, playerZ, outdoors) {
      items.forEach((item) => {
        item.group.visible = outdoors && Math.hypot(item.x - playerX, item.z - playerZ) < FAR_DISTANCE;
      });
    }
  };
}
