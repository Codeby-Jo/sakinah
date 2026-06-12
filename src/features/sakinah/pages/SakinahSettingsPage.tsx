import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahLayout, SakinahHeader, SakinahButton } from '../components';

const SETTING_SECTIONS = [
  { id: 'account', title: 'Account', icon: '👤', items: ['Edit Profile', 'Change Password', 'Change Email', 'Change Phone Number'] },
  { id: 'privacy', title: 'Privacy', icon: '🔒', items: ['Profile Visibility', 'Photo Visibility', 'Hide from Search', 'Block Users'] },
  { id: 'notifications', title: 'Notifications', icon: '🔔', items: ['Email Notifications', 'SMS Notifications', 'Push Notifications'] },
  { id: 'preferences', title: 'Preferences', icon: '⚙', items: ['Language', 'Theme', 'Communication Preferences'] },
  { id: 'security', title: 'Security', icon: '🛡️', items: ['Two-Factor Authentication', 'Login Activity', 'Device Management'] },
  { id: 'verification', title: 'Verification', icon: '✓', items: ['KYC Status', 'Re-upload Documents'] },
  { id: 'management', title: 'Account Management', icon: '⚠️', items: ['Download My Data', 'Deactivate Account', 'Delete Account'] },
];

export const SakinahSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('account');
  const { isWaliViewOnly } = useOnboarding();

  if (isWaliViewOnly) {
    return (
      <SakinahLayout>
        <div className="p-6 md:p-10 max-w-[1200px] mx-auto min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-[rgba(201,138,138,0.05)] border border-[rgba(201,138,138,0.2)] rounded-[20px] max-w-[400px]">
            <div className="text-[40px] mb-4">🚫</div>
            <h2 className="font-serif text-[24px] text-[var(--sk-rose)] mb-2">Permission Denied</h2>
            <p className="text-[14px] text-[var(--sk-ink-dim)] leading-relaxed">
              Wali accounts have read-only access. Account settings cannot be modified from this account.
            </p>
            <SakinahButton variant="secondary" onClick={() => navigate('/wali/dashboard')} className="mt-6">
              Return to Dashboard
            </SakinahButton>
          </div>
        </div>
      </SakinahLayout>
    );
  }

  return (
    <SakinahLayout>
      <div className="p-6 md:p-10 max-w-[1200px] mx-auto min-h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <SakinahHeader title="Settings" subtitle="Manage your account preferences" onBack={() => navigate('/dashboard')} />
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 mt-8">
          {/* Sidebar for settings */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="w-full md:w-[280px] flex flex-col gap-2 shrink-0"
          >
            {SETTING_SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                  activeSection === section.id 
                    ? 'bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.2)] text-[var(--sk-gold)]' 
                    : 'bg-[rgba(255,255,255,0.02)] border border-transparent text-[var(--sk-ink-dim)] hover:text-[var(--sk-ink)] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <span className="text-[18px]">{section.icon}</span>
                <span className="text-[14px] font-medium">{section.title}</span>
              </button>
            ))}
          </motion.div>

          {/* Main Content Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <AnimatePresence mode="wait">
              {SETTING_SECTIONS.map(section => {
                if (section.id !== activeSection) return null;
                return (
                  <motion.div 
                    key={section.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                    className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[24px] p-6 md:p-8"
                  >
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[rgba(255,255,255,0.05)]">
                      <div className="w-12 h-12 rounded-full bg-[rgba(212,168,83,0.1)] flex items-center justify-center text-[24px] text-[var(--sk-gold)]">
                        {section.icon}
                      </div>
                      <div>
                        <h2 className="font-serif text-[24px] text-[var(--sk-ink)]">{section.title}</h2>
                        <p className="text-[13px] text-[var(--sk-ink-dim)]">Manage your {section.title.toLowerCase()} preferences</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {section.items.map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] hover:border-[var(--sk-gold)] transition-colors cursor-pointer group ${
                            item.includes('Delete') ? 'hover:border-red-500/50 hover:bg-red-500/5' : ''
                          }`}
                        >
                          <span className={`text-[15px] font-medium transition-colors ${item.includes('Delete') || item.includes('Deactivate') ? 'text-red-400 group-hover:text-red-500' : 'text-[var(--sk-ink)] group-hover:text-[var(--sk-gold)]'}`}>
                            {item}
                          </span>
                          <span className="text-[var(--sk-ink-dim)] group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </SakinahLayout>
  );
};
