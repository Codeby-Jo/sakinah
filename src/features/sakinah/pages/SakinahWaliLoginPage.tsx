import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SakinahInput, SakinahButton, SakinahHeader } from '../components';

export const SakinahWaliLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email or User ID is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      navigate('/wali/dashboard');
    }, 1200);
  };

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px]">
          <SakinahHeader title="Wali Login" subtitle="Access your account" onBack={() => navigate('/role')} />

          <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-6 sk-fx sk-d1">
            Log in to manage profiles, view matches, and communicate on behalf of your loved one.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sk-fx sk-d2">
            <div className="bg-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.15)] rounded-[16px] p-5 flex flex-col gap-4">
              <SakinahInput
                label="Email / User ID"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})); }}
                error={errors.email}
                required
              />
              <SakinahInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})); }}
                error={errors.password}
                required
              />
            </div>

            <div className="flex gap-3 mt-2">
              <SakinahButton variant="ghost" onClick={() => navigate('/role')} type="button" className="flex-1">Back</SakinahButton>
              <SakinahButton variant="primary" type="submit" disabled={isPending} className="flex-1">
                {isPending ? 'Logging in...' : 'Login →'}
              </SakinahButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
