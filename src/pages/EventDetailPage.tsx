import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Award, 
  ChevronLeft, 
  Video, 
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { useEventCountdown } from '../hooks/useEventCountdown';
import { CreateEventModal } from '../components/CreateEventModal';

const cleanMarkdown = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/`/g, '')
    .replace(/#/g, '');
};

export const EventDetailPage: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const { events, currentUser, toggleEventRegistration, toggleFollowEducator } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Extract event ID from path: /events/:id
  const eventId = currentPath.split('/')[2];
  const ev = events.find(e => e.id === eventId);

  const scheduledAt = ev?.scheduledAt || (ev?.date && ev?.time ? `${ev.date}T${ev.time}:00` : '');
  const { days, hours, minutes, seconds, isLive } = useEventCountdown(scheduledAt);

  if (!ev) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Event Not Found</h2>
        <p className="text-slate-500 text-xs">The event you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/events')}
          className="px-5 py-2 bg-indigo-650 text-white text-xs font-bold rounded-xl shadow-xs"
        >
          Return to Events
        </button>
      </div>
    );
  }

  const isRegistered = Boolean(currentUser && ev.registeredUserIds?.includes(currentUser.id));
  const isAuthor = currentUser.id === ev.creatorId;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Back link & Customize header controls */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/events')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Events
        </button>

        {(currentUser.role === 'faculty' || currentUser.role === 'admin') && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl border border-indigo-200/50 shadow-xs cursor-pointer transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Event</span>
          </button>
        )}
      </div>

      {/* Main Cover Banner Card */}
      <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 relative shadow-2xl">
        <div className="relative h-64 sm:h-80 w-full bg-slate-950">
          <img 
            src={ev.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'} 
            alt={ev.title} 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
        </div>

        {/* Floating Details Overlay */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-600 text-white shadow-lg border border-purple-400/20">
              {ev.type}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight max-w-2xl">
              {cleanMarkdown(ev.title)}
            </h1>
          </div>

          {ev.duration && (
            <span className="bg-white/10 px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wide text-white border border-white/5 backdrop-blur-xs">
              {ev.duration}
            </span>
          )}
        </div>
      </div>

      {/* Two Column details layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - Event Description & Info */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Detailed Info Grid */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-650 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-450 uppercase block tracking-wider">Date</span>
                <span className="text-xs font-bold text-slate-800">{ev.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-650 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-450 uppercase block tracking-wider">Time</span>
                <span className="text-xs font-bold text-slate-800">{ev.time}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-650 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-450 uppercase block tracking-wider">Format</span>
                <span className="text-xs font-bold text-slate-800 capitalize">{ev.mode === 'online_modular' ? 'Modular Course' : 'Live Session'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-650 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-450 uppercase block tracking-wider">Enrollment</span>
                <span className="text-xs font-bold text-slate-800">{ev.registeredCount} Enrolled</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">About this {ev.type}</h3>
            <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line font-medium">
              {cleanMarkdown(ev.description)}
            </p>

            {ev.certificateOffered && (
              <div className="mt-6 p-4.5 rounded-2xl bg-amber-500/5 border border-amber-250/50 flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">Verified Credential Included</h4>
                  <p className="text-[11px] text-amber-700 mt-1 leading-normal font-medium font-outfit">
                    Successfully complete this bootcamp to receive a digitally signed, tamper-proof academic credential certified by THENAM.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Booking & Speaker */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Action Trigger Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Event Actions</h3>
            
            {ev.mode === 'online_modular' ? (
              <button
                onClick={() => navigate(`/events/${ev.id}/learn`)}
                className="w-full py-3 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-755 text-white shadow-md shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Start Course modules</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : isRegistered ? (
              <div className="space-y-3">
                {!isLive ? (
                  <div className="flex items-center justify-center p-2.5 rounded-xl bg-purple-50/50 border border-purple-200/60 text-center">
                    <span className="text-[10px] font-mono font-black text-purple-700 flex items-center gap-1.5 justify-center">
                      <Clock className="w-3.5 h-3.5 text-purple-500 animate-pulse"/>
                      STARTS IN: {days > 0 && `${days}d `}{String(hours).padStart(2, '0')}h : {String(minutes).padStart(2, '0')}m : {String(seconds).padStart(2, '0')}s
                    </span>
                  </div>
                ) : null}

                {isLive ? (
                  <a
                    href={ev.meetingLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <Video className="w-4 h-4"/>
                    Join Live Meeting Now
                  </a>
                ) : (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-250 cursor-not-allowed flex items-center justify-center gap-2 select-none uppercase tracking-wider"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100"/>
                      Registered
                    </button>
                    <button
                      onClick={() => toggleEventRegistration(ev.id)}
                      className="w-full py-2.5 text-[10px] font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-colors uppercase tracking-wider"
                    >
                      Cancel Registration
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-register-detail-event"
                onClick={() => toggleEventRegistration(ev.id)}
                disabled={Boolean(ev.maxCapacity && (ev.registeredCount || 0) >= ev.maxCapacity)}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-purple-600 to-indigo-655 hover:from-purple-700 hover:to-indigo-700 text-white transition-all shadow-md shadow-purple-500/10 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {ev.maxCapacity && (ev.registeredCount || 0) >= ev.maxCapacity ? 'Capacity Full' : 'Register for Free'}
              </button>
            )}
          </div>

          {/* Speaker Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs text-center space-y-3.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider text-left pb-2 border-b border-slate-100">Presenter</h3>
            
            <div className="space-y-2">
              <img
                src={ev.speaker.name?.toLowerCase().includes('jayamurugan') 
                  ? 'https://cdn.phototourl.com/free/2026-08-26-5659434f-46e0-4faa-8391-72dfeefaa208.jpg'
                  : (isAuthor || currentUser.name === ev.speaker.name ? currentUser.avatar : ev.speaker.avatar)}
                alt={ev.speaker.name}
                className="w-16 h-16 rounded-full object-cover border border-slate-200 mx-auto shadow-xs"
              />
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">{ev.speaker.name}</h4>
                <p className="text-[10px] text-indigo-655 font-bold uppercase tracking-wide mt-0.5">{ev.speaker.role}</p>
                <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-widest">{ev.speaker.company}</p>
              </div>
            </div>

            {currentUser.role === 'student' && ev.speaker.name !== currentUser.name && (
              <button
                onClick={() => toggleFollowEducator(ev.speaker.name)}
                className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 ${
                  currentUser.followingEducators?.includes(ev.speaker.name)
                    ? 'bg-slate-100 text-slate-600 border border-slate-200'
                    : 'bg-indigo-50 text-indigo-650 border border-indigo-200/50 hover:bg-indigo-100/70'
                }`}
              >
                {currentUser.followingEducators?.includes(ev.speaker.name) ? 'Follow Presenter' : 'Follow Presenter'}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Customize/Edit Event Modal */}
      <CreateEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        eventToEdit={ev}
      />
    </div>
  );
};
