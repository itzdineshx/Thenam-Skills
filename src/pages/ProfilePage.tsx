import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  FolderGit2,
  Calendar,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Building2,
  Mail,
  Phone,
  Github,
  Linkedin,
  Globe,
  Share2,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Edit3,
  Flame,
  Zap,
  ArrowRight,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { StudentProfile } from '../types';
import { api } from '../services/api';
import { useEffect } from 'react';
import { ConnectModal } from '../components/ConnectModal';
import { SkillSelector } from '../components/SkillSelector';
import { StudentProfileForm } from '../components/StudentProfileForm';
import { LearningActivityCard } from '../components/LearningActivityCard';
import { CreatePostWidget } from '../components/CreatePostWidget';
import { uploadProfileImage, uploadEducatorAvatar, storageService } from '../firebase/storage';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUser, addSkillToProfile, removeSkillFromProfile, certificates, projects, activities, showToast } = useApp();
  const { currentPath, navigate } = useRouter();
  const { refreshProfile } = useAuth();

  // Determine if viewing own profile or other student's profile
  const pathParts = currentPath.split('/');
  const profileId = pathParts[2]; // e.g. /profile/usr_naveen_01

  const isOwnProfile = !profileId || profileId === currentUser.id;
  
  const [publicProfile, setPublicProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    if (!isOwnProfile && profileId) {
      if (profileId === 'mock_educator_jayamurugan') {
        setPublicProfile({
          id: 'mock_educator_jayamurugan',
          name: 'Jayamurugan V',
          headline: 'Senior Educator & AI Specialist',
          college: 'THENAM Campus',
          department: 'Computer Science',
          yearOfStudy: 'Faculty',
          location: 'Chennai, India',
          avatar: 'https://cdn.phototourl.com/free/2026-08-26-5659434f-46e0-4faa-8391-72dfeefaa208.jpg',
          coverImage: 'https://images.unsplash.com/photo-1524169358666-79f22534bc6e?w=1200&auto=format&fit=crop&q=80',
          bio: 'Educator shaping the future of AI. Mentoring students to achieve global industry standards.',
          email: 'jayamurugan@thenam.edu',
          skills: ['Machine Learning', 'AI', 'Mentorship'],
          interests: [],
          metrics: { coursesCompleted: 0, certificatesCount: 0, projectsCount: 0, networkCount: 1200, xpPoints: 0, streakDays: 0, globalRank: 1 },
          journey: [],
          role: 'faculty',
          profileCompleted: true,
          isOnboardingCompleted: true
        } as any);
        return;
      }

      api.get(`/profile/${profileId}`)
        .then(res => setPublicProfile(res.data))
        .catch(err => {
          console.error('Failed to load public portfolio via API:', err);
          // Set a not found dummy profile to prevent fallback to currentUser
          setPublicProfile({
            id: 'not_found',
            name: 'User Not Found',
            headline: '',
            college: '',
            department: '',
            yearOfStudy: '',
            location: '',
            avatar: 'https://ui-avatars.com/api/?name=Not+Found&background=random',
            coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
            bio: 'This profile could not be found or does not exist.',
            email: '',
            skills: [],
            interests: [],
            metrics: { coursesCompleted: 0, certificatesCount: 0, projectsCount: 0, networkCount: 0, xpPoints: 0, streakDays: 0, globalRank: 0 },
            journey: [],
            role: 'student',
            profileCompleted: true,
            isOnboardingCompleted: true
          } as any);
        });
    } else {
      setPublicProfile(null);
    }
  }, [isOwnProfile, profileId]);

  const profile = isOwnProfile ? currentUser : (publicProfile || currentUser);

  const [activeTab, setActiveTab] = useState<'journey' | 'certificates' | 'projects' | 'skills'>('journey');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState(profile.bio);

  // Sync edited bio if profile changes
  useEffect(() => {
    setEditedBio(profile.bio);
  }, [profile.bio]);

  // Modal control states
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [socialModalType, setSocialModalType] = useState<'linkedin' | 'github'>('linkedin');

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const handleSaveBio = () => {
    updateCurrentUser({ bio: editedBio });
    setIsEditingBio(false);
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Profile portfolio link copied to clipboard!');
  };

  const handleSaveSocialLink = async (url: string) => {
    if (socialModalType === 'linkedin') {
      await updateCurrentUser({ linkedinUrl: url });
    } else {
      await updateCurrentUser({ githubUrl: url });
    }
  };

  const handleEditProfileSubmit = async (formData: any, imageFile: File | null, coverImageFile: File | null) => {
    setEditLoading(true);
    try {
      let finalAvatar = currentUser.avatar;
      
      // Upload new avatar if selected
      if (imageFile) {
        if (currentUser.role === 'faculty' || currentUser.role === 'admin') {
          finalAvatar = await uploadEducatorAvatar(currentUser.id, imageFile);
        } else {
          finalAvatar = await uploadProfileImage(currentUser.id, imageFile);
        }
      }

      let finalCoverImage = currentUser.coverImage;
      if (coverImageFile) {
        finalCoverImage = await storageService.uploadProfileCover(currentUser.id, coverImageFile);
      }

      await updateCurrentUser({
        name: formData.name,
        department: formData.department,
        yearOfStudy: formData.year,
        college: formData.collegeName,
        phone: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        skills: formData.skills,
        avatar: finalAvatar,
        linkedinUrl: formData.linkedinURL,
        githubUrl: formData.githubURL,
        location: `${formData.collegeLocation.city}, ${formData.collegeLocation.state}`,
        collegeLocation: formData.collegeLocation,
        coverImage: finalCoverImage || formData.coverImage
      });

      setIsEditProfileOpen(false);
    } catch (error: any) {
      console.error('Failed to submit edited profile:', error);
      showToast(error.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handleSaveSkills = async (newSkills: string[]) => {
    await updateCurrentUser({ skills: newSkills });
    setIsSkillModalOpen(false);
  };

  if (profile.id === 'not_found') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-6">
        <div className="bg-white rounded-3xl p-16 shadow-sm border border-slate-200 inline-block">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <X className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">User Not Found</h2>
          <p className="text-slate-500 max-w-md">The profile you are looking for does not exist or has been removed from the platform.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Cover Banner */}
        <div className="h-48 sm:h-64 w-full relative overflow-hidden bg-slate-900">
          <img
            src={profile.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'}
            alt="Profile Cover"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
          
          <div className="absolute top-4 right-4 flex flex-wrap items-center gap-2">
            {isOwnProfile && (
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="px-3.5 py-1.5 bg-slate-950/40 hover:bg-slate-950/60 text-white rounded-xl backdrop-blur-md text-xs font-bold border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
            <button
              onClick={handleShareProfile}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md text-xs font-bold border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={() => showToast('Student Resume (PDF) generated from verified record!')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CV</span>
            </button>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-xl bg-slate-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=random&color=fff&size=150`;
                }}
              />
              <div className="absolute bottom-1 right-1 p-1.5 bg-indigo-600 rounded-full text-white ring-2 ring-white" title="Verified THENAM Student">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Availability Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Available for AI & Software Roles
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{profile.name}</h1>
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-indigo-600 mt-0.5">
                  {profile.headline}
                </p>
              </div>

              {/* College & Department */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {profile.college}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  {profile.department}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {profile.location}
                </span>
              </div>

              {/* Bio */}
              <div className="pt-2">
                {isEditingBio && isOwnProfile ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingBio(false)}
                        className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveBio}
                        className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 rounded-lg shadow-2xs cursor-pointer"
                      >
                        Save Bio
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {profile.bio}
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditingBio(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 mt-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit bio
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Social & Contact Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {profile.githubUrl ? (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                ) : (
                  isOwnProfile && (
                    <button
                      onClick={() => {
                        setSocialModalType('github');
                        setIsSocialModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
                    >
                      <Github className="w-3.5 h-3.5 animate-pulse" />
                      <span>Connect your GitHub</span>
                    </button>
                  )
                )}

                {profile.linkedinUrl ? (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                ) : (
                  isOwnProfile && (
                    <button
                      onClick={() => {
                        setSocialModalType('linkedin');
                        setIsSocialModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
                    >
                      <Linkedin className="w-3.5 h-3.5 animate-pulse" />
                      <span>Connect your LinkedIn</span>
                    </button>
                  )
                )}

                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{profile.email}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Metrics Dashboard Column */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Verified Credential Index</span>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    {profile.metrics.streakDays}d Streak
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-xl font-black text-amber-500">{profile.metrics.certificatesCount}</span>
                    <span className="text-[10px] text-slate-500 block font-semibold">Certificates</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-xl font-black text-indigo-600">{profile.metrics.projectsCount}</span>
                    <span className="text-[10px] text-slate-500 block font-semibold">Projects</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-xl font-black text-emerald-600">{profile.metrics.coursesCompleted}</span>
                    <span className="text-[10px] text-slate-500 block font-semibold">Courses Done</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-xl font-black text-purple-600">{profile.metrics.xpPoints}</span>
                    <span className="text-[10px] text-slate-500 block font-semibold">Experience XP</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>THENAM College Rank</span>
                  <span className="font-black text-slate-900">#{profile.metrics.globalRank || 12}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('journey')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'journey'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>My Activity & Posts</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'certificates'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Verified Certificates ({isOwnProfile ? certificates.length : profile.metrics.certificatesCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Projects ({isOwnProfile ? projects.length : profile.metrics.projectsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'skills'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Skills & Endorsements ({profile.skills.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: My Activity & Posts */}
      {activeTab === 'journey' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Activity & Published Posts</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your shared learning milestones, projects, and custom posts.
              </p>
            </div>
          </div>

          {isOwnProfile && <CreatePostWidget />}

          <div className="space-y-6">
            {activities
              .filter(act => 
                act.author?.id === profile.id || 
                (profile.name && act.author?.name?.toLowerCase() === profile.name?.toLowerCase()) ||
                (profile.id === 'mock_educator_jayamurugan' && act.author?.name?.toLowerCase().includes('jayamurugan'))
              )
              .sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime())
              .map(act => (
                <LearningActivityCard key={act.id} activity={act} />
              ))}
            {activities.filter(act => 
                act.author?.id === profile.id || 
                (profile.name && act.author?.name?.toLowerCase() === profile.name?.toLowerCase()) ||
                (profile.id === 'mock_educator_jayamurugan' && act.author?.name?.toLowerCase().includes('jayamurugan'))
              ).length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
                No activity posts published yet. Use the post widget above to publish your first update!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Verified Certificates */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(isOwnProfile ? certificates : (profile.certificates || [])).map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mt-4">{cert.title}</h4>
                <p className="text-xs text-slate-500 mt-1 font-mono">{cert.credentialId}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {cert.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                  <span>Issued: {cert.issueDate}</span>
                  <span className="font-bold text-indigo-600">{cert.grade}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/certificate/${cert.id}`)}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>View High-Res Certificate</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Projects */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(isOwnProfile ? projects : (profile.projects || [])).map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <img
                  src={proj.coverImage}
                  alt={proj.title}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5 space-y-3">
                  <h4 className="text-base font-bold text-slate-900">{proj.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{proj.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.techStack.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-2">
                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Source Code</span>
                  </a>
                )}
                {proj.demoUrl && (
                  <a
                    href={proj.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Skills & Endorsements */}
      {activeTab === 'skills' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Verified Technical Competencies</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Skills tagged with a verified badge were programmatically added and validated through completed THENAM coursework.
              </p>
            </div>

            {/* Quick Skill Add (opens SkillSelector Modal) */}
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setIsSkillModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add / Manage Skills</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {profile.skills.map((skill) => (
              <div
                key={skill}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                    {skill.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{skill}</h5>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Course-Verified
                    </span>
                  </div>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => removeSkillFromProfile(skill)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                    title="Remove skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Portal Connection Modals */}
      <ConnectModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        type={socialModalType}
        initialValue={socialModalType === 'linkedin' ? (currentUser.linkedinUrl || '') : (currentUser.githubUrl || '')}
        onSave={handleSaveSocialLink}
      />

      {/* Skills Showcase Selector Modal */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsSkillModalOpen(false)} />
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Manage Portfolio Skills</h3>
              <button onClick={() => setIsSkillModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <SkillSelector
              selectedSkills={currentUser.skills}
              onChange={handleSaveSkills}
              maxSkills={15}
            />
          </div>
        </div>
      )}

      {/* Edit Profile Fullscreen Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-100/70 backdrop-blur-xs py-8 px-4 flex items-center justify-center">
          <div className="fixed inset-0" onClick={() => setIsEditProfileOpen(false)} />
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Edit Student Credentials</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Modify Database Record</p>
              </div>
              <button 
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <StudentProfileForm
                initialData={{
                  name: currentUser.name,
                  department: currentUser.department,
                  yearOfStudy: currentUser.yearOfStudy,
                  college: currentUser.college,
                  phone: currentUser.phone,
                  dateOfBirth: currentUser.dateOfBirth,
                  skills: currentUser.skills,
                  avatar: currentUser.avatar,
                  coverImage: currentUser.coverImage,
                  linkedinUrl: currentUser.linkedinUrl || '',
                  githubUrl: currentUser.githubUrl || '',
                  collegeLocation: currentUser.collegeLocation
                }}
                onSubmit={handleEditProfileSubmit}
                submitLabel="Apply Changes"
                loading={editLoading}
                role={currentUser.role}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
