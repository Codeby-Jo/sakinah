import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const SECTIONS = ['Basic Matches', 'Deen & Family', 'Communication', 'Character', 'Dealbreakers'] as const;
type Section = typeof SECTIONS[number];

const LOCATIONS = [
  'Anywhere (Open to all)', 'Same Country', 'Same City / Region',
  'India', 'Pakistan', 'Bangladesh', 'United Kingdom', 'United States', 'Canada',
  'Australia', 'UAE', 'Saudi Arabia', 'Malaysia', 'Singapore', 'Other',
];

const EDUCATIONS = [
  'No Preference', 'High School / Equivalent', 'Diploma / Vocational',
  "Bachelor's Degree", "Master's Degree", 'PhD / Doctorate', 'Islamic Studies',
];

const TRADITIONS = [
  'SUNNI_HANAFI', 'SUNNI_SHAFI', 'SUNNI_MALIKI', 'SUNNI_HANBALI',
  'SUNNI_AHL_AL_HADITH', 'SHIA_TWELVER', 'JUST_MUSLIM', 'OPEN_TO_ALL'
];

export default function Preferences() {
  const navigate = useNavigate();
  const { setPreferences } = useAppContext();
  const [activeSection, setActiveSection] = useState<Section>('Basic Matches');
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    // Basic Matches
    minAge: '', maxAge: '',
    locationPref: '', locationFlexibility: '',
    maritalStatus: '', heightMin: '', heightMax: '',
    educationPref: '', workOutlook: '', workAfterMarriage: '',
    
    // Deen & Family
    traditionPref: '', traditionStrictness: '',
    religiousPracticePref: '', islamicEnvPref: '',
    learningPref: '', reminderStyle: '', practiceImportance: '',
    familyInvolvement: '', waliInvolvement: '', marriageTimeline: '',
    familyPressureLevel: '', familyAwareConvo: '',

    // Communication (v1)
    communicationStyle: '', repairStyle: '', angerLevel: '',
    emotionalSteadiness: '', boundaryStrength: '', financialResp: '', lifestyle: '',

    // Character (v2)
    disagreementResponse: '', familyPressureResponse: '',
    angerResponse: '', accountabilityResponse: '', boundaryResponse: '',
    personalSpaceResponse: '', emotionalDescription: '',
    sensitivePartnerResponse: '', religiousLeadershipResponse: '', financialDecisionResponse: '',

    // Dealbreakers
    dealbreakersText: '',
    strictAge: false, strictLocation: false, strictTradition: false, strictMarital: false,
    noMatchConfirmed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const sIdx = SECTIONS.indexOf(activeSection);
  const completedSections = SECTIONS.filter((_, i) => i < sIdx);

  const validate = (section: Section): boolean => {
    const e: Record<string, string> = {};
    if (section === 'Basic Matches') {
      if (!form.minAge) e.minAge = 'Required';
      if (!form.maxAge) e.maxAge = 'Required';
      if (form.minAge && form.maxAge && +form.minAge > +form.maxAge) e.maxAge = 'Max must be ≥ Min';
      if (!form.locationPref) e.locationPref = 'Required';
      if (!form.maritalStatus) e.maritalStatus = 'Required';
      if (!form.educationPref) e.educationPref = 'Required';
    }
    if (section === 'Deen & Family') {
      if (!form.traditionPref) e.traditionPref = 'Required';
      if (!form.religiousPracticePref) e.religiousPracticePref = 'Required';
      if (!form.islamicEnvPref) e.islamicEnvPref = 'Required';
      if (!form.familyInvolvement) e.familyInvolvement = 'Required';
    }
    if (section === 'Communication') {
      if (!form.communicationStyle) e.communicationStyle = 'Required';
      if (!form.repairStyle) e.repairStyle = 'Required';
      if (!form.angerLevel) e.angerLevel = 'Required';
    }
    if (section === 'Character') {
      if (!form.disagreementResponse) e.disagreementResponse = 'Required';
      if (!form.accountabilityResponse) e.accountabilityResponse = 'Required';
      if (!form.angerResponse) e.angerResponse = 'Required';
    }
    if (section === 'Dealbreakers') {
      if (!form.noMatchConfirmed) e.noMatchConfirmed = 'You must acknowledge the matching policy';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validate(activeSection)) return;
    const nextIdx = sIdx + 1;
    if (nextIdx < SECTIONS.length) { 
      setActiveSection(SECTIONS[nextIdx]); 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    } else { 
      setPreferences({ completed: true, data: form }); 
      setShowSuccess(true); 
      setTimeout(() => navigate('/dashboard'), 2000); 
    }
  };

  const inp = (err?: string) =>
    `w-full px-4 py-2.5 border ${err ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#7B1C2E]/30 focus:border-[#7B1C2E] outline-none transition-all bg-white appearance-none`;

  const sel = (field: string, label: string, options: {val: string, label: string}[], error?: string) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} <span className="text-red-500">*</span></label>
      <select value={(form as any)[field]} onChange={set(field)} className={inp(error)}>
        <option value="">Select Option</option>
        {options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold">
          ✅ NIS Preferences saved! Curating your matches...
        </div>
      )}

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-gray-900">Match Preferences &amp; Compatibility</h1>
        <p className="text-gray-500 text-sm mt-1">Your answers securely guide the NIS psychology engine to find deeply compatible matches.</p>
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
                isActive ? 'bg-[#7B1C2E] text-white border-[#7B1C2E]' :
                isDone   ? 'bg-green-50 text-green-700 border-green-200' :
                           'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
              ].join(' ')}
            >
              {isDone ? '✓ ' : ''}{s}
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
        
        {/* TAB 1: BASIC MATCHES */}
        {activeSection === 'Basic Matches' && <>
          <h2 className="font-bold text-gray-900 mb-5">Basic Candidate Preferences</h2>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Age *</label>
              <input type="number" value={form.minAge} onChange={set('minAge')} placeholder="e.g. 22" className={inp(errors.minAge)} />
              {errors.minAge && <p className="text-red-500 text-xs mt-1">{errors.minAge}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Age *</label>
              <input type="number" value={form.maxAge} onChange={set('maxAge')} placeholder="e.g. 30" className={inp(errors.maxAge)} />
              {errors.maxAge && <p className="text-red-500 text-xs mt-1">{errors.maxAge}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {sel('locationPref', 'Preferred Location', LOCATIONS.map(l => ({val: l, label: l})), errors.locationPref)}
            {sel('locationFlexibility', 'Location Flexibility', [
              {val: 'STRICT_SAME_CITY', label: 'Strictly Same City'},
              {val: 'SAME_STATE_OR_OPEN', label: 'Same State / Open'},
              {val: 'OPEN_TO_RELOCATE', label: 'Open to Relocate / Anywhere'}
            ], errors.locationFlexibility)}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {sel('maritalStatus', 'Preferred Marital Status', [
              {val: 'NEVER_MARRIED', label: 'Never Married'},
              {val: 'DIVORCED_NO_KIDS', label: 'Divorced (No Children)'},
              {val: 'OPEN_TO_ALL', label: 'Open to All'}
            ], errors.maritalStatus)}
            {sel('educationPref', 'Preferred Education', EDUCATIONS.map(e => ({val: e, label: e})), errors.educationPref)}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {sel('workOutlook', 'Preferred Work Outlook', [
              {val: 'CAREER_FOCUSED', label: 'Career Focused'},
              {val: 'BALANCED', label: 'Balanced Work/Life'},
              {val: 'FAMILY_FIRST', label: 'Family First'}
            ])}
            {sel('workAfterMarriage', 'Open to working after marriage?', [
              {val: 'YES', label: 'Yes, fully supportive'},
              {val: 'NO', label: 'No, prefer homemaker'},
              {val: 'FLEXIBLE', label: 'Flexible / Let us discuss'}
            ])}
          </div>
        </>}

        {/* TAB 2: DEEN & FAMILY */}
        {activeSection === 'Deen & Family' && <>
          <h2 className="font-bold text-gray-900 mb-5">Religious &amp; Family Alignment</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {sel('traditionPref', 'Preferred Islamic Tradition', TRADITIONS.map(t => ({val: t, label: t.replace(/_/g, ' ')})), errors.traditionPref)}
            {sel('traditionStrictness', 'Tradition Strictness', [
              {val: 'STRICTLY_SAME', label: 'Must be exactly same'},
              {val: 'FLEXIBLE_WITHIN_SUNNI', label: 'Flexible within Sunni'},
              {val: 'OPEN', label: 'Open to respectful difference'}
            ])}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {sel('religiousPracticePref', 'Preferred Religious Practice', [
              {val: 'HIGHLY_PRACTICING', label: 'Highly Practicing'},
              {val: 'MODERATELY_PRACTICING', label: 'Moderately Practicing'},
              {val: 'FLEXIBLE', label: 'Flexible'}
            ], errors.religiousPracticePref)}
            {sel('islamicEnvPref', 'Preferred Islamic Home Environment', [
              {val: 'HIGHLY_TRADITIONAL', label: 'Highly Traditional / Strict'},
              {val: 'BALANCED_ISLAMIC_HOME', label: 'Balanced Islamic Home'},
              {val: 'MODERN_PRACTICING', label: 'Modern but Practicing'}
            ], errors.islamicEnvPref)}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {sel('learningPref', 'How should Islamic learning happen?', [
              {val: 'TOGETHER', label: 'Learning together as a couple'},
              {val: 'INDIVIDUAL', label: 'Individual responsibility'},
              {val: 'SCHOLAR_LED', label: 'Guided by local scholars/teachers'}
            ])}
            {sel('reminderStyle', 'How should spouses remind each other?', [
              {val: 'GENTLE_PRIVATE', label: 'Gentle & Private only'},
              {val: 'DIRECT_FIRM', label: 'Direct & Firm'},
              {val: 'LEAD_BY_EXAMPLE', label: 'Lead by example silently'}
            ])}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5 mt-2">
            {sel('familyInvolvement', 'Preferred Family Involvement', [
              {val: 'FAMILY_AWARE_EARLY', label: 'Family aware early'},
              {val: 'FAMILY_INVOLVED_AFTER_INTEREST', label: 'Family involved after mutual interest'},
              {val: 'FAMILY_WHEN_SERIOUS', label: 'Family involved when serious'},
              {val: 'FLEXIBLE', label: 'Flexible'}
            ], errors.familyInvolvement)}
            {sel('marriageTimeline', 'Expected Marriage Timeline', [
              {val: 'WITHIN_6_MONTHS', label: 'Within 6 months'},
              {val: 'WITHIN_1_YEAR', label: 'Within 1 year'},
              {val: 'EXPLORING', label: 'Just exploring'}
            ])}
          </div>
        </>}

        {/* TAB 3: COMMUNICATION */}
        {activeSection === 'Communication' && <>
          <h2 className="font-bold text-gray-900 mb-1">Communication Style</h2>
          <p className="text-gray-500 text-xs mb-5">These reflection questions help NIS understand your core communication patterns.</p>
          
          <div className="space-y-2">
            {sel('communicationStyle', 'How do you usually communicate in conflict?', [
              {val: 'CALM_DIRECT', label: 'Calm and Direct'},
              {val: 'GENTLE_SLOW', label: 'Gentle and Slow'},
              {val: 'NEEDS_TIME_THEN_TALKS', label: 'Needs time to process, then talks'},
              {val: 'AVOIDS_CONFLICT', label: 'Avoids conflict entirely'},
              {val: 'GETS_EMOTIONAL_QUICKLY', label: 'Gets emotional quickly'}
            ], errors.communicationStyle)}

            {sel('repairStyle', 'After a disagreement, how do you usually repair?', [
              {val: 'APOLOGIZE_AND_REPAIR', label: 'Quickly apologize and repair'},
              {val: 'DISCUSS_AND_REPAIR', label: 'Discuss thoroughly to repair'},
              {val: 'NEEDS_TIME_THEN_REPAIRS', label: 'Need time, then repair naturally'},
              {val: 'EXPLAINS_FIRST', label: 'Explain my side first before repairing'},
              {val: 'STRUGGLES_TO_REPAIR', label: 'I struggle to initiate repair'}
            ], errors.repairStyle)}

            {sel('angerLevel', 'How do you respond when angry?', [
              {val: 'MOSTLY_CALM', label: 'Mostly calm'},
              {val: 'NEEDS_SILENCE', label: 'I need silence / space'},
              {val: 'SPEAKS_HARSHLY_BUT_REGRETS', label: 'May speak harshly, but regret it later'},
              {val: 'LEAVES_SITUATION', label: 'I leave the situation entirely'}
            ], errors.angerLevel)}
            
            {sel('boundaryStrength', 'How comfortable are you with setting boundaries?', [
              {val: 'STRONG_BOUNDARIES', label: 'Very comfortable, strong boundaries'},
              {val: 'COMFORTABLE_WITH_BOUNDARIES', label: 'Comfortable'},
              {val: 'SOMEWHAT_COMFORTABLE', label: 'Somewhat comfortable'},
              {val: 'STRUGGLES_TO_SAY_NO', label: 'I struggle to say no'}
            ])}
          </div>
        </>}

        {/* TAB 4: CHARACTER (PSYCH V2) */}
        {activeSection === 'Character' && <>
          <h2 className="font-bold text-gray-900 mb-1">Character &amp; Emotional Compatibility</h2>
          <p className="text-gray-500 text-xs mb-5">These questions help Sakinah understand emotional safety and marriage readiness. Your answers are private.</p>
          
          <div className="space-y-2">
            {sel('disagreementResponse', 'If your spouse disagrees with your opinion, what should happen?', [
              {val: 'FAIR_SOLUTION', label: 'We should both listen and find a fair solution'},
              {val: 'EXPLAIN_STRONGLY', label: 'I prefer explaining strongly until they understand me'},
              {val: 'EXPECT_SPOUSE_TO_ADJUST', label: 'I expect my spouse to adjust if I believe I am right'},
              {val: 'SILENT_OR_DISTANT', label: 'I may become silent or distant until things settle'}
            ], errors.disagreementResponse)}

            {sel('familyPressureResponse', 'If your family wants one thing and your spouse is uncomfortable, what would you do?', [
              {val: 'BALANCE_AND_PROTECT_FAIRNESS', label: 'I would listen to both sides and protect fairness'},
              {val: 'CONVINCE_SPOUSE_TO_ADJUST', label: 'I would try to convince my spouse to adjust'},
              {val: 'FAMILY_COMES_FIRST', label: 'Family opinion should usually come first'},
              {val: 'WALI_HELP_RESPECTFULLY', label: 'I would need elders/wali to help resolve it respectfully'}
            ])}

            {sel('accountabilityResponse', 'When you realize you hurt someone, what do you usually do?', [
              {val: 'APOLOGIZE_AND_REPAIR', label: 'I apologize and try to repair'},
              {val: 'EXPLAIN_FIRST', label: 'I explain why I acted that way first'},
              {val: 'NEEDS_TIME_TO_ACCEPT', label: 'I need time before accepting my mistake'},
              {val: 'DIFFICULT_TO_APOLOGIZE', label: 'I find it difficult to apologize if I feel disrespected'}
            ], errors.accountabilityResponse)}

            {sel('personalSpaceResponse', 'How do you feel about your spouse having personal space or interests?', [
              {val: 'HEALTHY_SPACE_IMPORTANT', label: 'Healthy personal space is important'},
              {val: 'OKAY_IF_TRUST_CLEAR', label: 'It is okay if trust is clear'},
              {val: 'PREFER_KNOWING_CLOSELY', label: 'I prefer knowing most things closely'},
              {val: 'DECIDED_BY_ME_OR_FAMILY', label: 'After marriage, most things should be decided together/by family'}
            ])}

            {sel('financialDecisionResponse', 'How should financial decisions be handled after marriage?', [
              {val: 'TRANSPARENCY_AND_PLANNING', label: 'With transparency and responsible planning'},
              {val: 'AGREED_ROLES_MUTUAL_TRUST', label: 'Based on agreed roles and mutual trust'},
              {val: 'ONE_HAS_FINAL_CONTROL', label: 'One person should have final control for stability'},
              {val: 'EARNER_DECIDES_MORE', label: 'The earning person should naturally decide more'}
            ])}
          </div>
        </>}

        {/* TAB 5: DEALBREAKERS */}
        {activeSection === 'Dealbreakers' && <>
          <h2 className="font-bold text-gray-900 mb-5">Dealbreakers &amp; Matching Strictness</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Strict Match Flags</label>
            <p className="text-gray-500 text-xs mb-3">Check the boxes below ONLY if a preference is an absolute dealbreaker. Otherwise, NIS will try to find the closest flexible match.</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.strictAge} onChange={set('strictAge')} className="text-[#7B1C2E] rounded border-gray-300" /> Strict Age</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.strictLocation} onChange={set('strictLocation')} className="text-[#7B1C2E] rounded border-gray-300" /> Strict Location</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.strictTradition} onChange={set('strictTradition')} className="text-[#7B1C2E] rounded border-gray-300" /> Strict Madhhab</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.strictMarital} onChange={set('strictMarital')} className="text-[#7B1C2E] rounded border-gray-300" /> Strict Marital Status</label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Absolute Dealbreakers (Text)</label>
            <textarea rows={3} value={form.dealbreakersText} onChange={set('dealbreakersText')}
              placeholder="e.g. Smoking, does not want children, lives abroad permanently…"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#7B1C2E]/30 focus:border-[#7B1C2E] outline-none" />
          </div>

          <div className={`p-4 rounded-xl border ${errors.noMatchConfirmed ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.noMatchConfirmed} onChange={set('noMatchConfirmed')} className="mt-1 text-[#7B1C2E] rounded border-gray-300" />
              <div>
                <p className="text-sm font-semibold text-gray-900">NIS Matching Acknowledgment</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">I understand that Sakinah would rather wait than show me the wrong person. If no candidates currently align with my values and psychology, I am comfortable waiting.</p>
              </div>
            </label>
          </div>
        </>}

        {/* Form Errors & Actions */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-5 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            ⚠️ Please complete all required fields in this section before continuing.
          </div>
        )}

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
          <button type="button" onClick={() => sIdx > 0 && setActiveSection(SECTIONS[sIdx - 1])} disabled={sIdx === 0}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-30 text-sm font-medium">
            ← Back
          </button>
          <button type="button" onClick={goNext}
            className="bg-[#7B1C2E] text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#5e1522] transition-colors shadow-sm">
            {sIdx === SECTIONS.length - 1 ? 'Save & Run NIS Engine' : 'Save & Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
