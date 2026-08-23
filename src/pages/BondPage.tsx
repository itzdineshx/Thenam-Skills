import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useApp } from '../context/AppContext';
import {
  Users,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { useRouter } from '../context/RouterContext';

interface BondDocument {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: any;
}

export const BondPage: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const { navigate } = useRouter();
  
  const [bonds, setBonds] = useState<BondDocument[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Fetch real-time bonds
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    // Use two listeners since 'or' is sometimes tricky depending on Firestore indexes and SDK version
    const qSender = query(collection(db, 'bonds'), where('senderId', '==', currentUser.id));
    const qReceiver = query(collection(db, 'bonds'), where('receiverId', '==', currentUser.id));

    const handleSnapshot = (snapshot: any) => {
      setBonds(prevBonds => {
        const newBonds = [...prevBonds];
        snapshot.docChanges().forEach((change: any) => {
          const data = change.doc.data() as BondDocument;
          data.id = change.doc.id;
          
          if (change.type === 'added' || change.type === 'modified') {
            const index = newBonds.findIndex(b => b.id === data.id);
            if (index > -1) newBonds[index] = data;
            else newBonds.push(data);
          }
          if (change.type === 'removed') {
            const index = newBonds.findIndex(b => b.id === data.id);
            if (index > -1) newBonds.splice(index, 1);
          }
        });
        return newBonds;
      });
    };

    const unsubSender = onSnapshot(qSender, handleSnapshot);
    const unsubReceiver = onSnapshot(qReceiver, handleSnapshot);

    return () => {
      unsubSender();
      unsubReceiver();
    };
  }, [currentUser]);

  // Fetch associated user profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      const missingUids = new Set<string>();
      
      bonds.forEach(bond => {
        const otherId = bond.senderId === currentUser.id ? bond.receiverId : bond.senderId;
        if (!userProfiles[otherId]) {
          missingUids.add(otherId);
        }
      });

      if (missingUids.size === 0) {
        if (loading) setLoading(false);
        return;
      }

      const newProfiles = { ...userProfiles };
      
      // Batch fetch missing profiles
      await Promise.all(
        Array.from(missingUids).map(async (uid) => {
          try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              newProfiles[uid] = docSnap.data();
            } else {
              newProfiles[uid] = { name: 'Unknown User', role: 'student', college: 'Unknown' }; // fallback
            }
          } catch (e) {
            console.error('Error fetching user profile:', e);
          }
        })
      );

      setUserProfiles(newProfiles);
      setLoading(false);
    };

    fetchProfiles();
  }, [bonds]);

  const handleAccept = async (bondId: string) => {
    try {
      await updateDoc(doc(db, 'bonds', bondId), { status: 'accepted' });
      showToast('Bond request accepted!');
    } catch (error) {
      console.error('Error accepting bond:', error);
      showToast('Failed to accept bond.');
    }
  };

  const handleReject = async (bondId: string) => {
    try {
      await deleteDoc(doc(db, 'bonds', bondId));
      showToast('Bond request removed.');
    } catch (error) {
      console.error('Error rejecting bond:', error);
      showToast('Failed to reject bond.');
    }
  };

  // Categorize bonds
  const activeBonds = bonds.filter(b => b.status === 'accepted');
  const incomingRequests = bonds.filter(b => b.status === 'pending' && b.receiverId === currentUser.id);
  const outgoingRequests = bonds.filter(b => b.status === 'pending' && b.senderId === currentUser.id);

  const renderUserCard = (bond: BondDocument, actionType: 'active' | 'incoming' | 'outgoing') => {
    const otherId = bond.senderId === currentUser.id ? bond.receiverId : bond.senderId;
    const profile = userProfiles[otherId];

    if (!profile) {
      return (
        <div key={bond.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-center min-h-[100px]">
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
        </div>
      );
    }

    const isEducator = profile.role === 'faculty' || profile.role === 'educator';
    const roleBadgeColor = isEducator ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700';
    const roleTitle = isEducator ? 'Educator' : 'Student';
    const departmentOrCollege = profile.department ? `${profile.department}, ${profile.college || ''}` : profile.college || 'THENAM Campus';

    return (
      <div key={bond.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
        <div className="flex items-start gap-3">
          <img
            src={profile.photoURL || profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80'}
            alt={profile.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate hover:text-indigo-600 cursor-pointer" onClick={() => navigate(`/profile/${otherId}`)}>
              {profile.name}
            </h4>
            <div className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${roleBadgeColor}`}>
              {roleTitle} • {departmentOrCollege}
            </div>
            {profile.headline && (
              <p className="text-xs text-slate-500 truncate mt-1.5">{profile.headline}</p>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          {actionType === 'active' && (
            <>
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 cursor-default">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Connected</span>
              </div>
              <button 
                onClick={() => {
                  showToast(`Chat opened with ${profile.name}`);
                  navigate('/messages');
                }}
                className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
                title="Message"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </>
          )}

          {actionType === 'incoming' && (
            <>
              <button
                onClick={() => handleAccept(bond.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => handleReject(bond.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          )}

          {actionType === 'outgoing' && (
            <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold border border-slate-200 cursor-default">
              <Clock className="w-3.5 h-3.5" />
              <span>Request Pending</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Campus Bond</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Your Bond Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Manage your peer connections and mentor bonds in real-time. Accepted bonds enable direct messaging and collaborative milestones.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Users className="w-48 h-48" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
          <p className="text-sm font-semibold">Syncing Bonds...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: Current Bonds */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Current Bonds</h2>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{activeBonds.length}</span>
            </div>
            <div className="space-y-4">
              {activeBonds.length === 0 ? (
                <div className="text-center p-6 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-xs font-medium">
                  No active bonds yet.
                </div>
              ) : (
                activeBonds.map(bond => renderUserCard(bond, 'active'))
              )}
            </div>
          </div>

          {/* Column 2: Incoming Requests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">New Requests</h2>
              {incomingRequests.length > 0 && (
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">{incomingRequests.length}</span>
              )}
            </div>
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="text-center p-6 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-xs font-medium">
                  No pending incoming requests.
                </div>
              ) : (
                incomingRequests.map(bond => renderUserCard(bond, 'incoming'))
              )}
            </div>
          </div>

          {/* Column 3: Outgoing Requests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Requested Bonds</h2>
              {outgoingRequests.length > 0 && (
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">{outgoingRequests.length}</span>
              )}
            </div>
            <div className="space-y-4">
              {outgoingRequests.length === 0 ? (
                <div className="text-center p-6 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-xs font-medium">
                  No pending outgoing requests.
                </div>
              ) : (
                outgoingRequests.map(bond => renderUserCard(bond, 'outgoing'))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
