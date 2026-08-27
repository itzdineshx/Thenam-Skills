import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Award,
  Sparkles,
  Calendar,
  Radio,
  Rocket,
  Trophy,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Send,
  MoreHorizontal,
  Trash2,
  QrCode,
  Eye,
  Check
} from 'lucide-react';
import { ActivityItem } from '../types';
import { useApp } from '../context/AppContext';
import { useRouter } from '../context/RouterContext';

import { getRelativeTime } from '../utils/time';

interface LearningActivityCardProps {
  activity: ActivityItem;
}

export const LearningActivityCard: React.FC<LearningActivityCardProps> = ({ activity }) => {
  const { toggleLikeActivity, addCommentToActivity, toggleSaveActivity, deleteActivity, currentUser, showToast } = useApp();
  const { navigate } = useRouter();

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const isLongDescription = activity.description && (activity.description.length > 150 || activity.description.split('\n').length > 2);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentInput.trim()) {
      addCommentToActivity(activity.id, commentInput.trim());
      setCommentInput('');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://thenamskills.edu/feed/${activity.id}`);
    setCopied(true);
    showToast('Activity link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Badges and Theme styles based on Activity Type
  const getActivityBadgeConfig = () => {
    switch (activity.type) {
      case 'certificate_earned':
        return {
          icon: Award,
          bg: 'bg-amber-50',
          border: 'border-amber-200/80',
          text: 'text-amber-800',
          accent: 'from-amber-500 to-orange-500',
          pillBg: 'bg-amber-100/90 text-amber-800'
        };
      case 'skill_unlocked':
        return {
          icon: Sparkles,
          bg: 'bg-emerald-50/70',
          border: 'border-emerald-200/80',
          text: 'text-emerald-800',
          accent: 'from-emerald-500 to-teal-600',
          pillBg: 'bg-emerald-100/90 text-emerald-800'
        };
      case 'workshop_attended':
        return {
          icon: Calendar,
          bg: 'bg-purple-50/70',
          border: 'border-purple-200/80',
          text: 'text-purple-800',
          accent: 'from-purple-500 to-indigo-600',
          pillBg: 'bg-purple-100/90 text-purple-800'
        };
      case 'webinar_attended':
        return {
          icon: Radio,
          bg: 'bg-cyan-50/70',
          border: 'border-cyan-200/80',
          text: 'text-cyan-800',
          accent: 'from-cyan-500 to-blue-600',
          pillBg: 'bg-cyan-100/90 text-cyan-800'
        };
      case 'project_milestone':
        return {
          icon: Rocket,
          bg: 'bg-indigo-50/70',
          border: 'border-indigo-200/80',
          text: 'text-indigo-800',
          accent: 'from-indigo-500 to-blue-600',
          pillBg: 'bg-indigo-100/90 text-indigo-800'
        };
      case 'achievement':
        return {
          icon: Trophy,
          bg: 'bg-rose-50/70',
          border: 'border-rose-200/80',
          text: 'text-rose-800',
          accent: 'from-rose-500 to-red-600',
          pillBg: 'bg-rose-100/90 text-rose-800'
        };
      case 'student_post':
      default:
        return {
          icon: MessageSquare,
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          accent: 'from-slate-700 to-slate-900',
          pillBg: 'bg-slate-100 text-slate-700'
        };
    }
  };

  const badgeConfig = getActivityBadgeConfig();
  const BadgeIcon = badgeConfig.icon;
  const isAuthor = activity.author.id === currentUser.id;

  return (
    <article
      id={`activity-card-${activity.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Top Banner Tag for Learning Activity Type */}
      <div className={`px-4 sm:px-6 py-2.5 ${badgeConfig.bg} border-b ${badgeConfig.border} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${badgeConfig.pillBg}`}>
            <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
            {activity.badgeText}
          </span>
          {activity.metadata?.verificationHash && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono-code font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {activity.metadata.verificationHash.slice(0, 14)}...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
            {getRelativeTime(activity.createdAt || activity.timestamp)}
          </span>
          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30">
                  <button
                    onClick={() => {
                      deleteActivity(activity.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Author Header */}
      <div className="p-4 sm:p-6 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div
            onClick={() => navigate(`/profile/${activity.author.id}`)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={activity.author.name?.toLowerCase().includes('jayamurugan') 
                ? 'https://cdn.phototourl.com/free/2026-08-26-5659434f-46e0-4faa-8391-72dfeefaa208.jpg'
                : (isAuthor ? currentUser.avatar : activity.author.avatar)}
              alt={activity.author.name}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-indigo-400 transition-all bg-slate-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.author.name || 'User')}&background=random&color=fff&size=100`;
              }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {activity.author.name}
                </h4>
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <p className="text-xs text-slate-500">{activity.author.headline}</p>
              <p className="text-[11px] text-slate-400 font-medium">{activity.author.college}</p>
            </div>
          </div>
        </div>

        {/* Activity Content */}
        <div className="mt-4 space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {activity.title}
          </h3>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            <div className={!isDescriptionExpanded && isLongDescription ? "line-clamp-2" : ""}>
              {activity.description}
            </div>
            {isLongDescription && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-slate-500 font-bold hover:text-indigo-600 mt-0.5 cursor-pointer transition-colors text-xs"
              >
                {isDescriptionExpanded ? 'show less' : '...read more'}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Activity Metadata Embeds */}
        {activity.type === 'certificate_earned' && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-100/30 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700">Verified Credential</span>
                <h5 className="text-sm font-bold text-slate-900">{activity.metadata?.courseTitle || 'Mastery Certification'}</h5>
                <p className="text-xs text-slate-600 font-medium">Grade: <span className="font-bold text-amber-900">{activity.metadata?.grade || 'Distinction'}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {activity.metadata?.certificateId && (
                <button
                  id={`btn-view-cert-${activity.id}`}
                  onClick={() => navigate(`/certificate/${activity.metadata?.certificateId}`)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Certificate
                </button>
              )}
              {activity.metadata?.verificationHash && (
                <button
                  onClick={() => navigate(`/verify/${activity.metadata?.verificationHash}`)}
                  className="px-3 py-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verify
                </button>
              )}
            </div>
          </div>
        )}

        {activity.type === 'project_milestone' && (
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
            {activity.metadata?.imageUrl && (
              <img
                src={activity.metadata.imageUrl}
                alt="Project preview"
                className="w-full h-44 object-cover rounded-lg border border-slate-200"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/475569?text=Image+Not+Found';
                }}
              />
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h5 className="text-sm font-bold text-slate-900">{activity.metadata?.projectTitle}</h5>
                {activity.metadata?.metrics && (
                  <p className="text-xs font-semibold text-indigo-700 mt-0.5">{activity.metadata.metrics}</p>
                )}
              </div>
              {activity.metadata?.projectId && (
                <button
                  onClick={() => navigate(`/project/${activity.metadata?.projectId}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  <span>Explore Project</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {activity.type === 'skill_unlocked' && activity.metadata?.skillName && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold text-emerald-700">Verified Competency</span>
              <p className="text-xs font-bold text-slate-900">{activity.metadata.skillName}</p>
              <p className="text-[11px] text-slate-500">Verified via THENAM Proctored Assessment</p>
            </div>
            <button
              onClick={() => navigate('/talent')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
            >
              Browse Domain
            </button>
          </div>
        )}

        {(activity.metadata?.imageUrl || (activity.metadata?.imageUrls && activity.metadata.imageUrls.length > 0)) && activity.type !== 'project_milestone' && (
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-black/5 dark:bg-zinc-900/50 w-full max-h-[550px] flex items-center justify-center">
            {activity.metadata?.imageUrls ? (
              <div className={`grid gap-1 w-full ${activity.metadata.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} ${activity.metadata.imageUrls.length > 2 ? 'grid-rows-2' : ''}`}>
                {activity.metadata.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Activity image ${index + 1}`}
                    className={`w-full h-auto max-h-[550px] object-contain rounded-xl ${
                      activity.metadata!.imageUrls!.length === 3 && index === 0 
                        ? 'row-span-2' 
                        : ''
                    }`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/475569?text=Image+Not+Found';
                    }}
                  />
                ))}
              </div>
            ) : (
              <img
                src={activity.metadata?.imageUrl}
                alt="Activity image"
                className="w-full h-auto max-h-[550px] object-contain rounded-xl"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/475569?text=Image+Not+Found';
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Social Actions Footer */}
      <div className="px-4 sm:px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-1 sm:gap-4">
          <button
            id={`btn-like-${activity.id}`}
            onClick={() => toggleLikeActivity(activity.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activity.isLiked
                ? 'text-rose-600 bg-rose-50 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${activity.isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{activity.likesCount}</span>
          </button>

          <button
            id={`btn-comment-${activity.id}`}
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{activity.commentsCount} Comments</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        <button
          onClick={() => toggleSaveActivity(activity.id)}
          className={`p-2 rounded-lg transition-colors ${
            activity.isSaved ? 'text-indigo-600 bg-indigo-50 font-bold' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
          title="Save Activity"
        >
          <Bookmark className={`w-4 h-4 ${activity.isSaved ? 'fill-indigo-600 text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Expandable Comments Drawer */}
      {isCommentsOpen && (
        <div className="bg-slate-50/80 px-4 sm:px-6 py-4 border-t border-slate-100 space-y-3">
          {/* Add comment input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=random&color=fff&size=100`;
              }}
            />
            <input
              type="text"
              placeholder="Write a congratulatory note or thoughtful comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="px-3 py-1.5 bg-indigo-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 pt-2">
            {activity.comments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">No comments yet. Be the first to congratulate!</p>
            ) : (
              activity.comments.map((comm) => (
                <div key={comm.id} className="flex gap-2.5 bg-white p-3 rounded-xl border border-slate-150 text-xs">
                  <img
                    src={comm.author.name?.toLowerCase().includes('jayamurugan') 
                      ? 'https://cdn.phototourl.com/free/2026-08-26-5659434f-46e0-4faa-8391-72dfeefaa208.jpg'
                      : (comm.author.name === currentUser.name || (comm as any).userId === currentUser.id ? currentUser.avatar : comm.author.avatar)}
                    alt={comm.author.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover shrink-0 bg-slate-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comm.author.name || 'User')}&background=random&color=fff&size=100`;
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{comm.author.name}</span>
                      <span className="text-[10px] text-slate-400">{comm.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1">{comm.author.headline}</p>
                    <p className="text-slate-700">{comm.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900">Share Learning Activity</h4>
            <p className="text-xs text-slate-500">Spread verified peer achievements across professional channels.</p>
            
            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
              >
                <span>Copy Direct Link</span>
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-400" />}
              </button>

              <button
                onClick={() => {
                  showToast('Shared to LinkedIn with verified credential credentials!');
                  setIsShareModalOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 text-xs font-semibold text-blue-900"
              >
                <span>Share to LinkedIn</span>
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </article>
  );
};
