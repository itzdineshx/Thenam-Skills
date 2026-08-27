import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Users,
  FolderGit2,
  Calendar,
  Briefcase,
  Award,
  Bell,
  MessageSquare,
  Search,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Zap,
  Sliders,
  LogOut,
  User,
  GraduationCap,
  Menu,
  X,
  ExternalLink,
  Layers,
  Link
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { BondBar } from './BondBar';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    unreadNotificationsCount,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    triggerCourseCompletionAutomation,
    courses
  } = useApp();
  
  const { currentPath, navigate } = useRouter();
  const { logout } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBondBarOpen, setIsBondBarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Home', path: '/home', icon: Sparkles },
   { label: 'Internship', path: '/learn', icon: BookOpen },
   // { label: 'Network', path: '/network', icon: Users },
    //{ label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Events', path: '/events', icon: Calendar },
   // { label: 'Communities', path: '/communities', icon: Layers },
   // { label: 'Talent Hub', path: '/talent', icon: Briefcase },
    //{ label: 'Achievements', path: '/achievements', icon: Award },
  ];


  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="navbar-brand-logo"
              onClick={() => navigate('/home')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <img 
                src="/logo.jpg" 
                alt="Thenam Campus Logo" 
                className="w-10 h-10 rounded-xl object-cover shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                  Thenam <span className="text-indigo-600 font-black">Campus</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  Verified Ecosystem
                </span>
              </div>
            </button>
          </div>

          {/* Global Search Bar */}
          <form
            id="navbar-search-form"
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xs xl:max-w-sm relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="navbar-search-input"
              type="text"
              placeholder="Search courses, skills, peers, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
            />
          </form>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/home' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  id={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            

            {/* Bond Network (Hidden for now) */}
            {false && (
              <button
                id="navbar-bond-btn"
                onClick={() => navigate('/bond')}
                className={`relative p-2 rounded-lg transition-colors ${
                  currentPath === '/bond' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Campus Bond"
              >
                <Link className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              </button>
            )}

            {/* Notifications Menu */}
            <div className="relative" ref={notifRef}>
              <button
                id="navbar-notifications-btn"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-lg transition-colors ${
                  isNotifOpen || currentPath === '/notifications' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                      {unreadNotificationsCount > 0 && (
                        <span className="text-[11px] font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                          {unreadNotificationsCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            setIsNotifOpen(false);
                            if (notif.link) navigate(notif.link);
                          }}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 items-start ${
                            !notif.isRead ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            notif.type === 'certificate' ? 'bg-amber-100 text-amber-700' :
                            notif.type === 'achievement' ? 'bg-emerald-100 text-emerald-700' :
                            notif.type === 'event' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {notif.type === 'certificate' ? <Award className="w-4 h-4" /> :
                             notif.type === 'achievement' ? <Sparkles className="w-4 h-4" /> :
                             notif.type === 'event' ? <Calendar className="w-4 h-4" /> :
                             <Bell className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 leading-tight">{notif.title}</p>
                            <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 font-medium block mt-1">{notif.timestamp}</span>
                          </div>
                          {!notif.isRead && (
                            <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1 shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate('/notifications');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 py-1"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                id="navbar-profile-dropdown-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-200 transition-all focus:outline-hidden"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border-2 border-indigo-600 shadow-xs bg-slate-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=random&color=fff&size=100`;
                  }}
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              </button>

              {/* Profile Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-indigo-200 bg-slate-100"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=random&color=fff&size=100`;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</h4>
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          {currentUser.role === 'faculty' && (
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Educator
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{currentUser.headline}</p>
                        <p className="text-[11px] text-indigo-600 font-semibold truncate">{currentUser.college}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <span className="block text-xs font-extrabold text-slate-900">{currentUser.metrics.coursesCompleted}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Courses</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <span className="block text-xs font-extrabold text-indigo-600">{currentUser.metrics.certificatesCount}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Certs</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <span className="block text-xs font-extrabold text-emerald-600">{currentUser.metrics.xpPoints}</span>
                        <span className="text-[10px] text-slate-500 font-medium">XP</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 py-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate(`/profile/${currentUser.id}`);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>View Student Portfolio</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/certificates');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors text-left"
                    >
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>My Verified Certificates ({currentUser.metrics.certificatesCount})</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors text-left"
                    >
                      <Sliders className="w-4 h-4 text-slate-400" />
                      <span>Automation & Settings</span>
                    </button>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 px-2 space-y-0.5">
                    {(currentUser.role === 'admin' || currentUser.role === 'faculty') && (
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-left"
                      >
                        <span className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-indigo-500" />
                          Admin & Faculty Portal
                        </span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">Console</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              id="navbar-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 animate-in slide-in-from-top duration-200">
            <form onSubmit={handleSearchSubmit} className="mb-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search THENAM Skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 bg-slate-100 rounded-xl text-xs outline-hidden"
              />
            </form>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || (item.path !== '/home' && currentPath.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate(item.path);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

          </div>
        )}
      </div>
    </header>
  );
};
