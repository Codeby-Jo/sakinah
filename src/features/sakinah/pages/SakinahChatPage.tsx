import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahLayout, SakinahReportModal } from '../components';
import { getMyConversations, getConversationMessages, sendMessage } from '../services/sakinahApi';

/* ── Types ─────────────────────────────────────────────────── */
interface OtherUser {
  id: number;
  name: string;
  initial: string;
  age: number | null;
  city: string | null;
  occupation: string | null;
}

interface LastMessage {
  text: string;
  time: string;
  is_mine: boolean;
}

interface ConvoItem {
  conversation_id: string;
  status: string;
  matchflow_step: string;
  photo_unlocked: boolean;
  created_at: string | null;
  other_user: OtherUser | null;
  last_message: LastMessage | null;
}

interface Message {
  id: number;
  text: string;
  msg_type: string;
  sender: 'me' | 'them';
  time: string;
}

/* ── Component ─────────────────────────────────────────────── */
export const SakinahChatPage: React.FC = () => {
  const { isWaliViewOnly } = useOnboarding();

  const [conversations, setConversations] = useState<ConvoItem[]>([]);
  const [activeConvo, setActiveConvo]     = useState<ConvoItem | null>(null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [sending, setSending]             = useState(false);
  const [showReminder, setShowReminder]   = useState(false);
  const [showPhotoRequest, setShowPhotoRequest] = useState(false);
  const [reportingProfile, setReportingProfile] = useState<string | null>(null);
  const [error, setError]                 = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Load conversation list ──────────────────────────────── */
  const loadConversations = useCallback(async () => {
    try {
      const data: any = await getMyConversations();
      setConversations(data.conversations ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load conversations');
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  /* ── Load messages for active convo ─────────────────────── */
  const loadMessages = useCallback(async (convoId: string) => {
    try {
      const data: any = await getConversationMessages(convoId);
      setMessages(data.messages ?? []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch {}
  }, []);

  /* ── Auto-poll every 3 s while a convo is open ──────────── */
  useEffect(() => {
    if (!activeConvo) { clearInterval(pollRef.current!); return; }
    loadMessages(activeConvo.conversation_id);
    pollRef.current = setInterval(() => loadMessages(activeConvo.conversation_id), 3000);
    return () => clearInterval(pollRef.current!);
  }, [activeConvo, loadMessages]);

  /* ── Open conversation ───────────────────────────────────── */
  const openConvo = (c: ConvoItem) => {
    setActiveConvo(c);
    setShowReminder(true);
    setMessages([]);
  };

  /* ── Send message ────────────────────────────────────────── */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConvo || sending) return;
    setSending(true);
    try {
      const msg: any = await sendMessage(activeConvo.conversation_id, input.trim());
      setMessages(prev => [...prev, msg]);
      setInput('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      loadConversations();            // refresh last-message in sidebar
    } catch (e: any) {
      setError(e.message ?? 'Send failed');
    } finally {
      setSending(false);
    }
  };

  /* ── Photo request ───────────────────────────────────────── */
  const confirmPhotoRequest = async () => {
    if (!activeConvo) return;
    setShowPhotoRequest(false);
    try {
      const msg: any = await sendMessage(activeConvo.conversation_id, 'Requested to view profile photos', 'system');
      setMessages(prev => [...prev, msg]);
    } catch {}
  };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <SakinahLayout>
      <div className="h-[calc(100vh-60px)] md:h-screen bg-[#0A0E16] flex flex-col md:flex-row font-sans text-[#EDE7DA] overflow-hidden">

        {/* ── Sidebar: Conversation List ── */}
        <div className={`w-full md:w-[320px] lg:w-[380px] border-r border-[rgba(255,255,255,0.05)] bg-[#0C111A] flex flex-col ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
            <h2 className="font-serif text-[18px] text-[#EDE7DA]">Messages</h2>
            {conversations.length > 0 && (
              <span className="text-[11px] text-[var(--sk-gold)] bg-[rgba(212,168,83,0.1)] px-2 py-0.5 rounded-full">
                {conversations.length} Active
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading && conversations.length === 0 && (
              <div className="p-6 text-center text-[var(--sk-ink-faint)] text-[13px]">Loading…</div>
            )}

            {!loading && conversations.length === 0 && (
              <div className="p-6 text-center">
                <div className="text-[40px] mb-3">✉</div>
                <p className="text-[13px] text-[var(--sk-ink-dim)]">No conversations yet. When both parties express mutual interest, a conversation will appear here.</p>
              </div>
            )}

            {conversations.map(c => (
              <div
                key={c.conversation_id}
                onClick={() => openConvo(c)}
                className={`p-4 border-b border-[rgba(255,255,255,0.02)] cursor-pointer transition-colors flex items-center gap-3 ${activeConvo?.conversation_id === c.conversation_id ? 'bg-[#161D2C]' : 'hover:bg-[#111826]'}`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--sk-gold)] to-[#A37B31] flex items-center justify-center text-[18px] font-serif text-[#0A0E16] font-bold">
                    {c.other_user?.initial ?? '?'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-medium text-[15px] truncate">{c.other_user?.name ?? 'Unknown'}</h4>
                    <span className="text-[10px] text-[var(--sk-ink-faint)] shrink-0 ml-2">{c.last_message?.time ?? ''}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-[12px] text-[var(--sk-ink-dim)] truncate">
                      {c.last_message
                        ? (c.last_message.is_mine ? 'You: ' : '') + c.last_message.text
                        : <span className="italic text-[var(--sk-gold-dim)]">Say salaam 🌙</span>}
                    </p>
                    <span className="text-[9px] text-[var(--sk-gold)] px-1.5 py-0.5 rounded-full bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.15)] shrink-0">
                      {c.matchflow_step}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main: Messages ── */}
        <div className={`flex-1 flex flex-col bg-gradient-to-b from-[#0A0E16] to-[#0d121c] relative ${!activeConvo ? 'hidden md:flex' : 'flex'}`}>
          {!activeConvo ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 rounded-full bg-[rgba(212,168,83,0.05)] border border-[rgba(212,168,83,0.1)] flex items-center justify-center text-[var(--sk-gold)] text-[32px] mb-4">
                ✉
              </div>
              <h3 className="font-serif text-[24px] text-[var(--sk-gold)] mb-2">Your Conversations</h3>
              <p className="text-[14px] text-[var(--sk-ink-dim)] max-w-[300px]">Select a conversation to start messaging securely.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[rgba(255,255,255,0.05)] bg-[#0C111A]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveConvo(null)} className="md:hidden text-[var(--sk-gold)] p-2 -ml-2">←</button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sk-gold)] to-[#A37B31] flex items-center justify-center text-[16px] font-serif text-[#0A0E16] font-bold">
                    {activeConvo.other_user?.initial ?? '?'}
                  </div>
                  <div>
                    <h3 className="font-medium text-[16px] leading-tight text-[var(--sk-ink)]">{activeConvo.other_user?.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[var(--sk-ink-faint)]">
                        {activeConvo.other_user?.age ? `${activeConvo.other_user.age} yrs` : ''}
                        {activeConvo.other_user?.city ? ` · ${activeConvo.other_user.city}` : ''}
                        {activeConvo.other_user?.occupation ? ` · ${activeConvo.other_user.occupation}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {!isWaliViewOnly && (
                    <button
                      onClick={() => setShowPhotoRequest(true)}
                      className="text-[11px] px-3 py-1.5 border border-[var(--sk-gold)] text-[var(--sk-gold)] rounded-full hover:bg-[rgba(212,168,83,0.1)] transition-colors"
                    >
                      Request Photo
                    </button>
                  )}
                  <button
                    onClick={() => setReportingProfile(activeConvo.other_user?.name ?? '')}
                    className="text-[14px] w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors opacity-70 hover:opacity-100"
                    title="Report Profile"
                  >🚩</button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col gap-4">
                {messages.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <span className="text-[40px] mb-4">🌙</span>
                    <p className="text-[14px] text-[var(--sk-ink-dim)] max-w-[260px]">
                      Be the first to say salaam. All messages are private and halal-compliant.
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id ?? i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.msg_type === 'system' ? 'items-center' : msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.msg_type === 'system' ? (
                      <div className="text-[11px] text-[var(--sk-gold-dim)] bg-[rgba(212,168,83,0.05)] px-4 py-1.5 rounded-full border border-[rgba(212,168,83,0.1)] my-2">
                        {msg.text}
                      </div>
                    ) : (
                      <>
                        <div className={`max-w-[75%] md:max-w-[60%] p-3 rounded-[16px] text-[14px] leading-relaxed ${
                          msg.sender === 'me'
                            ? 'bg-[var(--sk-gold)] text-[#0A0E16] rounded-br-sm'
                            : 'bg-[#161D2C] border border-[rgba(255,255,255,0.05)] text-[#EDE7DA] rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-[var(--sk-ink-faint)] mt-1 px-1">{msg.time}</span>
                      </>
                    )}
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mx-4 mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] text-center">
                  {error}
                  <button onClick={() => setError('')} className="ml-2 underline">dismiss</button>
                </div>
              )}

              {/* Input */}
              <div className="p-4 bg-[#0C111A] border-t border-[rgba(255,255,255,0.05)]">
                {isWaliViewOnly ? (
                  <div className="flex items-center gap-3 bg-[rgba(201,138,138,0.05)] border border-[rgba(201,138,138,0.2)] rounded-[16px] p-3">
                    <span className="text-[20px] text-[var(--sk-rose)]">🔒</span>
                    <p className="text-[13px] text-[var(--sk-rose)] font-medium">View Only Mode — Wali cannot send messages.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSend} className="flex items-center gap-2 bg-[#111826] border border-[rgba(255,255,255,0.06)] focus-within:border-[var(--sk-gold)] rounded-[16px] p-1 pr-2 transition-colors">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Type a message…"
                      className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--sk-ink)] py-2 px-3"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || sending}
                      className="p-2 w-8 h-8 flex items-center justify-center bg-[var(--sk-gold)] text-[#0A0E16] rounded-full disabled:opacity-50 transition-all"
                    >
                      {sending ? '…' : '➤'}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

          {/* Photo Request Modal */}
          <AnimatePresence>
            {showPhotoRequest && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-[#0A0E16]/80 backdrop-blur-md flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                  className="bg-[#111826] border border-[rgba(212,168,83,0.3)] rounded-[24px] p-6 max-w-[400px] w-full text-center shadow-[0_0_50px_rgba(212,168,83,0.1)]">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(212,168,83,0.1)] flex items-center justify-center text-[24px]">🔐</div>
                  <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">Photo Request Audit</h3>
                  <p className="text-[13px] text-[var(--sk-ink-dim)] mb-6 leading-relaxed">
                    Sakinah logs all photo requests to ensure accountability and maintain a high-trust environment. This will be recorded.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowPhotoRequest(false)} className="flex-1 py-3 border border-[rgba(255,255,255,0.1)] rounded-xl text-[13px] hover:bg-[rgba(255,255,255,0.05)] transition-colors">Cancel</button>
                    <button onClick={confirmPhotoRequest} className="flex-1 py-3 bg-[var(--sk-gold)] text-[#0A0E16] rounded-xl text-[13px] font-medium hover:bg-[#E8C97A] transition-colors">Confirm & Request</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Islamic Reminder Modal */}
          <AnimatePresence>
            {showReminder && activeConvo && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[60] bg-[#0A0E16]/90 backdrop-blur-md flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                  className="bg-gradient-to-b from-[#111826] to-[#0A0E16] border border-[rgba(212,168,83,0.3)] rounded-[24px] p-8 max-w-[420px] text-center shadow-[0_0_50px_rgba(212,168,83,0.1)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--sk-gold)] to-transparent opacity-50" />
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgba(212,168,83,0.1)] flex items-center justify-center">
                    <span className="text-[28px]">🌙</span>
                  </div>
                  <h3 className="font-serif text-[24px] text-[var(--sk-gold)] mb-4">Islamic Reminder</h3>
                  <p className="text-[14px] text-[var(--sk-ink)] font-light leading-relaxed mb-8 italic px-4">
                    "May Allah place barakah in your intentions. Please communicate respectfully, honestly, and in accordance with Islamic values."
                  </p>
                  <button
                    onClick={() => setShowReminder(false)}
                    className="w-full bg-gradient-to-r from-[var(--sk-gold)] to-[#E8C97A] text-[#0A0E16] font-medium py-3.5 rounded-xl shadow-[0_0_20px_rgba(212,168,83,0.3)] hover:shadow-[0_0_30px_rgba(212,168,83,0.5)] transition-all hover:-translate-y-1"
                  >
                    I Understand
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SakinahReportModal
        isOpen={!!reportingProfile}
        onClose={() => setReportingProfile(null)}
        profileName={reportingProfile ?? ''}
      />
    </SakinahLayout>
  );
};
