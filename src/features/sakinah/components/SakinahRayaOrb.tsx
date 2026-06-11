import React from 'react';

interface SakinahRayaOrbProps {
  variant?: 'hero' | 'fab';
  className?: string;
  onClick?: () => void;
  collapsed?: boolean;
}

export const SakinahRayaOrb: React.FC<SakinahRayaOrbProps> = ({
  variant = 'hero',
  className = '',
  onClick,
  collapsed = false
}) => {
  if (variant === 'fab') {
    return (
      <div className={`sk-raya-fab ${collapsed ? 'collapsed' : ''} ${className}`} onClick={onClick}>
        <div className="sk-raya-hint">
          Need help? <b>Raya's here.</b>
        </div>
        <div className="sk-raya-orb">ر</div>
      </div>
    );
  }

  // Hero variant (large, center screen)
  return <div className={`sk-b-orb ${className}`} onClick={onClick} />;
};
