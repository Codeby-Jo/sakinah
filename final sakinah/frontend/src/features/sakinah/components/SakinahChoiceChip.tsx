import React from 'react';

interface SakinahChoiceChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SakinahChoiceChip: React.FC<SakinahChoiceChipProps> = ({
  label,
  selected = false,
  onClick,
  className = ''
}) => {
  return (
    <button 
      type="button"
      className={`sk-chip ${selected ? 'sel' : ''} ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
