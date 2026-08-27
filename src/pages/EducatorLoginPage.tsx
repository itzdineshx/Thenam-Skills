import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-md w-full space-y-8">
        
        {/* Branding Logo & Header */}
        <div className="text-center space-y-4">
          <img 
            src="/logo.jpg" 
            alt="Thenam Campus Logo" 
            className="inline-block w-16 h-16 rounded-3xl object-cover shadow-xl shadow-indigo-500/20 mb-2 transform hover:scale-105 transition-transform duration-300"
          />
          
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
              Thenam <span className="text-indigo-600 font-black">Campus</span>
            </h1>
            <p className="text-xs font-bold text-indigo-600/90 uppercase tracking-widest">
              Educator Portal
            </p>
          </div>
        </div>

        {/* Action card */}
        <div className="bg-white py-8 px-6 sm:px-10 border border-slate-200 shadow-xl rounded-3xl space-y-6">
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 leading-normal">{error}</p>
            </div>
          )}

          <form onSubmit={handleMockLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-hidden"
                placeholder="Enter educator username"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-hidden"
                  placeholder="Enter educator password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-transparent rounded-2xl shadow-xs text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all select-none cursor-pointer active:scale-98 mt-2"
            >
              Sign In as Educator
            </button>
          </form>

          <div className="relative flex justify-center text-xs border-t border-slate-100 pt-4">
            <span className="bg-white px-3 text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
              Authorized Educator Access
            </span>
          </div>
        </div>

        {/* Footer notes */}
        <div className="text-center text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
          © {new Date().getFullYear()} THENAM Academic Board
        </div>
      </div>
    </div>
  );
}
