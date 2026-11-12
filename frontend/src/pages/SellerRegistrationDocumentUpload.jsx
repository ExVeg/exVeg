import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import LanguageSwitcher from '../components/LanguageSwitcher';

const SellerRegistrationDocumentUpload = () => {
  const navigate = useNavigate();
  const idInputRef = useRef(null);
  const licenseInputRef = useRef(null);

  const [idFile, setIdFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleIdFile = (e) => {
    const file = e.target.files?.[0];
    if (file) setIdFile(file);
  };

  const handleLicenseFile = (e) => {
    const file = e.target.files?.[0];
    if (file) setLicenseFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idFile && !licenseFile) {
      setError('Please select at least one verification document to upload.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          documentUploaded: true,
          idDocumentName: idFile?.name || '',
          licenseDocumentName: licenseFile?.name || '',
          status: 'Pending',
          updatedAt: new Date().toISOString()
        });
      }
      setMessage('Documents submitted successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/seller-dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit documents.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8faf5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl flex justify-between items-center mb-4">
        <Link to="/" className="font-headline-md text-xl font-extrabold text-[#166534] flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          ExVeg
        </Link>
        <LanguageSwitcher compact />
      </div>
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-outline-variant/40 shadow-xl p-8">
        <header className="mb-6">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Verification Uploads</h1>
          <p className="font-body-md text-on-surface-variant">To maintain a secure marketplace, we require verification of your identity and business credentials.</p>
        </header>

        {error && <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm mb-4 font-bold">{error}</div>}
        {message && <div className="bg-primary/10 border border-primary/30 text-primary p-3 rounded-lg text-sm mb-4 font-bold">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload 1: ID Card */}
          <div className="space-y-2">
            <label className="font-title-lg text-title-lg text-on-surface block">Aadhaar / PAN Card</label>
            <input ref={idInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleIdFile} className="hidden" />
            <div
              onClick={() => idInputRef.current?.click()}
              className="border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-6 text-center bg-background/50 cursor-pointer transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-primary">badge</span>
                <p className="font-label-md font-bold text-on-surface">
                  {idFile ? idFile.name : 'Click to upload Identity Document'}
                </p>
                <p className="font-label-sm text-on-surface-variant">
                  {idFile ? `${(idFile.size / 1024).toFixed(1)} KB (Selected)` : 'PDF, JPG or PNG (max 5MB)'}
                </p>
              </div>
            </div>
          </div>

          {/* Upload 2: Business License */}
          <div className="space-y-2">
            <label className="font-title-lg text-title-lg text-on-surface block">Business License / Trade Certificate</label>
            <input ref={licenseInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleLicenseFile} className="hidden" />
            <div
              onClick={() => licenseInputRef.current?.click()}
              className="border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-6 text-center bg-background/50 cursor-pointer transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-primary">description</span>
                <p className="font-label-md font-bold text-on-surface">
                  {licenseFile ? licenseFile.name : 'Click to upload Business License / Land Record'}
                </p>
                <p className="font-label-sm text-on-surface-variant">
                  {licenseFile ? `${(licenseFile.size / 1024).toFixed(1)} KB (Selected)` : 'PDF, JPG or PNG (max 10MB)'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-secondary-container/20 rounded-lg border border-secondary-container/30">
            <span className="material-symbols-outlined text-secondary">info</span>
            <p className="font-label-md text-on-secondary-container">
              Your account will be reviewed by the admin before activation. This process usually takes 24-48 business hours.
            </p>
          </div>

          <div className="pt-4 border-t border-outline-variant flex justify-between items-center">
            <button
              onClick={() => navigate('/seller-dashboard')}
              className="text-on-surface-variant font-label-md hover:text-primary flex items-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Dashboard
            </button>
            <button
              disabled={loading}
              className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
              type="submit"
            >
              {loading ? 'Submitting...' : 'Submit Documents'}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerRegistrationDocumentUpload;
