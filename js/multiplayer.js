// =====================================================
// MULTIPLAYER: see other players walking around, their names, and chat.
// Uses Firebase REALTIME DATABASE (fast), not Firestore.
// =====================================================
import * as THREE from 'three';
import { createAvatar } from './avatar.js';
import { getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase, ref, set, remove, push, onValue, onChildAdded, onDisconnect,
  query, limitToLast, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// ---------- 1) PASTE YOUR REALTIME DATABASE URL HERE ----------
// Firebase console > Build > Realtime Database > the link shown at the top of the Data tab.
const DATABASE_URL = 'https://console.firebase.google.com/project/free-life-173ad/database/free-life-173ad-default-rtdb/data/~2F';

// ---------- 2) SETTINGS (you can change these) ----------
const SEND_EVERY = 0.25;     // seconds between position updates while moving
const HEARTBEAT = 8;         // seconds between "I am still here" updates while standing still
const STALE_AFTER = 40;      // seconds: a player with no news for this long is hidden
const SHOW_RANGE = 220;      // metres: other players further away than this are not drawn
const NAME_RANGE = 45;       // metres: name tags are shown only this close
const BUBBLE_SECONDS = 7;    // how long a chat bubble stays above a head
const CHAT_COOLDOWN = 1500;  // milliseconds you must wait between two messages
const MAX_CHAT = 120;        // longest message

// Pretty colours for other players (picked from their id, so a person keeps the same look).
const SHIRTS = [0xd9534f, 0xe8a33d, 0x5cb85c, 0x3f8fd6, 0x9b59b6, 0xe86a92, 0x2bb3a3, 0xf0e14a];
const PANTS = [0x35405a, 0x4a3b2a, 0x2f4f4f, 0x5a5a5a, 0x233a66];
const HAIRS = [0x2b1b12, 0x6b4423, 0xc9a24b, 0x111111, 0x8a3b1e];
const SKINS = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];
const STYLES = ['short', 'long', 'none'];

function hashOf(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function lookFor(uid) {
  const h = hashOf(uid);
  return {
    skin: SKINS[h % SKINS.length],
    hair: HAIRS[(h >> 3) % HAIRS.length],
    hairStyle: STYLES[(h >> 6) % STYLES.length],
    shirt: SHIRTS[(h >> 9) % SHIRTS.length],
    pants: PANTS[(h >> 12) % PANTS.length],
    shoes: 0x2a2522
  };
}

// ---------- Text drawn on a little sign that always faces you (name tags and chat bubbles) ----------
function makeTextSprite(text, { bubble = false } = {}) {
  const lines = [];
  if (bubble) {
    const words = text.split(' ');
    let line = '';
    words.forEach((w) => {
      if ((line + ' ' + w).trim().length > 26 && line) { lines.push(line); line = w; }
      else line = (line + ' ' + w).trim();
    });
    if (line) lines.push(line);
  } else {
    lines.push(text);
  }
  const shown = lines.slice(0, 4);

  const fontPx = bubble ? 34 : 40;
  const lineH = fontPx * 1.25;
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  g.font = `bold ${fontPx}px sans-serif`;
  let w = 0;
  shown.forEach((l) => { w = Math.max(w, g.measureText(l).width); });
  c.width = Math.ceil(w + 44);
  c.height = Math.ceil(lineH * shown.length + 28);

  g.font = `bold ${fontPx}px sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = bubble ? 'rgba(255,255,255,0.92)' : 'rgba(30,40,60,0.55)';
  const r = 22;
  g.beginPath();
  g.moveTo(r, 0); g.lineTo(c.width - r, 0); g.quadraticCurveTo(c.width, 0, c.width, r);
  g.lineTo(c.width, c.height - r); g.quadraticCurveTo(c.width, c.height, c.width - r, c.height);
  g.lineTo(r, c.height); g.quadraticCurveTo(0, c.height, 0, c.height - r);
  g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0);
  g.fill();
  g.fillStyle = bubble ? '#2a2a2a' : '#ffffff';
  shown.forEach((l, i) => g.fillText(l, c.width / 2, 14 + lineH * (i + 0.5)));

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, fog: false, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  const height = bubble ? 0.34 * shown.length + 0.12 : 0.32;
  sprite.scale.set((c.width / c.height) * height, height, 1);
  sprite.renderOrder = 20;
  sprite.userData.dispose = () => { texture.dispose(); material.dispose(); };
  return sprite;
}

function dropSprite(scene, sprite) {
  if (!sprite) return;
  scene.remove(sprite);
  sprite.userData.dispose();
}

// ---------- The chat box (built here, so you do not need to edit index.html) ----------
function buildChatUi() {
  const style = document.createElement('style');
  style.textContent = `
    #chatLog { position: fixed; left: 18px; top: 78px; width: min(340px, 70vw); z-index: 16;
      pointer-events: none; font-size: 13px; line-height: 1.35; color: #fff;
      text-shadow: 0 1px 3px rgba(0,0,0,.9); }
    #chatLog div { margin-top: 3px; transition: opacity .6s; }
    #chatLog b { color: #ffe08a; }
    #chatBtn { position: fixed; right: 18px; top: 58px; z-index: 30; font-family: inherit; font-size: 13px;
      font-weight: bold; color: #7a3b22; background: #fff1d0; border: none; border-radius: 999px;
      padding: 6px 14px; box-shadow: 0 3px 0 rgba(224,165,106,.9); cursor: pointer; }
    #chatRow { position: fixed; left: 18px; top: 40vh; width: min(340px, 80vw); z-index: 35; display: none; gap: 6px; }
    #chatRow input { flex: 1; font-size: 16px; padding: 8px 12px; border-radius: 999px;
      border: 2px solid #e0a56a; outline: none; background: #fff8e8; color: #333; }
    #chatRow button { font-size: 14px; font-weight: bold; border: none; border-radius: 999px; padding: 8px 14px;
      background: #e98a5b; color: #fff; cursor: pointer; }
    #onlineText { position: fixed; right: 18px; top: 92px; z-index: 16; font-size: 12px; color: #fff;
      text-shadow: 0 1px 3px rgba(0,0,0,.9); pointer-events: none; }
  `;
  document.head.appendChild(style);

  const log = document.createElement('div');
  log.id = 'chatLog';
  const btn = document.createElement('button');
  btn.id = 'chatBtn';
  btn.textContent = 'Chat (Enter)';
  const row = document.createElement('div');
  row.id = 'chatRow';
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = MAX_CHAT;
  input.placeholder = 'Say something... (Enter to send, Esc to close)';
  input.autocomplete = 'off';
  const send = document.createElement('button');
  send.textContent = 'Send';
  row.appendChild(input);
  row.appendChild(send);
  const online = document.createElement('div');
  online.id = 'onlineText';

  document.body.appendChild(log);
  document.body.appendChild(btn);
  document.body.appendChild(row);
  document.body.appendChild(online);
  return { log, btn, row, input, send, online };
}

// =====================================================
// createMultiplayer: call this once, after the player signs in.
//   scene       the three.js scene
//   getSelf()   -> { x, z, altitude, state, flying, inside, thirdPerson, headX, headY, headZ }
//   groundAt    (x, z) => height of the ground there
//   onChatOpen  () => void   (the game uses it to stop your walking while you type)
// =====================================================
export function createMultiplayer({ scene, getSelf, groundAt, onChatOpen }) {
  const app = getApp();
  const db = getDatabase(app, DATABASE_URL);

  let user = null;
  let myName = 'Player';
  let started = false;
  let serverOffset = 0;                 // difference between our clock and the server clock (ms)
  const remote = new Map();             // uid -> everything we know about that player
  const stops = [];                     // functions that stop listening
  const ui = buildChatUi();
  let chatOpen = false;
  let lastChatAt = 0;
  let sendTimer = 0;
  let heartbeatTimer = 0;
  let last = { x: -9999, z: -9999, a: -1, s: '', f: -1, h: -1 };
  let myBubble = null;
  let myBubbleLeft = 0;
  let chatLines = [];

  const serverNow = () => Date.now() + serverOffset;

  // ----- other players -----
  function makeRemote(uid) {
    const avatar = createAvatar({ scene, look: lookFor(uid) });
    avatar.setVisible(false);
    return {
      uid, avatar, name: 'Player', label: null, labelText: '', bubble: null, bubbleLeft: 0,
      target: { x: 0, z: 0, a: 0 }, cur: { x: 0, z: 0, a: 0 }, fresh: false,
      state: 'stand', flying: false, hidden: false, seenAt: 0, placed: false, active: false
    };
  }

  function killRemote(p) {
    p.avatar.setVisible(false);
    scene.remove(p.avatar.root);
    dropSprite(scene, p.label);
    dropSprite(scene, p.bubble);
    remote.delete(p.uid);
  }

  function onPlayers(snapshot) {
    const all = snapshot.val() || {};
    // Remove players who left.
    for (const uid of [...remote.keys()]) {
      if (!all[uid]) killRemote(remote.get(uid));
    }
    for (const uid in all) {
      if (user && uid === user.uid) continue;
      const d = all[uid];
      if (typeof d.x !== 'number') continue;
      let p = remote.get(uid);
      if (!p) { p = makeRemote(uid); remote.set(uid, p); }
      p.name = String(d.n || 'Player').slice(0, 16);
      p.target.x = d.x;
      p.target.z = d.z;
      p.target.a = d.a || 0;
      p.state = d.s || 'stand';
      p.flying = !!d.f;
      p.hidden = !!d.h;
      p.seenAt = typeof d.t === 'number' ? d.t - 0 : serverNow();
      if (!p.placed) {          // first time: appear right at the spot (do not slide in from the middle)
        p.cur.x = d.x; p.cur.z = d.z; p.cur.a = d.a || 0;
        p.placed = true;
      }
    }
    ui.online.textContent = `Online: ${Object.keys(all).length}`;
  }

  // Called every frame by the game.
  function update(dt) {
    if (!started) return;
    const me = getSelf();

    // ----- send my position (only when something changed, or as a heartbeat) -----
    sendTimer += dt;
    heartbeatTimer += dt;
    if (sendTimer >= SEND_EVERY) {
      const moved = Math.hypot(me.x - last.x, me.z - last.z) > 0.15;
      const changed = moved || Math.abs(me.altitude - last.a) > 0.2 || me.state !== last.s ||
        (me.flying ? 1 : 0) !== last.f || (me.inside ? 1 : 0) !== last.h;
      if ((changed || heartbeatTimer >= HEARTBEAT)) {
        sendTimer = 0;
        heartbeatTimer = 0;
        last = { x: me.x, z: me.z, a: me.altitude, s: me.state, f: me.flying ? 1 : 0, h: me.inside ? 1 : 0 };
        set(ref(db, 'players/' + user.uid), {
          n: myName,
          x: Math.round(me.x * 10) / 10,
          z: Math.round(me.z * 10) / 10,
          a: Math.round(me.altitude * 10) / 10,
          s: me.state,
          f: me.flying ? 1 : 0,
          h: me.inside ? 1 : 0,
          t: serverTimestamp()
        }).catch((err) => console.warn('Could not send position:', err));
      }
    }

    // ----- draw the other players -----
    const now = serverNow();
    remote.forEach((p) => {
      const k = 1 - Math.exp(-9 * dt);
      const dx = p.target.x - p.cur.x;
      const dz = p.target.z - p.cur.z;
      let vx = 0;
      let vz = 0;
      if (Math.hypot(dx, dz) > 40) {            // far jump: just appear there
        p.cur.x = p.target.x; p.cur.z = p.target.z;
      } else if (dt > 0) {
        vx = (dx * k) / dt;
        vz = (dz * k) / dt;
        p.cur.x += dx * k;
        p.cur.z += dz * k;
      }
      p.cur.a += (p.target.a - p.cur.a) * k;

      const stale = now - p.seenAt > STALE_AFTER * 1000;
      const dist = Math.hypot(p.cur.x - me.x, p.cur.z - me.z);
      const inView = !p.hidden && !stale && !me.inside && dist < SHOW_RANGE;

      if (inView) {
        p.avatar.setVisible(true);
        // Sit / sleep / stand like the other person.
        if (p.state === 'sit' && p.avatar.state === 'stand') p.avatar.sit({ ground: true });
        else if (p.state === 'sleep' && p.avatar.state === 'stand') p.avatar.sleep({ ground: true });
        else if (p.state === 'stand' && p.avatar.state !== 'stand') p.avatar.stand();
        const sp = Math.hypot(vx, vz);
        if (sp > 14) { vx = (vx / sp) * 14; vz = (vz / sp) * 14; }    // keep the walk animation sensible
        p.avatar.update(dt, {
          x: p.cur.x, z: p.cur.z, ground: groundAt(p.cur.x, p.cur.z),
          altitude: p.cur.a, vx, vz, flying: p.flying
        });
      } else {
        p.avatar.setVisible(false);
        p.avatar.update(dt, { x: p.cur.x, z: p.cur.z, ground: 0, altitude: 0, vx: 0, vz: 0, flying: false });
      }

      // Name tag
      const showName = inView && dist < NAME_RANGE;
      if (showName) {
        if (!p.label || p.labelText !== p.name) {
          dropSprite(scene, p.label);
          p.label = makeTextSprite(p.name);
          p.labelText = p.name;
          scene.add(p.label);
        }
        const lift = p.avatar.state === 'sleep' ? 0.9 : (p.avatar.state === 'sit' ? 1.5 : 2.15);
        p.label.visible = true;
        p.label.position.set(p.cur.x, groundAt(p.cur.x, p.cur.z) + p.cur.a + lift, p.cur.z);
      } else if (p.label) {
        p.label.visible = false;
      }

      // Chat bubble
      if (p.bubble) {
        p.bubbleLeft -= dt;
        if (p.bubbleLeft <= 0 || !inView) {
          dropSprite(scene, p.bubble);
          p.bubble = null;
        } else {
          const lift = p.avatar.state === 'sleep' ? 1.3 : (p.avatar.state === 'sit' ? 1.9 : 2.55);
          p.bubble.position.set(p.cur.x, groundAt(p.cur.x, p.cur.z) + p.cur.a + lift, p.cur.z);
        }
      }
    });

    // My own chat bubble (above my head, only when you can see yourself)
    if (myBubble) {
      myBubbleLeft -= dt;
      if (myBubbleLeft <= 0) {
        dropSprite(scene, myBubble);
        myBubble = null;
      } else {
        myBubble.visible = me.thirdPerson && !me.inside;
        myBubble.position.set(me.headX, me.headY + 0.75, me.headZ);
      }
    }
  }

  // ----- chat -----
  function addChatLine(name, text, mine) {
    chatLines.push({ name, text, mine, born: Date.now() });
    if (chatLines.length > 40) chatLines.shift();
    renderChat();
  }

  function renderChat() {
    const t = Date.now();
    const show = chatLines.filter((l) => chatOpen || t - l.born < 14000).slice(-7);
    ui.log.innerHTML = '';
    show.forEach((l) => {
      const div = document.createElement('div');
      const b = document.createElement('b');
      b.textContent = l.name + ': ';
      div.appendChild(b);
      div.appendChild(document.createTextNode(l.text));        // textContent style: no HTML can sneak in
      ui.log.appendChild(div);
    });
  }
  setInterval(renderChat, 1500);

  function onChatMessage(snapshot) {
    const m = snapshot.val();
    if (!m || typeof m.m !== 'string') return;
    const name = String(m.n || 'Player').slice(0, 16);
    const text = m.m.slice(0, MAX_CHAT);
    const age = serverNow() - (typeof m.t === 'number' ? m.t : serverNow());
    if (age > 60000) return;                                   // old history: do not show again
    addChatLine(name, text, user && m.u === user.uid);
    if (age > 10000) return;                                   // no bubble for older messages
    if (user && m.u === user.uid) {
      dropSprite(scene, myBubble);
      myBubble = makeTextSprite(text, { bubble: true });
      myBubbleLeft = BUBBLE_SECONDS;
      scene.add(myBubble);
    } else {
      const p = remote.get(m.u);
      if (p) {
        dropSprite(scene, p.bubble);
        p.bubble = makeTextSprite(text, { bubble: true });
        p.bubbleLeft = BUBBLE_SECONDS;
        scene.add(p.bubble);
      }
    }
  }

  function openChat() {
    if (chatOpen) return;
    chatOpen = true;
    onChatOpen();
    ui.row.style.display = 'flex';
    ui.input.value = '';
    ui.input.focus();
    renderChat();
  }

  function closeChat() {
    chatOpen = false;
    ui.row.style.display = 'none';
    ui.input.blur();
    renderChat();
  }

  function sendChat() {
    const text = ui.input.value.trim().slice(0, MAX_CHAT);
    if (!text) { closeChat(); return; }
    if (Date.now() - lastChatAt < CHAT_COOLDOWN) return;       // too fast: keep the text, try again
    lastChatAt = Date.now();
    ui.input.value = '';
    push(ref(db, 'chat'), { u: user.uid, n: myName, m: text, t: serverTimestamp() })
      .catch((err) => console.warn('Could not send chat:', err));
    closeChat();
  }

  // Keys typed in the chat box must not walk your character.
  ['keydown', 'keyup'].forEach((type) => {
    ui.input.addEventListener(type, (e) => {
      e.stopPropagation();
      if (type === 'keydown' && e.key === 'Enter') sendChat();
      if (type === 'keydown' && e.key === 'Escape') closeChat();
    });
  });
  ui.send.addEventListener('click', sendChat);
  ui.btn.addEventListener('click', () => (chatOpen ? closeChat() : openChat()));
  window.addEventListener('keydown', (e) => {
    if (!started || chatOpen || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'Enter') { e.preventDefault(); openChat(); }
  });

  // ----- start and stop -----
  function start(firebaseUser) {
    if (started) stop();
    user = firebaseUser;
    myName = (user.displayName || 'Player').split(' ')[0].slice(0, 16);   // first name only
    started = true;
    ui.btn.style.display = '';

    stops.push(onValue(ref(db, '.info/serverTimeOffset'), (s) => { serverOffset = s.val() || 0; }));

    // When this player closes the page, remove their body from the world.
    const me = ref(db, 'players/' + user.uid);
    onDisconnect(me).remove().catch((err) => console.warn('onDisconnect failed:', err));

    stops.push(onValue(ref(db, 'players'), onPlayers, (err) => console.warn('Could not read players:', err)));
    stops.push(onChildAdded(query(ref(db, 'chat'), limitToLast(30)), onChatMessage,
      (err) => console.warn('Could not read chat:', err)));
    last = { x: -9999, z: -9999, a: -1, s: '', f: -1, h: -1 };   // force the first send
    heartbeatTimer = HEARTBEAT;
    sendTimer = SEND_EVERY;
  }

  function stop() {
    if (!started) return;
    started = false;
    stops.forEach((s) => { try { s(); } catch (e) { /* already stopped */ } });
    stops.length = 0;
    if (user) remove(ref(db, 'players/' + user.uid)).catch(() => {});
    remote.forEach((p) => killRemote(p));
    dropSprite(scene, myBubble);
    myBubble = null;
    chatLines = [];
    renderChat();
    closeChat();
    ui.online.textContent = '';
    ui.btn.style.display = 'none';
    user = null;
  }

  ui.btn.style.display = 'none';
  return { start, stop, update };
}
