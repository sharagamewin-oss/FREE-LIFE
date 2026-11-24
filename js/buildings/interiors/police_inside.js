// =====================================================
// INTERIOR: ROYAL GUARD HEADQUARTERS   (2 floors, joined by stairs)
// Navy + gold, marble checker floors, pillars, chandeliers, banners, portraits.
// Ground: grand front desk, waiting hall, wanted wall, weapons rack, evidence room,
//         holding area (3 cells), reception clerk.
// Floor 1: commander's office, detective room, interrogation, briefing, lockers, dorm.
// Uses the room size from inside_common.js (x -18..18, z -12..12, floors at y 0 and 6).
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed, HALF_W, HALF_D, CLEAR } from './inside_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'desk', label: 'Front desk', x: 0, z: -5.2, floor: 0 });

const GOLD = 0xd4a935, GOLD_D = 0xa87f1e, NAVY = 0x14234d, NAVY_L = 0x22397a, ROYAL = 0x1f4fb8;
const RED = 0x9b1c2c, VEL = 0x8a1a2e, VEL_L = 0xa3243b, WOOD = 0x3a2418, WOOD_L = 0x5a3a22;
const MARBLE = 0xf3f0ea, BLACK = 0x1b1b22, CREAM = 0xe9ddbd, STEEL = 0x7d8794, STEEL_L = 0xb9c2cf;
const BARS = 0xb5ab85, GREEN = 0x2f7d3a, SKIN = 0xe0b48f, PAPER = 0xe6d8b0, WALLC = 0x1b2b5e;
const BG = [0x6b2a2a, 0x2a4a6b, 0x3a5a3a, 0x5a4a2a];

export function build(b, c) {
  const TT = (f) => plan.floors[f].top;
  const S = (col, cx, cz, w, d, h, f = 0, lift = 0) => solidBox(b, plan, col, cx, cz, w, d, h, f, lift);

  // A flat "face" on a wall: axis 'x' = wall runs along x (at z = wp), 'z' = runs along z (at x = wp).
  // s = +1/-1 = which way the face looks. box(col, along, h, thick, alongPos, y, offsetFromWall)
  const FB = (axis, wp, s) => ({
    box(col, along, h, t, a, y, off = 0) {
      if (axis === 'x') b.box(col, along, h, t, a, y, wp + s * (off + t / 2));
      else b.box(col, t, h, along, wp + s * (off + t / 2), y, a);
    },
    pt(a, y, off) { return axis === 'x' ? [a, y, wp + s * off] : [wp + s * off, y, a]; }
  });

  // ---------- wall decorations ----------
  function banner(fb, a, y0, w, h) {
    fb.box(GOLD, w + 0.24, 0.08, 0.07, a, y0 + h, 0);
    fb.box(ROYAL, w, h, 0.04, a, y0, 0.03);
    fb.box(GOLD, w, 0.07, 0.05, a, y0 + h - 0.3, 0.05);
    fb.box(GOLD, w, 0.12, 0.05, a, y0, 0.05);
    fb.box(GOLD, w * 0.42, w * 0.42, 0.05, a, y0 + h * 0.45, 0.06);
    fb.box(NAVY, w * 0.3, w * 0.3, 0.06, a, y0 + h * 0.45 + w * 0.06, 0.07);
    [-1, 1].forEach((k) => b.dot(GOLD, 0.13, ...fb.pt(a + k * (w / 2 + 0.12), y0 + h, 0.06)));
    [-1, 1].forEach((k) => b.dot(GOLD, 0.1, ...fb.pt(a + k * w * 0.38, y0 - 0.04, 0.07)));
  }
  function portrait(fb, a, y0, w, h, i = 0) {
    fb.box(GOLD, w + 0.2, h + 0.2, 0.05, a, y0 - 0.1, 0);
    fb.box(WOOD, w + 0.08, h + 0.08, 0.06, a, y0 - 0.04, 0);
    fb.box(BG[i % 4], w, h, 0.07, a, y0, 0);
    fb.box(NAVY_L, w * 0.66, h * 0.34, 0.09, a, y0, 0);
    fb.box(GOLD, w * 0.16, 0.06, 0.1, a - w * 0.25, y0 + h * 0.3, 0);
    fb.box(GOLD, w * 0.16, 0.06, 0.1, a + w * 0.25, y0 + h * 0.3, 0);
    b.ball(SKIN, w * 0.36, ...fb.pt(a, y0 + h * 0.52, 0.1));
    b.ball(0x2a2a30, w * 0.4, ...fb.pt(a, y0 + h * 0.6, 0.08), 0.6);
    b.dot(RED, w * 0.1, ...fb.pt(a, y0 + h * 0.74, 0.1));
  }
  function wantedPoster(fb, a, y0) {
    fb.box(PAPER, 0.8, 1.0, 0.03, a, y0, 0.07);
    fb.box(RED, 0.7, 0.14, 0.035, a, y0 + 0.8, 0.09);
    fb.box(0x44485a, 0.45, 0.25, 0.035, a, y0 + 0.12, 0.09);
    b.ball(0x6b4a3a, 0.3, ...fb.pt(a, y0 + 0.5, 0.12));
    fb.box(GOLD, 0.5, 0.07, 0.04, a, y0 + 0.03, 0.1);
    b.dot(0x555555, 0.07, ...fb.pt(a, y0 + 0.97, 0.12));
  }
  function crest(y) {                      // the big crest on the north wall
    const z0 = -HALF_D;
    b.cylZ(GOLD, 3.6, 0.08, 0, y, z0 + 0.04);
    b.cylZ(NAVY_L, 3.3, 0.11, 0, y, z0 + 0.055);
    b.cylZ(GOLD, 3.05, 0.13, 0, y, z0 + 0.065);
    b.cylZ(NAVY, 2.85, 0.15, 0, y, z0 + 0.075);
    const zf = z0 + 0.15;
    b.box(GOLD, 1.5, 1.8, 0.06, 0, y - 0.9, zf);
    b.box(ROYAL, 1.34, 1.64, 0.08, 0, y - 0.82, zf);
    b.box(GOLD, 0.14, 1.64, 0.1, 0, y - 0.82, zf);
    b.box(GOLD, 1.34, 0.14, 0.1, 0, y - 0.1, zf);
    [-0.8, 0.8].forEach((r) => b.slab(0xd5dbe3, 0.09, 2.5, 0.05, 0, y, zf + 0.12, 0, 0, r));
    [-0.8, 0.8].forEach((r) => b.slab(GOLD, 0.34, 0.07, 0.07, -Math.sin(r) * -0.95 * -1, y - Math.cos(r) * 0.95, zf + 0.13, 0, 0, r));
    b.box(GOLD, 1.0, 0.16, 0.12, 0, y + 0.9, zf);
    [-0.4, 0, 0.4].forEach((x) => { b.cone(GOLD, 0.22, 0.38, x, y + 1.06, zf + 0.02); b.dot(RED, 0.1, x, y + 1.48, zf + 0.04); });
    for (let i = 0; i <= 8; i++) {
      const th = (200 + i * 17.5) * Math.PI / 180;
      b.ellip(0x3f9a4a, 0.34, 0.13, 0.08, 1.55 * Math.cos(th), y + 1.55 * Math.sin(th), zf - 0.04, 0, 0, th + Math.PI / 2);
    }
    for (let i = 0; i < 6; i++) b.dot(GOLD, 0.14, -1.55 + i * 0.62, y + 1.7 - Math.abs(i - 2.5) * 0.12, zf - 0.04);
  }

  // ---------- partition walls (solid) ----------
  // axis 'x': runs along x at z = wp, from a0 to a1.  axis 'z': runs along z at x = wp.  gaps = doorways.
  function wall(axis, wp, a0, a1, f, gaps = [], deco = true, col = WALLC) {
    const H = 3.8, TH = 0.25, Tf = TT(f);
    const segs = [];
    let p = a0;
    gaps.forEach(([g0, g1]) => { if (g0 > p) segs.push([p, g0]); p = g1; });
    if (p < a1) segs.push([p, a1]);
    const fw = FB(axis, wp - TH / 2, 1);
    let n = 0;
    segs.forEach(([s0, s1]) => {
      const len = s1 - s0, mid = (s0 + s1) / 2;
      if (axis === 'x') S(col, mid, wp, len, TH, H, f); else S(col, wp, mid, TH, len, H, f);
      fw.box(GOLD, len + 0.04, 0.08, TH + 0.06, mid, Tf + H, -0.03);
      fw.box(GOLD_D, len, 0.16, TH + 0.04, mid, Tf, -0.02);
      fw.box(GOLD, len, 0.06, TH + 0.04, mid, Tf + 1.0, -0.02);
      if (deco && len >= 1.7) {
        const k = Math.max(1, Math.floor(len / 2.6));
        for (let i = 0; i < k; i++) {
          const a = s0 + (len * (i + 0.5)) / k;
          [1, -1].forEach((s) => {
            const fb = FB(axis, wp + s * TH / 2, s);
            if ((n + (s > 0 ? 0 : 1)) % 2 === 0) banner(fb, a, Tf + 1.1, 0.9, 2.4);
            else portrait(fb, a, Tf + 1.5, 0.8, 1.1, n + i);
          });
          n++;
        }
      }
    });
    gaps.forEach(([g0, g1]) => {          // lintel + jambs over every doorway (decoration, above head)
      fw.box(col, g1 - g0, H - 2.7, TH, (g0 + g1) / 2, Tf + 2.7, 0);
      fw.box(GOLD, g1 - g0 + 0.16, 0.08, TH + 0.06, (g0 + g1) / 2, Tf + 2.7, -0.03);
      fw.box(GOLD, 0.08, 2.7, TH + 0.06, g0, Tf, -0.03);
      fw.box(GOLD, 0.08, 2.7, TH + 0.06, g1, Tf, -0.03);
    });
  }

  // ---------- furniture helpers ----------
  function royalDesk(cx, cz, w, d, h, f) {
    const Tf = TT(f);
    S(WOOD, cx, cz, w, d, h, f);
    b.box(WOOD_L, w + 0.12, 0.07, d + 0.12, cx, Tf + h, cz);
    b.box(0x1c2f5e, w - 0.2, 0.012, d - 0.2, cx, Tf + h + 0.07, cz);
    [-1, 1].forEach((k) => {
      b.box(GOLD, w + 0.14, 0.04, 0.05, cx, Tf + h + 0.07, cz + k * (d / 2 + 0.03));
      b.box(GOLD, 0.05, 0.04, d + 0.14, cx + k * (w / 2 + 0.03), Tf + h + 0.07, cz);
    });
    b.box(GOLD, w, 0.1, 0.04, cx, Tf, cz + d / 2);
    const n = Math.floor(w / 1.0);
    for (let i = 0; i < n; i++) {
      const x = cx - w / 2 + (w * (i + 0.5)) / n;
      b.box(NAVY_L, 0.78, h * 0.55, 0.03, x, Tf + h * 0.2, cz + d / 2);
      b.box(GOLD, 0.84, 0.035, 0.04, x, Tf + h * 0.2 + h * 0.55, cz + d / 2);
      b.box(GOLD, 0.84, 0.035, 0.04, x, Tf + h * 0.2 - 0.03, cz + d / 2);
    }
  }
  function shelfUnit(cx, cz, w, d, h, f, axis, s, cols) {
    const Tf = TT(f);
    if (axis === 'x') S(WOOD, cx, cz, w, d, h, f); else S(WOOD, cx, cz, d, w, h, f);
    const wp = (axis === 'x' ? cz : cx) + s * d / 2;
    const fb = FB(axis, wp, s);
    const al = axis === 'x' ? cx : cz;
    const tiers = Math.max(2, Math.round(h / 0.55));
    const th = (h - 0.25) / tiers;
    for (let k = 0; k < tiers; k++) {
      const yb = Tf + 0.12 + k * th;
      fb.box(WOOD_L, w, 0.05, 0.12, al, yb, 0);
      let a = al - w / 2 + 0.12, n = 0;
      while (a < al + w / 2 - 0.2) {
        const iw = 0.13 + ((n * 7 + k * 3) % 4) * 0.04;
        const ih = (th - 0.1) * (0.62 + ((n * 5 + k) % 4) * 0.1);
        fb.box(cols[(n + k) % cols.length], iw, ih, 0.1, a + iw / 2, yb + 0.05, 0);
        a += iw + 0.02; n++;
      }
    }
    fb.box(GOLD, w + 0.06, 0.07, 0.16, al, Tf + h, 0);
  }
  function cabinet(cx, cz, w, d, h, f, axis, s) {
    const Tf = TT(f);
    if (axis === 'x') S(STEEL, cx, cz, w, d, h, f); else S(STEEL, cx, cz, d, w, h, f);
    const fb = FB(axis, (axis === 'x' ? cz : cx) + s * d / 2, s);
    const al = axis === 'x' ? cx : cz;
    [-1, 1].forEach((k) => {
      fb.box(0x6a7585, w / 2 - 0.06, h - 0.2, 0.03, al + k * w / 4, Tf + 0.1, 0);
      fb.box(GOLD, 0.04, 0.26, 0.05, al + k * 0.07, Tf + h * 0.5, 0.02);
    });
    fb.box(GOLD, 0.13, 0.15, 0.06, al, Tf + h * 0.42, 0.03);
    fb.box(GOLD_D, w + 0.04, 0.05, 0.06, al, Tf + h, 0);
  }
  function bench(cx, cz, len, dir, f) {      // velvet bench; dir = way you face: N S W E
    const Tf = TT(f), ax = dir === 'N' || dir === 'S';
    const bw = ax ? len : 0.55, bd = ax ? 0.55 : len;
    S(VEL, cx, cz, bw, bd, 0.5, f);
    b.box(GOLD, bw + 0.03, 0.06, bd + 0.03, cx, Tf, cz);
    b.box(VEL_L, bw - 0.08, 0.08, bd - 0.08, cx, Tf + 0.5, cz);
    const dz = dir === 'N' ? 1 : dir === 'S' ? -1 : 0, dx = dir === 'W' ? 1 : dir === 'E' ? -1 : 0;
    if (ax) {
      S(VEL, cx, cz + dz * 0.27, len, 0.12, 0.55, f, 0.5);
      b.box(GOLD, len + 0.04, 0.05, 0.16, cx, Tf + 1.05, cz + dz * 0.27);
    } else {
      S(VEL, cx + dx * 0.27, cz, 0.12, len, 0.55, f, 0.5);
      b.box(GOLD, 0.16, 0.05, len + 0.04, cx + dx * 0.27, Tf + 1.05, cz);
    }
    const ang = { N: Math.PI, S: 0, W: -Math.PI / 2, E: Math.PI / 2 }[dir];
    [-len / 4, len / 4].forEach((o) => plan.spots.push({ kind: 'sit', x: ax ? cx + o : cx, y: Tf + 0.55, z: ax ? cz : cz + o, a: ang }));
  }
  function urn(x, z, f) {
    const Tf = TT(f);
    S(GOLD_D, x, z, 0.5, 0.5, 0.55, f);
    b.cyl(GOLD, 0.62, 0.08, x, Tf + 0.55, z);
    b.ellip(GREEN, 0.75, 0.9, 0.75, x, Tf + 1.1, z);
    b.ellip(0x3a9a4a, 0.5, 0.6, 0.5, x + 0.15, Tf + 1.5, z - 0.05);
    b.dot(0xe8b83a, 0.1, x - 0.2, Tf + 1.3, z + 0.25);
  }
  function armor(x, z, f) {
    const Tf = TT(f);
    S(0x30333c, x, z, 0.7, 0.7, 0.18, f);
    S(STEEL_L, x, z, 0.34, 0.26, 0.7, f, 0.18);
    S(STEEL_L, x, z, 0.5, 0.32, 0.7, f, 0.88);
    b.ball(0xcfd6e0, 0.36, x, Tf + 1.78, z);
    b.cone(RED, 0.14, 0.34, x, Tf + 1.92, z);
    b.box(GOLD, 0.16, 0.16, 0.04, x, Tf + 1.15, z + 0.17);
    [-1, 1].forEach((k) => { b.ball(GOLD, 0.2, x + k * 0.3, Tf + 1.5, z); b.box(STEEL_L, 0.12, 0.6, 0.12, x + k * 0.34, Tf + 0.9, z); });
    b.cyl(WOOD_L, 0.05, 2.2, x + 0.42, Tf + 0.18, z);
    b.cone(GOLD, 0.11, 0.28, x + 0.42, Tf + 2.38, z);
  }
  function flagStand(x, z, f, dir) {
    const Tf = TT(f);
    S(NAVY, x, z, 0.45, 0.45, 0.15, f);
    b.cyl(GOLD_D, 0.07, 3.4, x, Tf + 0.15, z);
    b.ball(GOLD, 0.17, x, Tf + 3.62, z);
    b.box(ROYAL, 1.5, 1.0, 0.04, x + dir * 0.8, Tf + 2.4, z);
    b.box(GOLD, 1.5, 0.08, 0.05, x + dir * 0.8, Tf + 2.4, z);
    b.box(GOLD, 1.5, 0.08, 0.05, x + dir * 0.8, Tf + 3.32, z);
    b.box(GOLD, 0.4, 0.4, 0.05, x + dir * 0.8, Tf + 2.7, z);
    b.box(NAVY, 0.26, 0.26, 0.06, x + dir * 0.8, Tf + 2.77, z);
  }
  function monitor(cx, cz, Tf, y) {          // faces +z
    b.box(0x222228, 0.12, 0.2, 0.1, cx, Tf + y, cz);
    b.box(0x15171c, 0.64, 0.4, 0.05, cx, Tf + y + 0.18, cz);
    b.box(0x2a8fd0, 0.58, 0.34, 0.03, cx, Tf + y + 0.21, cz + 0.03);
    b.box(0x9be0ff, 0.2, 0.05, 0.035, cx - 0.1, Tf + y + 0.4, cz + 0.035);
    b.box(0x2c2c34, 0.5, 0.025, 0.16, cx, Tf + y, cz + 0.3);
    b.dot(0x2c2c34, 0.08, cx + 0.4, Tf + y + 0.02, cz + 0.3);
  }
  function detectiveDesk(cx, cz) {
    const Tf = TT(1);
    S(WOOD_L, cx, cz, 2.2, 1.0, 0.78, 1);
    b.box(0x213a66, 2.0, 0.012, 0.8, cx, Tf + 0.78, cz);
    b.box(GOLD, 2.2, 0.04, 0.04, cx, Tf + 0.78, cz + 0.5);
    monitor(cx, cz - 0.22, Tf, 0.78);
    b.box(0xffffff, 0.28, 0.012, 0.2, cx + 0.7, Tf + 0.79, cz);
    b.box(RED, 0.3, 0.05, 0.22, cx - 0.75, Tf + 0.79, cz - 0.1);
    addChair(b, plan, cx, cz + 1.0, 1, Math.PI, 0x2c3e7a);
  }
  function chand(x, z, Tf, k = 1) {
    b.cyl(GOLD_D, 0.06, 1.2, x, Tf + 4.15, z);
    b.cyl(GOLD, 0.45, 0.15, x, Tf + 4.05, z);
    b.cyl(GOLD, 1.5 * k, 0.1, x, Tf + 3.9, z);
    b.box(GOLD, 1.4 * k, 0.06, 0.07, x, Tf + 3.98, z);
    b.box(GOLD, 0.07, 0.06, 1.4 * k, x, Tf + 3.98, z);
    b.ball(GOLD, 0.36, x, Tf + 3.7, z);
    b.dot(0xdff3ff, 0.16, x, Tf + 3.45, z);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4, cx = x + Math.cos(a) * 0.72 * k, cz = z + Math.sin(a) * 0.72 * k;
      b.cyl(CREAM, 0.09, 0.2, cx, Tf + 4.0, cz);
      b.dot(0xffd35a, 0.1, cx, Tf + 4.26, cz);
      if (i % 2 === 0) b.dot(0xdff3ff, 0.1, cx, Tf + 3.78, cz);
    }
  }
  function pillar(x, z, f) {
    const Tf = TT(f);
    b.cyl(GOLD, 1.1, 0.25, x, Tf, z);
    b.cyl(MARBLE, 0.8, 4.6, x, Tf + 0.25, z);
    b.cyl(0xd2cdc0, 0.84, 0.1, x, Tf + 1.6, z);
    b.cyl(GOLD_D, 0.88, 0.1, x, Tf + 4.65, z);
    b.cyl(GOLD, 1.0, 0.2, x, Tf + 4.85, z);
    b.cyl(GOLD, 1.25, 0.15, x, Tf + 5.05, z);
    b.box(GOLD, 1.3, 0.1, 1.3, x, Tf + 5.2, z);
    plan.blocks.push([x - 0.5, x + 0.5, z - 0.5, z + 0.5, Tf, Tf + 5.3]);
  }
  const ring = (Tf, y, h, d, col, door) => {
    const y0 = Tf + y;
    b.box(col, 2 * HALF_W, h, d, 0, y0, -HALF_D + d / 2);
    b.box(col, d, h, 2 * HALF_D, -HALF_W + d / 2, y0, 0);
    b.box(col, d, h, 2 * HALF_D, HALF_W - d / 2, y0, 0);
    if (door) {
      const len = HALF_W - 1.2;
      [-1, 1].forEach((k) => b.box(col, len, h, d, k * (1.2 + len / 2), y0, HALF_D - d / 2));
    } else b.box(col, 2 * HALF_W, h, d, 0, y0, HALF_D - d / 2);
  };

  // ---------- shell, stairs, floors ----------
  shell(b, plan, { floor: MARBLE, floorAlt: MARBLE, wall: WALLC, ceiling: CREAM, trim: GOLD, glass: 0xbfe3ff });
  addStairs(b, plan, 0, { stair: 0x24376e, tread: RED, trim: GOLD_D });

  const hole = plan.holes[0].rect;
  [0, 1].forEach((f) => {
    const Tf = TT(f);
    for (let i = 0; i < HALF_W; i++) {          // black marble tiles (2 x 2 m) in a checker pattern
      for (let j = 0; j < HALF_D; j++) {
        if ((i + j) % 2) continue;
        const x0 = -HALF_W + 2 * i, z0 = -HALF_D + 2 * j;
        let x1 = x0 + 2;
        if (f === 1 && x1 > hole[0] && z0 < hole[3] && z0 + 2 > hole[2]) x1 = Math.min(x1, hole[0]);
        if (x1 - x0 < 0.05) continue;
        b.box(BLACK, x1 - x0, 0.015, 2, (x0 + x1) / 2, Tf, z0 + 1);
      }
    }
    ring(Tf, 0.18, 0.8, 0.05, 0x0f1a3f, f === 0);       // navy wainscot
    ring(Tf, 1.0, 0.08, 0.09, GOLD, f === 0);           // gold dado rail
    ring(Tf, CLEAR - 0.45, 0.1, 0.14, GOLD_D, false);   // cornice
    ring(Tf, CLEAR - 0.35, 0.3, 0.1, GOLD, false);
    [-6, 0, 6].forEach((z) => {                         // ceiling beams
      b.box(NAVY_L, 33.5, 0.2, 0.45, -1.25, Tf + 5.2, z);
      b.box(GOLD, 33.5, 0.04, 0.5, -1.25, Tf + 5.16, z);
    });
  });

  // =====================================================
  // GROUND FLOOR
  // =====================================================
  const T0 = TT(0);

  // red carpet runner with gold borders, door -> desk
  b.box(RED, 3.0, 0.03, 17.6, 0, T0, 3.1);
  [-1, 1].forEach((k) => {
    b.box(GOLD, 0.14, 0.035, 17.6, k * 1.57, T0, 3.1);
    b.box(0x5a0f1c, 0.06, 0.04, 17.6, k * 1.38, T0, 3.1);
  });
  [9, 5, 1, -3].forEach((z) => { b.cyl(GOLD, 0.8, 0.04, 0, T0, z); b.cyl(NAVY_L, 0.6, 0.045, 0, T0, z); b.cyl(GOLD, 0.3, 0.05, 0, T0, z); });
  b.box(GOLD, 3.3, 0.04, 0.12, 0, T0, -5.75);

  // marble pillars along both sides
  [-9.5, 9.5].forEach((x) => [9, 5, 1, -3].forEach((z) => pillar(x, z, 0)));

  // chandeliers
  [[0, 8], [0, 2], [0, -3], [-13, 6], [13, 0], [-13, -3], [12, 9]].forEach(([x, z]) => chand(x, z, T0));

  // crest + banners / portraits on the walls
  crest(T0 + 3.1);
  const N0 = FB('x', -HALF_D, 1), S0 = FB('x', HALF_D, -1), W0 = FB('z', -HALF_W, 1), E0 = FB('z', HALF_W, -1);
  [-10.8, -3.6, 3.6, 10.8].forEach((x) => banner(N0, x, T0 + 1.2, 1.4, 3.2));
  [-10.8, -3.8, 3.8, 10.8].forEach((x) => banner(S0, x, T0 + 1.2, 1.4, 3.2));
  [3.5, 6.4].forEach((z) => banner(W0, z, T0 + 1.2, 1.3, 3.2));
  portrait(W0, 4.95, T0 + 1.9, 1.0, 1.3, 1);
  [4.2, 1.2].forEach((z, i) => portrait(E0, z, T0 + 3.4, 1.0, 1.4, i));
  portrait(E0, -6.8, T0 + 1.9, 0.8, 1.1, 2);

  // wanted posters wall (west wall)
  const WP = FB('z', -HALF_W, 1);
  WP.box(WOOD, 4.6, 2.7, 0.06, -4.95, T0 + 1.0, 0);
  WP.box(GOLD, 4.7, 0.08, 0.08, -4.95, T0 + 3.7, 0);
  WP.box(GOLD, 4.7, 0.08, 0.08, -4.95, T0 + 0.94, 0);
  [-6.3, -5.4, -4.5, -3.6].forEach((z, i) => { wantedPoster(WP, z, T0 + 1.1); wantedPoster(WP, z + (i % 2 ? 0.1 : -0.1), T0 + 2.4); });

  // grand front desk (job spot at z -5.2 stands in front of it)
  royalDesk(0, -6.6, 8, 1.6, 1.1, 0);
  b.box(PAPER, 0.4, 0.04, 0.3, -2.4, T0 + 1.19, -6.5);
  b.box(RED, 0.5, 0.07, 0.35, -3.0, T0 + 1.19, -6.7);
  b.box(GOLD, 0.8, 0.12, 0.05, 0, T0 + 1.19, -6.1);
  b.ball(GOLD, 0.22, 2.2, T0 + 1.3, -6.4, 0.6);
  b.cyl(GOLD, 0.12, 0.2, 3.0, T0 + 1.19, -6.7);
  b.cyl(0x1a1a22, 0.08, 0.14, 1.2, T0 + 1.19, -6.5);
  b.box(0xffffff, 0.3, 0.02, 0.22, 1.6, T0 + 1.19, -6.8);
  addChair(b, plan, -1.8, -8.0, 0, 0, 0x6b2a2a);
  addChair(b, plan, 1.8, -8.0, 0, 0, 0x6b2a2a);
  [-1.8, 1.8].forEach((x) => b.box(VEL_L, 0.46, 0.05, 0.4, x, T0 + 0.5, -8.0));
  flagStand(-5.8, -10.8, 0, 1);
  flagStand(5.8, -10.8, 0, -1);
  // stanchions with ropes along the carpet
  [-1, 1].forEach((k) => [5, 2, -1].forEach((z) => {
    S(GOLD, k * 1.95, z, 0.16, 0.16, 1.0, 0);
    b.ball(GOLD, 0.2, k * 1.95, T0 + 1.08, z);
    if (z !== -1) b.slab(RED, 0.04, 0.04, 3.0, k * 1.95, T0 + 0.85, z - 1.5, 0, 0, 0);
  }));

  // waiting hall with velvet benches
  [4, 7].forEach((z) => { bench(-15.2, z, 3.0, 'N', 0); bench(-11.7, z, 3.0, 'N', 0); });
  S(WOOD, -13.5, 5.5, 1.2, 0.7, 0.45, 0);
  b.box(GOLD, 1.3, 0.04, 0.8, -13.5, T0 + 0.45, 5.5);
  b.box(PAPER, 0.35, 0.02, 0.25, -13.7, T0 + 0.49, 5.5);
  b.box(RED, 0.3, 0.03, 0.2, -13.2, T0 + 0.49, 5.5);
  b.box(RED, 7.0, 0.025, 3.4, -13.4, T0, 5.5);
  b.box(GOLD, 7.0, 0.03, 0.08, -13.4, T0, 3.8);
  b.box(GOLD, 7.0, 0.03, 0.08, -13.4, T0, 7.2);
  b.box(RED, 7.0, 0.025, 3.4, -13.4, T0, 5.5);
  // east lounge benches
  bench(14.0, -2.5, 3.0, 'W', 0);
  bench(14.0, 2.0, 3.0, 'W', 0);
  S(WOOD, 12.0, -0.3, 0.8, 0.8, 0.45, 0);
  b.box(GOLD, 0.9, 0.04, 0.9, 12.0, T0 + 0.45, -0.3);
  // trophy cabinet
  S(WOOD, 13.2, -6.3, 2.4, 0.6, 1.0, 0);
  S(0x9cc8e0, 13.2, -6.3, 2.3, 0.5, 1.0, 0, 1.0);
  b.cyl(GOLD, 0.3, 0.4, 12.4, T0 + 1.0, -6.3);
  b.cyl(GOLD, 0.24, 0.55, 13.2, T0 + 1.0, -6.3);
  b.ball(GOLD, 0.2, 14.0, T0 + 1.2, -6.3);
  b.box(GOLD, 2.4, 0.08, 0.65, 13.2, T0 + 2.0, -6.3);

  // weapons display rack (two-sided)
  S(WOOD, 13.4, 9.0, 4.4, 0.7, 0.9, 0);
  b.box(GOLD, 4.5, 0.06, 0.8, 13.4, T0 + 0.9, 9.0);
  S(NAVY, 13.4, 9.0, 4.4, 0.16, 1.9, 0, 0.9);
  b.box(GOLD, 4.6, 0.1, 0.3, 13.4, T0 + 2.8, 9.0);
  [[8.92, -1], [9.08, 1]].forEach(([zp, s]) => {
    const fb = FB('x', zp, s);
    [12.0, 14.8].forEach((x) => {
      [-0.7, 0.7].forEach((r) => b.slab(0xd5dbe3, 0.08, 1.3, 0.03, ...fb.pt(x, T0 + 1.85, 0.04), 0, 0, r));
      b.box(GOLD, 0.34, 0.06, 0.05, x, T0 + 1.3, zp + s * 0.05);
    });
    b.ellip(ROYAL, 0.75, 1.0, 0.12, ...fb.pt(13.4, T0 + 1.85, 0.07));
    b.ball(GOLD, 0.24, ...fb.pt(13.4, T0 + 1.85, 0.14));
  });
  [11.6, 12.5, 14.3, 15.2].forEach((x, i) => {
    const z = i % 2 ? 8.75 : 9.25;
    b.cyl(WOOD_L, 0.05, 1.7, x, T0 + 0.96, z);
    b.cone(GOLD, 0.11, 0.26, x, T0 + 2.66, z);
  });
  [-1, 1].forEach((k) => { armor(k * 5.4, 11.2, 0); urn(k * 3.7, 11.3, 0); });

  // reception clerk desk with a computer
  royalDesk(6.0, 8.8, 3.2, 0.9, 1.0, 0);
  monitor(6.0, 8.65, T0, 1.07);
  b.box(PAPER, 0.3, 0.02, 0.22, 5.1, T0 + 1.08, 8.8);
  b.box(GOLD, 0.5, 0.1, 0.05, 6.9, T0 + 1.08, 9.1);
  addChair(b, plan, 6.0, 10.0, 0, Math.PI, 0x6b2a2a);
  cabinet(6.0, 11.55, 2.4, 0.6, 1.6, 0, 'x', -1);

  // evidence room (x 9..18, z -12..-7): shelves + locked cabinets
  wall('z', 9, -HALF_D, -7, 0, []);
  wall('x', -7, 9, HALF_W, 0, [[10.0, 11.8]]);
  [10.6, 13.0, 15.4].forEach((x) => shelfUnit(x, -11.7, 2.2, 0.5, 2.0, 0, 'x', 1, [0x8a6a3a, 0xc9c0a6, 0x6a7585, 0x9b1c2c, 0x2a4a6b]));
  cabinet(9.65, -9.7, 1.3, 0.6, 1.9, 0, 'z', 1);
  cabinet(9.65, -8.2, 1.3, 0.6, 1.9, 0, 'z', 1);
  cabinet(17.7, -9.3, 2.6, 0.5, 1.6, 0, 'z', -1);
  S(WOOD_L, 13.2, -9.2, 3.0, 1.2, 0.85, 0);
  b.box(GOLD, 3.1, 0.05, 1.3, 13.2, T0 + 0.85, -9.2);
  [11.9, 12.8, 14.2].forEach((x, i) => b.box(i === 1 ? 0xdedede : 0xc9c0a6, 0.36, 0.14, 0.26, x, T0 + 0.9, -9.2 + (i - 1) * 0.2));
  S(0x8a6a3a, 16.9, -8.0, 0.8, 0.8, 0.8, 0);
  S(0x7a5a2a, 16.9, -8.0, 0.7, 0.7, 0.7, 0, 0.8);

  // holding area: 3 cells along the north wall, open to walk in
  const cells = [[-HALF_W, -14.6], [-14.6, -11.2], [-11.2, -7.8]];
  const ZF = -8;
  [-17.9, -14.6, -11.2, -7.8].forEach((x) => {
    S(0x8f8668, x, ZF, 0.16, 0.16, 3.15, 0);
    S(0x5a6070, x, (ZF - HALF_D) / 2, 0.2, HALF_D + ZF, 1.9, 0);
    b.box(GOLD_D, 0.26, 0.06, HALF_D + ZF, x, T0 + 1.9, (ZF - HALF_D) / 2);
    for (let z = -11.7; z < ZF - 0.1; z += 0.2) b.box(BARS, 0.035, 1.15, 0.035, x, T0 + 2.0, z);
  });
  cells.forEach(([x0, x1], i) => {
    const cx = (x0 + x1) / 2;
    [[x0 + 0.1, cx - 0.6], [cx + 0.6, x1 - 0.1]].forEach(([a0, a1]) => {
      S(BARS, (a0 + a1) / 2, ZF, a1 - a0, 0.1, 0.3, 0);
      S(0x8f8668, (a0 + a1) / 2, ZF, a1 - a0, 0.12, 0.15, 0, 3.0);
      for (let x = a0 + 0.1; x < a1 - 0.02; x += 0.14) b.box(BARS, 0.035, 2.7, 0.035, x, T0 + 0.3, ZF);
    });
    S(0x8f8668, cx - 0.6, ZF, 0.14, 0.14, 3.15, 0);
    S(0x8f8668, cx + 0.6, ZF, 0.14, 0.14, 3.15, 0);
    b.box(GOLD, 1.3, 0.3, 0.06, cx, T0 + 2.75, ZF + 0.06);
    for (let k = 0; k <= i; k++) b.dot(NAVY, 0.12, cx - i * 0.12 + k * 0.24, T0 + 2.9, ZF + 0.1);
    addBed(b, plan, x0 + 1.0, -10.7, 0, 0, 0x555a66, 0x8a94a3);
    S(0xf2f2f2, x1 - 0.45, -11.6, 0.5, 0.55, 0.4, 0);
    b.cyl(0xdddddd, 0.4, 0.05, x1 - 0.45, T0 + 0.4, -11.6);
    b.box(0x9ca6b4, 0.4, 0.2, 0.08, x1 - 0.45, T0 + 1.0, -11.9);
  });
  b.box(0x3a3a44, 11.0, 0.015, 4.0, -12.9, T0, -10);
  b.box(GOLD, 10.4, 0.1, 0.06, -12.8, T0 + 3.17, ZF);

  // =====================================================
  // FLOOR 1
  // =====================================================
  const T1 = TT(1);
  [[-11, -8.3], [0, -8], [7.2, -8.2], [-10, 1], [3, 1], [-11, 9], [3.6, 9], [14.5, -8], [14, 9]].forEach(([x, z]) => chand(x, z, T1, 0.9));

  // partition walls (z axis rooms)
  wall('x', -4.6, -HALF_W, 10.8, 1, [[-9.0, -7.4], [1.4, 3.0], [4.2, 5.8]]);
  wall('z', -3.6, -HALF_D, -4.6, 1, []);
  wall('z', 3.6, -HALF_D, -4.6, 1, []);
  wall('z', 10.8, -HALF_D, -4.6, 1, []);
  wall('x', 6, -HALF_W, 10.8, 1, [[-9.8, -8.2], [3.5, 5.1]]);
  wall('z', -3.6, 6, HALF_D, 1, []);
  wall('z', 10.8, 6, HALF_D, 1, [[7.4, 9.0]]);

  // perimeter wall decoration
  const N1 = FB('x', -HALF_D, 1), S1 = FB('x', HALF_D, -1), W1 = FB('z', -HALF_W, 1), E1 = FB('z', HALF_W, -1);
  portrait(N1, -10.8, T1 + 2.9, 1.4, 1.6, 0);
  [-10.8, 1.2].forEach((x) => banner(S1, x, T1 + 1.2, 1.4, 3.2));
  portrait(W1, -6.2, T1 + 2.0, 0.9, 1.2, 3);
  banner(W1, 6.75, T1 + 1.2, 1.0, 3.0);
  [-3, 3].forEach((z) => banner(E1, z, T1 + 1.5, 1.3, 3.0));
  portrait(E1, 0, T1 + 2.2, 1.0, 1.4, 1);

  // commander's office
  b.box(RED, 8.0, 0.025, 4.8, -10.8, T1, -7.6);
  b.box(GOLD, 8.2, 0.03, 0.1, -10.8, T1, -10.0);
  b.box(GOLD, 8.2, 0.03, 0.1, -10.8, T1, -5.2);
  royalDesk(-10.8, -7.3, 5.0, 1.9, 1.05, 1);
  b.box(GOLD, 0.9, 0.12, 0.05, -10.8, T1 + 1.14, -6.6);
  b.box(RED, 0.5, 0.08, 0.35, -12.2, T1 + 1.14, -7.4);
  b.box(PAPER, 0.45, 0.03, 0.3, -9.2, T1 + 1.14, -7.2);
  b.cyl(0x1a1a22, 0.1, 0.16, -9.6, T1 + 1.14, -7.7);
  b.ball(GOLD, 0.26, -11.7, T1 + 1.3, -7.6, 0.7);
  b.cone(GOLD, 0.2, 0.28, -10.0, T1 + 1.14, -7.9);
  addChair(b, plan, -10.8, -9.0, 1, 0, GOLD_D);
  b.box(VEL_L, 0.46, 0.06, 0.4, -10.8, T1 + 0.5, -9.0);
  S(ROYAL, -10.8, -9.5, 1.2, 0.18, 2.3, 1, 0.1);
  b.box(GOLD, 1.3, 0.12, 0.24, -10.8, T1 + 2.4, -9.5);
  b.box(GOLD, 0.9, 0.5, 0.2, -10.8, T1 + 1.6, -9.4);
  [-0.62, 0.62].forEach((k) => { b.ball(GOLD, 0.2, -10.8 + k, T1 + 2.55, -9.5); S(GOLD, -10.8 + k * 0.7, -9.0, 0.12, 0.7, 0.35, 1, 0.45); });
  [-12.2, -10.6].forEach((x) => addChair(b, plan, x, -5.7, 1, Math.PI, 0x2c3e7a));
  [-10.5, -8.4, -6.3].forEach((z) => shelfUnit(-3.95, z, 2.0, 0.45, 3.4, 1, 'z', -1, [RED, NAVY_L, GOLD, 0x3a5a3a, 0x6b4a2a, 0xe0d6bd]));
  S(WOOD, -16.4, -10.4, 0.6, 0.6, 1.0, 1);
  b.box(GOLD, 0.7, 0.06, 0.7, -16.4, T1 + 1.0, -10.4);
  b.cyl(GOLD_D, 0.04, 1.3, -16.4, T1 + 1.0, -10.4);
  b.ball(0x2f6fb8, 0.9, -16.4, T1 + 1.55, -10.4);
  b.ellip(0x3d8a4a, 0.4, 0.28, 0.3, -16.25, T1 + 1.65, -10.2);
  b.ellip(0x3d8a4a, 0.3, 0.22, 0.28, -16.6, T1 + 1.4, -10.2);
  flagStand(-5.3, -11.3, 1, -1);
  flagStand(-16.9, -5.4, 1, 1);

  // interrogation room
  S(STEEL, 0, -8.4, 2.2, 1.0, 0.8, 1);
  b.box(0x4a5260, 2.3, 0.05, 1.1, 0, T1 + 0.8, -8.4);
  b.cyl(GOLD_D, 0.2, 0.3, 0.7, T1 + 0.85, -8.4);
  b.cone(0x2a3a5a, 0.4, 0.2, 0.7, T1 + 1.1, -8.4);
  b.box(PAPER, 0.3, 0.02, 0.22, -0.5, T1 + 0.85, -8.4);
  addChair(b, plan, 0, -7.2, 1, Math.PI, 0x4a5260);
  addChair(b, plan, 0, -9.6, 1, 0, 0x4a5260);
  const MI = FB('z', -3.6 + 0.125, 1);
  MI.box(0x333a46, 3.0, 1.9, 0.06, -8.4, T1 + 1.1, 0);
  MI.box(0x9db4d0, 2.8, 1.7, 0.04, -8.4, T1 + 1.2, 0.05);
  MI.box(0xdbe8f7, 0.18, 1.7, 0.045, -8.9, T1 + 1.2, 0.07);
  MI.box(0xdbe8f7, 0.08, 1.7, 0.045, -8.55, T1 + 1.2, 0.07);
  MI.box(GOLD, 3.1, 0.06, 0.08, -8.4, T1 + 3.0, 0.05);

  // briefing room
  royalDesk(7.2, -8.2, 4.8, 1.3, 0.8, 1);
  b.box(NAVY_L, 4.4, 0.012, 0.5, 7.2, T1 + 0.87, -8.2);
  [5.4, 6.6, 7.8, 9.0].forEach((x) => { addChair(b, plan, x, -6.95, 1, Math.PI, 0x2c3e7a); addChair(b, plan, x, -9.45, 1, 0, 0x2c3e7a); });
  const MP = FB('z', 10.8 - 0.125, -1);
  MP.box(WOOD, 4.8, 2.6, 0.08, -8.3, T1 + 1.0, 0);
  MP.box(PAPER, 4.5, 2.3, 0.04, -8.3, T1 + 1.15, 0.06);
  MP.box(0x4a78b8, 1.6, 1.1, 0.045, -9.3, T1 + 1.5, 0.08);
  MP.box(0x4f9a52, 1.5, 0.9, 0.05, -7.4, T1 + 1.9, 0.09);
  MP.box(0xb89a5a, 1.0, 0.6, 0.05, -6.2, T1 + 1.3, 0.09);
  MP.box(GOLD, 4.8, 0.08, 0.1, -8.3, T1 + 3.6, 0);
  [[-9.6, 1.9], [-7.6, 2.3], [-6.0, 1.6], [-9.0, 1.3]].forEach(([z, y], i) => b.dot(i % 2 ? GOLD : RED, 0.12, ...MP.pt(z, T1 + y, 0.13)));
  shelfUnit(4.0, -10.5, 2.0, 0.4, 2.2, 1, 'z', 1, [PAPER, 0xc9b27a, 0x8a6a3a]);

  // landing near the stairs
  urn(11.8, -11.2, 1);
  urn(17.3, -11.2, 1);
  armor(11.8, -5.6, 1);

  // detective room: 6 desks with chairs and monitors
  [-14.6, -11.2, -7.8].forEach((x) => { detectiveDesk(x, -1.6); detectiveDesk(x, 2.6); });
  const EB = FB('z', -HALF_W, 1);
  EB.box(0xa8794a, 3.4, 2.0, 0.05, 4.2, T1 + 1.2, 0);
  EB.box(GOLD, 3.5, 0.07, 0.07, 4.2, T1 + 3.2, 0);
  [[3.2, 2.5], [4.0, 1.7], [4.8, 2.5], [5.3, 1.6], [3.6, 1.5]].forEach(([z, y], i) => {
    EB.box(i % 2 ? 0xffffff : PAPER, 0.4, 0.5, 0.03, z, T1 + y, 0.06);
    b.dot(RED, 0.08, ...EB.pt(z, T1 + y + 0.48, 0.1));
  });
  [[3.2, 2.8, 4.0, 2.0], [4.0, 2.0, 4.8, 2.8], [4.8, 2.8, 5.3, 1.9]].forEach(([z1, y1, z2, y2]) => {
    const dz = z2 - z1, dy = y2 - y1, L = Math.hypot(dz, dy);
    b.slab(RED, 0.015, 0.015, L, -HALF_W + 0.12, T1 + (y1 + y2) / 2, (z1 + z2) / 2, Math.atan2(-dy, dz), 0, 0);
  });
  cabinet(-17.55, -3.3, 1.4, 0.8, 1.5, 1, 'z', 1);
  cabinet(-17.55, -1.6, 1.4, 0.8, 1.5, 1, 'z', 1);
  // centre of the floor: royal rug and a guard statue
  b.cyl(GOLD, 5.3, 0.02, 3.6, T1, 0.7);
  b.cyl(RED, 5.0, 0.025, 3.6, T1, 0.7);
  b.cyl(GOLD, 3.0, 0.03, 3.6, T1, 0.7);
  b.cyl(NAVY, 2.8, 0.035, 3.6, T1, 0.7);
  S(MARBLE, 3.6, 0.7, 1.0, 1.0, 0.9, 1);
  b.box(GOLD, 1.1, 0.08, 1.1, 3.6, T1 + 0.9, 0.7);
  b.cyl(ROYAL, 0.5, 0.8, 3.6, T1 + 0.98, 0.7);
  b.ball(SKIN, 0.3, 3.6, T1 + 1.95, 0.7);
  b.cone(GOLD, 0.32, 0.3, 3.6, T1 + 2.02, 0.7);
  b.cyl(WOOD_L, 0.05, 2.0, 4.0, T1 + 0.98, 0.7);
  b.cone(GOLD, 0.11, 0.26, 4.0, T1 + 2.98, 0.7);
  bench(13.2, -1.0, 3.0, 'W', 1);
  bench(13.2, 3.0, 3.0, 'W', 1);

  // locker room
  [[-17.4, -10.2], [-7.8, -4.0]].forEach(([x0, x1]) => {
    S(0x3c4f86, (x0 + x1) / 2, 6.4, x1 - x0, 0.55, 2.0, 1);
    const fb = FB('x', 6.675, 1);
    for (let a = x0 + 0.25; a < x1; a += 0.5) {
      fb.box(Math.round(a * 2) % 2 ? 0x2f4a8f : 0x3a58a0, 0.46, 1.86, 0.03, a, T1 + 0.07, 0);
      fb.box(GOLD, 0.04, 0.2, 0.05, a + 0.15, T1 + 1.0, 0.03);
      fb.box(0x10182e, 0.3, 0.03, 0.035, a, T1 + 1.6, 0.02);
      fb.box(0x10182e, 0.3, 0.03, 0.035, a, T1 + 1.67, 0.02);
    }
    fb.box(GOLD, x1 - x0, 0.06, 0.1, (x0 + x1) / 2, T1 + 2.0, 0);
  });
  S(0x3c4f86, -10.7, 11.7, 13.4, 0.55, 1.9, 1);
  {
    const fb = FB('x', 11.425, -1);
    for (let a = -17.15; a < -4.0; a += 0.5) {
      fb.box(Math.round(a * 2) % 2 ? 0x2f4a8f : 0x3a58a0, 0.46, 1.76, 0.03, a, T1 + 0.07, 0);
      fb.box(GOLD, 0.04, 0.2, 0.05, a + 0.15, T1 + 0.95, 0.03);
      fb.box(0x10182e, 0.3, 0.03, 0.035, a, T1 + 1.5, 0.02);
    }
    fb.box(GOLD, 13.4, 0.06, 0.1, -10.7, T1 + 1.9, 0);
  }
  [-12.5, -6.5].forEach((x) => { S(WOOD_L, x, 9.0, 4.0, 0.55, 0.45, 1); b.box(GOLD, 4.05, 0.05, 0.6, x, T1 + 0.45, 9.0); b.box(NAVY_L, 3.8, 0.06, 0.5, x, T1 + 0.5, 9.0); });
  b.box(RED, 12, 0.02, 1.2, -10.8, T1, 9.0);

  // guards' dorm: 4 beds with royal blue covers
  [-1.8, 1.8, 5.4, 9.0].forEach((x) => addBed(b, plan, x, 10.9, 1, Math.PI, 0x3a2418, ROYAL));
  [0, 3.6, 7.2].forEach((x) => { S(WOOD, x, 11.5, 0.5, 0.5, 0.5, 1); b.box(GOLD, 0.52, 0.04, 0.52, x, T1 + 0.5, 11.5); });
  [[-3.1, 3.0], [5.6, 10.3]].forEach(([x0, x1]) => {
    S(WOOD_L, (x0 + x1) / 2, 6.45, x1 - x0, 0.55, 2.2, 1);
    for (let a = x0 + 0.35; a < x1; a += 0.7) b.box(NAVY_L, 0.62, 2.0, 0.03, a, T1 + 0.1, 6.74);
    b.box(GOLD, x1 - x0, 0.07, 0.6, (x0 + x1) / 2, T1 + 2.2, 6.45);
  });
  b.box(RED, 1.6, 0.02, 3.4, 3.7, T1, 8.0);

  // south-east lounge
  bench(14.4, 10.2, 3.0, 'N', 1);
  S(WOOD, 16.6, 11.5, 2.4, 0.6, 1.0, 1);
  S(0x9cc8e0, 16.6, 11.5, 2.3, 0.5, 1.1, 1, 1.0);
  b.cyl(GOLD, 0.3, 0.4, 16.0, T1 + 1.0, 11.5);
  b.ball(GOLD, 0.24, 17.2, T1 + 1.2, 11.5);
  b.box(GOLD, 2.4, 0.08, 0.65, 16.6, T1 + 2.1, 11.5);
  armor(11.8, 11.4, 1);
  urn(17.4, 7.5, 1);
}
