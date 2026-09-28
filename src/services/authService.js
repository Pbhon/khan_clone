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

// Firebase emits the new session before signup has finished writing its profile.
// Wait for that write before the auth listener tries to load the user.
let signupProvisioning = null;

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
    case 'auth/configuration-not-found':
      return 'Authentication is not configured for this Firebase project. Ask the site administrator to enable email/password sign-in.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is disabled for this Firebase project.';
    case 'auth/network-request-failed':
      return 'Could not reach Firebase. Check your connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Ask the site administrator for help.';
    case 'auth/invalid-api-key':
      return 'The site has an invalid Firebase API key. Ask the site administrator for help.';
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
      if (signupProvisioning) await signupProvisioning;
      const user = await loadProfile(firebaseUser);
      if (auth.currentUser?.uid === firebaseUser.uid) {
        callback(user, user ? '' : 'This account is missing its LearnHub profile. Ask an administrator for help.');
      }
    } catch (error) {
      console.error('[LearnHub] Could not load the signed-in user profile.', error);
      if (auth.currentUser?.uid === firebaseUser.uid) callback(null, friendlyAuthError(error));
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
  let finishProvisioning;
  const provisioning = new Promise((resolve) => {
    finishProvisioning = resolve;
  });
  signupProvisioning = provisioning;
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
      } catch (rollbackError) {
        console.error('[LearnHub] Could not remove an incomplete signup profile.', rollbackError);
      }
      try {
        await deleteUser(credential.user);
      } catch (rollbackError) {
        console.error('[LearnHub] Could not remove an incomplete Firebase account.', rollbackError);
      }
    }
    throw new Error(friendlyAuthError(error));
  } finally {
    finishProvisioning();
    if (signupProvisioning === provisioning) signupProvisioning = null;
  }
}

export async function login({ email, password }) {
  if (!email?.trim() || !password) throw new Error('Email and password are required.');
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    try {
      const user = await loadProfile(credential.user);
      if (!user) throw new Error('This account is missing its LearnHub profile. Ask an administrator for help.');
      return user;
    } catch (profileError) {
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error('[LearnHub] Could not clear a session without a profile.', signOutError);
      }
      throw profileError;
    }
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
