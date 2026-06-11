import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.email.trim()) e.email = 'Email address is required.';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) e.email = 'Invalid email address.';
    if (!formData.password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) { setShowSuccess(true); setTimeout(() => navigate('/dashboard'), 1500); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold">
          ✅ Login successful! Redirecting…
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#7B1C2E] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-[#7B1C2E]">Sakinah</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to continue your journey</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address <span className="text-red-500">*</span>
              </label>
              <input type="email" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#7B1C2E]/30 focus:border-[#7B1C2E] outline-none transition-all`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input type="password" value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className={`w-full px-4 py-2.5 border ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#7B1C2E]/30 focus:border-[#7B1C2E] outline-none transition-all`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#7B1C2E]" />
                Remember me
              </label>
              <a href="#" className="text-sm text-[#7B1C2E] hover:underline font-medium">Forgot password?</a>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                ⚠️ Please fix the errors above.
              </div>
            )}

            <button type="submit"
              className="w-full bg-[#7B1C2E] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#5e1522] transition-colors shadow-sm"
            >
              Sign In
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">Don't have an account?</p>
            <Link to="/choose-role"
              className="mt-3 block w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:border-[#7B1C2E] hover:text-[#7B1C2E] transition-colors text-center"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
