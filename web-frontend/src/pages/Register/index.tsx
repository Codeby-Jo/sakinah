import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authPost } from '../../lib/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Full name is required.';
    if (!formData.email.trim()) e.email = 'Email address is required.';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) e.email = 'Invalid email address.';
    if (!formData.password) e.password = 'Password is required.';
    else if (formData.password.length < 8) e.password = 'Password must be at least 8 characters.';
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
          // Since it requires age, gender, etc., we can pass dummy for now or the schema needs default values.
          // Let's pass basic fields. The backend schema requires age, gender, city, education, occupation.
          age: 0, gender: "UNKNOWN", city: "UNKNOWN", education: "UNKNOWN", occupation: "UNKNOWN"
        });
        setShowSuccess(true); 
        setTimeout(() => navigate('/login'), 1500); // go to login to get token
      } catch (err: any) {
        setErrors({ auth: err.message || 'Registration failed' });
      }
    }
  };

  const inp = (field: string, err?: string) =>
    `w-full px-4 py-2.5 border ${err ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#7B1C2E]/30 focus:border-[#7B1C2E] outline-none transition-all`;

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
            <div className="w-9 h-9 rounded-lg bg-[#7B1C2E] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-[#7B1C2E]">Sakinah</span>
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
              <input type="password" value={formData.password} placeholder="Minimum 8 characters"
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className={inp('password', errors.password)} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.terms}
                  onChange={e => setFormData({ ...formData, terms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#7B1C2E] flex-shrink-0" />
                <span className="text-gray-600 text-sm">
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#7B1C2E] hover:underline font-medium">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-[#7B1C2E] hover:underline font-medium">Privacy Policy</Link>
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
              className="w-full bg-[#7B1C2E] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#5e1522] transition-colors shadow-sm"
            >
              Create Account
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">Already have an account?</p>
            <Link to="/login"
              className="mt-3 block w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:border-[#7B1C2E] hover:text-[#7B1C2E] transition-colors text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
