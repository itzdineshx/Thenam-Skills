import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { uploadProfileImage } from '../firebase/storage';
import { StudentProfileForm } from '../components/StudentProfileForm';
import { api } from '../services/api';
import { ShieldCheck, Award, Zap, Heart } from 'lucide-react';

export default function StudentOnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleSubmit = async (formData: any, imageFile: File | null, coverImageFile: File | null) => {
    setLoading(true);
    setError('');
    try {
      let photoURL = user.photoURL || '';

      // 1. Upload profile image to Firebase Storage if selected
      if (imageFile) {
        photoURL = await uploadProfileImage(user.uid, imageFile);
      }
      
      let coverImage = formData.coverImage || '';
      if (coverImageFile) {
        const { storageService } = await import('../firebase/storage');
        coverImage = await storageService.uploadProfileCover(user.uid, coverImageFile);
      }

      // 2. Map form data to backend schema
      const userProfilePayload = {
        name: formData.name,
        photoURL,
        department: formData.department,
        year: formData.year,
        collegeName: formData.collegeName,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        skills: formData.skills,
        collegeLocation: formData.collegeLocation,
        linkedinURL: formData.linkedinURL,
        githubURL: formData.githubURL,
        coverImage
      };

      // 3. Save profile to backend API
      await api.post('/profile', userProfilePayload);

      // 4. Refresh Auth Context state
      await refreshProfile();

      // 5. Navigate Home
      navigate('/home');
    } catch (err: any) {
      console.error('Error during onboarding submit:', err);
      setError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initialData = {
    name: user.displayName || '',
    email: user.email || '',
    avatar: user.photoURL || '',
    phone: user.phoneNumber || '',
  };

  return (
    <div className="min-h-screen bg-slate-100/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Onboarding Header */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Student Ecosystem Onboarding</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Complete Your Student Identity
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Setting up your verified THENAM profile unlocks access to the learning curriculum, official cryptographic certifications, peer network communities, and student job listings.
            </p>
          </div>
        </div>

        {/* Form Container Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8">
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl flex gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 leading-normal">{error}</p>
            </div>
          )}

          <StudentProfileForm
            initialData={initialData}
            onSubmit={handleSubmit}
            submitLabel="Save and Complete Profile Setup"
            loading={loading}
            role="student"
          />
        </div>

      </div>
    </div>
  );
}

// AlertCircle local component
const AlertCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
