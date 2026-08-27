import React, { useState, useRef } from 'react';
import { X, FileText, Layout, Type, Download, Loader2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { StudentProfile, Certificate, Project } from '../../types';
import { MinimalistCV, ModernCV, ClassicCV } from './CVTemplates';

interface CVExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  certificates: Certificate[];
  projects: Project[];
}

type TemplateType = 'minimalist' | 'modern' | 'classic';

export const CVExportModal: React.FC<CVExportModalProps> = ({
  isOpen,
  onClose,
  profile,
  certificates,
  projects
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `${profile.name}_Resume`,
    onBeforePrint: () => {
      setIsGenerating(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsGenerating(false);
      onClose();
    },
    onPrintError: () => {
      setIsGenerating(false);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Export Professional CV</h2>
              <p className="text-sm text-slate-500">Choose a template to generate your resume</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Minimalist */}
            <div 
              onClick={() => setSelectedTemplate('minimalist')}
              className={`relative border-2 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                selectedTemplate === 'minimalist' ? 'border-indigo-600 ring-4 ring-indigo-600/10 shadow-lg' : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="aspect-[1/1.4] bg-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-[800px] origin-top-left transition-transform duration-300" style={{ transform: 'scale(0.31)' }}>
                  <MinimalistCV profile={profile} certificates={certificates} projects={projects} />
                </div>
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
              </div>
              <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-sm text-slate-900">Minimalist</span>
                </div>
                <div className={`w-4 h-4 rounded-full border ${selectedTemplate === 'minimalist' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`} />
              </div>
            </div>

            {/* Modern */}
            <div 
              onClick={() => setSelectedTemplate('modern')}
              className={`relative border-2 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                selectedTemplate === 'modern' ? 'border-indigo-600 ring-4 ring-indigo-600/10 shadow-lg' : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="aspect-[1/1.4] bg-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-[800px] origin-top-left transition-transform duration-300" style={{ transform: 'scale(0.31)' }}>
                  <ModernCV profile={profile} certificates={certificates} projects={projects} />
                </div>
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
              </div>
              <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-sm text-slate-900">Modern</span>
                </div>
                <div className={`w-4 h-4 rounded-full border ${selectedTemplate === 'modern' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`} />
              </div>
            </div>

            {/* Classic */}
            <div 
              onClick={() => setSelectedTemplate('classic')}
              className={`relative border-2 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                selectedTemplate === 'classic' ? 'border-indigo-600 ring-4 ring-indigo-600/10 shadow-lg' : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="aspect-[1/1.4] bg-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-[800px] origin-top-left transition-transform duration-300" style={{ transform: 'scale(0.31)' }}>
                  <ClassicCV profile={profile} certificates={certificates} projects={projects} />
                </div>
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
              </div>
              <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-sm text-slate-900">Classic</span>
                </div>
                <div className={`w-4 h-4 rounded-full border ${selectedTemplate === 'classic' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`} />
              </div>
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Off-screen CV Templates for Printing (Avoid display: none for react-to-print ref stability) */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '800px', overflow: 'hidden' }}>
        <div ref={contentRef} id="printable-cv">
          {selectedTemplate === 'minimalist' && <MinimalistCV profile={profile} certificates={certificates} projects={projects} />}
          {selectedTemplate === 'modern' && <ModernCV profile={profile} certificates={certificates} projects={projects} />}
          {selectedTemplate === 'classic' && <ClassicCV profile={profile} certificates={certificates} projects={projects} />}
        </div>
      </div>
    </div>
  );
};
