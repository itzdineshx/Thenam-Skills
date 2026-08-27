import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, MessageSquare, Megaphone, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CreateEventModal } from './CreateEventModal';
import { CreateActivityModal } from './CreateActivityModal';

export const EducatorFAB: React.FC = () => {
  const { currentUserProfile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUserProfile || (currentUserProfile.role !== 'faculty' && currentUserProfile.role !== 'admin')) {
    return null;
  }

  return (
    <>
      <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Speed Dial Menu */}
        <div 
          className={`flex flex-col gap-3 transition-all duration-300 origin-bottom ${
            isExpanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 pointer-events-none translate-y-4'
          }`}
        >
          <button
            onClick={() => {
              setIsExpanded(false);
              setIsEventModalOpen(true);
            }}
            className="flex items-center gap-3 bg-white p-3 pr-4 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
              <Calendar className="w-4 h-4 text-purple-700" />
            </div>
            <span className="text-sm font-bold text-slate-700">Host Event</span>
          </button>

          <button
            onClick={() => {
              setIsExpanded(false);
              setIsActivityModalOpen(true);
            }}
            className="flex items-center gap-3 bg-white p-3 pr-4 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
              <MessageSquare className="w-4 h-4 text-indigo-700" />
            </div>
            <span className="text-sm font-bold text-slate-700">Create Post</span>
          </button>

          {/* Additional future action could go here */}
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
            isExpanded 
              ? 'bg-slate-800 text-white shadow-slate-900/20 rotate-45' 
              : 'bg-indigo-600 text-white shadow-indigo-600/30'
          }`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <CreateEventModal 
        isOpen={isEventModalOpen} 
        onClose={() => setIsEventModalOpen(false)} 
      />
      <CreateActivityModal 
        isOpen={isActivityModalOpen} 
        onClose={() => setIsActivityModalOpen(false)} 
      />
    </>
  );
};
