import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

function mapFirebaseUser(firebaseUser, profile) {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: profile.name || firebaseUser.displayName || firebaseUser.email,
    role: profile.role === 'admin' ? 'admin' : 'student',
  };
}

function friendlyAuthError(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'That email address is invalid.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Firebase rejected this request. Check the Firestore API and security rules.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
}

async function loadProfile(firebaseUser) {
  const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
  return snapshot.exists() ? mapFirebaseUser(firebaseUser, snapshot.data()) : null;
}

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    try {
      callback(await loadProfile(firebaseUser));
    } catch (error) {
      console.error('[LearnHub] Could not load the signed-in user profile.', error);
      callback(null, friendlyAuthError(error));
    }
  });
}

export async function getCurrentUser() {
  return auth.currentUser ? loadProfile(auth.currentUser) : null;
}

async function enrollInPublishedCourses(userId) {
  const publishedCourses = await getDocs(query(collection(db, 'courses'), where('status', '==', 'published')));
  if (publishedCourses.empty) return;

  const batch = writeBatch(db);
  const now = new Date().toISOString();
  publishedCourses.forEach((courseSnapshot) => {
    const progressId = `${userId}__${courseSnapshot.id}`;
    batch.set(doc(db, 'progress', progressId), {
      userId,
      courseId: courseSnapshot.id,
      status: 'enrolled',
      lessonCompletion: {},
      quizAttempts: {},
      percentComplete: 0,
      enrolledAt: now,
      lastAccessedAt: now,
      completedAt: null,
    });
  });
  await batch.commit();
}

export async function signup({ name, email, password }) {
  if (!name?.trim() || !email?.trim() || !password) {
    throw new Error('Name, email, and password are all required.');
  }

  let credential;
  let profileCreated = false;
  try {
    credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    await updateProfile(credential.user, { displayName: name.trim() });

    const profile = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'student',
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', credential.user.uid), profile);
    profileCreated = true;
    await enrollInPublishedCourses(credential.user.uid);
    return mapFirebaseUser(credential.user, profile);
  } catch (error) {
    if (credential?.user) {
      try {
        if (profileCreated) await deleteDoc(doc(db, 'users', credential.user.uid));
        await deleteUser(credential.user);
      } catch (rollbackError) {
        console.error('[LearnHub] Could not roll back an incomplete signup.', rollbackError);
      }
    }
    throw new Error(friendlyAuthError(error));
  }
}

export async function login({ email, password }) {
  if (!email?.trim() || !password) throw new Error('Email and password are required.');
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const user = await loadProfile(credential.user);
    if (!user) {
      await signOut(auth);
      throw new Error('This account is missing its LearnHub profile. Ask an administrator for help.');
    }
    return user;
  } catch (error) {
    if (error.message?.startsWith('This account is missing')) throw error;
    throw new Error(friendlyAuthError(error));
  }
}

export function logout() {
  return signOut(auth);
}

export async function getAllStudentCount() {
  const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
  return snapshot.size;
}
