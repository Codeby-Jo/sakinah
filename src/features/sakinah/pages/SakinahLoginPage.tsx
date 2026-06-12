import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahInput, 
  SakinahButton,
  SakinahHeader 
} from '../components';

export const SakinahLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsPending(true);
    
    // Simulate login
    setTimeout(() => {
      setIsPending(false);
      navigate('/sakinah/wali-dashboard');
    }, 1200);
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Wali Portal" 
        subtitle="Steward the journey" 
        onBack={() => navigate('/sakinah/role')} 
      />

      <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-[24px] text-center sk-fx sk-d1">
        Log in to access your dashboard. Here you can steward your loved one's journey, view their considered matches, and interpret between chatting profiles.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[rgba(201,138,138,0.1)] border border-[rgba(201,138,138,0.2)] text-[var(--sk-rose)] text-[12px] text-center sk-fx sk-d1">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-[18px] sk-fx sk-d2" onSubmit={handleSubmit} noValidate>
        
        <div className="bg-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.15)] rounded-[13px] p-[16px] flex flex-col gap-[12px]">
          <div>
            <label className="block font-serif text-[16px] text-[var(--sk-gold)] mb-2">Username or Email</label>
            <SakinahInput 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
            />
          </div>
          <div>
            <label className="block font-serif text-[16px] text-[var(--sk-gold)] mb-2">Password</label>
            <SakinahInput 
              type="password" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
            />
          </div>
        </div>

        <div className="sk-fx sk-d3 mt-[11px]">
          <SakinahButton 
            type="submit" 
            variant="primary"
            disabled={isPending}
          >
            {isPending ? 'Authenticating...' : 'Enter Dashboard →'}
          </SakinahButton>
        </div>
      </form>
    </SakinahJourneyFrame>
  );
};
