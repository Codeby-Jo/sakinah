import React from 'react';

export interface SignalData {
  name: string;
  value: string;
  percentage: number;
}

interface SakinahPortraitCardProps {
  auraChar: string;
  quote: string;
  signalsTitle?: string;
  signals: SignalData[];
  className?: string;
}

export const SakinahPortraitCard: React.FC<SakinahPortraitCardProps> = ({
  auraChar,
  quote,
  signalsTitle = 'What your gratitude reveals',
  signals,
  className = ''
}) => {
  return (
    <div className={className}>
      <div className="sk-portrait">
        <div className="aura">{auraChar}</div>
        <div className="sk-quote">"{quote}"</div>
      </div>
      
      <div className="sk-card">
        <div className="sk-card-k">{signalsTitle}</div>
        {signals.map((sig, i) => (
          <React.Fragment key={sig.name}>
            <div className={`sk-signal-row ${i > 0 ? 'mt-[11px]' : ''}`}>
              <span className="nm">{sig.name}</span>
              <span className="vl">{sig.value}</span>
            </div>
            <div className="sk-meter">
              <i style={{ width: `${sig.percentage}%` }} />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
