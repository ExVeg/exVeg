import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';

const BuyerRegistrationPersonalInfo = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <>
      
{/* TopNavBar */}
<nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-outline-variant/60 shadow-sm z-50">
<div className="flex justify-between items-center h-16 px-4 md:px-margin-desktop max-w-7xl mx-auto">
<Link to="/" className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-3xl" style={{"fontVariationSettings":"'FILL' 1"}}>spa</span>
<span className="font-headline-md text-headline-md font-extrabold text-[#166534]">ExVeg</span>
</Link>
<div className="flex items-center gap-2 sm:gap-4 md:gap-6">
<div className="hidden sm:block"><LanguageSwitcher compact /></div>
<Link className="hidden md:inline text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-body-md" to="/products">Marketplace</Link>
<Link className="hidden md:inline text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-body-md" to="/">Home</Link>
<Link className="hidden md:inline bg-gradient-to-r from-[#166534] to-[#15803d] text-white px-5 py-1.5 rounded-full font-bold text-sm active:scale-95 transition-transform font-body-md" to="/login">Log In</Link>
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
<Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-semibold text-on-surface hover:text-primary">Marketplace</Link>
<Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-semibold text-on-surface hover:text-primary">Home</Link>
<Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 bg-primary text-white text-center rounded-lg font-bold">Log In</Link>
</div>
)}
</nav>
<main className="flex-grow pt-32 pb-20 px-margin-mobile md:px-margin-desktop flex flex-col items-center bg-[#f8faf5] min-h-screen">
{/* Progress Indicator */}
<div className="w-full max-w-2xl mb-12">
<div className="flex items-center justify-between relative">
{/* Progress Line */}
<div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-highest -translate-y-1/2 z-0"></div>
<div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-secondary-container -translate-y-1/2 z-0"></div>
{/* Step 1: Account Type */}
<div className="relative z-10 flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shadow-md">
<span className="material-symbols-outlined text-xl">check</span>
</div>
<span className="font-label-sm text-label-sm text-secondary font-bold">1. Account Type</span>
</div>
{/* Step 2: Personal Info (Active) */}
<div className="relative z-10 flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shadow-md border-4 border-white step-pulse">
<span className="font-bold">2</span>
</div>
<span className="font-label-sm text-label-sm text-tertiary font-bold">2. Personal Info</span>
</div>
{/* Step 3: Verification */}
<div className="relative z-10 flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center border-4 border-white">
<span className="font-bold">3</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">3. Verification</span>
</div>
</div>
</div>
{/* Registration Card */}
<div className="w-full max-w-xl bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 md:p-12 form-card">
<div className="mb-8 text-center">
<h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Create Your Buyer Account</h1>
<p className="text-on-surface-variant font-body-md">Join the largest agricultural trade network. Please provide your personal details to get started.</p>
</div>
<form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
<div className="grid grid-cols-1 gap-6">
{/* Full Name */}
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="full_name">
<span className="material-symbols-outlined text-base">person</span> Full Name
                        </label>
<input className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200" id="full_name" placeholder="John Doe" type="text" />
</div>
{/* Email Address */}
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="email">
<span className="material-symbols-outlined text-base">mail</span> Email Address
                        </label>
<input className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200" id="email" placeholder="john@example.com" type="email" />
</div>
{/* Mobile Number */}
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="phone">
<span className="material-symbols-outlined text-base">call</span> Mobile Number
                        </label>
<div className="relative">
<input className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200" id="phone" placeholder="+1 (555) 000-0000" type="tel" />
</div>
</div>
{/* Password */}
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="password">
<span className="material-symbols-outlined text-base">lock</span> Password
                        </label>
<div className="relative">
<input className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200" id="password" onInput={() => {}} placeholder="••••••••" type="password" />
<button className="absolute right-3 top-3 text-on-surface-variant hover:text-primary transition-colors" type="button">
<span className="material-symbols-outlined">visibility</span>
</button>
</div>
{/* Strength Meter */}
<div className="mt-2 space-y-1">
<div className="flex gap-1 h-1">
<div className="flex-1 bg-surface-container-highest rounded-full transition-colors duration-300" id="strength-1"></div>
<div className="flex-1 bg-surface-container-highest rounded-full transition-colors duration-300" id="strength-2"></div>
<div className="flex-1 bg-surface-container-highest rounded-full transition-colors duration-300" id="strength-3"></div>
<div className="flex-1 bg-surface-container-highest rounded-full transition-colors duration-300" id="strength-4"></div>
</div>
<span className="text-[10px] font-label-sm uppercase text-on-surface-variant" id="strength-text">Security Level: Waiting...</span>
</div>
</div>
{/* Confirm Password */}
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="confirm_password">
<span className="material-symbols-outlined text-base">verified_user</span> Confirm Password
                        </label>
<input className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200" id="confirm_password" placeholder="••••••••" type="password" />
</div>
</div>
{/* Terms */}
<div className="flex items-start gap-3 py-2">
<input className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" id="terms" type="checkbox" />
<label className="font-body-md text-on-surface-variant text-sm" htmlFor="terms">
                        I agree to the <a className="text-primary font-bold hover:underline" href="#">Terms of Service</a> and <a className="text-primary font-bold hover:underline" href="#">Privacy Policy</a> of ExVeg.
                    </label>
</div>
{/* CTA */}
<button className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4" type="submit">
                    Continue to Dashboard
                    <span className="material-symbols-outlined">arrow_forward</span>
</button>
</form>
</div>
{/* Trust Badges */}
<div className="mt-12 flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
<div className="flex items-center gap-2 font-label-md">
<span className="material-symbols-outlined">security</span> Encrypted Data
            </div>
<div className="flex items-center gap-2 font-label-md">
<span className="material-symbols-outlined">verified</span> Verified Sellers
            </div>
<div className="flex items-center gap-2 font-label-md">
<span className="material-symbols-outlined">public</span> Global Logistics
            </div>
</div>
</main>
{/* Footer */}
<footer className="bg-surface-container-lowest dark:bg-surface-dim border-t border-outline-variant w-full py-8">
<div className="flex flex-col md:flex-row justify-between items-center gap-4 px-margin-mobile md:px-margin-desktop w-full">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">ExVeg</span>
</div>
<div className="flex flex-wrap justify-center gap-6">
<a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity hover:opacity-80 underline" href="#">Privacy Policy</a>
<a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity hover:opacity-80 underline" href="#">Terms of Service</a>
<a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity hover:opacity-80 underline" href="#">Cookie Policy</a>
<a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity hover:opacity-80 underline" href="#">Support</a>
</div>
<p className="font-label-sm text-label-sm text-secondary dark:text-secondary-fixed">
                © 2024 ExVeg. All rights reserved.
            </p>
</div>
</footer>




    </>
  );
};

export default BuyerRegistrationPersonalInfo;
