import React, { useState } from 'react';
import { X, Users, MessageCircle, Star, Circle, Handshake, Sparkles, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BondBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BondBar: React.FC<BondBarProps> = ({ isOpen, onClose }) => {
  const { connections } = useApp();
  const [activeTab, setActiveTab] = useState<'peers' | 'educators'>('peers');

  // Filter connected bonds
  const activeBonds = connections.filter(c => c.status === 'connected');
  
  const peerBonds = activeBonds.filter(c => c.role === 'student');
  const educatorBonds = activeBonds.filter(c => c.role !== 'student' || c.isExpert);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-out Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Campus Bond</h2>
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Active Network</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors focus:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-slate-50 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('peers')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'peers' 
                ? 'bg-white text-indigo-600 shadow-xs' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Peer Bonds ({peerBonds.length})
          </button>
          <button
            onClick={() => setActiveTab('educators')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'educators' 
                ? 'bg-white text-purple-600 shadow-xs' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Mentors ({educatorBonds.length})
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4 space-y-3">
          {(activeTab === 'peers' ? peerBonds : educatorBonds).length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                {activeTab === 'peers' ? <Users className="w-8 h-8 text-slate-300" /> : <BookOpen className="w-8 h-8 text-slate-300" />}
              </div>
              <h3 className="text-sm font-bold text-slate-700">No active {activeTab} yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore the network to form academic bonds and collaborations.
              </p>
            </div>
          ) : (
            (activeTab === 'peers' ? peerBonds : educatorBonds).map(bond => (
              <div key={bond.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow group flex items-start gap-3">
                <div className="relative">
                  <img src={bond.avatar} alt={bond.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                  {/* Online Indicator (Mock logic based on ID parity) */}
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${bond.id.length % 2 === 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 truncate pr-2">{bond.name}</h4>
                    {activeTab === 'educators' && <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">{bond.headline}</p>
                  
                  <div className="flex items-center gap-2 mt-2.5">
                    <button className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                      <MessageCircle className="w-3 h-3" /> Chat
                    </button>
                    {activeTab === 'peers' && (
                      <button className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-200">
                        View Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
