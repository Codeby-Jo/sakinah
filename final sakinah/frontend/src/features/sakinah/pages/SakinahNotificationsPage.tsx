import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SakinahLayout } from '../components';
import { getNotifications } from '../services/sakinahApi';
import type { NotificationItem } from '../types/sakinah.types';

export const SakinahNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        await getNotifications();
      } catch {
        // Simulated Notification Data
        await new Promise(r => setTimeout(r, 800));
        let mock: NotificationItem[] = [];
        
        // Merge with custom notifications from localStorage (e.g., Wali logins)
        const customNotifsData = localStorage.getItem('sakinah_mock_notifications');
        if (customNotifsData) {
          try {
            const customNotifs = JSON.parse(customNotifsData);
            mock = [...customNotifs, ...mock];
          } catch (e) {
            console.error("Failed to parse mock notifications", e);
          }
        }
        
        setNotifications(mock);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'NEW_MATCH': return { icon: '✧', colors: 'bg-[var(--sk-gold)]/10 text-[var(--sk-gold)] border-[var(--sk-gold)]/20' };
      case 'PROFILE_VIEW': return { icon: '👁', colors: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'PHOTO_REQUEST': return { icon: '🔐', colors: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
      case 'PROFILE_SHARED': return { icon: '🔗', colors: 'bg-green-500/10 text-green-400 border-green-500/20' };
      case 'FAMILY_ADDED': return { icon: '👨‍👩‍👧', colors: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'REPORT_SUBMITTED': return { icon: '🚩', colors: 'bg-red-500/10 text-red-400 border-red-500/20' };
      default: return { icon: '🔔', colors: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <SakinahLayout>
      <div className="px-6 py-8 max-w-[800px] mx-auto pb-24 relative min-h-screen">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[rgba(212,168,83,0.03)] to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-[32px] md:text-[40px] text-[var(--sk-gold)] mb-2">Notifications</h1>
            <p className="text-[14px] text-[var(--sk-ink-dim)]">Stay updated on your matrimony journey</p>
          </div>
          <button 
            onClick={markAllRead}
            className="text-[12px] font-medium text-[var(--sk-gold)] px-4 py-2 border border-[rgba(212,168,83,0.3)] rounded-full hover:bg-[rgba(212,168,83,0.1)] transition-colors"
          >
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20"><span className="text-[var(--sk-gold)] text-[32px] animate-spin">⚙</span></div>
        ) : notifications.length === 0 ? (
          <div className="sk-card py-16 text-center">
            <span className="text-[40px] opacity-50 block mb-4">📭</span>
            <h3 className="text-[20px] font-serif text-[var(--sk-gold)] mb-2">No Notifications</h3>
            <p className="text-[14px] text-[var(--sk-ink-dim)]">You're all caught up.</p>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            <AnimatePresence>
              {notifications.map((n, i) => {
                const style = getIcon(n.type);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={n.id}
                    onClick={() => {
                      if (n.actionUrl) navigate(n.actionUrl);
                    }}
                    className={`sk-card !p-5 flex gap-4 transition-all duration-300 ${!n.read ? 'border-[var(--sk-gold)]/40 bg-[rgba(212,168,83,0.02)]' : 'border-[rgba(255,255,255,0.05)]'} ${n.actionUrl ? 'cursor-pointer hover:bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.1)]' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border text-[20px] ${style.colors}`}>
                      {style.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-[15px] ${!n.read ? 'text-[#EDE7DA] font-bold' : 'text-[#EDE7DA] font-medium'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[11px] text-[var(--sk-ink-dim)] whitespace-nowrap ml-4">{n.timestamp}</span>
                      </div>
                      <p className={`text-[13px] leading-relaxed ${!n.read ? 'text-[var(--sk-ink-dim)]' : 'text-[var(--sk-ink-faint)]'}`}>
                        {n.message}
                      </p>
                      {n.actionUrl && (
                        <div className="mt-3 inline-block text-[11px] font-bold tracking-widest uppercase text-[var(--sk-gold)]">
                          View Details →
                        </div>
                      )}
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-[var(--sk-gold)] mt-2 shrink-0 shadow-[0_0_10px_rgba(212,168,83,0.5)]" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </SakinahLayout>
  );
};
