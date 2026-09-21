import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { StudentProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  firebaseUser: User | null;
  currentUserProfile: StudentProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  currentUserProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signOut: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Clean up any old mock state on mount
  useEffect(() => {
    // Check if user returned from Google signInWithRedirect
    getRedirectResult(auth).catch((err) => {
      console.warn('Redirect sign-in result check:', err);
    });

    const mockUser = localStorage.getItem('mockEducator_v2');
    if (mockUser) {
      setCurrentUserProfile(JSON.parse(mockUser));
      setLoading(false);
      return; // Skip Firebase auth sync
    }

    let unsubFirestore: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      // Clean up previous Firestore listener
      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }

      if (user) {
        try {
          // Initial sync to ensure user document exists
          const intendedRole = localStorage.getItem('intendedRole');
          const res = await api.post('/auth/sync', { role: intendedRole || 'student' });
          setCurrentUserProfile(res.data);
        } catch (error) {
          console.error('Failed to sync/load user profile from backend API:', error);
        }

        // Set up real-time listener on user document for live avatar/banner/profile sync
        try {
          const { doc, onSnapshot: firestoreOnSnapshot } = await import('firebase/firestore');
          const { db } = await import('../firebase/config');
          const userDocRef = doc(db, 'users', user.uid);
          
          unsubFirestore = firestoreOnSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setCurrentUserProfile((prev: StudentProfile | null) => {
                if (!prev) return { id: snapshot.id, ...data } as any;
                // Merge Firestore data on top of existing profile, preserving backend-only fields
                return {
                  ...prev,
                  ...data,
                  id: prev.id || snapshot.id,
                  uid: (prev as any).uid || snapshot.id
                } as any;
              });
            }
          }, (error) => {
            console.warn('Firestore real-time listener error:', error);
          });
        } catch (err) {
          console.warn('Could not set up real-time profile listener:', err);
        }
      } else {
        setCurrentUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence).catch(() => {});
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.warn('signInWithPopup failed or was blocked, falling back to signInWithRedirect:', error);
      if (
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.message?.includes('Database is closing') ||
        error?.message?.includes('Cross-Origin-Opener-Policy')
      ) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw error;
      }
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Failed to sign in with Email:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('mockEducator');
    localStorage.removeItem('mockEducator_v2');
    try {
      await api.post('/auth/logout').catch(() => {});
      await firebaseSignOut(auth);
      setFirebaseUser(null);
      setCurrentUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      try {
        // Fetch from Firestore directly for the freshest data
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const snapshot = await getDoc(userDocRef);
        
        if (snapshot.exists()) {
          const data = snapshot.data();
          setCurrentUserProfile((prev) => {
            if (!prev) return { id: snapshot.id, ...data } as any;
            return {
              ...prev,
              ...data,
              id: prev.id || snapshot.id,
              uid: prev.uid || snapshot.id
            } as any;
          });
        } else {
          // Fallback to backend API
          const res = await api.get(`/auth/me?t=${Date.now()}`);
          setCurrentUserProfile(res.data);
        }
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
        // Fallback to backend API
        try {
          const res = await api.get(`/auth/me?t=${Date.now()}`);
          setCurrentUserProfile(res.data);
        } catch (err2) {
          console.error('Backend fallback also failed:', err2);
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: firebaseUser,
        firebaseUser,
        currentUserProfile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signOut: handleSignOut,
        logout: handleSignOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
