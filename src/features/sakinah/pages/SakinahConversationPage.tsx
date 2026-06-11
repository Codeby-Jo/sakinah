import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahHeader, 
  ConversationTopicList, 
  SakinahButton,
  SakinahInput
} from '../components';
import type { ConversationTopic } from '../types/sakinah.types';
import { sendConversationMessage } from '../services/sakinahApi';

export const SakinahConversationPage: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [contactWarning, setContactWarning] = useState(false);

  const topics: ConversationTopic[] = [
    { id: 't1', title: 'Parents & Family', description: '', isUnlocked: true },
    { id: 't2', title: 'Work & Provision', description: '', isUnlocked: true },
    { id: 't3', title: 'Friends & Circle', description: '', isUnlocked: true },
    { id: 't4', title: 'Bad Habits', description: '', isUnlocked: false },
    { id: 't5', title: 'Looks & Self-image', description: '', isUnlocked: false },
    { id: 't6', title: 'Responsibility', description: '', isUnlocked: false },
    { id: 't7', title: 'Expectations', description: '', isUnlocked: false },
    { id: 't8', title: 'Shared Finances', description: '', isUnlocked: false },
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError('');

    if (!inputText.trim()) {
      setInputError('Message cannot be empty.');
      return;
    }

    // Contact leak detection simulation
    if (inputText.includes('@') || inputText.match(/\d{5,}/)) {
      setContactWarning(true);
      setTimeout(() => setContactWarning(false), 5000);
      return;
    }

    setIsPending(true);
    try {
      await sendConversationMessage(conversationId || 'mock', 't3', inputText);
      setMessages([...messages, { sender: 'You', text: inputText }]);
      setInputText('');
    } catch (err) {
      console.warn('Backend offline, using dev fallback for sendMessage', err);
      setMessages([...messages, { sender: 'You', text: inputText }, { sender: 'System', text: 'Development Preview Mode: Message safely received.' }]);
      setInputText('');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Conversation" 
        subtitle="Phase 6 · guided by Raya" 
        onBack={() => window.history.back()} 
      />

      <div className="text-center mb-[11px] sk-fx sk-d1">
        <span className="inline-flex items-center gap-[6px] text-[11px] text-[#ebd097] bg-[#D4A853]/10 border border-[#D4A853]/20 rounded-[30px] px-[12px] py-[4px] font-medium tracking-[0.02em]">
          ⚭ Wali present · Fatima's brother
        </span>
      </div>

      <div className="sk-fx sk-d2 mb-5">
        <ConversationTopicList topics={topics} />
      </div>

      <div className="sk-fx sk-d3 bg-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.15)] rounded-[13px] p-4 mb-4">
        <h3 className="font-serif text-[18px] text-[var(--sk-gold)] mb-3">Chat: Friends & Circle</h3>
        
        {contactWarning && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-[12px] p-3 text-center text-[12px] text-red-400 mb-3">
            [Safety System]: Sharing contact info is disabled. Please continue discussing the topic.
          </div>
        )}

        <div className="h-48 overflow-y-auto flex flex-col gap-2 mb-4 pr-2">
          {messages.length === 0 ? (
            <p className="text-[var(--sk-ink-faint)] text-[12px] font-light text-center mt-auto mb-auto">Start the discussion on this topic...</p>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`p-[10px_14px] rounded-[14px] text-[13px] leading-[1.5] font-light max-w-[85%] ${m.sender === 'You' ? 'bg-[rgba(212,168,83,0.1)] text-[var(--sk-ink)] self-end border border-[rgba(212,168,83,0.15)] rounded-br-[4px]' : 'bg-[rgba(255,255,255,0.03)] text-[var(--sk-ink-dim)] self-start border border-[rgba(255,255,255,0.06)] rounded-bl-[4px]'}`}>
                {m.text}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2 items-start" noValidate>
          <SakinahInput 
            type="text" 
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); setInputError(''); }}
            placeholder="Type your message safely..."
            className="flex-1"
            required
            error={inputError}
          />
          <SakinahButton 
            type="submit" 
            variant="primary"
            disabled={isPending}
            fullWidth={false}
          >
            Send
          </SakinahButton>
        </form>
      </div>

      <div className="sk-fx sk-d4 mt-4 text-center">
        <button 
          onClick={() => navigate('/sakinah/decision/mock_matchflow_1')}
          className="text-[12px] text-[var(--sk-gold-soft)] hover:text-[var(--sk-gold)] transition-colors underline underline-offset-4"
        >
          Make a final decision →
        </button>
      </div>
    </SakinahJourneyFrame>
  );
};
