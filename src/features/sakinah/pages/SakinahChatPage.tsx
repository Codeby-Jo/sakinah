import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahLayout } from '../components';

const MOCK_CHATS = [
  { id: '1', name: 'Aisha', age: 25, city: 'London', profession: 'Software Engineer', initial: 'A', online: true, match: '92%', lastMessage: 'Assalamu alaikum, how are you?', time: '10:30 AM', unread: 2 },
  { id: '2', name: 'Fatima', age: 24, city: 'Dubai', profession: 'Teacher', initial: 'F', online: false, match: '85%', lastMessage: 'JazakAllah khair for sharing that.', time: 'Yesterday', unread: 0 },
];

const MOCK_MESSAGES = [
  { id: '1', sender: 'them', text: 'Assalamu alaikum, how are you?', time: '10:28 AM', type: 'text' },
  { id: '2', sender: 'me', text: 'Wa alaikum assalam! Alhamdullilah doing well, how about you?', time: '10:30 AM', type: 'text' },
];

export const SakinahChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { isWaliViewOnly } = useOnboarding();
  const [activeChat, setActiveChat] = useState<typeof MOCK_CHATS[0] | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  
  // Photo Request Audit Trail Simulation
  const [showPhotoRequest, setShowPhotoRequest] = useState(false);
  const [auditLog, setAuditLog] = useState<{ requester: string; time: string; status: string }[]>([]);

  const openChat = (chat: typeof MOCK_CHATS[0]) => {
    setActiveChat(chat);
    setShowReminder(true);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), sender: 'me', text: message, time: 'Just now', type: 'text' }]);
    setMessage('');
  };

  const sendAttachment = (type: 'image' | 'video') => {
    setMessages([...messages, { 
      id: Date.now().toString(), 
      sender: 'me', 
      text: type === 'image' ? 'Sent a photo' : 'Sent a video', 
      time: 'Just now', 
      type: type 
    }]);
  };

  const requestPhoto = () => {
    setShowPhotoRequest(true);
  };

  const confirmPhotoRequest = () => {
    const logEntry = {
      requester: 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    };
    setAuditLog([...auditLog, logEntry]);
    setShowPhotoRequest(false);
    setMessages([...messages, { 
      id: Date.now().toString(), 
      sender: 'me', 
      text: 'Requested to view profile photos', 
      time: 'Just now', 
      type: 'system' 
    }]);
  };

  return (
    <SakinahLayout>
      <div className="h-[calc(100vh-60px)] md:h-screen bg-[#0A0E16] flex flex-col md:flex-row font-sans text-[#EDE7DA] overflow-hidden">
        
        {/* Sidebar: Chat List */}
        <div className={`w-full md:w-[320px] lg:w-[380px] border-r border-[rgba(255,255,255,0.05)] bg-[#0C111A] flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
            <h2 className="font-serif text-[18px] text-[#EDE7DA]">Messages</h2>
          </div>
          
          <div className="p-4">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-[#111826] border border-[rgba(255,255,255,0.06)] rounded-[12px] px-4 py-2 text-[13px] outline-none focus:border-[var(--sk-gold)] transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {MOCK_CHATS.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => openChat(chat)}
                className={`p-4 border-b border-[rgba(255,255,255,0.02)] cursor-pointer transition-colors flex items-center gap-3 ${activeChat?.id === chat.id ? 'bg-[#161D2C]' : 'hover:bg-[#111826]'}`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--sk-gold)] to-[#A37B31] flex items-center justify-center text-[18px] font-serif text-[#0A0E16] font-bold">
                    {chat.initial}
                  </div>
                  {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--sk-green)] rounded-full border-2 border-[#0C111A]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-medium text-[15px] truncate">{chat.name}</h4>
                    <span className="text-[10px] text-[var(--sk-ink-faint)]">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] text-[var(--sk-ink-dim)] truncate max-w-[80%]">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="bg-[var(--sk-gold)] text-[#0A0E16] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Area: Conversation */}
        <div className={`flex-1 flex flex-col bg-gradient-to-b from-[#0A0E16] to-[#0d121c] relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 rounded-full bg-[rgba(212,168,83,0.05)] border border-[rgba(212,168,83,0.1)] flex items-center justify-center text-[var(--sk-gold)] text-[32px] mb-4 shadow-[0_0_30px_rgba(212,168,83,0.1)]">
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
                  <button onClick={() => setActiveChat(null)} className="md:hidden text-[var(--sk-gold)] p-2 -ml-2">
                    ←
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sk-gold)] to-[#A37B31] flex items-center justify-center text-[16px] font-serif text-[#0A0E16] font-bold">
                    {activeChat.initial}
                  </div>
                  <div>
                    <h3 className="font-medium text-[16px] leading-tight text-[var(--sk-ink)]">{activeChat.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {activeChat.online ? (
                        <span className="text-[11px] text-[var(--sk-green)] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--sk-green)]"></span> Online
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--sk-ink-faint)]">Offline</span>
                      )}
                      <span className="text-[10px] text-[var(--sk-gold)] px-1.5 py-0.5 rounded-full bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.2)]">
                        {activeChat.match} Match
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Photo Request Action */}
                {!isWaliViewOnly && (
                  <button 
                    onClick={requestPhoto}
                    className="text-[11px] px-3 py-1.5 border border-[var(--sk-gold)] text-[var(--sk-gold)] rounded-full hover:bg-[rgba(212,168,83,0.1)] transition-colors"
                  >
                    Request Photo
                  </button>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col gap-4">
                <div className="text-center my-4">
                  <span className="text-[10px] text-[var(--sk-ink-faint)] bg-[rgba(255,255,255,0.03)] px-3 py-1 rounded-full uppercase tracking-wider">
                    Today
                  </span>
                </div>
                
                {messages.map(msg => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex flex-col ${msg.type === 'system' ? 'items-center' : msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.type === 'system' ? (
                      <div className="text-[11px] text-[var(--sk-gold-dim)] bg-[rgba(212,168,83,0.05)] px-4 py-1.5 rounded-full border border-[rgba(212,168,83,0.1)] my-2">
                        {msg.text}
                      </div>
                    ) : (
                      <>
                        <div className={`max-w-[75%] md:max-w-[60%] p-3 rounded-[16px] text-[14px] leading-relaxed relative overflow-hidden ${
                          msg.sender === 'me' 
                            ? 'bg-[var(--sk-gold)] text-[#0A0E16] rounded-br-sm' 
                            : 'bg-[#161D2C] border border-[rgba(255,255,255,0.05)] text-[#EDE7DA] rounded-bl-sm'
                        }`}>
                          {msg.type === 'image' && (
                            <div className="relative w-full h-32 bg-black/20 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                              <span className="text-xl relative z-10">🖼️</span>
                              {/* Watermark Overlay */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30 rotate-[-15deg] select-none">
                                <span className="font-mono text-[8px] tracking-[0.2em] text-white">SAKINAH AUDIT</span>
                                <span className="font-mono text-[6px] tracking-[0.1em] text-white mt-1">REQ-ID: {activeChat?.id}-{msg.id}</span>
                              </div>
                            </div>
                          )}
                          {msg.type === 'video' && <div className="w-full h-32 bg-black/20 rounded-lg mb-2 flex items-center justify-center text-xl">🎥</div>}
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-[var(--sk-ink-faint)] mt-1 px-1">{msg.time}</span>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-[#0C111A] border-t border-[rgba(255,255,255,0.05)]">
                {isWaliViewOnly ? (
                  <div className="flex items-center gap-3 bg-[rgba(201,138,138,0.05)] border border-[rgba(201,138,138,0.2)] rounded-[16px] p-3">
                    <span className="text-[20px] text-[var(--sk-rose)]">🔒</span>
                    <p className="text-[13px] text-[var(--sk-rose)] font-medium leading-relaxed">
                      View Only Mode: Wali accounts cannot participate in conversations. Only the account owner may communicate.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={sendMessage} className="flex items-center gap-2 bg-[#111826] border border-[rgba(255,255,255,0.06)] focus-within:border-[var(--sk-gold)] rounded-[16px] p-1 pr-2 transition-colors">
                    <button type="button" onClick={() => sendAttachment('image')} className="p-2 text-[var(--sk-ink-dim)] hover:text-[var(--sk-gold)] transition-colors rounded-full hover:bg-[rgba(255,255,255,0.05)]">
                      📷
                    </button>
                    <button type="button" onClick={() => sendAttachment('video')} className="p-2 text-[var(--sk-ink-dim)] hover:text-[var(--sk-gold)] transition-colors rounded-full hover:bg-[rgba(255,255,255,0.05)]">
                      📹
                    </button>
                    <input 
                      type="text" 
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--sk-ink)] py-2"
                    />
                    <button 
                      type="submit" 
                      disabled={!message.trim()}
                      className="p-2 w-8 h-8 flex items-center justify-center bg-[var(--sk-gold)] text-[#0A0E16] rounded-full disabled:opacity-50 disabled:bg-[var(--sk-ink-dim)] transition-all"
                    >
                      ➤
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

          {/* Photo Request Audit Trail Modal */}
          <AnimatePresence>
            {showPhotoRequest && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-[#0A0E16]/80 backdrop-blur-md flex items-center justify-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                  className="bg-[#111826] border border-[rgba(212,168,83,0.3)] rounded-[24px] p-6 max-w-[400px] w-full text-center shadow-[0_0_50px_rgba(212,168,83,0.1)] relative"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(212,168,83,0.1)] flex items-center justify-center text-[24px]">
                    🔐
                  </div>
                  <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">Photo Request Audit</h3>
                  <p className="text-[13px] text-[var(--sk-ink-dim)] mb-6 leading-relaxed">
                    Sakinah logs all photo requests to ensure accountability and maintain a high-trust environment. 
                    This request will be recorded in the system audit trail.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowPhotoRequest(false)} className="flex-1 py-3 border border-[rgba(255,255,255,0.1)] rounded-xl text-[13px] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                      Cancel
                    </button>
                    <button onClick={confirmPhotoRequest} className="flex-1 py-3 bg-[var(--sk-gold)] text-[#0A0E16] rounded-xl text-[13px] font-medium hover:bg-[#E8C97A] transition-colors">
                      Confirm & Request
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Islamic Reminder Modal */}
          <AnimatePresence>
            {showReminder && activeChat && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[60] bg-[#0A0E16]/90 backdrop-blur-md flex items-center justify-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                  className="bg-gradient-to-b from-[#111826] to-[#0A0E16] border border-[rgba(212,168,83,0.3)] rounded-[24px] p-8 max-w-[420px] text-center shadow-[0_0_50px_rgba(212,168,83,0.1)] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--sk-gold)] to-transparent opacity-50" />
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgba(212,168,83,0.1)] flex items-center justify-center">
                    <span className="text-[28px]">🌙</span>
                  </div>
                  <h3 className="font-serif text-[24px] text-[var(--sk-gold)] mb-4">Islamic Reminder</h3>
                  <p className="text-[14px] text-[var(--sk-ink)] font-light leading-relaxed mb-8 italic px-4">
                    "May Allah place barakah in your intentions. Please communicate respectfully, honestly, and in accordance with Islamic values. Maintain good character and sincerity throughout your interaction."
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
    </SakinahLayout>
  );
};
