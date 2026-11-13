// =====================================================
// FIREBASE: sign in, game money, and buying houses
// =====================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, collection, onSnapshot, doc, getDoc, setDoc, deleteDoc, runTransaction, serverTimestamp,
  writeBatch, query, where, arrayUnion, arrayRemove, deleteField
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDnlL80CLBQi-pXqssC29le0_4tmwXoPos",
  authDomain: "free-life-173ad.firebaseapp.com",
  projectId: "free-life-173ad",
  storageBucket: "free-life-173ad.firebasestorage.app",
  messagingSenderId: "784953273932",
  appId: "1:784953273932:web:f2b16b605e90a929a68ee9"
};

// ---------- GAME MONEY (not real money) ----------
// If you change these numbers, change them in the Firestore rules too.
export const START_COINS = 5000;
export const PRICES = {
  cottage: 2000,
  treehouse: 2500,
  traditional: 3000,
  modern: 4000
};

// Who can live in a house (the owner picks one when saying yes). At most MAX_MEMBERS people.
export const ROLES = ['Wife', 'Husband', 'Love', 'Friend', 'Family', 'Roommate'];
export const MAX_MEMBERS = 6;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export function signIn() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOutUser() {
  return signOut(auth);
}

// Calls cb(user) now and every time someone signs in or out (user = null when signed out).
export function onUserChange(cb) {
  onAuthStateChanged(auth, cb);
}

// A new player gets the starting coins, one time only.
export async function ensureWallet(user) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { coins: START_COINS, plotId: null });
  }
}

// Calls cb({ coins, plotId }) now and whenever the player's money changes. Returns a stop function.
export function watchWallet(uid, cb) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) cb(snap.data());
  }, (err) => console.warn('Could not read wallet:', err));
}

// Calls cb({ plotId: { ownerId, ownerName, price, boughtAt }, ... }) now and whenever a plot changes.
export function watchPlots(cb) {
  const owners = {};
  onSnapshot(collection(db, 'plots'), (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === 'removed') {
        delete owners[change.doc.id];
        return;
      }
      const d = change.doc.data();
      owners[change.doc.id] = {
        ownerId: d.ownerId,
        ownerName: d.ownerName || 'A player',
        price: d.price != null ? d.price : null,
        boughtAt: d.boughtAt && d.boughtAt.toMillis ? d.boughtAt.toMillis() : null,
        memberIds: d.memberIds || [],
        members: d.members || {}
      };
    });
    cb(owners);
  }, (err) => console.warn('Could not read plots:', err));
}

// Buy a house: takes the coins and gives the plot to the player, all at once.
// Errors: not-signed-in, bad-house, no-wallet, taken, has-house, no-money
export async function buyPlot(plotId, house) {
  const user = auth.currentUser;
  if (!user) throw new Error('not-signed-in');
  const price = PRICES[house];
  if (!price) throw new Error('bad-house');

  const userRef = doc(db, 'users', user.uid);
  const plotRef = doc(db, 'plots', plotId);

  await runTransaction(db, async (tx) => {
    const u = await tx.get(userRef);
    const p = await tx.get(plotRef);
    if (!u.exists()) throw new Error('no-wallet');
    if (p.exists()) throw new Error('taken');
    const data = u.data();
    if (data.plotId) throw new Error('has-house');
    if (data.coins < price) throw new Error('no-money');

    tx.update(userRef, { coins: data.coins - price, plotId });
    tx.set(plotRef, {
      ownerId: user.uid,
      ownerName: user.displayName || 'A player',
      house,
      price,
      boughtAt: serverTimestamp()
    });
  });
}
// Sell a house back: gives the coins back and frees the plot, all at once.
// Errors: not-signed-in, no-wallet, not-owner, no-price
export async function sellPlot(plotId, requestIds = []) {
  const user = auth.currentUser;
  if (!user) throw new Error('not-signed-in');

  const userRef = doc(db, 'users', user.uid);
  const plotRef = doc(db, 'plots', plotId);

  await runTransaction(db, async (tx) => {
    const u = await tx.get(userRef);
    const p = await tx.get(plotRef);
    if (!u.exists()) throw new Error('no-wallet');
    if (!p.exists() || p.data().ownerId !== user.uid) throw new Error('not-owner');
    const price = p.data().price;
    if (price == null) throw new Error('no-price');

    tx.update(userRef, { coins: u.data().coins + price, plotId: null });
    tx.delete(plotRef);
    requestIds.forEach((id) => tx.delete(doc(db, 'requests', id)));
  });
}
// ---------- Permission to enter a house ----------

// Ask the owner of a house for permission to enter.
export async function askToEnter(plot) {
  const user = auth.currentUser;
  if (!user) throw new Error('not-signed-in');
  await setDoc(doc(db, 'requests', `${plot.id}_${user.uid}`), {
    plotId: plot.id,
    ownerId: plot.ownerId,
    fromUid: user.uid,
    fromName: user.displayName || 'A player',
    createdAt: serverTimestamp()
  });
}

// Owner: calls cb([{ id, plotId, fromUid, fromName }, ...]) with people waiting for a yes or no.
export function watchRequestsToMe(uid, cb) {
  const q = query(collection(db, 'requests'), where('ownerId', '==', uid));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => console.warn('Could not read requests:', err));
}

// Visitor: calls cb([plotId, ...]) with the houses I already asked about.
export function watchMyRequests(uid, cb) {
  const q = query(collection(db, 'requests'), where('fromUid', '==', uid));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data().plotId));
  }, (err) => console.warn('Could not read my requests:', err));
}

// Owner says yes: the person becomes a member (wife, love, friend...) and the request is removed.
export async function approveRequest(req, role) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'plots', req.plotId), {
    [`members.${req.fromUid}`]: { name: req.fromName, role },
    memberIds: arrayUnion(req.fromUid)
  });
  batch.delete(doc(db, 'requests', req.id));
  await batch.commit();
}

// Owner says no.
export async function denyRequest(req) {
  await deleteDoc(doc(db, 'requests', req.id));
}

// Owner removes a member from the house.
export async function removeMember(plotId, uid) {
  await writeBatch(db)
    .update(doc(db, 'plots', plotId), {
      [`members.${uid}`]: deleteField(),
      memberIds: arrayRemove(uid)
    })
    .commit();
}
