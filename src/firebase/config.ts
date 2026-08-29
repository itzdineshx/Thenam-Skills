import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentSingleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thenamskills.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thenamskills",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thenamskills.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "660964432008",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:660964432008:web:4ad5d11ac73915d61ee73d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MBF7G5QMNK"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);

// Use browserLocalPersistence to prevent IndexedDB closing/lock issues during popup auth
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Could not set browserLocalPersistence on Firebase auth:', err);
});

// Use persistentSingleTabManager to prevent multi-tab IndexedDB lock conflicts
// and "The database is closing/hidden" errors when Google OAuth popup opens/closes.
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({ forceOwnership: false }) })
  });
} catch (e) {
  console.warn('Fallback to standard getFirestore:', e);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const storage = getStorage(app);

export const isFirebaseConfigured = true;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

