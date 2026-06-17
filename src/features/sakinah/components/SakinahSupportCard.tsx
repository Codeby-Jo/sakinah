import React from 'react';

interface SakinahSupportCardProps {
  icon: string;
  title: string;
  subtitle: string;
  variant?: 'default' | 'safe' | 'vent';
  onClick?: () => void;
  className?: string;
}

export const SakinahSupportCard: React.FC<SakinahSupportCardProps> = ({
  icon,
  title,
  subtitle,
  variant = 'default',
  onClick,
  className = ''
}) => {
  return (
    <div className={`sk-support ${variant} ${className}`} onClick={onClick}>
      <div className="si">{icon}</div>
      <div className="tx">
        <b>{title}</b>
        <span>{subtitle}</span>
      </div>
      <div className="arr">›</div>
    </div>
  );
};
