// =====================================================
// FIREBASE: sign in with Google + save who owns each plot
// =====================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, collection, onSnapshot, doc, writeBatch, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDnlL80CLBQi-pXqssC29le0_4tmwXoPos",
  authDomain: "free-life-173ad.firebaseapp.com",
  projectId: "free-life-173ad",
  storageBucket: "free-life-173ad.firebasestorage.app",
  messagingSenderId: "784953273932",
  appId: "1:784953273932:web:f2b16b605e90a929a68ee9"
};

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

// Calls cb({ plotId: { ownerId, ownerName }, ... }) now and whenever any plot changes.
export function watchPlots(cb) {
  const owners = {};
  onSnapshot(collection(db, 'plots'), (snap) => {
    snap.docChanges().forEach((change) => {
      const d = change.doc.data();
      owners[change.doc.id] = { ownerId: d.ownerId, ownerName: d.ownerName || 'A player' };
    });
    cb(owners);
  }, (err) => console.warn('Could not read plots:', err));
}

// Claim a plot. One plot per person, and a plot can only be claimed once (the rules enforce this).
export async function claimPlot(plotId) {
  const user = auth.currentUser;
  if (!user) throw new Error('not-signed-in');
  const batch = writeBatch(db);
  batch.set(doc(db, 'users', user.uid), { plotId });
  batch.set(doc(db, 'plots', plotId), {
    ownerId: user.uid,
    ownerName: user.displayName || 'A player',
    claimedAt: serverTimestamp()
  });
  await batch.commit();
}
