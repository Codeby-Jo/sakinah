import React from 'react';
import { SakinahLayout, SakinahHeader } from '../components';

export const SakinahSavedPage: React.FC = () => {
  return (
    <SakinahLayout>
      <div className="p-8 max-w-[1000px] mx-auto">
        <SakinahHeader title="Saved Profiles" subtitle="Profiles you have bookmarked" />
        <div className="text-[var(--sk-ink-dim)]">You haven't saved any profiles yet.</div>
      </div>
    </SakinahLayout>
  );
};
