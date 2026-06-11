import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { authPost } from '../../lib/api';

const SECTIONS = ['Personal', 'Religious', 'Family', 'Career', 'About Me', 'Photo'] as const;
type Section = typeof SECTIONS[number];

const locations  = [
  'Mumbai', 'Delhi', 'Hyderabad', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'London', 'Birmingham', 'Manchester', 'Leicester',
  'New York', 'Chicago', 'Houston', 'Los Angeles', 'Detroit',
  'Toronto', 'Mississauga', 'Ottawa', 'Vancouver',
  'Dubai', 'Abu Dhabi', 'Sharjah',
  'Kuala Lumpur', 'Johor Bahru', 'Penang',
  'Riyadh', 'Jeddah', 'Mecca', 'Medina',
  'Singapore', 'Sydney', 'Melbourne', 'Dhaka', 'Karachi', 'Lahore', 'Islamabad',
];
const educations = [
  'High School / O-Levels / A-Levels',
  'Diploma / Vocational Training',
  "Bachelor's Degree (BA / BSc / BEng)",
  "Master's Degree (MA / MSc / MEng / MBA)",
  'PhD / Doctorate',
  'MBBS / Medical Degree',
  'Law Degree (LLB / LLM)',
  'Architecture (BArch / MArch)',
  'Islamic Studies / Darul Uloom',
  'Currently Studying',
  'Other',
];
const occupations = [
  // Healthcare
  'Doctor (MBBS / MD)', 'Dentist', 'Pharmacist', 'Nurse / Midwife', 'Physiotherapist',
  // Engineering & Tech
  'Software Engineer / Developer', 'Data Scientist / Analyst', 'Electrical Engineer',
  'Civil / Structural Engineer', 'Mechanical Engineer', 'IT Professional',
  // Finance & Business
  'Accountant / CA / CPA', 'Investment Banker / Finance', 'Business Owner / Entrepreneur',
  'Marketing / Sales Professional', 'Management Consultant',
  // Law & Government
  'Lawyer / Solicitor / Barrister', 'Judge / Magistrate', 'Civil Servant / Government Officer', 'Police / Military',
  // Education
  'University Professor / Lecturer', 'School Teacher', 'Islamic Scholar / Imam',
  // Architecture & Design
  'Architect', 'Interior Designer', 'Graphic / UI Designer',
  // Media & Creative
  'Journalist / Writer', 'Photographer / Videographer',
  // Other
  'Pilot / Aviation', 'Scientist / Researcher', 'Social Worker / NGO',
  'Self-Employed / Freelancer', 'Student (Currently Studying)', 'Homemaker', 'Other',
];

function Input({ label, value, onChange, error, placeholder = '', type = 'text', required = true }: {
  label: string; value: string; onChange: (v: string) => void;
  error?: string; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 border ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#0A192F]/30 focus:border-[#0A192F] outline-none transition-all`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Select({ label, value, onChange, children, error, required = true }: {
  label: string; value: string; onChange: (v: string) => void;
  children: React.ReactNode; error?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 border ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg text-gray-800 text-sm focus:ring-2 focus:ring-[#0A192F]/30 focus:border-[#0A192F] outline-none appearance-none bg-white transition-all`}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Combo({ label, value, onChange, options, placeholder, error, required = true }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string; error?: string; required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const filtered = options.filter(o => o.toLowerCase().includes(value.toLowerCase()));
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type="text" value={value} placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={`w-full px-4 py-2.5 border ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#0A192F]/30 focus:border-[#0A192F] outline-none transition-all`}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.map(opt => (
            <div
              key={opt}
              onMouseDown={e => { e.preventDefault(); onChange(opt); setOpen(false); }}
              className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-800 text-sm border-b border-gray-50 last:border-0"
            >{opt}</div>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function SectionCard({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 pb-5 border-b border-gray-100 mb-6">
      <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
      <div>
        <h2 className="font-bold text-gray-900">{title}</h2>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { setProfile } = useAppContext();
  const [activeSection, setActiveSection] = useState<Section>('Personal');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: '', dob: '', location: '', height_cm: '',
    religion: '', tradition: '', islamic_environment_preference: '', maritalStatus: '',
    fatherOccupation: '', siblings: '', familyDescription: '',
    education: '', occupation: '', work_outlook: '',
    bio: '', marriage_readiness: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (f: string) => (v: string) => setForm(p => ({ ...p, [f]: v }));

  const sIdx = SECTIONS.indexOf(activeSection);
  const completedSections = SECTIONS.filter((_, i) => i < sIdx);

  const validate = (section: Section): boolean => {
    const e: Record<string, string> = {};
    if (section === 'Personal') {
      if (!form.firstName.trim()) e.firstName = 'First name is required';
      if (!form.lastName.trim())  e.lastName  = 'Last name is required';
      if (!form.gender)           e.gender    = 'Gender is required';
      if (!form.dob)              e.dob       = 'Date of birth is required';
      if (!form.location)         e.location  = 'Location is required';
      if (!form.height_cm)        e.height_cm = 'Height is required';
      if (!form.marriage_readiness) e.marriage_readiness = 'Required';
    }
    if (section === 'Religious') {
      if (!form.religion)      e.religion      = 'Required';
      if (!form.tradition)     e.tradition     = 'Required';
      if (!form.islamic_environment_preference) e.islamic_environment_preference = 'Required';
      if (!form.maritalStatus) e.maritalStatus = 'Required';
    }
    if (section === 'Career') {
      if (!form.education)  e.education  = 'Required';
      if (!form.occupation) e.occupation = 'Required';
      if (!form.work_outlook) e.work_outlook = 'Required';
    }
    if (section === 'About Me' && !form.bio.trim())  e.bio   = 'Please write a short introduction';
    if (section === 'Photo'   && !photo)              e.photo = 'A profile photo is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = async () => {
    if (!validate(activeSection)) return;
    const nextIdx = sIdx + 1;
    if (nextIdx < SECTIONS.length) { 
        setActiveSection(SECTIONS[nextIdx]); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
    else { 
        try {
            await authPost('/profile', form);
            setProfile({ completed: true, data: form }); 
            setShowSuccess(true); 
            setTimeout(() => navigate('/kyc'), 1500); 
        } catch (err: any) {
            setErrors({ _global: err.message || 'Failed to save profile' });
        }
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) { setErrors(p => ({ ...p, photo: 'Only JPG and PNG supported.' })); return; }
    setPhoto(file); setPhotoPreview(URL.createObjectURL(file));
    setErrors(p => { const n = { ...p }; delete n.photo; return n; });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold">
          ✅ Profile saved! Moving to KYC…
        </div>
      )}

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-gray-900">Build Your Matrimonial Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Complete each section carefully — this is what curates your matches.</p>
      </div>

      {/* Section tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-7">
        {SECTIONS.map((s) => {
          const isDone   = completedSections.includes(s);
          const isActive = s === activeSection;
          return (
            <button key={s} onClick={() => setActiveSection(s)}
              className={[
                'flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all border',
                isActive ? 'bg-[#0A192F] text-white border-[#0A192F]' :
                isDone   ? 'bg-green-50 text-green-700 border-green-200' :
                           'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
              ].join(' ')}
            >
              {isDone ? '✓ ' : ''}{s}
            </button>
          );
        })}
      </div>

      {/* Section card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm space-y-5">
        {activeSection === 'Personal' && <>
          <SectionCard icon="👤" title="Personal Information" subtitle="Basic details about yourself." />
          <div className="grid sm:grid-cols-2 gap-5">
            <Input label="First Name"    value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
            <Input label="Last Name"     value={form.lastName}  onChange={set('lastName')}  error={errors.lastName}  />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Select label="Gender" value={form.gender} onChange={set('gender')} error={errors.gender}>
              <option value="">Select Gender</option>
              <option>Male</option><option>Female</option>
            </Select>
            <Input label="Date of Birth" value={form.dob} onChange={set('dob')} type="date" error={errors.dob} />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Input label="Height (cm)" value={form.height_cm} onChange={set('height_cm')} type="number" placeholder="e.g. 175" error={errors.height_cm} />
            <Combo label="Location" value={form.location} onChange={set('location')} options={locations} placeholder="Type your city…" error={errors.location} />
          </div>
          <Select label="Marriage Readiness" value={form.marriage_readiness} onChange={set('marriage_readiness')} error={errors.marriage_readiness}>
            <option value="">Select Option</option>
            <option value="READY_NOW">Ready to marry right now</option>
            <option value="WITHIN_6_MONTHS">Within 6 months</option>
            <option value="WITHIN_1_YEAR">Within 1 year</option>
            <option value="EXPLORING">Just exploring right now</option>
          </Select>
        </>}

        {activeSection === 'Religious' && <>
          <SectionCard icon="🕌" title="Religious Background" subtitle="Faith and values form the foundation of marriage." />
          <Select label="Level of Practice" value={form.religion} onChange={set('religion')} error={errors.religion}>
            <option value="">Select…</option>
            <option value="HIGHLY_PRACTICING">Highly Practicing</option>
            <option value="MODERATELY_PRACTICING">Moderately Practicing</option>
            <option value="CULTURALLY_MUSLIM">Culturally Muslim</option>
          </Select>
          <Select label="Islamic Tradition / Madhhab" value={form.tradition} onChange={set('tradition')} error={errors.tradition}>
            <option value="">Select Option</option>
            <option value="SUNNI_HANAFI">Sunni (Hanafi)</option>
            <option value="SUNNI_SHAFI">Sunni (Shafi'i)</option>
            <option value="SUNNI_MALIKI">Sunni (Maliki)</option>
            <option value="SUNNI_HANBALI">Sunni (Hanbali)</option>
            <option value="SUNNI_AHL_AL_HADITH">Sunni (Ahl al-Hadith / Salafi)</option>
            <option value="SHIA_TWELVER">Shia (Twelver)</option>
            <option value="JUST_MUSLIM">Just Muslim / No specific Madhhab</option>
            <option value="OTHER">Other</option>
          </Select>
          <Select label="Preferred Islamic Home Environment" value={form.islamic_environment_preference} onChange={set('islamic_environment_preference')} error={errors.islamic_environment_preference}>
            <option value="">Select Option</option>
            <option value="HIGHLY_TRADITIONAL">Highly Traditional / Strict</option>
            <option value="BALANCED_ISLAMIC_HOME">Balanced Islamic Home</option>
            <option value="MODERN_PRACTICING">Modern but Practicing</option>
            <option value="FLEXIBLE">Flexible / Relaxed</option>
          </Select>
          <Select label="Marital Status" value={form.maritalStatus} onChange={set('maritalStatus')} error={errors.maritalStatus}>
            <option value="">Select…</option>
            <option value="NEVER_MARRIED">Single – Never Married</option>
            <option value="DIVORCED">Divorced</option>
            <option value="WIDOWED">Widowed</option>
          </Select>
        </>}

        {activeSection === 'Family' && <>
          <SectionCard icon="👨‍👩‍👧" title="Family Background" subtitle="Family is at the heart of Sakinah." />
          <Input label="Father's Occupation" value={form.fatherOccupation} onChange={set('fatherOccupation')} placeholder="e.g. Doctor, Teacher…" required={false} />
          <Input label="Number of Siblings"  value={form.siblings}         onChange={set('siblings')}         placeholder="e.g. 2"                required={false} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Family Description</label>
            <textarea rows={4} value={form.familyDescription} onChange={e => setForm(f => ({ ...f, familyDescription: e.target.value }))}
              placeholder="Describe your family background and home environment…"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#0A192F]/30 focus:border-[#0A192F] outline-none" />
          </div>
        </>}

        {activeSection === 'Career' && <>
          <SectionCard icon="🎓" title="Education & Career" subtitle="Your academic and professional background." />
          <div className="grid sm:grid-cols-2 gap-5">
            <Combo label="Education Level" value={form.education} onChange={set('education')} options={educations} placeholder="e.g. Bachelor's Degree…" error={errors.education} />
            <Select label="Work Outlook" value={form.work_outlook} onChange={set('work_outlook')} error={errors.work_outlook}>
              <option value="">Select Option</option>
              <option value="CAREER_FOCUSED">Highly Career Focused</option>
              <option value="BALANCED">Balanced Work/Life</option>
              <option value="FAMILY_FIRST">Family First (Work is secondary)</option>
              <option value="PREFER_NOT_TO_WORK">Prefer not to work / Homemaker</option>
            </Select>
          </div>
          <Combo label="Occupation" value={form.occupation} onChange={set('occupation')} options={occupations} placeholder="e.g. Engineer…" error={errors.occupation} />
        </>}

        {activeSection === 'About Me' && <>
          <SectionCard icon="✍️" title="Your Introduction" subtitle="Write honestly — this is your first impression." />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">About Me <span className="text-red-500">*</span></label>
            <textarea rows={6} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Describe your values, what you seek in a spouse, and your vision for married life…"
              className={`w-full px-4 py-2.5 border ${errors.bio ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#0A192F]/30 focus:border-[#0A192F] outline-none`} />
            {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
          </div>
        </>}

        {activeSection === 'Photo' && <>
          <SectionCard icon="📸" title="Profile Photo" subtitle="Your photo stays blurred for all users until mutual interest." />
          <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" ref={fileRef} onChange={handleFile} />
          {!photoPreview ? (
            <div onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed ${errors.photo ? 'border-red-400' : 'border-gray-300 hover:border-[#0A192F]/50'} rounded-xl p-12 text-center cursor-pointer bg-gray-50 transition-colors`}>
              <div className="text-4xl mb-3">📸</div>
              <p className="text-gray-700 font-semibold text-sm">Click to upload your photo</p>
              <p className="text-gray-400 text-xs mt-1">JPG or PNG — max 5MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#0A192F]/30 flex-shrink-0">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-semibold text-sm">{photo?.name}</p>
                <p className="text-green-600 text-xs mt-1">✓ Photo uploaded</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="text-xs px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full">Replace</button>
                <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full">Remove</button>
              </div>
            </div>
          )}
          {errors.photo && <p className="text-red-500 text-xs">{errors.photo}</p>}
        </>}

        {Object.keys(errors).length > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            ⚠️ {errors._global || 'Please complete all required fields.'}
          </div>
        )}

        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <button type="button" onClick={() => sIdx > 0 && setActiveSection(SECTIONS[sIdx - 1])} disabled={sIdx === 0}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-30 text-sm font-medium">
            ← Back
          </button>
          <button type="button" onClick={goNext}
            className="bg-[#0A192F] text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#040d1a] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {sIdx === SECTIONS.length - 1 ? 'Complete Profile' : 'Save & Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
