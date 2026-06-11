import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const inp = (err?: string) =>
  `w-full px-4 py-2.5 border ${err ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#7B1C2E]/30 focus:border-[#7B1C2E] outline-none transition-all bg-white appearance-none`;

const LOCATIONS = [
  'Anywhere (Open to all)', 'Same Country', 'Same City / Region',
  'India', 'Pakistan', 'Bangladesh', 'United Kingdom', 'United States', 'Canada',
  'Australia', 'UAE / Dubai', 'Saudi Arabia', 'Malaysia', 'Singapore', 'Other',
];

const MARITAL = ['Never Married', 'Divorced (No Children)', 'Divorced (With Children)', 'Widowed', 'Any'];

const SECT = ['Sunni', 'Shia', 'Any Sunni Madhab', 'Any — Open to Difference'];

export default function Preferences() {
  const navigate = useNavigate();
  const { setPreferences } = useAppContext();

  const [form, setForm] = useState({
    minAge: '', maxAge: '',
    locationPref: '',
    educationPref: '', occupationPref: '',
    maritalStatus: '',
    religiousPref: '', sect: '',
    dealBreakers: '', lifestyle: '',
  });

  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.minAge)        e.minAge       = 'Required';
    if (!form.maxAge)        e.maxAge       = 'Required';
    if (form.minAge && form.maxAge && +form.minAge > +form.maxAge) e.maxAge = 'Max must be ≥ Min';
    if (!form.locationPref)  e.locationPref = 'Required';
    if (!form.educationPref) e.educationPref = 'Required';
    if (!form.religiousPref) e.religiousPref = 'Required';
    if (!form.maritalStatus) e.maritalStatus = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setPreferences({ completed: true, data: form });
    setShowSuccess(true);
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const sel = (field: string, label: string, options: string[], error?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} <span className="text-red-500">*</span>
      </label>
      <select value={(form as any)[field]} onChange={set(field)} className={inp(error)}>
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold">
          ✅ Preferences saved! Heading to Dashboard…
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Match Preferences</h1>
        <p className="text-gray-500 text-sm mt-1">Tell us what you are looking for in a spouse. Be precise — this directly shapes your matches.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Age Range ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 text-base mb-4">Age Range</h2>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Age <span className="text-red-500">*</span></label>
              <input type="number" min={18} max={70} placeholder="e.g. 22"
                value={form.minAge} onChange={set('minAge')}
                className={inp(errors.minAge)} />
              {errors.minAge && <p className="text-red-500 text-xs mt-1">{errors.minAge}</p>}
            </div>
            <div className="pt-8 text-gray-400 font-bold">—</div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum Age <span className="text-red-500">*</span></label>
              <input type="number" min={18} max={70} placeholder="e.g. 35"
                value={form.maxAge} onChange={set('maxAge')}
                className={inp(errors.maxAge)} />
              {errors.maxAge && <p className="text-red-500 text-xs mt-1">{errors.maxAge}</p>}
            </div>
          </div>
        </div>

        {/* ── Location & Marital Status ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base">Location &amp; Background</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {sel('locationPref', 'Location Preference', LOCATIONS, errors.locationPref)}
            {sel('maritalStatus', 'Marital Status Preference', MARITAL, errors.maritalStatus)}
          </div>
        </div>

        {/* ── Education & Occupation ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base">Education &amp; Career</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {sel('educationPref', 'Minimum Education', [
              'No Preference',
              'High School or Equivalent',
              'Diploma / Vocational',
              "Bachelor's Degree or Higher",
              "Master's Degree or Higher",
              'PhD / Doctorate',
              'Islamic Studies',
            ], errors.educationPref)}
            {sel('occupationPref', 'Occupation Preference', [
              'No Preference',
              'Healthcare (Doctor, Nurse, Pharmacist)',
              'Engineering & Technology',
              'Education & Teaching',
              'Finance & Accounting',
              'Law & Legal Services',
              'Business & Entrepreneurship',
              'Civil Services / Government',
              'Architecture & Design',
              'Research & Academia',
              'Self-Employed / Freelancer',
              'Student (Currently studying)',
              'Other',
            ], errors.occupationPref)}
          </div>
        </div>

        {/* ── Religion ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base">Religious Preferences</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {sel('religiousPref', 'Level of Practice', [
              'Highly Practicing (Practicing regularly)',
              'Moderately Practicing',
              'Culturally Muslim (Muslim by identity)',
              'Open to any level of practice',
            ], errors.religiousPref)}
            {sel('sect', 'Sect / Madhab', SECT)}
          </div>
        </div>

        {/* ── Lifestyle & Dealbreakers ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base">Lifestyle &amp; Dealbreakers</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Lifestyle Expectations</label>
            <textarea rows={3} value={form.lifestyle} onChange={set('lifestyle')}
              placeholder="e.g. Wife stays home, willing to relocate, values family dinners…"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#7B1C2E]/30 focus:border-[#7B1C2E] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Absolute Dealbreakers</label>
            <textarea rows={3} value={form.dealBreakers} onChange={set('dealBreakers')}
              placeholder="e.g. Smoking, does not want children, lives abroad permanently…"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#7B1C2E]/30 focus:border-[#7B1C2E] outline-none" />
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            ⚠️ Please complete all required fields.
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button type="submit"
            className="bg-[#7B1C2E] text-white px-10 py-3 rounded-lg font-semibold text-sm hover:bg-[#5e1522] transition-colors shadow-sm"
          >
            Save Preferences &amp; Continue →
          </button>
        </div>
      </form>
    </div>
  );
}
