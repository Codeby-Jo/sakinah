import React from 'react';

export interface JourneyStep {
  id: string;
  phase: string;
  title: string;
  description: string;
  statusLabel?: string;
  onClick?: () => void;
}

interface SakinahJourneyStepperProps {
  title: string;
  activeStep: number;
  steps: JourneyStep[];
  className?: string;
}

const ARABIC_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export const SakinahJourneyStepper: React.FC<SakinahJourneyStepperProps> = ({ title, activeStep, steps, className = '' }) => {
  return (
    <div className={`sk-card sk-gold-edge ${className}`}>
      <div className="corner"></div>
      <div className="sk-card-k mb-[14px]">{title}</div>
      <div className="sk-journey">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum < activeStep;
          const isActive = stepNum === activeStep;
          
          let statusClass = '';
          if (isDone) statusClass = 'done';
          else if (isActive) statusClass = 'active';

          return (
            <div 
              key={step.id} 
              className={`sk-jstep ${statusClass}`} 
              onClick={step.onClick}
              style={{ cursor: step.onClick ? 'pointer' : 'default' }}
            >
              <div className="sk-jrail">
                <div className="sk-jnode">{ARABIC_NUMERALS[stepNum] || stepNum}</div>
                {idx < steps.length - 1 && <div className="sk-jline" />}
              </div>
              <div className="sk-jbody">
                <div className="lab">{step.phase}</div>
                <b>{step.title}</b>
                <span>{step.description}</span>
                {step.statusLabel && isActive && (
                  <span className="pin">{step.statusLabel}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
