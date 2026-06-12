import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SakinahRolePage: React.FC = () => {
  const navigate = useNavigate();
  const [isWaliExpanded, setIsWaliExpanded] = useState(false);

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[520px]">

          {/* Header */}
          <div className="text-center mb-10 sk-fx sk-d1">
            <div className="font-serif text-[42px] text-[var(--sk-gold)]">۞</div>
            <h1 className="font-serif text-[30px] mt-1 tracking-[1px]">Sakinah</h1>
            <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--sk-ink-faint)] mt-2">
              Choose your path
            </p>
          </div>

          <div className="font-serif italic text-[20px] text-[var(--sk-ink-dim)] text-center mb-8 sk-fx sk-d2">
            "Who are you here as?"
          </div>

          {/* Seeker Card */}
          <div className="sk-fx sk-d2">
            <div
              className="sk-lane"
              onClick={() => navigate('/register')}
            >
              <div className="li">ع</div>
              <h3>I am a Seeker</h3>
              <p>I'm looking for a spouse myself. Walk the journey at your own pace, with guidance beside you.</p>
              <div className="arr">→</div>
            </div>
          </div>

          {/* Wali Card */}
          <div className="sk-fx sk-d3">
            <div
              className="sk-lane"
              onClick={() => setIsWaliExpanded(!isWaliExpanded)}
            >
              <div className="li">۩</div>
              <h3>I am a Wali</h3>
              <p>I'm a parent, guardian, or family member helping someone I love find their match.</p>
              <div className="arr">{isWaliExpanded ? '−' : '→'}</div>
            </div>

            {isWaliExpanded && (
              <div className="mt-[-4px] mb-4 ml-6 pl-5 border-l-2 border-[var(--sk-line)] flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
                <button
                  onClick={() => navigate('/wali/login')}
                  className="text-left w-full p-4 rounded-xl border border-[var(--sk-line-soft)] hover:border-[var(--sk-gold)] bg-[rgba(255,255,255,0.012)] hover:bg-[rgba(212,168,83,0.04)] transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-serif text-[18px] text-[var(--sk-ink)] group-hover:text-[var(--sk-gold)] transition-colors">Login</div>
                    <div className="text-[12px] text-[var(--sk-ink-dim)] font-light mt-1">Access your existing wali account</div>
                  </div>
                  <div className="text-[var(--sk-ink-faint)] group-hover:text-[var(--sk-gold)]">→</div>
                </button>
                <button
                  onClick={() => navigate('/wali/register')}
                  className="text-left w-full p-4 rounded-xl border border-[var(--sk-line-soft)] hover:border-[var(--sk-gold)] bg-[rgba(255,255,255,0.012)] hover:bg-[rgba(212,168,83,0.04)] transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-serif text-[18px] text-[var(--sk-ink)] group-hover:text-[var(--sk-gold)] transition-colors">Find a Match for Someone</div>
                    <div className="text-[12px] text-[var(--sk-ink-dim)] font-light mt-1">Create a profile for your loved one</div>
                  </div>
                  <div className="text-[var(--sk-ink-faint)] group-hover:text-[var(--sk-gold)]">→</div>
                </button>
              </div>
            )}
          </div>

          {/* Back */}
          <div className="text-center mt-6 sk-fx sk-d4">
            <button
              onClick={() => navigate('/')}
              className="text-[12px] text-[var(--sk-ink-faint)] hover:text-[var(--sk-gold)] transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
