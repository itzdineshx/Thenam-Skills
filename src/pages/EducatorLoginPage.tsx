import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, BookOpen, Key, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';

export default function EducatorLoginPage() {
  const [error, setError] = useState('');
  const { mockEducatorLogin } = useAuth();
  const { navigate } = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'jayamurugan' && password === 'thenam@12345') {
      localStorage.setItem('intendedRole', 'faculty');
      mockEducatorLogin();
      navigate('/home');
    } else {
      setError('Invalid educator credentials. Please check your username and password.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex selection:bg-indigo-500 selection:text-white">
      {/* Left Panel - Branding & Visuals (Hidden on smaller screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=2000"
            alt="Educator teaching"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
          <div className="absolute inset-0 bg-indigo-900/30 mix-blend-multiply" />
        </div>

        {/* Decorative Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 p-12 max-w-xl text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-8 shadow-2xl">
            <BookOpen className="w-10 h-10 text-indigo-300" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            Shape the next generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">engineers</span>.
          </h1>
          <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-md">
            The Educator Portal gives you powerful tools to manage courses, evaluate student projects, and issue verified credentials.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-md text-left">
            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <Users className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Mentor & Guide</h4>
                <p className="text-xs text-slate-400 mt-1">Track student progress and offer insights.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <Key className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Secure Access</h4>
                <p className="text-xs text-slate-400 mt-1">Authorized entry for campus faculty only.</p>
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
              Educator Sign In
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Access the faculty dashboard and admin tools.
            </p>
          </div>

          <form onSubmit={handleMockLogin} className="space-y-5">
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-800 leading-normal">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-hidden transition-all placeholder:text-slate-400"
                placeholder="Enter educator username"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-hidden transition-all placeholder:text-slate-400"
                  placeholder="Enter educator password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-600/20 text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/20 transition-all select-none cursor-pointer active:scale-98 mt-2"
            >
              Sign In to Dashboard
            </button>
            
            <div className="relative flex items-center justify-center mt-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 lg:bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Authorized access only
                </span>
              </div>
            </div>
          </form>
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
