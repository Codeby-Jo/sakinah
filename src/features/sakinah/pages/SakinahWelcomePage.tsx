import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SakinahWelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="sk-viewport">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(212,168,83,0.08),transparent_60%)]" />
        </div>

        <div className="relative z-10 max-w-[640px] mx-auto">
          {/* Logo */}
          <div className="sk-fx sk-d1">
            <div className="font-serif text-[52px] text-[var(--sk-gold)] mb-2">۞</div>
            <h1 className="font-serif text-[42px] md:text-[52px] tracking-[2px] text-[var(--sk-ink)] leading-[1.1]">
              Sakinah
            </h1>
            <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-[var(--sk-gold-dim)] mt-3">
              Where character meets destiny
            </p>
          </div>

          {/* Tagline */}
          <p className="sk-fx sk-d2 font-serif italic text-[20px] md:text-[24px] text-[var(--sk-ink-dim)] mt-8 leading-[1.5]">
            A matrimony platform built on trust, values, and the belief that the right match is found through <em className="text-[var(--sk-gold-soft)]">character</em>, not just a checklist.
          </p>

          {/* CTA */}
          <div className="sk-fx sk-d3 mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/role')}
              className="sk-btn sk-btn-gold w-auto px-12 text-[15px]"
            >
              Get Started →
            </button>
          </div>

          {/* Trust badges */}
          <div className="sk-fx sk-d4 flex flex-wrap justify-center gap-6 mt-10">
            {['Verified Profiles', 'Privacy First', 'Islamic Values'].map(badge => (
              <span key={badge} className="text-[11px] text-[var(--sk-ink-faint)] flex items-center gap-2">
                <span className="w-[6px] h-[6px] rounded-full bg-[var(--sk-green)]" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-[900px] mx-auto px-6 py-20">
        <h2 className="font-serif text-[32px] text-center text-[var(--sk-ink)] mb-4 sk-fx sk-d1">About Sakinah</h2>
        <p className="text-center text-[14px] text-[var(--sk-ink-dim)] font-light leading-[1.8] max-w-[600px] mx-auto sk-fx sk-d2">
          Sakinah is a premium Islamic matrimony platform that prioritises character, values, and genuine compatibility. 
          We don't start with a photo or a checklist. We start with <em className="text-[var(--sk-gold-soft)]">you</em> — 
          your intentions, your values, and the kind of life you wish to build together.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-[1000px] mx-auto px-6 py-16">
        <h2 className="font-serif text-[28px] text-center text-[var(--sk-ink)] mb-12 sk-fx sk-d1">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 sk-fx sk-d2">
          {[
            { icon: '◉', title: 'Verified Identity', desc: 'Every user passes government ID verification and liveness checks. No fakes, no catfishing.' },
            { icon: '♡', title: 'Character-First Matching', desc: 'Our proprietary NIS engine evaluates compatibility through values, psychology, and life goals — not just demographics.' },
            { icon: '⌥', title: 'Privacy Protected', desc: 'Photos are blurred by default. Your data is encrypted. Nothing is shared without your explicit consent.' },
          ].map(f => (
            <div key={f.title} className="sk-card p-6 text-center">
              <div className="text-[28px] text-[var(--sk-gold)] mb-3">{f.icon}</div>
              <h3 className="font-serif text-[18px] text-[var(--sk-ink)] mb-2">{f.title}</h3>
              <p className="text-[12px] text-[var(--sk-ink-dim)] font-light leading-[1.6]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Success Stories */}
      <section className="max-w-[900px] mx-auto px-6 py-16">
        <h2 className="font-serif text-[28px] text-center text-[var(--sk-ink)] mb-12 sk-fx sk-d1">Stories of Barakah</h2>
        <div className="grid md:grid-cols-2 gap-6 sk-fx sk-d2">
          {[
            { names: 'Ahmed & Fatima', story: '"Sakinah matched us on values we didn\'t even know we shared. The character-first approach meant we connected on what truly matters before anything superficial."', location: 'London, UK' },
            { names: 'Yusuf & Maryam', story: '"As a wali, I could monitor everything transparently. The platform gave me confidence that my daughter\'s interests were protected at every step."', location: 'Toronto, CA' },
          ].map(s => (
            <div key={s.names} className="sk-card gold-edge p-6">
              <p className="font-serif italic text-[14px] text-[var(--sk-ink-dim)] leading-[1.7] mb-4">{s.story}</p>
              <div className="text-[13px] text-[var(--sk-gold-soft)] font-medium">{s.names}</div>
              <div className="text-[11px] text-[var(--sk-ink-faint)]">{s.location}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-20 px-6 sk-fx sk-d1">
        <h2 className="font-serif text-[28px] text-[var(--sk-ink)] mb-4">Begin Your Journey</h2>
        <p className="text-[13px] text-[var(--sk-ink-dim)] font-light mb-8">Your path to a blessed union starts with a single step.</p>
        <button
          onClick={() => navigate('/role')}
          className="sk-btn sk-btn-gold w-auto px-12 text-[15px] inline-block"
        >
          Get Started →
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--sk-line-soft)] py-8 px-6 text-center">
        <div className="text-[11px] text-[var(--sk-ink-faint)]">© 2026 Sakinah — A Zaryah Initiative. All rights reserved.</div>
      </footer>
    </div>
  );
};
