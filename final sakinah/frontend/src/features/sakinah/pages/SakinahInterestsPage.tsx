import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahLayout, SakinahHeader, SakinahMutualMatchCelebration } from '../components';
import { TrayArrowDown, TrayArrowUp, Handshake, Hourglass, Prohibit } from '@phosphor-icons/react';

const TABS = ['Received', 'Sent', 'Accepted', 'Pending', 'Rejected'] as const;
type TabType = typeof TABS[number];

import { getInterests, silentPass, expressInterest } from '../services/sakinahApi';

export const SakinahInterestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isWaliViewOnly, profile, auth } = useOnboarding();
  const [activeTab, setActiveTab] = useState<TabType>('Received');
  const [items, setItems] = useState<Array<{ id: string, name: string, age: number, city: string, date: string, initial: string }>>([]);
  const [dataCache, setDataCache] = useState<{ sent: any[], received: any[], accepted: any[], pending: any[], rejected: any[] }>({ sent: [], received: [], accepted: [], pending: [], rejected: [] });
  const [mutualMatchCandidate, setMutualMatchCandidate] = useState<{name: string, initial: string} | null>(null);

  React.useEffect(() => {
    getInterests().then(res => {
      setDataCache({ 
        sent: res.sent || [], 
        received: res.received || [],
        accepted: res.accepted || [],
        pending: res.pending || [],
        rejected: res.rejected || []
      });
    }).catch(err => {
      console.warn("Failed to fetch interests", err);
    });
  }, []);

  const handleAction = async (action: 'withdraw' | 'decline' | 'accept', candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (action === 'withdraw' || action === 'decline') {
        await silentPass(candidateId);
        setItems(prev => prev.filter(i => i.id !== candidateId));
        if (action === 'withdraw') {
          setDataCache(prev => ({ ...prev, sent: prev.sent.filter(i => i.id !== candidateId), pending: prev.pending.filter(i => i.id !== candidateId) }));
        } else {
          setDataCache(prev => ({ ...prev, received: prev.received.filter(i => i.id !== candidateId) }));
        }
      } else if (action === 'accept') {
        const res: any = await expressInterest(candidateId);
        const accItem = items.find(i => i.id === candidateId);
        if (accItem) {
          if (res && (res.status === 'mutual_interest' || res.status === 'MUTUAL_INTEREST' || res.status === 'mutual')) {
            setMutualMatchCandidate({ name: accItem.name, initial: accItem.initial });
          }
          setItems(prev => prev.filter(i => i.id !== candidateId));
          setDataCache(prev => ({ 
            ...prev, 
            received: prev.received.filter(i => i.id !== candidateId),
            accepted: [...prev.accepted, accItem]
          }));
        }
      }
    } catch (err) {
      console.warn(`Failed to ${action} interest`, err);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'Sent') {
      setItems(dataCache.sent);
    } else if (activeTab === 'Received') {
      setItems(dataCache.received);
    } else if (activeTab === 'Accepted') {
      setItems(dataCache.accepted);
    } else if (activeTab === 'Pending') {
      setItems(dataCache.pending);
    } else if (activeTab === 'Rejected') {
      setItems(dataCache.rejected);
    } else {
      setItems([]);
    }
  }, [activeTab, dataCache]);

  if (mutualMatchCandidate) {
    return (
      <SakinahMutualMatchCelebration
        matchedUserName={mutualMatchCandidate.name}
        matchedUserInitial={mutualMatchCandidate.initial}
        myInitial={profile?.firstName?.charAt(0).toUpperCase() || auth?.email?.charAt(0).toUpperCase() || 'M'}
        onStartConversation={() => navigate('/matrimony/messages')}
      />
    );
  }

  return (
    <SakinahLayout>
      <div className="p-6 md:p-10 max-w-[1000px] mx-auto min-h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <SakinahHeader title="Interests" subtitle="Manage your connections and requests" onBack={() => navigate(isWaliViewOnly ? '/matrimony/wali-dashboard' : '/matrimony/dashboard')} />
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 mt-6 border-b border-[rgba(255,255,255,0.05)] pb-4">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2 text-[14px] font-medium transition-colors ${activeTab === tab ? 'text-[var(--sk-gold)]' : 'text-[var(--sk-ink-dim)] hover:text-[var(--sk-ink)]'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="interest-tab" className="absolute bottom-[-16px] left-0 right-0 h-0.5 bg-[var(--sk-gold)]" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {items.length === 0 ? (
                <div className="max-w-[400px] mx-auto text-center mt-12">
                  <div className="w-20 h-20 mx-auto rounded-full bg-[rgba(212,168,83,0.05)] border border-[rgba(212,168,83,0.1)] flex items-center justify-center text-[var(--sk-gold)] mb-6 shadow-[0_0_30px_rgba(212,168,83,0.1)]">
                    {activeTab === 'Received' ? <TrayArrowDown className="text-[32px]" /> : activeTab === 'Sent' ? <TrayArrowUp className="text-[32px]" /> : activeTab === 'Accepted' ? <Handshake className="text-[32px]" /> : activeTab === 'Pending' ? <Hourglass className="text-[32px]" /> : <Prohibit className="text-[32px]" />}
                  </div>
                  <h3 className="font-serif text-[22px] text-[var(--sk-ink)] mb-3">No {activeTab} Interests</h3>
                  <p className="text-[14px] text-[var(--sk-ink-dim)] mb-8">
                    {activeTab === 'Received' && 'When someone expresses interest in your profile, it will appear here.'}
                    {activeTab === 'Sent' && 'You have not sent any interests yet. Discover matches to start connecting.'}
                    {activeTab === 'Accepted' && 'Interests that have been mutually accepted will be listed here, allowing you to chat.'}
                    {activeTab === 'Pending' && 'Interests awaiting a response are shown here.'}
                    {activeTab === 'Rejected' && 'Interests that were respectfully declined will appear here.'}
                  </p>
                  
                  {(activeTab === 'Received' || activeTab === 'Sent') && !isWaliViewOnly ? (
                    <button onClick={() => navigate('/matrimony/matches')} className="px-6 py-3 bg-[var(--sk-gold)] text-[#0A0E16] rounded-full text-[14px] font-medium hover:bg-[#E8C97A] transition-colors shadow-[0_0_20px_rgba(212,168,83,0.3)]">
                      Discover Matches
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(item => (
                    <div key={item.id} className="sk-card p-5 hover:border-[var(--sk-gold)] transition-all cursor-pointer group" onClick={() => !isWaliViewOnly && navigate('/matrimony/matches')}>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4A853] to-[#A37B31] flex items-center justify-center text-[20px] font-serif text-[#0A0E16] font-bold group-hover:scale-105 transition-transform shrink-0">
                          {item.initial}
                        </div>
                        <div>
                          <h3 className="text-[16px] font-medium text-[var(--sk-ink)] group-hover:text-[var(--sk-gold)] transition-colors">{item.name}</h3>
                          <div className="text-[12px] text-[var(--sk-ink-dim)]">{item.age} yrs · {item.city}</div>
                          <div className="text-[10px] text-[var(--sk-ink-faint)] mt-1">{item.date}</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] flex gap-2">
                        {!isWaliViewOnly ? (
                          <>
                            {activeTab === 'Received' && (
                              <>
                                <button className="flex-1 py-1.5 bg-[rgba(127,176,122,0.1)] text-[var(--sk-green)] border border-[rgba(127,176,122,0.2)] rounded-full text-[12px] hover:bg-[rgba(127,176,122,0.2)] transition-colors" onClick={(e) => handleAction('accept', item.id, e)}>Accept</button>
                                <button className="flex-1 py-1.5 bg-[rgba(255,255,255,0.02)] text-[var(--sk-ink-dim)] border border-[rgba(255,255,255,0.05)] rounded-full text-[12px] hover:text-[var(--sk-ink)] transition-colors" onClick={(e) => handleAction('decline', item.id, e)}>Decline</button>
                              </>
                            )}
                            {activeTab === 'Sent' && (
                              <button className="w-full py-1.5 bg-[rgba(255,255,255,0.02)] text-[var(--sk-ink-dim)] border border-[rgba(255,255,255,0.05)] rounded-full text-[12px] hover:text-[var(--sk-ink)] transition-colors" onClick={(e) => handleAction('withdraw', item.id, e)}>Withdraw Interest</button>
                            )}
                            {activeTab === 'Accepted' && (
                              <button onClick={(e) => { e.stopPropagation(); navigate('/matrimony/chat'); }} className="w-full py-1.5 bg-[var(--sk-gold)] text-[#0A0E16] rounded-full text-[12px] font-medium hover:bg-[#E8C97A] transition-colors shadow-[0_0_15px_rgba(212,168,83,0.2)]">Message Now</button>
                            )}
                          </>
                        ) : (
                          <button className="w-full py-1.5 bg-[rgba(255,255,255,0.02)] text-[var(--sk-ink-dim)] border border-[rgba(255,255,255,0.05)] rounded-full text-[12px] transition-colors cursor-default">View Profile</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SakinahLayout>
  );
};
