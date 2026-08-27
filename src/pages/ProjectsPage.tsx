import React, { useState } from 'react';
import {
  FolderGit2,
  Github,
  ExternalLink,
  Heart,
  Plus,
  Search,
  Sparkles,
  Award,
  ArrowLeft,
  X,
  Send,
  Code,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../context/RouterContext';
import { Project } from '../types';
import { storageService } from '../firebase/storage';

export const ProjectsPage: React.FC = () => {
  const { projects, toggleLikeProject, addProject, currentUser, showToast } = useApp();
  const { currentPath, navigate } = useRouter();

  const segments = currentPath.split('/').filter(Boolean);
  const isDetail = segments[0] === 'project' && segments[1];
  const activeProjectId = isDetail ? segments[1] : null;
  const targetProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // New project form state
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newDemo, setNewDemo] = useState('');
  const [newGithub, setNewGithub] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>('');

  const tags = ['All', 'PyTorch', 'Computer Vision', 'React', 'FastAPI', 'NLP', 'Blockchain'];

  const filteredProjects = projects.filter((p) => {
    const matchesTag = selectedTag === 'All' || p.techStack.includes(selectedTag);
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const stack = newTech.split(',').map(s => s.trim()).filter(Boolean);
    
    let finalCoverImage = newImage.trim() || 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80';
    if (newImageFile) {
      const tempId = `temp_${Date.now()}`;
      finalCoverImage = await storageService.uploadProjectCover(tempId, newImageFile);
    }

    addProject({
      title: newTitle.trim(),
      tagline: newTagline.trim() || 'AI & Machine Learning Capstone',
      description: newDesc.trim(),
      domain: 'AI & Data Science',
      author: {
        uid: currentUser.id,
        name: currentUser.name,
        headline: currentUser.headline,
        avatar: currentUser.avatar,
        college: currentUser.college
      },
      techStack: stack.length > 0 ? stack : ['Python', 'AI'],
      githubUrl: newGithub.trim() || undefined,
      demoUrl: newDemo.trim() || undefined,
      coverImage: finalCoverImage
    });

    setIsSubmitModalOpen(false);
    setNewTitle('');
    setNewTagline('');
    setNewDesc('');
    setNewTech('');
    setNewDemo('');
    setNewGithub('');
    setNewImage('');
    setNewImageFile(null);
    setNewImagePreview('');
  };

  // If viewing single project detail
  if (isDetail && targetProject) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Showcase</span>
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md space-y-6 p-6 sm:p-8">
          <img
            src={targetProject.coverImage}
            alt={targetProject.title}
            className="w-full h-72 sm:h-96 object-cover rounded-2xl border border-slate-200"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={targetProject.author.avatar}
                  alt={targetProject.author.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{targetProject.author.name}</h4>
                  <p className="text-[11px] text-slate-500">{targetProject.author.college}</p>
                </div>
              </div>

              <button
                onClick={() => toggleLikeProject(targetProject.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  targetProject.isLiked ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${targetProject.isLiked ? 'fill-rose-600' : ''}`} />
                <span>{targetProject.likesCount} Likes</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{targetProject.title}</h1>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{targetProject.description}</p>

            <div className="pt-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Technologies Used</h5>
              <div className="flex flex-wrap gap-2">
                {targetProject.techStack.map(t => (
                  <span key={t} className="px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
              {targetProject.githubUrl && (
                <a
                  href={targetProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              )}
              {targetProject.demoUrl && (
                <a
                  href={targetProject.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Web App</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // All Projects Grid
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>THENAM Technical Showcase</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Student Engineering Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Real-world machine learning architectures, web applications, and embedded systems created by students across Chennai.
          </p>
        </div>

        <button
          id="btn-open-submit-project"
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Project</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedTag === tag ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            id={`project-card-${proj.id}`}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-48 overflow-hidden">
                <img
                  src={proj.coverImage}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <button
                  onClick={() => toggleLikeProject(proj.id)}
                  className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-xl text-white flex items-center gap-1 text-xs font-bold transition-colors"
                >
                  <Heart className={`w-3.5 h-3.5 ${proj.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{proj.likesCount}</span>
                </button>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <img
                    src={proj.author.avatar}
                    alt={proj.author.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-200"
                  />
                  <span className="text-xs font-bold text-slate-800">{proj.author.name}</span>
                  <span className="text-[10px] text-slate-400">• {proj.author.college}</span>
                </div>

                <h3
                  onClick={() => navigate(`/project/${proj.id}`)}
                  className="text-base font-bold text-slate-900 leading-snug line-clamp-1 hover:text-indigo-600 cursor-pointer"
                >
                  {proj.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.techStack.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
              <button
                onClick={() => navigate(`/project/${proj.id}`)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl text-center transition-colors"
              >
                Project Details
              </button>
              {proj.demoUrl && (
                <a
                  href={proj.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl"
                  title="Open Live App"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Publish Project to THENAM Showcase</h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., VisionTransformer Edge"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g., High-throughput ViT model running locally on Raspberry Pi"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Architecture</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the neural network architecture, performance metrics, and results..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="PyTorch, FastAPI, Docker, ONNX"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={newGithub}
                    onChange={(e) => setNewGithub(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://demo.app"
                    value={newDemo}
                    onChange={(e) => setNewDemo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image</label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="Or enter image URL"
                      value={newImage}
                      onChange={(e) => {
                        setNewImage(e.target.value);
                        if (e.target.value) setNewImageFile(null);
                      }}
                      className="w-full pl-9 pr-3 p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>
                  <label className="flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap">
                    Upload Image
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
                          setNewImageFile(file);
                          setNewImage('');
                          const reader = new FileReader();
                          reader.onloadend = () => setNewImagePreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                
                {(newImage || newImagePreview) && (
                  <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={newImage || newImagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Publish Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
