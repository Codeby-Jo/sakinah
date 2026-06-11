import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#F5E8C7] mb-6">About Sakinah</h1>
        <p className="text-xl text-[#C9A85C]">Redefining Islamic matchmaking for the modern era.</p>
      </div>

      <section className="bg-[#0F131D] p-8 rounded-3xl border border-[#2A2E36]">
        <h2 className="text-2xl font-bold text-[#D4A853] mb-4">Our Mission</h2>
        <p className="text-[#7A7363] leading-relaxed">
          To facilitate pure, Shariah-compliant marriages by prioritizing character, deen, and deep psychological compatibility over superficial metrics. We believe that finding a spouse should be a dignified and secure journey.
        </p>
      </section>

      <section className="bg-[#0F131D] p-8 rounded-3xl border border-[#2A2E36]">
        <h2 className="text-2xl font-bold text-[#D4A853] mb-4">Our Vision</h2>
        <p className="text-[#7A7363] leading-relaxed">
          A world where every Muslim seeking marriage can find their righteous match in an environment free from ghosting, casual dating norms, and unverified intentions.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-[#1A1F2D] p-8 rounded-3xl border border-[#2A2E36]">
          <h2 className="text-xl font-bold text-[#F5E8C7] mb-4">Islamic Values</h2>
          <ul className="space-y-3 text-[#7A7363]">
            <li>• Halal interactions only</li>
            <li>• Wali (Guardian) integration</li>
            <li>• Modesty in presentation</li>
            <li>• Focus on Niyyah (intention)</li>
          </ul>
        </section>
        
        <section className="bg-[#1A1F2D] p-8 rounded-3xl border border-[#2A2E36]">
          <h2 className="text-xl font-bold text-[#F5E8C7] mb-4">Trust & Safety</h2>
          <ul className="space-y-3 text-[#7A7363]">
            <li>• Strict KYC Verification</li>
            <li>• Anti-catfishing measures</li>
            <li>• Zero tolerance for harassment</li>
            <li>• Privacy-first photo sharing</li>
          </ul>
        </section>
      </div>

      <div className="text-center pt-8 border-t border-[#2A2E36]">
        <Link to="/contact" className="text-[#D4A853] hover:text-[#E8C97A] font-bold">
          Contact our Support Team &rarr;
        </Link>
      </div>
    </div>
  );
}
