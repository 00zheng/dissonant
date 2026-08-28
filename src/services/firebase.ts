import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyDNq1Zt-1hM3Xi3NXdyqRLgj6o454eEWZg",
  authDomain: "dissonant-music-player-dbd65.firebaseapp.com",
  projectId: "dissonant-music-player-dbd65",
  storageBucket: "dissonant-music-player-dbd65.firebasestorage.app",
  messagingSenderId: "26295380837",
  appId: "1:26295380837:web:53ac1cb0a58ebbd1914f8c",
  measurementId: "G-00ZNBGL0GZ"
};

// Initialize Firebase once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
