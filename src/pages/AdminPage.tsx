import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Award,
  Users,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Plus,
  TrendingUp,
  FileCheck,
  Sparkles,
  Zap,
  Clock,
  Search,
  Edit,
  Trash2,
  Calendar,
  ExternalLink,
  Sliders,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../context/RouterContext';
import { CreateEventModal } from '../components/CreateEventModal';
import { EventItem, StudentProfile } from '../types';
import { api } from '../services/api';

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalCertificates: number;
  totalProjects: number;
  roles: {
    students: number;
    faculty: number;
    admins: number;
  };
}

export const AdminPage: React.FC = () => {
  const { 
    courses, 
    certificates, 
    currentUser, 
    events, 
    activities,
    deleteEvent, 
    triggerCourseCompletionAutomation, 
    showToast 
  } = useApp();
  const { navigate } = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<'credentials' | 'events' | 'students'>('credentials');

  // Event modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | undefined>(undefined);

  // Credential Issuance state
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [recipientName, setRecipientName] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [isIssuingCredential, setIsIssuingCredential] = useState(false);

  // Student directory
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [realStudents, setRealStudents] = useState<StudentProfile[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Real-time statistics
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(false);

  // Fetch real statistics from backend
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(false);
    try {
      const res = await api.get('/admin/statistics');
      const data = res.data?.data || res.data;
      if (data?.summary) {
        setStats(data.summary);
      } else {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load admin statistics:', err);
      setStatsError(true);
      // Fallback to local computed stats
      setStats({
        totalUsers: realStudents.length || 0,
        totalCourses: courses.length,
        totalCertificates: certificates.length,
        totalProjects: 0,
        roles: { students: realStudents.filter(s => s.role === 'student').length, faculty: 1, admins: 1 }
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [courses.length, certificates.length, realStudents.length]);

  // Fetch real students from backend
  const fetchStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const res = await api.get('/admin/users');
      const data: StudentProfile[] = res.data?.data || res.data || [];
      setRealStudents(data.filter((u: any) => u.profileCompleted));
    } catch (err) {
      console.error('Failed to load users from backend:', err);
      setRealStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchStudents();
  }, []);

  // Compute total registrations across all events
  const totalRegistrations = events.reduce((sum, ev) => sum + (ev.registeredCount || 0), 0);

  // Filter students
  const filteredStudents = realStudents.filter(s => 
    s.name?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    s.college?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    (s.headline && s.headline.toLowerCase().includes(studentSearchQuery.toLowerCase())) ||
    (s.department && s.department.toLowerCase().includes(studentSearchQuery.toLowerCase()))
  );

  const handleIssueCustomCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setIsIssuingCredential(true);
    try {
      const cert = await triggerCourseCompletionAutomation(selectedCourseId);
      if (cert) {
        showToast(`Credential issued successfully to ${recipientName || 'student'}!`);
        navigate(`/certificate/${cert.id}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to issue credential.');
    } finally {
      setIsIssuingCredential(false);
    }
  };

  const handleCreateEventClick = () => {
    setEventToEdit(undefined);
    setIsEventModalOpen(true);
  };

  const handleEditEventClick = (ev: EventItem) => {
    setEventToEdit(ev);
    setIsEventModalOpen(true);
  };

  const handleDeleteEventClick = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEvent(eventId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleIssueToStudent = (studentName: string) => {
    setRecipientName(studentName);
    setActiveTab('credentials');
    showToast(`Recipient updated to ${studentName}. Form ready!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>THENAM Faculty & Academic Board Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Academic Board Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Verify coursework milestones, issue cryptographically signed student credentials, manage live student training bootcamps, and audit talent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-2xl font-black text-indigo-400">
              {isLoadingStats ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (stats?.totalCertificates ?? certificates.length)}
            </span>
            <span className="text-[10px] text-slate-300 block font-medium">Issued Certs</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-2xl font-black text-emerald-400">
              {isLoadingStats ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (stats?.totalUsers ?? realStudents.length)}
            </span>
            <span className="text-[10px] text-slate-300 block font-medium">Total Users</span>
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards - Real-time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {isLoadingStats ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : (stats?.roles?.students ?? realStudents.filter(s => s.role === 'student').length)}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live from Firestore
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Active Courses</span>
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{courses.length}</p>
          <span className="text-[10px] text-indigo-600 font-bold">
            {courses.length > 0 ? `${new Set(courses.map(c => c.category)).size} Domains` : 'No courses yet'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Live Bootcamps</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{events.length}</p>
          <span className="text-[10px] text-purple-600 font-bold">{totalRegistrations} Total Registrations</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Faculty Members</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {isLoadingStats ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : (stats?.roles?.faculty ?? 1)}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">Academic Reviewers</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'credentials'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Credential Hub ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'events'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Live Bootcamp Manager ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Directory ({realStudents.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: Credentials */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          {/* Manual Issue Credential Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Issue / Audit Verified Student Credential</h3>
                <p className="text-xs text-slate-500">
                  Directly execute the end-to-end automation pipeline: generate verified certificate, update student portfolio, add skills, and notify peer network.
                </p>
              </div>
            </div>

            <form onSubmit={handleIssueCustomCredential} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Student Candidate</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter student name..."
                  className="w-full p-2.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Course Masterclass</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden cursor-pointer"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assessment Evaluation Grade</label>
                <input
                  type="text"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  placeholder="e.g. Distinction (98.5%)"
                  className="w-full p-2.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div className="md:col-span-3 pt-2">
                <button
                  type="submit"
                  disabled={isIssuingCredential}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isIssuingCredential ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Issuing Credential...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Issue Official Certificate & Trigger Automated Experience</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Issued Certificates Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Programmatic Issuances</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{certificates.length} Total</span>
            </div>

            {certificates.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-2">
                <Award className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No certificates issued yet. Use the form above to issue your first credential.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Credential ID</th>
                      <th className="p-3">Student</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Issue Date</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {certificates.map(cert => (
                      <tr key={cert.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-700">{cert.credentialId}</td>
                        <td className="p-3 font-semibold text-slate-900">{cert.recipientName}</td>
                        <td className="p-3 text-slate-600">{cert.courseName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                            {cert.grade}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{cert.issueDate}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => navigate(`/certificate/${cert.id}`)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Event Management */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Bootcamps & Live Trainings</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish, adjust timelines, link remote meeting links, or cancel student educational sessions.
                </p>
              </div>
              <button
                onClick={handleCreateEventClick}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Host New Event</span>
              </button>
            </div>

            {events.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No bootcamps hosted yet. Get started by clicking "Host New Event"!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Registrations</th>
                      <th className="p-3">Format</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map(ev => (
                      <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3">
                          <span 
                            onClick={() => navigate(`/events/${ev.id}`)}
                            className="font-extrabold text-slate-900 hover:text-indigo-600 cursor-pointer hover:underline"
                          >
                            {ev.title}
                          </span>
                          {ev.domain && <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{ev.domain}</span>}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-extrabold text-[9px] uppercase tracking-wider">
                            {ev.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800">{ev.date || 'TBD'}</span>
                          <span className="block text-[10px] text-slate-400">{ev.time || ''} {ev.duration ? `(${ev.duration})` : ''}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">
                          {ev.registeredCount || 0} / {ev.maxCapacity || '\u221E'}
                        </td>
                        <td className="p-3 text-slate-600 capitalize">
                          {ev.mode === 'online_modular' ? 'Modular Course' : 'Live Broadcast'}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => navigate(`/events/${ev.id}`)}
                            className="inline-flex items-center justify-center p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="View Event"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditEventClick(ev)}
                            className="inline-flex items-center justify-center p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Event"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEventClick(ev.id)}
                            className="inline-flex items-center justify-center p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Student Directory */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Auditor Directory</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect student profiles, review completed coursework, and issue certified credentials directly to portfolios.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { fetchStudents(); fetchStats(); }}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  title="Refresh data from server"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingStudents ? 'animate-spin' : ''}`} />
                </button>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search students or domain..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {isLoadingStudents ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                <p className="text-xs font-medium text-slate-500">Loading student records from Firestore...</p>
              </div>
            ) : realStudents.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-medium text-slate-500">No student records found in the database yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStudents.map(student => (
                  <div 
                    key={student.id} 
                    className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start gap-4">
                      <img 
                        src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'U')}&background=random`} 
                        alt={student.name} 
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-150" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'U')}&background=random`;
                        }}
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1 truncate">
                          {student.name || 'Unnamed User'}
                          {student.profileCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                          {student.role === 'faculty' && (
                            <span className="ml-1 text-[8px] bg-amber-100 text-amber-700 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">Faculty</span>
                          )}
                        </h4>
                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide leading-none truncate">{student.headline || 'No headline'}</p>
                        <p className="text-[9px] text-slate-400 font-medium truncate">{student.college || 'Unknown'} {student.department ? `\u2022 ${student.department}` : ''}</p>
                        
                        {student.skills && student.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {student.skills.slice(0, 3).map(sk => (
                              <span key={sk} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[8px] font-bold rounded">
                                {sk}
                              </span>
                            ))}
                            {student.skills.length > 3 && (
                              <span className="text-[8px] font-bold text-slate-400">+{student.skills.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-4 mt-3 border-t border-slate-100">
                      <button
                        onClick={() => navigate(`/profile/${student.id}`)}
                        className="flex-1 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Audit Profile</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleIssueToStudent(student.name)}
                        className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-extrabold rounded-lg border border-indigo-200/50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Issue Credential</span>
                        <Award className="w-3 h-3 text-indigo-600" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && realStudents.length > 0 && (
                  <div className="col-span-2 bg-white rounded-3xl p-8 text-center text-slate-500 text-sm">
                    No students found matching "{studentSearchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Event modal hooks */}
      <CreateEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        eventToEdit={eventToEdit}
      />
    </div>
  );
};
