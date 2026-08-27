import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  PlusCircle,
  TrendingUp,
  Calendar,
  Users,
  Flame,
  CheckCircle2,
  Filter,
  ShieldCheck,
  Zap,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../context/RouterContext';
import { LearningActivityCard } from '../components/LearningActivityCard';
import { CreateActivityModal } from '../components/CreateActivityModal';
import { CreatePostWidget } from '../components/CreatePostWidget';
import { ActivityType } from '../types';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

export const HomePage: React.FC = () => {
  const {
    currentUser,
    activities,
    isFeedLoading,
    courses,
    events,
    connections,
    toggleConnectionStatus,
    toggleEventRegistration,
    triggerCourseCompletionAutomation
  } = useApp();
  
  const { navigate } = useRouter();

  const [activeFilter, setActiveFilter] = useState<'all' | ActivityType>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bonds, setBonds] = useState<any[]>([]);
  const [suggestedPeers, setSuggestedPeers] = useState<any[]>([]);
  const [isRefreshingPeers, setIsRefreshingPeers] = useState(false);

  const fetchSuggestedPeers = async () => {
    if (!currentUser) return;
    setIsRefreshingPeers(true);
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), limit(50)));
      const allUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      
      const bondedUserIds = new Set(
        bonds.map(b => b.senderId === currentUser.id ? b.receiverId : b.senderId)
      );

      let potentialPeers = allUsers.filter(u => u.id !== currentUser.id && !bondedUserIds.has(u.id));

      for (let i = potentialPeers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [potentialPeers[i], potentialPeers[j]] = [potentialPeers[j], potentialPeers[i]];
      }

      setSuggestedPeers(potentialPeers.slice(0, 3));
    } catch (err) {
      console.error("Failed to fetch peers:", err);
    } finally {
      setIsRefreshingPeers(false);
    }
  };

  React.useEffect(() => {
    if (currentUser && suggestedPeers.length === 0) {
      fetchSuggestedPeers();
    }
  }, [currentUser]);

  // Real-time listener for bond requests
  React.useEffect(() => {
    if (!currentUser || !currentUser.id) return;
    const qSender = query(collection(db, 'bonds'), where('senderId', '==', currentUser.id));
    const qReceiver = query(collection(db, 'bonds'), where('receiverId', '==', currentUser.id));

    const handleSnapshot = (snap: any) => {
      setBonds(prev => {
        const newBonds = [...prev];
        snap.docChanges().forEach((change: any) => {
          const data = { id: change.doc.id, ...change.doc.data() };
          if (change.type === 'added' || change.type === 'modified') {
            const idx = newBonds.findIndex(b => b.id === data.id);
            if (idx > -1) newBonds[idx] = data;
            else newBonds.push(data);
          }
          if (change.type === 'removed') {
            const idx = newBonds.findIndex(b => b.id === data.id);
            if (idx > -1) newBonds.splice(idx, 1);
          }
        });
        return newBonds;
      });
    };

    const unsubSender = onSnapshot(qSender, handleSnapshot);
    const unsubReceiver = onSnapshot(qReceiver, handleSnapshot);

    return () => {
      unsubSender();
      unsubReceiver();
    };
  }, [currentUser]);

  const handleBondRequest = async (peerId: string) => {
    try {
      await addDoc(collection(db, 'bonds'), {
        senderId: currentUser.id,
        receiverId: peerId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to send bond request", error);
    }
  };

  // Active in-progress course
  const activeCourse = courses.find(c => c.progress > 0 && c.progress < 100) || courses[0];

  // Filter activities
  const filteredActivities = activeFilter === 'all'
    ? activities
    : activities.filter(a => a.type === activeFilter);

  const upcomingEvents = events.slice(0, 3);
  const suggestedPeople = connections.filter(c => c.status !== 'connected').slice(0, 3);

  const filterTabs = [
    { label: 'All', value: 'all' },
    { label: '\u{1F3C6} Certificates', value: 'certificate_earned' as ActivityType },
    { label: '\u{1F680} Projects', value: 'project_milestone' as ActivityType },
    { label: '\u2728 Skills', value: 'skill_unlocked' as ActivityType },
    { label: '\u{1F393} Workshops', value: 'workshop_attended' as ActivityType },
    { label: '\u{1F4AD} Posts', value: 'student_post' as ActivityType },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* Top Banner: Student Greeting & Learning Continuation */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800/80">
        {/* Background decorative elements */}
        <div className="absolute -top-12 -right-12 w-48 sm:w-96 h-48 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -left-12 w-36 sm:w-72 h-36 sm:h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-2.5 max-w-xl w-full">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-300 px-2.5 sm:px-3.5 py-1 rounded-full border border-indigo-500/20">
                <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-500 fill-amber-500" />
                {currentUser.metrics.streakDays} Day Streak
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Welcome back, {currentUser.name.split(' ')[0]}! 👋
            </h1>
            
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-300 leading-relaxed font-medium hidden sm:block">
              Continue your verified engineering pathway. Your journey to industry-grade skills starts right here at <strong className="text-white font-bold">THENAM CAMPUS</strong>.
            </p>
          </div>

          {/* Quick Learning Progress Card */}
          {activeCourse && (
            <div className="w-full lg:w-96 bg-slate-900/60 backdrop-blur-md rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-white/10 space-y-2.5 sm:space-y-3.5 shrink-0 shadow-lg hover:border-white/15 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">Active Learning Route</span>
                <span className="text-[9px] sm:text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">{activeCourse.progress}%</span>
              </div>

              <h4 className="text-[11px] sm:text-xs font-bold text-white line-clamp-1">{activeCourse.title}</h4>
              
              <div className="w-full h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeCourse.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">
                  {activeCourse.completedModules}/{activeCourse.totalModules} modules
                </span>
                <button
                  id="btn-home-continue-learning"
                  onClick={() => navigate(`/course/${activeCourse.id}/learn`)}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] sm:text-xs font-bold rounded-lg transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile-Only: Horizontal Stats Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:hidden no-scrollbar -mx-1 px-1">
        <div className="flex-shrink-0 bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 flex items-center gap-2 shadow-xs">
          <Award className="w-4 h-4 text-amber-500" />
          <div>
            <span className="text-xs font-black text-slate-900 block leading-none">{currentUser.metrics.certificatesCount}</span>
            <span className="text-[8px] text-slate-400 font-bold uppercase">Certs</span>
          </div>
        </div>
        <div className="flex-shrink-0 bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 flex items-center gap-2 shadow-xs">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <div>
            <span className="text-xs font-black text-slate-900 block leading-none">{currentUser.metrics.projectsCount}</span>
            <span className="text-[8px] text-slate-400 font-bold uppercase">Projects</span>
          </div>
        </div>
        <div className="flex-shrink-0 bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 flex items-center gap-2 shadow-xs">
          <Users className="w-4 h-4 text-purple-500" />
          <div>
            <span className="text-xs font-black text-slate-900 block leading-none">{currentUser.metrics.networkCount}</span>
            <span className="text-[8px] text-slate-400 font-bold uppercase">Network</span>
          </div>
        </div>
        <div className="flex-shrink-0 bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 flex items-center gap-2 shadow-xs">
          <Zap className="w-4 h-4 text-emerald-500" />
          <div>
            <span className="text-xs font-black text-slate-900 block leading-none">{currentUser.metrics.xpPoints}</span>
            <span className="text-[8px] text-slate-400 font-bold uppercase">XP</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Feed-first on mobile, 3-col on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* Left Col (3 cols on desktop): Student Quick Card & Stats - HIDDEN on mobile, shown on lg */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">
          
          {/* Student Profile Snapshot Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] text-center space-y-4 hover:shadow-[0_6px_25px_-5px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="relative inline-block">
              <div className="p-1 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 shadow-md">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover bg-white mx-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=random&color=fff&size=120`;
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5.5 h-5.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-xs" title="Online & Active">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-base font-black text-slate-900 tracking-tight">{currentUser.name}</h3>
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-600 fill-indigo-50" />
              </div>
              <p className="text-xs font-bold text-indigo-600 tracking-wide">{currentUser.headline}</p>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{currentUser.college}</p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-left">
              <div className="bg-slate-50/70 hover:bg-amber-50/40 p-2.5 rounded-2xl border border-slate-100/50 hover:border-amber-200/40 transition-all duration-200 group">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Certs Earned</span>
                <span className="text-base font-black text-slate-800 group-hover:text-amber-600 transition-colors">{currentUser.metrics.certificatesCount}</span>
              </div>
              <div className="bg-slate-50/70 hover:bg-indigo-50/40 p-2.5 rounded-2xl border border-slate-100/50 hover:border-indigo-200/40 transition-all duration-200 group">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Projects</span>
                <span className="text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{currentUser.metrics.projectsCount}</span>
              </div>
              <div className="bg-slate-50/70 hover:bg-purple-50/40 p-2.5 rounded-2xl border border-slate-100/50 hover:border-purple-200/40 transition-all duration-200 group">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Network</span>
                <span className="text-base font-black text-slate-800 group-hover:text-purple-600 transition-colors">{currentUser.metrics.networkCount}</span>
              </div>
              <div className="bg-slate-50/70 hover:bg-emerald-50/40 p-2.5 rounded-2xl border border-slate-100/50 hover:border-emerald-200/40 transition-all duration-200 group">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">XP Points</span>
                <span className="text-base font-black text-slate-800 group-hover:text-emerald-600 transition-colors">{currentUser.metrics.xpPoints}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/profile/${currentUser.id}`)}
              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold rounded-xl transition-all duration-200 hover:scale-[1.01] cursor-pointer"
            >
              Open Full Portfolio
            </button>
          </div>

          {/* Quick Skills Bag */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">My Skills</h4>
              <button onClick={() => navigate('/profile/edit')} className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">Edit</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.skills && currentUser.skills.length > 0 ? (
                currentUser.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-semibold border border-slate-200/70 transition-colors"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400">No skills added yet</p>
              )}
            </div>
          </div>
        </aside>

        {/* Center Col (6 cols on desktop): Learning Activity Feed & Composer */}
        <main className="lg:col-span-6 space-y-4 sm:space-y-5 min-w-0 order-first lg:order-none">
          
          {/* Post Composer Widget at the Top of Center Feed */}
          <CreatePostWidget />

          {/* Activity Category Filters - Horizontally scrollable on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar -mx-1 px-1">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1 sm:gap-1.5 hover:scale-[1.02] active:scale-[0.98] shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Learning Activity Cards Stream */}
          <div className="space-y-3 sm:space-y-4">
            {isFeedLoading ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center border border-slate-200 shadow-sm">
                <Loader2 className="w-7 sm:w-8 h-7 sm:h-8 text-indigo-500 animate-spin mb-3 sm:mb-4" />
                <p className="text-xs sm:text-sm font-bold text-slate-700">Loading your feed...</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center text-slate-500 border border-slate-200">
                <Sparkles className="w-7 sm:w-8 h-7 sm:h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs sm:text-sm font-bold text-slate-700">No activities found in this filter</p>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Try switching tabs or publish a new learning milestone.</p>
              </div>
            ) : (
              filteredActivities.map((act) => (
                <LearningActivityCard key={act.id} activity={act} />
              ))
            )}
          </div>
        </main>

        {/* Right Col (3 cols on desktop): Suggested Network & Upcoming Workshops */}
        <aside className="lg:col-span-3 space-y-4">
          
          {/* Upcoming Workshops & Webinars */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Upcoming Events</span>
              </h4>
              <button onClick={() => navigate('/events')} className="text-[11px] sm:text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
                View All
              </button>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No upcoming events</p>
              ) : upcomingEvents.map((ev) => (
                <div 
                  key={ev.id} 
                  className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-150 space-y-1.5 sm:space-y-2 text-xs cursor-pointer hover:bg-slate-100/60 transition-colors"
                  onClick={() => navigate(`/events/${ev.id}`)}
                >
                  <span className="text-[9px] sm:text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md uppercase">
                    {ev.type}
                  </span>
                  <h5 className="font-bold text-slate-900 leading-snug line-clamp-2 text-[11px] sm:text-xs">{ev.title}</h5>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">{ev.date} {ev.duration ? `\u2022 ${ev.duration}` : ''}</p>
                  
                  <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">{ev.registeredCount} attending</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleEventRegistration(ev.id); }}
                      className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer ${
                        ev.isRegistered
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {ev.isRegistered ? '\u2713 Registered' : 'Register'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Student & Mentor Network */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Peer Network</span>
              </h4>
              <button 
                onClick={fetchSuggestedPeers} 
                disabled={isRefreshingPeers}
                className="text-[10px] text-slate-500 font-bold hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isRefreshingPeers ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Refresh
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {suggestedPeers.map((person) => {
                const existingBond = bonds.find(b => 
                  (b.senderId === currentUser.id && b.receiverId === person.id) ||
                  (b.receiverId === currentUser.id && b.senderId === person.id)
                );

                let btnLabel = "Bond";
                let btnDisabled = false;
                let btnClasses = "bg-indigo-50 text-indigo-700 hover:bg-indigo-100";

                if (existingBond) {
                  if (existingBond.status === 'accepted') {
                    btnLabel = "Connected";
                    btnDisabled = true;
                    btnClasses = "bg-emerald-50 text-emerald-700";
                  } else if (existingBond.status === 'pending') {
                    btnLabel = "Bonding...";
                    btnDisabled = true;
                    btnClasses = "bg-slate-100 text-slate-500";
                  }
                }

                return (
                  <div key={person.id} className="flex items-start justify-between gap-2 p-1.5 sm:p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div
                      onClick={() => navigate(`/profile/${person.id}`)}
                      className="flex items-center gap-2 sm:gap-2.5 cursor-pointer min-w-0 flex-1"
                    >
                      <img
                        src={person.photoURL || person.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80'}
                        alt={person.name}
                        className="w-8 sm:w-9 h-8 sm:h-9 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'User')}&background=random&color=fff&size=100`;
                        }}
                      />
                      <div className="min-w-0">
                        <h5 className="text-[11px] sm:text-xs font-bold text-slate-900 truncate hover:text-indigo-600">{person.name}</h5>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">{person.headline}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBondRequest(person.id)}
                      disabled={btnDisabled}
                      className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${btnClasses}`}
                    >
                      {btnLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verified Certificates Quick Link */}
        </aside>
      </div>

      {/* Create Activity Modal */}
      <CreateActivityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
