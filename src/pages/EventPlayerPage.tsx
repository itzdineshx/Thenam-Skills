import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { Lock, PlayCircle, CheckCircle2, Award, ChevronRight, ChevronLeft } from 'lucide-react';
import { Module } from '../types';
import confetti from 'canvas-confetti';

export const EventPlayerPage: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const { events, triggerCourseCompletionAutomation, showToast } = useApp();
  
  // Extract event ID from path: /events/:id/learn
  const eventId = currentPath.split('/')[2];
  const event = events.find(e => e.id === eventId);

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [isCertificateUnlocked, setIsCertificateUnlocked] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (event?.modules && event.modules.length > 0 && !activeModuleId) {
      setActiveModuleId(event.modules[0].id);
    }
  }, [event, activeModuleId]);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
        <button onClick={() => navigate('/events')} className="mt-4 text-indigo-600 font-bold hover:underline">
          Return to Events
        </button>
      </div>
    );
  }

  const modules = event.modules || [];
  const activeIndex = modules.findIndex(m => m.id === activeModuleId);
  const activeModule = modules[activeIndex];

  const handleMarkCompleted = () => {
    if (!activeModule) return;

    if (!completedModuleIds.includes(activeModule.id)) {
      const newCompleted = [...completedModuleIds, activeModule.id];
      setCompletedModuleIds(newCompleted);

      // Check for course completion
      if (newCompleted.length === modules.length) {
        setIsCertificateUnlocked(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        showToast('Congratulations! You have completed all modules.');
      } else {
        // Auto advance to next module
        if (activeIndex < modules.length - 1) {
          setActiveModuleId(modules[activeIndex + 1].id);
        }
      }
    } else {
      // Already completed, just advance
      if (activeIndex < modules.length - 1) {
        setActiveModuleId(modules[activeIndex + 1].id);
      }
    }
  };

  const handleModuleClick = (mod: Module, index: number) => {
    // Check if locked
    if (mod.unlockCondition === 'sequential' && index > 0) {
      const prevMod = modules[index - 1];
      if (!completedModuleIds.includes(prevMod.id)) {
        showToast('Please complete the previous module first.');
        return;
      }
    }
    setActiveModuleId(mod.id);
  };

  const handleClaimCertificate = async () => {
    setIsClaiming(true);
    await triggerCourseCompletionAutomation(event.id);
    setIsClaiming(false);
  };

  const isAllCompleted = completedModuleIds.length === modules.length && modules.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col md:flex-row gap-6">
      
      {/* Sidebar - Module Playlist */}
      <aside className="w-full md:w-80 shrink-0 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[calc(100vh-120px)] sticky top-24">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <button onClick={() => navigate('/events')} className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 mb-3 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Events
          </button>
          <h2 className="text-sm font-black text-slate-900 leading-snug">{event.title}</h2>
          <div className="mt-3 bg-slate-200 rounded-full h-2 w-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-500"
              style={{ width: `${modules.length ? (completedModuleIds.length / modules.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5 text-right">
            {completedModuleIds.length} / {modules.length} Completed
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {modules.map((mod, idx) => {
            const isCompleted = completedModuleIds.includes(mod.id);
            const isLocked = mod.unlockCondition === 'sequential' && idx > 0 && !completedModuleIds.includes(modules[idx - 1].id);
            const isActive = activeModuleId === mod.id;

            return (
              <button
                key={mod.id}
                onClick={() => handleModuleClick(mod, idx)}
                disabled={isLocked}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                  isActive ? 'bg-indigo-50 border-indigo-200 border shadow-xs' : 'hover:bg-slate-50 border border-transparent'
                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-slate-400" />
                  ) : (
                    <PlayCircle className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  )}
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {idx + 1}. {mod.title}
                  </h4>
                  {mod.duration && <p className="text-[10px] text-slate-500 mt-1">{mod.duration}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content - Player & Completion Card */}
      <main className="flex-1 space-y-6">
        {isAllCompleted ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-12 h-12 text-emerald-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Module Completed!</h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                You have successfully finished all modules for <strong>{event.title}</strong>. Your verified credential is ready.
              </p>
            </div>

            {event.certificateEnabled && (
              <button
                onClick={handleClaimCertificate}
                disabled={isClaiming || isCertificateUnlocked}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isClaiming ? 'Generating...' : 'Download Verified E-Certificate'}
              </button>
            )}
          </div>
        ) : activeModule ? (
          <div className="space-y-4">
            {/* Video Player Canvas */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
              <iframe
                src={activeModule.embedUrl}
                title={activeModule.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Video Controls & Info */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">{activeModule.title}</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Part {activeIndex + 1} of {modules.length}</p>
              </div>
              
              <button
                onClick={handleMarkCompleted}
                className="shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {completedModuleIds.includes(activeModule.id) ? (
                  <>
                    <span>Next Module</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Completed & Next</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};
