import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus, EnvelopeSimple, Phone, ShieldCheck, CheckCircle } from '@phosphor-icons/react';
import { SakinahButton } from '../components';

export const SakinahWaliSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Persist wali details so the Wali Login page can validate against this email
    try {
      localStorage.setItem('sakinah_onboarding_wali', JSON.stringify([{
        fullName: name,
        email: email,
        phone: phone,
        relationship: 'guardian',
        address: '',
      }]));
    } catch { /* storage full — ignore */ }

    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setSuccess(true);
    setLoading(false);
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
              <p className="text-white/50 text-sm mt-1">Invite your Wali (Guardian) to join your journey securely.</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0A0D1A]/80 backdrop-blur-2xl border border-[rgba(212,175,55,0.15)] rounded-3xl p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]"
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-10"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} className="text-green-400" weight="fill" />
                </div>
                <h3 className="text-2xl font-serif text-[#F5D77A] mb-2">Invitation Sent!</h3>
                <p className="text-white/60 max-w-sm">
                  We've sent an invitation to {name}. Once they accept, they will be linked to your profile as your Wali.
                </p>
                <SakinahButton
                  variant="primary"
                  className="mt-8 px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10"
                  onClick={() => navigate('/matrimony/dashboard')}
                >
                  Return to Dashboard
                </SakinahButton>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-6"
              >
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
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Abdullah Rahman"
                      className="w-full bg-[#050816]/50 border border-[rgba(212,175,55,0.15)] text-white rounded-xl pl-12 pr-4 py-3.5 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all"
                    />
                  </div>
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
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="wali@example.com"
                      className="w-full bg-[#050816]/50 border border-[rgba(212,175,55,0.15)] text-white rounded-xl pl-12 pr-4 py-3.5 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-widest font-semibold text-[#D4AF37]/80">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#050816]/50 border border-[rgba(212,175,55,0.15)] text-white rounded-xl pl-12 pr-4 py-3.5 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-6 border-t border-[rgba(212,175,55,0.1)]">
                  <SakinahButton
                    variant="primary"
                    type="submit"
                    disabled={loading || !name || !email}
                    className="w-full py-4 text-[15px] font-semibold rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                  >
                    {loading ? 'Sending Invite...' : 'Send Invitation link'}
                  </SakinahButton>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default SakinahWaliSetupPage;
