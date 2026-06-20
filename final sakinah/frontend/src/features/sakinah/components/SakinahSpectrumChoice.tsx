import React from 'react';

export interface SpectrumSegment {
  id: string;
  label: string;
  description: string;
}

interface SakinahSpectrumChoiceProps {
  segments: SpectrumSegment[];
  selectedId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export const SakinahSpectrumChoice: React.FC<SakinahSpectrumChoiceProps> = ({
  segments,
  selectedId,
  onChange,
  className = ''
}) => {
  return (
    <div className={`sk-spectrum ${className}`}>
      {segments.map((seg) => (
        <button
          key={seg.id}
          type="button"
          className={`seg ${selectedId === seg.id ? 'sel' : ''}`}
          onClick={() => onChange?.(seg.id)}
        >
          <b>{seg.label}</b>
          <span>{seg.description}</span>
        </button>
      ))}
    </div>
  );
};
