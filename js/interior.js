// =====================================================
// FREE LIFE - js/interior.js
// Realistic furnished rooms for the four house styles.
//
// How it stays fast on phones:
//  1. Textures (wood, plaster, brick, fabric...) are DRAWN by the browser, so no image files.
//  2. The light is "baked": when a room is built, we work out once how bright every
//     point is (lamps, windows, sunlight patches, soft shadows) and store it in the
//     shape's colours. While you play, the room costs almost nothing.
// =====================================================
import * as THREE from 'three';

// Same size as before, so walking, the door and the walls keep working.
export const ROOM = { halfW: 7, halfD: 5, height: 3.6 };
const HW = ROOM.halfW;
const HD = ROOM.halfD;
const H = ROOM.height;

// =====================================================
// 1. SMALL HELPERS
// =====================================================
function rng(seed) {                       // a repeatable "random" so rooms look the same every time
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const linCache = new Map();
function hex(c) {                          // 0xRRGGBB -> [r,g,b] in the light-correct colour space
  let r = linCache.get(c);
  if (!r) {
    r = [toLinear(((c >> 16) & 255) / 255), toLinear(((c >> 8) & 255) / 255), toLinear((c & 255) / 255)];
    linCache.set(c, r);
  }
  return r;
}
function css(c, a = 1) { return `rgba(${(c >> 16) & 255},${(c >> 8) & 255},${c & 255},${a})`; }
function scaleHex(c, k) {                  // make a colour lighter (k > 1) or darker (k < 1)
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255);
}

// =====================================================
// 2. TEXTURE PAINTERS (each draws on a small canvas that repeats seamlessly)
// =====================================================
function wrapDraw(S, x, y, r, fn) {        // draw a blob again on the other side of the edge, so tiles join up
  for (const ox of [-S, 0, S]) {
    for (const oy of [-S, 0, S]) {
      if (x + ox + r < 0 || x + ox - r > S || y + oy + r < 0 || y + oy - r > S) continue;
      fn(x + ox, y + oy);
    }
  }
}

function paintPlanks(ctx, S, rnd, cols, rows) {            // wooden floor boards
  const ph = S / rows;
  ctx.fillStyle = css(cols[0]);
  ctx.fillRect(0, 0, S, S);
  for (let r = 0; r < rows; r++) {
    const nb = 2 + ((rnd() * 2) | 0);
    const cuts = [0];
    for (let i = 1; i < nb; i++) cuts.push((S * (i + (rnd() - 0.5) * 0.6)) / nb);
    cuts.push(S);
    for (let b = 0; b < nb; b++) {
      const x0 = cuts[b];
      const x1 = cuts[b + 1];
      const y0 = r * ph;
      ctx.fillStyle = css(scaleHex(cols[(rnd() * cols.length) | 0], 0.93 + rnd() * 0.14));
      ctx.fillRect(x0, y0, x1 - x0, ph);
      for (let k = 0; k < 9; k++) {                          // wood grain
        ctx.fillStyle = rnd() < 0.5 ? `rgba(40,20,5,${0.04 + rnd() * 0.07})` : `rgba(255,240,210,${0.03 + rnd() * 0.05})`;
        ctx.fillRect(x0, y0 + rnd() * ph, x1 - x0, 1 + rnd() * 1.6);
      }
      ctx.fillStyle = 'rgba(25,12,4,0.6)';                   // end joint
      ctx.fillRect(x0, y0, 1.6, ph);
      if (rnd() < 0.18) {                                    // a knot
        const kx = x0 + 14 + rnd() * Math.max(1, x1 - x0 - 28);
        ctx.fillStyle = 'rgba(60,30,10,0.35)';
        ctx.beginPath(); ctx.ellipse(kx, y0 + ph / 2, 4, 2.2, 0, 0, 7); ctx.fill();
      }
    }
    ctx.fillStyle = 'rgba(25,12,4,0.65)';                    // gap between rows
    ctx.fillRect(0, r * ph, S, 1.6);
  }
}

function paintTiles(ctx, S, rnd, base) {                   // big stone tiles with thin grout
  const n = 2;
  const t = S / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      ctx.fillStyle = css(scaleHex(base, 0.94 + rnd() * 0.1));
      ctx.fillRect(i * t, j * t, t, t);
      for (let k = 0; k < 60; k++) {
        ctx.fillStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '60,55,50'},${0.03 + rnd() * 0.05})`;
        ctx.fillRect(i * t + rnd() * t, j * t + rnd() * t, 2 + rnd() * 18, 1 + rnd() * 2);
      }
    }
  }
  ctx.fillStyle = 'rgba(70,66,60,0.75)';
  for (let i = 0; i < n; i++) { ctx.fillRect(i * t - 1, 0, 3, S); ctx.fillRect(0, i * t - 1, S, 3); }
}

function paintPlaster(ctx, S, rnd) {                       // soft painted wall (colour comes from the shape)
  ctx.fillStyle = '#f7f6f3';
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 40; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    const r = 20 + rnd() * 50;
    const c = rnd() < 0.5 ? '0,0,0' : '255,255,255';
    wrapDraw(S, x, y, r, (px, py) => {
      ctx.fillStyle = `rgba(${c},${0.006 + rnd() * 0.01})`;
      ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill();
    });
  }
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = `rgba(0,0,0,${rnd() * 0.03})`;
    ctx.fillRect(rnd() * S, rnd() * S, 1, 1);
  }
}

function paintWallBoards(ctx, S, rnd) {                    // upright wooden boards (treehouse walls)
  const n = 8;
  const w = S / n;
  for (let i = 0; i < n; i++) {
    const v = 205 + ((rnd() * 40) | 0);
    ctx.fillStyle = `rgb(${v},${v - 6},${v - 14})`;
    ctx.fillRect(i * w, 0, w, S);
    for (let k = 0; k < 14; k++) {
      ctx.fillStyle = `rgba(60,35,10,${0.04 + rnd() * 0.07})`;
      ctx.fillRect(i * w + rnd() * w, 0, 1 + rnd() * 1.4, S);
    }
    ctx.fillStyle = 'rgba(30,15,5,0.7)';
    ctx.fillRect(i * w, 0, 2, S);
    ctx.fillStyle = 'rgba(40,30,20,0.5)';
    ctx.fillRect(i * w + w / 2, 20, 2, 2);
    ctx.fillRect(i * w + w / 2, S - 20, 2, 2);
  }
}

function paintStripes(ctx, S, rnd) {                       // soft wallpaper stripes
  ctx.fillStyle = '#f6f2e8';
  ctx.fillRect(0, 0, S, S);
  const n = 8;
  const w = S / n;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = 'rgba(120,70,40,0.10)';
    ctx.fillRect(i * w, 0, w / 2, S);
    ctx.fillStyle = 'rgba(120,70,40,0.22)';
    ctx.fillRect(i * w + w / 2 - 1, 0, 2, S);
    for (let y = 16; y < S; y += 32) {                      // a tiny diamond between stripes
      ctx.fillStyle = 'rgba(120,70,40,0.14)';
      ctx.beginPath();
      ctx.moveTo(i * w + w * 0.75, y - 4); ctx.lineTo(i * w + w * 0.75 + 3, y);
      ctx.lineTo(i * w + w * 0.75, y + 4); ctx.lineTo(i * w + w * 0.75 - 3, y); ctx.fill();
    }
  }
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = `rgba(0,0,0,${rnd() * 0.04})`;
    ctx.fillRect(rnd() * S, rnd() * S, 1, 1);
  }
}

function paintWoodGrain(ctx, S, rnd) {                     // furniture wood (colour comes from the shape)
  ctx.fillStyle = '#ececec';
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 70; i++) {
    const y = rnd() * S;
    const amp = 1 + rnd() * 3;
    const cyc = 1 + ((rnd() * 3) | 0);
    const ph = rnd() * 6.28;
    ctx.strokeStyle = rnd() < 0.7 ? `rgba(70,40,15,${0.06 + rnd() * 0.12})` : `rgba(255,255,255,${0.1 + rnd() * 0.1})`;
    ctx.lineWidth = 0.8 + rnd() * 1.8;
    ctx.beginPath();
    for (let x = 0; x <= S; x += 8) {
      const yy = y + Math.sin((x / S) * 6.283 * cyc + ph) * amp;
      if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
}

function paintFabric(ctx, S, rnd) {                        // woven cloth (colour comes from the shape)
  ctx.fillStyle = '#efefef';
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < S; i += 2) {
    ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(i, 0, 1, S);
    ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, i, S, 1);
  }
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = `rgba(255,255,255,${rnd() * 0.18})`;
    ctx.fillRect(rnd() * S, rnd() * S, 1, 1);
  }
}

function paintStone(ctx, S, rnd) {                         // fireplace stones with mortar
  ctx.fillStyle = '#8f8b84';
  ctx.fillRect(0, 0, S, S);
  const rows = 8;
  const h = S / rows;
  for (let r = 0; r < rows; r++) {
    let x = -rnd() * 30;
    while (x < S) {
      const w = 28 + rnd() * 36;
      const v = 175 + ((rnd() * 60) | 0);
      ctx.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
      ctx.fillRect(x + 2, r * h + 2, w - 4, h - 4);
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(x + 2, r * h + h * 0.6, w - 4, h * 0.35 - 2);
      x += w;
    }
  }
}

function paintRug(ctx, S, rnd, a, b, c, round) {           // a woven rug with a border
  ctx.fillStyle = css(a);
  ctx.fillRect(0, 0, S, S);
  if (round) {
    [0.48, 0.4, 0.3, 0.16].forEach((r, i) => {
      ctx.strokeStyle = css([b, a, c, b][i]);
      ctx.lineWidth = i === 0 ? 10 : 6;
      ctx.beginPath(); ctx.arc(S / 2, S / 2, r * S, 0, 7); ctx.stroke();
    });
  } else {
    ctx.strokeStyle = css(b); ctx.lineWidth = 12; ctx.strokeRect(14, 14, S - 28, S - 28);
    ctx.strokeStyle = css(c); ctx.lineWidth = 4; ctx.strokeRect(30, 30, S - 60, S - 60);
    ctx.fillStyle = css(b);
    ctx.beginPath();
    ctx.moveTo(S / 2, S * 0.28); ctx.lineTo(S * 0.72, S / 2); ctx.lineTo(S / 2, S * 0.72); ctx.lineTo(S * 0.28, S / 2); ctx.fill();
    ctx.fillStyle = css(c);
    ctx.beginPath();
    ctx.moveTo(S / 2, S * 0.4); ctx.lineTo(S * 0.6, S / 2); ctx.lineTo(S / 2, S * 0.6); ctx.lineTo(S * 0.4, S / 2); ctx.fill();
  }
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '255,255,255'},${rnd() * 0.08})`;
    ctx.fillRect(rnd() * S, rnd() * S, 2, 1);
  }
}

function paintView(ctx, S, rnd) {                          // what you see through a window
  const sky = ctx.createLinearGradient(0, 0, 0, S);
  sky.addColorStop(0, '#6db3ea');
  sky.addColorStop(0.55, '#cfe8f7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 4; i++) {
    const x = rnd() * S;
    const y = 20 + rnd() * 70;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(x + k * 18, y + (k % 2) * 4, 24, 11, 0, 0, 7); ctx.fill(); }
  }
  [['#a3cf82', 0.62, 9], ['#7fb862', 0.72, 6]].forEach(([c, base, amp]) => {
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.moveTo(0, S);
    for (let x = 0; x <= S; x += 8) ctx.lineTo(x, S * base + Math.sin(x * 0.03 + base * 9) * amp);
    ctx.lineTo(S, S); ctx.fill();
  });
  for (let i = 0; i < 9; i++) {                            // distant trees
    const x = rnd() * S;
    const y = S * 0.7 + rnd() * 14;
    ctx.fillStyle = '#5a9a4c';
    ctx.beginPath(); ctx.arc(x, y, 9 + rnd() * 7, 0, 7); ctx.fill();
  }
  ctx.fillStyle = '#9fd46c';
  ctx.fillRect(0, S * 0.84, S, S);
  const glare = ctx.createRadialGradient(S * 0.8, S * 0.05, 5, S * 0.8, S * 0.05, S * 0.7);
  glare.addColorStop(0, 'rgba(255,250,225,0.65)');
  glare.addColorStop(1, 'rgba(255,250,225,0)');
  ctx.fillStyle = glare;
  ctx.fillRect(0, 0, S, S);
}

// =====================================================
// 3. THE THEMES (colours and materials of the four styles)
// =====================================================
const THEMES = {
  cottage: {
    wall: 0xf3dcc0, ceil: 0xf8ecd9, trim: 0xfff4e0, wallTex: 'plaster',
    floor: { kind: 'planks', cols: [0xc89a63, 0xb98650, 0xd2a671], rows: 8 },
    wood: 0xc99560, dark: 0x7a5237, sofa: 0xd49a84, accent: 0xc96f5a, green: 0x6f9a6a,
    curtain: 0xf4d8c0, door: 0x9a6a46, cab: 0xf2e4d0, top: 0xd9b98a, stone: 0xd8c4a0,
    rug: [0xefd9bd, 0xc96f5a, 0x6f9a6a], round: false
  },
  treehouse: {
    wall: 0xd9a566, ceil: 0xc99560, trim: 0xb98a5a, wallTex: 'boards',
    floor: { kind: 'planks', cols: [0xa8764a, 0x9a6a40, 0xb4834f], rows: 5 },
    wood: 0xb98a5a, dark: 0x6a4428, sofa: 0x7fa86a, accent: 0xe0a64a, green: 0x5f9a50,
    curtain: 0xe8dcb8, door: 0x8a5a3a, cab: 0xc99560, top: 0xe0c89a, stone: 0x9a9288,
    rug: [0xe9d9a8, 0x7fa86a, 0xc96f5a], round: true
  },
  modern: {
    wall: 0xf1eee8, ceil: 0xfafafa, trim: 0xffffff, wallTex: 'plaster',
    floor: { kind: 'tiles', base: 0xd8d4cc },
    wood: 0xd7b98e, dark: 0x3d3a38, sofa: 0x5a6470, accent: 0x3f8f8a, green: 0x5aa05a,
    curtain: 0xe6e2da, door: 0x3f8f8a, cab: 0xeeeeee, top: 0x4a4440, stone: 0xb9b4ac,
    rug: [0xe4e0d8, 0x3f8f8a, 0x9aa5ad], round: false
  },
  traditional: {
    wall: 0xe6c9a4, ceil: 0xf6ecdc, trim: 0xfff4e0, wallTex: 'stripes',
    floor: { kind: 'planks', cols: [0x7a4a2c, 0x6c4026, 0x865434], rows: 10 },
    wood: 0x8a5a3a, dark: 0x4f2f1c, sofa: 0x9b3a32, accent: 0x8d3b32, green: 0x5f8a58,
    curtain: 0xc9a06a, door: 0x6c3a28, cab: 0xf0e6d4, top: 0xe8e2d6, stone: 0xcfc3ae,
    rug: [0xe9d6b4, 0x8d3b32, 0x2f5a6a], round: false
  }
};

// =====================================================
// 4. THE SHAPE BOOK-KEEPER ("Surf" = all the pieces that share one material)
// =====================================================
let T = { a: 0, c: 1, s: 0, x: 0, z: 0 };   // where the piece being built is placed in the room
let R = null;                               // the room being built

class Surf {
  constructor(name, o = {}) {
    this.name = name;
    this.bake = o.bake !== false;           // false = glows by itself (lamp shades, flames, windows)
    this.occlude = o.occlude !== false;     // false = does not cast shadows
    this.uvMode = o.uvMode || 'world';
    this.tex = o.tex || null;
    this.vertexColors = o.vertexColors !== false;
    this.pos = []; this.nor = []; this.uv = []; this.col = []; this.idx = [];
    this.rug = null;
  }

  vert(x, y, z, nx, ny, nz, rgb, uvr) {
    const wx = T.c * x + T.s * z + T.x;
    const wz = -T.s * x + T.c * z + T.z;
    const wnx = T.c * nx + T.s * nz;
    const wnz = -T.s * nx + T.c * nz;
    this.pos.push(wx, y, wz);
    this.nor.push(wnx, ny, wnz);
    this.col.push(rgb[0], rgb[1], rgb[2]);
    if (uvr) {
      this.uv.push(uvr[0], uvr[1]);
    } else if (this.uvMode === 'rug') {
      this.uv.push((wx - this.rug.cx) / this.rug.w + 0.5, (wz - this.rug.cz) / this.rug.d + 0.5);
    } else {
      const m = this.tex ? this.tex.m : 1;
      const ax = Math.abs(wnx);
      const ay = Math.abs(ny);
      const az = Math.abs(wnz);
      if (ay >= ax && ay >= az) this.uv.push(wx / m, wz / m);
      else if (ax >= az) this.uv.push(wz / m, y / m);
      else this.uv.push(wx / m, y / m);
    }
    return this.pos.length / 3 - 1;
  }

  tri(a, b, c) {                             // add a triangle, turned the right way round
    const p = this.pos;
    const n = this.nor;
    const ux = p[b * 3] - p[a * 3], uy = p[b * 3 + 1] - p[a * 3 + 1], uz = p[b * 3 + 2] - p[a * 3 + 2];
    const vx = p[c * 3] - p[a * 3], vy = p[c * 3 + 1] - p[a * 3 + 1], vz = p[c * 3 + 2] - p[a * 3 + 2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    const dot = cx * (n[a * 3] + n[b * 3] + n[c * 3]) + cy * (n[a * 3 + 1] + n[b * 3 + 1] + n[c * 3 + 1]) +
      cz * (n[a * 3 + 2] + n[b * 3 + 2] + n[c * 3 + 2]);
    if (dot >= 0) this.idx.push(a, b, c); else this.idx.push(a, c, b);
  }
}

// ---------- basic shapes ----------
// A flat sheet (cut into small squares so the light can vary smoothly across it).
function face(s, c, px, py, pz, ux, uy, uz, vx, vy, vz, nx, ny, nz, nu = 1, nv = 1, uvr) {
  const base = s.pos.length / 3;
  for (let j = 0; j <= nv; j++) {
    for (let i = 0; i <= nu; i++) {
      const fu = i / nu;
      const fv = j / nv;
      s.vert(px + ux * fu + vx * fv, py + uy * fu + vy * fv, pz + uz * fu + vz * fv, nx, ny, nz, c,
        uvr ? [uvr[0] + (uvr[2] - uvr[0]) * fu, uvr[1] + (uvr[3] - uvr[1]) * fv] : null);
    }
  }
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      const a = base + j * (nu + 1) + i;
      s.tri(a, a + 1, a + nu + 1);
      s.tri(a + 1, a + nu + 2, a + nu + 1);
    }
  }
}

function addOcc(s, xs, ys, zs) {             // remember a solid box so it can cast shadows
  if (!s.occlude) return;
  const pts = [];
  xs.forEach((x) => zs.forEach((z) => pts.push([T.c * x + T.s * z + T.x, -T.s * x + T.c * z + T.z])));
  const b = [
    Math.min(...pts.map((p) => p[0])), ys[0], Math.min(...pts.map((p) => p[1])),
    Math.max(...pts.map((p) => p[0])), ys[1], Math.max(...pts.map((p) => p[1]))
  ];
  R.occ.push(b);
}

// A box. (x, z) = middle, y = bottom. noOcc = does not cast shadows (thin trim, books...).
function box(g, col, w, h, d, x, y, z, noOcc) {
  const s = R.g[g];
  const c = hex(col);
  const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2, y1 = y + h;
  face(s, c, x0, y1, z0, w, 0, 0, 0, 0, d, 0, 1, 0);
  face(s, c, x0, y, z1, w, 0, 0, 0, h, 0, 0, 0, 1);
  face(s, c, x1, y, z0, 0, 0, d, 0, h, 0, 1, 0, 0);
  face(s, c, x0, y, z0, 0, 0, d, 0, h, 0, -1, 0, 0);
  face(s, c, x0, y, z0, w, 0, 0, 0, h, 0, 0, 0, -1);
  if (y > 0.12) face(s, c, x0, y, z0, w, 0, 0, 0, 0, d, 0, -1, 0);
  if (!noOcc && h >= 0.28) addOcc(s, [x0, x1], [y, y1], [z0, z1]);
}

// A cylinder or cone, centred on (cx, cy, cz). axis: 'y' (upright), 'x' or 'z' (lying down).
function cylC(g, col, dTop, dBot, h, cx, cy, cz, seg = 12, axis = 'y', noOcc) {
  const s = R.g[g];
  const c = hex(col);
  const sw = (a, b, d) => (axis === 'y' ? [a, b, d] : axis === 'x' ? [b, a, d] : [a, d, b]);
  const slope = (dBot - dTop) / 2;
  const nl = Math.hypot(h, slope) || 1;
  const base = s.pos.length / 3;
  for (let i = 0; i <= seg; i++) {
    const an = (i / seg) * Math.PI * 2;
    const co = Math.cos(an);
    const si = Math.sin(an);
    const n = sw((co * h) / nl, slope / nl, (si * h) / nl);
    for (let k = 0; k < 2; k++) {
      const r = (k ? dTop : dBot) / 2;
      const p = sw(co * r, k ? h / 2 : -h / 2, si * r);
      s.vert(cx + p[0], cy + p[1], cz + p[2], n[0], n[1], n[2], c);
    }
  }
  for (let i = 0; i < seg; i++) {
    const a = base + i * 2;
    s.tri(a, a + 2, a + 1);
    s.tri(a + 1, a + 2, a + 3);
  }
  [[1, dTop], [-1, dBot]].forEach(([dir, dia]) => {
    if (dia <= 0.001) return;
    const n = sw(0, dir, 0);
    const mid = s.vert(cx + sw(0, (dir * h) / 2, 0)[0], cy + sw(0, (dir * h) / 2, 0)[1], cz + sw(0, (dir * h) / 2, 0)[2], n[0], n[1], n[2], c);
    const ring = [];
    for (let i = 0; i <= seg; i++) {
      const an = (i / seg) * Math.PI * 2;
      const p = sw(Math.cos(an) * dia / 2, (dir * h) / 2, Math.sin(an) * dia / 2);
      ring.push(s.vert(cx + p[0], cy + p[1], cz + p[2], n[0], n[1], n[2], c));
    }
    for (let i = 0; i < seg; i++) s.tri(mid, ring[i], ring[i + 1]);
  });
  if (!noOcc && s.occlude) {
    const ex = axis === 'x' ? h / 2 : Math.max(dTop, dBot) / 2;
    const ey = axis === 'y' ? h / 2 : Math.max(dTop, dBot) / 2;
    const ez = axis === 'z' ? h / 2 : Math.max(dTop, dBot) / 2;
    if (ey * 2 >= 0.28 || axis !== 'y') addOcc(s, [cx - ex, cx + ex], [cy - ey, cy + ey], [cz - ez, cz + ez]);
  }
}
// Same, but y = the bottom of an upright cylinder.
const cyl = (g, col, dia, h, x, y, z, seg = 12) => cylC(g, col, dia, dia, h, x, y + h / 2, z, seg);

// A ball or squashed ball (cushions, leaves, fruit). Centred on (x, y, z).
function ball(g, col, sx, sy, sz, x, y, z, seg = 10, noOcc) {
  const s = R.g[g];
  const c = hex(col);
  const rows = Math.max(4, Math.round(seg * 0.7));
  const base = s.pos.length / 3;
  for (let j = 0; j <= rows; j++) {
    const v = (j / rows) * Math.PI;
    for (let i = 0; i <= seg; i++) {
      const u = (i / seg) * Math.PI * 2;
      const px = Math.sin(v) * Math.cos(u) * 0.5;
      const py = Math.cos(v) * 0.5;
      const pz = Math.sin(v) * Math.sin(u) * 0.5;
      const nx = px / (sx * sx) * 4 * sx / 2, ny = py / (sy * sy) * 4 * sy / 2, nz = pz / (sz * sz) * 4 * sz / 2;
      const nl = Math.hypot(nx, ny, nz) || 1;
      s.vert(x + px * sx, y + py * sy, z + pz * sz, nx / nl, ny / nl, nz / nl, c);
    }
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < seg; i++) {
      const a = base + j * (seg + 1) + i;
      s.tri(a, a + 1, a + seg + 1);
      s.tri(a + 1, a + seg + 2, a + seg + 1);
    }
  }
  if (!noOcc && sy >= 0.28) addOcc(s, [x - sx / 2, x + sx / 2], [y - sy / 2, y + sy / 2], [z - sz / 2, z + sz / 2]);
}

// Put a piece of furniture in the room. (x, z) = where, a = turn (0 = front faces +z, the south),
// fn builds the piece in its own directions, fp = [x0, x1, z0, z1] footprint you cannot walk through.
function place(x, z, a, fn, fp) {
  const prev = T;
  const na = prev.a + a;
  T = {
    a: na, c: Math.cos(na), s: Math.sin(na),
    x: prev.x + x * prev.c + z * prev.s, z: prev.z - x * prev.s + z * prev.c
  };
  fn();
  if (fp) {
    const xs = [];
    const zs = [];
    [[fp[0], fp[2]], [fp[1], fp[2]], [fp[1], fp[3]], [fp[0], fp[3]]].forEach(([px, pz]) => {
      xs.push(T.c * px + T.s * pz + T.x);
      zs.push(-T.s * px + T.c * pz + T.z);
    });
    R.blocks.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs) });
  }
  T = prev;
}

// A light that gets baked into the room (bulbs, flames).
function lamp(x, y, z, col, intensity, radius) {
  R.lamps.push({
    x: T.c * x + T.s * z + T.x, y, z: -T.s * x + T.c * z + T.z,
    c: hex(col), i: intensity, r: radius
  });
}
function spot(kind, lx, ly, lz) {
  R.spots.push({
    kind, y: ly,
    x: T.c * lx + T.s * lz + T.x,
    z: -T.s * lx + T.c * lz + T.z,
    a: T.a
  });
}
// =====================================================
// 5. FURNITURE (every piece is built facing +z, with its middle on the floor)
// =====================================================
const BOOKS = [0xb5483a, 0x3f6f8f, 0xd9a441, 0x4f7f55, 0x7a4f8a, 0xe8dcc8, 0x8a5a3a, 0x2f5a6a];

function sofa(th, w = 3.2) {
  const fab = th.sofa;
  const n = Math.max(1, Math.round((w - 0.5) / 0.95));
  const cw = (w - 0.6) / n;
  box('wood', th.dark, w - 0.2, 0.14, 0.8, 0, 0.0, 0);
  box('fabric', fab, w, 0.36, 0.95, 0, 0.14, 0);                                   // base
  box('fabric', fab, w - 0.56, 0.62, 0.26, 0, 0.5, -0.35);                          // back
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + 0.3 + cw * (i + 0.5);
    box('fabric', scaleHex(fab, 1.06), cw - 0.03, 0.2, 0.7, x, 0.5, 0.13);          // seat cushion
    box('fabric', scaleHex(fab, 1.03), cw - 0.05, 0.46, 0.2, x, 0.7, -0.14);        // back cushion
    spot('sit', x, 0.64, 0.13);
  }
  [-1, 1].forEach((sd) => {
    box('fabric', fab, 0.3, 0.7, 0.95, sd * (w / 2 - 0.15), 0.14, 0);               // arm
    cylC('fabric', fab, 0.3, 0.3, 0.95, sd * (w / 2 - 0.15), 0.86, 0, 10, 'z');     // rolled arm top
  });
  if (n > 1) {
    ball('fabric', th.accent, 0.5, 0.42, 0.2, -w / 2 + 0.75, 0.9, 0.0);              // cushions
    ball('fabric', scaleHex(th.accent, 1.2), 0.46, 0.4, 0.2, w / 2 - 0.75, 0.88, 0.0);
  } else {
    ball('fabric', th.accent, 0.42, 0.36, 0.18, 0.2, 0.86, -0.05);
  }
}

function chair(th) {
  spot('sit', 0, 0.5, 0.01);
  box('wood', th.wood, 0.46, 0.05, 0.46, 0, 0.44, 0);
  [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].forEach(([x, z]) => cyl('wood', th.dark, 0.045, 0.44, x, 0, z, 6));
  box('wood', th.wood, 0.05, 0.5, 0.05, -0.19, 0.49, -0.2, true);
  box('wood', th.wood, 0.05, 0.5, 0.05, 0.19, 0.49, -0.2, true);
  box('wood', th.wood, 0.4, 0.08, 0.04, 0, 0.9, -0.2, true);
  box('wood', th.wood, 0.4, 0.08, 0.04, 0, 0.74, -0.2, true);
  box('fabric', th.accent, 0.4, 0.05, 0.4, 0, 0.49, 0.01, true);
}

function roundTable(th, dia = 1.3) {
  cylC('wood', th.wood, dia, dia, 0.06, 0, 0.74, 0, 20);
  cylC('wood', th.dark, 0.14, 0.14, 0.7, 0, 0.35, 0, 8);
  cylC('wood', th.dark, 0.6, 0.6, 0.05, 0, 0.03, 0, 14);
  cylC('plain', 0xf4efe6, 0.3, 0.2, 0.08, 0, 0.82, 0.0, 14);                         // bowl
  ball('plain', 0xd9573a, 0.1, 0.1, 0.1, -0.04, 0.9, 0.0, 6);
  ball('plain', 0xe8b83a, 0.1, 0.1, 0.1, 0.05, 0.9, 0.03, 6);
  ball('plain', 0x7fb04a, 0.1, 0.1, 0.1, 0.02, 0.91, -0.05, 6);
}

function coffeeTable(th, modern) {
  box('wood', th.wood, 1.5, 0.06, 0.8, 0, 0.42, 0);
  box('wood', th.dark, 1.3, 0.04, 0.6, 0, 0.16, 0);
  [[-0.68, -0.34], [0.68, -0.34], [-0.68, 0.34], [0.68, 0.34]].forEach(([x, z]) => cyl('wood', th.dark, 0.06, 0.42, x, 0, z, 6));
  box('plain', 0xb5483a, 0.3, 0.04, 0.22, -0.4, 0.48, 0.05, true);                    // books
  box('plain', 0x3f6f8f, 0.28, 0.04, 0.2, -0.4, 0.52, 0.05, true);
  cylC('plain', 0xf4efe6, 0.14, 0.1, 0.2, 0.35, 0.58, -0.05, 10);                    // vase
  [[0, 0.2], [0.05, 0.28], [-0.05, 0.3]].forEach(([dx, dy], i) => {
    ball('plain', [0xf48fb1, 0xffd54f, 0xffffff][i], 0.1, 0.1, 0.1, 0.35 + dx, 0.62 + dy, -0.05, 6, true);
  });
  cylC('plain', 0xffffff, 0.09, 0.07, 0.08, 0.05, 0.52, 0.18, 8);                    // cup
}

function rugAt(th, x, z, w, d, round) {
  const g = R.g.rug;
  g.rug = { cx: x, cz: z, w, d };
  if (round) cylC('rug', 0xffffff, w, w, 0.025, x, 0.0125, z, 28, 'y', true);
  else box('rug', 0xffffff, w, 0.025, d, x, 0, z, true);
}

function plant(size = 1, kind = 0) {
  cylC('plain', 0xc9855a, 0.42 * size, 0.3 * size, 0.42 * size, 0, 0.21 * size, 0, 12);
  cylC('plain', 0x4a3524, 0.38 * size, 0.38 * size, 0.03, 0, 0.42 * size, 0, 10, 'y', true);
  const greens = [0x5aa05a, 0x6dbb5a, 0x4a8f4e, 0x7fc968];
  const r = rng(40 + kind);
  for (let i = 0; i < 9; i++) {
    const an = (i / 9) * 6.28 + r();
    const rad = 0.16 * size * (0.4 + r());
    ball('plain', greens[i % 4], 0.38 * size, 0.55 * size, 0.2 * size,
      Math.cos(an) * rad, (0.75 + r() * 0.45) * size, Math.sin(an) * rad, 6, true);
  }
}

function floorLamp(th) {
  cylC('plain', 0x3a3430, 0.3, 0.3, 0.04, 0, 0.02, 0, 10);
  cylC('plain', 0x3a3430, 0.04, 0.04, 1.5, 0, 0.77, 0, 6);
  cylC('glow', 0xffe6b8, 0.3, 0.46, 0.34, 0, 1.6, 0, 14, 'y', true);
  lamp(0, 1.55, 0, 0xffd9a0, 1.0, 2.6);
}

function pendant(x, z, y, col) {
  cylC('plain', 0x2a2522, 0.02, 0.02, H - y, x, (H + y) / 2, z, 4, 'y', true);
  cylC('glow', col, 0.2, 0.7, 0.32, x, y, z, 14, 'y', true);
  lamp(x, y - 0.1, z, 0xffd9a0, 1.1, 3.4);
}

function picture(w, h, col1, col2, frame, y = 0) {                                    // hangs on a wall, y = bottom edge
  box('wood', frame, w + 0.14, h + 0.14, 0.05, 0, y, 0.025, true);
  box('plain', 0xf6f2ea, w, h, 0.02, 0, y + 0.07, 0.055, true);
  box('plain', col1, w * 0.78, h * 0.78, 0.02, 0, y + h * 0.11 + 0.07, 0.065, true);
  box('plain', col2, w * 0.4, h * 0.34, 0.02, w * 0.12, y + h * 0.4 + 0.07, 0.075, true);
}

function bookshelf(th, len) {
  const d = 0.34;
  const h = 2.3;
  box('wood', th.dark, len, h, 0.03, 0, 0, -d / 2 + 0.015, true);                    // back
  [-1, 1].forEach((sd) => box('wood', th.wood, 0.05, h, d, sd * (len / 2 - 0.025), 0, 0, true));
  for (let i = 0; i < 6; i++) box('wood', th.wood, len, 0.04, d, 0, 0.04 + i * 0.44, 0, true);
  const r = rng(77);
  for (let row = 0; row < 5; row++) {
    let x = -len / 2 + 0.1;
    while (x < len / 2 - 0.25) {
      if (r() < 0.12) {                                                              // a little decoration
        ball('plain', [0xd9a441, 0x8fbf8f, 0xc9855a][(r() * 3) | 0], 0.14, 0.14, 0.14, x + 0.1, 0.08 + row * 0.44 + 0.07, 0, 6, true);
        x += 0.25;
        continue;
      }
      const bw = 0.04 + r() * 0.05;
      const bh = 0.24 + r() * 0.12;
      box('plain', BOOKS[(r() * BOOKS.length) | 0], bw, bh, 0.22, x + bw / 2, 0.08 + row * 0.44, 0.03, true);
      x += bw + 0.005;
    }
  }
  addOcc(R.g.wood, [-len / 2, len / 2], [0, h], [-d / 2, d / 2]);
}

function door(th) {                                                                  // on the south wall, local z = 0 is the wall
  box('wood', th.trim, 0.12, 2.5, 0.1, -0.6, 0, 0.05, true);
  box('wood', th.trim, 0.12, 2.5, 0.1, 0.6, 0, 0.05, true);
  box('wood', th.trim, 1.32, 0.12, 0.1, 0, 2.44, 0.05, true);
  box('wood', th.door, 1.08, 2.38, 0.06, 0, 0, 0.04, true);
  [[0, 0.2, 0.9, 0.7], [0, 1.0, 0.9, 0.7], [0, 1.72, 0.9, 0.55]].forEach(([x, y, w, h]) => {
    box('wood', scaleHex(th.door, 1.12), w - 0.3, h, 0.02, x, y + 0.1, 0.075, true);
  });
  cylC('plain', 0xd9b24a, 0.06, 0.06, 0.05, 0.38, 1.05, 0.1, 10, 'z', true);          // handle
  box('plain', 0xd9b24a, 0.05, 0.16, 0.01, 0.38, 0.97, 0.075, true);
}

function windowAt(wall, c, w = 2.4, h = 1.5, y0 = 0.95) {
  const th = R.th;
  const north = wall === 'N';
  const wx = north ? c : HW;
  const wz = north ? -HD : c;
  R.win.push({
    cx: wx, cy: y0 + h / 2, cz: wz, nx: north ? 0 : -1, nz: north ? 1 : 0,
    ux: north ? 1 : 0, uz: north ? 0 : 1, hw: w / 2, hh: h / 2, area: w * h
  });
  place(wx, wz, north ? 0 : -Math.PI / 2, () => {
    face(R.g.view, [1, 1, 1], -w / 2, y0, 0.012, w, 0, 0, 0, h, 0, 0, 0, 1, 1, 1, [0, 0, 1, 1]);
    const t = 0.08;
    box('wood', th.trim, w + 2 * t, t, 0.14, 0, y0 - t, 0.07, true);
    box('wood', th.trim, w + 2 * t, t, 0.14, 0, y0 + h, 0.07, true);
    box('wood', th.trim, t, h, 0.14, -w / 2 - t / 2, y0, 0.07, true);
    box('wood', th.trim, t, h, 0.14, w / 2 + t / 2, y0, 0.07, true);
    box('wood', th.trim, 0.05, h, 0.06, 0, y0, 0.04, true);
    box('wood', th.trim, w, 0.05, 0.06, 0, y0 + h / 2 - 0.025, 0.04, true);
    box('wood', th.trim, w + 0.4, 0.05, 0.26, 0, y0 - t - 0.05, 0.13, true);          // sill
    [-1, 1].forEach((sd) => {                                                        // curtains with folds
      for (let i = 0; i < 5; i++) {
        box('fabric', scaleHex(th.curtain, i % 2 ? 0.9 : 1.04), 0.11, H - 0.5, 0.06 + 0.035 * (i % 2),
          sd * (w / 2 + 0.2 + 0.11 * i), 0.1, 0.12 + 0.02 * (i % 2), true);
      }
    });
    cylC('plain', 0x4a3a2a, 0.035, 0.035, w + 1.2, 0, H - 0.3, 0.16, 8, 'x', true);
    [-1, 1].forEach((sd) => ball('plain', 0x4a3a2a, 0.08, 0.08, 0.08, sd * (w / 2 + 0.62), H - 0.3, 0.16, 6, true));
  });
}

function kitchen(th, style) {                                                        // along the west wall (front faces +x)
  const L = 4.2;
  const hand = 0xb9b4ac;
  box('wood', th.cab, L, 0.8, 0.62, 0, 0.1, 0);
  box('wood', th.dark, L, 0.1, 0.56, 0, 0, 0.0, true);                               // plinth
  box('plain', th.top, L + 0.04, 0.05, 0.68, 0, 0.9, 0.02);                          // counter top
  for (let i = 0; i < 6; i++) {                                                      // doors and handles
    const x = -L / 2 + 0.35 + i * 0.7;
    box('wood', scaleHex(th.cab, 1.05), 0.64, 0.7, 0.02, x, 0.15, 0.32, true);
    box('plain', hand, 0.2, 0.025, 0.03, x, 0.78, 0.345, true);
  }
  // sink with a tap
  box('plain', 0x9aa5ad, 0.8, 0.02, 0.46, -0.9, 0.94, 0.02, true);
  box('plain', 0x6f7a82, 0.7, 0.01, 0.38, -0.9, 0.955, 0.02, true);
  cylC('plain', 0xc9d1d6, 0.04, 0.04, 0.3, -0.9, 1.1, -0.2, 8);
  cylC('plain', 0xc9d1d6, 0.03, 0.03, 0.2, -0.9, 1.25, -0.1, 8, 'z', true);
  // stove with burners and a pot
  box('plain', 0x2f3236, 0.8, 0.03, 0.55, 1.1, 0.95, 0.03, true);
  [[-0.2, -0.12], [0.2, -0.12], [-0.2, 0.14], [0.2, 0.14]].forEach(([x, z]) => cylC('plain', 0x15171a, 0.2, 0.2, 0.02, 1.1 + x, 0.98, 0.03 + z, 12, 'y', true));
  cylC('plain', 0xb8c0c6, 0.26, 0.26, 0.16, 1.3, 1.07, 0.17, 14);
  cylC('plain', 0x2a2d30, 0.27, 0.27, 0.02, 1.3, 1.16, 0.17, 14, 'y', true);
  // fruit bowl and kettle
  cylC('plain', 0xf4efe6, 0.3, 0.18, 0.1, -1.7, 0.97, 0.05, 12, 'y', true);
  ball('plain', 0xd9573a, 0.11, 0.11, 0.11, -1.74, 1.06, 0.05, 6, true);
  ball('plain', 0xe8b83a, 0.11, 0.11, 0.11, -1.66, 1.06, 0.08, 6, true);
  cylC('plain', 0xb8c0c6, 0.2, 0.26, 0.24, 0.3, 1.07, -0.05, 10);
  // wall cabinets (and a hood for the modern kitchen)
  for (let i = 0; i < 3; i++) {
    const x = -L / 2 + 0.6 + i * 1.0;
    if (i === 2 && style === 'modern') continue;
    box('wood', th.cab, 0.96, 0.7, 0.34, x, 1.55, -0.14, false);
    box('wood', scaleHex(th.cab, 1.06), 0.88, 0.62, 0.02, x, 1.59, 0.04, true);
  }
  box('wood', th.cab, 0.96, 0.7, 0.34, L / 2 - 0.55, 1.55, -0.14);
  if (style === 'modern') {
    box('plain', 0xc9d1d6, 0.9, 0.12, 0.5, 1.1, 1.78, -0.1);
    box('plain', 0xc9d1d6, 0.3, 0.7, 0.3, 1.1, 1.9, -0.18);
  } else {
    box('plain', 0xe8dcc8, 0.9, 0.12, 0.4, 1.1, 1.7, -0.14);
  }
  // fridge at the end
  box('plain', 0xe8ecef, 0.78, 1.9, 0.72, L / 2 + 0.45, 0, 0.05);
  box('plain', 0xc9d1d6, 0.03, 0.5, 0.04, L / 2 + 0.2, 1.2, 0.44, true);
  box('plain', 0xc9d1d6, 0.03, 0.8, 0.04, L / 2 + 0.2, 0.2, 0.44, true);
  box('plain', 0xb8c0c6, 0.78, 0.015, 0.02, L / 2 + 0.45, 1.1, 0.42, true);
}

function fireplace(th, kind) {                                                       // north wall, front faces +z
  if (kind === 'stove') {                                                            // a cosy cast-iron stove
    box('plain', th.stone, 1.5, 0.12, 1.1, 0, 0, 0.35);
    cylC('plain', 0x2d2a28, 0.74, 0.74, 1.0, 0, 0.62, 0.3, 16);
    cylC('plain', 0x2d2a28, 0.8, 0.8, 0.06, 0, 1.15, 0.3, 16);
    cylC('plain', 0x2d2a28, 0.16, 0.16, 2.5, 0, 2.4, 0.3, 10);
    box('glow', 0xffa63a, 0.4, 0.3, 0.02, 0, 0.45, 0.67, true);
    lamp(0, 0.6, 0.9, 0xffa050, 1.3, 2.6);
    return;
  }
  const dark = kind === 'dark';
  box('stone', th.stone, 0.55, 1.4, 0.5, -0.925, 0.0, 0.25);
  box('stone', th.stone, 0.55, 1.4, 0.5, 0.925, 0.0, 0.25);
  box('stone', th.stone, 2.4, 0.3, 0.5, 0, 1.1, 0.25);
  box('stone', th.stone, 1.9, H - 1.55, 0.36, 0, 1.55, 0.18);
  box('wood', th.dark, 2.9, 0.1, 0.64, 0, 1.4, 0.32);                                 // mantel shelf
  box('plain', 0x1d1816, 1.3, 1.1, 0.06, 0, 0.0, 0.05, true);                         // dark inside
  box('plain', 0x2a2320, 1.3, 0.12, 0.45, 0, 0.0, 0.3, true);
  box('stone', th.stone, 2.9, 0.08, 0.9, 0, 0.0, 0.5, true);                          // hearth
  cylC('wood', 0x5a3a22, 0.16, 0.16, 0.9, 0, 0.2, 0.28, 8, 'x', true);               // logs
  cylC('wood', 0x4a2f1c, 0.15, 0.15, 0.8, 0.05, 0.34, 0.22, 8, 'x', true);
  [[-0.25, 0.7, 0.18], [0, 0.95, 0.28], [0.25, 0.65, 0.2]].forEach(([x, h, w]) => cylC('glow', x === 0 ? 0xffd45a : 0xff8a2a, 0.02, w, h * 0.5, x, 0.3 + h * 0.25, 0.26, 8, 'y', true));
  lamp(0, 0.5, 0.4, 0xff9a4a, 1.5, 2.8);
  [-1.1, 1.1].forEach((x) => {                                                       // candles on the mantel
    cylC('plain', 0xfff4e0, 0.06, 0.06, 0.22, x, 1.56, 0.3, 8, 'y', true);
    ball('glow', 0xffd45a, 0.05, 0.08, 0.05, x, 1.7, 0.3, 6, true);
  });
  place(0, 0.36, 0, () => picture(dark ? 1.5 : 1.2, dark ? 1.0 : 0.9, 0x4a7f8f, 0xd9a441, th.dark, 1.95), null);
  addOcc(R.g.stone, [-1.45, 1.45], [0, 1.5], [0, 0.55]);
}

function tvWall(th) {                                                                 // modern living wall
  box('wood', th.wood, 2.8, 0.5, 0.45, 0, 0.12, 0.22);
  box('wood', th.dark, 2.8, 0.12, 0.4, 0, 0, 0.2, true);
  [-0.7, 0.7].forEach((x) => box('plain', th.dark, 0.02, 0.4, 0.02, x, 0.17, 0.46, true));
  box('plain', 0x14171a, 1.9, 1.08, 0.05, 0, 1.0, 0.03);                              // the TV
  box('plain', 0x1f252b, 1.8, 0.98, 0.01, 0, 1.05, 0.06, true);
  cylC('plain', 0xf4efe6, 0.14, 0.1, 0.26, 0.9, 0.87, 0.2, 10);
  ball('plain', 0xf48fb1, 0.1, 0.1, 0.1, 0.9, 1.2, 0.2, 6, true);
}

function bed(th) {                                                                    // head is at local -z (the wall)
  const f = th.wood;
  spot('sleep', 0, 0.72, 0.05);
  box('wood', f, 1.7, 0.3, 2.1, 0, 0.12, 0.05);
  box('wood', th.dark, 1.8, 1.25, 0.1, 0, 0, -1.0);                                   // headboard
  box('wood', th.dark, 1.8, 0.5, 0.08, 0, 0, 1.1);                                    // foot board
  box('fabric', 0xfaf6ee, 1.62, 0.22, 2.0, 0, 0.42, 0.05);                            // mattress
  box('fabric', th.accent, 1.68, 0.1, 1.45, 0, 0.62, 0.38);                           // duvet
  box('fabric', scaleHex(th.accent, 1.25), 1.7, 0.06, 0.4, 0, 0.7, 0.55);             // folded blanket
  [-0.45, 0.45].forEach((x) => ball('fabric', 0xffffff, 0.62, 0.2, 0.4, x, 0.74, -0.72, 8));
  ball('fabric', scaleHex(th.green, 1.2), 0.4, 0.16, 0.3, 0, 0.82, -0.5, 8);
}

function nightstand(th) {
  box('wood', th.wood, 0.5, 0.5, 0.42, 0, 0.0, 0);
  box('wood', th.dark, 0.4, 0.02, 0.01, 0, 0.3, 0.215, true);
  place(0, 0, 0, () => {
    cylC('plain', th.dark, 0.14, 0.14, 0.2, 0, 0.6, 0, 8);
    cylC('glow', 0xffe6b8, 0.16, 0.28, 0.22, 0, 0.82, 0, 12, 'y', true);
    lamp(0, 0.84, 0, 0xffd9a0, 0.55, 1.8);
  }, null);
}

function chandelier(x, z) {                                                           // traditional
  cylC('plain', 0x2a2522, 0.02, 0.02, 0.7, x, H - 0.35, z, 4, 'y', true);
  cylC('plain', 0xb08a3a, 0.8, 0.8, 0.04, x, H - 0.8, z, 14, 'y', true);
  cylC('plain', 0xb08a3a, 0.12, 0.12, 0.3, x, H - 0.95, z, 8, 'y', true);
  for (let i = 0; i < 6; i++) {
    const an = (i / 6) * 6.28;
    ball('glow', 0xffe0a0, 0.07, 0.12, 0.07, x + Math.cos(an) * 0.4, H - 0.68, z + Math.sin(an) * 0.4, 6, true);
  }
  lamp(x, H - 0.8, z, 0xffd9a0, 1.2, 3.6);
}

function clock(th) {                                                                  // grandfather clock
  box('wood', th.dark, 0.6, 2.2, 0.36, 0, 0, 0);
  box('wood', th.dark, 0.5, 0.2, 0.3, 0, 2.2, 0, true);
  cylC('plain', 0xf4efe6, 0.34, 0.34, 0.03, 0, 1.75, 0.19, 16, 'z', true);
  box('plain', 0xd9b24a, 0.02, 0.12, 0.01, 0, 1.78, 0.215, true);
  box('plain', 0x7a5a2a, 0.3, 0.8, 0.02, 0, 0.5, 0.19, true);
  box('plain', 0xd9b24a, 0.04, 0.4, 0.02, 0, 0.7, 0.2, true);
}

function trunk(th) {                                                                  // treehouse: a living tree in the room
  cylC('wood', 0x7d5232, 1.3, 1.5, H, 0, H / 2, 0, 16);
  [0, 1.6, 3.2, 4.8].forEach((a, i) => ball('wood', 0x7d5232, 0.7, 0.5, 0.9, Math.cos(a) * 0.75, 0.15, Math.sin(a) * 0.75, 8, true));
  [[-0.7, -0.2], [0.6, 0.4], [0.1, -0.8], [-0.3, 0.7]].forEach(([x, z], i) => {
    ball('plain', [0x6dbb5a, 0x58a84d, 0x7fc968, 0x62b552][i], 1.5, 0.55, 1.4, x, H - 0.25, z, 8, true);
  });
}

function stringLights() {                                                             // treehouse fairy lights
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const x = -6 + t * 12;
    const y = H - 0.25 - Math.sin(t * Math.PI) * 0.35;
    ball('glow', [0xffe08a, 0xffb86a, 0xfff2c0][i % 3], 0.1, 0.1, 0.1, x, y, -4.7, 6, true);
  }
  lamp(-3, H - 0.7, -4.5, 0xffd9a0, 0.6, 3);
  lamp(3, H - 0.7, -4.5, 0xffd9a0, 0.6, 3);
}

function beams(th) {                                                                  // wooden ceiling beams
  [-4.2, 0, 4.2].forEach((x) => box('wood', th.dark, 0.22, 0.24, 9.8, x, H - 0.24, 0, true));
}

function wainscot(th) {                                                               // wood panelling on the lower wall
  const c = th.wood;
  const h = 1.0;
  box('wood', c, 14, h, 0.05, 0, 0.1, -HD + 0.025, true);
  box('wood', c, 0.05, h, 10, -HW + 0.025, 0.1, 0, true);
  box('wood', c, 0.05, h, 10, HW - 0.025, 0.1, 0, true);
  box('wood', c, 5.6, h, 0.05, -4.2, 0.1, HD - 0.025, true);
  box('wood', c, 5.6, h, 0.05, 4.2, 0.1, HD - 0.025, true);
  box('wood', th.trim, 14, 0.07, 0.08, 0, 1.1, -HD + 0.04, true);
  box('wood', th.trim, 0.08, 0.07, 10, -HW + 0.04, 1.1, 0, true);
  box('wood', th.trim, 0.08, 0.07, 10, HW - 0.04, 1.1, 0, true);
  box('wood', th.trim, 5.6, 0.07, 0.08, -4.2, 1.1, HD - 0.04, true);
  box('wood', th.trim, 5.6, 0.07, 0.08, 4.2, 1.1, HD - 0.04, true);
}

function entry(th) {                                                                  // little table with a mirror by the door
  box('wood', th.wood, 1.2, 0.05, 0.4, 0, 0.78, 0);
  [[-0.5, -0.15], [0.5, -0.15], [-0.5, 0.15], [0.5, 0.15]].forEach(([x, z]) => cyl('wood', th.dark, 0.05, 0.78, x, 0, z, 6));
  box('wood', th.dark, 0.9, 1.1, 0.04, 0, 1.15, -0.17, true);
  box('glow', 0xb4c9d6, 0.78, 0.98, 0.01, 0, 1.21, -0.145, true);
  cylC('plain', 0xf4efe6, 0.12, 0.09, 0.2, -0.4, 0.83, 0, 8);
  box('fabric', th.accent, 0.4, 0.03, 0.3, 0.3, 0.83, 0, true);
}

// =====================================================
// 6. BUILDING A WHOLE ROOM
// =====================================================
function makeGroups(th, style, rnd) {
  const mk = (name, o) => { R.g[name] = new Surf(name, o); };
  const floor = th.floor;
  mk('floor', {
    tex: {
      size: 512, m: 2.4,
      draw: (ctx, S) => (floor.kind === 'tiles' ? paintTiles(ctx, S, rnd, floor.base) : paintPlanks(ctx, S, rnd, floor.cols, floor.rows))
    }
  });
  mk('plaster', { tex: { size: 256, m: 3, draw: (ctx, S) => paintPlaster(ctx, S, rnd) } });
  if (th.wallTex !== 'plaster') {
    mk('wall', { tex: { size: 256, m: 2.2, draw: (ctx, S) => (th.wallTex === 'boards' ? paintWallBoards(ctx, S, rnd) : paintStripes(ctx, S, rnd)) } });
  }
  mk('wood', { tex: { size: 256, m: 1.2, draw: (ctx, S) => paintWoodGrain(ctx, S, rnd) } });
  mk('fabric', { tex: { size: 128, m: 0.5, draw: (ctx, S) => paintFabric(ctx, S, rnd) } });
  mk('stone', { tex: { size: 256, m: 1.4, draw: (ctx, S) => paintStone(ctx, S, rnd) } });
  mk('rug', {
    uvMode: 'rug', occlude: false,
    tex: { size: 256, m: 1, clamp: true, draw: (ctx, S) => paintRug(ctx, S, rnd, th.rug[0], th.rug[1], th.rug[2], th.round) }
  });
  mk('plain', {});
  mk('glow', { bake: false, occlude: false });
  mk('view', { bake: false, occlude: false, vertexColors: false, tex: { size: 256, m: 1, clamp: true, draw: (ctx, S) => paintView(ctx, S, rnd) } });
}

function layout(style) {
  const th = R.th;
  const wg = th.wallTex === 'plaster' ? 'plaster' : 'wall';
  const cWall = hex(th.wall);

  // ----- the empty room: floor, ceiling, walls (cut into small squares for smooth light) -----
  face(R.g.floor, [1, 1, 1], -HW, 0, -HD, 2 * HW, 0, 0, 0, 0, 2 * HD, 0, 1, 0, 70, 50);
  face(R.g.plaster, hex(th.ceil), -HW, H, -HD, 2 * HW, 0, 0, 0, 0, 2 * HD, 0, -1, 0, 28, 20);
  face(R.g[wg], cWall, -HW, 0, -HD, 2 * HW, 0, 0, 0, H, 0, 0, 0, 1, 56, 15);
  face(R.g[wg], cWall, -HW, 0, HD, 2 * HW, 0, 0, 0, H, 0, 0, 0, -1, 56, 15);
  face(R.g[wg], cWall, -HW, 0, -HD, 0, 0, 2 * HD, 0, H, 0, 1, 0, 0, 40, 15);
  face(R.g[wg], cWall, HW, 0, -HD, 0, 0, 2 * HD, 0, H, 0, -1, 0, 0, 40, 15);

  // skirting boards and ceiling trim
  const tr = th.trim;
  box('wood', tr, 14, 0.16, 0.05, 0, 0, -HD + 0.025, true);
  box('wood', tr, 0.05, 0.16, 10, -HW + 0.025, 0, 0, true);
  box('wood', tr, 0.05, 0.16, 10, HW - 0.025, 0, 0, true);
  box('wood', tr, 6.2, 0.16, 0.05, -3.9, 0, HD - 0.025, true);
  box('wood', tr, 6.2, 0.16, 0.05, 3.9, 0, HD - 0.025, true);
  box('wood', tr, 14, 0.12, 0.09, 0, H - 0.12, -HD + 0.045, true);
  box('wood', tr, 14, 0.12, 0.09, 0, H - 0.12, HD - 0.045, true);
  box('wood', tr, 0.09, 0.12, 10, -HW + 0.045, H - 0.12, 0, true);
  box('wood', tr, 0.09, 0.12, 10, HW - 0.045, H - 0.12, 0, true);

  place(0, HD, Math.PI, () => door(th), null);
  windowAt('N', -3.6);
  windowAt('N', 3.6);
  windowAt('E', 2.0);

  // ----- the middle: rug, sofa, coffee table, armchair -----
  rugAt(th, 0, -0.4, th.round ? 4 : 5, th.round ? 4 : 3.6, th.round);
  place(0, 0.9, Math.PI, () => sofa(th, 3.2), [-1.7, 1.7, -0.55, 0.55]);
  place(0, -0.8, 0, () => coffeeTable(th), [-0.8, 0.8, -0.45, 0.45]);
  place(-3.3, -0.9, Math.PI / 2, () => sofa(th, 1.15), [-0.6, 0.6, -0.6, 0.6]);

  // ----- style details -----
  if (style === 'cottage') {
    place(0, -HD, 0, () => fireplace(th, 'stone'), [-1.5, 1.5, 0, 0.9]);
    beams(th);
    place(3.3, -0.9, -Math.PI / 2, () => sofa(th, 1.15), [-0.6, 0.6, -0.6, 0.6]);
    pendant(0, -0.6, H - 0.9, 0xffe2b0);
  } else if (style === 'treehouse') {
    place(0, -HD, 0, () => fireplace(th, 'stove'), [-0.8, 0.8, 0, 1.0]);
    place(4.0, -0.7, 0, () => trunk(th), [-0.8, 0.8, -0.8, 0.8]);
    beams(th);
    stringLights();
  } else if (style === 'modern') {
    place(0, -HD, 0, () => tvWall(th), [-1.45, 1.45, 0, 0.5]);
    place(3.3, -0.9, -Math.PI / 2, () => sofa(th, 1.15), [-0.6, 0.6, -0.6, 0.6]);
    [[-3.6, -3.2], [3.6, -3.2], [-3.6, 2.0], [3.6, 2.0]].forEach(([x, z]) => {
      cylC('glow', 0xfff4dc, 0.22, 0.22, 0.03, x, H - 0.02, z, 12, 'y', true);
      lamp(x, H - 0.3, z, 0xfff0d8, 0.6, 3);
    });
    pendant(4.7, 2.5, H - 1.3, 0xffffff);
  } else {
    place(0, -HD, 0, () => fireplace(th, 'dark'), [-1.5, 1.5, 0, 0.9]);
    wainscot(th);
    place(3.3, -0.9, -Math.PI / 2, () => sofa(th, 1.15), [-0.6, 0.6, -0.6, 0.6]);
    place(-6.3, -HD + 0.45, 0, () => clock(th), [-0.4, 0.4, -0.3, 0.3]);
    chandelier(0, -0.6);
  }

  // ----- west wall: bookshelf and kitchen -----
  place(-HW + 0.17, -3.0, Math.PI / 2, () => bookshelf(th, 2.6), [-1.3, 1.3, -0.17, 0.17]);
  place(-HW + 0.32, 1.9, Math.PI / 2, () => kitchen(th, style), [-2.1, 3.3, -0.35, 0.8]);

  // ----- east side: bed with night stands, dining table by the window -----
  place(HW - 1.2, -2.6, -Math.PI / 2, () => bed(th), [-0.95, 0.95, -1.1, 1.2]);
  place(HW - 0.3, -4.3, -Math.PI / 2, () => nightstand(th), [-0.28, 0.28, -0.25, 0.25]);
  place(HW - 0.3, -0.9, -Math.PI / 2, () => nightstand(th), [-0.28, 0.28, -0.25, 0.25]);
  place(4.7, 2.7, 0, () => roundTable(th), [-0.7, 0.7, -0.7, 0.7]);
  [0, 1, 2, 3].forEach((i) => {
    const an = (i / 4) * Math.PI * 2 + 0.5;
    place(4.7 + Math.sin(an) * 0.95, 2.7 + Math.cos(an) * 0.95, an + Math.PI, () => chair(th), [-0.25, 0.25, -0.25, 0.25]);
  });

  // ----- near the door, pictures and plants -----
  place(-2.9, HD - 0.2, Math.PI, () => entry(th), [-0.6, 0.6, -0.25, 0.25]);
  place(5.9, 4.1, 0, () => plant(1.4, 1), [-0.3, 0.3, -0.3, 0.3]);
  place(-5.7, 4.2, 0, () => plant(1.1, 2), [-0.25, 0.25, -0.25, 0.25]);
  place(-6.4, -0.7, 0, () => plant(0.9, 3), null);
  place(-3.5, 0.9, 0, () => floorLamp(th), [-0.2, 0.2, -0.2, 0.2]);
  place(2.8, HD - 0.01, Math.PI, () => picture(0.9, 1.1, th.green, 0xd9a441, th.dark, 1.2), null);
}

// =====================================================
// 7. BAKING THE LIGHT (done once per room)
// =====================================================
const AMB_UP = [0.31, 0.31, 0.33];     // soft light coming from above
const AMB_DN = [0.25, 0.2, 0.15];     // warm light bouncing up from the floor
const SKY_K = 0.5;                     // how strong the window skylight is
const SKY_C = [0.78, 0.9, 1.0];
const SUN_I = 1.7;                     // how strong the sunlight patches are
const SUN_C = [1.0, 0.88, 0.66];
const SUN_TOWARD = (() => {            // the sun is up in the north-east
  const v = [0.62, 0.6, -0.5];
  const l = Math.hypot(...v);
  return v.map((n) => n / l);
})();

const edge = (d) => 1 - 0.34 * Math.exp(-Math.max(d, 0) / 0.5);   // dark in corners
const soft = (x) => (x < 0.72 ? x : 0.72 + 0.28 * (1 - Math.exp(-(x - 0.72) / 0.28)));
const smooth01 = (x) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };

function blocked(ox, oy, oz, dx, dy, dz, tmax) {                   // does a ray hit any furniture?
  for (const b of R.occ) {
    if (ox > b[0] && ox < b[3] && oy > b[1] && oy < b[4] && oz > b[2] && oz < b[5]) continue;
    let t0 = 0;
    let t1 = tmax;
    if (Math.abs(dx) < 1e-9) { if (ox < b[0] || ox > b[3]) continue; } else {
      let a = (b[0] - ox) / dx; let c = (b[3] - ox) / dx;
      if (a > c) { const t = a; a = c; c = t; }
      if (a > t0) t0 = a; if (c < t1) t1 = c; if (t0 > t1) continue;
    }
    if (Math.abs(dy) < 1e-9) { if (oy < b[1] || oy > b[4]) continue; } else {
      let a = (b[1] - oy) / dy; let c = (b[4] - oy) / dy;
      if (a > c) { const t = a; a = c; c = t; }
      if (a > t0) t0 = a; if (c < t1) t1 = c; if (t0 > t1) continue;
    }
    if (Math.abs(dz) < 1e-9) { if (oz < b[2] || oz > b[5]) continue; } else {
      let a = (b[2] - oz) / dz; let c = (b[5] - oz) / dz;
      if (a > c) { const t = a; a = c; c = t; }
      if (a > t0) t0 = a; if (c < t1) t1 = c; if (t0 > t1) continue;
    }
    return true;
  }
  return false;
}

const JITTER = [[0, 0, 0], [0.16, 0.06, 0.1], [-0.12, 0.1, -0.15]];

function shade(px, py, pz, nx, ny, nz, out) {
  // 1. soft light from everywhere, darker in corners and where things touch the floor
  const up = ny * 0.5 + 0.5;
  let ao = 1;
  if (Math.abs(nx) < 0.6) ao *= edge(HW + px) * edge(HW - px);
  if (Math.abs(nz) < 0.6) ao *= edge(HD + pz) * edge(HD - pz);
  if (Math.abs(ny) < 0.6) ao *= edge(py) * edge(H - py);
  if (ny > 0.7 && py < 0.08) {
    for (const b of R.occ) {
      if (b[1] > 0.5) continue;
      const dx = Math.max(b[0] - px, 0, px - b[3]);
      const dz = Math.max(b[2] - pz, 0, pz - b[5]);
      ao *= 1 - 0.45 * Math.exp(-Math.hypot(dx, dz) * 3.6) * Math.min(1, (b[4] - b[1]) / 0.5);
    }
  }
  let r = (AMB_DN[0] + (AMB_UP[0] - AMB_DN[0]) * up) * ao;
  let g = (AMB_DN[1] + (AMB_UP[1] - AMB_DN[1]) * up) * ao;
  let b = (AMB_DN[2] + (AMB_UP[2] - AMB_DN[2]) * up) * ao;
  const aoMix = 0.65 + 0.35 * ao;

  // 2. daylight glowing in through the windows
  for (const w of R.win) {
    let lx = w.cx - px, ly = w.cy - py, lz = w.cz - pz;
    const d2 = lx * lx + ly * ly + lz * lz;
    const d = Math.sqrt(d2) || 1;
    lx /= d; ly /= d; lz /= d;
    const ndl = nx * lx + ny * ly + nz * lz;
    const cw = -(lx * w.nx + lz * w.nz);
    if (ndl <= 0 || cw <= 0) continue;
    const e = (w.area * ndl * cw / (d2 + 1.5)) * SKY_K * aoMix;
    r += e * SKY_C[0]; g += e * SKY_C[1]; b += e * SKY_C[2];
  }

  // 3. real sunlight patches on the floor and furniture
  const sn = nx * SUN_TOWARD[0] + ny * SUN_TOWARD[1] + nz * SUN_TOWARD[2];
  if (sn > 0.02) {
    const ox = px + nx * 0.04, oy = py + ny * 0.04, oz = pz + nz * 0.04;
    let cov = 0;
    let tHit = 0;
    for (const w of R.win) {
      const den = SUN_TOWARD[0] * w.nx + SUN_TOWARD[2] * w.nz;
      if (den >= -0.01) continue;
      const t = ((w.cx - ox) * w.nx + (w.cz - oz) * w.nz) / den;
      if (t <= 0) continue;
      const hx = ox + SUN_TOWARD[0] * t - w.cx;
      const hy = oy + SUN_TOWARD[1] * t - w.cy;
      const hz = oz + SUN_TOWARD[2] * t - w.cz;
      const du = hx * w.ux + hz * w.uz;
      const c = smooth01((w.hw - Math.abs(du) + 0.12) / 0.3) * smooth01((w.hh - Math.abs(hy) + 0.12) / 0.3);
      if (c > cov) { cov = c; tHit = t; }
    }
    if (cov > 0.02 && !blocked(ox, oy, oz, SUN_TOWARD[0], SUN_TOWARD[1], SUN_TOWARD[2], tHit - 0.05)) {
      const s = sn * cov * SUN_I * 0.9;
      r += s * SUN_C[0]; g += s * SUN_C[1]; b += s * SUN_C[2];
    }
  }

  // 4. lamps and fire, with soft shadows
  for (const l of R.lamps) {
    const dx = l.x - px, dy = l.y - py, dz = l.z - pz;
    const d2 = dx * dx + dy * dy + dz * dz;
    const d = Math.sqrt(d2);
    if (d > l.r * 3.5 || d < 0.01) continue;
    const ndl = (nx * dx + ny * dy + nz * dz) / d;
    if (ndl <= 0) continue;
    const att = (l.i * ndl) / (1 + d2 / (l.r * l.r));
    if (att < 0.015) continue;
    let vis = 0;
    const ox = px + nx * 0.04, oy = py + ny * 0.04, oz = pz + nz * 0.04;
    for (const j of JITTER) {
      const tx = l.x + j[0] - ox, ty = l.y + j[1] - oy, tz = l.z + j[2] - oz;
      const td = Math.hypot(tx, ty, tz);
      if (td < 0.3 || !blocked(ox, oy, oz, tx / td, ty / td, tz / td, td - 0.25)) vis += 1 / JITTER.length;
    }
    const k = att * vis * aoMix;
    r += k * l.c[0]; g += k * l.c[1]; b += k * l.c[2];
  }
  out[0] = r; out[1] = g; out[2] = b;
}

function bakeLight() {
  const out = [0, 0, 0];
  for (const s of Object.values(R.g)) {
    if (!s.bake) continue;
    const n = s.pos.length / 3;
    for (let i = 0; i < n; i++) {
      shade(s.pos[i * 3], s.pos[i * 3 + 1], s.pos[i * 3 + 2], s.nor[i * 3], s.nor[i * 3 + 1], s.nor[i * 3 + 2], out);
      s.col[i * 3] = soft(s.col[i * 3] * out[0]);
      s.col[i * 3 + 1] = soft(s.col[i * 3 + 1] * out[1]);
      s.col[i * 3 + 2] = soft(s.col[i * 3 + 2] * out[2]);
    }
  }
}

// =====================================================
// 8. THE PUBLIC FUNCTIONS
// =====================================================
// Builds the room as plain data (no 3D library needed). Used by buildInterior and by tests.
export function bakeRoom(style) {
  const th = THEMES[style];
  let seed = 0;
  for (let i = 0; i < style.length; i++) seed = seed * 31 + style.charCodeAt(i);
  T = { a: 0, c: 1, s: 0, x: 0, z: 0 };
  R = { th, g: {}, occ: [], blocks: [], lamps: [], win: [],spots: [] };
  makeGroups(th, style, rng(seed));
  layout(style);
  bakeLight();
  const room = { groups: R.g, blocks: R.blocks, spots: R.spots };
  R = null;
  return room;
}

function makeTexture(spec) {
  const cv = document.createElement('canvas');
  cv.width = spec.size;
  cv.height = spec.size;
  spec.draw(cv.getContext('2d'), spec.size);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = spec.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

// Builds the room for one house style. Returns { group, blocks }.
//   group  : the 3D room (put it in the scene)
//   blocks : the floor space taken by furniture (so the player cannot walk through it)
export function buildInterior(style) {
  const room = bakeRoom(style);
  const group = new THREE.Group();
  Object.values(room.groups).forEach((s) => {
    if (!s.idx.length) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(s.pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(s.uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(s.col, 3));
    geo.setIndex(new THREE.BufferAttribute(new Uint32Array(s.idx), 1));
    const mat = new THREE.MeshBasicMaterial({
      vertexColors: s.vertexColors,
      map: s.tex ? makeTexture(s.tex) : null,
      fog: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    group.add(mesh);
  });
  return { group, blocks: room.blocks, spots: room.spots };
}

// Pushes the player out of any furniture. (rx, rz) = the room's middle in the world.
export function pushOutOfFurniture(blocks, rx, rz, player, radius = 0.4) {
  const px = player.x - rx;
  const pz = player.z - rz;
  for (const b of blocks) {
    const x0 = b.x0 - radius, x1 = b.x1 + radius, z0 = b.z0 - radius, z1 = b.z1 + radius;
    if (px <= x0 || px >= x1 || pz <= z0 || pz >= z1) continue;
    const left = px - x0, right = x1 - px, back = pz - z0, front = z1 - pz;
    const m = Math.min(left, right, back, front);
    if (m === left) player.x = rx + x0;
    else if (m === right) player.x = rx + x1;
    else if (m === back) player.z = rz + z0;
    else player.z = rz + z1;
    return;
  }
}
