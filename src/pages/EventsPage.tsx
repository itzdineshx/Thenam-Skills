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
      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="relative w-full aspect-video overflow-hidden rounded-t-2xl bg-slate-900">
          <img
            src={ev.coverImage || '/placeholder-event-16-9.jpg'}
            alt={ev.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* Workshop / Category Badge (Bottom Center) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
            <span className="px-4 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-purple-600 text-white shadow-lg border border-purple-400/30">
              {ev.type || 'WORKSHOP'}
            </span>
          </div>

          {canDelete && (
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                    deleteEvent(ev.id);
                  }
                }}
                className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-md shadow-md backdrop-blur-sm transition-colors"
                title="Delete Event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-xs font-medium">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="truncate">{ev.date} • {ev.time}</span>
            </div>
            {ev.duration && (
              <span className="shrink-0 bg-white/20 px-2 py-0.5 rounded text-[10px] font-semibold backdrop-blur-sm">
                {ev.duration}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-3">
          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
            {ev.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {ev.description}
          </p>

          {/* Speaker */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <img
                src={ev.speaker.avatar}
                alt={ev.speaker.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{ev.speaker.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{ev.speaker.role} • {ev.speaker.company}</p>
              </div>
            </div>
            {currentUser.role === 'student' && ev.speaker.name !== currentUser.name && (
              <button
                onClick={() => toggleFollowEducator(ev.speaker.name)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                  currentUser.followingEducators?.includes(ev.speaker.name)
                    ? 'bg-slate-100 text-slate-600 border border-slate-200'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                {currentUser.followingEducators?.includes(ev.speaker.name) ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              <Award className="w-3 h-3 text-amber-500" />
              {ev.certificateOffered ? 'Verified Certificate' : 'Certificate Included'}
            </span>
            <span className="font-semibold text-purple-700">{ev.registeredCount} Enrolled</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-5 pt-0">
        {ev.mode === 'online_modular' ? (
          <button
            onClick={() => navigate(`/events/${ev.id}/learn`)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : isRegistered ? (
          <div className="space-y-2">
            {!isLive ? (
              <div className="flex items-center justify-center p-2 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-xs font-mono font-bold text-purple-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5"/>
                  Starts in: {days > 0 && `${days}d `}{String(hours).padStart(2, '0')}h : {String(minutes).padStart(2, '0')}m : {String(seconds).padStart(2, '0')}s
                </span>
              </div>
            ) : null}

            {isLive ? (
              <a
                href={ev.meetingLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 animate-bounce"
              >
                <Video className="w-4 h-4"/>
                Join Live Meeting Now
              </a>
            ) : (
              <button
                disabled
                className="w-full py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300 cursor-not-allowed flex items-center justify-center gap-2 select-none"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600"/>
                Registered Successfully
              </button>
            )}
          </div>
        ) : (
          <button
            id={`btn-register-event-${ev.id}`}
            onClick={() => toggleEventRegistration(ev.id)}
            disabled={Boolean(ev.maxCapacity && (ev.registeredCount || 0) >= ev.maxCapacity)}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-md disabled:opacity-50"
          >
            {ev.maxCapacity && (ev.registeredCount || 0) >= ev.maxCapacity ? 'Capacity Full' : 'Register for Free →'}
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
            <Calendar className="w-3.5 h-3.5" />
            <span>THENAM Campus & Live Workshops</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Upcoming Workshops & Webinars
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Attend live interactive engineering bootcamps with industry leaders. Verified attendance automatically adds credentials to your student timeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role === 'faculty' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Event
            </button>
          )}
          <div className="hidden sm:block bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-2xl font-black text-purple-400">3</span>
            <span className="text-[10px] text-slate-300 block font-medium">This Month</span>
          </div>
          <div className="hidden sm:block bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-2xl font-black text-emerald-400">100%</span>
            <span className="text-[10px] text-slate-300 block font-medium">Free for Students</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTypeFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTypeFilter === 'all' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTypeFilter('workshop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTypeFilter === 'workshop' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Workshops
          </button>
          <button
            onClick={() => setActiveTypeFilter('webinar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTypeFilter === 'webinar' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Webinars
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events or speakers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:border-purple-500 outline-hidden"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <CreateEventModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};
