import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus, EnvelopeSimple, Phone, ShieldCheck, CheckCircle, Trash, Users } from '@phosphor-icons/react';
import { SakinahButton } from '../components';
import { inviteFamilyMember } from '../services/sakinahApi';

export interface WaliAccount {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  relationship: string;
}

export const SakinahWaliSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [walis, setWalis] = useState<WaliAccount[]>([]);
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sakinah_onboarding_wali');
      if (stored) {
        setWalis(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; phone?: string; name?: string } = {};
    if (!name.trim() || name.trim().length < 3) {
      newErrors.name = 'Please enter a valid full name (at least 3 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage(false);
    
    const newWali: WaliAccount = {
      id: Date.now().toString(),
      fullName: name,
      email: email,
      relationship: 'Guardian'
    };

    const updatedWalis = [...walis, newWali];
    setWalis(updatedWalis);
    
    try {
      localStorage.setItem('sakinah_onboarding_wali', JSON.stringify(updatedWalis));
    } catch { /* storage full — ignore */ }

    // Sync with backend so /wali/verify works
    try {
      await inviteFamilyMember(name, email, 'Guardian');
    } catch (err) {
      console.warn('Backend not connected, saved locally only.', err);
    }
    
    setName('');
    setEmail('');
    setSuccessMessage(true);
    setLoading(false);
    
    setTimeout(() => setSuccessMessage(false), 3000);
  };

  const handleDelete = (idOrEmail: string) => {
    const updatedWalis = walis.filter(w => (w.id || w.email) !== idOrEmail);
    setWalis(updatedWalis);
    try {
      localStorage.setItem('sakinah_onboarding_wali', JSON.stringify(updatedWalis));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#050816] flex relative overflow-hidden font-sans p-6 md:p-12">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] left-[10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,#D4AF37_0%,transparent_70%)] blur-[120px]"
        />
      </div>

      <div className="max-w-2xl mx-auto w-full z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button 
            onClick={() => navigate('/matrimony/dashboard')}
            className="text-white/50 hover:text-[#D4AF37] transition-colors text-sm mb-6 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <ShieldCheck size={24} className="text-[#050816]" weight="fill" />
            </div>
            <div>
              <h1 className="text-3xl font-serif text-[#F5D77A]">Wali Setup</h1>
              <p className="text-white/50 text-sm mt-1">Add your Wali (Guardian) to your journey securely.</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0A0D1A]/80 backdrop-blur-2xl border border-[rgba(212,175,55,0.15)] rounded-3xl p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] mb-8"
        >
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
              >
                <CheckCircle size={20} className="text-green-400" weight="fill" />
                <span className="text-green-400 text-sm font-medium">Wali account added successfully.</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-widest font-semibold text-[#D4AF37]/80">
                Wali's Full Name
              </label>
              <div className="relative">
                <UserPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="e.g. Abdullah Rahman"
                  className={`w-full bg-[#050816]/50 border text-white rounded-xl pl-12 pr-4 py-3.5 outline-none transition-all ${errors.name ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' : 'border-[rgba(212,175,55,0.15)] focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20'}`}
                />
              </div>
              {errors.name && <span className="text-red-400 text-[11px] mt-1">{errors.name}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-widest font-semibold text-[#D4AF37]/80">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeSimple size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="wali@example.com"
                  className={`w-full bg-[#050816]/50 border text-white rounded-xl pl-12 pr-4 py-3.5 outline-none transition-all ${errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' : 'border-[rgba(212,175,55,0.15)] focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20'}`}
                />
              </div>
              {errors.email && <span className="text-red-400 text-[11px] mt-1">{errors.email}</span>}
            </div>

            <div className="mt-4 pt-6 border-t border-[rgba(212,175,55,0.1)]">
              <SakinahButton
                variant="primary"
                type="submit"
                disabled={loading || !name || !email}
                className="w-full py-4 text-[15px] font-semibold rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Wali...' : 'Add Wali'}
              </SakinahButton>
            </div>
          </form>
        </motion.div>

        {/* Added Walis Section */}
        {walis.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0A0D1A]/80 backdrop-blur-2xl border border-[rgba(212,175,55,0.15)] rounded-3xl p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]"
          >
            <h2 className="text-[#F5D77A] text-xl font-serif mb-6 flex items-center gap-2">
              <Users size={24} className="text-[#D4AF37]" />
              Added Walis
            </h2>
            <div className="space-y-4">
              {walis.map((wali) => (
                <div key={wali.id || wali.email} className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#050816]/80 border border-[rgba(212,175,55,0.15)] p-5 rounded-2xl gap-4">
                  <div className="flex flex-col">
                    <span className="text-white font-medium text-[15px]">{wali.fullName}</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                      <span className="text-white/50 text-[13px] flex items-center gap-1.5"><EnvelopeSimple size={14}/> {wali.email}</span>
                      <span className="text-[#D4AF37]/80 text-[13px] flex items-center gap-1.5"><ShieldCheck size={14}/> {wali.relationship}</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleDelete(wali.id || wali.email)}
                    className="flex items-center justify-center gap-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-4 py-2.5 rounded-xl transition-colors text-[13px] font-semibold tracking-wide"
                  >
                    <Trash size={16} />
                    REMOVE
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-end"
        >
          <SakinahButton
            variant="ghost"
            onClick={() => navigate('/matrimony/dashboard')}
            className="px-8 py-3 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl hover:bg-[#D4AF37]/10"
          >
            {walis.length > 0 ? 'Continue to Dashboard →' : 'Skip & Continue →'}
          </SakinahButton>
        </motion.div>
      </div>
    </div>
  );
};

export default SakinahWaliSetupPage;
