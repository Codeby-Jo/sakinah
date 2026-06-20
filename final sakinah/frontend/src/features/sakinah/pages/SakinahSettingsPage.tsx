import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahLayout, SakinahHeader, SakinahButton } from '../components';

const SETTING_SECTIONS = [
  { id: 'account', title: 'Account Settings', icon: '👤' },
  { id: 'privacy', title: 'Privacy Settings', icon: '🔒' },
  { id: 'notifications', title: 'Notification Settings', icon: '🔔' },
  { id: 'preferences', title: 'Match Preferences', icon: '♡' },
  { id: 'security', title: 'Security', icon: '🛡️' },
  { id: 'verification', title: 'Verification', icon: '✓' },
  { id: 'management', title: 'Account Management', icon: '⚠️' },
];

export const SakinahSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('account');
  const { isWaliViewOnly } = useOnboarding();

  // Fake toggle states
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    profileVisible: true, searchHidden: false, photoVisible: false,
    emailNotif: true, smsNotif: false, pushNotif: true, matchAlerts: true, interestAlerts: true, msgAlerts: true,
    twoFactor: false
  });

  const t = (k: string) => { setToggles(p => ({...p, [k]: !p[k]})); };

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
            <SakinahButton variant="secondary" onClick={() => navigate('/matrimony/wali-dashboard')} className="mt-6">
              Return to Dashboard
            </SakinahButton>
          </div>
        </div>
      </SakinahLayout>
    );
  }

  const renderContent = () => {
    const Toggle = ({ label, desc, stateKey }: { label: string, desc: string, stateKey: string }) => (
      <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl mb-3">
        <div>
          <div className="text-[15px] text-[var(--sk-ink)] font-medium">{label}</div>
          <div className="text-[12px] text-[var(--sk-ink-dim)] mt-0.5">{desc}</div>
        </div>
        <button onClick={() => t(stateKey)} className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${toggles[stateKey] ? 'bg-[var(--sk-green)]' : 'bg-[rgba(255,255,255,0.1)]'}`}>
          <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" animate={{ x: toggles[stateKey] ? 24 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
        </button>
      </div>
    );

    const ActionButton = ({ label, onClick, danger }: { label: string, onClick?: () => void, danger?: boolean }) => (
      <button onClick={onClick} className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all duration-300 mb-3 ${danger ? 'bg-[rgba(201,138,138,0.05)] border-[rgba(201,138,138,0.2)] text-[var(--sk-rose)] hover:bg-[rgba(201,138,138,0.1)]' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] text-[var(--sk-ink)] hover:border-[var(--sk-gold)]'}`}>
        <span className="text-[15px] font-medium">{label}</span>
        <span>→</span>
      </button>
    );

    switch(activeSection) {
      case 'account': return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
          <div>
            <h3 className="font-serif text-[24px] text-[var(--sk-ink)] mb-4">Account Settings</h3>
            <ActionButton label="Edit Profile" onClick={() => navigate('/matrimony/profile-creation')} />
            <ActionButton label="Change Password" />
            <ActionButton label="Change Email" />
            <ActionButton label="Change Phone Number" />
          </div>
        </motion.div>
      );
      case 'privacy': return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h3 className="font-serif text-[24px] text-[var(--sk-ink)] mb-4">Privacy Settings</h3>
          <Toggle label="Profile Visibility" desc="Make your profile visible to others" stateKey="profileVisible" />
          <Toggle label="Hide from Search" desc="Do not show up in random searches" stateKey="searchHidden" />
          <Toggle label="Control Photo Visibility" desc="Only show photos to accepted matches" stateKey="photoVisible" />
          <ActionButton label="Blocked Users" />
          <ActionButton label="Manage Profile Privacy" />
        </motion.div>
      );
      case 'notifications': return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h3 className="font-serif text-[24px] text-[var(--sk-ink)] mb-4">Notification Settings</h3>
          <Toggle label="Email Notifications" desc="Receive updates via email" stateKey="emailNotif" />
          <Toggle label="SMS Notifications" desc="Receive important alerts via text" stateKey="smsNotif" />
          <Toggle label="Push Notifications" desc="Get browser or app push notifications" stateKey="pushNotif" />
          <Toggle label="Match Alerts" desc="Notify me of new highly compatible matches" stateKey="matchAlerts" />
          <Toggle label="Interest Alerts" desc="Notify me when someone expresses interest" stateKey="interestAlerts" />
          <Toggle label="Message Alerts" desc="Notify me of new chat messages" stateKey="msgAlerts" />
        </motion.div>
      );
      case 'preferences': return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h3 className="font-serif text-[24px] text-[var(--sk-ink)] mb-4">Match Preferences</h3>
          <ActionButton label="Update Partner Preferences" onClick={() => navigate('/matrimony/preferences')} />
          <ActionButton label="Distance Preference" />
          <ActionButton label="Age Preference" />
          <ActionButton label="Religious Preference" />
        </motion.div>
      );
      case 'security': return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h3 className="font-serif text-[24px] text-[var(--sk-ink)] mb-4">Security</h3>
          <Toggle label="Two-Factor Authentication" desc="Require an OTP to log in" stateKey="twoFactor" />
          <ActionButton label="Login Activity" />
          <ActionButton label="Active Devices" />
          <ActionButton label="Security Alerts" />
        </motion.div>
      );
      case 'verification': return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h3 className="font-serif text-[24px] text-[var(--sk-ink)] mb-4">Verification</h3>
          <div className="p-4 bg-[rgba(127,176,122,0.1)] border border-[rgba(127,176,122,0.2)] rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--sk-green)] flex items-center justify-center text-[#0A0E16] text-[20px]">✓</div>
              <div>
                <div className="text-[14px] text-[var(--sk-green)] font-medium">KYC Verified</div>
                <div className="text-[12px] text-[var(--sk-ink-dim)]">Your identity has been verified securely.</div>
              </div>
            </div>
          </div>
          <ActionButton label="Re-upload Documents" />
          <ActionButton label="Verification Progress" />
        </motion.div>
      );
      case 'management': return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h3 className="font-serif text-[24px] text-[var(--sk-ink)] mb-4">Account Management</h3>
          <ActionButton label="Download My Data" />
          <ActionButton label="Deactivate Account" danger />
          <ActionButton label="Delete Account" danger />
        </motion.div>
      );
      default: return null;
    }
  };

  return (
    <SakinahLayout>
      <div className="p-6 md:p-10 max-w-[1200px] mx-auto min-h-screen pb-32">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <SakinahHeader title="Settings" subtitle="Manage your account preferences" onBack={() => navigate('/matrimony/dashboard')} />
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
                    : 'bg-transparent text-[var(--sk-ink-dim)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[var(--sk-ink)]'
                }`}
              >
                <span className="text-[20px] opacity-80">{section.icon}</span>
                <span className="text-[14px] font-medium">{section.title}</span>
              </button>
            ))}
          </motion.div>

          {/* Settings Content */}
          <div className="flex-1 min-h-[500px] bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] rounded-[24px] p-6 md:p-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </SakinahLayout>
  );
};
