import React from 'react';
import { Link } from 'react-router-dom';

const SellerVerificationAdminPanel = () => {
  return (
    <>
      
{/* Side Navigation Bar */}
<aside className="fixed left-0 top-0 h-full z-40 h-screen w-64 border-r border-outline-variant bg-surface shadow-sm">
<div className="p-6">
<h1 className="text-title-lg font-headline-md font-bold text-primary"><span style={{"fontSize":"24px","backgroundColor":"rgba(255, 255, 255, 0.8)"}}>ExVeg</span></h1>
<p className="text-on-surface-variant font-label-sm">Admin Console</p>
</div>
<nav className="mt-4 px-4 space-y-2">
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="font-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold scale-95 transition-transform duration-150" href="#">
<span className="material-symbols-outlined">storefront</span>
<span className="font-label-md">Sellers</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">inventory_2</span>
<span className="font-label-md">Products</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">shopping_cart</span>
<span className="font-label-md">Orders</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">group</span>
<span className="font-label-md">Users</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">bar_chart</span>
<span className="font-label-md">Reports</span>
</a>
<div className="pt-4 mt-4 border-t border-outline-variant">
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-label-md">Settings</span>
</a>
</div>
</nav>
</aside>
{/* Top Navigation Bar */}
<header className="fixed top-0 right-0 left-64 h-16 flex justify-between items-center px-8 z-30 glass-nav border-b border-outline-variant">
<div className="flex items-center gap-4 flex-1">
<div className="relative w-96">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-full text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Search sellers or registration IDs..." type="text" />
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4 border-r border-outline-variant pr-6">
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">help</span>
</button>
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">apps</span>
</button>
</div>
<div className="flex items-center gap-3 pl-2">
<div className="text-right">
<p className="font-label-md text-on-surface font-bold">Admin User</p>
<p className="font-label-sm text-on-surface-variant">System Manager</p>
</div>
<img className="w-10 h-10 rounded-full object-cover border-2 border-primary-container" data-alt="A professional headshot of a corporate administrator in a modern office setting. The lighting is bright and clean, emphasizing a high-end SaaS professional aesthetic. The subject is wearing a sharp charcoal suit against a blurred background of a high-tech agricultural operations center with glass partitions and soft green indoor plants." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMD263uQLLqqrGwPtZ2pB1_u-jQvmP6369y0rduFjn_oj-in45swKGUlWuZB3AZM1gbWMm_aTyiXMSdNXU6Upt8ck5VvPCJ9WizUvVAZLyRJK4094Yu-v0ACmHsb6uj_phFuXnVUiY_Mhripl5FyDptLawp7xqWz9XbLb_eOKAioQxwQhUnuOXOUuDuOktyUQR5D_ObkccgYTTm3U1TpwUAhjDLyGzcNIj5XbXnBtsVc7_vzOPICt_15iAByJXfRZrBKYtg0NjAD0" />
</div>
</div>
</header>
{/* Main Content Area */}
<main className="ml-64 pt-24 px-8 pb-12">
{/* Header & Statistics */}
<section className="mb-8">
<div className="flex justify-between items-end mb-6">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Seller Verification</h2>
<p className="font-body-md text-on-surface-variant">Manage and review merchant applications for the AgriMarket Connect platform.</p>
</div>
<div className="flex gap-4">
<button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined">download</span>
                        Export Report
                    </button>
<button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-opacity">
<span className="material-symbols-outlined">add</span>
                        Invite Seller
                    </button>
</div>
</div>
{/* Summary Cards Grid */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
<div className="content-card p-6 flex items-center gap-4 border-l-4 border-l-tertiary">
<div className="w-12 h-12 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>pending_actions</span>
</div>
<div>
<p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Total Pending</p>
<h3 className="font-headline-md text-headline-md">142</h3>
</div>
</div>
<div className="content-card p-6 flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>verified_user</span>
</div>
<div>
<p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Approved Today</p>
<h3 className="font-headline-md text-headline-md">28</h3>
</div>
</div>
<div className="content-card p-6 flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center text-error">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>report</span>
</div>
<div>
<p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Flagged Apps</p>
<h3 className="font-headline-md text-headline-md">12</h3>
</div>
</div>
<div className="content-card p-6 flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>speed</span>
</div>
<div>
<p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Avg. Review Time</p>
<h3 className="font-headline-md text-headline-md">4.2h</h3>
</div>
</div>
</div>
</section>
{/* Main Data View */}
<section className="content-card overflow-hidden">
{/* Filters Toolbar */}
<div className="p-6 border-b border-outline-variant bg-surface-container-low flex flex-wrap items-center justify-between gap-4">
<div className="flex items-center gap-4">
<div className="flex items-center gap-2">
<label className="font-label-sm text-on-surface-variant">Status:</label>
<select className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 font-label-md focus:ring-primary focus:border-primary">
<option>All Statuses</option>
<option>Pending</option>
<option>Reviewing</option>
<option>Rejected</option>
</select>
</div>
<div className="flex items-center gap-2">
<label className="font-label-sm text-on-surface-variant">Category:</label>
<select className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 font-label-md focus:ring-primary focus:border-primary">
<option>All Categories</option>
<option>Bulk Grain Producer</option>
<option>Organic Farming</option>
<option>Livestock Management</option>
<option>Equipment Vendor</option>
</select>
</div>
<button className="text-primary font-label-md hover:underline flex items-center gap-1">
<span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                        Clear Filters
                    </button>
</div>
<div className="flex items-center gap-2">
<span className="text-on-surface-variant font-label-sm">Showing 1-10 of 142</span>
<div className="flex gap-1 ml-2">
<button className="p-1 border border-outline-variant rounded hover:bg-surface-container transition-colors disabled:opacity-50"><span className="material-symbols-outlined">chevron_left</span></button>
<button className="p-1 border border-outline-variant rounded hover:bg-surface-container transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
</div>
</div>
</div>
{/* Table Container */}
<div className="overflow-x-auto custom-scrollbar">
<table className="w-full text-left border-collapse">
<thead className="bg-surface-container-high">
<tr>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Seller Name</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Business Type</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Registration Date</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Verification Status</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
{/* Row 1 */}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center font-bold text-primary">GS</div>
<div>
<p className="font-body-md font-bold text-on-surface">Green Valley Seeds Ltd.</p>
<p className="font-label-sm text-on-surface-variant">ID: REG-2024-8841</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm border border-outline-variant">Seed Supplier</span>
</td>
<td className="px-6 py-4 font-body-md text-on-surface-variant">
                                Oct 12, 2023
                            </td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full font-label-sm status-badge-pending inline-flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
                                    Pending
                                </span>
</td>
<td className="px-6 py-4 text-right">
<div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="px-3 py-1.5 border border-outline-variant rounded-lg text-primary font-label-md hover:bg-primary/5 transition-colors">Documents</button>
<button className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-md shadow-sm">Review</button>
</div>
</td>
</tr>
{/* Row 2 */}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center font-bold text-primary">OP</div>
<div>
<p className="font-body-md font-bold text-on-surface">Oxen Power Equipment</p>
<p className="font-label-sm text-on-surface-variant">ID: REG-2024-9122</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm border border-outline-variant">Heavy Machinery</span>
</td>
<td className="px-6 py-4 font-body-md text-on-surface-variant">
                                Oct 14, 2023
                            </td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full font-label-sm status-badge-reviewing inline-flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-[#003366]"></span>
                                    Reviewing
                                </span>
</td>
<td className="px-6 py-4 text-right">
<div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="px-3 py-1.5 border border-outline-variant rounded-lg text-primary font-label-md hover:bg-primary/5 transition-colors">Documents</button>
<button className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-md shadow-sm">Review</button>
</div>
</td>
</tr>
{/* Row 3 */}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center font-bold text-primary">BH</div>
<div>
<p className="font-body-md font-bold text-on-surface">Bountiful Harvest Co.</p>
<p className="font-label-sm text-on-surface-variant">ID: REG-2024-7765</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm border border-outline-variant">Grain Logistics</span>
</td>
<td className="px-6 py-4 font-body-md text-on-surface-variant">
                                Oct 15, 2023
                            </td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full font-label-sm status-badge-rejected inline-flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-error"></span>
                                    Rejected
                                </span>
</td>
<td className="px-6 py-4 text-right">
<div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="px-3 py-1.5 border border-outline-variant rounded-lg text-primary font-label-md hover:bg-primary/5 transition-colors">Documents</button>
<button className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-md shadow-sm">Review</button>
</div>
</td>
</tr>
{/* Row 4 */}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center font-bold text-primary">AF</div>
<div>
<p className="font-body-md font-bold text-on-surface">Artisan Fertilizers LLC</p>
<p className="font-label-sm text-on-surface-variant">ID: REG-2024-1002</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm border border-outline-variant">Chemicals</span>
</td>
<td className="px-6 py-4 font-body-md text-on-surface-variant">
                                Oct 16, 2023
                            </td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full font-label-sm status-badge-pending inline-flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
                                    Pending
                                </span>
</td>
<td className="px-6 py-4 text-right">
<div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="px-3 py-1.5 border border-outline-variant rounded-lg text-primary font-label-md hover:bg-primary/5 transition-colors">Documents</button>
<button className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-md shadow-sm">Review</button>
</div>
</td>
</tr>
{/* Row 5 */}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center font-bold text-primary">PS</div>
<div>
<p className="font-body-md font-bold text-on-surface">Pure Soils Organic</p>
<p className="font-label-sm text-on-surface-variant">ID: REG-2024-3329</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm border border-outline-variant">Organic Farming</span>
</td>
<td className="px-6 py-4 font-body-md text-on-surface-variant">
                                Oct 16, 2023
                            </td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full font-label-sm status-badge-pending inline-flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
                                    Pending
                                </span>
</td>
<td className="px-6 py-4 text-right">
<div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="px-3 py-1.5 border border-outline-variant rounded-lg text-primary font-label-md hover:bg-primary/5 transition-colors">Documents</button>
<button className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-md shadow-sm">Review</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Footer/Pagination */}
<div className="p-6 bg-surface-container-low flex justify-between items-center">
<div className="flex items-center gap-4">
<span className="font-label-sm text-on-surface-variant">Rows per page:</span>
<select className="bg-surface border border-outline-variant rounded px-2 py-1 text-label-sm">
<option>10</option>
<option>25</option>
<option>50</option>
</select>
</div>
<div className="flex items-center gap-2">
<button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[20px]">first_page</span></button>
<button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
<span className="px-4 font-label-sm text-on-surface font-bold">Page 1 of 15</span>
<button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
<button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[20px]">last_page</span></button>
</div>
</div>
</section>
{/* Documentation & Context Panel (Quick View Mockup) */}
<section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-gutter">
<div className="lg:col-span-2 content-card p-6">
<div className="flex items-center justify-between mb-6">
<h4 className="font-title-lg text-title-lg text-on-surface">Verification Guidelines</h4>
<span className="material-symbols-outlined text-primary cursor-pointer">info</span>
</div>
<div className="space-y-4">
<div className="flex gap-4 items-start">
<div className="w-8 h-8 rounded-full bg-secondary-container/30 flex-shrink-0 flex items-center justify-center text-secondary">1</div>
<p className="font-body-md text-on-surface-variant">Confirm Business Registration Numbers against the National Agricultural Registry database for authenticity.</p>
</div>
<div className="flex gap-4 items-start">
<div className="w-8 h-8 rounded-full bg-secondary-container/30 flex-shrink-0 flex items-center justify-center text-secondary">2</div>
<p className="font-body-md text-on-surface-variant">Review Tax Compliance certificates and ensure they have a validity period of at least 6 months.</p>
</div>
<div className="flex gap-4 items-start">
<div className="w-8 h-8 rounded-full bg-secondary-container/30 flex-shrink-0 flex items-center justify-center text-secondary">3</div>
<p className="font-body-md text-on-surface-variant">Cross-check the primary warehouse location via geotagging verification on the provided site photos.</p>
</div>
</div>
</div>
<div className="content-card p-6 bg-gradient-to-br from-primary/5 to-transparent">
<h4 className="font-title-lg text-title-lg text-on-surface mb-4">Verification Health</h4>
<div className="relative w-32 h-32 mx-auto mb-4">
<svg className="w-full h-full transform -rotate-90">
<circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
<circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="72.8" strokeWidth="8"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="text-headline-md font-bold text-on-surface">80%</span>
<span className="text-label-sm text-on-surface-variant">Cleared</span>
</div>
</div>
<p className="text-center font-label-md text-on-surface-variant mb-6">Current throughput is higher than weekly average (+12%)</p>
<div className="flex justify-between items-center text-label-sm border-t border-outline-variant pt-4">
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Success</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error"></span> Failure</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary"></span> Pending</span>
</div>
</div>
</section>
</main>
{/* FAB for Quick Actions */}
<button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50">
<span className="material-symbols-outlined text-[28px]">bolt</span>
</button>




    </>
  );
};

export default SellerVerificationAdminPanel;
