/* PublicLayout — clean white matrimonial site */
import { Outlet, Link } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      {/* Top announcement bar */}
      <div className="bg-[#7B1C2E] text-white text-xs text-center py-2 px-4">
        🌙 Sakinah — 100% KYC Verified Profiles · Privacy-First Matching · Shariah-Compliant
      </div>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#7B1C2E] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-[#7B1C2E] tracking-wide">Sakinah</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link to="/about"        className="hover:text-[#7B1C2E] transition-colors">About Us</Link>
            <Link to="/how-it-works" className="hover:text-[#7B1C2E] transition-colors">How It Works</Link>
            <Link to="/learn-more"   className="hover:text-[#7B1C2E] transition-colors">Learn More</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login"
              className="text-sm font-semibold text-[#7B1C2E] border border-[#7B1C2E] px-5 py-2 rounded-full hover:bg-[#7B1C2E] hover:text-white transition-all"
            >
              Login
            </Link>
            <Link to="/choose-role"
              className="text-sm font-semibold text-white bg-[#7B1C2E] px-5 py-2 rounded-full hover:bg-[#5e1522] transition-colors shadow-sm"
            >
              Register Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col bg-gray-50"><Outlet /></main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded bg-[#7B1C2E] flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-white font-bold">Sakinah</span>
            </div>
            <p className="text-sm leading-relaxed">Premium Islamic matrimonial platform for Shariah-compliant, verified connections.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/learn-more" className="hover:text-white transition-colors">Learn More</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-800 text-center text-xs">
          © {new Date().getFullYear()} Sakinah Matrimonial. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
