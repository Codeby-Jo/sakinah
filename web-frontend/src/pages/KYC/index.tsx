import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { authPostMultipart, getUserId } from '../../lib/api';

export default function KYC() {
  const navigate = useNavigate();
  const { state, setKyc } = useAppContext();
  const [status, setLocalStatus] = useState(state.kyc.status);

  const [govId, setGovId]   = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const govIdRef  = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFile = (type: 'govId' | 'selfie', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
      setErrors(prev => ({ ...prev, [type]: 'Only JPG, PNG and PDF supported.' })); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [type]: 'File must be under 10 MB.' })); return;
    }
    if (type === 'govId') setGovId(file);
    else setSelfie(file);
    setErrors(prev => { const n = { ...prev }; delete n[type]; return n; });
  };

  const remove = (type: 'govId' | 'selfie') => {
    if (type === 'govId')  { setGovId(null);  if (govIdRef.current)  govIdRef.current.value = ''; }
    else                   { setSelfie(null); if (selfieRef.current) selfieRef.current.value = ''; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!govId)  errs.govId  = 'Government ID is required.';
    if (!selfie) errs.selfie = 'Selfie photo is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setLocalStatus('Pending');
      const formData = new FormData();
      formData.append('user_id', getUserId() || '1');
      formData.append('document_type', 'PASSPORT');
      formData.append('document_image', govId);
      formData.append('selfie_image', selfie);

      await authPostMultipart('/kyc/upload', formData);

      setKyc({ status: 'Pending', data: true });
      setShowSuccess(true);
      setTimeout(() => { setKyc({ status: 'Approved', data: true }); navigate('/preferences'); }, 2000);
    } catch (err: any) {
      setLocalStatus('unverified');
      setErrors({ global: err.message || 'Failed to upload KYC' });
    }
  };

  const isReady = !!govId && !!selfie;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold">
          ✅ Documents submitted! Verifying…
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Identity Verification</h1>
        <p className="text-gray-500 text-sm mt-1">Sakinah requires verified profiles to keep the community safe. All data is encrypted.</p>
      </div>

      {/* Status badge */}
      <div className={[
        'flex items-center gap-3 px-4 py-3 rounded-xl border mb-7 text-sm font-medium',
        status === 'Approved' ? 'bg-green-50 border-green-200 text-green-700'
        : status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-700'
        : 'bg-gray-50 border-gray-200 text-gray-600',
      ].join(' ')}>
        <span>{status === 'Approved' ? '✅' : status === 'Pending' ? '⏳' : '🛡️'}</span>
        <span>Verification Status: <strong>{status === 'None' ? 'Not Started' : status}</strong></span>
      </div>

      {/* Info boxes */}
      <div className="grid sm:grid-cols-3 gap-3 mb-7">
        {[
          { icon: '🔒', title: 'Encrypted',    desc: 'All files use bank-grade encryption' },
          { icon: '🗑️', title: 'Not Stored',   desc: 'ID deleted after verification' },
          { icon: '✅', title: 'Manual Review', desc: 'Our team manually reviews each ID' },
        ].map(b => (
          <div key={b.title} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{b.icon}</div>
            <p className="text-gray-800 font-semibold text-sm">{b.title}</p>
            <p className="text-gray-400 text-xs mt-0.5 leading-snug">{b.desc}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Government ID ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1">1. Government ID <span className="text-red-500">*</span></h3>
          <p className="text-gray-500 text-xs mb-4">Upload your passport, driver's licence, or national ID card. JPG, PNG or PDF — max 10 MB.</p>

          <input type="file" accept="image/jpeg,image/png,image/jpg,application/pdf"
            className="hidden" ref={govIdRef} onChange={e => handleFile('govId', e)} />

          {!govId ? (
            <div onClick={() => govIdRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${errors.govId ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-[#0A192F]/50 hover:bg-gray-50'}`}>
              <span className="text-4xl block mb-3">🪪</span>
              <p className="text-gray-700 font-semibold text-sm">Click to upload Government ID</p>
              <p className="text-gray-400 text-xs mt-1">JPG · PNG · PDF · Max 10 MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl flex-shrink-0">📄</div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-semibold text-sm truncate">{govId.name}</p>
                <p className="text-green-600 text-xs mt-0.5">✓ Uploaded successfully</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button type="button" onClick={() => govIdRef.current?.click()}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full hover:border-gray-400">Replace</button>
                <button type="button" onClick={() => remove('govId')}
                  className="text-xs px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-full">Remove</button>
              </div>
            </div>
          )}
          {errors.govId && <p className="text-red-500 text-xs mt-2">{errors.govId}</p>}
        </div>

        {/* ── Selfie ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1">2. Selfie Verification <span className="text-red-500">*</span></h3>
          <p className="text-gray-500 text-xs mb-4">Take a clear selfie in good lighting. We'll match it to your ID. JPG or PNG — max 10 MB.</p>

          <input type="file" accept="image/jpeg,image/png,image/jpg"
            className="hidden" ref={selfieRef} onChange={e => handleFile('selfie', e)} />

          {!selfie ? (
            <div onClick={() => selfieRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${errors.selfie ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-[#0A192F]/50 hover:bg-gray-50'}`}>
              <span className="text-4xl block mb-3">🤳</span>
              <p className="text-gray-700 font-semibold text-sm">Click to upload your Selfie</p>
              <p className="text-gray-400 text-xs mt-1">JPG · PNG · Max 10 MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#0A192F]/30 flex-shrink-0">
                <img src={URL.createObjectURL(selfie)} alt="Selfie preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-semibold text-sm truncate">{selfie.name}</p>
                <p className="text-green-600 text-xs mt-0.5">✓ Uploaded successfully</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button type="button" onClick={() => selfieRef.current?.click()}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full hover:border-gray-400">Replace</button>
                <button type="button" onClick={() => remove('selfie')}
                  className="text-xs px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-full">Remove</button>
              </div>
            </div>
          )}
          {errors.selfie && <p className="text-red-500 text-xs mt-2">{errors.selfie}</p>}
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            ⚠️ {errors.global || 'Please upload all required documents before submitting.'}
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={status === 'Pending' || !isReady}
            className={`px-8 py-3 rounded-lg font-semibold text-sm shadow-sm transition-all ${isReady && status !== 'Pending' ? 'bg-[#0A192F] text-white hover:bg-[#040d1a]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            {status === 'Pending' ? '⏳ Verifying…' : 'Submit Verification →'}
          </button>
        </div>
      </form>
    </div>
  );
}
