import { Outlet, Link, useLocation } from 'react-router-dom';
import ProgressStepper from '../../components/common/ProgressStepper';

const MARKETING_ROUTES = ['/about', '/how-it-works', '/learn-more', '/contact', '/privacy-policy', '/terms'];

export default function MainLayout() {
  const { pathname } = useLocation();
  const isMarketing = MARKETING_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen bg-[#0A0E16] text-[#F5E8C7] font-sans flex flex-col">
      {/* ─── Top Navbar ─── */}
      <nav className="border-b border-[#2A2E36] px-6 py-4 flex justify-between items-center bg-[#0F131D]/90 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="text-2xl font-bold text-[#D4A853] tracking-widest">
          SAKINAH
        </Link>
        <div className="flex gap-5 items-center text-sm">
          <Link to="/about"       className="text-[#C9A85C] hover:text-[#F5E8C7] transition-colors hidden md:block">About Us</Link>
          <Link to="/how-it-works" className="text-[#C9A85C] hover:text-[#F5E8C7] transition-colors hidden md:block">How It Works</Link>
          <Link to="/learn-more"  className="text-[#C9A85C] hover:text-[#F5E8C7] transition-colors hidden md:block">Learn More</Link>
          <Link to="/login"       className="text-[#F5E8C7] hover:text-white transition-colors">Log In</Link>
          <Link
            to="/register"
            className="bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] px-5 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#D4A853]/20 text-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── Progress Stepper (hidden on pure marketing pages) ─── */}
      {!isMarketing && <ProgressStepper />}

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-[#0A0E16] border-t border-[#2A2E36] py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-[#D4A853] mb-4">SAKINAH</h3>
            <p className="text-[#7A7363] text-sm leading-relaxed">
              Premium Islamic matrimonial platform for Shariah-compliant connections.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#F5E8C7]">Platform</h4>
            <ul className="space-y-2 text-[#C9A85C] text-sm">
              <li><Link to="/how-it-works">How it Works</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/learn-more">Learn More</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#F5E8C7]">Legal</h4>
            <ul className="space-y-2 text-[#C9A85C] text-sm">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#F5E8C7]">Contact</h4>
            <ul className="space-y-2 text-[#C9A85C] text-sm">
              <li><Link to="/contact">Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-8 border-t border-[#2A2E36] text-center text-[#7A7363] text-sm">
          © {new Date().getFullYear()} Sakinah. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
