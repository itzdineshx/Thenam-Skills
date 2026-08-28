import React, { forwardRef } from 'react';
import { StudentProfile, Certificate, Project } from '../../types';
import { Mail, Phone, MapPin, Linkedin, Github, Award, Briefcase, GraduationCap, Code } from 'lucide-react';

export interface CVProps {
  profile: StudentProfile;
  certificates: Certificate[];
  projects: Project[];
}

// -------------------------------------------------------------
// TEMPLATE 1: MINIMALIST (Clean, text-focused, single column)
// -------------------------------------------------------------
export const MinimalistCV = forwardRef<HTMLDivElement, CVProps>(({ profile, certificates, projects }, ref) => {
  return (
    <div ref={ref} className="w-[800px] min-h-[1131px] bg-white text-slate-900 p-12 mx-auto font-sans shadow-none">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center">
        <h1 className="text-4xl font-black uppercase tracking-widest text-slate-900 mb-2">{profile.name}</h1>
        <p className="text-lg font-medium text-slate-600 tracking-wide uppercase">{profile.headline}</p>
        
        <div className="flex flex-wrap justify-center items-center gap-4 mt-4 text-sm text-slate-600">
          {profile.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {profile.email}</span>}
          {profile.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {profile.phone}</span>}
          {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>}
          {profile.linkedinUrl && <span className="flex items-center gap-1"><Linkedin className="w-4 h-4" /> LinkedIn</span>}
          {profile.githubUrl && <span className="flex items-center gap-1"><Github className="w-4 h-4" /> GitHub</span>}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mb-8">
          <p className="text-sm leading-relaxed text-slate-700">{profile.bio}</p>
        </div>
      )}

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b border-slate-300 pb-1">Education</h2>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{profile.college}</h3>
            <p className="text-slate-600 font-medium">{profile.department}</p>
            <p className="text-sm text-slate-500 mt-1">{profile.yearOfStudy}</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b border-slate-300 pb-1">Technical Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md font-medium">
                {skill.name || skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b border-slate-300 pb-1">Key Projects</h2>
          <div className="space-y-6">
            {projects.slice(0, 3).map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-lg">{proj.title}</h3>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-2">{proj.description}</p>
                <p className="text-xs text-slate-500 italic">Tech Stack: {proj.techStack.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates && certificates.length > 0 && (
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b border-slate-300 pb-1">Certifications</h2>
          <ul className="list-disc list-inside space-y-2">
            {certificates.slice(0, 4).map((cert) => (
              <li key={cert.id} className="text-sm text-slate-700">
                <span className="font-bold">{cert.title}</span> — {cert.issueDate}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

// -------------------------------------------------------------
// TEMPLATE 2: MODERN (Two columns, elegant styling)
// -------------------------------------------------------------
export const ModernCV = forwardRef<HTMLDivElement, CVProps>(({ profile, certificates, projects }, ref) => {
  return (
    <div ref={ref} className="w-[800px] min-h-[1131px] bg-white text-slate-800 mx-auto font-sans flex shadow-none overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-1/3 bg-slate-900 text-white p-8 flex flex-col">
        {profile.avatar && (
          <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-slate-700 mx-auto">
            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" crossOrigin="anonymous" />
          </div>
        )}
        
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contact</h2>
          <div className="space-y-3 text-sm">
            {profile.email && <div className="flex items-start gap-3"><Mail className="w-4 h-4 mt-0.5 text-indigo-400" /><span className="break-all">{profile.email}</span></div>}
            {profile.phone && <div className="flex items-start gap-3"><Phone className="w-4 h-4 mt-0.5 text-indigo-400" /><span>{profile.phone}</span></div>}
            {profile.location && <div className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-0.5 text-indigo-400" /><span>{profile.location}</span></div>}
            {profile.linkedinUrl && <div className="flex items-start gap-3"><Linkedin className="w-4 h-4 mt-0.5 text-indigo-400" /><span className="break-all">LinkedIn Profile</span></div>}
            {profile.githubUrl && <div className="flex items-start gap-3"><Github className="w-4 h-4 mt-0.5 text-indigo-400" /><span className="break-all">GitHub Profile</span></div>}
          </div>
        </div>

        {profile.skills && profile.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <span key={i} className="px-2.5 py-1 bg-white/10 text-xs rounded-md">
                  {skill.name || skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.metrics && (
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Achievements</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between border-b border-slate-800 pb-1">
                <span>Projects</span>
                <span className="font-bold text-indigo-400">{profile.metrics.projectsCount}</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1">
                <span>Certificates</span>
                <span className="font-bold text-indigo-400">{profile.metrics.certificatesCount}</span>
              </li>
              <li className="flex justify-between pb-1">
                <span>Rank</span>
                <span className="font-bold text-indigo-400">#{profile.metrics.globalRank}</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="w-2/3 p-8 bg-slate-50 flex flex-col">
        <div className="mb-8 pb-6 border-b border-slate-200">
          <h1 className="text-4xl font-black text-slate-900 mb-2">{profile.name}</h1>
          <h2 className="text-lg font-bold text-indigo-600 mb-4">{profile.headline}</h2>
          {profile.bio && <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>}
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Education</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-lg">{profile.college}</h4>
            <p className="text-indigo-600 font-medium text-sm">{profile.department}</p>
            <p className="text-xs text-slate-500 mt-1">{profile.yearOfStudy}</p>
          </div>
        </div>

        {projects && projects.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Experience & Projects</h3>
            </div>
            <div className="space-y-4">
              {projects.slice(0, 3).map((proj) => (
                <div key={proj.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <h4 className="font-bold text-slate-900 mb-1">{proj.title}</h4>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {proj.techStack.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-bold uppercase tracking-wider">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {certificates && certificates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Certifications</h3>
            </div>
            <div className="space-y-3">
              {certificates.slice(0, 3).map((cert) => (
                <div key={cert.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{cert.title}</h4>
                    <p className="text-xs text-slate-500">{cert.verifiedBy}</p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full whitespace-nowrap">
                    {cert.issueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// -------------------------------------------------------------
// TEMPLATE 3: CLASSIC (Traditional formal resume)
// -------------------------------------------------------------
export const ClassicCV = forwardRef<HTMLDivElement, CVProps>(({ profile, certificates, projects }, ref) => {
  return (
    <div ref={ref} className="w-[800px] min-h-[1131px] bg-white text-slate-900 p-[1in] mx-auto font-serif shadow-none">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold uppercase mb-1">{profile.name}</h1>
        <div className="text-sm flex flex-wrap justify-center gap-2 text-slate-700">
          {profile.location && <span>{profile.location}</span>}
          {profile.phone && <span>• {profile.phone}</span>}
          {profile.email && <span>• {profile.email}</span>}
          {profile.linkedinUrl && <span>• LinkedIn</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {profile.bio && (
        <div className="mb-6">
          <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 mb-2">Professional Summary</h2>
          <p className="text-sm leading-relaxed text-justify">{profile.bio}</p>
        </div>
      )}

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 mb-2">Education</h2>
        <div className="flex justify-between font-bold text-sm mb-1">
          <span>{profile.college}</span>
          <span>{profile.location}</span>
        </div>
        <div className="flex justify-between text-sm italic mb-1">
          <span>{profile.department}</span>
          <span>{profile.yearOfStudy}</span>
        </div>
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 mb-2">Technical Skills</h2>
          <p className="text-sm leading-relaxed">
            <span className="font-bold">Core Competencies:</span> {profile.skills.map(s => s.name || s).join(', ')}
          </p>
        </div>
      )}

      {/* Projects / Experience */}
      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 mb-2">Projects & Experience</h2>
          {projects.slice(0, 4).map((proj, idx) => (
            <div key={proj.id} className="mb-4">
              <div className="flex justify-between font-bold text-sm mb-1">
                <span>{proj.title}</span>
              </div>
              <p className="text-sm italic mb-1">Technologies: {proj.techStack.join(', ')}</p>
              <ul className="list-disc list-outside ml-4 text-sm space-y-1 text-justify">
                <li>{proj.description}</li>
                {proj.githubUrl && <li>Repository: {proj.githubUrl}</li>}
                {proj.demoUrl && <li>Live Demo: {proj.demoUrl}</li>}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certificates && certificates.length > 0 && (
        <div>
          <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 mb-2">Certifications & Awards</h2>
          <ul className="list-disc list-outside ml-4 text-sm space-y-1">
            {certificates.slice(0, 4).map((cert) => (
              <li key={cert.id}>
                <span className="font-bold">{cert.title}</span>, {cert.verifiedBy} ({cert.issueDate})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});
