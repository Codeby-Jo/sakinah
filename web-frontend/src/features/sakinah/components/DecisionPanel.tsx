import React from 'react';
import { SakinahButton } from './SakinahButton';

interface DecisionPanelProps {
  onProceed: () => void;
  onPartWays: () => void;
  isPending?: boolean;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({ onProceed, onPartWays, isPending = false }) => {
  return (
    <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col gap-4">
      <div className="text-center mb-2">
        <h3 className="font-serif text-[21px] font-medium text-[#EDE7DA] mb-1">Final Decision</h3>
        <p className="text-[12px] text-[#9aa0ac] font-light leading-[1.5]">
          Make your choice with intention. Once a decision is made, it cannot be reversed.
        </p>
      </div>
      <SakinahButton 
        onClick={onProceed}
        disabled={isPending}
        size="lg"
      >
        {isPending ? 'Processing...' : 'Proceed to Next Phase'}
      </SakinahButton>
      <SakinahButton 
        variant="danger"
        onClick={onPartWays}
        disabled={isPending}
      >
        Part Ways Respectfully
      </SakinahButton>
    </div>
  );
};
