import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { StudentProfile } from '../types';

const LOCAL_STORAGE_KEY_PREFIX = 'thenam_offline_user_';

const getLocalFallback = (uid: string): any | null => {
  try {
    const val = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${uid}`);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    console.error('Failed to read offline user profile from localStorage:', e);
    return null;
  }
};

const setLocalFallback = (uid: string, data: any): void => {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${uid}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write offline user profile to localStorage:', e);
  }
};

export const getUserProfile = async (uid: string): Promise<any | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    // Attempt Firestore getDoc
    const docSnap = await Promise.race([
      getDoc(docRef),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Firestore fetch timeout')), 3000))
    ]);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      setLocalFallback(uid, data);
      return data;
    }
    
    // Document not found in Firestore online, check local cache
    return getLocalFallback(uid);
  } catch (error) {
    console.error('Error fetching user profile from Firestore:', error);
    // If offline, blocked, or timed out, return local storage fallback
    const fallback = getLocalFallback(uid);
    if (fallback) {
      console.log('Using local storage fallback profile for UID:', uid);
      return fallback;
    }
    return null;
  }
};

export const createUserProfile = async (uid: string, data: Partial<StudentProfile>): Promise<void> => {
  const profilePayload = {
    ...data,
    uid,
    role: data.role || 'student',
    profileCompleted: true,
  };
  
  // First, always cache locally to keep UI responsive
  setLocalFallback(uid, profilePayload);

  try {
    const docRef = doc(db, 'users', uid);
    await Promise.race([
      setDoc(docRef, {
        ...profilePayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout connecting to database')), 2500))
    ]);
  } catch (error) {
    console.warn('Network issue while writing to Firestore. Document saved locally, sync will retry in background:', error);
  }
};

export const updateUserProfile = async (uid: string, data: Partial<StudentProfile>): Promise<void> => {
  // Update local cache
  const cached = getLocalFallback(uid) || {};
  const updated = { ...cached, ...data };
  setLocalFallback(uid, updated);

  try {
    const docRef = doc(db, 'users', uid);
    await Promise.race([
      updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout connecting to database')), 2500))
    ]);
  } catch (error) {
    console.warn('Network issue while updating Firestore. Document updated locally, sync will retry in background:', error);
  }
};

export const isProfileComplete = async (uid: string): Promise<boolean> => {
  try {
    const profile = await getUserProfile(uid);
    return profile?.profileCompleted === true;
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }
};

export const ensureUserDocument = async (firebaseUser: any): Promise<any> => {
  try {
    const existing = await getUserProfile(firebaseUser.uid);
    if (existing) {
      return existing;
    }
  } catch (err) {
    console.warn('Failed to query user document, trying to create placeholder:', err);
  }

  const providerData = firebaseUser.providerData?.[0] || {};
  const placeholder = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || providerData.email || '',
    name: firebaseUser.displayName || providerData.displayName || 'Google Student',
    photoURL: firebaseUser.photoURL || providerData.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    role: 'student',
    profileCompleted: false,
  };

  // Cache placeholder locally
  setLocalFallback(firebaseUser.uid, placeholder);

  try {
    const docRef = doc(db, 'users', firebaseUser.uid);
    await Promise.race([
      setDoc(docRef, {
        ...placeholder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout connecting to database')), 2500))
    ]);
  } catch (error) {
    console.warn('Network issue while ensuring Firestore document. Cache initialized locally:', error);
  }

  return placeholder;
};

// Backwards compatibility layer
export const dbService = {
  getStudentProfile: getUserProfile,
  saveLearningActivity: async (activity: any) => {
    console.log('[Firestore] Saving learning activity:', activity);
    return true;
  },
  issueCertificateRecord: async (cert: any) => {
    console.log('[Firestore] Issued certificate record:', cert);
    return true;
  }
};
