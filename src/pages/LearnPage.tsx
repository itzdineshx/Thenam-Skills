import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Award,
  Clock,
  Star,
  Users,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Filter,
  Play
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../context/RouterContext';

export const LearnPage: React.FC = () => {
  const { courses, enrollInCourse, toggleCourseBookmark, triggerCourseCompletionAutomation } = useApp();
  const { navigate } = useRouter();

  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal state for internships
  const [selectedInternship, setSelectedInternship] = useState<any | null>(null);

  const domains = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'AI & Data Science', label: 'AI & Data Science' },
    { id: 'Web Development', label: 'Web Development' },
    { id: 'Cloud & DevOps', label: 'Cloud & DevOps' },
    { id: 'Cybersecurity', label: 'Cybersecurity' }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesDomain = selectedDomain === 'all' || course.category === selectedDomain;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.skillsGained.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  const internships = [
    {
      id: 'int_ai',
      title: 'AI & Machine Learning',
      subtitle: 'Hands-on LLMs, PyTorch, Computer Vision, Model Deployment',
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
      color: 'bg-indigo-900',
      badgeColor: 'bg-indigo-500/20 text-indigo-300'
    },
    {
      id: 'int_ui',
      title: 'UI/UX Design',
      subtitle: 'Figma Prototyping, Design Systems, User Research, Wireframing',
      icon: <CheckCircle2 className="w-5 h-5 text-fuchsia-400" />,
      color: 'bg-fuchsia-900',
      badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300'
    },
    {
      id: 'int_ba',
      title: 'Business Analyst',
      subtitle: 'Data Storytelling, Agile Workflows, Stakeholder Management, Jira/Confluence',
      icon: <Users className="w-5 h-5 text-amber-400" />,
      color: 'bg-amber-900',
      badgeColor: 'bg-amber-500/20 text-amber-300'
    },
    {
      id: 'int_da',
      title: 'Data Analyst',
      subtitle: 'SQL, Power BI, Python/Pandas, Statistical Modeling',
      icon: <Filter className="w-5 h-5 text-emerald-400" />,
      color: 'bg-emerald-900',
      badgeColor: 'bg-emerald-500/20 text-emerald-300'
    },
    {
      id: 'int_fs',
      title: 'Full Stack Web Development',
      subtitle: 'React, Next.js, Node.js, PostgreSQL, Cloud Deployments',
      icon: <Play className="w-5 h-5 text-blue-400" />,
      color: 'bg-blue-900',
      badgeColor: 'bg-blue-500/20 text-blue-300'
    },
    {
      id: 'int_dm',
      title: 'Digital Marketing',
      subtitle: 'Growth Hacking, SEO/SEM, Performance Marketing, Social Campaigns',
      icon: <Award className="w-5 h-5 text-rose-400" />,
      color: 'bg-rose-900',
      badgeColor: 'bg-rose-500/20 text-rose-300'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800/80 shadow-xl">
        {/* Background decorative elements */}
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>THENAM Industry-Aligned Curriculums</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Explore Verified Engineering Internships 
          </h1>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed font-medium">
            Hands-on code labs, proctored capstone assessments, and tamper-proof academic credentials certified by DMI & THENAM.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="bg-white/5 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10 text-center min-w-[100px] shadow-lg">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">100%</span>
            <span className="text-[9px] text-slate-400 block font-extrabold uppercase tracking-wider mt-0.5">Verified</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10 text-center min-w-[100px] shadow-lg">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-450 to-teal-400">40+</span>
            <span className="text-[9px] text-slate-400 block font-extrabold uppercase tracking-wider mt-0.5">Programs</span>
          </div>
        </div>
      </div>


      {/* Verified Internship Programs */}
      <div className="space-y-5">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight uppercase">
          <Award className="w-5.5 h-5.5 text-indigo-600" />
          Verified Internship Programs
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div
              key={internship.id}
              onClick={() => setSelectedInternship(internship)}
              className="group cursor-pointer bg-slate-950/90 rounded-3xl border border-slate-800/80 hover:border-indigo-500/50 overflow-hidden shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${internship.color} shadow-lg border border-white/5 group-hover:scale-105 transition-transform duration-300`}>
                    {internship.icon}
                  </div>
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${internship.badgeColor} border border-white/5`}>
                    8 Weeks • Virtual
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors">
                    {internship.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">
                    {internship.subtitle}
                  </p>
                </div>
                
                <ul className="space-y-2.5 pt-3.5 border-t border-slate-900/60">
                  <li className="flex items-start gap-2.5 text-[11px] font-bold text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10 shrink-0 mt-0.5" />
                    <span>Live Industry Project</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[11px] font-bold text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10 shrink-0 mt-0.5" />
                    <span>1-on-1 Mentorship</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[11px] font-bold text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10 shrink-0 mt-0.5" />
                    <span>Verified DMI Certificate</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-slate-900/40 border-t border-slate-800/80">
                <button className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600/10 hover:bg-indigo-650 text-indigo-300 hover:text-white text-xs font-black rounded-xl border border-indigo-600/25 transition-all group-hover:shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99]">
                  <span>Announcing Soon</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Courses Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isCompleted = course.progress === 100;
          const isInProgress = course.progress > 0 && course.progress < 100;

          return (
            <div
              key={course.id}
              id={`course-card-${course.id}`}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-xs">
                    {course.category}
                  </span>

                  {/* Bookmark button */}
                  <button
                    onClick={() => toggleCourseBookmark(course.id)}
                    className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md rounded-lg transition-colors"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${course.isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>

                  {/* Rating & Level */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{course.rating}</span>
                      <span className="text-slate-300 font-normal">({course.reviewsCount})</span>
                    </div>
                    <span className="bg-indigo-900/80 px-2 py-0.5 rounded text-[11px] font-bold">
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-3">
                  <h3
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-indigo-600 cursor-pointer transition-colors"
                  >
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Skills Gained Tags */}
                  <div className="flex flex-wrap gap-1">
                    {course.skillsGained.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                    {course.skillsGained.length > 3 && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium">
                        +{course.skillsGained.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-semibold text-slate-700">{course.instructor.name}</span>
                    <span className="text-slate-400">• {course.duration}</span>
                  </div>

                  {/* Progress bar if enrolled */}
                  {course.isEnrolled && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Progress</span>
                        <span className="font-bold text-indigo-600">{course.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0">
                {isCompleted ? (
                  <button
                    onClick={() => navigate(`/course/${course.id}/learn`)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Completed • Review Content</span>
                  </button>
                ) : isInProgress ? (
                  <button
                    onClick={() => navigate(`/course/${course.id}/learn`)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Continue Learning</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      enrollInCourse(course.id);
                      navigate(`/course/${course.id}/learn`);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    <span>Start Course</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Internship Paywall Modal */}
      {selectedInternship && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedInternship(null)}
        >
          <div 
            className="relative bg-[#0B1120] rounded-3xl border border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header & Lock */}
            <div className="p-6 text-center space-y-3 relative overflow-hidden bg-slate-900">
              <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
              <div className="relative z-10 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full" />
                  <div className="w-14 h-14 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center relative z-10 shadow-lg">
                    <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="relative z-10 text-sm font-bold text-rose-400 tracking-wide uppercase">
                Curriculum & Application Locked
              </h3>
              <h2 className="relative z-10 text-2xl font-black text-white">
                {selectedInternship.title}
              </h2>
            </div>
            
            {/* Content & Benefits */}
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-300">Unlock this premium internship to get:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span>Live Capstone Project with Industry Mentors</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span>Tamper-proof Academic Certificate</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span>Placement / Interview Assistance</span>
                  </li>
                </ul>
              </div>
              
              {/* Announcing Soon State */}
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col items-center gap-3 text-center">
                <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-indigo-500/30">
                  Announcing Soon
                </span>
                <p className="text-sm text-slate-300 font-medium my-1">
                  Stay Tuned! Registrations will open shortly.
                </p>
                
                <button
                  disabled
                  className="w-full py-3.5 mt-2 bg-slate-800 text-slate-500 font-bold rounded-xl cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  Notify Me
                </button>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedInternship(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors backdrop-blur-md z-50 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
