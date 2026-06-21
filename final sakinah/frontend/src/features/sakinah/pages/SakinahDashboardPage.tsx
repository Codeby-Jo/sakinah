import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  SakinahLayout, 
  SakinahReportModal,
  SakinahVerifiedBadge
} from '../components';
import { 
  ShieldCheck, 
  Star, 
  Check, 
  X, 
  TrendUp, 
  ChartBar, 
  Eye, 
  Sparkle, 
  EnvelopeSimple, 
  BookmarkSimple, 
  Lightning, 
  Gear, 
  MagnifyingGlass,
  Copy,
  CheckCircle,
  CaretRight
} from '@phosphor-icons/react';
import { getTrustScore, getProfileAnalytics, getAnalyticsSummary, getConsideredFew, getSakinahProfile } from '../services/sakinahApi';
import type { TrustScoreData, ProfileAnalytics } from '../types/sakinah.types';
import { getProgress } from '../services/sakinahProgress';
import { useOnboarding } from '../context/OnboardingContext';

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
  const { profile } = useOnboarding();
  const [reportingProfile, setReportingProfile] = useState<{id: string, name: string} | null>(null);
  const [copied, setCopied] = useState(false);
  

  
  const [trustScore, setTrustScore] = useState<TrustScoreData | null>(null);
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [summary, setSummary] = useState<{ totalViews: number; interests: number; messages: number; saved: number; } | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [serverProfile, setServerProfile] = useState<any>(null);
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
          if (isWaliViewOnly) {
            scoreData = { score: 95, factors: { identityVerification: true, phoneVerification: true, emailVerification: true, socialLinks: true }, tier: 'Elite' };
          }
        }

        try {
          analyticsData = await getProfileAnalytics();
        } catch {
          console.warn('Backend not connected, Profile Analytics unavailable.');
          if (isWaliViewOnly) {
            analyticsData = { totalViews: 142, viewsThisWeek: 12, viewsByCity: { 'London': 45, 'Manchester': 20 }, viewsByAge: { '25-30': 80 } };
          }
        }

        let summaryData = null;
        try {
          summaryData = await getAnalyticsSummary();
        } catch {
          console.warn('Backend not connected, Analytics Summary unavailable.');
          if (isWaliViewOnly) {
            summaryData = { totalViews: 142, interests: 3, messages: 2, saved: 5 };
          }
        }

        let matchesData: any[] = [];
        try {
          const res = await getConsideredFew();
          matchesData = (res.candidates || res.results || []).slice(0, 2);
        } catch {
          console.warn('Backend not connected, Matches unavailable.');
        }

        let srvProfile = null;
        try {
          srvProfile = await getSakinahProfile();
        } catch {
          console.warn('Backend not connected, Server profile unavailable.');
        }

        setTrustScore(scoreData);
        setAnalytics(analyticsData);
        setSummary(summaryData);
        setMatches(matchesData);
        setServerProfile(srvProfile);
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


  
  return (
    <SakinahLayout>
      <div className="px-6 py-8 max-w-[1200px] mx-auto pb-24 relative min-h-screen">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.04] pointer-events-none zp-geom-rotate z-0" 
             style={{ backgroundImage: 'radial-gradient(circle, var(--sk-gold) 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-sans font-light text-[32px] md:text-[40px] text-[var(--sk-gold)] mb-2 flex items-center gap-3">
              {profile?.firstName ? `Welcome, ${profile.firstName}` : 'Dashboard'}
              {!loading && trustScore && (
                <div className="flex gap-2">
                  {trustScore?.factors?.emailVerification && <SakinahVerifiedBadge type="email" />}
                </div>
              )}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-[14px] md:text-[16px] text-[var(--sk-ink-dim)] font-light">Your Premium Matrimony Journey</p>
              {(isLookingForSomeoneElse || isWaliViewOnly) && (
                <span className="px-3 py-1 bg-gradient-to-r from-[rgba(212,175,55,0.1)] to-[rgba(212,175,55,0.05)] border border-[var(--sk-gold)] text-[var(--sk-gold)] text-[12px] font-bold tracking-widest uppercase rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                  <span className="text-[14px]">🛡️</span> WALI VERIFIED
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
                
                {/* USER PROFILE WIDGET */}
                <motion.div variants={itemVariants} className="sk-card gold-edge flex flex-col md:flex-row items-center gap-8 group relative overflow-hidden">
                  
                  <div className="relative shrink-0 z-10">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                      {profile?.profilePhoto ? (
                         <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#A37B31] flex items-center justify-center text-[#0A0E16] text-[48px] font-serif font-bold">
                            {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : (serverProfile?.firstName ? serverProfile.firstName.charAt(0).toUpperCase() : 'S')}
                         </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left z-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                      <h3 className="font-serif text-[28px] text-[#F5D77A] m-0">
                        {profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : (serverProfile?.fullName || 'User Profile')}
                      </h3>
                      {trustScore?.level === 'VERIFIED' && (
                        <span className="px-3 py-1 bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 text-[#D4AF37] text-[12px] font-bold tracking-wide rounded-full flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                          <CheckCircle weight="fill" className="text-[14px]" /> Verified Profile
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-[var(--sk-ink-dim)] leading-relaxed max-w-[450px] mb-4">
                      Your premium matrimonial profile is active. Keep your preferences updated to receive the most accurate recommendations.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {[
                        { key: 'kycCompletion', label: 'KYC Verified' },
                        { key: 'emailVerification', label: 'Email Verified' }
                      ].map((factor) => {
                        const isVerified = trustScore?.factors?.[factor.key as keyof typeof trustScore.factors];
                        return (
                          <div key={factor.key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border ${isVerified ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {isVerified ? <Check weight="bold" /> : <X weight="bold" />} {factor.label}
                          </div>
                        );
                      })}
                      {/* Sakinah ID with Copy feature */}
                      <div 
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30 cursor-pointer hover:bg-[#D4AF37]/20 transition-colors"
                        onClick={() => {
                          const idToCopy = serverProfile?.sakinah_id || profile?.sakinah_id;
                          if (idToCopy) {
                            navigator.clipboard.writeText(idToCopy as string);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }
                        }}
                        title="Click to copy ID"
                      >
                        <span>ID: {serverProfile?.sakinah_id || profile?.sakinah_id || 'Pending Generation'}</span>
                        {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
                      </div>
                    </div>
                  </div>
                </motion.div>


                {/* Recommended Matches */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-between mb-5 px-2">
                    <h2 className="font-serif text-[24px] text-[var(--sk-ink)] flex items-center gap-2">
                      <span className="text-[var(--sk-gold)]"><Sparkle weight="fill" /></span> Recommended Matches
                    </h2>
                    <button onClick={() => navigate('/matrimony/matches')} className="text-[12px] text-[var(--sk-gold)] hover:text-[var(--sk-gold-soft)] transition-colors tracking-widest uppercase font-bold bg-[rgba(212,168,83,0.05)] hover:bg-[rgba(212,168,83,0.1)] px-4 py-2 rounded-full border border-[rgba(212,168,83,0.2)]">
                      View All
                    </button>
                  </div>
                  
                  {matches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matches.map(m => (
                        <div 
                          key={m.candidate_id || m.id} 
                          className="group relative overflow-hidden bg-gradient-to-br from-[#111826] to-[#0A0E16] border border-[#2A2E3B] hover:border-[#D4AF37]/50 rounded-2xl p-5 cursor-pointer transition-all duration-500 shadow-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transform hover:-translate-y-1"
                          onClick={() => navigate(`/matrimony/candidates/${m.candidate_id || m.id}`)}
                        >
                          <div className="absolute right-0 top-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
                          <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 flex items-center justify-center text-[20px] font-serif font-bold text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] group-hover:scale-110 transition-transform duration-500">
                              {m.display_name?.[0] || m.name?.[0] || 'C'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-serif text-[16px] text-[#EDE7DA] mb-1 group-hover:text-[#D4AF37] transition-colors">{m.display_name || m.name || 'Candidate'}</h4>
                              <p className="text-[12px] text-[#8F9BB3] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#10B981]"></span>
                                {m.match_percentage || m.confidence_score ? `${Math.round(m.match_percentage || m.confidence_score * 100)}% Match` : 'Strong Match'}
                              </p>
                            </div>
                            <div className="w-8 h-8 shrink-0 rounded-full bg-[#1A2035] flex items-center justify-center text-[#D4AF37] opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                              <CaretRight weight="bold" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="sk-card flex flex-col items-center justify-center py-16 text-center border-dashed border-[rgba(212,168,83,0.3)] bg-[rgba(212,168,83,0.02)] group hover:border-[var(--sk-gold)] transition-colors duration-500">
                      <div className="w-20 h-20 bg-gradient-to-br from-[var(--sk-gold)] to-[#A37B31] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,168,83,0.2)] group-hover:scale-110 transition-transform duration-500">
                        <span className="text-[32px] text-[#0A0E16]"><MagnifyingGlass weight="duotone" /></span>
                      </div>
                      <h3 className="font-serif text-[24px] text-[var(--sk-ink)] mb-3">No matches available.</h3>
                      <p className="text-[14px] text-[var(--sk-ink-dim)] max-w-[320px] mb-8 leading-relaxed">
                        We are currently searching for the best possible matches based on your strict preferences. Check back later or expand your criteria.
                      </p>
                      {!isWaliViewOnly && (
                        <button onClick={() => navigate('/matrimony/preferences')} className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all font-bold tracking-wide rounded-xl text-[14px]">
                          Refine Preferences
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>

              </div>

              {/* Sidebar Column */}
              <div className="space-y-8">
                
                {/* Stats Row */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Total Views', count: summary ? summary.totalViews : null, path: isWaliViewOnly ? '/matrimony/wali-views' : '/matrimony/views' },
                      { label: 'Interests',   count: summary ? summary.interests  : null, path: isWaliViewOnly ? '/matrimony/wali-interests' : '/matrimony/interests' },
                      { label: 'Messages',    count: summary ? summary.messages   : null, path: isWaliViewOnly ? '/matrimony/wali-messages' : '/matrimony/messages' },
                      { label: 'Saved',       count: summary ? summary.saved      : null, path: isWaliViewOnly ? '/matrimony/wali-saved' : '/matrimony/saved' },
                    ].map((s, idx) => (
                      <div key={idx} onClick={() => navigate(s.path)} className="sk-card !p-5 text-center cursor-pointer border border-[rgba(255,255,255,0.05)] hover:border-[rgba(212,168,83,0.5)] hover:bg-[rgba(212,168,83,0.05)] transition-all duration-500 group flex flex-col justify-center min-h-[100px] overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(212,168,83,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="text-[32px] font-serif text-[var(--sk-ink)] group-hover:text-[var(--sk-gold)] group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(212,168,83,0.4)] leading-none mb-2 transition-all duration-500 relative z-10">
                        {loading ? (
                          <span className="inline-block w-6 h-4 bg-[rgba(255,255,255,0.06)] rounded animate-pulse" />
                        ) : s.count !== null ? (
                          s.count
                        ) : (
                          <span className="text-[14px] text-[var(--sk-ink-faint)]">—</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--sk-ink-faint)] group-hover:text-[var(--sk-gold)] transition-colors duration-500 uppercase tracking-[0.2em] font-medium relative z-10">{s.label}</div>
                    </div>
                  ))}
                </motion.div>

                {/* Quick Actions — hidden in Wali View Mode */}
                {!isWaliViewOnly && (
                  <motion.div variants={itemVariants} className="flex flex-col gap-4">
                    <h2 className="font-serif text-[22px] text-[#EDE7DA] px-2 mb-1 flex items-center gap-2">
                      <span className="text-[var(--sk-gold)]"><Lightning weight="fill" /></span> Quick Actions
                    </h2>
                    
                    <div 
                      className="group relative overflow-hidden bg-gradient-to-br from-[#111826] to-[#0A0E16] border border-[#2A2E3B] hover:border-[#D4AF37]/50 rounded-2xl p-5 cursor-pointer transition-all duration-500 shadow-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transform hover:-translate-y-1"
                      onClick={() => navigate('/matrimony/profile-creation')}
                    >
                      <div className="absolute right-0 top-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 flex items-center justify-center text-[24px] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] group-hover:scale-110 transition-transform duration-500">
                          <Gear weight="duotone" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-serif text-[16px] text-[#EDE7DA] mb-1 group-hover:text-[#D4AF37] transition-colors">Edit Profile</h4>
                          <p className="text-[12px] text-[#8F9BB3] leading-relaxed line-clamp-2">Update your personal information, photos, and background details.</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#1A2035] flex items-center justify-center text-[#D4AF37] opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                          <CaretRight weight="bold" />
                        </div>
                      </div>
                    </div>

                    <div 
                      className="group relative overflow-hidden bg-gradient-to-br from-[#111826] to-[#0A0E16] border border-[#2A2E3B] hover:border-[#D4AF37]/50 rounded-2xl p-5 cursor-pointer transition-all duration-500 shadow-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transform hover:-translate-y-1"
                      onClick={() => navigate('/matrimony/preferences')}
                    >
                      <div className="absolute right-0 top-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 flex items-center justify-center text-[24px] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] group-hover:scale-110 transition-transform duration-500">
                          <Sparkle weight="duotone" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-serif text-[16px] text-[#EDE7DA] mb-1 group-hover:text-[#D4AF37] transition-colors">Edit Preferences</h4>
                          <p className="text-[12px] text-[#8F9BB3] leading-relaxed line-clamp-2">Refine your desired partner criteria, dealbreakers, and timeline.</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#1A2035] flex items-center justify-center text-[#D4AF37] opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                          <CaretRight weight="bold" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
              </div>
            </div>
          </motion.div>
        )}
      </div>
      {/* Report Modal */}
      <SakinahReportModal 
        isOpen={!!reportingProfile} 
        onClose={() => setReportingProfile(null)} 
        profileName={reportingProfile?.name || ''}
        reportedUserId={reportingProfile?.id || ''} 
      />
    </SakinahLayout>
  );
};

export default SakinahDashboardPage;
