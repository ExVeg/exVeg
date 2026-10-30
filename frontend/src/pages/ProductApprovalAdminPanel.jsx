import React from 'react';
import { Link } from 'react-router-dom';

const ProductApprovalAdminPanel = () => {
  return (
    <>
      
{/* SideNavBar */}
<aside className="fixed left-0 top-0 h-full z-40 h-screen w-64 border-r border-outline-variant bg-surface dark:bg-inverse-surface shadow-sm transition-all duration-300">
<div className="p-6">
<h1 className="text-title-lg font-headline-md font-bold text-primary dark:text-inverse-primary"><span style={{"fontSize":"24px","backgroundColor":"rgba(255, 255, 255, 0.8)"}}>ExVeg</span></h1>
<p className="font-label-md text-label-md text-on-surface-variant opacity-70">Admin Console</p>
</div>
<nav className="mt-4 px-3 space-y-1">
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg group" href="#">
<span className="material-symbols-outlined group-hover:text-primary">dashboard</span>
<span className="font-label-md text-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg group" href="#">
<span className="material-symbols-outlined group-hover:text-primary">storefront</span>
<span className="font-label-md text-label-md">Sellers</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold scale-95 transition-transform duration-150" href="#">
<span className="material-symbols-outlined">inventory_2</span>
<span className="font-label-md text-label-md">Products</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg group" href="#">
<span className="material-symbols-outlined group-hover:text-primary">shopping_cart</span>
<span className="font-label-md text-label-md">Orders</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg group" href="#">
<span className="material-symbols-outlined group-hover:text-primary">group</span>
<span className="font-label-md text-label-md">Users</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg group" href="#">
<span className="material-symbols-outlined group-hover:text-primary">bar_chart</span>
<span className="font-label-md text-label-md">Reports</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg group" href="#">
<span className="material-symbols-outlined group-hover:text-primary">settings</span>
<span className="font-label-md text-label-md">Settings</span>
</a>
</nav>
</aside>
{/* TopNavBar */}
<header className="fixed top-0 right-0 left-64 h-16 flex justify-between items-center px-8 z-30 glass-nav border-b border-outline-variant">
<div className="flex items-center gap-4 flex-1">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Search new products..." type="text" />
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-2">
<button className="p-2 hover:bg-surface-container-high rounded-full relative transition-colors">
<span className="material-symbols-outlined text-on-surface-variant">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface"></span>
</button>
<button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
<span className="material-symbols-outlined text-on-surface-variant">help</span>
</button>
<button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
<span className="material-symbols-outlined text-on-surface-variant">apps</span>
</button>
</div>
<div className="h-8 w-[1px] bg-outline-variant"></div>
<div className="flex items-center gap-3 cursor-pointer group">
<div className="text-right">
<p className="font-label-md text-on-surface font-bold">Admin User</p>
<p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Senior Auditor</p>
</div>
<img alt="Administrator Avatar" className="w-10 h-10 rounded-full border border-outline-variant object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKbE3LZ0fQ6_t3MRaF-O-ZandWi1Ac_oqWPFt7Ql5nYncq4DuKmUOjNNT1kIf3ma1v1nUB5pbpD-3Cr-d16CygTZ7CntmvtlndAARw_qQlQ_GVpgRAf-XCil7_UrPvvcgM9ope1Xy4LUjZzbTrjisNtDK_cbseblUxoc8BQLWp0_3w0IOdcY-LdJnQowXJ_o8931VBp9pPV3QwM1AS6DQI4BHruGF1jb29qjy-zb4PifAO9MSTV5E0yW7XbtC68hZK1UPaSNsnVSI" />
</div>
</div>
</header>
{/* Main Content */}
<main className="pl-64 pt-16 min-h-screen">
<div className="p-margin-desktop grid grid-cols-12 gap-gutter h-[calc(100vh-64px)] overflow-hidden">
{/* Left Side: Product Queue */}
<div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col h-full">
<div className="flex justify-between items-center mb-6">
<div>
<h2 className="font-headline-md text-headline-md text-primary">Verification Queue</h2>
<p className="font-label-md text-on-surface-variant">14 items pending review</p>
</div>
<button className="flex items-center gap-2 px-3 py-1.5 border border-outline text-on-surface-variant rounded-lg hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-[20px]">filter_list</span>
<span className="font-label-sm text-label-sm">Filters</span>
</button>
</div>
<div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
{/* Product Item 1 (Selected) */}
<div className="bg-surface border-2 border-primary p-4 rounded-xl shadow-sm cursor-pointer relative transition-all active:scale-[0.98]">
<div className="flex gap-4">
<img className="w-20 h-20 rounded-lg object-cover shadow-sm" data-alt="Close-up shot of organic high-grade compost in a biodegradable burlap sack, set against a bright, modern agricultural warehouse background. The lighting is soft and professional, highlighting the rich texture of the soil. The overall aesthetic is clean, sustainable, and premium, using earthy greens and crisp whites." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaQ4_8dGetcEPUaThpyBRrN_A1Vg977B4KEYNX7gH728oKDjP5S_GoyWfbM37rNiDQqdkel2_M83zPOAVqPRaCZCiPQZ1DPySUeLOf7Fo9KH0IfHkn_FMdU5Ugo4sl9rsn3-zLaThjTPXCU-1DZpF_I3aEk8dJrhv1fj5a7yifFkG0mOXvNuADsOPowC5N0GGaBNeAQN309sntYNL5Dh8qtNjdC46PqKxClAXk9UrBHibol5nYv60ScxbBOeuzL2dK7aNcns0fskU" />
<div className="flex-1 min-w-0">
<div className="flex justify-between items-start">
<h3 className="font-title-lg text-primary truncate">Premium Organic Compost</h3>
<span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed rounded text-[10px] font-bold uppercase tracking-wide">New</span>
</div>
<p className="text-label-md text-on-surface-variant">Fertilizers &amp; Soil</p>
<div className="mt-2 flex justify-between items-end">
<div>
<p className="text-label-sm text-on-surface-variant font-medium">Seller: <span className="text-on-surface">GreenEarth Supplies</span></p>
<p className="font-title-lg text-primary mt-1">$45.00 <span className="text-label-sm font-normal text-on-surface-variant">/ 25kg</span></p>
</div>
<div className="flex items-center gap-1 text-tertiary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="text-label-sm font-bold">4.8</span>
</div>
</div>
</div>
</div>
</div>
{/* Product Item 2 */}
<div className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md hover:border-primary/50 transition-all active:scale-[0.98] group">
<div className="flex gap-4">
<img className="w-20 h-20 rounded-lg object-cover shadow-sm" data-alt="Handcrafted high-carbon steel trowel with a polished wooden handle, resting on a clean white surface with subtle green leaf accents. High-key lighting emphasizing the quality craftsmanship and sharp edges of the tool. The style is modern, minimalist, and luxury hardware, aligning with a corporate professional agricultural theme." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8ZBLCTO9xxkljdl45CntAjTT3aeqOR4l1OHc6oBM6JO14za9HjlVkjbM2bcaWVRgSKEKOvWxyaUQ1F3EmKREIks_D1yVb7sj1F0nsPSawhvyQaentfRTsxSLCy6INa5DlVYRxHF8kPfdUTIyWre8qhlIcb2z-JtyiJMii3ngxFjheQ0NqQzsaCqPFpPyh0nKWjdv3JdsrqAAHvr-ggT3p_kvWsGoxaZGzaHTepnfLD-2zjzUamEmv7_8ql3TbBtIiwizC8WRSM4Q" />
<div className="flex-1 min-w-0">
<h3 className="font-title-lg text-on-surface truncate group-hover:text-primary transition-colors">Carbon Steel Garden Trowel</h3>
<p className="text-label-md text-on-surface-variant">Tools &amp; Equipment</p>
<div className="mt-2 flex justify-between items-end">
<div>
<p className="text-label-sm text-on-surface-variant font-medium">Seller: <span className="text-on-surface">AgriTools Pro</span></p>
<p className="font-title-lg text-primary mt-1">$18.50</p>
</div>
<div className="flex items-center gap-1 text-tertiary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="text-label-sm font-bold">4.9</span>
</div>
</div>
</div>
</div>
</div>
{/* Product Item 3 */}
<div className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md hover:border-primary/50 transition-all active:scale-[0.98] group">
<div className="flex gap-4">
<img className="w-20 h-20 rounded-lg object-cover shadow-sm" data-alt="A macro shot of vibrant heirloom tomato seeds neatly arranged in high-quality glass vials with cork stoppers. Bright, clean laboratory lighting suggesting purity and scientific vetting. Minimalist white background with subtle green reflections to convey growth and vitality. The visual style is premium B2B SaaS agricultural ecommerce." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV6KIlX-q3oGOLPSt61RzNgK2RncmVMdqFjUxqk55YJGUiiIaTuhOKoDDoRhZfoKL9aMRR2Tfi2aGxsyeQdv6W0O_-eJsZ0xDJKqf5VRERuqChpHa1g9KVtUB_CKa6PxjPNqisDYQkATYVpznabRu-rnEup4su_eYOVAwC6v6mbAP05p5o1pMgR7CUDGEnaGKEyK1cfas15s8aoqUv99KiNXTegS5M62W3cFp-TauMG6cat6-tZl2VDxlQvtJbJUp2R4ROxJXg3Us" />
<div className="flex-1 min-w-0">
<h3 className="font-title-lg text-on-surface truncate group-hover:text-primary transition-colors">Heirloom Tomato Seed Kit</h3>
<p className="text-label-md text-on-surface-variant">Seeds &amp; Bulbs</p>
<div className="mt-2 flex justify-between items-end">
<div>
<p className="text-label-sm text-on-surface-variant font-medium">Seller: <span className="text-on-surface">Heritage Flora</span></p>
<p className="font-title-lg text-primary mt-1">$12.99</p>
</div>
<div className="flex items-center gap-1 text-tertiary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="text-label-sm font-bold">5.0</span>
</div>
</div>
</div>
</div>
</div>
{/* Product Item 4 */}
<div className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md hover:border-primary/50 transition-all active:scale-[0.98] group">
<div className="flex gap-4">
<img className="w-20 h-20 rounded-lg object-cover shadow-sm" data-alt="Professional grade drip irrigation system components displayed on a clean drafting table. The scene includes precise nozzles and tubing with technical blueprints subtly in the background. Bright, high-contrast lighting that conveys engineering excellence and technological advancement in farming. Color palette of technical grays and vibrant primary greens." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzGXDZAgY3wpYAIMa5FlVaRdK2DNwcn4wsx88x2VFqrDmkCOBwesb2GA6ptMS5Hsk-fEaUv9tCy5hb_wXuI3qOEkjYYcDAOKgDGic1_lY7qcmi-WBj30DppnSHjmI1gx5UsZQForT01kwueR11eQfKyOkN8g1NA9RUN2fVmzVoBuzprEPo8aQRbI_4lj6t1sS1I-NZWZDv-jN99GZh2x6X6ep0y99tN22pLqKa66wlnUrmieXxNu32_t_HBaHi_n0ShFnML1wNs7s" />
<div className="flex-1 min-w-0">
<h3 className="font-title-lg text-on-surface truncate group-hover:text-primary transition-colors">Precision Drip Irrigation Hub</h3>
<p className="text-label-md text-on-surface-variant">Irrigation Systems</p>
<div className="mt-2 flex justify-between items-end">
<div>
<p className="text-label-sm text-on-surface-variant font-medium">Seller: <span className="text-on-surface">AquaFlow Solutions</span></p>
<p className="font-title-lg text-primary mt-1">$245.00</p>
</div>
<div className="flex items-center gap-1 text-tertiary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="text-label-sm font-bold">4.7</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
{/* Right Side: Detailed Review */}
<div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col h-full">
<div className="bg-white border border-outline-variant rounded-2xl shadow-lg flex flex-col h-full overflow-hidden">
{/* Review Header */}
<div className="p-8 border-b border-outline-variant bg-surface-bright flex justify-between items-start">
<div className="flex gap-6">
<div className="relative group">
<img className="w-32 h-32 rounded-2xl object-cover shadow-md ring-4 ring-white" data-alt="Macro photography of organic compost highlighting its rich, dark nutrient-dense texture. Soft morning sunlight streams across the soil, creating deep shadows and bright highlights. The setting is clean and high-end, suitable for a professional agricultural review interface. Colors are deep browns, vibrant greens, and soft white light." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvAEuIvd2mIJOuQRm0oV0H9LW_qJUDC2nEuO0cIr9ksbNVVd6TWHLYEDqxUayMqDD7eVF1EIV8zSgtd0i1JUs33aD7Rph4dpZVmGzitjaJm6zidS8U5xgXV13sFvGwFibDT2xZrroyylLGDrOKUYVaXiZNTa60ApvEWMFsbgnyK01YKJH7AFSfHH2mLBb8mg4hGP3fMkYzGakl1iW3MwLSeL1ro__CbTHSg-d-iG9sSerWbbvJ8glRnNZ7qITIXmpg-ruwJI_KoG0" />
<button className="absolute bottom-1 right-1 bg-primary text-on-primary p-1.5 rounded-lg shadow-lg">
<span className="material-symbols-outlined text-[18px]">zoom_in</span>
</button>
</div>
<div>
<div className="flex items-center gap-3 mb-1">
<span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-sm">Fertilizers &amp; Soil</span>
<span className="text-label-sm text-on-surface-variant">• Added 2 hours ago</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Premium Organic Compost (25kg Bag)</h2>
<div className="flex items-center gap-4 mt-2">
<div className="flex items-center gap-1.5">
<img alt="Seller" className="w-6 h-6 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyOszwx6oKioQVVo_3BhtHdOjP1f2pxU8kdTlGO-QMCR_xPcGtBYv32KveJNw-kRsMi8cgprzevg2G-o82wqFwKxH3fBmR1lBNNyY-dy5TpWohf-cLJc3p-Ytw9qVd8PuGqORl971pAlDty_8usbLr0Y6k6tGzwJxiPZFaBS2UmwH5Qho0iATd_MI74CN9Oa3qjL4UF_BsZiSQ5CXNjpqIE4jmpiUg3ttobomtUtmioLTdDMRCJeGUX5WbWH5O3Gtd8tdqta8m4Zw" />
<span className="font-label-md text-on-surface">GreenEarth Supplies</span>
<span className="material-symbols-outlined text-primary text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>verified</span>
</div>
<div className="h-4 w-[1px] bg-outline-variant"></div>
<div className="flex items-center gap-1 text-tertiary">
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="font-bold">4.8</span>
<span className="text-on-surface-variant text-label-sm">(122 reviews)</span>
</div>
</div>
</div>
</div>
<div className="text-right">
<p className="font-headline-md text-headline-md text-primary">$45.00</p>
<p className="text-label-sm text-on-surface-variant">MSRP: $52.00</p>
<span className="inline-block mt-2 px-3 py-1 bg-on-secondary-container/10 text-on-secondary-container rounded-lg font-bold text-label-sm">14% Profit Margin</span>
</div>
</div>
{/* Scrollable Review Content */}
<div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
{/* Description Section */}
<section>
<h3 className="font-title-lg text-on-surface flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-primary">description</span>
                                Product Description
                            </h3>
<div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant leading-relaxed text-on-surface-variant">
<p className="">Our Premium Organic Compost is a triple-screened, nutrient-dense amendment specifically formulated for high-yield sustainable farming. Produced using a proprietary 12-week aerobic decomposition process, it contains a balanced ratio of nitrogen, phosphorus, and potassium, alongside vital trace minerals and beneficial microbial life.</p>
<ul className="mt-4 space-y-2 list-disc list-inside">
<li className="">100% Certified Organic materials</li>
<li className="">Free from weed seeds and pathogens</li>
<li className="">Improves soil structure and water retention</li>
<li className="">Suitable for all crop types</li>
</ul>
</div>
</section>
<div className="grid grid-cols-2 gap-gutter">
{/* Target Audience */}
<section>
<h3 className="font-title-lg text-on-surface flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-primary">groups</span>
                                    Target Audience
                                </h3>
<div className="flex flex-wrap gap-2">
<div className="flex items-center gap-2 px-4 py-3 bg-secondary-container/30 border border-secondary text-on-secondary-container rounded-xl flex-1">
<span className="material-symbols-outlined">agriculture</span>
<div className="text-left">
<p className="font-bold text-label-md">Farmers</p>
<p className="text-[10px] opacity-80">Industrial Scale</p>
</div>
</div>
<div className="flex items-center gap-2 px-4 py-3 bg-tertiary-fixed border border-tertiary text-on-tertiary-fixed rounded-xl flex-1">
<span className="material-symbols-outlined">yard</span>
<div className="text-left">
<p className="font-bold text-label-md">Home Gardeners</p>
<p className="text-[10px] opacity-80">Consumer Grade</p>
</div>
</div>
</div>
</section>
{/* Logistics */}
<section>
<h3 className="font-title-lg text-on-surface flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-primary">local_shipping</span>
                                    Specifications
                                </h3>
<div className="grid grid-cols-2 gap-2">
<div className="p-3 bg-surface border border-outline-variant rounded-lg">
<p className="text-[10px] uppercase text-on-surface-variant">Weight</p>
<p className="font-bold">25.0 kg</p>
</div>
<div className="p-3 bg-surface border border-outline-variant rounded-lg">
<p className="text-[10px] uppercase text-on-surface-variant">SKU</p>
<p className="font-bold">ORG-COM-25K</p>
</div>
</div>
</section>
</div>
{/* Compliance Documents */}
<section>
<h3 className="font-title-lg text-on-surface flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-primary">fact_check</span>
                                Compliance &amp; Documents
                            </h3>
<div className="space-y-3">
<div className="flex items-center justify-between p-4 bg-surface border border-outline-variant rounded-xl hover:border-primary transition-colors cursor-pointer group">
<div className="flex items-center gap-4">
<div className="w-10 h-10 bg-error-container text-on-error-container rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined">picture_as_pdf</span>
</div>
<div>
<p className="font-bold text-on-surface">Organic Certification (USDA)</p>
<p className="text-label-sm text-on-surface-variant">PDF • 2.4 MB • Verified by GreenTrust</p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">visibility</span>
</div>
<div className="flex items-center justify-between p-4 bg-surface border border-outline-variant rounded-xl hover:border-primary transition-colors cursor-pointer group">
<div className="flex items-center gap-4">
<div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined">description</span>
</div>
<div>
<p className="font-bold text-on-surface">Nutrient Analysis Report</p>
<p className="text-label-sm text-on-surface-variant">PDF • 1.1 MB • Issued: Jan 2024</p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">visibility</span>
</div>
</div>
</section>
</div>
{/* Action Bar */}
<div className="p-8 border-t border-outline-variant bg-surface-bright flex items-center justify-between gap-4">
<div className="flex items-center gap-4">
<button className="flex items-center gap-2 px-6 py-3 border-2 border-error text-error font-bold rounded-xl hover:bg-error-container/20 transition-all active:scale-95">
<span className="material-symbols-outlined">close</span>
                                Reject Product
                            </button>
<button className="flex items-center gap-2 px-6 py-3 border-2 border-tertiary text-tertiary font-bold rounded-xl hover:bg-tertiary-fixed/30 transition-all active:scale-95">
<span className="material-symbols-outlined">edit_note</span>
                                Request Edit
                            </button>
</div>
<button className="flex items-center gap-2 px-10 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-95">
<span className="material-symbols-outlined">check_circle</span>
                            Approve Product
                        </button>
</div>
</div>
</div>
</div>
</main>
{/* Micro-interaction Scripts */}




    </>
  );
};

export default ProductApprovalAdminPanel;
