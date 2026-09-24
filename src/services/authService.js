import { readCollection, writeCollection, DB_KEYS, initDb } from './localDb';
import { generateId } from '../utils/idGenerator';
import { ADMIN_SIGNUP_CODE } from '../config/adminAccess';
import { auth, db } from './firebaseConfig.js';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocs, query, collection, where } from "firebase/firestore";

/**
 * ============================================================================
 * AUTH SERVICE — replace this file's internals with Firebase Auth
 * ============================================================================
 * The exported function names and signatures here (subscribeToAuthChanges,
 * login, signup, logout, getCurrentUser) match what you'd write against the
 * Firebase Auth SDK, so AuthContext.jsx never needs to change:
 *
 *   subscribeToAuthChanges(cb)  →  onAuthStateChanged(auth, cb)
 *   login({email, password})    →  signInWithEmailAndPassword(auth, email, password)
 *   signup({name, email, password}) → createUserWithEmailAndPassword(...) + setDoc(userProfileRef, {...})
 *   logout()                    →  signOut(auth)
 *
 * IMPORTANT — signup only creates an admin account when the caller passes
 * role: 'admin' AND the matching ADMIN_SIGNUP_CODE (see
 * src/config/adminAccess.js, and the "Admin accounts" section of the
 * README for the security tradeoff of doing this client-side). Any other
 * combination — including a bad or missing code — creates a student.
 * `promoteToAdmin` below still works too, for promoting an existing
 * account without the code.
 * ============================================================================
 */

initDb();

let listeners = [];

function notifyListeners(user) {
  listeners.forEach((callback) => callback(user));
}

function getUsers() {
  return readCollection(DB_KEYS.USERS) || [];
}

function saveUsers(users) {
  writeCollection(DB_KEYS.USERS, users);
}

function stripPassword(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function setSession(user) {
  writeCollection(DB_KEYS.SESSION, user);
  notifyListeners(user);
}

function mapFirebaseUser(firebaseUser, profile) {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: profile.name,
    role: profile.role,
  };
}

function friendlyAuthError(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return "An accoutn with this email already exists.";
    case 'auth/invalid-email':
      return "That email address is invalid.";
    case 'auth/weak-password':
      return "Password should be at least 6 characters long.";
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many attempts - try again in a bit.';
    default:
      return error.message || "Something went wrong. Please try again";
  }
}

/**
 * Registers a listener that's called immediately with the current user
 * (or null), and again every time auth state changes. Returns an unsubscribe
 * function — mirrors Firebase's onAuthStateChanged exactly so the swap later
 * is a one-line change in AuthContext.jsx.
 */
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) return callback(null);
    const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!profileSnap.exists()) return callback(null);
    callback(mapFirebaseUser(firebaseUser, profileSnap.data()));
  })
}

export async function getCurrentUser() {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  const profileSnap = await getDoc(doc(db, "users", firebaseUser.uid));
  return profileSnap.exists() ? mapFirebaseUser(firebaseUser, profileSnap.data()) : null;
}

/**
 * Creates a student account by default. Pass `role: 'admin'` together with
 * the correct `adminCode` to create an admin instead — the check happens
 * here, at the service boundary, not in the UI, so it can't be bypassed by
 * calling this function directly with a made-up role. A missing or
 * incorrect code throws rather than silently downgrading to student, so
 * the person trying gets clear feedback instead of a confusing account.
 */
export async function signup({ name, email, password, role = 'student', adminCode = '' }) {
  if (!name?.trim() || !email?.trim() || !password) {
    throw new Error("Name, email, and password are all required")
  }

  let finalRole = 'student';
  if (role === "admin") {
    if (adminCode !== ADMIN_SIGNUP_CODE) throw new Error("That admin access code is incorrect")
    finalRole = "admin";
  }

  let credential;
  try {
    credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  } catch (error) {
    throw new Error(friendlyAuthError(error));
  }

  const firebaseUser = credential.user;
  await updateProfile(firebaseUser, { displayName: name.trim() });

  const profile = { name: name.trim(), email: email.trim().toLowerCase(), role: finalRole, createdAt: serverTimestamp() };
  await setDoc(doc(db, 'users', firebaseUser.uid), profile)

  return mapFirebaseUser(firebaseUser, profile);
}

export async function login({ email, password }) {
  if (!email?.trim() || !password) throw new Error("Email and password are required.")
  try {
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  } catch (error) {
    throw new Error(friendlyAuthError(error));
  }
  return getCurrentUser();
}

export async function logout() {
  await signOut(auth);
}
/**
 * DEV / TESTING HELPER ONLY — not called from any UI component or button.
 * Flips an existing user to `role: 'admin'` directly in the mock database.
 *
 * This is the local stand-in for what you'd do once Firebase is wired up:
 * set a `role: 'admin'` field on the user's Firestore profile doc (or a
 * custom claim) from the Firebase console or an Admin SDK script running on
 * a trusted server — never from client-side app code. Run this from your
 * browser console: `promoteToAdmin('someone@example.com')`.
 */

export async function getAllStudentCount() {
  const studentsQuery = query(collection(db, 'users'), where ("role", "==", "student"));
  const snapshot = await getDocs(studentsQuery);
  return snapshot.size;
}
