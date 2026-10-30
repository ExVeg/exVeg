import React from 'react';
import { Link } from 'react-router-dom';

const SellerRegistrationBankDetails = () => {
  return (
    <>
      
{/* TopNavBar */}
<header className="fixed top-0 w-full bg-white/80 dark:bg-surface-container/80 backdrop-blur-md shadow-sm border-b border-outline-variant/30 z-50">
<div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop w-full">
<div className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary">ExVeg</div>
<nav className="hidden md:flex gap-8 items-center">
<a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" href="#">Marketplace</a>
<a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" href="#">Resources</a>
<a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" href="#">About Us</a>
<button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md text-label-md active:scale-95 transition-transform">
                    Log In
                </button>
</nav>
<button className="md:hidden text-primary">
<span className="material-symbols-outlined">menu</span>
</button>
</div>
</header>
<main className="flex-grow pt-24 pb-12 px-margin-mobile md:px-margin-desktop flex flex-col items-center">
{/* Progress Indicator */}
<div className="w-full max-w-2xl mb-10">
<div className="flex items-center justify-between mb-4">
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-sm">check</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">Basic Info</span>
</div>
<div className="flex-grow h-[2px] bg-secondary mx-2 mb-6"></div>
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-sm">check</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">Business</span>
</div>
<div className="flex-grow h-[2px] bg-secondary mx-2 mb-6"></div>
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-sm">check</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">Tax Docs</span>
</div>
<div className="flex-grow h-[2px] bg-outline-variant/30 mx-2 mb-6 relative">
{/* Current Pulse Effect */}
<div className="absolute inset-0 bg-tertiary/20 animate-pulse rounded-full"></div>
</div>
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold ring-4 ring-tertiary-fixed/30 animate-pulse">
                        4
                    </div>
<span className="font-label-sm text-label-sm text-tertiary font-bold">Bank Details</span>
</div>
</div>
</div>
{/* Registration Card */}
<div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-8 md:p-12">
<div className="mb-8">
<h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Final Step: Secure Payments</h1>
<p className="text-on-surface-variant">Please provide your bank details to receive payments for your agricultural sales. We ensure high-level encryption for all financial data.</p>
</div>
<form className="space-y-6">
{/* Bank Name */}
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface" htmlFor="bank_name">Bank Name</label>
<div className="relative">
<select className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none outline-none" id="bank_name">
<option disabled defaultSelected value="">Select your bank</option>
<option value="sbi">State Bank of India</option>
<option value="hdfc">HDFC Bank</option>
<option value="icici">ICICI Bank</option>
<option value="axis">Axis Bank</option>
<option value="other">Other Bank...</option>
</select>
<span className="material-symbols-outlined absolute right-4 top-3 text-on-surface-variant pointer-events-none">expand_more</span>
</div>
</div>
{/* Account Holder Name */}
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface" htmlFor="holder_name">Account Holder Name</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-4 top-3 text-on-surface-variant">person</span>
<input className="w-full h-12 pl-12 pr-4 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" id="holder_name" placeholder="As per bank records" type="text" />
</div>
</div>
{/* Account Number */}
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface" htmlFor="account_number">Account Number</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-4 top-3 text-on-surface-variant">account_balance_wallet</span>
<input className="w-full h-12 pl-12 pr-4 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" id="account_number" placeholder="Enter full account number" type="number" />
</div>
</div>
{/* IFSC Code */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface" htmlFor="ifsc">IFSC Code</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-4 top-3 text-on-surface-variant">info</span>
<input className="w-full h-12 pl-12 pr-4 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none uppercase" id="ifsc" placeholder="e.g. SBIN0001234" type="text" />
</div>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface" htmlFor="branch">Branch Name (Optional)</label>
<input className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" id="branch" placeholder="Branch location" type="text" />
</div>
</div>
{/* Security Assurance */}
<div className="flex items-start gap-3 p-4 bg-secondary-container/20 rounded-lg border border-secondary-container/30">
<span className="material-symbols-outlined text-secondary" style={{"fontVariationSettings":"'FILL' 1"}}>verified_user</span>
<p className="font-label-sm text-label-sm text-on-secondary-container">Your banking information is encrypted with 256-bit AES technology. We do not store your full credentials on our primary servers.</p>
</div>
{/* CTA */}
<div className="pt-6">
<button className="w-full bg-primary text-on-primary h-14 rounded-lg font-title-lg text-title-lg shadow-lg hover:shadow-xl hover:bg-primary-container transition-all active:scale-[0.98]" type="submit">
                        Complete Registration
                    </button>
<p className="text-center mt-4 font-label-sm text-label-sm text-on-surface-variant">
                        By completing, you agree to our <a className="text-primary hover:underline" href="#">Seller Payout Terms</a>.
                    </p>
</div>
</form>
</div>
{/* Decorative Element */}
<div className="mt-12 opacity-50 hidden md:block">
<div className="flex items-center gap-4 text-outline font-label-md">
<span className="material-symbols-outlined">shield</span>
<span className="">ISO 27001 Certified Platform</span>
<span className="w-1 h-1 rounded-full bg-outline"></span>
<span className="material-symbols-outlined">security</span>
<span className="">PCI DSS Compliant Gateway</span>
</div>
</div>
</main>
{/* Footer */}
<footer className="bg-surface-container-lowest dark:bg-surface-dim border-t border-outline-variant w-full py-8">
<div className="flex flex-col md:flex-row justify-between items-center gap-4 px-margin-mobile md:px-margin-desktop w-full">
<div className="font-headline-sm text-headline-sm text-on-surface">
                AgriMarket Connect
            </div>
<div className="flex gap-6">
<a className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary underline transition-opacity hover:opacity-80" href="#">Privacy Policy</a>
<a className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary underline transition-opacity hover:opacity-80" href="#">Terms of Service</a>
<a className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary underline transition-opacity hover:opacity-80" href="#">Cookie Policy</a>
<a className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary underline transition-opacity hover:opacity-80" href="#">Support</a>
</div>
<div className="font-label-sm text-label-sm text-secondary dark:text-secondary-fixed">
                © 2024 AgriMarket Connect. All rights reserved.
            </div>
</div>
</footer>




    </>
  );
};

export default SellerRegistrationBankDetails;
