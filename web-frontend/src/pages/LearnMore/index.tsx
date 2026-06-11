import { Link } from 'react-router-dom';

export default function LearnMore() {
  return (
    <div className="bg-white">
      <div className="bg-gray-50 border-b border-gray-100 py-14 text-center px-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Learn More</h1>
        <p className="text-gray-500">Everything you need to know about Sakinah.</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14 space-y-6">
        {/* Features */}
        <div className="bg-white border border-gray-200 rounded-xl p-7">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Features</h2>
          <ul className="space-y-3">
            {[
              'Advanced psychology-based matchmaking (NIS Engine)',
              'Wali accounts seamlessly linked to Seeker profiles',
              'Blur-first photo privacy — photos hidden until mutual interest',
              'In-depth lifestyle and Deen compatibility metrics',
              'Manual KYC verification for every profile',
            ].map(f => (
              <li key={f} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Security */}
        <div className="bg-white border border-gray-200 rounded-xl p-7">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Security &amp; Privacy</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We employ bank-grade encryption for all personal data. Your government ID used for KYC is never stored permanently after verification. Photos are blurred by default and only revealed when mutual interest is established between two members.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-gray-200 rounded-xl p-7">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Frequently Asked Questions</h2>
          <div className="space-y-5 divide-y divide-gray-100">
            {[
              { q: 'Is Sakinah free to use?', a: 'Basic matching is free. Premium features are available for serious seekers who want additional reach and insights.' },
              { q: 'Can my Wali (guardian) manage my account?', a: 'Yes. By selecting the "Wali" role during registration, a guardian can create and manage a profile on behalf of someone in their care.' },
              { q: 'How does the NIS matching engine work?', a: 'NIS (Nafsiyya Intelligence System) analyses your values, life goals, family background, and dealbreakers — not just age or location — to find genuinely compatible profiles.' },
              { q: 'When are photos revealed?', a: 'Photos remain blurred until both parties independently express interest in each other. This ensures interactions are values-first.' },
            ].map(({ q, a }) => (
              <div key={q} className="pt-4 first:pt-0">
                <p className="font-semibold text-gray-800 text-sm mb-1.5">{q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-4">
          <Link to="/choose-role"
            className="inline-block bg-[#0A192F] text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-[#040d1a] transition-colors"
          >
            Get Started — It's Free
          </Link>
        </div>
      </div>
    </div>
  );
}
