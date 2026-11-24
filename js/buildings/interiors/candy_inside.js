// =====================================================
// INTERIOR: ROYAL CONFECTIONERY PALACE   (2 floors, joined by stairs)
// Pink + white marble, gold-trimmed cream walls, rose-gold and burgundy accents.
// Ground: grand sales counter (job spot 'sell'), candy-jar walls, glass cases, chocolate fountain,
//         lollipop tree, cotton-candy machine, gift-box tower, tea salon.
// Floor 1: royal sweet kitchen, decorating table, packing room, bakers' dorm.
// Uses the room size from inside_common.js (x -18..18, z -12..12, floors at y 0 and 6).
// =====================================================
import { makePlan, shell, addStairs, solidBox, addChair, addBed, HALF_W, HALF_D, CLEAR } from './inside_common.js';

export const plan = makePlan(2);
plan.jobSpots.push({ id: 'sell', label: 'Sell candy', x: 0, z: -5.2, floor: 0 });

const GOLD = 0xd4a935, GOLD_D = 0xa87f1e, ROSEG = 0xb76e79, BURG = 0x6e1a35, BURG_L = 0x8c2748;
const PINK = 0xf4a6c0, PINK_D = 0xd9577f, PINK_L = 0xfbd5e3, PINK_T = 0xf4b6c8;
const CREAM = 0xf7ecd8, WHITE = 0xfffafc, MARBLE = 0xfdf4f7, CHOC = 0x4a2a1a, COPPER = 0xb8672e;
const WOOD = 0x4a2e22, WOOD_L = 0x7a5238, STEEL_L = 0xc9d1dc, GLASS = 0xcfeaf4;
const JAR = [0xff6b8b, 0xffb347, 0xffe066, 0x7ee081, 0x6ec6ff, 0xb28dff, 0xff9ad5, 0xffffff, 0xe0405a, 0x40e0d0];
const MAC = [0xffb3c7, 0xffe0a3, 0xb9f0c8, 0xc9b6ff, 0xa8dcff, 0xffc2a0];
const BG = [0xfbd5e3, 0xd8ecf8, 0xfff1c9, 0xe6d8f5];

export function build(b, c) {
  const TT = (f) => plan.floors[f].top;
  const S = (col, cx, cz, w, d, h, f = 0, lift = 0) => solidBox(b, plan, col, cx, cz, w, d, h, f, lift);
  const FB = (axis, wp, s) => ({
    box(col, along, h, t, a, y, off = 0) {
      if (axis === 'x') b.box(col, along, h, t, a, y, wp + s * (off + t / 2));
      else b.box(col, t, h, along, wp + s * (off + t / 2), y, a);
    },
    pt(a, y, off) { return axis === 'x' ? [a, y, wp + s * off] : [wp + s * off, y, a]; }
  });

  // ---------- wall decoration ----------
  function painting(fb, a, y0, w, h, i = 0) {
    fb.box(GOLD, w + 0.2, h + 0.2, 0.05, a, y0 - 0.1, 0);
    fb.box(BURG, w + 0.08, h + 0.08, 0.06, a, y0 - 0.04, 0);
    fb.box(BG[i % 4], w, h, 0.07, a, y0, 0);
    fb.box(PINK_D, w * 0.55, h * 0.22, 0.09, a, y0 + h * 0.12, 0);
    fb.box(WHITE, w * 0.4, h * 0.2, 0.1, a, y0 + h * 0.34, 0);
    fb.box(PINK, w * 0.26, h * 0.16, 0.11, a, y0 + h * 0.54, 0);
    b.ball(0xd62839, w * 0.12, ...fb.pt(a, y0 + h * 0.76, 0.11));
    fb.box(GOLD, w * 0.7, h * 0.05, 0.09, a, y0 + h * 0.1, 0);
  }
  function pennant(fb, a, y0, w, h) {
    fb.box(GOLD, w + 0.2, 0.07, 0.07, a, y0 + h, 0);
    fb.box(PINK_D, w, h, 0.04, a, y0, 0.03);
    fb.box(GOLD, w, 0.1, 0.05, a, y0, 0.05);
    fb.box(GOLD, w, 0.06, 0.05, a, y0 + h - 0.3, 0.05);
    b.ball(WHITE, w * 0.45, ...fb.pt(a, y0 + h * 0.5, 0.08));
    b.ball(PINK, w * 0.3, ...fb.pt(a, y0 + h * 0.5, 0.12));
    [-1, 1].forEach((k) => b.dot(GOLD, 0.12, ...fb.pt(a + k * (w / 2 + 0.1), y0 + h, 0.06)));
  }
  function curtain(fb, a, w, Tf) {
    const pw = 0.9;
    [-1, 1].forEach((sg) => {
      const pa = a + sg * (w / 2 - pw / 2);
      for (let j = 0; j < 3; j++) fb.box(j % 2 ? 0xb83f66 : PINK_D, pw / 3, 4.3, 0.18 + (j % 2) * 0.04, pa + (j - 1) * (pw / 3), Tf + 0.1, 0);
      fb.box(GOLD, pw + 0.04, 0.08, 0.24, pa, Tf + 1.8, -0.02);
      b.dot(GOLD, 0.13, ...fb.pt(pa, Tf + 1.65, 0.26));
    });
    fb.box(BURG_L, w + 0.2, 0.38, 0.24, a, Tf + 4.38, 0);
    fb.box(GOLD, w + 0.2, 0.06, 0.26, a, Tf + 4.32, 0);
    fb.box(GOLD, w + 0.3, 0.07, 0.07, a, Tf + 4.82, 0.1);
    [-1, 1].forEach((k) => b.ball(GOLD, 0.14, ...fb.pt(a + k * (w / 2 + 0.15), Tf + 4.85, 0.12)));
  }
  function allCurtains(f) {
    const Tf = TT(f);
    const NW = FB('x', -HALF_D, 1), SW = FB('x', HALF_D, -1), WW = FB('z', -HALF_W, 1), EW = FB('z', HALF_W, -1);
    [-2, -1, 0, 1, 2].forEach((k) => curtain(NW, k * 7.2, 4.8, Tf));
    [-2, -1, 1, 2].forEach((k) => curtain(SW, k * 7.2, 4.8, Tf));
    [-1, 1].forEach((k) => { curtain(WW, k * 9.3, 3.6, Tf); curtain(EW, k * 9.3, 3.6, Tf); });
    curtain(WW, 0, 4.8, Tf);
  }
  function crest(y) {                       // gold crest above the counter (north wall)
    const z0 = -HALF_D + 0.2;
    b.cylZ(GOLD, 2.3, 0.08, 0, y, z0 + 0.04);
    b.cylZ(BURG, 2.05, 0.11, 0, y, z0 + 0.055);
    b.cylZ(GOLD, 1.85, 0.13, 0, y, z0 + 0.065);
    b.cylZ(PINK_L, 1.7, 0.15, 0, y, z0 + 0.075);
    const zf = z0 + 0.15;
    b.box(GOLD, 1.0, 1.2, 0.06, 0, y - 0.7, zf);
    b.box(BURG, 0.88, 1.08, 0.08, 0, y - 0.64, zf);
    b.ball(PINK_D, 0.5, 0, y - 0.1, zf + 0.06);
    b.dot(WHITE, 0.2, -0.08, y - 0.02, zf + 0.12);
    b.cyl(WHITE, 0.05, 0.5, 0, y - 0.62, zf + 0.06);
    [-0.6, 0.6].forEach((r) => b.slab(GOLD, 0.06, 1.3, 0.05, 0, y - 0.1, zf + 0.12, 0, 0, r));
    b.box(GOLD, 0.8, 0.14, 0.1, 0, y + 0.35, zf);
    [-0.3, 0, 0.3].forEach((x) => { b.cone(GOLD, 0.18, 0.34, x, y + 0.49, zf + 0.02); b.dot(0xd62839, 0.09, x, y + 0.86, zf + 0.04); });
    for (let i = 0; i <= 8; i++) {
      const th = (200 + i * 17.5) * Math.PI / 180;
      b.ellip(i % 2 ? 0xf08fb0 : 0x4aa05a, 0.3, 0.12, 0.08, 1.2 * Math.cos(th), y + 1.2 * Math.sin(th), zf - 0.04, 0, 0, th + Math.PI / 2);
    }
  }

  // ---------- partition walls (solid) ----------
  function wall(axis, wp, a0, a1, f, gaps = [], deco = true, col = CREAM) {
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
      fw.box(BURG, len, 1.0, TH + 0.04, mid, Tf, -0.02);
      fw.box(GOLD, len, 0.06, TH + 0.06, mid, Tf + 1.0, -0.03);
      if (deco && len >= 1.7) {
        const k = Math.max(1, Math.floor(len / 2.6));
        for (let i = 0; i < k; i++) {
          const a = s0 + (len * (i + 0.5)) / k;
          [1, -1].forEach((s) => {
            const fb = FB(axis, wp + s * TH / 2, s);
            if ((n + (s > 0 ? 0 : 1)) % 2 === 0) pennant(fb, a, Tf + 1.3, 0.9, 2.2);
            else painting(fb, a, Tf + 1.7, 0.8, 1.1, n + i);
          });
          n++;
        }
      }
    });
    gaps.forEach(([g0, g1]) => {
      fw.box(col, g1 - g0, H - 2.7, TH, (g0 + g1) / 2, Tf + 2.7, 0);
      fw.box(GOLD, g1 - g0 + 0.16, 0.08, TH + 0.06, (g0 + g1) / 2, Tf + 2.7, -0.03);
      fw.box(GOLD, 0.08, 2.7, TH + 0.06, g0, Tf, -0.03);
      fw.box(GOLD, 0.08, 2.7, TH + 0.06, g1, Tf, -0.03);
    });
  }

  // ---------- furniture helpers ----------
  function royalCounter(cx, cz, w, d, h, f, body = BURG) {
    const Tf = TT(f);
    S(body, cx, cz, w, d, h, f);
    b.box(MARBLE, w + 0.14, 0.07, d + 0.14, cx, Tf + h, cz);
    b.box(PINK_T, w - 0.3, 0.012, d - 0.3, cx, Tf + h + 0.07, cz);
    [-1, 1].forEach((k) => {
      b.box(GOLD, w + 0.16, 0.045, 0.05, cx, Tf + h + 0.07, cz + k * (d / 2 + 0.04));
      b.box(GOLD, 0.05, 0.045, d + 0.16, cx + k * (w / 2 + 0.04), Tf + h + 0.07, cz);
    });
    b.box(GOLD, w, 0.1, 0.04, cx, Tf, cz + d / 2);
    const n = Math.floor(w / 1.0);
    for (let i = 0; i < n; i++) {
      const x = cx - w / 2 + (w * (i + 0.5)) / n;
      b.box(PINK_D, 0.78, h * 0.55, 0.03, x, Tf + h * 0.2, cz + d / 2);
      b.box(GOLD, 0.84, 0.035, 0.04, x, Tf + h * 0.2 + h * 0.55, cz + d / 2);
      b.box(GOLD, 0.84, 0.035, 0.04, x, Tf + h * 0.2 - 0.03, cz + d / 2);
      b.dot(GOLD, 0.1, x, Tf + h * 0.47, cz + d / 2 + 0.04);
    }
  }
  function jarShelf(cx, cz, w, d, h, f, axis, s, kind = 'jar') {
    const Tf = TT(f);
    if (axis === 'x') S(BURG, cx, cz, w, d, h, f); else S(BURG, cx, cz, d, w, h, f);
    const wp = (axis === 'x' ? cz : cx) + s * d / 2;
    const fb = FB(axis, wp, s);
    const al = axis === 'x' ? cx : cz;
    const tiers = Math.max(2, Math.round((h - 0.25) / 0.58));
    const th = (h - 0.25) / tiers;
    for (let k = 0; k < tiers; k++) {
      const yb = Tf + 0.12 + k * th;
      fb.box(ROSEG, w, 0.05, 0.4, al, yb, 0);
      for (let n = 0; n * 0.3 + 0.2 < w - 0.1; n++) {
        const a = al - w / 2 + 0.2 + n * 0.3;
        const ci = (n * 3 + k * 7) % JAR.length;
        const tall = (n + k) % 2 === 0;
        const pos = fb.pt(a, 0, 0.2);
        const x = pos[0], z = pos[2];
        if (kind === 'jar') {
          const jh = tall ? 0.36 : 0.26;
          b.cyl(JAR[ci], 0.25, jh, x, yb + 0.05, z);
          b.cyl(0xe9f6fb, 0.27, 0.025, x, yb + 0.05 + jh * 0.5, z);
          b.cyl(GOLD, 0.27, 0.04, x, yb + 0.05 + jh, z);
          b.dot(GOLD, 0.07, x, yb + 0.12 + jh, z);
        } else {                                  // gift boxes / tins
          b.box(JAR[ci], 0.24, tall ? 0.34 : 0.24, 0.26, x, yb + 0.05, z);
          b.box(GOLD, 0.26, 0.04, 0.28, x, yb + 0.05 + (tall ? 0.18 : 0.12), z);
        }
      }
    }
    fb.box(GOLD, w + 0.06, 0.08, 0.5, al, Tf + h, 0);
    fb.box(ROSEG, w, 0.12, 0.08, al, Tf + h - 0.2, 0.45);
  }
  function caseZ(cx, cz, len, dir, f, kind) {    // glass-style display case, long along z, open front toward `dir` (x)
    const Tf = TT(f);
    S(BURG, cx, cz, 0.9, len, 0.85, f);
    b.box(GOLD, 0.96, 0.05, len + 0.06, cx, Tf + 0.85, cz);
    b.box(GOLD_D, 0.96, 0.1, len + 0.06, cx, Tf, cz);
    for (let i = 0; i < Math.floor(len / 0.8); i++) {
      const z = cz - len / 2 + (len * (i + 0.5)) / Math.floor(len / 0.8);
      b.box(PINK_D, 0.03, 0.5, 0.6, cx + dir * 0.45, Tf + 0.15, z);
      b.box(GOLD, 0.04, 0.03, 0.64, cx + dir * 0.45, Tf + 0.65, z);
    }
    [cz - len / 2 + 0.02, cz + len / 2 - 0.02].forEach((z) => S(GLASS, cx, z, 0.9, 0.04, 0.6, f, 0.9));
    S(GLASS, cx - dir * 0.43, cz, 0.04, len, 0.6, f, 0.9);
    S(GLASS, cx, cz, 0.9, len, 0.04, f, 1.5);
    b.box(GOLD, 0.05, 0.06, len, cx + dir * 0.45, Tf + 1.5, cz);
    b.box(GOLD, 0.7, 0.03, len - 0.15, cx, Tf + 0.9, cz);
    b.box(GLASS, 0.8, 0.03, len - 0.15, cx, Tf + 1.22, cz);
    const n = Math.floor((len - 0.4) / 0.3);
    for (let i = 0; i < n; i++) {
      const z = cz - (n - 1) * 0.15 + i * 0.3;
      [-0.17, 0.17].forEach((dx, j) => {
        if (kind === 'choc') {
          b.box(CHOC, 0.2, 0.09, 0.2, cx + dx, Tf + 0.93, z);
          b.box((i + j) % 2 ? GOLD : WHITE, 0.2, 0.012, 0.05, cx + dx, Tf + 1.02, z);
          b.ball(0x6b3a22, 0.16, cx + dx, Tf + 1.3, z);
          b.dot(GOLD, 0.05, cx + dx, Tf + 1.39, z);
        } else {
          const ci = (i * 2 + j) % MAC.length;
          b.ellip(MAC[ci], 0.2, 0.06, 0.2, cx + dx, Tf + 0.95, z);
          b.cyl(WHITE, 0.17, 0.03, cx + dx, Tf + 0.97, z);
          b.ellip(MAC[ci], 0.2, 0.06, 0.2, cx + dx, Tf + 1.03, z);
          b.ellip(MAC[(ci + 2) % MAC.length], 0.18, 0.05, 0.18, cx + dx, Tf + 1.3, z);
          b.dot(WHITE, 0.07, cx + dx, Tf + 1.36, z);
        }
      });
    }
  }
  function roundTable(x, z, f) {
    const Tf = TT(f);
    b.cyl(PINK_D, 1.3, 0.72, x, Tf, z);
    b.cyl(GOLD, 1.52, 0.04, x, Tf + 0.72, z);
    b.cyl(WHITE, 1.44, 0.05, x, Tf + 0.76, z);
    b.cyl(BURG_L, 1.0, 0.012, x, Tf + 0.81, z);
    b.cyl(GOLD, 0.34, 0.03, x, Tf + 0.82, z);
    b.ball(PINK, 0.16, x, Tf + 0.93, z);
    b.ball(GOLD, 0.05, x, Tf + 1.03, z);
    [-0.3, 0.3].forEach((k) => b.cyl(WHITE, 0.12, 0.06, x + k, Tf + 0.82, z + 0.35));
    b.cyl(GOLD, 0.6, 0.02, x, Tf, z);
    plan.blocks.push([x - 0.75, x + 0.75, z - 0.75, z + 0.75, Tf, Tf + 0.85]);
    addChair(b, plan, x - 1.1, z, f, Math.PI / 2, ROSEG);
    addChair(b, plan, x + 1.1, z, f, -Math.PI / 2, ROSEG);
    [-1.1, 1.1].forEach((k) => b.box(PINK_D, 0.44, 0.05, 0.44, x + k, Tf + 0.5, z));
  }
  function bench(cx, cz, len, dir, f) {
    const Tf = TT(f), ax = dir === 'N' || dir === 'S';
    const bw = ax ? len : 0.55, bd = ax ? 0.55 : len;
    S(PINK_D, cx, cz, bw, bd, 0.5, f);
    b.box(GOLD, bw + 0.03, 0.06, bd + 0.03, cx, Tf, cz);
    b.box(PINK, bw - 0.08, 0.08, bd - 0.08, cx, Tf + 0.5, cz);
    const dz = dir === 'N' ? 1 : dir === 'S' ? -1 : 0, dx = dir === 'W' ? 1 : dir === 'E' ? -1 : 0;
    if (ax) { S(PINK_D, cx, cz + dz * 0.27, len, 0.12, 0.55, f, 0.5); b.box(GOLD, len + 0.04, 0.05, 0.16, cx, Tf + 1.05, cz + dz * 0.27); }
    else { S(PINK_D, cx + dx * 0.27, cz, 0.12, len, 0.55, f, 0.5); b.box(GOLD, 0.16, 0.05, len + 0.04, cx + dx * 0.27, Tf + 1.05, cz); }
    const ang = { N: Math.PI, S: 0, W: -Math.PI / 2, E: Math.PI / 2 }[dir];
    [-len / 4, len / 4].forEach((o) => plan.spots.push({ kind: 'sit', x: ax ? cx + o : cx, y: Tf + 0.55, z: ax ? cz : cz + o, a: ang }));
  }
  function urn(x, z, f) {
    const Tf = TT(f);
    S(ROSEG, x, z, 0.5, 0.5, 0.55, f);
    b.cyl(GOLD, 0.62, 0.08, x, Tf + 0.55, z);
    b.ellip(0x4aa05a, 0.75, 0.9, 0.75, x, Tf + 1.1, z);
    b.ellip(0x62bd70, 0.5, 0.6, 0.5, x + 0.15, Tf + 1.5, z - 0.05);
    b.dot(PINK, 0.12, x - 0.2, Tf + 1.3, z + 0.25);
    b.dot(0xffe066, 0.1, x + 0.22, Tf + 1.55, z + 0.2);
  }
  function domeChand(x, z, Tf, k = 1) {
    b.cyl(GOLD_D, 0.07, 0.4, x, Tf + 5.0, z);
    b.cyl(GOLD, 0.5 * k, 0.1, x, Tf + 5.3, z);
    b.ball(0xe3f4ff, 2.6 * k, x, Tf + 4.35, z, 0.55);
    b.cyl(GOLD, 2.64 * k, 0.07, x, Tf + 4.3, z);
    b.cyl(PINK, 2.0 * k, 0.05, x, Tf + 4.8, z);
    b.cyl(GOLD, 2.5 * k, 0.12, x, Tf + 3.55, z);
    b.cyl(GOLD, 1.3 * k, 0.06, x, Tf + 3.35, z);
    b.ball(GOLD, 0.4 * k, x, Tf + 3.1, z);
    b.dot(0xdff3ff, 0.2 * k, x, Tf + 2.9, z);
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      b.dot(i % 2 ? 0xdff3ff : PINK_L, 0.11 * k, x + Math.cos(a) * 1.12 * k, Tf + 3.42, z + Math.sin(a) * 1.12 * k);
    }
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4, cx = x + Math.cos(a) * 0.6 * k, cz = z + Math.sin(a) * 0.6 * k;
      b.cyl(CREAM, 0.08 * k, 0.16 * k, cx, Tf + 3.41, cz);
      b.dot(0xffd35a, 0.08 * k, cx, Tf + 3.41 + 0.16 * k + 0.04, cz);
    }
  }
  function pillar(x, z, f) {
    const Tf = TT(f);
    b.cyl(GOLD, 1.1, 0.25, x, Tf, z);
    for (let k = 0; k < 23; k++) b.cyl(k % 2 ? WHITE : PINK_D, 0.8, 0.2, x, Tf + 0.25 + k * 0.2, z);
    b.cyl(GOLD, 0.86, 0.08, x, Tf + 2.4, z);
    b.cyl(GOLD_D, 0.88, 0.08, x, Tf + 4.65, z);
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
  function bow(x, y, z) {
    b.ellip(GOLD, 0.34, 0.2, 0.12, x - 0.17, y, z, 0, 0, 0.5);
    b.ellip(GOLD, 0.34, 0.2, 0.12, x + 0.17, y, z, 0, 0, -0.5);
    b.dot(GOLD_D, 0.12, x, y - 0.02, z + 0.04);
  }
  function giftBox(x, y, z, w, h, col, f = 0) {   // decorative gift box on a surface
    b.box(col, w, h, w, x, y, z);
    b.box(GOLD, w + 0.01, h + 0.01, 0.07, x, y, z);
    b.box(GOLD, 0.07, h + 0.012, w + 0.01, x, y, z);
    bow(x, y + h + 0.06, z);
  }
  function workTable(cx, cz, w, d, h, f, top = MARBLE) {
    const Tf = TT(f);
    S(WOOD_L, cx, cz, w, d, h, f);
    b.box(top, w + 0.2, 0.07, d + 0.2, cx, Tf + h, cz);
    [-1, 1].forEach((k) => {
      b.box(COPPER, w + 0.22, 0.05, 0.05, cx, Tf + h + 0.07, cz + k * (d / 2 + 0.08));
      b.box(COPPER, 0.05, 0.05, d + 0.22, cx + k * (w / 2 + 0.08), Tf + h + 0.07, cz);
    });
    b.box(ROSEG, w, 0.08, 0.04, cx, Tf + 0.1, cz + d / 2);
    b.box(COPPER, w - 0.2, 0.05, d - 0.2, cx, Tf + 0.3, cz);
  }

  // ---------- shell, stairs, floors ----------
  shell(b, plan, { floor: MARBLE, floorAlt: MARBLE, wall: CREAM, ceiling: 0xfffaf0, trim: GOLD, glass: 0xd8f0ff });
  addStairs(b, plan, 0, { stair: BURG_L, tread: 0xc23a52, trim: GOLD_D });

  const hole = plan.holes[0].rect;
  [0, 1].forEach((f) => {
    const Tf = TT(f);
    for (let i = 0; i < HALF_W; i++) {
      for (let j = 0; j < HALF_D; j++) {
        if ((i + j) % 2) continue;
        const x0 = -HALF_W + 2 * i, z0 = -HALF_D + 2 * j;
        let x1 = x0 + 2;
        if (f === 1 && x1 > hole[0] && z0 < hole[3] && z0 + 2 > hole[2]) x1 = Math.min(x1, hole[0]);
        if (x1 - x0 < 0.05) continue;
        b.box(PINK_T, x1 - x0, 0.015, 2, (x0 + x1) / 2, Tf, z0 + 1);
      }
    }
    ring(Tf, 0.18, 0.8, 0.05, BURG, f === 0);
    ring(Tf, 1.0, 0.08, 0.09, GOLD, f === 0);
    ring(Tf, CLEAR - 0.45, 0.1, 0.14, GOLD_D, false);
    ring(Tf, CLEAR - 0.35, 0.3, 0.1, GOLD, false);
    [-6, 0, 6].forEach((z) => {
      b.box(PINK_D, 33.5, 0.2, 0.45, -1.25, Tf + 5.2, z);
      b.box(GOLD, 33.5, 0.04, 0.5, -1.25, Tf + 5.16, z);
    });
    allCurtains(f);
  });

  // =====================================================
  // GROUND FLOOR
  // =====================================================
  const T0 = TT(0);

  // red-and-gold carpet runner, door -> counter
  b.box(0xb3182f, 3.0, 0.03, 17.6, 0, T0, 3.1);
  [-1, 1].forEach((k) => {
    b.box(GOLD, 0.14, 0.035, 17.6, k * 1.57, T0, 3.1);
    b.box(0x6e0f1f, 0.07, 0.04, 17.6, k * 1.38, T0, 3.1);
  });
  [9, 5, 1, -3].forEach((z) => { b.cyl(GOLD, 0.8, 0.04, 0, T0, z); b.cyl(0x8c1226, 0.6, 0.045, 0, T0, z); b.cyl(GOLD, 0.3, 0.05, 0, T0, z); });
  b.box(GOLD, 3.3, 0.04, 0.12, 0, T0, -5.75);

  // candy-striped pillars and chandeliers
  [-9.5, 9.5].forEach((x) => [9, 5, 1, -3].forEach((z) => pillar(x, z, 0)));
  domeChand(0, 2, T0, 1.3);
  domeChand(-13.5, 5, T0, 0.7);
  domeChand(6, -3, T0, 0.6);
  domeChand(12, 1, T0, 0.6);
  domeChand(-6, -3, T0, 0.6);

  // sales counter at the job spot (z -5.2 stands in front of it)
  royalCounter(0, -6.6, 7.0, 1.5, 1.1, 0);
  crest(T0 + 3.2);
  // register
  b.box(GOLD, 0.55, 0.22, 0.45, 2.3, T0 + 1.2, -6.6);
  b.box(GOLD, 0.4, 0.18, 0.3, 2.3, T0 + 1.42, -6.65);
  b.box(0x2a2a30, 0.32, 0.12, 0.04, 2.3, T0 + 1.45, -6.48);
  for (let i = 0; i < 6; i++) b.dot(i % 2 ? PINK_D : WHITE, 0.07, 2.12 + (i % 3) * 0.18, T0 + 1.43, -6.38 + Math.floor(i / 3) * 0.1);
  b.ball(GOLD, 0.16, 2.9, T0 + 1.24, -6.3, 0.7);
  // scales
  b.cyl(GOLD_D, 0.4, 0.08, -2.3, T0 + 1.2, -6.6);
  b.cyl(GOLD_D, 0.08, 0.6, -2.3, T0 + 1.28, -6.6);
  b.box(GOLD, 0.85, 0.04, 0.04, -2.3, T0 + 1.88, -6.6);
  [-0.38, 0.38].forEach((k) => {
    b.cyl(GOLD, 0.34, 0.025, -2.3 + k, T0 + 1.45, -6.6);
    b.cyl(GOLD_D, 0.012, 0.4, -2.3 + k - 0.1, T0 + 1.47, -6.6);
    b.cyl(GOLD_D, 0.012, 0.4, -2.3 + k + 0.1, T0 + 1.47, -6.6);
  });
  [-0.4, -0.3, 0.38].forEach((k, i) => b.ball(i < 2 ? PINK_D : 0x7ee081, 0.12, -2.3 + k, T0 + 1.52, -6.6));
  // golden cake stand
  b.cyl(GOLD_D, 0.5, 0.05, 0, T0 + 1.18, -6.6);
  b.cyl(GOLD, 0.1, 0.45, 0, T0 + 1.2, -6.6);
  b.cyl(GOLD, 0.95, 0.04, 0, T0 + 1.65, -6.6);
  b.cyl(PINK_D, 0.72, 0.22, 0, T0 + 1.69, -6.6);
  b.cyl(WHITE, 0.52, 0.2, 0, T0 + 1.91, -6.6);
  b.cyl(PINK, 0.32, 0.18, 0, T0 + 2.11, -6.6);
  b.ball(0xd62839, 0.14, 0, T0 + 2.36, -6.6);
  [0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => b.dot(GOLD, 0.06, Math.cos(i * 0.785) * 0.36, T0 + 1.9, -6.6 + Math.sin(i * 0.785) * 0.36));
  // stanchions with rope along the carpet
  [-1, 1].forEach((k) => [5, 2, -1].forEach((z) => {
    S(GOLD, k * 1.95, z, 0.16, 0.16, 1.0, 0);
    b.ball(GOLD, 0.2, k * 1.95, T0 + 1.08, z);
    if (z !== -1) b.slab(0xb3182f, 0.04, 0.04, 3.0, k * 1.95, T0 + 0.85, z - 1.5, 0, 0, 0);
  }));

  // candy-jar walls (floor to ceiling)
  [-10.8, -3.6, 3.6, 10.8].forEach((x) => jarShelf(x, -11.75, 2.2, 0.5, 4.9, 0, 'x', 1));
  jarShelf(-17.75, -4.95, 4.8, 0.5, 4.9, 0, 'z', 1);
  [-10.8, 10.8].forEach((x) => jarShelf(x, 11.75, 2.2, 0.5, 4.9, 0, 'x', -1));

  // wall paintings and pennants between everything else
  const N0 = FB('x', -HALF_D, 1), S0 = FB('x', HALF_D, -1), W0 = FB('z', -HALF_W, 1), E0 = FB('z', HALF_W, -1);
  [-17.4, 17.4].forEach((x, i) => { painting(N0, x, T0 + 1.8, 0.6, 0.9, i); painting(S0, x, T0 + 1.8, 0.6, 0.9, i + 1); });
  [-3.0, 3.0].forEach((x, i) => painting(S0, x, T0 + 1.8, 1.2, 1.6, i + 2));
  painting(W0, 4.95, T0 + 1.7, 2.6, 1.8, 1);
  [-11.55, 11.55].forEach((z) => { pennant(W0, z, T0 + 1.5, 0.5, 2.4); pennant(E0, z, T0 + 1.5, 0.5, 2.4); });
  [4.2, 1.2].forEach((z, i) => painting(E0, z, T0 + 3.4, 1.0, 1.4, i));
  painting(E0, -6.8, T0 + 1.9, 0.7, 1.0, 2);

  // chocolate fountain
  {
    const fx = 6.0, fz = 3.0;
    b.cyl(PINK_L, 2.0, 0.5, fx, T0, fz);
    b.cyl(GOLD, 2.06, 0.08, fx, T0 + 0.5, fz);
    b.cyl(CHOC, 1.7, 0.06, fx, T0 + 0.58, fz);
    b.cyl(GOLD, 0.2, 1.6, fx, T0 + 0.58, fz);
    b.cyl(GOLD, 1.5, 0.3, fx, T0 + 0.6, fz);
    b.cyl(CHOC, 1.4, 0.06, fx, T0 + 0.9, fz);
    b.cyl(GOLD, 1.1, 0.3, fx, T0 + 1.0, fz);
    b.cyl(CHOC, 1.0, 0.06, fx, T0 + 1.3, fz);
    b.cyl(GOLD, 0.75, 0.3, fx, T0 + 1.4, fz);
    b.cyl(CHOC, 0.66, 0.06, fx, T0 + 1.7, fz);
    b.cyl(GOLD, 0.45, 0.25, fx, T0 + 1.8, fz);
    b.cyl(0x5a2f1a, 0.38, 0.08, fx, T0 + 2.05, fz);
    b.ball(GOLD, 0.16, fx, T0 + 2.2, fz);
    [0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => {
      const a = i * 0.785;
      b.ellip(CHOC, 0.1, 0.34, 0.1, fx + Math.cos(a) * 0.72, T0 + 1.2, fz + Math.sin(a) * 0.72);
      b.ellip(CHOC, 0.1, 0.3, 0.1, fx + Math.cos(a + 0.4) * 0.52, T0 + 1.52, fz + Math.sin(a + 0.4) * 0.52);
      b.ball([0xe0405a, PINK_D, 0xffe066, 0xffffff][i % 4], 0.14, fx + Math.cos(a) * 0.95, T0 + 0.62, fz + Math.sin(a) * 0.95);
    });
    plan.blocks.push([fx - 1.0, fx + 1.0, fz - 1.0, fz + 1.0, T0, T0 + 2.3]);
  }

  // lollipop tree
  {
    const tx = -5.5, tz = 3.0;
    S(GOLD_D, tx, tz, 1.2, 1.2, 0.5, 0);
    b.cyl(ROSEG, 1.3, 0.06, tx, T0 + 0.5, tz);
    b.box(BURG, 1.0, 0.08, 1.0, tx, T0 + 0.56, tz);
    S(WOOD_L, tx, tz, 0.18, 0.18, 2.6, 0, 0.5);
    b.ball(GOLD, 0.24, tx, T0 + 3.2, tz);
    [[0.9, 0.7], [1.5, 0.6], [2.0, 0.55], [2.5, 0.45]].forEach(([y, len], t) => {
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + t * 0.6;
        b.slab(GOLD_D, len, 0.04, 0.04, tx + Math.cos(a) * len / 2, T0 + y, tz + Math.sin(a) * len / 2, 0, -a, 0);
        const lx = tx + Math.cos(a) * len, lz = tz + Math.sin(a) * len;
        b.cyl(WHITE, 0.03, 0.4, lx, T0 + y, lz);
        b.ball(JAR[(i * 3 + t * 2) % JAR.length], 0.26, lx, T0 + y + 0.5, lz, 1);
        b.dot(WHITE, 0.12, lx, T0 + y + 0.52, lz + 0.1);
      }
    });
  }

  // cotton-candy machine
  {
    const mx = 6.3, mz = -5.3;
    S(BURG, mx, mz, 1.1, 1.1, 0.95, 0);
    b.box(GOLD, 1.16, 0.06, 1.16, mx, T0 + 0.95, mz);
    b.box(PINK_D, 0.9, 0.5, 0.03, mx, T0 + 0.2, mz + 0.56);
    b.box(GOLD, 0.94, 0.04, 0.04, mx, T0 + 0.7, mz + 0.57);
    b.cyl(STEEL_L, 1.3, 0.35, mx, T0 + 1.0, mz);
    b.cyl(GOLD, 1.36, 0.05, mx, T0 + 1.33, mz);
    b.ball(PINK, 1.0, mx, T0 + 1.8, mz, 0.85);
    b.ball(PINK_L, 0.7, mx + 0.1, T0 + 2.1, mz - 0.05, 0.85);
    [0, 1, 2, 3, 4].forEach((i) => b.dot(WHITE, 0.1, mx + Math.cos(i * 1.3) * 0.5, T0 + 1.6 + (i % 2) * 0.3, mz + Math.sin(i * 1.3) * 0.5));
    [-0.3, 0.3].forEach((k) => { b.cone(WHITE, 0.28, 0.45, mx + k, T0 + 1.01, mz + 0.5); b.ball(PINK, 0.32, mx + k, T0 + 1.5, mz + 0.5, 0.9); });
    b.ball(GOLD, 0.14, mx, T0 + 2.4, mz);
  }

  // gift-box tower
  {
    const gx = -6.3, gz = -5.4;
    [[1.5, 0.65, PINK_D, 0], [1.2, 0.55, WHITE, 0.65], [0.95, 0.5, BURG_L, 1.2], [0.72, 0.45, PINK, 1.7]].forEach(([w, h, col, lift]) => {
      S(col, gx, gz, w, w, h, 0, lift);
      b.box(GOLD, w + 0.02, h + 0.01, 0.08, gx, T0 + lift, gz);
      b.box(GOLD, 0.08, h + 0.012, w + 0.02, gx, T0 + lift, gz);
    });
    S(GOLD, gx, gz, 0.5, 0.5, 0.3, 0, 2.15);
    bow(gx, T0 + 2.6, gz);
    b.dot(PINK_D, 0.14, gx + 0.2, T0 + 2.5, gz + 0.26);
  }

  // glass display cases (chocolates, macarons)
  caseZ(12.9, -3.2, 3.2, -1, 0, 'choc');
  caseZ(12.9, 2.6, 3.2, -1, 0, 'mac');
  // macaron tower on the east side
  [[0.9, 0.12, PINK], [0.75, 0.12, 0xffe0a3], [0.6, 0.12, 0xb9f0c8], [0.45, 0.12, 0xc9b6ff], [0.3, 0.12, 0xa8dcff]].forEach(([d, h, col], i) => {
    S(col, 10.8, 7.0, d, d, h, 0, i * 0.12 + 0.55);
  });
  S(BURG, 10.8, 7.0, 0.5, 0.5, 0.55, 0);
  b.ball(GOLD, 0.16, 10.8, T0 + 1.28, 7.0);
  b.cyl(GOLD, 1.0, 0.04, 10.8, T0 + 0.51, 7.0);

  // tea salon: 4 round velvet tables, 8 chairs, a pink rug
  b.cyl(0xe3849f, 7.0, 0.02, -13.6, T0, 4.75);
  b.cyl(GOLD, 6.4, 0.025, -13.6, T0, 4.75);
  b.cyl(PINK_D, 6.1, 0.03, -13.6, T0, 4.75);
  [[-15.2, 2.5], [-12.0, 2.5], [-15.2, 7.0], [-12.0, 7.0]].forEach(([x, z]) => roundTable(x, z, 0));
  bench(13.5, 9.8, 3.0, 'N', 0);

  // door flankers (clear zone x +-3, z > 8 stays empty)
  [-1, 1].forEach((k) => urn(k * 3.7, 11.3, 0));

  // =====================================================
  // FLOOR 1
  // =====================================================
  const T1 = TT(1);
  [[-4.5, -4.5], [6, -4.5], [-14, 8.5], [-7, 8.5], [8, 8.5], [-12, -4]].forEach(([x, z]) => domeChand(x, z, T1, 0.6));

  // partitions: dorm (x -18..-10.8, z 4.95..12) and packing room (x -10.8..-3.6)
  wall('x', 4.95, -HALF_W, -3.6, 1, [[-13.6, -12.0], [-8.2, -6.6]]);
  wall('z', -10.8, 4.95, HALF_D, 1, []);
  wall('z', -3.6, 4.95, HALF_D, 1, []);

  const N1 = FB('x', -HALF_D, 1), S1 = FB('x', HALF_D, -1), W1 = FB('z', -HALF_W, 1), E1 = FB('z', HALF_W, -1);
  painting(N1, -10.8, T1 + 2.9, 1.5, 1.3, 0);
  [-17.4, 17.4].forEach((x, i) => { painting(N1, x, T1 + 1.8, 0.6, 0.9, i); painting(S1, x, T1 + 1.8, 0.6, 0.9, i + 2); });
  [-3.6, 3.6].forEach((x, i) => painting(N1, x, T1 + 3.7, 1.0, 0.9, i + 1));
  painting(S1, -11.4, T1 + 1.8, 0.6, 1.0, 1);
  painting(S1, 3.6, T1 + 1.8, 0.9, 1.3, 3);
  painting(W1, 3.7, T1 + 1.8, 1.2, 1.4, 2);
  painting(W1, 6.2, T1 + 1.8, 0.9, 1.2, 0);
  [-3, 3].forEach((z, i) => painting(E1, z, T1 + 2.0, 1.2, 1.5, i + 1));
  painting(E1, 0, T1 + 3.4, 1.4, 1.2, 3);
  painting(E1, -6.8, T1 + 1.9, 0.7, 1.0, 2);
  [-11.55, 11.55].forEach((z) => { pennant(W1, z, T1 + 1.5, 0.5, 2.4); pennant(E1, z, T1 + 1.5, 0.5, 2.4); });

  // giant oven (west wall)
  {
    const ox = -17.3, oz = -4.95;
    S(0x8c3a2a, ox, oz, 1.4, 4.6, 2.6, 1);
    const fb = FB('z', -16.6, 1);
    [-6.5, -4.95, -3.4].forEach((a) => {
      fb.box(0x1d1a1f, 1.1, 1.2, 0.05, a, T1 + 0.4, 0);
      fb.box(0xff7a1a, 0.9, 0.8, 0.06, a, T1 + 0.55, 0.01);
      for (let k = 0; k < 5; k++) fb.box(0x1d1a1f, 0.04, 0.8, 0.07, a - 0.34 + k * 0.17, T1 + 0.55, 0.02);
      b.ellip(0x1d1a1f, 1.1, 0.5, 0.1, ...fb.pt(a, T1 + 1.6, 0.03));
      fb.box(GOLD, 0.7, 0.05, 0.08, a, T1 + 1.45, 0.07);
    });
    fb.box(GOLD, 4.7, 0.1, 0.1, oz, T1 + 1.75, 0);
    fb.box(COPPER, 4.6, 0.6, 0.08, oz, T1 + 1.85, 0);
    b.pyramid(COPPER, 1.8, 1.1, 5.0, ox + 0.1, T1 + 2.6, oz);
    b.cyl(COPPER, 0.7, 1.6, ox + 0.1, T1 + 3.4, oz);
    b.cyl(GOLD, 0.8, 0.1, ox + 0.1, T1 + 3.3, oz);
    S(WOOD_L, -16.1, -7.6, 0.6, 0.8, 0.6, 1);
    b.box(0x6b4a2a, 0.5, 0.1, 0.12, -16.1, T1 + 0.62, -7.45);
    b.box(0x6b4a2a, 0.5, 0.1, 0.12, -16.1, T1 + 0.74, -7.75);
  }
  // mixing machine
  S(PINK_D, -13.5, -10.2, 0.9, 0.7, 0.35, 1);
  S(PINK_D, -13.5, -10.4, 0.3, 0.3, 1.4, 1, 0.35);
  b.box(PINK_D, 1.0, 0.35, 0.5, -13.5, T1 + 1.5, -10.25);
  b.box(GOLD, 1.02, 0.05, 0.52, -13.5, T1 + 1.5, -10.25);
  b.cyl(STEEL_L, 0.7, 0.45, -13.5, T1 + 0.38, -10.05);
  b.cyl(GOLD, 0.74, 0.04, -13.5, T1 + 0.83, -10.05);
  b.cyl(STEEL_L, 0.06, 0.5, -13.5, T1 + 1.0, -10.05);
  b.cone(STEEL_L, 0.24, 0.3, -13.5, T1 + 0.7, -10.05);
  b.ball(PINK, 0.35, -13.5, T1 + 0.78, -10.05, 0.5);
  b.dot(GOLD, 0.1, -13.5, T1 + 1.55, -9.98);
  // sugar sacks
  S(CREAM, -10.8, -11.0, 2.0, 1.0, 0.7, 1);
  S(0xf0e4c8, -10.8, -11.1, 1.6, 0.8, 0.6, 1, 0.7);
  S(CREAM, -10.8, -11.1, 1.1, 0.7, 0.5, 1, 1.3);
  S(0xf0e4c8, -9.2, -11.3, 0.8, 0.6, 0.9, 1);
  [-11.5, -10.8, -10.1].forEach((x) => { b.box(PINK_D, 0.5, 0.25, 0.02, x, T1 + 0.3, -10.49); b.ellip(0xf3e9d0, 0.6, 0.18, 0.4, x, T1 + 0.74, -11.0); });
  b.box(PINK_D, 0.4, 0.2, 0.02, -9.2, T1 + 0.5, -10.99);
  b.dot(GOLD, 0.1, -10.8, T1 + 1.9, -11.1);
  // two big work tables with copper pot racks
  [[-8.5, -3.5], [-1.5, -3.5]].forEach(([x, z], t) => {
    workTable(x, z, 4.2, 1.5, 0.9, 1);
    const y = T1 + 0.98;
    b.cylRot(0xd8b384, 0.1, 0.6, x - 1.3, y + 0.06, z + 0.3, 0, 0, Math.PI / 2);
    b.cyl(WHITE, 0.45, 0.2, x - 0.3, y, z - 0.2);
    b.cyl(COPPER, 0.45, 0.14, x + 0.7, y, z + 0.2);
    b.ellip(CREAM, 0.4, 0.2, 0.34, x + 1.5, y + 0.1, z - 0.2);
    b.box(WHITE, 0.9, 0.01, 0.6, x + 0.1, y, z + 0.35);
    [0, 1, 2, 3, 4].forEach((i) => b.cone(i % 2 ? PINK : WHITE, 0.14, 0.16, x - 1.7 + i * 0.2, y, z - 0.4));
    [0, 1, 2, 3, 4, 5].forEach((i) => b.dot(JAR[(i + t * 3) % JAR.length], 0.05, x + 0.2 + i * 0.1, y + 0.02, z + 0.35));
    b.box(GOLD_D, 3.6, 0.06, 0.06, x, T1 + 3.9, z);
    [-1.6, 1.6].forEach((k) => b.cyl(GOLD_D, 0.02, 1.4, x + k, T1 + 3.9, z));
    for (let i = 0; i < 6; i++) {
      const px = x - 1.5 + i * 0.6;
      b.cyl(COPPER, 0.34, 0.26, px, T1 + 3.55, z);
      b.cyl(GOLD, 0.36, 0.03, px, T1 + 3.8, z);
      b.box(COPPER, 0.22, 0.03, 0.03, px + 0.25, T1 + 3.72, z);
      b.cyl(GOLD_D, 0.015, 0.1, px, T1 + 3.81, z);
    }
  });
  // cake-decorating table
  workTable(6.5, -4.0, 2.6, 1.4, 0.95, 1, PINK_L);
  {
    const x = 6.5, y = T1 + 1.02, z = -4.0;
    b.cyl(GOLD, 0.7, 0.05, x, y, z);
    b.cyl(PINK_D, 0.56, 0.18, x, y + 0.05, z);
    b.cyl(WHITE, 0.42, 0.16, x, y + 0.23, z);
    b.cyl(PINK, 0.28, 0.14, x, y + 0.39, z);
    b.ball(0xd62839, 0.12, x, y + 0.6, z);
    [0, 1, 2, 3, 4, 5].forEach((i) => b.dot(GOLD, 0.05, x + Math.cos(i * 1.05) * 0.28, y + 0.14, z + Math.sin(i * 1.05) * 0.28));
    [-0.9, -0.7].forEach((k) => b.cone(i2c(k), 0.12, 0.3, x + k, y, z + 0.4));
    [0.8, 0.95, 1.1].forEach((k, i) => b.dot(JAR[i * 3], 0.06, x + k, y + 0.02, z - 0.3));
    b.box(0xffffff, 0.3, 0.02, 0.22, x - 1.0, y, z - 0.3);
    function i2c(k) { return k < -0.8 ? PINK : WHITE; }
  }
  addChair(b, plan, 5.6, -2.7, 1, Math.PI, ROSEG);
  addChair(b, plan, 7.4, -2.7, 1, Math.PI, ROSEG);
  [5.6, 7.4].forEach((x) => b.box(PINK_D, 0.44, 0.05, 0.4, x, T1 + 0.5, -2.7));
  // pantry / copper shelves
  [-3.6, 3.6].forEach((x) => jarShelf(x, -11.75, 2.2, 0.5, 3.4, 1, 'x', 1));
  jarShelf(10.8, -11.75, 2.2, 0.5, 3.0, 1, 'x', 1, 'box');
  // kitchen counters under the south windows + giant caramel pot
  [[7.2, 4.6], [14.4, 4.7]].forEach(([x, w]) => {
    S(WOOD_L, x, 11.6, w, 0.8, 0.9, 1);
    b.box(MARBLE, w + 0.1, 0.06, 0.9, x, T1 + 0.9, 11.6);
    b.box(COPPER, w, 0.08, 0.04, x, T1 + 0.1, 11.2);
    for (let i = 0; i < 4; i++) b.cyl(COPPER, 0.3, 0.2, x - w / 2 + 0.6 + i * (w / 4), T1 + 0.96, 11.6);
  });
  jarShelf(0.9, 11.75, 2.4, 0.5, 3.4, 1, 'x', -1, 'box');
  jarShelf(10.8, 11.75, 2.2, 0.5, 3.0, 1, 'x', -1);
  S(0x3a2a24, 12.0, 8.0, 1.6, 1.6, 0.5, 1);
  b.cyl(COPPER, 1.5, 0.6, 12.0, T1 + 0.5, 8.0);
  b.cyl(GOLD, 1.56, 0.05, 12.0, T1 + 1.08, 8.0);
  b.cyl(0xc1731a, 1.3, 0.02, 12.0, T1 + 1.08, 8.0);
  b.slab(WOOD_L, 0.06, 0.06, 1.3, 12.2, T1 + 1.4, 8.0, 0.5, 0, 0);
  b.cyl(GOLD, 0.2, 0.3, 11.4, T1 + 0.5, 8.0);
  // cooling trolleys
  [4.0, 5.2].forEach((x) => {
    S(STEEL_L, x, 9.0, 0.8, 0.6, 1.8, 1);
    for (let i = 0; i < 5; i++) { b.box(GOLD_D, 0.84, 0.03, 0.64, x, T1 + 0.25 + i * 0.35, 9.0); b.cyl([PINK, WHITE, 0xffe0a3][(i + (x > 4.5 ? 1 : 0)) % 3], 0.3, 0.1, x, T1 + 0.28 + i * 0.35, 9.35); }
  });
  armorlessLanding();
  function armorlessLanding() { urn(11.8, -11.2, 1); }

  // packing room (x -10.8..-3.6, z 4.95..12)
  workTable(-7.2, 8.0, 3.6, 1.3, 0.9, 1, PINK_L);
  [-8.3, -7.3, -6.3].forEach((x, i) => giftBox(x, T1 + 0.98, 8.0, 0.4, 0.3, JAR[i * 2 + 1], 1));
  b.box(WHITE, 1.0, 0.01, 0.7, -7.2, T1 + 0.98, 7.7);
  [0, 1, 2].forEach((i) => b.cyl(JAR[i * 3 + 2], 0.3, 0.1, -5.9 + i * 0.01, T1 + 0.98 + i * 0.1, 8.2));
  [-9.0, -8.2].forEach((x, i) => b.cylRot([PINK_D, 0xffe066][i], 0.12, 0.8, x, T1 + 1.05, 7.7, 0, 0, Math.PI / 2));
  workTable(-7.2, 11.6, 4.6, 0.8, 0.9, 1, MARBLE);
  [-8.6, -6.4].forEach((x, i) => { b.cylRot([PINK, BURG_L][i], 0.2, 0.9, x, T1 + 1.1, 11.6, 0, 0, Math.PI / 2); b.cylRot(GOLD, 0.205, 0.04, x - 0.2, T1 + 1.1, 11.6, 0, 0, Math.PI / 2); });
  jarShelf(-3.95, 6.7, 3.0, 0.45, 2.4, 1, 'z', -1, 'box');
  S(PINK_D, -4.5, 10.6, 1.0, 1.0, 0.7, 1);
  S(WHITE, -4.5, 10.6, 0.8, 0.8, 0.5, 1, 0.7);
  b.box(GOLD, 1.02, 0.7, 0.07, -4.5, T1, 10.6);
  b.box(GOLD, 0.07, 0.7, 1.02, -4.5, T1, 10.6);
  bow(-4.5, T1 + 1.28, 10.6);
  S(BURG_L, -9.8, 6.0, 0.9, 0.7, 0.6, 1);
  b.box(GOLD, 0.92, 0.04, 0.72, -9.8, T1 + 0.6, 6.0);
  b.box(PINK_T, 4.0, 0.015, 3.6, -7.2, T1, 8.3);

  // bakers' dorm: 2 beds with pink covers, wardrobe, table with chairs
  [-16.3, -12.8].forEach((x) => addBed(b, plan, x, 10.9, 1, Math.PI, ROSEG, PINK_D));
  S(WOOD, -14.55, 11.5, 0.5, 0.5, 0.55, 1);
  b.box(GOLD, 0.52, 0.04, 0.52, -14.55, T1 + 0.55, 11.5);
  b.cyl(GOLD, 0.14, 0.2, -14.55, T1 + 0.59, 11.5);
  S(BURG, -15.75, 5.4, 3.9, 0.6, 2.4, 1);
  [-1, 1].forEach((k) => { b.box(PINK_D, 1.7, 2.0, 0.03, -15.75 + k * 0.95, T1 + 0.2, 5.72); b.dot(GOLD, 0.1, -15.75 + k * 0.1, T1 + 1.2, 5.76); });
  b.box(GOLD, 3.95, 0.08, 0.65, -15.75, T1 + 2.4, 5.4);
  S(WOOD_L, -14.5, 7.8, 1.2, 0.8, 0.75, 1);
  b.box(WHITE, 1.3, 0.04, 0.9, -14.5, T1 + 0.75, 7.8);
  b.ball(PINK, 0.18, -14.5, T1 + 0.9, 7.8);
  addChair(b, plan, -14.5, 6.9, 1, 0, ROSEG);
  addChair(b, plan, -14.5, 8.7, 1, Math.PI, ROSEG);
  b.cyl(PINK_D, 3.2, 0.02, -14.2, T1, 8.4);
  b.cyl(GOLD, 3.3, 0.015, -14.2, T1, 8.4);
  b.cyl(PINK_D, 3.2, 0.025, -14.2, T1, 8.4);
}
