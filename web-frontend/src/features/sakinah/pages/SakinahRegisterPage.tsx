import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerSakinah } from '../services/sakinahApi';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahInput, SakinahButton, SakinahHeader } from '../components';

export const SakinahRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!auth.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(auth.email)) e.email = 'Enter a valid email';
    if (!auth.phone) e.phone = 'Phone number is required';
    else if (auth.phone.length < 10) e.phone = 'Enter a valid phone number';
    if (!auth.password) e.password = 'Password is required';
    else if (auth.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!auth.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (auth.password !== auth.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await registerSakinah({
          email: auth.email,
          password: auth.password,
          full_name: "Seeker", 
          age: 20
        });
        if (response.user_id) {
          navigate('/verify-otp');
        }
      } catch (err: any) {
        setErrors({ ...errors, general: err.message || 'Registration failed' });
      }
    }
  };

  const update = (field: keyof typeof auth, value: string) => {
    setAuth(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          <SakinahHeader title="Create Account" subtitle="Step 1 of 6 · Registration" onBack={() => navigate('/role')} />

          {/* Progress */}
          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-[var(--sk-gold)] transition-all duration-500" style={{ width: '16%' }} />
          </div>

          <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-6 sk-fx sk-d1">
            Create your Sakinah account. Your information is encrypted and never shared without your consent.
          </p>

          {errors.general && (
            <div className="mb-4 p-3 rounded-lg bg-[rgba(201,138,138,0.1)] border border-[rgba(201,138,138,0.2)] text-[var(--sk-rose)] text-[12px] text-center">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sk-fx sk-d2">
            <SakinahInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={auth.email}
              onChange={e => update('email', e.target.value)}
              error={errors.email}
              required
            />
            <SakinahInput
              label="Phone Number"
              type="tel"
              placeholder="+91 XXXXXXXXXX"
              value={auth.phone}
              onChange={e => update('phone', e.target.value)}
              error={errors.phone}
              required
            />
            <SakinahInput
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={auth.password}
              onChange={e => update('password', e.target.value)}
              error={errors.password}
              required
            />
            <SakinahInput
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={auth.confirmPassword}
              onChange={e => update('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              required
            />

            <div className="flex gap-3 mt-4">
              <SakinahButton variant="ghost" onClick={() => navigate('/role')} type="button" className="flex-1">
                Back
              </SakinahButton>
              <SakinahButton variant="primary" type="submit" className="flex-1">
                Continue →
              </SakinahButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
