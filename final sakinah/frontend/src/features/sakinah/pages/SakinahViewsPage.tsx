import React from 'react';
import { SakinahLayout, SakinahHeader } from '../components';

export const SakinahViewsPage: React.FC = () => {
  return (
    <SakinahLayout>
      <div className="p-8 max-w-[1000px] mx-auto">
        <SakinahHeader title="Profile Views" subtitle="Users who have viewed your profile" />
        <div className="text-[var(--sk-ink-dim)]">You have no recent profile views.</div>
      </div>
    </SakinahLayout>
  );
};
