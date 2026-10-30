import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const CreateYourAccountAgriMarketConnect = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const handleNext = async () => {
    setError('');
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setCurrentStep(userType === 'seller' ? 2 : 3);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Await Firestore write — this saves the role so RBAC works
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name,
            email,
            phone,
            role: userType === 'seller' ? 'Seller' : 'Buyer',
            createdAt: new Date().toISOString(),
          });
        } catch (firestoreErr) {
          // Profile save failed — log it but don't block the user
          console.warn('Firestore profile save failed (check Security Rules):', firestoreErr.message);
        }
        
        // Navigate based on role
        if (userType === 'seller') {
          navigate('/seller-dashboard');
        } else {
          navigate('/products');
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep === 4) return; // Cannot go back from success
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
    <>
      <main className="flex-grow flex items-center justify-center py-xl px-margin-mobile md:px-margin-desktop">
        <div className="w-full max-w-3xl">
          {/* Progress Indicator */}
          {currentStep < 4 && (
            <div className="mb-lg px-md" id="progress-container">
              <div className="flex justify-between items-center relative">
                {/* Progress Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 z-0"></div>
                <div
                  className="absolute top-1/2 left-0 h-1 bg-secondary transition-all duration-500 -translate-y-1/2 z-0"
                  id="progress-bar-fill"
                  style={{ width: getProgressWidth() }}
                ></div>
                {/* Steps */}
                <div className="step-indicator z-10 flex flex-col items-center gap-2" data-step="0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= 0 ? 'bg-secondary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    1
                  </div>
                  <span className={`font-label-sm text-label-sm font-bold ${currentStep >= 0 ? 'text-primary' : 'text-on-surface-variant'}`}>Account Type</span>
                </div>
                <div className="step-indicator z-10 flex flex-col items-center gap-2" data-step="1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= 1 ? 'bg-secondary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    2
                  </div>
                  <span className={`font-label-sm text-label-sm font-bold ${currentStep >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>Personal</span>
                </div>
                {userType === 'seller' && (
                  <div className="step-indicator z-10 flex flex-col items-center gap-2" data-step="2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= 2 ? 'bg-secondary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                      3
                    </div>
                    <span className={`font-label-sm text-label-sm font-bold ${currentStep >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>Business</span>
                  </div>
                )}
                <div className="step-indicator z-10 flex flex-col items-center gap-2" data-step="3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= 3 ? 'bg-secondary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    {userType === 'seller' ? '4' : '3'}
                  </div>
                  <span className={`font-label-sm text-label-sm font-bold ${currentStep >= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>Security</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Container */}
          <div className="bg-surface-container-lowest border border-outline-variant shadow-lg rounded-xl overflow-hidden min-h-[500px] flex flex-col w-full max-w-[48rem] mx-auto">
            {error && <div className="bg-error-container text-on-error-container p-3 mx-md mt-md rounded-lg font-label-md">{error}</div>}
            <form className="p-md md:p-lg flex-grow flex flex-col" id="registration-form" onSubmit={(e) => e.preventDefault()}>
              
              {/* Step 0: User Type */}
              {currentStep === 0 && (
                <div className="step-content animate-fade-in" id="step-0">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Welcome to the future of Agriculture.</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-md">Choose how you want to interact with our ecosystem.</p>
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
                        <p className="font-label-md text-label-md text-on-surface-variant">Access quality crops, seeds, and advanced tools directly from verified sellers.</p>
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
                        <p className="font-label-md text-label-md text-on-surface-variant">Scale your business, reach global buyers, and manage logistics with our professional tools.</p>
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
                        <label className="font-label-sm text-label-sm text-on-surface-variant">Full Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface input-focus-effect outline-none focus:border-primary" placeholder="John Doe" type="text" />
                      </div>
                      <div className="flex flex-col gap-xs">
                        <label className="font-label-sm text-label-sm text-on-surface-variant">Mobile Number</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md">+91</span>
                          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 pl-12 font-body-md text-on-surface input-focus-effect outline-none focus:border-primary" placeholder="98765 43210" type="tel" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Email Address</label>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface input-focus-effect outline-none focus:border-primary" placeholder="john.doe@agri-market.com" type="email" />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Primary Language</label>
                      <select className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface input-focus-effect outline-none focus:border-primary">
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Marathi</option>
                        <option>Tamil</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Business Details (Seller Only) */}
              {currentStep === 2 && (
                <div className="step-content animate-fade-in" id="step-2">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Business Verification</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-md">Verified businesses gain higher trust and visibility.</p>
                  <div className="space-y-md">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Business/Farm Name</label>
                      <input className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface input-focus-effect outline-none focus:border-primary" placeholder="Green Valley Organic Farms" type="text" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                      <div className="flex flex-col gap-xs">
                        <label className="font-label-sm text-label-sm text-on-surface-variant">GST Number (Optional)</label>
                        <input className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface input-focus-effect outline-none focus:border-primary" placeholder="22AAAAA0000A1Z5" type="text" />
                      </div>
                      <div className="flex flex-col gap-xs">
                        <label className="font-label-sm text-label-sm text-on-surface-variant">PAN/Aadhaar Number</label>
                        <input className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface input-focus-effect outline-none focus:border-primary" placeholder="Enter ID number" type="text" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Upload Verification Document</label>
                      <div className="border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center bg-surface-container/30 hover:bg-surface-container/50 transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-4xl text-outline mb-sm">cloud_upload</span>
                        <p className="font-label-md text-label-md text-on-surface">Click to upload or drag and drop</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">PDF, JPG or PNG (max 5MB)</p>
                      </div>
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
                          Payout Account
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                          <div className="flex flex-col gap-xs">
                            <label className="font-label-sm text-label-sm text-on-secondary-container">Account Number</label>
                            <input className="bg-white border border-outline-variant rounded-lg p-3 font-body-md text-on-surface input-focus-effect outline-none focus:border-primary" placeholder="•••• •••• ••••" type="password" />
                          </div>
                          <div className="flex flex-col gap-xs">
                            <label className="font-label-sm text-label-sm text-on-secondary-container">IFSC Code</label>
                            <input className="bg-white border border-outline-variant rounded-lg p-3 font-body-md text-on-surface input-focus-effect outline-none focus:border-primary" placeholder="SBIN0012345" type="text" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Set Password</label>
                      <input value={password} onChange={(e) => setPassword(e.target.value)} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface input-focus-effect outline-none focus:border-primary" placeholder="Create a strong password" type="password" />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Confirm Password</label>
                      <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-on-surface input-focus-effect outline-none focus:border-primary" placeholder="Repeat your password" type="password" />
                    </div>
                    <div className="flex items-start gap-sm mt-md">
                      <input className="mt-1 w-4 h-4 text-primary bg-surface-container-low border-outline-variant rounded focus:ring-primary" id="terms" type="checkbox" />
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="terms">
                        I agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
                      </label>
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
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Registration Received!</h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto mb-lg">
                    {userType === 'seller' 
                      ? 'Your account will be reviewed by the admin before activation. This usually takes 24-48 business hours.'
                      : 'Your account has been created successfully. Welcome to AgriMarket Connect!'}
                  </p>
                  {userType === 'seller' && (
                    <div className="p-md bg-surface-container rounded-xl inline-block">
                      <p className="font-label-md text-label-md text-on-surface-variant">Reference ID: <span className="font-bold text-on-surface">#AMC-89231-REG</span></p>
                    </div>
                  )}
                  <div className="mt-xl">
                    <Link to="/">
                      <button className="px-xl py-md bg-primary text-white rounded-full font-label-md text-label-md hover:bg-primary-container transition-all shadow-md" type="button">
                        Return to Homepage
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
                    className="px-xl py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50" 
                    id="next-btn" 
                    type="button"
                    onClick={handleNext}
                  >
                    {loading ? 'Processing...' : (currentStep === 3 ? 'Submit' : 'Next')} <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateYourAccountAgriMarketConnect;
