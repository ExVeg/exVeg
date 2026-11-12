import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';

const SellerRegistrationBusinessDetails = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <>
      
{/* TopNavBar */}
<header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-outline-variant/60 shadow-sm glass-header">
<div className="flex justify-between items-center h-16 px-4 md:px-margin-desktop w-full">
<Link to="/" className="font-headline-md text-headline-md font-extrabold text-[#166534] flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-2xl" style={{"fontVariationSettings":"'FILL' 1"}}>spa</span>
ExVeg
</Link>
<div className="flex gap-2 sm:gap-4 md:gap-6 items-center">
<div className="hidden sm:block"><LanguageSwitcher compact /></div>
<Link className="hidden md:inline text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" to="/">Home</Link>
<Link className="hidden md:inline text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" to="/products">Markets</Link>
<Link className="hidden md:inline text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" to="/analytics">Analytics</Link>
<Link to="/login" className="hidden md:inline bg-gradient-to-r from-[#166534] to-[#15803d] text-white px-5 py-1.5 rounded-full font-bold text-sm active:scale-95 transition-transform">Log In</Link>
<button onClick={() => setMobileMenuOpen(v => !v)} className="md:hidden p-2 rounded-lg border border-outline-variant text-[#143d23]" aria-label="Toggle menu">
<span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
</button>
</div>
</div>
{mobileMenuOpen && (
<div className="md:hidden border-t border-outline-variant bg-white px-4 py-3 space-y-2 shadow-md">
<div className="sm:hidden pb-2 border-b border-outline-variant/40 flex justify-between items-center">
<span className="text-xs font-bold text-on-surface-variant">Language:</span>
<LanguageSwitcher compact />
</div>
<Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-semibold text-on-surface hover:text-primary">Home</Link>
<Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-semibold text-on-surface hover:text-primary">Markets</Link>
<Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-semibold text-on-surface hover:text-primary">Analytics</Link>
<Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 bg-primary text-white text-center rounded-lg font-bold">Log In</Link>
</div>
)}
</header>
<main className="pt-24 pb-16 min-h-screen flex flex-col items-center bg-[#f8faf5]">
{/* Progress Indicator */}
<div className="w-full max-w-4xl px-margin-mobile mb-md">
<div className="relative flex justify-between items-center mb-10">
{/* Progress Line Background */}
<div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-highest -translate-y-1/2 z-0"></div>
{/* Active Progress Line */}
<div className="absolute top-1/2 left-0 w-[33%] h-1 bg-secondary -translate-y-1/2 z-0"></div>
{/* Step 1: Account Type */}
<div className="relative z-10 flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-secondary text-on-primary flex items-center justify-center shadow-md">
<span className="material-symbols-outlined text-[20px]">check</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">Account Type</span>
</div>
{/* Step 2: Business Details */}
<div className="relative z-10 flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-[#ffb870] text-[#2c1600] flex items-center justify-center shadow-md active-step-pulse border-2 border-white">
<span className="font-bold">2</span>
</div>
<span className="font-label-sm text-label-sm text-primary font-bold">Business Details</span>
</div>
{/* Step 3: Verification Uploads */}
<div className="relative z-10 flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
<span className="font-bold">3</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">Verification</span>
</div>
{/* Step 4: Bank Info */}
<div className="relative z-10 flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
<span className="font-bold">4</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">Bank Info</span>
</div>
</div>
</div>
{/* Form Card */}
<div className="w-full max-w-2xl px-margin-mobile">
<div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 form-card border border-outline-variant/30">
<div className="mb-8">
<h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Business Information</h1>
<p className="text-on-surface-variant font-body-md">Tell us more about your agricultural business to help us verify your account.</p>
</div>
<form className="space-y-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant block">Business Name</label>
<input className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="e.g. Green Valley Farmstead" type="text" />
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant block">Owner Name</label>
<input className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Full legal name" type="text" />
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant block">Business Email</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
<input className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="email@business.com" type="email" />
</div>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant block">Mobile Number</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">call</span>
<input className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="+1 (555) 000-0000" type="tel" />
</div>
</div>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant block">Business Address</label>
<textarea className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none" placeholder="Enter your full operational address" rows="3"></textarea>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant block">GST Number / Tax ID</label>
<input className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="e.g. 22AAAAA0000A1Z5" type="text" />
<p className="text-[11px] text-on-surface-variant italic">Required for commercial listing and invoice generation.</p>
</div>
<div className="pt-4 flex flex-col md:flex-row gap-4">
<button className="w-full md:w-1/3 py-3 rounded-lg border border-outline text-on-surface-variant font-label-md hover:bg-surface-container transition-colors active:scale-95" type="button">
                            Previous Step
                        </button>
<button className="w-full md:w-2/3 py-3 rounded-lg bg-primary text-on-primary font-label-md shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2" type="submit">
                            Next: Document Upload
                            <span className="material-symbols-outlined">arrow_forward</span>
</button>
</div>
</form>
</div>
<div className="mt-8 flex items-center justify-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-[18px]">lock</span>
<span className="text-label-sm">Your data is encrypted and secure with ExVeg protocols.</span>
</div>
</div>
</main>
{/* Footer */}
<footer className="w-full py-8 bg-surface-container-lowest dark:bg-surface-dim border-t border-outline-variant">
<div className="flex flex-col md:flex-row justify-between items-center gap-4 px-margin-mobile md:px-margin-desktop w-full">
<div className="flex flex-col items-center md:items-start gap-2">
<div className="font-headline-sm text-headline-sm text-on-surface">ExVeg</div>
<div className="font-label-sm text-label-sm text-on-surface-variant">© 2024 ExVeg. All rights reserved.</div>
</div>
<div className="flex gap-6">
<a className="text-on-surface-variant font-label-sm hover:text-primary underline transition-opacity hover:opacity-80" href="#">Privacy Policy</a>
<a className="text-on-surface-variant font-label-sm hover:text-primary underline transition-opacity hover:opacity-80" href="#">Terms of Service</a>
<a className="text-on-surface-variant font-label-sm hover:text-primary underline transition-opacity hover:opacity-80" href="#">Cookie Policy</a>
<a className="text-on-surface-variant font-label-sm hover:text-primary underline transition-opacity hover:opacity-80" href="#">Support</a>
</div>
</div>
</footer>



    </>
  );
};

export default SellerRegistrationBusinessDetails;
