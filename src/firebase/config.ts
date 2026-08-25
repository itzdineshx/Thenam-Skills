import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
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
// Analytics might not be supported in some environments (like dev without proper config), so it's good to keep it optional or just export it.
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
export const storage = getStorage(app);

export const isFirebaseConfigured = true;
export const googleProvider = new GoogleAuthProvider();
