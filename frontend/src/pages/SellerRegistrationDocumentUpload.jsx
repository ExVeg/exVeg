import React from 'react';
import { Link } from 'react-router-dom';

const SellerRegistrationDocumentUpload = () => {
  return (
    <>
      
{/* TopNavBar */}
<nav className="fixed top-0 w-full bg-white/80 dark:bg-surface-container/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop z-50">
<div className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary">ExVeg</div>
<div className="hidden md:flex gap-8 items-center">
<a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" href="#">Marketplace</a>
<a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" href="#">Resources</a>
<a className="text-primary font-bold border-b-2 border-primary pb-1" href="#">Sell on AgriMarket</a>
</div>
<button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md active:scale-95 transition-transform">
            Log In
        </button>
</nav>
<main className="pt-24 pb-xl px-margin-mobile md:px-margin-desktop min-h-screen flex flex-col items-center">
{/* Registration Stepper */}
<div className="w-full max-w-4xl mb-xl">
<div className="flex items-center justify-between relative">
{/* Connector Line Background */}
<div className="absolute top-5 left-0 w-full h-0.5 bg-surface-container-highest -z-10"></div>
{/* Progress Line */}
<div className="absolute top-5 left-0 w-2/3 h-0.5 bg-primary -z-10 transition-all duration-500"></div>
{/* Step 1 */}
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-[20px]" style={{"fontVariationSettings":"'FILL' 1"}}>check</span>
</div>
<span className="font-label-sm text-primary">Account info</span>
</div>
{/* Step 2 */}
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-[20px]" style={{"fontVariationSettings":"'FILL' 1"}}>check</span>
</div>
<span className="font-label-sm text-primary">Business Profile</span>
</div>
{/* Step 3 (Active) */}
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-white border-4 border-tertiary-fixed-dim text-tertiary flex items-center justify-center font-bold animate-pulse shadow-lg shadow-tertiary-fixed-dim/20">
                        3
                    </div>
<span className="font-label-sm text-tertiary">Verification</span>
</div>
{/* Step 4 */}
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">
                        4
                    </div>
<span className="font-label-sm text-on-surface-variant">Bank Details</span>
</div>
</div>
</div>
{/* Main Card Container */}
<div className="w-full max-w-2xl bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-md md:p-lg">
<header className="mb-md">
<h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Verification Uploads</h1>
<p className="font-body-md text-on-surface-variant">To maintain a secure marketplace, we require verification of your identity and business credentials.</p>
</header>
<form className="space-y-md">
{/* Upload 1: ID Card */}
<div className="space-y-sm">
<label className="font-title-lg text-title-lg text-on-surface block">Aadhaar / PAN Card</label>
<div className="file-upload-area relative border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-lg text-center bg-background/50 cursor-pointer transition-colors duration-200">
<input aria-label="Upload Identity Document" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" type="file" />
<div className="flex flex-col items-center gap-2">
<span className="material-symbols-outlined upload-icon text-[48px] text-primary" data-icon="badge">badge</span>
<div className="space-y-1">
<p className="font-label-md text-on-surface">Click to upload or drag and drop</p>
<p className="font-label-sm text-on-surface-variant">SVG, PNG, JPG or PDF (max. 5MB)</p>
</div>
</div>
</div>
</div>
{/* Upload 2: Business License */}
<div className="space-y-sm">
<label className="font-title-lg text-title-lg text-on-surface block">Business License / Trade Certificate</label>
<div className="file-upload-area relative border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-lg text-center bg-background/50 cursor-pointer transition-colors duration-200">
<input aria-label="Upload Business License" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" type="file" />
<div className="flex flex-col items-center gap-2">
<span className="material-symbols-outlined upload-icon text-[48px] text-primary" data-icon="description">description</span>
<div className="space-y-1">
<p className="font-label-md text-on-surface">Click to upload or drag and drop</p>
<p className="font-label-sm text-on-surface-variant">PDF, JPG or PNG (max. 10MB)</p>
</div>
</div>
</div>
</div>
{/* Info Box */}
<div className="flex gap-4 p-md bg-secondary-container/20 rounded-lg border border-secondary-container/30">
<span className="material-symbols-outlined text-secondary" data-icon="info">info</span>
<p className="font-label-md text-on-secondary-container">
                        Your account will be reviewed by the admin before activation. This process usually takes 24-48 business hours once all documents are submitted.
                    </p>
</div>
{/* CTA */}
<div className="pt-md border-t border-outline-variant/30 flex justify-between items-center">
<button className="text-on-surface-variant font-label-md hover:text-primary flex items-center gap-2 transition-colors" type="button">
<span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
                        Back to Profile
                    </button>
<button className="bg-primary text-on-primary px-xl py-3 rounded-lg font-label-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2" type="submit">
                        Next: Bank Details
                        <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</form>
</div>
{/* Decorative Element */}
<div className="mt-lg w-full max-w-2xl flex items-center justify-center">
<div className="flex gap-4 opacity-40">
<span className="material-symbols-outlined text-primary" data-icon="verified_user">verified_user</span>
<span className="material-symbols-outlined text-primary" data-icon="security">security</span>
<span className="material-symbols-outlined text-primary" data-icon="shield">shield</span>
</div>
</div>
</main>
{/* Footer */}
<footer className="w-full py-8 bg-surface-container-lowest dark:bg-surface-dim border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4 px-margin-mobile md:px-margin-desktop">
<div className="flex flex-col md:flex-row items-center gap-6">
<div className="font-headline-sm text-headline-sm text-on-surface font-bold">AgriMarket</div>
<p className="font-label-sm text-on-surface-variant">© 2024 AgriMarket Connect. All rights reserved.</p>
</div>
<div className="flex gap-6 items-center">
<a className="font-label-sm text-on-surface-variant hover:text-primary underline transition-opacity hover:opacity-80" href="#">Privacy Policy</a>
<a className="font-label-sm text-on-surface-variant hover:text-primary underline transition-opacity hover:opacity-80" href="#">Terms of Service</a>
<a className="font-label-sm text-on-surface-variant hover:text-primary underline transition-opacity hover:opacity-80" href="#">Cookie Policy</a>
<a className="font-label-sm text-on-surface-variant hover:text-primary underline transition-opacity hover:opacity-80" href="#">Support</a>
</div>
</footer>




    </>
  );
};

export default SellerRegistrationDocumentUpload;
