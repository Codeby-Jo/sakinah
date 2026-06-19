import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  SakinahLayout, 
  SakinahReportModal,
  SakinahVerifiedBadge
} from '../components';
import { getTrustScore, getProfileAnalytics, getAnalyticsSummary } from '../services/sakinahApi';
import type { TrustScoreData, ProfileAnalytics } from '../types/sakinah.types';
import { getProgress } from '../services/sakinahProgress';

const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse relative z-10">
    <div className="sk-card gold-edge flex flex-col md:flex-row items-center gap-8 bg-[#111826]/40 border border-[rgba(212,168,83,0.1)]">
      <div className="w-32 h-32 rounded-full bg-[rgba(255,255,255,0.03)]" />
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-[rgba(255,255,255,0.04)] w-1/3 rounded" />
        <div className="h-4 bg-[rgba(255,255,255,0.02)] w-3/4 rounded" />
        <div className="h-8 bg-[rgba(255,255,255,0.03)] w-1/2 rounded" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="sk-card bg-[#111826]/40 h-28 border border-[rgba(255,255,255,0.03)]" />
          <div className="sk-card bg-[#111826]/40 h-28 border border-[rgba(255,255,255,0.03)]" />
        </div>
        <div className="sk-card bg-[#111826]/40 h-64 border border-[rgba(255,255,255,0.03)]" />
      </div>
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="sk-card bg-[#111826]/40 h-24 border border-[rgba(255,255,255,0.03)]" />
          ))}
        </div>
        <div className="sk-card bg-[#111826]/40 h-80 border border-[rgba(255,255,255,0.03)]" />
      </div>
    </div>
  </div>
);

export const SakinahDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const p = getProgress();
  const isLookingForSomeoneElse = p.role === 'LOOKING_FOR_SOMEONE_ELSE';
  const isWaliViewOnly = p.role === 'WALI_VIEW';
  const [reportingProfile, setReportingProfile] = useState<string | null>(null);
  

  
  const [trustScore, setTrustScore] = useState<TrustScoreData | null>(null);
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [summary, setSummary] = useState<{ totalViews: number; interests: number; messages: number; saved: number; } | null>(null);
  const [loading, setLoading] = useState(true);



  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        let scoreData = null;
        let analyticsData = null;
        
        try {
          scoreData = await getTrustScore();
        } catch {
          console.warn("Backend not connected, Trust Score unavailable.");
        }

        try {
          analyticsData = await getProfileAnalytics();
        } catch {
          console.warn('Backend not connected, Profile Analytics unavailable.');
        }

        let summaryData = null;
        try {
          summaryData = await getAnalyticsSummary();
        } catch {
          console.warn('Backend not connected, Analytics Summary unavailable.');
        }

        setTrustScore(scoreData);
        setAnalytics(analyticsData);
        setSummary(summaryData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
  };

  const matches: any[] = []; // Empty for demo purposes
  
  return (
    <SakinahLayout>
      <div className="px-6 py-8 max-w-[1200px] mx-auto pb-24 relative min-h-screen">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.04] pointer-events-none zp-geom-rotate z-0" 
             style={{ backgroundImage: 'radial-gradient(circle, var(--sk-gold) 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-[32px] md:text-[40px] text-[var(--sk-gold)] mb-2 flex items-center gap-3">
              Dashboard
              {!loading && trustScore && (
                <div className="flex gap-2">
                  {trustScore?.factors?.identityVerification && <SakinahVerifiedBadge type="id" />}
                  {trustScore?.factors?.phoneVerification && <SakinahVerifiedBadge type="phone" />}
                  {trustScore?.factors?.emailVerification && <SakinahVerifiedBadge type="email" />}
                </div>
              )}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-[14px] md:text-[16px] text-[var(--sk-ink-dim)] font-light">Your Premium Matrimony Journey</p>
              {isLookingForSomeoneElse && (
                <span className="px-3 py-1 bg-gradient-to-r from-[#10B981]/10 to-transparent border border-[#10B981]/30 text-[#10B981] text-[12px] font-bold tracking-wide rounded-full flex items-center gap-1.5">
                  <span className="text-[14px]">🛡️</span> Managed by Wali (Searching for Someone Else)
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 relative z-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* TRUST SCORE WIDGET */}
                {trustScore ? (
                  <motion.div variants={itemVariants} className="sk-card gold-edge flex flex-col md:flex-row items-center gap-8 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <span className="text-[100px] leading-none text-[var(--sk-gold)]">🛡️</span>
                    </div>
                    
                    <div className="relative shrink-0 z-10">
                      <div className="w-32 h-32 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                          <motion.circle 
                            cx="50" cy="50" r="45" fill="transparent" 
                            stroke="url(#trustGradient)" 
                            strokeWidth="8" 
                            strokeDasharray="283" 
                            initial={{ strokeDashoffset: 283 }}
                            animate={{ strokeDashoffset: 283 - (283 * ((trustScore?.score ?? 0) / 100)) }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10B981" />
                              <stop offset="50%" stopColor="#D4A853" />
                              <stop offset="100%" stopColor="#10B981" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[28px] font-serif text-[#EDE7DA] leading-none mb-1">{trustScore?.score}</span>
                          <span className="text-[10px] text-[var(--sk-ink-dim)] uppercase tracking-widest">/ 100</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left z-10">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                        <h3 className="font-serif text-[24px] text-[var(--sk-ink)] m-0">Sakinah Trust Score</h3>
                        <span className="px-3 py-1 bg-gradient-to-r from-[rgba(212,168,83,0.1)] to-transparent border border-[rgba(212,168,83,0.3)] text-[var(--sk-gold)] text-[12px] font-bold tracking-wide rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(212,168,83,0.1)]">
                          ⭐ {trustScore?.level}
                        </span>
                      </div>
                      <p className="text-[13px] text-[var(--sk-ink-dim)] leading-relaxed max-w-[450px] mb-4">
                        Your high trust score indicates that your profile is fully verified. Profiles with high trust scores receive up to 4x more mutual interests.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {[
                          { key: 'kycCompletion', label: 'KYC Verified' },
                          { key: 'emailVerification', label: 'Email Verified' },
                          { key: 'phoneVerification', label: 'Phone Verified' },
                          { key: 'identityVerification', label: 'ID Check Passed' },
                        ].map((factor) => {
                          const isVerified = trustScore?.factors?.[factor.key as keyof typeof trustScore.factors];
                          return (
                            <div key={factor.key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border ${isVerified ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                              {isVerified ? '✓' : '✕'} {factor.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants} className="sk-card gold-edge flex flex-col items-center justify-center py-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <span className="text-[80px] leading-none text-[var(--sk-gold)]">🛡️</span>
                    </div>
                    <span className="text-[32px] mb-3">🛡️</span>
                    <h3 className="font-serif text-[18px] text-[var(--sk-gold)] mb-1">Trust Score</h3>
                    <p className="text-[13px] text-[var(--sk-ink-dim)] max-w-[320px]">Trust Score will appear when available.</p>
                  </motion.div>
                )}

                {/* PROFILE ANALYTICS WIDGET */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stats Cards */}
                  <div className="flex flex-col gap-4">
                    <div className="sk-card bg-[#111826]/80 flex items-center justify-between group cursor-default hover:border-[rgba(212,168,83,0.4)] transition-colors">
                      <div>
                        <div className="text-[12px] text-[var(--sk-ink-faint)] uppercase tracking-wider mb-1">Weekly Views</div>
                        <div className="font-serif text-[var(--sk-gold)] leading-none">
                          {analytics ? (
                            <span className="text-[28px]">{analytics.weeklyViews}</span>
                          ) : (
                            <span className="text-[14px] text-[var(--sk-ink-dim)] font-light">No activity available</span>
                          )}
                        </div>
                      </div>
                      <div className="text-[32px] opacity-20 group-hover:scale-110 transition-transform">📈</div>
                    </div>
                    <div className="sk-card bg-[#111826]/80 flex items-center justify-between group cursor-default hover:border-[rgba(212,168,83,0.4)] transition-colors">
                      <div>
                        <div className="text-[12px] text-[var(--sk-ink-faint)] uppercase tracking-wider mb-1">Monthly Views</div>
                        <div className="font-serif text-[var(--sk-gold)] leading-none">
                          {analytics ? (
                            <span className="text-[28px]">{analytics.monthlyViews}</span>
                          ) : (
                            <span className="text-[14px] text-[var(--sk-ink-dim)] font-light">No profile views available.</span>
                          )}
                        </div>
                      </div>
                      <div className="text-[32px] opacity-20 group-hover:scale-110 transition-transform">📊</div>
                    </div>
                  </div>

                  {/* Recent Visitors */}
                  <div className="sk-card bg-[#111826]/80 flex flex-col">
                    <h3 className="font-serif text-[18px] text-[var(--sk-ink)] mb-4 flex items-center gap-2">
                      <span className="text-[var(--sk-gold)]">👁</span> Recent Visitors
                    </h3>
                    <div className="flex-1 flex flex-col gap-3 justify-center">
                      {analytics?.recentVisitors && analytics.recentVisitors.length > 0 ? (
                        analytics.recentVisitors.map((v, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors cursor-pointer border border-transparent hover:border-[rgba(255,255,255,0.05)]">
                            <div className="w-10 h-10 rounded-full bg-[rgba(212,168,83,0.1)] flex items-center justify-center text-[var(--sk-gold)] font-serif font-bold text-[14px]">
                              {v?.visitorName?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1">
                              <div className="text-[13px] font-medium text-[#EDE7DA]">{v?.visitorName || 'Unknown'}</div>
                              <div className="text-[11px] text-[var(--sk-ink-dim)]">{v?.timeAgo || ''}</div>
                            </div>
                            <div className="text-[10px] text-[var(--sk-gold)] bg-[rgba(212,168,83,0.1)] px-2 py-1 rounded">View</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[13px] text-[var(--sk-ink-dim)] text-center py-6">No recent visitors available</div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Recommended Matches */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-between mb-5 px-2">
                    <h2 className="font-serif text-[24px] text-[var(--sk-ink)] flex items-center gap-2">
                      <span className="text-[var(--sk-gold)]">✧</span> Recommended Matches
                    </h2>
                    <button onClick={() => navigate('/matrimony/matches')} className="text-[12px] text-[var(--sk-gold)] hover:text-[var(--sk-gold-soft)] transition-colors tracking-widest uppercase font-bold bg-[rgba(212,168,83,0.05)] hover:bg-[rgba(212,168,83,0.1)] px-4 py-2 rounded-full border border-[rgba(212,168,83,0.2)]">
                      View All
                    </button>
                  </div>
                  
                  {matches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                  ) : (
                    <div className="sk-card flex flex-col items-center justify-center py-16 text-center border-dashed border-[rgba(212,168,83,0.3)] bg-[rgba(212,168,83,0.02)] group hover:border-[var(--sk-gold)] transition-colors duration-500">
                      <div className="w-20 h-20 bg-gradient-to-br from-[var(--sk-gold)] to-[#A37B31] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,168,83,0.2)] group-hover:scale-110 transition-transform duration-500">
                        <span className="text-[32px] text-[#0A0E16]">🔍</span>
                      </div>
                      <h3 className="font-serif text-[24px] text-[var(--sk-ink)] mb-3">No matches available.</h3>
                      <p className="text-[14px] text-[var(--sk-ink-dim)] max-w-[320px] mb-8 leading-relaxed">
                        We are currently searching for the best possible matches based on your strict preferences. Check back later or expand your criteria.
                      </p>
                      <button onClick={() => navigate('/matrimony/preferences')} className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all font-bold tracking-wide rounded-xl text-[14px]">
                        Refine Preferences
                      </button>
                    </div>
                  )}
                </motion.div>

              </div>

              {/* Sidebar Column */}
              <div className="space-y-8">
                
                {/* Stats Row */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Views', count: summary ? summary.totalViews : null, icon: '👁️', path: '/matrimony/dashboard' },
                    { label: 'Interests',   count: summary ? summary.interests  : null, icon: '✦',  path: '/matrimony/interests' },
                    { label: 'Messages',    count: summary ? summary.messages   : null, icon: '✉',  path: '/matrimony/messages' },
                    { label: 'Saved',       count: summary ? summary.saved      : null, icon: '★',  path: '/matrimony/saved' },
                  ].map(s => (
                    <div key={s.label} onClick={() => navigate(s.path)} className="sk-card !p-5 text-center cursor-pointer hover:border-[var(--sk-gold)] hover:shadow-[0_0_20px_rgba(212,168,83,0.15)] transition-all duration-300 group">
                      <div className="text-[26px] mb-3 group-hover:scale-110 transition-transform duration-300 opacity-80 group-hover:opacity-100">{s.icon}</div>
                      <div className="text-[28px] font-serif text-[var(--sk-ink)] leading-none mb-2">
                        {loading ? (
                          <span className="inline-block w-6 h-4 bg-[rgba(255,255,255,0.06)] rounded animate-pulse" />
                        ) : s.count !== null ? (
                          s.count
                        ) : (
                          <span className="text-[14px] text-[var(--sk-ink-faint)]">—</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--sk-ink-faint)] uppercase tracking-[0.2em] font-medium">{s.label}</div>
                    </div>
                  ))}
                </motion.div>

                {/* Quick Actions — hidden in Wali View Mode */}
                {!isWaliViewOnly && (
                  <motion.div variants={itemVariants} className="flex flex-col gap-4">
                    <h2 className="font-serif text-[22px] text-[var(--sk-ink)] px-2 mb-1 flex items-center gap-2">
                      <span className="text-[var(--sk-gold)]">⚡</span> Quick Actions
                    </h2>
                    <div className="sk-card !p-6 cursor-pointer hover:border-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.03)] transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(212,168,83,0.2)] group" onClick={() => navigate('/matrimony/profile-creation')}>
                      <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] group-hover:border-[var(--sk-gold)] flex items-center justify-center text-[22px] text-[var(--sk-gold)] mb-4 transition-colors duration-500">⚙️</div>
                      <div className="text-[17px] font-serif text-[var(--sk-ink)] mb-1.5">Edit Profile</div>
                      <div className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-relaxed">Update your personal information, photos, and background details.</div>
                    </div>
                    <div className="sk-card !p-6 cursor-pointer hover:border-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.03)] transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(212,168,83,0.2)] group" onClick={() => navigate('/matrimony/preferences')}>
                      <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] group-hover:border-[var(--sk-gold)] flex items-center justify-center text-[22px] text-[var(--sk-gold)] mb-4 transition-colors duration-500">✨</div>
                      <div className="text-[17px] font-serif text-[var(--sk-ink)] mb-1.5">Edit Preferences</div>
                      <div className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-relaxed">Refine your desired partner criteria, dealbreakers, and timeline.</div>
                    </div>
                  </motion.div>
                )}
                
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      <SakinahReportModal 
        isOpen={!!reportingProfile} 
        onClose={() => setReportingProfile(null)} 
        profileName={reportingProfile || ''} 
      />
    </SakinahLayout>
  );
};

export default SakinahDashboardPage;
