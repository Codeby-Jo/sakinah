import React from 'react';

export interface ReflectionOption {
  id: string;
  label: string;
  text: string;
}

interface SakinahReflectionCardProps {
  question: string;
  options: ReflectionOption[];
  onSelect?: (id: string) => void;
  onSkip?: () => void;
  className?: string;
  skipText?: string;
  dividerText?: string;
}

export const SakinahReflectionCard: React.FC<SakinahReflectionCardProps> = ({
  question,
  options,
  onSelect,
  onSkip,
  className = '',
  skipText = 'Neither fits → reflect in words instead',
  dividerText = 'or'
}) => {
  return (
    <div className={`sk-reflect ${className}`}>
      <div className="q">{question}</div>
      <div className="opts">
        {options.map((opt, i) => (
          <React.Fragment key={opt.id}>
            {i > 0 && <div className="or-divider text-center font-serif italic text-[var(--sk-gold-dim)] text-[16px] my-[1px] mb-[11px]">{dividerText}</div>}
            <div className="sk-choice" onClick={() => onSelect?.(opt.id)}>
              <div className="lab">{opt.label}</div>
              <div className="opt">{opt.text}</div>
            </div>
          </React.Fragment>
        ))}
        {onSkip && (
          <div className="text-center text-[12px] text-[var(--sk-ink-faint)] mt-1 cursor-pointer hover:text-[var(--sk-ink-dim)] transition-colors" onClick={onSkip}>
            {skipText}
          </div>
        )}
      </div>
    </div>
  );
};
