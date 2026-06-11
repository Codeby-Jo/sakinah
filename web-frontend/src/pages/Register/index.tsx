import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authPost } from '../../lib/api';
import { useAppContext } from '../../context/AppContext';

export default function Register() {
  const navigate = useNavigate();
  const { state } = useAppContext();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Full name is required.';
    if (!formData.email.trim()) e.email = 'Email address is required.';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) e.email = 'Invalid email address.';
    if (!formData.password) e.password = 'Password is required.';
    else if (formData.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (!formData.terms) e.terms = 'You must accept the Terms & Conditions.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        await authPost('/auth/register', {
          full_name: formData.name,
          email: formData.email,
          password: formData.password,
          age: 0, gender: "UNKNOWN", city: "UNKNOWN", education: "UNKNOWN", occupation: "UNKNOWN"
        });
        
        // Auto-login to proceed to verification
        try {
          const loginData = new URLSearchParams();
          loginData.append('username', formData.email);
          loginData.append('password', formData.password);
          
          const loginRes = await fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: loginData,
          });
          
          if (!loginRes.ok) throw new Error();
          const tokens = await loginRes.json();
          localStorage.setItem('sakinah_token', tokens.access_token);
        } catch (e) {
          // If auto-login fails, let them manually login
        }
        
        setShowSuccess(true); 
        setTimeout(() => navigate('/verify-email'), 1500);
      } catch (err: any) {
        setErrors({ auth: err.message || 'Registration failed' });
      }
    }
  };

  const inp = (field: string, err?: string, isPassword = false) =>
    `w-full ${isPassword ? 'pl-4 pr-12' : 'px-4'} py-2.5 border ${err ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#0A192F]/30 focus:border-[#0A192F] outline-none transition-all`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold">
          ✅ Account created! Setting up your profile…
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#0A192F] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-[#0A192F]">Sakinah</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Create Your Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of Muslims finding their match the right way</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.name} placeholder="Enter your full name"
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={inp('name', errors.name)} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
              <input type="email" value={formData.email} placeholder="Enter your email"
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className={inp('email', errors.email)} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={formData.password} placeholder="Minimum 8 characters"
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className={inp('password', errors.password, true)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} placeholder="Re-enter your password"
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={inp('confirmPassword', errors.confirmPassword, true)} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.terms}
                  onChange={e => setFormData({ ...formData, terms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0A192F] flex-shrink-0" />
                <span className="text-gray-600 text-sm">
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#0A192F] hover:underline font-medium">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-[#0A192F] hover:underline font-medium">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                ⚠️ {errors.auth ? errors.auth : 'Please fix the errors above.'}
              </div>
            )}

            <button type="submit"
              className="w-full bg-[#0A192F] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#040d1a] transition-colors shadow-sm"
            >
              Create Account
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">Already have an account?</p>
            <Link to="/login"
              className="mt-3 block w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:border-[#0A192F] hover:text-[#0A192F] transition-colors text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
