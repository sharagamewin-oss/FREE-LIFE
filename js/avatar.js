// =====================================================
// AVATAR: your own character. It walks, runs, flies, sits and sleeps.
// It is built from simple shapes, so there are no model files to load.
// =====================================================
import * as THREE from 'three';

// ---------- CHANGE THESE COLOURS TO LOOK LIKE YOU ----------
export const LOOK = {
  skin: 0xf1c27d,
  hair: 0x2b1b12,
  hairStyle: 'short',    // 'short', 'long' or 'none'
  shirt: 0x3f8f8a,
  pants: 0x35405a,
  shoes: 0x2a2522
};

// Body sizes in metres. The eyes end up about 1.7 m high, like the camera when walking.
const LEG_UP = 0.45;               // thigh
const LEG_LOW = 0.43;              // shin + foot
const LEG = LEG_UP + LEG_LOW;      // hip height when standing
const LIE_CENTER = 0.91;           // lying down: the middle of the body is this far from the feet
const LIE_THICK = 0.14;            // lying down: the middle of the body is this high above the bed
const HIP_ABOVE_SEAT = 0.09;       // sitting: the hip joint is this high above the seat

const lerp = (a, b, t) => a + (b - a) * t;

// Turn from angle a toward angle b by the short way round.
function lerpAngle(a, b, t) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

// Mix two sets of joint angles. t = 0 gives a, t = 1 gives b.
function mix(a, b, t) {
  const out = {};
  for (const k in a) out[k] = lerp(a[k], b[k], t);
  return out;
}

// Joint angles for each pose (radians). Positive hip/arm = swing forward.
const POSE_FLY_HOVER = { hipL: -0.1, hipR: -0.1, kneeL: -0.1, kneeR: -0.1, armL: 0.0, armR: 0.0, elbowL: 0.2, elbowR: 0.2, out: 0.7, lean: 0 };
const POSE_SIT_SEAT = { hipL: 1.45, hipR: 1.45, kneeL: -1.5, kneeR: -1.5, armL: 0.45, armR: 0.45, elbowL: 1.0, elbowR: 1.0, out: 0.05, lean: 0 };
const POSE_SIT_GROUND = { hipL: 1.5, hipR: 1.5, kneeL: -0.12, kneeR: -0.12, armL: 0.35, armR: 0.35, elbowL: 0.5, elbowR: 0.5, out: 0.12, lean: 0 };
const POSE_SLEEP = { hipL: 0, hipR: 0, kneeL: 0.05, kneeR: 0.05, armL: 0.08, armR: 0.08, elbowL: 0.15, elbowR: 0.15, out: 0.12, lean: 0 };

export function createAvatar({ scene, look = LOOK }) {
  const mat = (color) => new THREE.MeshLambertMaterial({ color });
  const M = {
    skin: mat(look.skin), hair: mat(look.hair), shirt: mat(look.shirt),
    pants: mat(look.pants), shoes: mat(look.shoes), dark: mat(0x1c1c1c)
  };

  const root = new THREE.Group();    // where the feet are, and which way the avatar faces
  const pose = new THREE.Group();    // tilts the whole body (leaning when flying, lying down)
  root.add(pose);
  scene.add(root);

  function part(geo, material, x, y, z, parent) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }

  // ----- body (the avatar faces -z, like the camera does) -----
  const shirt = part(new THREE.CapsuleGeometry(0.2, 0.2, 4, 12), M.shirt, 0, 1.19, 0, pose);
  shirt.scale.z = 0.62;
  part(new THREE.BoxGeometry(0.4, 0.16, 0.25), M.pants, 0, 0.93, 0, pose);
  part(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 8), M.skin, 0, 1.52, 0, pose);

  // ----- head -----
  const head = new THREE.Group();
  head.position.set(0, 1.66, 0);
  pose.add(head);
  const skull = part(new THREE.SphereGeometry(0.16, 20, 16), M.skin, 0, 0, 0, head);
  skull.scale.y = 1.06;
  part(new THREE.SphereGeometry(0.024, 8, 6), M.skin, 0, -0.015, -0.158, head);                    // nose
  const eyeGeo = new THREE.SphereGeometry(0.022, 8, 6);
  const eyes = [-1, 1].map((s) => part(eyeGeo, M.dark, s * 0.06, 0.02, -0.146, head));
  part(new THREE.BoxGeometry(0.05, 0.012, 0.01), M.dark, 0, -0.065, -0.148, head);                  // mouth

  if (look.hairStyle !== 'none') {
    // top of the head, all the way round
    part(new THREE.SphereGeometry(0.172, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.4), M.hair, 0, 0.012, 0.01, head);
    // back and sides (the front stays clear so the face shows)
    part(new THREE.SphereGeometry(0.172, 20, 12, 0, Math.PI, 0, Math.PI * 0.62), M.hair, 0, 0.012, 0.01, head);
    if (look.hairStyle === 'long') {
      const long = part(new THREE.CapsuleGeometry(0.15, 0.3, 4, 10), M.hair, 0, -0.2, 0.075, head);
      long.scale.z = 0.5;
    }
  }

  // ----- arms (shoulder joint, then elbow joint) -----
  function makeArm(side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.27, 1.42, 0);
    pose.add(shoulder);
    part(new THREE.CapsuleGeometry(0.058, 0.19, 4, 8), M.shirt, 0, -0.15, 0, shoulder);
    const elbow = new THREE.Group();
    elbow.position.set(0, -0.3, 0);
    shoulder.add(elbow);
    part(new THREE.CapsuleGeometry(0.05, 0.17, 4, 8), M.skin, 0, -0.135, 0, elbow);
    part(new THREE.SphereGeometry(0.052, 8, 6), M.skin, 0, -0.29, 0, elbow);
    return { shoulder, elbow };
  }
  const armL = makeArm(-1);
  const armR = makeArm(1);

  // ----- legs (hip joint, then knee joint) -----
  function makeLeg(side) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.11, LEG, 0);
    pose.add(hip);
    part(new THREE.CapsuleGeometry(0.078, LEG_UP - 0.156, 4, 8), M.pants, 0, -LEG_UP / 2, 0, hip);
    const knee = new THREE.Group();
    knee.position.set(0, -LEG_UP, 0);
    hip.add(knee);
    part(new THREE.CapsuleGeometry(0.068, 0.264, 4, 8), M.pants, 0, -0.2, 0, knee);
    part(new THREE.BoxGeometry(0.13, 0.09, 0.27), M.shoes, 0, -LEG_LOW + 0.045, -0.06, knee);
    return { hip, knee };
  }
  const legL = makeLeg(-1);
  const legR = makeLeg(1);

  // ----- a soft shadow on the ground -----
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 20),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  // ----- little floating Z letters while sleeping -----
  function makeZ() {
    const cv = document.createElement('canvas');
    cv.width = 64;
    cv.height = 64;
    const c = cv.getContext('2d');
    c.font = 'bold 46px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.lineWidth = 6;
    c.strokeStyle = 'rgba(40, 60, 120, 0.9)';
    c.fillStyle = '#ffffff';
    c.strokeText('Z', 32, 34);
    c.fillText('Z', 32, 34);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
    sprite.visible = false;
    scene.add(sprite);
    return sprite;
  }
  const zs = [makeZ(), makeZ(), makeZ()];
  const headTmp = new THREE.Vector3();

  // ----- state -----
  let state = 'stand';       // 'stand', 'sit' or 'sleep'
  let poseKind = 'stand';    // the pose we are in (or leaving) while blending
  let anchor = null;         // where we sit or sleep
  let blend = 0;             // 0 = standing, 1 = fully sitting or sleeping
  let heading = 0;           // which way the body faces (0 = looking toward -z)
  let phase = 0;             // walking cycle
  let ampS = 0;              // smoothed walking swing
  let flyW = 0;              // 0 = on the ground, 1 = flying pose
  let time = 0;
  let baseY = null;
  let visible = true;
  const last = { x: 0, y: 0, z: 0 };

  // Sit down or lie down. target = { x, z, y, yaw, exitX, exitZ, exitDist } for furniture,
  // or nothing / { ground: true } to do it right where you stand.
  function begin(kind, target) {
    if (state !== 'stand') return;
    const onGround = !target || target.ground;
    const x = onGround ? last.x : target.x;
    const z = onGround ? last.z : target.z;
    const y = onGround ? last.y : target.y;
    const yaw = onGround ? heading + (kind === 'sleep' ? Math.PI : 0) : target.yaw;

    let rootX = x;
    let rootZ = z;
    let rootY;
    if (kind === 'sit') {
      rootY = y + HIP_ABOVE_SEAT - LEG;                      // hips on the seat
    } else {
      rootX = x - Math.sin(yaw) * LIE_CENTER;                // the body's middle on the bed
      rootZ = z - Math.cos(yaw) * LIE_CENTER;
      rootY = y + LIE_THICK;
    }
    anchor = {
      kind, ground: onGround, x, z, y, yaw, rootX, rootY, rootZ,
      exitX: onGround ? 0 : target.exitX, exitZ: onGround ? 0 : target.exitZ, exitDist: onGround ? 0 : target.exitDist
    };
    state = kind;
    poseKind = kind;
  }

  function stand() {
    if (state === 'stand') return;
    if (!anchor.ground) heading = anchor.yaw;                // face the way out
    state = 'stand';
  }

  // Call every frame.
  //   info = { x, z, ground, altitude, vx, vz, flying }
  function update(dt, info) {
    time += dt;
    const speed = Math.hypot(info.vx, info.vz);
    const moving = speed > 0.4;
    const flyingNow = !!info.flying && info.altitude > 0.3;

    // Smooth ground height (so stepping onto the bridge is not a jump).
    if (baseY === null) baseY = info.ground;
    baseY += (info.ground - baseY) * (1 - Math.exp(-14 * dt));
    const standY = baseY + info.altitude;
    last.x = info.x;
    last.z = info.z;
    last.y = standY;

    // Turn to face the way you walk.
    if (state === 'stand' && moving) {
      heading = lerpAngle(heading, Math.atan2(-info.vx, -info.vz), 1 - Math.exp(-12 * dt));
    }

    // Blend between standing and sitting / sleeping.
    const goal = state === 'stand' ? 0 : 1;
    blend += Math.sign(goal - blend) * Math.min(Math.abs(goal - blend), dt * 3.2);
    const e = blend * blend * (3 - 2 * blend);
    if (blend === 0 && state === 'stand') {
      poseKind = 'stand';
      anchor = null;
    }
    const sitW = poseKind === 'sit' ? e : 0;
    const lieW = poseKind === 'sleep' ? e : 0;

    // ----- walking / running -----
    if (moving && !flyingNow && state === 'stand') phase += dt * (4 + speed * 0.9);
    const amp = (flyingNow || state !== 'stand') ? 0 : Math.min(1, speed / 4) * (speed > 8 ? 0.95 : 0.6);
    ampS += (amp - ampS) * (1 - Math.exp(-10 * dt));
    const s = Math.sin(phase);
    const c = Math.cos(phase);
    const sway = Math.sin(time * 1.6) * 0.02;
    const run = speed > 8 ? 0.5 : 0;
    const walk = {
      hipL: s * ampS, hipR: -s * ampS,
      kneeL: -Math.max(0, c) * ampS * 1.2, kneeR: -Math.max(0, -c) * ampS * 1.2,
      armL: -s * ampS * 0.9, armR: s * ampS * 0.9,
      elbowL: 0.15 + ampS * (0.2 + run), elbowR: 0.15 + ampS * (0.2 + run),
      out: 0.06 + sway,
      lean: -run * Math.min(1, speed / 12) * 0.35
    };

    // ----- flying (lean forward like a superhero when moving fast) -----
    flyW += ((flyingNow ? 1 : 0) - flyW) * (1 - Math.exp(-6 * dt));
    const f = Math.min(1, speed / 12);
    const fly = mix(POSE_FLY_HOVER, {
      hipL: -0.45, hipR: -0.45, kneeL: -0.2, kneeR: -0.2, armL: 2.6, armR: 2.6,
      elbowL: 0.1, elbowR: 0.1, out: 0.1, lean: -1.05
    }, f);

    let j = mix(walk, fly, flyW);
    if (sitW > 0) j = mix(j, anchor.ground ? POSE_SIT_GROUND : POSE_SIT_SEAT, sitW);
    if (lieW > 0) j = mix(j, POSE_SLEEP, lieW);

    // ----- apply the joint angles -----
    legL.hip.rotation.x = j.hipL;
    legR.hip.rotation.x = j.hipR;
    legL.knee.rotation.x = j.kneeL;
    legR.knee.rotation.x = j.kneeR;
    armL.shoulder.rotation.x = j.armL;
    armR.shoulder.rotation.x = j.armR;
    armL.shoulder.rotation.z = -j.out;
    armR.shoulder.rotation.z = j.out;
    armL.elbow.rotation.x = j.elbowL;
    armR.elbow.rotation.x = j.elbowR;
    eyes.forEach((eye) => { eye.scale.y = lerp(1, 0.12, lieW); });    // eyes shut when asleep

    // Tilt the body around its middle (or around the feet when lying down).
    const pivot = 0.9 * (1 - lieW);
    const tilt = j.lean + lieW * Math.PI / 2;
    pose.rotation.x = tilt;
    pose.position.set(0, pivot - pivot * Math.cos(tilt), -pivot * Math.sin(tilt));

    // ----- where the avatar is -----
    let px = info.x;
    let py = standY;
    let pz = info.z;
    let yaw = heading;
    if (anchor && blend > 0) {
      px = lerp(px, anchor.rootX, e);
      py = lerp(py, anchor.rootY, e);
      pz = lerp(pz, anchor.rootZ, e);
      yaw = lerpAngle(heading, anchor.yaw, e);
    }
    root.position.set(px, py, pz);
    root.rotation.y = yaw;
    root.visible = visible;

    // Shadow: only on the ground, smaller when you are high up.
    const onFurniture = anchor && !anchor.ground && blend > 0.2;
    shadow.visible = visible && !onFurniture;
    shadow.position.set(px, baseY + 0.02, pz);
    const shrink = Math.max(0.3, 1 - info.altitude / 40);
    shadow.scale.set(shrink, shrink, 1);
    shadow.material.opacity = 0.25 * shrink;

    // Z letters rise above the head while asleep.
    const sleeping = state === 'sleep' && blend > 0.9 && visible;
    if (sleeping) head.getWorldPosition(headTmp);
    zs.forEach((z3, i) => {
      z3.visible = sleeping;
      if (!sleeping) return;
      const t = (time * 0.45 + i / 3) % 1;
      z3.position.set(headTmp.x + 0.12 + t * 0.3, headTmp.y + 0.3 + t * 0.7, headTmp.z);
      const size = 0.16 + t * 0.2;
      z3.scale.set(size, size, 1);
      z3.material.opacity = Math.sin(Math.PI * t);
    });
  }

  // The world position of the middle of the head (the camera looks at this).
  function getHeadPosition(out) {
    head.getWorldPosition(out);
    return out;
  }

  return {
    root,
    get state() { return state; },
    get blend() { return blend; },
    get anchor() { return anchor; },
    sit: (target) => begin('sit', target),
    sleep: (target) => begin('sleep', target),
    stand,
    update,
    getHeadPosition,
    setVisible: (v) => { visible = v; }
  };
}
