import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { getProgress } from '../services/sakinahProgress';
import { SakinahLayout, SakinahReportModal, SakinahSecurePhotoViewer } from '../components';
import { getMyConversations, getConversationMessages, sendMessage, pinMessage, unpinMessage } from '../services/sakinahApi';
import type { PinnedMessage, FamilyMember } from '../types/sakinah.types';
import { storage } from '@/config/firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  first_photo_shared_by?: string; // New
}

interface Message {
  id: string;
  text: string;
  msg_type: string;
  sender: 'me' | 'them' | 'system';
  senderName?: string;
  senderRole?: string; // e.g., "Wali"
  time: string;
  photo_url?: string;
  audio_url?: string;
  reply_to_text?: string;
  reply_to_sender?: string;
  status?: 'sent' | 'delivered' | 'read';
  reaction?: string; // New
}

const SakinahVoiceMessage: React.FC<{ audioUrl: string, sender: 'me' | 'them' }> = ({ audioUrl, sender }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 w-48 md:w-56">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <button 
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-105 ${sender === 'me' ? 'bg-black/10 text-[#0A0E16] shadow-inner border border-black/5' : 'bg-[var(--sk-gold)] text-[#0A0E16] shadow-md'}`}
      >
        <span className={`text-[18px] ${isPlaying ? '' : 'ml-1'}`}>{isPlaying ? '⏸' : '▶'}</span>
      </button>
      <div className="flex-1 flex flex-col justify-center">
        <div className={`h-1.5 rounded-full w-full relative overflow-hidden ${sender === 'me' ? 'bg-black/10' : 'bg-[#0A0E16]/40'}`}>
          <div 
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-75 ${sender === 'me' ? 'bg-[#0A0E16]/80' : 'bg-[var(--sk-gold)]'}`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-1.5">
          <div className={`text-[10px] font-medium tracking-wide ${sender === 'me' ? 'text-[#0A0E16]/70' : 'text-[#EDE7DA]/50'}`}>Voice Note</div>
          <div className={`text-[10px] font-medium ${sender === 'me' ? 'text-[#0A0E16]/70' : 'text-[#EDE7DA]/50'}`}>
            {formatTime(audioRef.current?.currentTime || 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  
  const [viewingPhoto, setViewingPhoto] = useState<{url: string, id: string} | null>(null);
  const [reportingProfile, setReportingProfile] = useState<{id: string, name: string} | null>(null);
  const [isTyping, setIsTyping]           = useState(false);

  const isConvoClosed = (() => {
    if (!messages) return false;
    const decisions = messages.filter(m => m.msg_type === 'decision_close' || m.msg_type === 'decision_reopen');
    if (decisions.length === 0) return false;
    return decisions[decisions.length - 1].msg_type === 'decision_close';
  })();

  const closedByMe = (() => {
    if (!messages) return false;
    const decisions = messages.filter(m => m.msg_type === 'decision_close' || m.msg_type === 'decision_reopen');
    if (decisions.length === 0) return false;
    const last = decisions[decisions.length - 1];
    return last.msg_type === 'decision_close' && last.sender === 'me';
  })();
  const [hoveredMsgId, setHoveredMsgId]   = useState<string | null>(null);
  const [replyingTo, setReplyingTo]       = useState<Message | null>(null);
  const [unlockedPhotoIds, setUnlockedPhotoIds] = useState<Record<string, boolean>>({});

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // New SOP states
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  // Etiquette Modal
  const [showEtiquetteModal, setShowEtiquetteModal] = useState(false);
  const [pendingConvoToOpen, setPendingConvoToOpen] = useState<ConvoItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const PRE_NIKAH_TOPICS = [
    'Parents & Family', 'Work', 'Friends', 'Habits', 
    'Self-image', 'Responsibility', 'Expectations', 'Finances'
  ];

  /* ── Load conversation list ──────────────────────────────── */
  const loadConversations = useCallback(async () => {
    try {
      const data: any = await getMyConversations();
      setConversations(data.conversations ?? []);
    } catch (e: any) {
      console.error(e.message ?? 'Failed to load conversations');
      setConversations([]);
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
      setIsTyping(false);
      
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

      if (data.first_photo_shared_by) {
        setActiveConvo(prev => prev ? { ...prev, first_photo_shared_by: data.first_photo_shared_by } : null);
      }

      if (isInitial) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
      }
    } catch (err: any) {
      console.error(err);
      setMessages([]);
    } finally {
      if (isInitial) setMessagesLoading(false);
    }
  }, []);

  /* ── Auto-poll active conversation ───────────────────────── */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeConvo) {
      interval = setInterval(async () => {
        try {
          const data: any = await getConversationMessages(activeConvo.conversation_id);
          const loadedMessages = (data.messages ?? []).map((m: any) => ({
            ...m,
            id: m.id.toString(),
            senderName: m.sender === 'them' ? 'Contact' : 'Me'
          }));

          setMessages(prev => {
            if (loadedMessages.length > prev.length) {
              const latestMsg = loadedMessages[loadedMessages.length - 1];
              if (latestMsg.sender === 'them') {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log('Audio play failed', e));
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
              }
              return loadedMessages;
            }
            return prev;
          });
          
          if (data.first_photo_shared_by && !activeConvo.first_photo_shared_by) {
            setActiveConvo(prev => prev ? { ...prev, first_photo_shared_by: data.first_photo_shared_by } : null);
          }
        } catch (e) {
          // ignore polling errors
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeConvo]);

  /* ── Open conversation ───────────────────────────────────── */
  const executeOpenConvo = (c: ConvoItem) => {
    setActiveConvo(c);
    setMessages([]);
    loadMessages(c.conversation_id, true);
    setConversations(prev => prev.map(conv => conv.conversation_id === c.conversation_id ? { ...conv, unread_count: 0 } : conv));
  };

  const openConvo = (c: ConvoItem) => {
    const hasSeen = localStorage.getItem(`etiquette_seen_${c.conversation_id}`);
    if (!hasSeen) {
      setPendingConvoToOpen(c);
      setShowEtiquetteModal(true);
      return;
    }
    executeOpenConvo(c);
  };

  /* ── Voice Recording ─────────────────────────────────────── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Microphone access is required to send voice messages.");
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingDuration(0);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording || !activeConvo) return;

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        setIsRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        mediaRecorderRef.current!.stream.getTracks().forEach(track => track.stop());

        // We convert Blob to Base64 to send it safely over the JSON API for this prototype
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          
          setSending(true);
          const tempId = `temp-audio-${Date.now()}`;
          const optimisticMsg: Message = {
            id: tempId,
            text: '',
            msg_type: 'audio',
            sender: 'me',
            senderName: auth?.email?.split('@')[0] || 'Me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            audio_url: base64Audio
          };
          
          setMessages(prev => [...prev, optimisticMsg]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

          try {
            const msg: any = await sendMessage(activeConvo.conversation_id, '', 'audio', undefined, base64Audio);
            setMessages(prev => prev.map(m => m.id === tempId ? { ...msg, id: msg.id.toString(), status: 'delivered' } : m));
          } catch (err) {
            console.error('Audio send failed:', err);
            setMessages(prev => prev.filter(m => m.id !== tempId));
          } finally {
            setSending(false);
            setRecordingDuration(0);
            resolve();
          }
        };
      };

      mediaRecorderRef.current!.stop();
    });
  };

  /* ── Send message ────────────────────────────────────────── */
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvo) return;
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';

    setSending(true);
    
    try {
      // Compress image using Canvas to fit in Firestore
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise((resolve) => (reader.onload = resolve));
      
      const img = new Image();
      img.src = reader.result as string;
      await new Promise((resolve) => (img.onload = resolve));
      
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Compress to JPEG format with 0.6 quality (approx 50-100kb)
      const downloadURL = canvas.toDataURL('image/jpeg', 0.6);
      
      const tempId = `temp-photo-${Date.now()}`;
      const optimisticMsg: Message = {
        id: tempId,
        text: '',
        msg_type: 'photo',
        sender: 'me',
        senderName: auth?.email?.split('@')[0] || 'Me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        photo_url: downloadURL
      };
      
      setMessages(prev => [...prev, optimisticMsg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

      const msg: any = await sendMessage(activeConvo.conversation_id, '', 'photo', downloadURL);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...msg, id: msg.id.toString(), status: 'delivered' } : m));
      
      if (msg.first_photo_shared_by && !activeConvo.first_photo_shared_by) {
        setActiveConvo(prev => prev ? { ...prev, first_photo_shared_by: msg.first_photo_shared_by } : null);
      }
    } catch (err: any) {
      console.error('Photo upload failed:', err);
    } finally {
      setSending(false);
    }
  };

  // Simulate real-time read receipts and typing indicator for demo
  useEffect(() => {
    if (!activeConvo) return;
    
    // Read receipts
    const deliveredMsgs = messages.filter(m => m.sender === 'me' && m.status === 'delivered');
    if (deliveredMsgs.length > 0) {
      const timer = setTimeout(() => {
        setMessages(prev => prev.map(m => m.sender === 'me' && m.status === 'delivered' ? { ...m, status: 'read' } : m));
      }, 3000); 
      return () => clearTimeout(timer);
    }

    // Typing indicator simulation after I send a message
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'me') {
      const typingTimer1 = setTimeout(() => setIsTyping(true), 1500);
      const typingTimer2 = setTimeout(() => setIsTyping(false), 5000);
      return () => { clearTimeout(typingTimer1); clearTimeout(typingTimer2); };
    } else {
      setIsTyping(false);
    }
  }, [messages, activeConvo]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !activeConvo || sending) return;
    
    const messageText = input.trim();
    setInput(''); 
    setSending(true);
    
    const replyText = replyingTo?.text;
    const replySender = replyingTo?.senderName || (replyingTo?.sender === 'them' ? activeConvo.other_user?.name : 'Me');
    setReplyingTo(null);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      text: messageText,
      msg_type: 'text',
      sender: 'me',
      senderName: auth?.email?.split('@')[0] || 'Me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      reply_to_text: replyText,
      reply_to_sender: replySender
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const msg: any = await sendMessage(activeConvo.conversation_id, messageText, 'text', undefined, undefined, replyText, replySender);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...msg, id: msg.id.toString(), status: 'delivered' } : m));
    } catch (e: any) {
      console.error(e.message ?? 'Send failed');
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInput(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleDecision = async (decisionType: string, messageText: string) => {
    if (!activeConvo || sending) return;
    setSending(true);
    setShowDecisionModal(false);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      text: messageText,
      msg_type: decisionType,
      sender: 'me',
      senderName: auth?.email?.split('@')[0] || 'Me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const msg: any = await sendMessage(activeConvo.conversation_id, messageText, decisionType);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...msg, id: msg.id.toString(), status: 'delivered' } : m));
    } catch (e: any) {
      console.error(e.message ?? 'Decision send failed');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleReopenConvo = async () => {
    if (!activeConvo || sending) return;
    setSending(true);
    try {
      const msg: any = await sendMessage(activeConvo.conversation_id, "Conversation reopened.", "decision_reopen");
      setMessages(prev => [...prev, { ...msg, id: msg.id.toString(), status: 'delivered', sender: 'me', msg_type: 'decision_reopen' }]);
    } catch (e: any) {
      console.error('Reopen failed');
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
                      <div className="text-[11px] text-[var(--sk-gold)] flex items-center gap-1.5 opacity-80 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#10B981]"></span>
                        Online • Last seen today at {new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
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
                    <button onClick={() => setReportingProfile({id: activeConvo.other_user?.id ?? '', name: activeConvo.other_user?.name ?? ''})} className="text-[var(--sk-ink-dim)] hover:text-white px-2">⋮</button>
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
                    <button 
                      className="px-3 py-1 text-[11px] font-medium rounded-full bg-[#111826] border border-red-500/20 text-red-400/70 ml-2 flex items-center gap-1 cursor-not-allowed hover:bg-red-500/5 transition-colors"
                      onClick={() => {
                        if (!activeConvo) return;
                        setMessages(prev => [...prev, {
                          id: `temp-warning-${Date.now()}`,
                          text: "🔒 To maintain Islamic modesty, discussions regarding closeness and intimacy are strictly locked until after Nikah. Please focus on the provided topics.",
                          msg_type: 'system',
                          sender: 'them',
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        }]);
                        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
                      }}
                    >
                      🔒 Closeness (Post-Nikah)
                    </button>
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
                {/* Sticky Watermark replaced by inline system message */}

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
                        <React.Fragment key={msg.id}>
                          {msg.msg_type === 'system' || msg.msg_type.startsWith('decision_') ? (
                            <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 100 }} className="w-full flex justify-center my-8 relative z-20">
                              <div className={`relative w-full px-8 py-6 rounded-[24px] text-[14px] tracking-wide font-medium text-center max-w-[85%] md:max-w-[400px] leading-relaxed shadow-2xl flex flex-col items-center gap-3 backdrop-blur-xl border group transition-all ${
                                msg.msg_type === 'decision_proceed' ? 'bg-gradient-to-b from-[#161D2C]/80 to-[#111826]/90 border-[rgba(212,168,83,0.4)] text-[var(--sk-gold)] shadow-[0_10px_40px_rgba(212,168,83,0.15)]' :
                                msg.msg_type === 'decision_pause' ? 'bg-[#161D2C]/80 border-[rgba(255,255,255,0.1)] text-[#EDE7DA] shadow-[0_10px_30px_rgba(0,0,0,0.5)]' :
                                msg.msg_type === 'decision_close' ? 'bg-[#161D2C]/80 border-[rgba(239,68,68,0.2)] text-red-400 shadow-[0_10px_30px_rgba(239,68,68,0.1)] hover:border-red-500/50' :
                                'bg-[rgba(212,168,83,0.05)] border-[rgba(212,168,83,0.2)] text-[var(--sk-gold)] uppercase text-[11px] py-3 rounded-full shadow-md'
                              }`}
                                onMouseEnter={() => setHoveredMsgId(msg.id)}
                                onMouseLeave={() => setHoveredMsgId(null)}
                              >
                                {/* Animated Icons */}
                                {msg.msg_type === 'decision_proceed' && (
                                  <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="relative mb-2">
                                    <div className="absolute inset-0 bg-[var(--sk-gold)] blur-[20px] opacity-30 rounded-full"></div>
                                    <span className="text-[36px] relative z-10 drop-shadow-[0_0_15px_rgba(212,168,83,0.5)]">💍</span>
                                  </motion.div>
                                )}
                                {msg.msg_type === 'decision_pause' && (
                                  <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="mb-2">
                                    <span className="text-[32px] opacity-80">⏸</span>
                                  </motion.div>
                                )}
                                {msg.msg_type === 'decision_close' && (
                                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="mb-2">
                                    <span className="text-[32px] opacity-80">🕊</span>
                                  </motion.div>
                                )}
                                
                                <span className={msg.msg_type === 'system' ? '' : 'font-serif text-[15px]'}>
                                  {msg.text.replace('[SENDER]', msg.sender === 'me' ? 'You' : (msg.senderName || 'They'))}
                                </span>
                                
                                {msg.msg_type === 'decision_proceed' && (
                                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[var(--sk-gold)] to-transparent opacity-50"></div>
                                )}

                                {/* Hover Remove Option for Close Decision */}
                                {msg.msg_type === 'decision_close' && msg.sender === 'me' && isConvoClosed && (
                                  <button 
                                    onClick={handleReopenConvo} 
                                    className="absolute -top-3 -right-3 bg-[#0A0E16] border border-red-500/50 text-red-400 rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:scale-110 hover:bg-red-500 hover:text-white transition-all z-30 opacity-70 hover:opacity-100 cursor-pointer"
                                    title="Undo decision and reopen chat"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
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
                                  {/* Reply Preview */}
                                  {msg.reply_to_text && (
                                    <div className={`mb-2 pl-2 border-l-2 text-[12px] opacity-80 overflow-hidden ${msg.sender === 'me' ? 'border-[#0A0E16]/40 text-[#0A0E16]' : 'border-[var(--sk-gold)] text-[#EDE7DA]'}`}>
                                      <div className="font-bold text-[10px] uppercase mb-0.5 truncate">{msg.reply_to_sender}</div>
                                      <div className="truncate">{msg.reply_to_text}</div>
                                    </div>
                                  )}

                                {msg.msg_type === 'photo' ? (
                                  <div className="flex flex-col gap-2">
                                    <div 
                                      className="relative w-full max-w-[200px] aspect-[3/4] rounded-lg overflow-hidden cursor-pointer group/photo border border-[rgba(255,255,255,0.1)]"
                                      onClick={() => setViewingPhoto({url: msg.photo_url || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800', id: msg.id})}
                                    >
                                      {!unlockedPhotoIds[msg.id] && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-10 flex flex-col items-center justify-center transition-opacity group-hover/photo:opacity-80">
                                          <span className="text-[32px] text-[var(--sk-gold)] mb-2">🔐</span>
                                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Tap to unlock</span>
                                        </div>
                                      )}
                                      <img src={msg.photo_url || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800'} alt="Secure Photo" className={`w-full h-full object-cover ${!unlockedPhotoIds[msg.id] ? 'blur-[10px]' : ''}`} />
                                    </div>
                                    <div className="text-[10px] text-[var(--sk-gold)] font-bold uppercase tracking-widest text-center mt-1 bg-[#111826]/50 rounded px-2 py-1 border border-[rgba(212,168,83,0.2)]">
                                      {msg.text || 'Secure photo shared'}
                                    </div>
                                  </div>
                                ) : msg.msg_type === 'audio' ? (
                                  <SakinahVoiceMessage audioUrl={msg.audio_url || ''} sender={msg.sender} />
                                ) : (
                                  msg.text
                                )}

                                {/* Message Actions (Hover) */}
                                <AnimatePresence>
                                  {hoveredMsgId === msg.id && (
                                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} 
                                      className={`absolute top-0 -translate-y-1/2 flex items-center gap-1 bg-[#111826] border border-[rgba(255,255,255,0.1)] rounded-full p-1 shadow-lg ${msg.sender === 'me' ? '-left-16' : '-right-16'}`}>
                                      <button onClick={() => togglePin(msg)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] text-[12px]" title="Pin">📌</button>
                                      <button onClick={() => setReplyingTo(msg)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] text-[12px]" title="Reply">↩️</button>
                                      <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] text-[12px]" title="React">❤️</button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <div className={`flex items-center gap-1.5 text-[10px] text-[var(--sk-ink-dim)] px-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <span>{msg.time}</span>
                                {msg.sender === 'me' && (
                                  <span className={`text-[12px] font-bold ${msg.status === 'read' ? 'text-blue-400' : 'text-[rgba(255,255,255,0.4)]'}`} title={msg.status}>
                                    {msg.status === 'sent' ? '✓' : '✓✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                          )}
                        </React.Fragment>
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

              {/* Composer Area */}
              {isConvoClosed ? (
                <div className="p-6 bg-[#0A0E16] border-t border-[rgba(255,255,255,0.05)] z-20 flex flex-col items-center justify-center text-center">
                  <p className="text-[14px] text-[var(--sk-ink-dim)] mb-4">This conversation has been closed.</p>
                  {closedByMe ? (
                    <button 
                      onClick={handleReopenConvo} 
                      disabled={sending}
                      className="px-6 py-2.5 rounded-xl border border-[var(--sk-gold)] text-[var(--sk-gold)] text-[13px] font-bold tracking-wider uppercase hover:bg-[var(--sk-gold)] hover:text-[#0A0E16] transition-colors disabled:opacity-50"
                    >
                      {sending ? 'Reopening...' : 'Reopen Conversation'}
                    </button>
                  ) : (
                    <span className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-[13px] font-bold tracking-wider uppercase bg-[#111826]">
                      Waiting for them to reopen
                    </span>
                  )}
                </div>
              ) : isWaliViewOnly ? (
                <div className="p-4 md:p-6 bg-[#0A0E16] border-t border-[rgba(255,255,255,0.05)] z-20 text-center">
                  <span className="text-[12px] text-[var(--sk-ink-dim)] tracking-widest uppercase font-bold">Read Only View</span>
                </div>
              ) : (
                <div className="p-4 md:p-6 bg-[#0A0E16] border-t border-[rgba(255,255,255,0.05)] z-20 flex flex-col gap-2">
                    {/* Reply Preview Banner */}
                    <AnimatePresence>
                      {replyingTo && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center justify-between bg-[#111826] border-l-2 border-[var(--sk-gold)] px-3 py-2 rounded-lg rounded-bl-none max-w-4xl mx-auto w-full">
                          <div className="flex-1 overflow-hidden">
                            <div className="text-[10px] text-[var(--sk-gold)] font-bold uppercase">Replying to {replyingTo.senderName || (replyingTo.sender === 'them' ? activeConvo.other_user?.name : 'Me')}</div>
                            <div className="text-[12px] text-[#EDE7DA] truncate">{replyingTo.text || 'Attachment'}</div>
                          </div>
                          <button onClick={() => setReplyingTo(null)} className="text-[var(--sk-ink-dim)] hover:text-red-400 p-1">✕</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <form onSubmit={handleSend} className="flex items-end gap-3 max-w-4xl mx-auto w-full">
                      <div className="flex-1 bg-[#111826] border border-[rgba(255,255,255,0.05)] rounded-[24px] flex items-center p-1 pl-3 transition-colors focus-within:border-[rgba(212,168,83,0.3)] shadow-inner">
                        {isRecording ? (
                          <div className="flex-1 flex items-center justify-between py-2.5 px-3">
                            <div className="flex items-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                              <span className="text-red-400 font-mono font-medium text-[14px]">
                                {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                              </span>
                            </div>
                            <button type="button" onClick={cancelRecording} className="text-[var(--sk-ink-dim)] hover:text-red-400 font-bold px-3 transition-colors">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <input 
                              type="file" 
                              accept="image/*"
                              ref={fileInputRef} 
                              onChange={handlePhotoUpload}
                              className="hidden" 
                            />
                            <button 
                              type="button" 
                              className="p-2.5 text-[var(--sk-ink-dim)] hover:text-[var(--sk-gold)] hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-colors shrink-0 relative group"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              📎
                            </button>
                            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Write your message..." className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#EDE7DA] py-2.5 px-2 max-h-[120px] resize-none custom-scrollbar" rows={1} style={{ minHeight: '44px' }} />
                            <button type="button" onClick={startRecording} className="p-2.5 text-[var(--sk-ink-dim)] hover:text-[var(--sk-gold)] hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-colors shrink-0">🎤</button>
                          </>
                        )}
                      </div>
                      <button type="button" onClick={isRecording ? stopRecording : handleSend} disabled={(!input.trim() && !isRecording) || sending} className="w-[52px] h-[52px] shrink-0 flex items-center justify-center bg-gradient-to-br from-[#D4AF37] to-[#B8942B] text-[#0A0E16] rounded-full disabled:opacity-50 transition-all shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:scale-105">
                        {sending ? <span className="animate-spin">⚙</span> : (isRecording ? <span className="text-[20px]">✓</span> : <span className="text-[20px] ml-1">➤</span>)}
                      </button>
                    </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Photo Viewer */}
      <AnimatePresence>
        {viewingPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <SakinahSecurePhotoViewer 
              photoUrl={viewingPhoto.url} 
              onClose={() => setViewingPhoto(null)} 
              viewerId={auth?.email || 'viewer'} 
              viewerName={auth?.email?.split('@')[0] || 'Viewer'} 
              photoId={viewingPhoto.id}
              onUnlock={() => setUnlockedPhotoIds(prev => ({...prev, [viewingPhoto.id]: true}))}
            />
          </motion.div>
        )}
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
                  onClick={() => handleDecision('decision_proceed', `[SENDER] expressed serious interest and would like to proceed.`)}
                  className="w-full text-left p-4 rounded-xl border border-[rgba(212,168,83,0.3)] bg-gradient-to-r from-[rgba(212,168,83,0.05)] to-transparent hover:bg-[rgba(212,168,83,0.1)] transition-colors group"
                >
                  <div className="text-[15px] font-bold text-[var(--sk-gold)] flex items-center justify-between">Proceed <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span></div>
                  <div className="text-[12px] text-[var(--sk-ink-dim)] mt-1">Coordinate a family-present next step toward Nikah.</div>
                </button>

                <button 
                  onClick={() => handleDecision('decision_pause', `[SENDER] requested some time for reflection and Istikhara.`)}
                  className="w-full text-left p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-colors group"
                >
                  <div className="text-[15px] font-bold text-[#EDE7DA] flex items-center justify-between">Pause <span className="opacity-0 group-hover:opacity-100 transition-opacity">⏸</span></div>
                  <div className="text-[12px] text-[var(--sk-ink-dim)] mt-1">Take time for reflection or Istikhara. No pressure.</div>
                </button>

                <button 
                  onClick={() => handleDecision('decision_close', `[SENDER] respectfully closed the conversation.`)}
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
      <SakinahReportModal 
        isOpen={!!reportingProfile} 
        onClose={() => setReportingProfile(null)} 
        profileName={reportingProfile?.name || ''}
        reportedUserId={reportingProfile?.id || ''} 
      />
      
      {/* Etiquette Modal */}
      <AnimatePresence>
        {showEtiquetteModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0A0E16]/80 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#111826] border border-[rgba(212,168,83,0.2)] rounded-2xl p-6 max-w-[400px] w-full relative text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.2)] flex items-center justify-center mx-auto mb-4">
                <span className="text-[28px]">🕌</span>
              </div>
              <h3 className="font-serif text-[22px] text-[var(--sk-gold)] mb-3">Islamic Communication Reminder</h3>
              <p className="text-[14px] text-[var(--sk-ink-dim)] leading-relaxed mb-6">
                Communicate with kindness, honesty and respect. Maintain modesty and uphold Islamic values in all conversations.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowEtiquetteModal(false);
                    if (pendingConvoToOpen) {
                      localStorage.setItem(`etiquette_seen_${pendingConvoToOpen.conversation_id}`, 'true');
                      executeOpenConvo(pendingConvoToOpen);
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[var(--sk-gold)] to-[#E8C97A] text-[#0A0E16] text-[14px] font-bold rounded-xl shadow-md hover:scale-105 transition-all"
                >
                  Continue
                </button>
                <button 
                  onClick={() => {
                    setShowEtiquetteModal(false);
                    if (pendingConvoToOpen) {
                      localStorage.setItem(`etiquette_seen_${pendingConvoToOpen.conversation_id}`, 'true');
                      executeOpenConvo(pendingConvoToOpen);
                    }
                  }}
                  className="text-[12px] text-[var(--sk-ink-dim)] hover:text-white transition-colors"
                >
                  Don't show again
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SakinahLayout>
  );
};
