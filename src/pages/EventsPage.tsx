import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Radio,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Share2,
  ArrowRight,
  Search,
  Filter,
  Plus,
  Video,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../context/RouterContext';
import { CreateEventModal } from '../components/CreateEventModal';
import { useEventCountdown } from '../hooks/useEventCountdown';
import { EventItem } from '../types';

const EventCard: React.FC<{
  ev: EventItem;
  currentUser: any;
  toggleEventRegistration: (id: string) => void;
  toggleFollowEducator: (name: string) => void;
  deleteEvent: (id: string) => void;
  navigate: (path: string) => void;
}> = ({ ev, currentUser, toggleEventRegistration, toggleFollowEducator, deleteEvent, navigate }) => {
  const isWorkshop = ev.type === 'workshop';
  const scheduledAt = ev.scheduledAt || (ev.date && ev.time ? `${ev.date}T${ev.time}:00` : '');
  const { days, hours, minutes, seconds, isLive } = useEventCountdown(scheduledAt);
  const isRegistered = Boolean(currentUser && ev.registeredUserIds?.includes(currentUser.id));
  const isAuthor = currentUser.id === ev.creatorId;
  const isEducatorOrAdmin = currentUser.role === 'faculty' || currentUser.role === 'admin';
  const canDelete = isAuthor || isEducatorOrAdmin;

  return (
    <div
      id={`event-card-${ev.id}`}
      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        <div 
          onClick={() => navigate(`/events/${ev.id}`)}
          className="relative w-full aspect-[16/10] sm:aspect-video overflow-hidden rounded-t-xl sm:rounded-t-2xl bg-slate-950 cursor-pointer"
        >
          <img
            src={ev.coverImage || '/placeholder-event-16-9.jpg'}
            alt={ev.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          {/* Workshop / Category Badge */}
          <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-10">
            <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-purple-600 text-white shadow-lg border border-purple-400/20">
              {ev.type || 'WORKSHOP'}
            </span>
          </div>

          {canDelete && (
            <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                    deleteEvent(ev.id);
                  }
                }}
                className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg shadow-md backdrop-blur-xs transition-colors cursor-pointer"
                title="Delete Event"
              >
                <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent text-white text-[10px] sm:text-[11px] font-bold">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-300 shrink-0 animate-pulse" />
              <span className="truncate">{ev.date} {ev.time ? `\u2022 ${ev.time}` : ''}</span>
            </div>
            {ev.duration && (
              <span className="shrink-0 bg-white/10 px-2 sm:px-2.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wide backdrop-blur-xs border border-white/5 hidden sm:inline">
                {ev.duration}
              </span>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          <h3 
            onClick={() => navigate(`/events/${ev.id}`)}
            className="text-[13px] sm:text-sm font-black text-slate-900 leading-snug line-clamp-2 tracking-tight group-hover:text-purple-700 hover:underline cursor-pointer"
          >
            {ev.title}
          </h3>

          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
            {ev.description.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/`/g, '')}
          </p>

          {/* Speaker */}
          <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-slate-100/80">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <img
                src={ev.speaker.name?.toLowerCase().includes('jayamurugan') 
                  ? 'https://cdn.phototourl.com/free/2026-08-26-5659434f-46e0-4faa-8391-72dfeefaa208.jpg'
                  : (isAuthor || currentUser.name === ev.speaker.name ? currentUser.avatar : ev.speaker.avatar)}
                alt={ev.speaker.name}
                className="w-7 sm:w-8.5 h-7 sm:h-8.5 rounded-full object-cover border border-slate-200 shadow-xs"
              />
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-extrabold text-slate-900 truncate">{ev.speaker.name}</p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{ev.speaker.role} {ev.speaker.company ? `\u2022 ${ev.speaker.company}` : ''}</p>
              </div>
            </div>
            {currentUser.role === 'student' && ev.speaker.name !== currentUser.name && (
              <button
                onClick={() => toggleFollowEducator(ev.speaker.name)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                  currentUser.followingEducators?.includes(ev.speaker.name)
                    ? 'bg-slate-100 text-slate-600 border border-slate-200'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-200/50 hover:bg-indigo-100/70'
                }`}
              >
                {currentUser.followingEducators?.includes(ev.speaker.name) ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5 sm:pt-1">
            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <Award className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-500" />
              {ev.certificateOffered ? 'Verified Cert' : 'Certificate'}
            </span>
            <span className="font-extrabold text-purple-700 bg-purple-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-purple-100/50 text-[9px] sm:text-[10px] tracking-wide uppercase">{ev.registeredCount} Enrolled</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 sm:p-5 pt-0">
        {ev.mode === 'online_modular' ? (
          <button
            onClick={() => navigate(`/events/${ev.id}/learn`)}
            className="w-full py-2 sm:py-2.5 px-4 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : isRegistered ? (
          <div className="space-y-2">
            {!isLive ? (
              <div className="flex items-center justify-center p-1.5 sm:p-2 rounded-xl bg-purple-50/50 border border-purple-200/60 shadow-xs">
                <span className="text-[9px] sm:text-[10px] font-mono font-black text-purple-700 flex items-center gap-1.5">
                  <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-purple-500 animate-pulse"/>
                  STARTS IN: {days > 0 && `${days}d `}{String(hours).padStart(2, '0')}h : {String(minutes).padStart(2, '0')}m : {String(seconds).padStart(2, '0')}s
                </span>
              </div>
            ) : null}

            {isLive ? (
              <a
                href={ev.meetingLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 sm:py-2.5 px-4 rounded-xl font-black text-[11px] sm:text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <Video className="w-4 h-4"/>
                Join Live Meeting Now
              </a>
            ) : (
              <button
                disabled
                className="w-full py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 cursor-not-allowed flex items-center justify-center gap-2 select-none uppercase tracking-wider"
              >
                <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-600 fill-emerald-100"/>
                Registered
              </button>
            )}
          </div>
        ) : (
          <button
            id={`btn-register-event-${ev.id}`}
            onClick={() => toggleEventRegistration(ev.id)}
            disabled={Boolean(ev.maxCapacity && (ev.registeredCount || 0) >= ev.maxCapacity)}
            className="w-full py-2 sm:py-2.5 px-4 rounded-xl font-extrabold text-[11px] sm:text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all shadow-md shadow-purple-500/10 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {ev.maxCapacity && (ev.registeredCount || 0) >= ev.maxCapacity ? 'Capacity Full' : 'Register for Free'}
          </button>
        )}
      </div>
    </div>
  );
};

export const EventsPage: React.FC = () => {
  const { currentUser, events, toggleEventRegistration, toggleFollowEducator, deleteEvent, showToast } = useApp();
  const { navigate } = useRouter();

  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'workshop' | 'webinar' | 'hackathon'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredEvents = events.filter(e => {
    const matchesType = activeTypeFilter === 'all' || e.type === activeTypeFilter;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalRegistrations = events.reduce((sum, ev) => sum + (ev.registeredCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden border border-slate-800/85 shadow-xl">
        {/* Background decorative elements */}
        <div className="absolute -top-12 -right-12 w-48 sm:w-96 h-48 sm:h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -left-12 w-36 sm:w-72 h-36 sm:h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5 sm:space-y-3.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-300 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-purple-500/25">
            <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-400" />
            <span>THENAM Campus & Live Workshops</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
            Workshops & Webinars
          </h1>
          <p className="text-[11px] sm:text-xs lg:text-sm text-slate-350 leading-relaxed font-medium hidden sm:block">
            Attend live interactive engineering bootcamps with industry leaders. Verified attendance automatically adds credentials to your student timeline.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 sm:gap-3 flex-wrap">
          {currentUser.role === 'faculty' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">Add New Event</span>
              <span className="sm:hidden">New Event</span>
            </button>
          )}
          <div className="bg-white/5 backdrop-blur-md px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10 text-center shadow-lg">
            <span className="text-lg sm:text-2xl font-black text-purple-400">{events.length}</span>
            <span className="text-[8px] sm:text-[9px] text-slate-450 block font-extrabold uppercase tracking-wider mt-0.5">Events</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10 text-center shadow-lg">
            <span className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{totalRegistrations}</span>
            <span className="text-[8px] sm:text-[9px] text-slate-450 block font-extrabold uppercase tracking-wider mt-0.5">Enrolled</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col gap-3 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
        {/* Filter buttons - scrollable on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setActiveTypeFilter('all')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTypeFilter === 'all' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setActiveTypeFilter('workshop')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTypeFilter === 'workshop' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Workshops
          </button>
          <button
            onClick={() => setActiveTypeFilter('webinar')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTypeFilter === 'webinar' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Webinars
          </button>
          <button
            onClick={() => setActiveTypeFilter('hackathon')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTypeFilter === 'hackathon' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Hackathons
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events or speakers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:border-purple-500 outline-hidden"
          />
        </div>
      </div>

      {/* Events Grid - Single column on mobile, 2 on tablet, 3 on desktop */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
          <Calendar className="w-8 sm:w-10 h-8 sm:h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm sm:text-base font-bold text-slate-700">No events found</h3>
          <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? `No events matching "${searchQuery}". Try a different search.` : 'No events are scheduled yet. Check back later!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredEvents.map((ev) => (
            <EventCard
              key={ev.id}
              ev={ev}
              currentUser={currentUser}
              toggleEventRegistration={toggleEventRegistration}
              toggleFollowEducator={toggleFollowEducator}
              deleteEvent={deleteEvent}
              navigate={navigate}
            />
          ))}
        </div>
      )}
      <CreateEventModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};
