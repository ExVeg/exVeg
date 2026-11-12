import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const MAX_RAW_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FIRESTORE_DATAURL_CHARS = 850000;

const compressImageToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result);
      img.onload = () => {
        const maxDim = 1000;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read document file.'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

const CreateYourAccountAgriMarketConnect = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState('buyer');

  // Personal Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Seller Business Verification
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [documentDataUrl, setDocumentDataUrl] = useState('');
  const [documentSize, setDocumentSize] = useState('');

  // Seller Bank Details
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // Credentials
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State & Loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referenceId, setReferenceId] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const processDocumentFile = async (file) => {
    if (!file) return;

    if (file.size > MAX_RAW_FILE_BYTES) {
      setError('File size exceeds 5MB limit. Please select a smaller file.');
      return;
    }

    setError('');
    try {
      const dataUrl = file.type.startsWith('image/')
        ? await compressImageToDataUrl(file)
        : await readFileAsDataUrl(file);

      if (dataUrl.length > MAX_FIRESTORE_DATAURL_CHARS) {
        setError('Document file is too large for database storage (PDFs must be under 600 KB). Please compress it or upload a JPG/PNG photo.');
        return;
      }

      setDocumentFile(file);
      setDocumentName(file.name);
      const sizeInKb = (file.size / 1024).toFixed(1);
      setDocumentSize(sizeInKb > 1000 ? `${(sizeInKb / 1024).toFixed(2)} MB` : `${sizeInKb} KB`);
      setDocumentDataUrl(dataUrl);
    } catch (err) {
      setError(err.message || 'Unable to process selected file.');
    }
  };

  // Handle Document File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processDocumentFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    processDocumentFile(file);
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setDocumentFile(null);
    setDocumentName('');
    setDocumentDataUrl('');
    setDocumentSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNext = async () => {
    setError('');
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!name.trim() || !email.trim()) {
        setError('Please enter your full name and email address.');
        return;
      }
      setCurrentStep(userType === 'seller' ? 2 : 3);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setLoading(true);
      try {
        const trimmedEmail = email.trim();
        let firebaseUser = auth.currentUser;

        if (!firebaseUser || firebaseUser.email?.toLowerCase() !== trimmedEmail.toLowerCase()) {
          const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          firebaseUser = userCredential.user;
        }

        await updateProfile(firebaseUser, { displayName: name.trim() }).catch(() => {});

        const uid = firebaseUser.uid;
        const generatedRef = `EXVEG-${Math.floor(10000 + Math.random() * 90000)}-REG`;
        setReferenceId(generatedRef);

        // Save authoritative user role and verification profile to Firestore
        await setDoc(doc(db, 'users', uid), {
          uid,
          name: name.trim(),
          email: trimmedEmail,
          phone: phone.trim(),
          role: userType === 'seller' ? 'Seller' : 'Buyer',
          businessName: businessName.trim() || name.trim(),
          gstNumber: gstNumber.trim(),
          panNumber: panNumber.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim(),
          documentName: documentName || '',
          documentUrl: documentDataUrl || '',
          referenceId: generatedRef,
          status: userType === 'seller' ? 'Pending' : 'Approved',
          verified: userType !== 'seller',
          createdAt: new Date().toISOString(),
        });

        // Show confirmation step only after Firestore write succeeds
        setCurrentStep(4);
      } catch (err) {
        console.error('Registration error:', err);
        if (err.code === 'auth/email-already-in-use') {
          setError('This email is already registered. Please sign in instead.');
        } else if (err.code === 'permission-denied') {
          setError('Firestore permission denied while saving your profile. Please ensure Firebase Security Rules (firestore.rules) are published.');
        } else {
          setError(err.message || 'Registration failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep === 4) return;
    if (currentStep === 3) {
      setCurrentStep(userType === 'seller' ? 2 : 1);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  const getProgressWidth = () => {
    if (userType === 'seller') {
      if (currentStep === 0) return '0%';
      if (currentStep === 1) return '33.33%';
      if (currentStep === 2) return '66.66%';
      if (currentStep >= 3) return '100%';
    } else {
      if (currentStep === 0) return '0%';
      if (currentStep === 1) return '50%';
      if (currentStep >= 3) return '100%';
    }
    return '0%';
  };

  return (
    <main className="flex-grow flex items-center justify-center py-xl px-margin-mobile md:px-margin-desktop min-h-[80vh] bg-gradient-to-b from-[#f4f7f2] to-[#f8faf5]">
      <div className="w-full max-w-3xl">
        {/* Progress Indicator */}
        {currentStep < 4 && (
          <div className="mb-lg px-md" id="progress-container">
            <div className="flex justify-between items-center relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 z-0"></div>
              <div
                className="absolute top-1/2 left-0 h-1 bg-secondary transition-all duration-500 -translate-y-1/2 z-0"
                id="progress-bar-fill"
                style={{ width: getProgressWidth() }}
              ></div>
              <div className="step-indicator z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= 0 ? 'bg-secondary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  1
                </div>
                <span className={`font-label-sm text-label-sm font-bold ${currentStep >= 0 ? 'text-primary' : 'text-on-surface-variant'}`}>Account Type</span>
              </div>
              <div className="step-indicator z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= 1 ? 'bg-secondary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  2
                </div>
                <span className={`font-label-sm text-label-sm font-bold ${currentStep >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>Personal</span>
              </div>
              {userType === 'seller' && (
                <div className="step-indicator z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= 2 ? 'bg-secondary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    3
                  </div>
                  <span className={`font-label-sm text-label-sm font-bold ${currentStep >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>Business</span>
                </div>
              )}
              <div className="step-indicator z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= 3 ? 'bg-secondary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  {userType === 'seller' ? '4' : '3'}
                </div>
                <span className={`font-label-sm text-label-sm font-bold ${currentStep >= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>Security</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white border border-outline-variant/40 shadow-xl rounded-2xl overflow-hidden min-h-[500px] flex flex-col w-full max-w-[48rem] mx-auto">
          {error && <div className="bg-error-container text-on-error-container p-3 mx-md mt-md rounded-lg font-label-md text-sm">{error}</div>}
          <form className="p-md md:p-lg flex-grow flex flex-col" onSubmit={(e) => e.preventDefault()}>
            
            {/* Step 0: User Type */}
            {currentStep === 0 && (
              <div className="step-content animate-fade-in" id="step-0">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Welcome to ExVeg.</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-md">Choose how you want to interact with our agricultural platform.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-md">
                  <label className="relative cursor-pointer group">
                    <input 
                      className="peer sr-only" 
                      name="user_type" 
                      type="radio" 
                      value="buyer"
                      checked={userType === 'buyer'}
                      onChange={(e) => setUserType(e.target.value)}
                    />
                    <div className="p-md border-2 border-outline-variant rounded-xl group-hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-md">
                        <span className="material-symbols-outlined text-on-secondary-container text-3xl">shopping_cart</span>
                      </div>
                      <h3 className="font-title-lg text-title-lg text-on-surface mb-xs">I want to Buy</h3>
                      <p className="font-label-md text-label-md text-on-surface-variant">Access quality crops, seeds, plants, and tools directly from verified growers.</p>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 peer-checked:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                    </div>
                  </label>
                  
                  <label className="relative cursor-pointer group">
                    <input 
                      className="peer sr-only" 
                      name="user_type" 
                      type="radio" 
                      value="seller"
                      checked={userType === 'seller'}
                      onChange={(e) => setUserType(e.target.value)}
                    />
                    <div className="p-md border-2 border-outline-variant rounded-xl group-hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-md">
                        <span className="material-symbols-outlined text-on-primary-fixed-variant text-3xl">storefront</span>
                      </div>
                      <h3 className="font-title-lg text-title-lg text-on-surface mb-xs">I want to Sell</h3>
                      <p className="font-label-md text-label-md text-on-surface-variant">Scale your farming business, list fresh harvest, nursery saplings, and equipment.</p>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 peer-checked:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <div className="step-content animate-fade-in" id="step-1">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Personal Details</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-md">Tell us a bit about yourself to get started.</p>
                <div className="space-y-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Full Name *</label>
                      <input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface outline-none focus:border-primary" 
                        placeholder="John Doe" 
                        type="text" 
                        required 
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md">+91</span>
                        <input 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 pl-12 font-body-md text-on-surface outline-none focus:border-primary" 
                          placeholder="98765 43210" 
                          type="tel" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Email Address *</label>
                    <input 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface outline-none focus:border-primary" 
                      placeholder="john.doe@example.com" 
                      type="email" 
                      required 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Details & Document Upload (Seller Only) */}
            {currentStep === 2 && (
              <div className="step-content animate-fade-in" id="step-2">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Business Verification</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-md">Verified businesses gain higher trust and visibility on ExVeg.</p>
                <div className="space-y-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Business / Farm Name</label>
                    <input 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface outline-none focus:border-primary" 
                      placeholder="Green Valley Organic Farms" 
                      type="text" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">GST Number (Optional)</label>
                      <input 
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface outline-none focus:border-primary uppercase" 
                        placeholder="22AAAAA0000A1Z5" 
                        type="text" 
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">PAN / Aadhaar Number</label>
                      <input 
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value)}
                        className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface outline-none focus:border-primary uppercase" 
                        placeholder="ABCDE1234F" 
                        type="text" 
                      />
                    </div>
                  </div>

                  {/* Functional File Upload Dropzone */}
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">
                      Upload Verification Document (Aadhaar, PAN, Trade License, or Farm Land Certificate)
                    </label>

                    {/* Hidden Native File Input */}
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!documentName ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-8 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group"
                      >
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
                        </div>
                        <p className="font-label-md font-bold text-on-surface text-center">
                          Click to browse or drag and drop your document
                        </p>
                        <p className="font-label-sm text-on-surface-variant text-center mt-1">
                          Supported formats: PDF, JPG, PNG (Max size: 5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="border border-primary/40 bg-primary/5 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-xl">description</span>
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-sm text-on-surface truncate" title={documentName}>{documentName}</p>
                            <p className="text-xs text-on-surface-variant">{documentSize} · <span className="text-primary font-bold">Ready to upload</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1 bg-surface border border-outline-variant hover:bg-surface-container rounded text-xs font-bold text-on-surface transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-1.5 text-on-surface-variant hover:text-error transition-colors"
                            title="Remove file"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Bank & Security */}
            {currentStep === 3 && (
              <div className="step-content animate-fade-in" id="step-3">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Security &amp; Payouts</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-md">Finalize your account and secure your transactions.</p>
                <div className="space-y-md">
                  {userType === 'seller' && (
                    <div className="p-md bg-secondary/5 rounded-xl border border-secondary/20 mb-md">
                      <h4 className="font-title-lg text-on-surface flex items-center gap-2 mb-sm">
                        <span className="material-symbols-outlined text-secondary">payments</span>
                        Payout Bank Account
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                        <div className="flex flex-col gap-xs">
                          <label className="font-label-sm text-label-sm text-on-secondary-container">Bank Account Number</label>
                          <input 
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="bg-white border border-outline-variant rounded-lg p-3 font-body-md text-on-surface outline-none focus:border-primary" 
                            placeholder="1234 5678 9012" 
                            type="text" 
                          />
                        </div>
                        <div className="flex flex-col gap-xs">
                          <label className="font-label-sm text-label-sm text-on-secondary-container">IFSC Code</label>
                          <input 
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value)}
                            className="bg-white border border-outline-variant rounded-lg p-3 font-body-md text-on-surface outline-none focus:border-primary uppercase" 
                            placeholder="SBIN0012345" 
                            type="text" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Set Password *</label>
                    <input 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface outline-none focus:border-primary" 
                      placeholder="Minimum 6 characters" 
                      type="password" 
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Confirm Password *</label>
                    <input 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface outline-none focus:border-primary" 
                      placeholder="Repeat your password" 
                      type="password" 
                      required 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Success/Confirmation */}
            {currentStep === 4 && (
              <div className="step-content text-center py-lg animate-fade-in" id="step-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-md animate-bounce">
                  <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
                  {userType === 'seller' ? 'Seller Application Submitted!' : 'Registration Completed!'}
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto mb-lg">
                  {userType === 'seller' 
                    ? 'Your verification documents and merchant details have been securely recorded. Our administrative team will review your application.'
                    : 'Your account has been created successfully. Welcome to ExVeg!'}
                </p>
                {referenceId && (
                  <div className="p-4 bg-surface-container rounded-xl inline-block mb-6">
                    <p className="font-label-md text-label-md text-on-surface-variant">
                      Application Reference ID: <span className="font-mono font-bold text-primary">{referenceId}</span>
                    </p>
                  </div>
                )}
                <div className="mt-4 flex gap-4 justify-center">
                  <Link to={userType === 'seller' ? '/seller-dashboard' : '/products'}>
                    <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md" type="button">
                      {userType === 'seller' ? 'Go to Vendor Portal' : 'Start Shopping'}
                    </button>
                  </Link>
                  <Link to="/">
                    <button className="px-8 py-3 border border-outline text-on-surface rounded-xl font-bold hover:bg-surface-container transition-all" type="button">
                      Homepage
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="mt-xl flex justify-between items-center pt-md border-t border-outline-variant" id="nav-buttons">
                <button 
                  className={`px-md py-2 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-label-md text-label-md ${currentStep === 0 ? 'invisible' : ''}`} 
                  id="prev-btn" 
                  type="button"
                  onClick={handlePrev}
                >
                  <span className="material-symbols-outlined text-sm">arrow_back_ios</span> Back
                </button>
                <button 
                  disabled={loading}
                  className="px-xl py-3 bg-gradient-to-r from-[#166534] to-[#15803d] text-white rounded-full font-bold hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50" 
                  id="next-btn" 
                  type="button"
                  onClick={handleNext}
                >
                  {loading ? 'Processing...' : (currentStep === 3 ? 'Create Account' : 'Next')} <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
};

export default CreateYourAccountAgriMarketConnect;
