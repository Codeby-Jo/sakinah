import { Link } from 'react-router-dom';

const steps = [
  { num: 1, title: 'Choose Your Role',     desc: 'Select Seeker or Wali to begin your structured journey.' },
  { num: 2, title: 'Build Your Profile',   desc: 'Share your education, lifestyle, and religious values.' },
  { num: 3, title: 'KYC Verification',     desc: 'Upload your government ID. We verify every user manually.' },
  { num: 4, title: 'Set Preferences',      desc: 'Define your dealbreakers and lifestyle preferences precisely.' },
  { num: 5, title: 'NIS Engine',           desc: 'Our psychology-based engine calculates deep compatibility.' },
  { num: 6, title: 'Receive Matches',      desc: 'Review curated profiles. Photos remain hidden initially.' },
  { num: 7, title: 'Express Interest',     desc: 'Respectfully signal your interest to a compatible profile.' },
  { num: 8, title: 'Mutual Interest',      desc: 'When both express interest, photos are revealed.' },
  { num: 9, title: 'Begin Communication', desc: 'Converse securely in a structured, halal environment.' },
];

export default function HowItWorks() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-gray-50 border-b border-gray-100 py-14 text-center px-6">
        <span className="inline-block bg-red-50 text-[#7B1C2E] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
          The Process
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">How Sakinah Works</h1>
        <p className="text-gray-500 max-w-lg mx-auto">A structured 9-step matrimonial journey — not an open marketplace.</p>
      </div>

      {/* Steps grid */}
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map(step => (
            <div key={step.num} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#7B1C2E]/40 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-lg bg-[#7B1C2E] text-white text-sm font-bold flex items-center justify-center mb-4">
                {step.num}
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/choose-role"
            className="inline-block bg-[#7B1C2E] text-white px-10 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#5e1522] transition-colors shadow-sm"
          >
            Start Your Journey — Free
          </Link>
        </div>
      </div>
    </div>
  );
}
