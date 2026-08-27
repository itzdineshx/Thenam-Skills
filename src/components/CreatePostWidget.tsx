import React, { useState, useRef } from 'react';
import { 
  Image, 
  Send, 
  X, 
  AlertCircle, 
  MessageSquare, 
  Rocket, 
  Sparkles, 
  Award, 
  Link as LinkIcon, 
  Tag, 
  Globe,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

import { auth } from '../firebase/config';
import { ActivityType } from '../types';
import { cleanPostContent } from '../utils/textCleaner';

export const CreatePostWidget: React.FC = () => {
  const { currentUser, createActivity } = useApp();
  
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<ActivityType>('student_post');
  const [images, setImages] = useState<{file: File, preview: string, uploadedUrl?: string}[]>([]);
  const [externalLink, setExternalLink] = useState('');
  const [skillTag, setSkillTag] = useState('');
  
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imagesRef = useRef(images);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  React.useEffect(() => {
    return () => {
      imagesRef.current.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const maxWords = 500;
  const maxImages = 4;
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const currentWords = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    if (currentWords <= maxWords || text.length < content.length) {
      setContent(text);
      setError(null);
    } else {
      setError(`Maximum ${maxWords} words allowed.`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files) as File[];
    
    if (images.length + newFiles.length > maxImages) {
      setError(`You can upload up to ${maxImages} images.`);
      return;
    }

    const validFiles = newFiles.filter(file => {
      if (file.size > maxFileSize) {
        setError('Each image must be 5MB or less.');
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    // Add to state immediately
    setImages(prev => [...prev, ...newImages]);
    
    // Start background upload to ImgBB
    newImages.forEach(async (imgObj) => {
      try {
        const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
        if (!apiKey) return;
        
        const formData = new FormData();
        formData.append('image', imgObj.file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        if (data.success) {
          setImages(prev => prev.map(img => img.preview === imgObj.preview ? { ...img, uploadedUrl: data.data.url } : img));
        }
      } catch (err) {
        console.error('Background upload failed:', err);
      }
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[indexToRemove].preview);
      newImages.splice(indexToRemove, 1);
      return newImages;
    });
  };



  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handlePost = async () => {
    if ((!content.trim() && images.length === 0 && !externalLink.trim()) || posting) return;

    setPosting(true);
    setError(null);

    try {
      const sanitizedContent = cleanPostContent(content);
      const currentImages = [...images];
      const currentExternalLink = externalLink.trim();
      const currentSkillTag = skillTag.trim();
      const currentPostType = postType;

      // Upload images to ImgBB
      const cloudImageUrls: string[] = await Promise.all(
        currentImages.map(async (img, idx) => {
          if (img.uploadedUrl) return img.uploadedUrl;
          
          try {
            const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
            if (!apiKey) throw new Error('No API key');
            
            const formData = new FormData();
            formData.append('image', img.file);

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
              method: 'POST',
              body: formData,
            });
            const data = await response.json();
            
            if (data.success) {
              return data.data.url;
            }
            throw new Error('Upload failed');
          } catch (err) {
            console.warn('ImgBB upload failed, falling back to base64', err);
            return await fileToDataUrl(img.file);
          }
        })
      );

      let badgeText = '💭 Student Post';
      let badgeTheme: 'blue' | 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose' = 'blue';

      if (currentUser.role === 'faculty' || currentUser.role === 'admin') {
        badgeText = '🎓 Educator Update';
        badgeTheme = 'purple';
      } else if (currentPostType === 'project_milestone') {
        badgeText = '🚀 Project Milestone';
        badgeTheme = 'indigo';
      } else if (currentPostType === 'skill_unlocked') {
        badgeText = '✨ Skill Mastery';
        badgeTheme = 'emerald';
      } else if (currentPostType === 'achievement') {
        badgeText = '🏅 Achievement';
        badgeTheme = 'rose';
      }

      const baseActivityPayload = {
        type: currentPostType,
        author: {
          id: currentUser.id,
          name: currentUser.name,
          headline: currentUser.headline || `${currentUser.department || 'Computer Science'} • ${currentUser.college || 'THENAM Campus'}`,
          avatar: currentUser.avatar,
          college: currentUser.college
        },
        title: (currentPostType === 'project_milestone' || currentPostType === 'certificate_earned')
          ? (sanitizedContent.split('\n')[0]?.slice(0, 60) || 'Shared an update')
          : '',
        description: sanitizedContent,
        badgeText,
        badgeTheme,
        metadata: {
          imageUrls: cloudImageUrls.length > 0 ? cloudImageUrls : undefined,
          externalUrl: currentExternalLink || undefined,
          skillName: currentSkillTag || undefined
        }
      };

      // Publish to feed
      createActivity(baseActivityPayload);

      // Reset form
      setContent('');
      setImages([]);
      setExternalLink('');
      setSkillTag('');
      setShowLinkInput(false);
      setShowTagInput(false);
    } catch (err: any) {
      console.error('Post creation error:', err);
      setError('Failed to publish post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
      
      {/* Category Pills Header */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setPostType('student_post')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            postType === 'student_post' 
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs' 
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>General Post</span>
        </button>

        <button
          type="button"
          onClick={() => setPostType('project_milestone')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            postType === 'project_milestone' 
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs' 
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Project</span>
        </button>

        <button
          type="button"
          onClick={() => setPostType('skill_unlocked')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            postType === 'skill_unlocked' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs' 
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Skill Mastery</span>
        </button>

        {(currentUser.role === 'faculty' || currentUser.role === 'admin') && (
          <button
            type="button"
            onClick={() => setPostType('achievement')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              postType === 'achievement' 
                ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Faculty Announcement</span>
          </button>
        )}
      </div>

      {/* Main Composer Area */}
      <div className="flex gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=random&color=fff&size=100`;
          }}
        />

        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder={
              currentUser.role === 'faculty' 
                ? "Share a campus update, research insight, or lecture note..." 
                : "What do you want to talk about? Share an update, project, or insight..."
            }
            className="w-full text-sm resize-none bg-transparent outline-hidden min-h-[70px] placeholder:text-slate-400"
            rows={3}
          />
          
          {/* Images Preview Grid */}
          {images.length > 0 && (
            <div className={`grid gap-2 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <img 
                    src={img.preview} 
                    alt={`Preview ${idx + 1}`} 
                    className="w-full h-auto max-h-[400px] object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-all shadow-md cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Optional Attachments Input (Link / Skill Tag) */}
          {showLinkInput && (
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="url"
                placeholder="Attach link URL (e.g. https://github.com/... or blog article)"
                value={externalLink}
                onChange={e => setExternalLink(e.target.value)}
                className="w-full bg-transparent outline-hidden text-xs text-slate-800"
              />
              <button onClick={() => setShowLinkInput(false)} className="text-slate-400 hover:text-slate-600 ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {showTagInput && (
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <Tag className="w-3.5 h-3.5 text-indigo-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Tag skill or tech (e.g. PyTorch, React, Machine Learning)"
                value={skillTag}
                onChange={e => setSkillTag(e.target.value)}
                className="w-full bg-transparent outline-hidden text-xs text-slate-800"
              />
              <button onClick={() => setShowTagInput(false)} className="text-slate-400 hover:text-slate-600 ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-1.5 text-rose-500 text-xs font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 sm:gap-3">
              
              {/* Image Upload Input */}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
                disabled={images.length >= maxImages}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= maxImages}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  images.length >= maxImages 
                    ? 'text-slate-300 cursor-not-allowed' 
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
                title="Add Photos"
              >
                <Image className="w-4 h-4" />
                <span className="hidden sm:inline">Media</span>
              </button>

              {/* Toggle Link Input */}
              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showLinkInput ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Attach URL link"
              >
                <LinkIcon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Link</span>
              </button>

              {/* Toggle Skill Tag */}
              <button
                type="button"
                onClick={() => setShowTagInput(!showTagInput)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showTagInput ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Tag Skill"
              >
                <Tag className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline">Skill Tag</span>
              </button>

              <span className={`text-[10px] font-medium ml-2 ${wordCount > maxWords * 0.9 ? 'text-amber-500' : 'text-slate-400'}`}>
                {wordCount}/{maxWords} words
              </span>
            </div>

            {/* Submit Post Button */}
            <button
              type="button"
              onClick={handlePost}
              disabled={(!content.trim() && images.length === 0 && !externalLink.trim()) || !!error || posting}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
            >
              {posting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <span>Post</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

