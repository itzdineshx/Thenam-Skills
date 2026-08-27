import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Image as ImageIcon, Briefcase, Award, Loader2, Plus, Trash2, Video, Link as LinkIcon, Search, ChevronDown, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Module, EventItem } from '../types';
import { getYouTubeEmbedData } from '../utils/youtube';
import { storageService } from '../firebase/storage';
import { api } from '../services/api';
import { useEffect } from 'react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventItem;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, eventToEdit }) => {
  const { currentUser, createEvent, updateEvent, showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');

  // Presenter/Speaker selection
  const [availableEducators, setAvailableEducators] = useState<any[]>([]);
  const [isLoadingEducators, setIsLoadingEducators] = useState(false);
  const [speakerSearchQuery, setSpeakerSearchQuery] = useState('');
  const [isSpeakerDropdownOpen, setIsSpeakerDropdownOpen] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<{
    name: string;
    role: string;
    company: string;
    avatar: string;
  } | null>(null);

  // Fetch educators for presenter selection
  useEffect(() => {
    if (!isOpen) return;
    const fetchEducators = async () => {
      setIsLoadingEducators(true);
      try {
        const res = await api.get('/admin/users');
        const data = res.data?.data || res.data || [];
        setAvailableEducators(data.filter((u: any) => u.profileCompleted));
      } catch (err) {
        console.error('Failed to fetch educators:', err);
        // Fallback: just use current user
        setAvailableEducators([]);
      } finally {
        setIsLoadingEducators(false);
      }
    };
    fetchEducators();
  }, [isOpen]);

  // Set default speaker to current user
  useEffect(() => {
    if (isOpen && !selectedSpeaker && currentUser) {
      setSelectedSpeaker({
        name: currentUser.name,
        role: currentUser.headline || '',
        company: currentUser.college || '',
        avatar: currentUser.avatar || ''
      });
    }
    if (isOpen && eventToEdit) {
      setSelectedSpeaker({
        name: eventToEdit.speaker.name,
        role: eventToEdit.speaker.role,
        company: eventToEdit.speaker.company,
        avatar: eventToEdit.speaker.avatar
      });
    }
  }, [isOpen, eventToEdit, currentUser]);

  const filteredEducators = availableEducators.filter(u =>
    u.name?.toLowerCase().includes(speakerSearchQuery.toLowerCase()) ||
    u.headline?.toLowerCase().includes(speakerSearchQuery.toLowerCase()) ||
    u.college?.toLowerCase().includes(speakerSearchQuery.toLowerCase())
  );

  const [formData, setFormData] = useState({
    title: '',
    type: 'workshop' as 'workshop' | 'webinar' | 'hackathon' | 'masterclass',
    mode: 'live_scheduled' as 'online_modular' | 'live_scheduled' | 'offline',
    domain: '',
    date: '',
    time: '',
    duration: '',
    description: '',
    maxCapacity: 100,
    coverImage: '',
    meetingLink: '',
    certificateOffered: true,
    modules: [] as Partial<Module>[]
  });

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title || '',
        type: eventToEdit.type || 'workshop',
        mode: (eventToEdit.mode as any) || 'live_scheduled',
        domain: eventToEdit.domain || '',
        date: eventToEdit.date || '',
        time: eventToEdit.time || '',
        duration: eventToEdit.duration || '',
        description: evDescriptionClean(eventToEdit.description) || '',
        maxCapacity: eventToEdit.maxCapacity || 100,
        coverImage: eventToEdit.coverImage || '',
        meetingLink: eventToEdit.meetingLink || '',
        certificateOffered: eventToEdit.certificateOffered !== false,
        modules: eventToEdit.modules || []
      });
      setCoverImagePreview(eventToEdit.coverImage || '');
    } else {
      setFormData({
        title: '',
        type: 'workshop',
        mode: 'live_scheduled',
        domain: '',
        date: '',
        time: '',
        duration: '',
        description: '',
        maxCapacity: 100,
        coverImage: '',
        meetingLink: '',
        certificateOffered: true,
        modules: []
      });
      setCoverImagePreview('');
      setCoverImageFile(null);
    }
  }, [eventToEdit, isOpen]);

  function evDescriptionClean(desc: string) {
    if (!desc) return '';
    return desc.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/`/g, '');
  }

  if (!isOpen) return null;

  const handleAddModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { title: '', youtubeUrl: '', duration: '', unlockCondition: 'immediate' }]
    });
  };

  const handleRemoveModule = (index: number) => {
    const newModules = [...formData.modules];
    newModules.splice(index, 1);
    setFormData({ ...formData, modules: newModules });
  };

  const handleUpdateModule = (index: number, field: keyof Module, value: string) => {
    const newModules = [...formData.modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setFormData({ ...formData, modules: newModules });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.mode === 'online_modular') {
      if (formData.modules.length === 0) {
        showToast('Please add at least one module for an online modular event.');
        return;
      }
      for (let i = 0; i < formData.modules.length; i++) {
        const mod = formData.modules[i];
        if (!mod.title || !mod.youtubeUrl) {
          showToast(`Module ${i + 1} is missing a title or YouTube URL.`);
          return;
        }
        if (!getYouTubeEmbedData(mod.youtubeUrl)) {
          showToast(`Module ${i + 1} has an invalid YouTube URL.`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      const finalModules = formData.mode === 'online_modular' 
        ? formData.modules.map((m, i) => {
            const yt = getYouTubeEmbedData(m.youtubeUrl!)!;
            return {
              id: `mod_${Date.now()}_${i}`,
              title: m.title!,
              youtubeUrl: m.youtubeUrl!,
              youtubeVideoId: yt.videoId,
              embedUrl: yt.embedUrl,
              thumbnailUrl: yt.thumbnailUrl,
              duration: m.duration || '',
              unlockCondition: m.unlockCondition || 'immediate'
            } as Module;
          })
        : undefined;

      let finalCoverImage = formData.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80';
      
      if (coverImageFile) {
        // We don't have the event ID yet, so use a timestamp-based ID
        const tempId = `temp_${Date.now()}`;
        finalCoverImage = await storageService.uploadEventCover(tempId, coverImageFile);
      }

      const eventPayload = {
        title: formData.title,
        type: formData.type,
        mode: formData.mode,
        domain: formData.domain,
        date: formData.date || new Date().toISOString().split('T')[0],
        time: formData.time || '10:00',
        duration: formData.duration,
        description: formData.description,
        maxCapacity: Number(formData.maxCapacity),
        coverImage: finalCoverImage,
        meetingLink: formData.mode === 'live_scheduled' ? formData.meetingLink : undefined,
        scheduledAt: formData.mode === 'live_scheduled' ? `${formData.date}T${formData.time}` : undefined,
        certificateOffered: formData.certificateOffered,
        certificateEnabled: formData.certificateOffered,
        modules: finalModules,
      };

      if (eventToEdit) {
        await updateEvent(eventToEdit.id, {
          ...eventPayload,
          speaker: selectedSpeaker || {
            name: currentUser.name,
            role: currentUser.headline,
            company: currentUser.college,
            avatar: currentUser.avatar
          }
        });
      } else {
        await createEvent({
          ...eventPayload,
          speaker: selectedSpeaker || {
            name: currentUser.name,
            role: currentUser.headline,
            company: currentUser.college,
            avatar: currentUser.avatar
          },
          agenda: []
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New Event</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Host a session for the THENAM community.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-event-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Event Mode Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Event Mode *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: 'live_scheduled' })}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all ${
                    formData.mode === 'live_scheduled' 
                      ? 'border-indigo-600 bg-indigo-50/50' 
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className={`w-5 h-5 ${formData.mode === 'live_scheduled' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-sm text-slate-900">Live Scheduled</span>
                  </div>
                  <p className="text-xs text-slate-500 text-left">Host a live session at a specific date and time.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: 'online_modular' })}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all ${
                    formData.mode === 'online_modular' 
                      ? 'border-indigo-600 bg-indigo-50/50' 
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Video className={`w-5 h-5 ${formData.mode === 'online_modular' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-sm text-slate-900">Online Modular</span>
                  </div>
                  <p className="text-xs text-slate-500 text-left">Create a self-paced learning experience with YouTube videos.</p>
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-5 border-t border-slate-100 pt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Event Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Advanced Prompt Engineering"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Event Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden appearance-none"
                  >
                    <option value="workshop">Workshop</option>
                    <option value="webinar">Webinar</option>
                    <option value="masterclass">Masterclass</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Domain Category *</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. AI & Data Science"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
                    />
                  </div>
                </div>

                {formData.mode !== 'online_modular' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Date *</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          required
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Time *</label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          required
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Duration *</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="text"
                      placeholder={formData.mode === 'online_modular' ? "e.g. 2 Hours Total" : "e.g. 2 Hours"}
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Capacity *</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Presenter / Speaker Selection */}
              <div className="border-t border-slate-100 pt-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-500" />
                  <span>Presenter / Speaker</span>
                </label>

                {/* Selected speaker preview */}
                {selectedSpeaker && (
                  <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-200/50 mb-3">
                    <img
                      src={selectedSpeaker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSpeaker.name)}&background=random&color=fff&size=80`}
                      alt={selectedSpeaker.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{selectedSpeaker.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{selectedSpeaker.role} {selectedSpeaker.company ? `- ${selectedSpeaker.company}` : ''}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSpeakerDropdownOpen(!isSpeakerDropdownOpen)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-50 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Searchable presenter dropdown */}
                {(isSpeakerDropdownOpen || !selectedSpeaker) && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search educators by name..."
                        value={speakerSearchQuery}
                        onChange={(e) => setSpeakerSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border-b border-slate-200 focus:bg-white outline-hidden"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {isLoadingEducators ? (
                        <div className="p-4 text-center flex items-center justify-center gap-2 text-slate-500 text-xs">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading educators...
                        </div>
                      ) : filteredEducators.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-xs">
                          No educators found{speakerSearchQuery ? ` for "${speakerSearchQuery}"` : ''}
                        </div>
                      ) : (
                        filteredEducators.map((edu) => (
                          <button
                            key={edu.uid || edu.id}
                            type="button"
                            onClick={() => {
                              setSelectedSpeaker({
                                name: edu.name || edu.displayName || 'Educator',
                                role: edu.headline || edu.role || 'Educator',
                                company: edu.college || edu.organization || '',
                                avatar: edu.avatar || edu.photoURL || ''
                              });
                              setIsSpeakerDropdownOpen(false);
                              setSpeakerSearchQuery('');
                            }}
                            className={`w-full flex items-center gap-3 p-3 hover:bg-indigo-50/50 transition-colors text-left border-b border-slate-100/50 last:border-b-0 ${
                              selectedSpeaker?.name === (edu.name || edu.displayName) ? 'bg-indigo-50/70' : ''
                            }`}
                          >
                            <img
                              src={edu.avatar || edu.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(edu.name || 'E')}&background=random&color=fff&size=80`}
                              alt={edu.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{edu.name || edu.displayName}</p>
                              <p className="text-[10px] text-slate-500 truncate">{edu.headline || edu.role || 'Educator'} {edu.college ? `- ${edu.college}` : ''}</p>
                            </div>
                            {selectedSpeaker?.name === (edu.name || edu.displayName) && (
                              <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md">Selected</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {formData.mode === 'live_scheduled' && (
                <div className="space-y-1.5 mt-5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>Live Meeting Link *</span>
                    <span className="text-slate-500 font-normal">(Visible only to registered students when live)</span>
                  </label>
                  <div className="relative">
                    <Video className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/xxx-yyyy-zzz"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      required={formData.mode === 'live_scheduled'}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="What will students learn?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image</label>
                <p className="text-[10px] text-slate-500 mb-2">Recommended dimension: 1280 × 720 pixels (16:9 landscape aspect ratio). Provide a URL or upload an image.</p>
                <div className="relative mb-3 flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.coverImage}
                      onChange={(e) => {
                        setFormData({ ...formData, coverImage: e.target.value });
                        if (e.target.value) setCoverImageFile(null); // Clear file if URL is provided
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
                    />
                  </div>
                  <label className="flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap">
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            showToast('Cover image must be less than 5 MB.');
                            return;
                          }
                          setCoverImageFile(file);
                          setFormData({ ...formData, coverImage: '' }); // Clear URL if file is selected
                          const reader = new FileReader();
                          reader.onloadend = () => setCoverImagePreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                
                {/* 16:9 Image Preview */}
                <div className="w-full aspect-video rounded-xl border border-slate-200 overflow-hidden bg-slate-100 relative">
                  {(formData.coverImage || coverImagePreview) ? (
                    <img 
                      src={formData.coverImage || coverImagePreview} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center text-slate-400 ${(formData.coverImage || coverImagePreview) ? 'hidden' : ''}`}>
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">1280 × 720 Preview</span>
                    
                    {/* Watermarked Grid */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Module Builder for Online Modular */}
            {formData.mode === 'online_modular' && (
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Course Modules</h3>
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Module
                  </button>
                </div>

                {formData.modules.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Video className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">No modules added yet.</p>
                    <p className="text-xs text-slate-400">Click "Add Module" to start building your self-paced course.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.modules.map((mod, idx) => {
                      const ytData = mod.youtubeUrl ? getYouTubeEmbedData(mod.youtubeUrl) : null;
                      
                      return (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md shadow-xs">Module {idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveModule(idx)}
                              className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Module Title *</label>
                                <input
                                  required
                                  type="text"
                                  placeholder="e.g. Introduction to Vector Search"
                                  value={mod.title}
                                  onChange={(e) => handleUpdateModule(idx, 'title', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 outline-hidden"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">YouTube URL *</label>
                                <div className="relative">
                                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                  <input
                                    required
                                    type="url"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={mod.youtubeUrl}
                                    onChange={(e) => handleUpdateModule(idx, 'youtubeUrl', e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 outline-hidden"
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Duration</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 15 mins"
                                    value={mod.duration}
                                    onChange={(e) => handleUpdateModule(idx, 'duration', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 outline-hidden"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Unlock Rule</label>
                                  <select
                                    value={mod.unlockCondition}
                                    onChange={(e) => handleUpdateModule(idx, 'unlockCondition', e.target.value as any)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 outline-hidden bg-white"
                                  >
                                    <option value="immediate">Immediate</option>
                                    <option value="sequential">Sequential</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            
                            {/* Live Preview Badge */}
                            <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                              {ytData ? (
                                <div className="relative w-full h-full min-h-[120px]">
                                  <img 
                                    src={ytData.thumbnailUrl} 
                                    alt="Video thumbnail" 
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                                      <div className="w-0 h-0 border-t-6 border-b-6 border-l-[10px] border-t-transparent border-b-transparent border-l-white ml-1"></div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center p-4">
                                  <Video className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                                  <p className="text-[10px] text-slate-500">Enter a valid YouTube URL for live preview</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Checkboxes */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                id="certificateOffered"
                checked={formData.certificateOffered}
                onChange={(e) => setFormData({ ...formData, certificateOffered: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="certificateOffered" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Offer Verified Certificate upon Completion
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-event-form"
            disabled={loading || !formData.title || (formData.mode !== 'online_modular' && (!formData.date || !formData.time))}
            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Create & Broadcast Event
          </button>
        </div>
      </div>
    </div>
  );
};
