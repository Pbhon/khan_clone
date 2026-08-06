// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp({
    apiKey: "AIzaSyAzLx3yj1Xo9acg_sJ10xyn5WCcVrDVNQE",
    authDomain: "khanclone-7f791.firebaseapp.com",
    projectId: "khanclone-7f791",
    storageBucket: "khanclone-7f791.firebasestorage.app",
    messagingSenderId: "523262537963",
    appId: "1:523262537963:web:15c39f2fca9853f8b34eae",
    measurementId: "G-603SC5S8WN"
})

// Initialize Firebase
export const auth = getAuth(app)
export const db = getFirestore(app)