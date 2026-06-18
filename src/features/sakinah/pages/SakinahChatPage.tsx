import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { getProgress } from '../services/sakinahProgress';
import { SakinahLayout, SakinahReportModal, SakinahSecurePhotoViewer } from '../components';
import { getMyConversations, getConversationMessages, sendMessage, pinMessage, unpinMessage } from '../services/sakinahApi';
import type { PinnedMessage, FamilyMember } from '../types/sakinah.types';

/* ── Types ─────────────────────────────────────────────────── */
interface OtherUser {
  id: number;
  name: string;
  initial: string;
  isOnline?: boolean;
  managedByWali?: boolean; // New
}

interface LastMessage {
  text: string;
  time: string;
  is_mine: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface ConvoItem {
  conversation_id: string;
  status: string;
  matchflow_step: string;
  unread_count?: number;
  other_user: OtherUser | null;
  last_message: LastMessage | null;
  participants: FamilyMember[]; // New
}

interface Message {
  id: string;
  text: string;
  msg_type: 'text' | 'system' | 'photo';
  sender: 'me' | 'them';
  senderName?: string; // New for group/family chat
  senderRole?: string; // New
  time: string;
  photo_url?: string;
  status?: 'sent' | 'delivered' | 'read';
  reaction?: string; // New
}

export const SakinahChatPage: React.FC = () => {
  const { auth } = useOnboarding();
  const isWaliViewOnly = getProgress().role === 'WALI_VIEW';

  const [conversations, setConversations] = useState<ConvoItem[]>([]);
  const [activeConvo, setActiveConvo]     = useState<ConvoItem | null>(null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]); // New
  const [input, setInput]                 = useState('');
  const [searchQuery, setSearchQuery]     = useState('');
  
  const [loading, setLoading]             = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending]             = useState(false);
  
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);
  const [reportingProfile, setReportingProfile] = useState<string | null>(null);
  const [isTyping, setIsTyping]           = useState(false);
  const [hoveredMsgId, setHoveredMsgId]   = useState<string | null>(null);

  // New SOP states
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const PRE_NIKAH_TOPICS = [
    'Parents & Family', 'Work', 'Friends', 'Habits', 
    'Self-image', 'Responsibility', 'Expectations', 'Finances'
  ];

  /* ── Load conversation list ──────────────────────────────── */
  const loadConversations = useCallback(async () => {
    try {
      const data: any = await getMyConversations();
      // Inject simulated mock data for Family Chat
      const enriched = (data.conversations ?? []).map((c: any) => ({
        ...c,
        unread_count: c.unread_count ?? Math.floor(Math.random() * 2),
        other_user: {
          ...c.other_user,
          isOnline: Math.random() > 0.5,
          managedByWali: Math.random() > 0.7 // Mocking
        },
        participants: [
          { id: '1', name: c.other_user?.name || 'User', role: 'Candidate', status: 'APPROVED' },
          ...(Math.random() > 0.5 ? [{ id: 'w1', name: 'Abdullah', role: 'Wali', status: 'APPROVED' }] : [])
        ]
      }));
      setConversations(enriched);
    } catch (e: any) {
      console.error(e.message ?? 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  /* ── Load messages for active convo ─────────────────────── */
  const loadMessages = useCallback(async (convoId: string, isInitial = false) => {
    if (isInitial) setMessagesLoading(true);
    try {
      const data: any = await getConversationMessages(convoId);
      setIsTyping(Math.random() > 0.8);
      
      const loadedMessages = (data.messages ?? []).map((m: any) => ({
        ...m,
        id: m.id.toString(),
        senderRole: m.sender === 'them' && Math.random() > 0.8 ? 'Wali' : undefined,
        senderName: m.sender === 'them' ? 'Contact' : 'Me'
      }));

      // SOP: Inject Raya guided message if chat is empty
      if (loadedMessages.length === 0) {
        loadedMessages.push({
          id: 'raya_initial',
          text: `As-salamu alaykum. I am Raya, your AI companion. I am here to guide your conversation step-by-step to ensure it remains productive, respectful, and focused on what matters. Your first topic is **${PRE_NIKAH_TOPICS[0]}**. Take your time, and remember that honesty is better than a forced match.`,
          msg_type: 'system',
          sender: 'them',
          senderName: 'Raya (System)',
          senderRole: 'Guide',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        });
      }
      
      setMessages(loadedMessages);
      
      // Simulate loaded pinned messages
      if (isInitial && loadedMessages.length > 5) {
        setPinnedMessages([{
          id: loadedMessages[2].id,
          text: loadedMessages[2].text,
          senderName: loadedMessages[2].senderName,
          pinnedAt: new Date().toISOString()
        }]);
      } else {
        setPinnedMessages([]);
      }

      if (isInitial) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      if (isInitial) setMessagesLoading(false);
    }
  }, []);

  /* ── Open conversation ───────────────────────────────────── */
  const openConvo = (c: ConvoItem) => {
    setActiveConvo(c);
    setMessages([]);
    loadMessages(c.conversation_id, true);
    setConversations(prev => prev.map(conv => conv.conversation_id === c.conversation_id ? { ...conv, unread_count: 0 } : conv));
  };

  /* ── Send message ────────────────────────────────────────── */
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !activeConvo || sending) return;
    
    const messageText = input.trim();
    setInput(''); 
    setSending(true);
    
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      text: messageText,
      msg_type: 'text',
      sender: 'me',
      senderName: auth?.email?.split('@')[0] || 'Me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const msg: any = await sendMessage(activeConvo.conversation_id, messageText);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...msg, id: msg.id.toString(), status: 'delivered' } : m));
    } catch (e: any) {
      console.error(e.message ?? 'Send failed');
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInput(messageText);
    } finally {
      setSending(false);
    }
  };

  /* ── Pin Logic ───────────────────────────────────────────── */
  const togglePin = async (msg: Message) => {
    if (!activeConvo) return;
    const isPinned = pinnedMessages.some(p => p.id === msg.id);
    
    try {
      if (isPinned) {
        await unpinMessage(activeConvo.conversation_id, msg.id);
        setPinnedMessages(prev => prev.filter(p => p.id !== msg.id));
      } else {
        await pinMessage(activeConvo.conversation_id, msg.id);
        setPinnedMessages(prev => [...prev, { id: msg.id, text: msg.text, senderName: msg.senderName || 'Unknown', pinnedAt: new Date().toISOString() }]);
      }
    } catch (err: any) {
      console.error('Failed to pin message');
    }
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => c?.other_user?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [conversations, searchQuery]);

  return (
    <SakinahLayout>
      <div className="h-[calc(100vh-60px)] md:h-screen bg-[#0A0E16] flex flex-col md:flex-row font-sans text-[#EDE7DA] overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,168,83,0.02)_0%,transparent_50%)] pointer-events-none" />

        {/* Sidebar */}
        <div className={`w-full md:w-[360px] border-r border-[rgba(255,255,255,0.05)] bg-[#0C111A]/90 backdrop-blur-md flex flex-col z-10 ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[20px] text-[var(--sk-gold)]">Messages</h2>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] opacity-50">🔍</span>
              <input 
                type="text" placeholder="Search conversations..." 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#111826] border border-[rgba(255,255,255,0.05)] rounded-[12px] py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[rgba(212,168,83,0.3)] transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading && conversations.length === 0 && (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.03)]" />
                    <div className="flex-1 py-1"><div className="h-4 bg-[rgba(255,255,255,0.03)] w-1/2 mb-2"/><div className="h-3 bg-[rgba(255,255,255,0.02)] w-3/4"/></div>
                  </div>
                ))}
              </div>
            )}
            {!loading && filteredConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center p-8 opacity-60">
                <span className="text-[32px] mb-2">✉</span>
                <p className="text-[13px] text-[var(--sk-ink-dim)]">No conversations available.</p>
              </div>
            )}
            <AnimatePresence>
              {filteredConversations.map(c => (
                <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} key={c.conversation_id} onClick={() => openConvo(c)}
                  className={`p-4 border-b border-[rgba(255,255,255,0.02)] cursor-pointer transition-all flex items-center gap-3 ${activeConvo?.conversation_id === c.conversation_id ? 'bg-[rgba(212,168,83,0.05)] border-l-2 border-l-[var(--sk-gold)]' : 'hover:bg-[#111826] border-l-2 border-l-transparent'}`}>
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-serif font-bold ${activeConvo?.conversation_id === c.conversation_id ? 'bg-gradient-to-br from-[#D4A853] to-[#A37B31] text-[#0A0E16]' : 'bg-[#161D2C] text-[var(--sk-gold)] border border-[rgba(255,255,255,0.05)]'}`}>{c.other_user?.initial ?? '?'}</div>
                    {c.other_user?.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0C111A] rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`font-medium text-[15px] truncate ${c.unread_count ? 'text-[#EDE7DA] font-bold' : 'text-[var(--sk-ink)]'}`}>
                        {c.other_user?.name}
                        {c.other_user?.managedByWali && <span className="ml-2 text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded-full align-middle">Wali Managed</span>}
                      </h4>
                      <span className={`text-[10px] shrink-0 ml-2 ${c.unread_count ? 'text-[var(--sk-gold)] font-medium' : 'text-[var(--sk-ink-faint)]'}`}>{c.last_message?.time}</span>
                    </div>
                    <div className="text-[13px] text-[var(--sk-ink-dim)] truncate">{c.last_message?.text}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Area */}
        <div className={`flex-1 flex flex-col bg-[#0A0E16] relative z-0 ${!activeConvo ? 'hidden md:flex' : 'flex'}`}>
          {!activeConvo ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#0A0E16] relative">
              <div className="max-w-md mx-auto flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-[rgba(212,168,83,0.03)] border border-[rgba(212,168,83,0.15)] flex items-center justify-center mb-6">
                  <span className="text-[40px]">✉</span>
                </div>
                <h3 className="font-serif text-[24px] text-[var(--sk-gold)] mb-2">No conversations available.</h3>
                <p className="text-[14px] text-[var(--sk-ink-dim)] max-w-[320px]">
                  Data will appear when available.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.05)] bg-[#0A0E16]/95 backdrop-blur-xl z-20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveConvo(null)} className="md:hidden text-[var(--sk-gold)]">←</button>
                    <div>
                      <h3 className="font-medium text-[16px] text-[#EDE7DA] flex items-center gap-2">
                        {activeConvo?.other_user?.name}
                        {activeConvo?.other_user?.managedByWali && (
                          <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                            Managed by Wali
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {activeConvo?.participants?.map((p, i) => (
                          <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${p.role === 'Wali' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                            {p.name} ({p.role})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isWaliViewOnly && (
                      <button 
                        onClick={() => setShowDecisionModal(true)}
                        className="px-4 py-1.5 bg-gradient-to-r from-[var(--sk-gold)] to-[#E8C97A] text-[#0A0E16] text-[12px] font-bold rounded-lg shadow-md hover:scale-105 transition-all"
                      >
                        Decision
                      </button>
                    )}
                    <button onClick={() => setReportingProfile(activeConvo.other_user?.name ?? '')} className="text-[var(--sk-ink-dim)] hover:text-white px-2">⋮</button>
                  </div>
                </div>

                {/* SOP 8-Topics UI Progress Bar */}
                <div className="mt-2 w-full overflow-x-auto custom-scrollbar pb-2">
                  <div className="flex items-center gap-2 min-w-max px-1">
                    {PRE_NIKAH_TOPICS.map((topic, idx) => (
                      <div 
                        key={idx} 
                        className={`px-3 py-1 text-[11px] font-medium rounded-full border transition-all cursor-pointer ${
                          idx === currentTopicIndex ? 'bg-[rgba(212,168,83,0.15)] border-[var(--sk-gold)] text-[var(--sk-gold)]' : 
                          idx < currentTopicIndex ? 'bg-[rgba(127,176,122,0.1)] border-[rgba(127,176,122,0.3)] text-[var(--sk-green)]' : 
                          'bg-[#111826] border-[rgba(255,255,255,0.05)] text-[var(--sk-ink-dim)] opacity-50'
                        }`}
                        onClick={() => !isWaliViewOnly && setCurrentTopicIndex(idx)}
                      >
                        {idx < currentTopicIndex ? '✓ ' : ''}{topic}
                      </div>
                    ))}
                    {/* Locked Intimacy Topic */}
                    <div className="px-3 py-1 text-[11px] font-medium rounded-full bg-[#111826] border border-red-500/20 text-red-400/70 ml-2 flex items-center gap-1 cursor-not-allowed" title="Closeness/intimacy is an after-nikah topic only.">
                      🔒 Closeness (Post-Nikah)
                    </div>
                  </div>
                </div>
                
                {/* Pinned Messages Bar */}
                <AnimatePresence>
                  {pinnedMessages.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[rgba(212,168,83,0.05)] border border-[rgba(212,168,83,0.15)] rounded-lg p-2.5 flex items-center gap-3">
                      <span className="text-[var(--sk-gold)] text-[14px]">📌</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-[var(--sk-gold)] font-bold mb-0.5">Pinned Message</div>
                        <div className="text-[12px] text-[#EDE7DA] truncate">{pinnedMessages[0].text}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col gap-4 relative">
                {messagesLoading ? (
                  <div className="flex-1 flex items-center justify-center"><span className="text-[var(--sk-gold)] animate-spin text-2xl">⚙</span></div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-60">
                    <span className="text-[40px] mb-2">✉</span>
                    <p className="text-[15px] font-serif text-[var(--sk-gold)] mb-1">No messages yet.</p>
                    <p className="text-[12px] text-[var(--sk-ink-dim)]">Start the conversation with a gentle greeting.</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg, i) => {
                      const showAvatar = msg.sender === 'them' && (i === 0 || messages[i-1].sender === 'me' || messages[i-1].msg_type === 'system');
                      const isPinned = pinnedMessages.some(p => p.id === msg.id);

                      return (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} w-full relative z-10 group`}
                          onMouseEnter={() => setHoveredMsgId(msg.id)}
                          onMouseLeave={() => setHoveredMsgId(null)}
                        >
                          <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.sender === 'them' && (
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#D4A853] to-[#A37B31] flex items-center justify-center text-[12px] font-serif font-bold text-[#0A0E16] shrink-0 mb-5 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                {activeConvo.other_user?.initial}
                              </div>
                            )}
                            
                            <div className="flex flex-col gap-1 relative">
                              {/* Sender Role Label (Family Chat feature) */}
                              {msg.sender === 'them' && (
                                <div className="text-[10px] text-purple-400 mb-0.5 ml-1">{msg.senderName} ({msg.senderRole})</div>
                              )}
                              
                              {/* Pin Indicator */}
                              {isPinned && <div className="text-[10px] text-[var(--sk-gold)] mb-0.5 flex items-center gap-1"><span className="text-[12px]">📌</span> Pinned</div>}

                              <div className={`px-5 py-3 text-[14px] leading-[1.6] shadow-sm relative ${
                                msg.sender === 'me'
                                  ? 'bg-gradient-to-br from-[#D4AF37] to-[#C19825] text-[#0A0E16] rounded-[20px] rounded-br-[4px]'
                                  : 'bg-[#161D2C] border border-[rgba(255,255,255,0.05)] text-[#EDE7DA] rounded-[20px] rounded-bl-[4px]'
                              }`}>
                                {msg.text}

                                {/* Message Actions (Hover) */}
                                <AnimatePresence>
                                  {hoveredMsgId === msg.id && (
                                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} 
                                      className={`absolute top-0 -translate-y-1/2 flex items-center gap-1 bg-[#111826] border border-[rgba(255,255,255,0.1)] rounded-full p-1 shadow-lg ${msg.sender === 'me' ? '-left-16' : '-right-16'}`}>
                                      <button onClick={() => togglePin(msg)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] text-[12px]" title="Pin">📌</button>
                                      <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] text-[12px]" title="React">❤️</button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <div className={`flex items-center gap-1.5 text-[10px] text-[var(--sk-ink-dim)] px-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <span>{msg.time}</span>
                                {msg.sender === 'me' && <span className="text-[12px]">{msg.status === 'sent' ? '✓' : msg.status === 'delivered' ? '✓✓' : '✓✓'}</span>}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
                
                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-2 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4A853] to-[#A37B31] flex items-center justify-center text-[12px] font-bold text-[#0A0E16] shrink-0">{activeConvo.other_user?.initial}</div>
                      <div className="bg-[#161D2C] border border-[rgba(255,255,255,0.05)] rounded-[20px] rounded-bl-[4px] px-4 py-3 flex items-center gap-1">
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-[var(--sk-ink-dim)] rounded-full" />
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-[var(--sk-ink-dim)] rounded-full" />
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-[var(--sk-ink-dim)] rounded-full" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={bottomRef} className="h-4" />
              </div>

              {/* Composer */}
              <div className="p-4 md:p-6 bg-[#0A0E16] border-t border-[rgba(255,255,255,0.05)] z-20">

                  <form onSubmit={handleSend} className="flex items-end gap-3 max-w-4xl mx-auto">
                    <div className="flex-1 bg-[#111826] border border-[rgba(255,255,255,0.08)] focus-within:border-[rgba(212,168,83,0.5)] focus-within:shadow-[0_0_15px_rgba(212,168,83,0.1)] rounded-[20px] p-2 flex items-end transition-all">
                      <button type="button" className="p-2.5 text-[var(--sk-ink-dim)] hover:text-[var(--sk-gold)] hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-colors shrink-0">📎</button>
                      <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Write your message..." className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#EDE7DA] py-2.5 px-2 max-h-[120px] resize-none custom-scrollbar" rows={1} style={{ minHeight: '44px' }} />
                      <button type="button" className="p-2.5 text-[var(--sk-ink-dim)] hover:text-[var(--sk-gold)] hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-colors shrink-0">🎤</button>
                    </div>
                    <button type="submit" disabled={!input.trim() || sending} className="w-[52px] h-[52px] shrink-0 flex items-center justify-center bg-gradient-to-br from-[#D4AF37] to-[#B8942B] text-[#0A0E16] rounded-full disabled:opacity-50 transition-all shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:scale-105">
                      {sending ? <span className="animate-spin">⚙</span> : <span className="text-[20px] ml-1">➤</span>}
                    </button>
                  </form>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Photo Viewer */}
      <AnimatePresence>
        {viewingPhotoUrl && <SakinahSecurePhotoViewer photoUrl={viewingPhotoUrl} onClose={() => setViewingPhotoUrl(null)} viewerId={auth?.email} viewerName={auth?.email?.split('@')[0] || 'Viewer'} photoId={viewingPhotoUrl} />}
      </AnimatePresence>

      {/* SOP Decision Modal */}
      <AnimatePresence>
        {showDecisionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0E16]/80 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#111826] border border-[rgba(212,168,83,0.2)] rounded-2xl p-6 max-w-[400px] w-full relative">
              <button onClick={() => setShowDecisionModal(false)} className="absolute top-4 right-4 text-[var(--sk-ink-dim)] hover:text-white">✕</button>
              <h3 className="font-serif text-[22px] text-[var(--sk-gold)] mb-2">The Decision</h3>
              <p className="text-[13px] text-[var(--sk-ink-dim)] mb-6">Choose your path forward with dignity. Raya will help coordinate the next steps without pressure.</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => { setShowDecisionModal(false); }}
                  className="w-full text-left p-4 rounded-xl border border-[rgba(212,168,83,0.3)] bg-gradient-to-r from-[rgba(212,168,83,0.05)] to-transparent hover:bg-[rgba(212,168,83,0.1)] transition-colors group"
                >
                  <div className="text-[15px] font-bold text-[var(--sk-gold)] flex items-center justify-between">Proceed <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span></div>
                  <div className="text-[12px] text-[var(--sk-ink-dim)] mt-1">Coordinate a family-present next step toward Nikah.</div>
                </button>

                <button 
                  onClick={() => { setShowDecisionModal(false); }}
                  className="w-full text-left p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-colors group"
                >
                  <div className="text-[15px] font-bold text-[#EDE7DA] flex items-center justify-between">Pause <span className="opacity-0 group-hover:opacity-100 transition-opacity">⏸</span></div>
                  <div className="text-[12px] text-[var(--sk-ink-dim)] mt-1">Take time for reflection or Istikhara. No pressure.</div>
                </button>

                <button 
                  onClick={() => { setShowDecisionModal(false); }}
                  className="w-full text-left p-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors group"
                >
                  <div className="text-[15px] font-bold text-red-400 flex items-center justify-between">Close <span className="opacity-0 group-hover:opacity-100 transition-opacity">✕</span></div>
                  <div className="text-[12px] text-red-400/70 mt-1">A clean, respectful end with a dua. No blame.</div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <SakinahReportModal isOpen={!!reportingProfile} onClose={() => setReportingProfile(null)} profileName={reportingProfile ?? ''} />
    </SakinahLayout>
  );
};
