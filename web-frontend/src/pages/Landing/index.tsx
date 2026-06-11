import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="flex flex-col bg-white">

      {/* ── HERO ── */}
      <section className="bg-white py-16 lg:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-red-50 text-[#0A192F] text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
              Trusted Islamic Matrimonial Platform
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
              Find Your Righteous Match<br />
              <span className="text-[#0A192F]">The Right Way</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Sakinah connects practicing Muslims through a structured, verified, and privacy-first matrimonial journey. No casual browsing — only serious intentions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/choose-role"
                className="text-center bg-[#0A192F] text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-[#040d1a] transition-colors shadow-sm text-sm"
              >
                Register Free
              </Link>
              <Link to="/how-it-works"
                className="text-center border border-gray-300 text-gray-700 px-8 py-3.5 rounded-lg font-semibold hover:border-[#0A192F] hover:text-[#0A192F] transition-colors text-sm"
              >
                How It Works
              </Link>
            </div>
            {/* Stats */}
            <div className="flex gap-8 mt-10 pt-8 border-t border-gray-100">
              {[
                { n: '10K+', l: 'Verified Members' },
                { n: '100%', l: 'KYC Verified'     },
                { n: '500+', l: 'Marriages'         },
              ].map(s => (
                <div key={s.l}>
                  <p className="text-2xl font-extrabold text-[#0A192F]">{s.n}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — feature highlight card */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Why Sakinah?</h3>
            <div className="space-y-5">
              {[
                { icon: '🛡️', title: 'Every profile is KYC verified', desc: 'No fake profiles. No unverified strangers.' },
                { icon: '🔒', title: 'Photos hidden until mutual interest', desc: 'Focus on character and values first.' },
                { icon: '🧠', title: 'NIS deep compatibility matching', desc: 'Beyond demographics — values, family goals, deen.' },
                { icon: '🤲', title: 'Wali (Guardian) involvement supported', desc: 'Family participation built into the process.' },
              ].map(f => (
                <div key={f.title} className="flex gap-4 items-start">
                  <span className="text-2xl flex-shrink-0">{f.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/choose-role"
              className="mt-8 block text-center bg-[#0A192F] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#040d1a] transition-colors"
            >
              Start Your Journey — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Matrimonial Journey</h2>
            <p className="text-gray-500">A structured 9-step process — not a marketplace.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Choose Your Role',     desc: 'Register as a Seeker or as a Wali representing someone in your care.' },
              { n: '02', title: 'Build Your Profile',   desc: 'Share your values, education, family background, and what you seek.' },
              { n: '03', title: 'KYC Verification',     desc: 'Upload your government ID and selfie. We verify everyone manually.' },
              { n: '04', title: 'Set Preferences',      desc: 'Define your dealbreakers, location, education, and lifestyle criteria.' },
              { n: '05', title: 'NIS Matching Engine',  desc: 'Our system analyses character, values, and goals — not just age or looks.' },
              { n: '06', title: 'View Matches',         desc: 'Review curated profiles. Photos are blurred until mutual interest.' },
              { n: '07', title: 'Express Interest',     desc: 'Send a respectful interest signal to profiles you connect with.' },
              { n: '08', title: 'Mutual Interest',      desc: 'When both parties are interested, photos reveal and chat unlocks.' },
              { n: '09', title: 'Begin Communication',  desc: 'Converse in a safe, structured environment toward marriage.' },
            ].map(s => (
              <div key={s.n} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#0A192F]/40 hover:shadow-sm transition-all">
                <p className="text-3xl font-extrabold text-[#0A192F]/20 mb-3">{s.n}</p>
                <h4 className="font-bold text-gray-900 mb-2 text-sm">{s.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">Success Stories</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10">
            <p className="text-lg text-gray-700 italic leading-relaxed mb-6">
              "Because photos were hidden initially, I actually read every word of his profile. We connected on values and faith first. Alhamdulillah, we married within four months."
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0A192F]/10 border border-[#0A192F]/20 flex items-center justify-center font-bold text-[#0A192F] text-sm">F</div>
              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm">Fatima & Umar</p>
                <p className="text-gray-400 text-xs">London, UK — Married 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-12 bg-[#0A192F]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { n: '100%', l: 'KYC Verified' },
            { n: '0',    l: 'Fake Profiles' },
            { n: '10K+', l: 'Active Members' },
            { n: '1',    l: 'Goal — Marriage' },
          ].map(s => (
            <div key={s.l}>
              <p className="text-4xl font-extrabold mb-1">{s.n}</p>
              <p className="text-red-200 text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Begin with the right intention.</h2>
          <p className="text-gray-500 mb-8">Join thousands of Muslims seeking marriage the right way.</p>
          <Link to="/choose-role"
            className="inline-block bg-[#0A192F] text-white px-10 py-4 rounded-lg font-bold text-base hover:bg-[#040d1a] transition-colors shadow-sm"
          >
            Create Your Profile — Free
          </Link>
          <p className="text-gray-400 text-xs mt-4">No credit card required. KYC verification included.</p>
        </div>
      </section>
    </div>
  );
}
