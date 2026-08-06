import { readCollection, writeCollection, DB_KEYS, initDb } from './localDb';
import { generateId } from '../utils/idGenerator';
import { ADMIN_SIGNUP_CODE } from '../config/adminAccess';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from "./firebaseConfig.js"

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

export function subscribeToAuthChanges(callback) {
  onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
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
    throw new Error('Name, email, and password are all required.');
  }

  let finalRole = 'student';
  if (role === 'admin') {
    if (adminCode !== ADMIN_SIGNUP_CODE) {
      throw new Error('That admin access code is incorrect.');
    }
    finalRole = 'admin';
  }

  const newUser = {
    uid: user.uid,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: finalRole,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, newUser]);
  const safeUser = stripPassword(newUser);
  setSession(safeUser);
  return safeUser;
}

export async function login({ email, password }) {
  if (!email?.trim() || !password) {
    throw new Error('Email and password are required.');
  }
  const users = getUsers();
  const found = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  if (!found) {
    throw new Error('Invalid email or password.');
  }
  const safeUser = stripPassword(found);
  setSession(safeUser);
  return safeUser;
}

export async function logout() {
  setSession(null);
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
export function promoteToAdmin(email) {
  const users = getUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (index === -1) {
    console.warn(`[learnhub] No account found for ${email}. They need to sign up first.`);
    return false;
  }
  users[index] = { ...users[index], role: 'admin' };
  saveUsers(users);
  console.log(`[learnhub] ${email} is now an admin. Log out and back in to see the change.`);
  return true;
}

export function getAllStudentCount() {
  return getUsers().filter((u) => u.role === 'student').length;
}

if (typeof window !== 'undefined') {
  window.promoteToAdmin = promoteToAdmin;
}
