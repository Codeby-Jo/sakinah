import React from 'react';

interface SakinahNoticeProps {
  icon: string;
  title: string;
  message: string;
  className?: string;
}

export const SakinahNotice: React.FC<SakinahNoticeProps> = ({
  icon,
  title,
  message,
  className = ''
}) => {
  return (
    <div className={`sk-notice ${className}`}>
      <div className="ni">{icon}</div>
      <div>
        <b>{title}</b>
        <p>{message}</p>
      </div>
    </div>
  );
};
