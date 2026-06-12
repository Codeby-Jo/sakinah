import React from 'react';
import { SakinahLayout, SakinahHeader } from '../components';

export const SakinahNotificationsPage: React.FC = () => {
  return (
    <SakinahLayout>
      <div className="p-8 max-w-[1000px] mx-auto">
        <SakinahHeader title="Notifications" subtitle="Recent activity" />
        <div className="text-[var(--sk-ink-dim)]">No new notifications.</div>
      </div>
    </SakinahLayout>
  );
};
