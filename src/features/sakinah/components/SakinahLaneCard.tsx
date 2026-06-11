import React from 'react';

interface SakinahLaneCardProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

export const SakinahLaneCard: React.FC<SakinahLaneCardProps> = ({
  icon,
  title,
  description,
  onClick,
  className = ''
}) => {
  return (
    <div className={`sk-lane ${className}`} onClick={onClick}>
      <div className="li">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="arr">›</div>
    </div>
  );
};
