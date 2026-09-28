import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAzLx3yj1Xo9acg_sJ10xyn5WCcVrDVNQE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'khanclone-7f791.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'khanclone-7f791',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'khanclone-7f791.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '523262537963',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:523262537963:web:15c39f2fca9853f8b34eae',
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  throw new Error(`Firebase configuration is missing: ${missingKeys.join(', ')}`);
}

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
