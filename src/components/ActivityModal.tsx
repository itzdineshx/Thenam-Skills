import React from 'react';
import { X, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { ActivityItem } from '../types';
import { useApp } from '../context/AppContext';
import { getRelativeTime } from '../utils/time';
import { cleanPostContent } from '../utils/textCleaner';

interface ActivityModalProps {
  activity: ActivityItem;
  onClose: () => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({ activity, onClose }) => {
  const { toggleLikeActivity, toggleSaveActivity, currentUser } = useApp();
  const isAuthor = activity.author.id === currentUser.id;

  const cleanTitle = cleanPostContent(activity.title);
  const cleanDesc = cleanPostContent(activity.description);
  const showTitle = cleanTitle && cleanTitle.toLowerCase() !== cleanDesc.split('\n')[0]?.trim().toLowerCase() && activity.type !== 'student_post';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <h2 className="text-lg font-bold text-slate-800">{activity.author.name}'s Post</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Author Info */}
          <div className="flex items-center gap-4">
            <img
              src={isAuthor ? currentUser.avatar : activity.author.avatar}
              alt={activity.author.name}
              className="w-14 h-14 rounded-full object-cover border border-slate-200 bg-slate-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.author.name || 'User')}&background=random&color=fff&size=100`;
              }}
            />
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1">
                {activity.author.name}
              </h3>
              <p className="text-sm text-slate-500">{activity.author.headline}</p>
              <p className="text-xs text-slate-400 font-medium">{getRelativeTime(activity.createdAt || activity.timestamp)}</p>
            </div>
          </div>

          {/* Activity Text content */}
          <div className="space-y-3">
            {showTitle && <h3 className="text-xl font-bold text-slate-900">{cleanTitle}</h3>}
            <div className="text-[15px] text-slate-800 leading-relaxed whitespace-pre-wrap">
              {cleanDesc}
            </div>
          </div>

          {/* Activity Media */}
          {activity.metadata?.imageUrls ? (
            <div className={`grid gap-2 w-full ${activity.metadata.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {activity.metadata.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Activity media ${index + 1}`}
                  className="w-full h-auto max-h-[600px] object-contain rounded-xl bg-slate-50 border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/475569?text=Image+Not+Found';
                  }}
                />
              ))}
            </div>
          ) : activity.metadata?.imageUrl ? (
            <img
              src={activity.metadata.imageUrl}
              alt="Activity media"
              className="w-full h-auto max-h-[600px] object-contain rounded-xl bg-slate-50 border border-slate-200"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/475569?text=Image+Not+Found';
              }}
            />
          ) : null}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm font-medium text-slate-600">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleLikeActivity(activity.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                activity.isLiked ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-slate-200/50'
              }`}
            >
              <Heart className={`w-5 h-5 ${activity.isLiked ? 'fill-indigo-600 text-indigo-600' : ''}`} />
              <span>{activity.likesCount} Likes</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-200/50 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span>{activity.commentsCount} Comments</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-200/50 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
          <button
            onClick={() => toggleSaveActivity(activity.id)}
            className={`p-2 rounded-xl transition-colors ${
              activity.isSaved ? 'text-amber-600 bg-amber-50' : 'hover:bg-slate-200/50 text-slate-400'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${activity.isSaved ? 'fill-amber-600' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
