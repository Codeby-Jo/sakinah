import React from 'react';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

interface ConversationMessageListProps {
  messages: Message[];
  className?: string;
}

export const ConversationMessageList: React.FC<ConversationMessageListProps> = ({ messages, className = '' }) => {
  return (
    <div className={`flex flex-col gap-[16px] ${className}`}>
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-[18px] p-[14px_16px] text-[14px] leading-[1.5] ${msg.isOwn ? 'bg-[rgba(212,168,83,0.1)] text-[#EDE7DA] rounded-br-none border border-[rgba(212,168,83,0.2)]' : 'bg-[#111826] text-[#9aa0ac] rounded-bl-none border border-[rgba(255,255,255,0.06)]'}`}>
            {msg.text}
          </div>
        </div>
      ))}
      {messages.length === 0 && (
        <div className="text-center text-[#5f6675] font-light text-[13px] py-10 italic font-serif">
          No messages yet. Start the conversation respectfully.
        </div>
      )}
    </div>
  );
};
