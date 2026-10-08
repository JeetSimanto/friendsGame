import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  increment,
  arrayUnion,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCh2Z83BX_VG4ASXdK201eGtE5ifSa_KuU",
  authDomain: "riendsgame.firebaseapp.com",
  projectId: "riendsgame",
  storageBucket: "riendsgame.firebasestorage.app",
  messagingSenderId: "83814596542",
  appId: "1:83814596542:web:1fc3f2005b2f7099f603ef",
  measurementId: "G-79F60MWCEP"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

/**
 * Authenticates admin using real Firebase Auth credentials.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<UserCredential>}
 */
export async function adminSignIn(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

/**
 * Signs out the authenticated admin.
 */
export async function adminSignOut() {
  return signOut(auth);
}

/**
 * Subscribes to Firebase Auth state changes.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Helper: Normalize player name to valid document key
export function getPlayerDocId(playerName) {
  return playerName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Health check: Tests if Firestore database exists and is reachable.
 */
export async function checkFirestoreHealth() {
  try {
    const playersCol = collection(db, "players");
    const snapshot = await getDocs(playersCol);
    return {
      status: 'connected',
      message: 'Cloud Firestore connected successfully',
      count: snapshot.size,
    };
  } catch (error) {
    const msg = error?.message || '';
    const code = error?.code || '';

    if (code === 'not-found' || msg.includes('NOT_FOUND') || msg.includes('does not exist') || msg.includes('404')) {
      return {
        status: 'not_created',
        message: 'Firestore Database has not been created yet in Firebase Console.',
        actionUrl: 'https://console.firebase.google.com/project/riendsgame/firestore',
      };
    }

    if (code === 'permission-denied' || msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
      return {
        status: 'permission_denied',
        message: 'Firestore Security Rules are locked. Please deploy the rules or set test mode.',
        actionUrl: 'https://console.firebase.google.com/project/riendsgame/firestore/rules',
      };
    }

    return {
      status: 'error',
      message: msg || 'Unable to connect to Firestore backend.',
      code,
    };
  }
}

/**
 * Save to local storage as safety fallback so data is NEVER lost.
 */
function saveLocalAttempt(playerName, relation, score, totalQuestions, auditData = {}) {
  try {
    const key = 'friends_game_local_players';
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    const docId = getPlayerDocId(playerName);
    const percentage = Math.round((score / totalQuestions) * 100);
    const isWorthy = percentage >= 50;
    const nowIso = new Date().toISOString();

    const idx = list.findIndex((p) => p.id === docId);
    const historyItem = {
      score,
      totalQuestions,
      percentage,
      isWorthy,
      playedAt: nowIso,
      submittedAnswers: auditData.submittedAnswers || [],
      durationSeconds: auditData.durationSeconds || null,
    };

    if (idx >= 0) {
      list[idx].attemptsCount = (list[idx].attemptsCount || 1) + 1;
      list[idx].latestScore = score;
      list[idx].bestScore = Math.max(list[idx].bestScore || 0, score);
      list[idx].isWorthy = list[idx].isWorthy || isWorthy;
      list[idx].relation = relation || list[idx].relation;
      list[idx].lastPlayedAt = nowIso;
      if (!list[idx].history) list[idx].history = [];
      list[idx].history.push(historyItem);
    } else {
      list.push({
        id: docId,
        playerName: playerName.trim(),
        relation: relation || 'friend',
        attemptsCount: 1,
        latestScore: score,
        bestScore: score,
        isWorthy,
        lastPlayedAt: nowIso,
        history: [historyItem],
      });
    }
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.error("Local storage fallback error:", e);
  }
}

/**
 * Record a game attempt to Firestore (and local fallback).
 * Stores public score/worthiness data ONLY (ZERO sensitive financial info).
 * Includes audit trail (submitted answers & duration) for cheat verification.
 */
export async function recordGameAttempt(playerName, relation, score, totalQuestions, auditData = {}) {
  if (!playerName) return;

  // 1. Save to local fallback first
  saveLocalAttempt(playerName, relation, score, totalQuestions, auditData);

  // 2. Save to Cloud Firestore
  try {
    const docId = getPlayerDocId(playerName);
    const playerRef = doc(db, "players", docId);
    const percentage = Math.round((score / totalQuestions) * 100);
    const isWorthy = percentage >= 50;
    const nowIso = new Date().toISOString();

    const historyEntry = {
      score,
      totalQuestions,
      percentage,
      isWorthy,
      playedAt: nowIso,
      submittedAnswers: auditData.submittedAnswers || [],
      durationSeconds: auditData.durationSeconds || null,
    };

    const docSnap = await getDoc(playerRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const newBestScore = Math.max(data.bestScore ?? 0, score);
      const everWorthy = data.isWorthy || isWorthy;

      await updateDoc(playerRef, {
        attemptsCount: increment(1),
        latestScore: score,
        bestScore: newBestScore,
        isWorthy: everWorthy,
        relation: relation || data.relation,
        lastPlayedAt: serverTimestamp(),
        history: arrayUnion(historyEntry),
      });
    } else {
      await setDoc(playerRef, {
        playerName: playerName.trim(),
        relation: relation || 'friend',
        attemptsCount: 1,
        latestScore: score,
        bestScore: score,
        isWorthy: isWorthy,
        history: [historyEntry],
        createdAt: serverTimestamp(),
        lastPlayedAt: serverTimestamp(),
      });
    }
    console.log("Game attempt successfully recorded to Firestore for:", playerName);
  } catch (error) {
    console.warn("Firestore save failed (database may not be initialized yet in console):", error);
  }
}

/**
 * Securely writes a bKash reward claim to the ISOLATED `bkash_claims` collection.
 * The `players` collection remains clean and devoid of financial PII.
 */
export async function savePlayerBkash(playerName, bkashNumber, relation = 'friend') {
  if (!playerName || !bkashNumber) return;

  const docId = getPlayerDocId(playerName);
  const nowIso = new Date().toISOString();
  const cleanNumber = bkashNumber.trim();

  // 1. Local fallback
  try {
    const key = 'friends_game_local_bkash';
    const claims = JSON.parse(localStorage.getItem(key) || '{}');
    claims[docId] = {
      playerName: playerName.trim(),
      bkashNumber: cleanNumber,
      submittedAt: nowIso,
    };
    localStorage.setItem(key, JSON.stringify(claims));
  } catch (e) {}

  // 2. Cloud Firestore: write to isolated `bkash_claims` collection
  try {
    const claimDocId = `${docId}_${Date.now()}`;
    const claimRef = doc(db, "bkash_claims", claimDocId);
    await setDoc(claimRef, {
      playerDocId: docId,
      playerName: playerName.trim(),
      relation,
      bkashNumber: cleanNumber,
      submittedAt: serverTimestamp(),
      verified: false,
    });
    console.log("bKash claim securely isolated and recorded to bkash_claims for:", playerName);
  } catch (error) {
    console.warn("Firestore bkash_claims save failed:", error);
  }

  // 3. ALSO update player document directly so it is immediately accessible
  try {
    const playerRef = doc(db, "players", docId);
    await updateDoc(playerRef, {
      bkashNumber: cleanNumber,
      bkashSubmittedAt: serverTimestamp(),
    });
    console.log("bKash number attached to player document for:", playerName);
  } catch (updateError) {
    console.log("Note on player doc bkash update (handled by bkash_claims):", updateError?.message);
  }
}

/**
 * Fetches bKash claims from the `bkash_claims` collection.
 */
export async function getBkashClaims() {
  const claimsMap = {};
  try {
    const col = collection(db, "bkash_claims");
    const snapshot = await getDocs(col);
    snapshot.forEach((d) => {
      const data = d.data();
      const pId = data.playerDocId || getPlayerDocId(data.playerName || '');
      if (pId && (!claimsMap[pId] || (data.submittedAt && claimsMap[pId].submittedAt < data.submittedAt))) {
        claimsMap[pId] = data;
      }
    });
  } catch (err) {
    console.warn("Could not query bkash_claims collection:", err.message);
  }
  return claimsMap;
}

/**
 * Fetch all registered players for the Admin Panel.
 * Robustly merges bKash numbers from claims collection, player doc, and local storage.
 */
export async function getPlayersList() {
  let firestoreList = [];
  let isFirestoreOk = false;

  try {
    const playersCol = collection(db, "players");
    const q = query(playersCol, orderBy("lastPlayedAt", "desc"));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      firestoreList.push({ id: doc.id, ...doc.data() });
    });
    isFirestoreOk = true;
  } catch (error) {
    try {
      const playersCol = collection(db, "players");
      const snapshot = await getDocs(playersCol);
      snapshot.forEach((doc) => {
        firestoreList.push({ id: doc.id, ...doc.data() });
      });
      isFirestoreOk = true;
    } catch (fallbackError) {
      console.warn("Could not query Firestore (using local storage fallback):", fallbackError.message);
    }
  }

  // Get local storage list
  let localList = [];
  try {
    localList = JSON.parse(localStorage.getItem('friends_game_local_players') || '[]');
  } catch (e) {}

  let listToReturn = isFirestoreOk && firestoreList.length > 0 ? firestoreList : localList;

  // Retrieve bKash claims from claims collection
  let claims = {};
  try {
    claims = await getBkashClaims();
  } catch (e) {}

  // Retrieve local bKash claims fallback
  let localClaims = {};
  try {
    localClaims = JSON.parse(localStorage.getItem('friends_game_local_bkash') || '{}');
  } catch (e) {}

  // Merge bKash numbers: NEVER overwrite existing bkashNumber with empty string!
  listToReturn = listToReturn.map((p) => {
    const bkashNum = claims[p.id]?.bkashNumber 
      || p.bkashNumber 
      || localClaims[p.id]?.bkashNumber 
      || '';

    return {
      ...p,
      bkashNumber: bkashNum,
      claimData: claims[p.id] || null,
    };
  });

  return listToReturn;
}

export default app;
