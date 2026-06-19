import React from 'react';

export interface MetaStat {
  value: string;
  label: string;
}

interface SakinahMetaRowProps {
  stats: MetaStat[];
  className?: string;
}

export const SakinahMetaRow: React.FC<SakinahMetaRowProps> = ({ stats, className = '' }) => {
  return (
    <div className={`sk-meta-row ${className}`}>
      {stats.map((stat, i) => (
        <div key={i} className="sk-meta">
          <b>{stat.value}</b>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
};
