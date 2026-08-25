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
    { label: 'All Activities', value: 'all' },
    { label: '🏆 Certificates', value: 'certificate_earned' as ActivityType },
    { label: '🚀 Projects', value: 'project_milestone' as ActivityType },
    { label: '✨ Skills', value: 'skill_unlocked' as ActivityType },
    { label: '🎓 Workshops', value: 'workshop_attended' as ActivityType },
    { label: '💭 Posts', value: 'student_post' as ActivityType },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner: Student Greeting & Learning Continuation */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full border border-indigo-400/30">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {currentUser.metrics.streakDays} Day Learning Streak
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {currentUser.name}! 👋
            </h1>
            
            <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
              Continue your engineering pathway. You are journey is not alone at <strong className="text-white">Thenam campus</strong>.
            </p>
          </div>

          {/* Quick Learning Progress Card */}
          {activeCourse && (
            <div className="w-full lg:w-96 bg-white/10 backdrop-blur-md rounded-2xl p-4.5 border border-white/15 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">Active Course</span>
                <span className="text-xs font-black text-amber-400">{activeCourse.progress}% Complete</span>
              </div>

              <h4 className="text-sm font-bold text-white line-clamp-1">{activeCourse.title}</h4>
              
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${activeCourse.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-indigo-200">
                  {activeCourse.completedModules}/{activeCourse.totalModules} modules finished
                </span>
                <button
                  id="btn-home-continue-learning"
                  onClick={() => navigate(`/course/${activeCourse.id}/learn`)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col (3 cols on desktop): Student Quick Card & Stats */}
        <aside className="lg:col-span-3 space-y-4">
          
          {/* Student Profile Snapshot Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs text-center space-y-3">
            <div className="relative inline-block">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-600 shadow-md mx-auto"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" title="Online & Active">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-base font-bold text-slate-900">{currentUser.name}</h3>
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xs font-semibold text-indigo-600">{currentUser.headline}</p>
              <p className="text-[11px] text-slate-500 font-medium">{currentUser.college}</p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-left">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Verified Certs</span>
                <span className="text-base font-black text-amber-600">{currentUser.metrics.certificatesCount}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Projects</span>
                <span className="text-base font-black text-indigo-600">{currentUser.metrics.projectsCount}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Network</span>
                <span className="text-base font-black text-slate-800">{currentUser.metrics.networkCount}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Skill XP</span>
                <span className="text-base font-black text-emerald-600">{currentUser.metrics.xpPoints}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/profile/${currentUser.id}`)}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors"
            >
              Open Full Portfolio
            </button>
          </div>

          {/* Quick Skills Bag */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">My Skills</h4>
              <button onClick={() => navigate('/profile/edit')} className="text-xs text-indigo-600 font-semibold hover:underline">Edit</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-semibold border border-slate-200/70 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Create Post Widget replacing Simulate Achievement */}
          <CreatePostWidget />
        </aside>

        {/* Center Col (6 cols on desktop): Learning Activity Feed */}
        <main className="lg:col-span-6 space-y-4">
          {/* Learning Activity Cards Stream */}
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-200">
                <Sparkles className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No activities found in this filter</p>
                <p className="text-xs text-slate-400 mt-1">Try switching tabs or publish a new learning milestone.</p>
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
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Upcoming Events</span>
              </h4>
              <button onClick={() => navigate('/events')} className="text-xs text-indigo-600 font-bold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((ev) => (
                <div key={ev.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md uppercase">
                    {ev.type}
                  </span>
                  <h5 className="font-bold text-slate-900 leading-snug line-clamp-2">{ev.title}</h5>
                  <p className="text-[11px] text-slate-500">{ev.date} • {ev.duration}</p>
                  
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 font-medium">{ev.registeredCount} attending</span>
                    <button
                      onClick={() => toggleEventRegistration(ev.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        ev.isRegistered
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {ev.isRegistered ? '✓ Registered' : 'Register'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Student & Mentor Network */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Peer Network</span>
              </h4>
              <button 
                onClick={fetchSuggestedPeers} 
                disabled={isRefreshingPeers}
                className="text-[10px] text-slate-500 font-bold hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                {isRefreshingPeers ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Refresh
              </button>
            </div>

            <div className="space-y-3">
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
                  <div key={person.id} className="flex items-start justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div
                      onClick={() => navigate(`/profile/${person.id}`)}
                      className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
                    >
                      <img
                        src={person.photoURL || person.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80'}
                        alt={person.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 truncate hover:text-indigo-600">{person.name}</h5>
                        <p className="text-[10px] text-slate-500 truncate">{person.headline}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBondRequest(person.id)}
                      disabled={btnDisabled}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${btnClasses}`}
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
