import React from 'react';

interface RayaScriptCardProps {
  title?: string;
  scriptText: string;
  className?: string;
}

export const RayaScriptCard: React.FC<RayaScriptCardProps> = ({ 
  title = 'RAYA SAYS', 
  scriptText, 
  className = '' 
}) => {
  return (
    <div className={`relative overflow-hidden rounded-[22px] p-[18px] border border-[rgba(212,168,83,0.16)] bg-gradient-to-br from-[#111826] to-[#0f1521] ${className}`}>
      {/* Gold top right corner glow */}
      <div className="absolute top-0 right-0 w-[60px] h-[60px] bg-[radial-gradient(circle_at_top_right,rgba(212,168,83,0.16),transparent_70%)] pointer-events-none" />
      
      <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[rgba(212,168,83,0.55)] mb-[9px]">
        {title}
      </div>
      <p className="font-serif text-[18px] leading-[1.4] text-[#EDE7DA] font-normal italic">
        {scriptText}
      </p>
    </div>
  );
};
