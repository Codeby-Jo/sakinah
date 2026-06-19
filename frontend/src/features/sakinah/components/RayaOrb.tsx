import React from 'react';

interface RayaOrbProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RayaOrb: React.FC<RayaOrbProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-[80px] h-[80px]',
    md: 'w-[150px] h-[150px]',
    lg: 'w-[200px] h-[200px]',
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer breathing aura */}
      <div className="absolute inset-[-22px] rounded-full animate-pulse" 
           style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.22), transparent 68%)' }} />
      {/* Core orb */}
      <div 
        className={`${sizeMap[size]} rounded-full relative z-10 animate-[breathe_5s_ease-in-out_infinite]`}
        style={{ 
          background: 'radial-gradient(circle at 46% 42%, #fde6b8, #d9a948 38%, #7c5e22 72%, transparent 78%)' 
        }}
      />
    </div>
  );
};
