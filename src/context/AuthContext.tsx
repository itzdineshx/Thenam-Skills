import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { StudentProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  firebaseUser: User | null;
  currentUserProfile: StudentProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  mockEducatorLogin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  currentUserProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  mockEducatorLogin: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // New mock login function
  const mockEducatorLogin = () => {
    const mockProfile: StudentProfile = {
      id: 'mock_educator_jayamurugan',
      name: 'Jayamurugan',
      headline: 'Senior Educator & AI Specialist',
      college: 'THENAM Campus',
      department: 'Computer Science',
      yearOfStudy: 'Faculty',
      location: 'Chennai, India',
      avatar: 'https://cdn.phototourl.com/free/2026-08-26-5659434f-46e0-4faa-8391-72dfeefaa208.jpg',
      coverImage: '',
      bio: 'Educator shaping the future of AI.',
      email: 'jayamurugan@thenam.edu',
      skills: ['Machine Learning', 'AI', 'Mentorship'],
      interests: [],
      metrics: {
        coursesCompleted: 0,
        certificatesCount: 0,
        projectsCount: 0,
        networkCount: 0,
        xpPoints: 0,
        streakDays: 0,
        globalRank: 1
      },
      journey: [],
      role: 'faculty',
      profileCompleted: true,
      isOnboardingCompleted: true
    };
    localStorage.setItem('mockEducator_v2', JSON.stringify(mockProfile));
    setCurrentUserProfile(mockProfile);
  };

  useEffect(() => {
    const mockUser = localStorage.getItem('mockEducator_v2');
    if (mockUser) {
      setCurrentUserProfile(JSON.parse(mockUser));
      setLoading(false);
      return; // Skip Firebase auth sync
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          // Sync account state and fetch backend user profile
          const intendedRole = localStorage.getItem('intendedRole');
          const res = await api.post('/auth/sync', { role: intendedRole || 'student' });
          setCurrentUserProfile(res.data);
        } catch (error) {
          console.error('Failed to sync/load user profile from backend API:', error);
        }
      } else {
        setCurrentUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
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
        const res = await api.get(`/auth/me?t=${Date.now()}`);
        setCurrentUserProfile(res.data);
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
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
        signOut: handleSignOut,
        logout: handleSignOut,
        refreshProfile,
        mockEducatorLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
