import React from 'react';
import { SakinahButton } from './SakinahButton';

interface InterestActionPanelProps {
  onExpressInterest: () => void;
  onSilentPass: () => void;
  isPending?: boolean;
}

export const InterestActionPanel: React.FC<InterestActionPanelProps> = ({ 
  onExpressInterest, 
  onSilentPass,
  isPending = false
}) => {
  return (
    <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col gap-4">
      <p className="text-center text-[12px] text-[#9aa0ac] font-light mb-2">
        If you feel aligned with their values, express your interest. They will not see this unless they also express interest.
      </p>
      <SakinahButton 
        onClick={onExpressInterest}
        disabled={isPending}
        size="lg"
      >
        {isPending ? 'Processing...' : 'Express Interest'}
      </SakinahButton>
      <SakinahButton 
        variant="ghost"
        onClick={onSilentPass}
        disabled={isPending}
      >
        Silent Pass
      </SakinahButton>
    </div>
  );
};
