import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2, Sparkles, ShieldCheck, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      localStorage.setItem('intendedRole', 'student');
      await signInWithGoogle();
      console.log('Logged in with Google successfully');
    } catch (err: any) {
      console.error('Google Auth error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        setError(`This domain (${currentDomain}) is not authorized for Google Sign-In. Please add it to the Authorized Domains list in your Firebase Console.`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing authentication. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Popup was superseded by another popup trigger
      } else {
        const errorMessage = err.message || 'Google Authentication failed.';
        setError(errorMessage.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex selection:bg-indigo-500 selection:text-white">
      {/* Left Panel - Branding & Visuals (Hidden on smaller screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2000"
            alt="Students collaborating"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          <div className="absolute inset-0 bg-indigo-900/20 mix-blend-multiply" />
        </div>

        {/* Decorative Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 p-12 max-w-xl text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-8 shadow-2xl">
            <GraduationCap className="w-10 h-10 text-indigo-300" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            Accelerate your career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">verified skills</span>.
          </h1>
          <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-md">
            Join the THENAM Campus ecosystem. Learn from industry experts, build real-world projects, and earn credentials that employers trust.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-md text-left">
            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Verified Identity</h4>
                <p className="text-xs text-slate-400 mt-1">Stand out with authenticated academic credentials.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Smart Network</h4>
                <p className="text-xs text-slate-400 mt-1">Connect with peers & faculty across campuses.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative overflow-hidden bg-slate-50 lg:bg-white">
        {/* Mobile decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-100/50 rounded-full blur-3xl -z-10 lg:hidden" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl -z-10 lg:hidden" />

        <div className="w-full max-w-sm space-y-10">
          
          {/* Mobile Header / Desktop simple header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-8 lg:mb-10 w-full">
              <img 
                src="/logo.jpg" 
                alt="Thenam Campus Logo" 
                className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl lg:rounded-3xl object-cover shadow-xl shadow-indigo-500/20"
              />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Sign in to your student account to continue learning.
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-800 leading-normal">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-slate-200 hover:border-slate-300 rounded-2xl shadow-xs text-sm font-extrabold text-slate-700 bg-white hover:bg-slate-50 hover:shadow-md focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all select-none cursor-pointer group"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 text-indigo-600" />
              ) : (
                <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
            
            <div className="relative flex items-center justify-center mt-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 lg:bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Secure student access
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-8 text-center w-full">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} THENAM Academic Board
          </p>
        </div>
      </div>
    </div>
  );
}
