import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { AutomationCelebrationModal } from './components/AutomationCelebrationModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import StudentOnboardingPage from './pages/StudentOnboardingPage';
import { ensureUserDocument } from './firebase/firestore';

import EducatorLoginPage from './pages/EducatorLoginPage';

// Pages
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { CertificateDetailPage } from './pages/CertificateDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { EventsPage } from './pages/EventsPage';
import { EventPlayerPage } from './pages/EventPlayerPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { TalentPage } from './pages/TalentPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NetworkPage } from './pages/NetworkPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { BondPage } from './pages/BondPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { OpeningSoonPage } from './pages/OpeningSoonPage';

import { ShieldCheck } from 'lucide-react';
import { EducatorFAB } from './components/EducatorFAB';

const AppContent: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const { user, currentUserProfile, loading } = useAuth();
  const { showToast } = useApp();

  // Ensure user document exists in Firestore on first login
  React.useEffect(() => {
    if (user) {
      ensureUserDocument(user).catch((err) => {
        console.error('Failed to create/retrieve user database record:', err);
      });
    }
  }, [user]);

  // Intercept and redirect completed users attempting to load onboarding
  React.useEffect(() => {
    if (currentUserProfile?.isOnboardingCompleted === true && currentPath === '/onboarding') {
      navigate('/home');
    }
  }, [currentUserProfile, currentPath, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100/70 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user && !currentUserProfile) {
    if (currentPath.toLowerCase() === '/educator/login') {
      return <EducatorLoginPage />;
    }
    return <LoginPage />;
  }

  // Force onboarding if profile is incomplete
  // Note: We check `user` so we don't trap mock educators (where user is null) in a blank screen.
  // We also check both flags to support older mock profiles.
  if (user && (!currentUserProfile || (currentUserProfile.isOnboardingCompleted !== true && currentUserProfile.profileCompleted !== true))) {
    return <StudentOnboardingPage />;
  }

  // Route resolver
  const renderRoute = () => {
    const path = currentPath.toLowerCase();

    if (path.startsWith('/onboarding')) {
      return <StudentOnboardingPage />;
    }
    if (path.startsWith('/learn')) {
      return <LearnPage />;
    }
    if (path.startsWith('/course/')) {
      return <CourseDetailPage />;
    }
    if (path.startsWith('/certificate/') || path.startsWith('/verify/')) {
      return <CertificateDetailPage />;
    }
    if (path.startsWith('/certificates')) {
      return <CertificatesPage />;
    }
    if (path.startsWith('/projects') || path.startsWith('/project/')) {
      return <OpeningSoonPage />;
    }
    if (path.startsWith('/events')) {
      if (path.includes('/learn')) {
        return <EventPlayerPage />;
      }
      const parts = currentPath.split('/');
      if (parts[2] && parts[2].trim() !== '') {
        return <EventDetailPage />;
      }
      return <EventsPage />;
    }
    if (path.startsWith('/communities')) {
      return <OpeningSoonPage />;
    }
    if (path.startsWith('/talent') || path.startsWith('/search')) {
      return <OpeningSoonPage />;
    }
    if (path.startsWith('/achievements')) {
      return <OpeningSoonPage />;
    }
    if (path.startsWith('/network')) {
      return <NetworkPage />;
    }
    if (path.startsWith('/bond')) {
      return <BondPage />;
    }
    if (path.startsWith('/profile')) {
      return <ProfilePage />;
    }
    if (path.startsWith('/notifications')) {
      return <NotificationsPage />;
    }
    if (path.startsWith('/settings')) {
      return <SettingsPage />;
    }
    if (path.startsWith('/admin')) {
      // Role protection verification
      if (currentUserProfile.role !== 'admin' && currentUserProfile.role !== 'faculty') {
        return (
          <div className="max-w-md mx-auto mt-20 bg-white border border-slate-200 p-8 rounded-3xl text-center space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-rose-600">Access Denied</h2>
            <p className="text-slate-650 text-xs">You do not have the required permissions to access the Faculty/Admin portal.</p>
            <button
              onClick={() => navigate('/home')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Go Home
            </button>
          </div>
        );
      }
      return <AdminPage />;
    }

    // Default route -> Home
    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Fixed Header */}
      <Navbar />

      {/* Main Dynamic View */}
      <main className="flex-1 pb-12">
        {renderRoute()}
      </main>

      {/* Global Modals & Notifications */}
      <AutomationCelebrationModal />
      <Toast />
      <EducatorFAB />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <img src="/logo.jpg" alt="THENAM CAMPUS Logo" className="w-6 h-6 rounded-lg object-cover" />
            <span className="font-extrabold text-slate-800">THENAM CAMPUS</span>
            <span>•</span>
            <span>Verified Student Credentialing & Talent Network</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            {(currentUserProfile?.role === 'admin' || currentUserProfile?.role === 'faculty') && (
              <button onClick={() => navigate('/admin')} className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors text-xs">Faculty Portal</button>
            )}
            <span>© {new Date().getFullYear()} THENAM Academic Board. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </RouterProvider>
    </AuthProvider>
  );
}
