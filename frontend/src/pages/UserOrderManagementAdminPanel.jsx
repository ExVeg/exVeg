import React from 'react';
import { Link } from 'react-router-dom';

const UserOrderManagementAdminPanel = () => {
  return (
    <>
      
{/* SideNavBar */}
<aside className="fixed left-0 top-0 h-full w-64 border-r border-outline-variant bg-surface dark:bg-inverse-surface z-40 hidden md:block">
<div className="p-6">
<h1 className="text-title-lg font-headline-md font-bold text-primary dark:text-inverse-primary"><span style={{"fontSize":"24px","backgroundColor":"rgba(255, 255, 255, 0.8)"}}>ExVeg</span></h1>
<p className="font-label-md text-label-md text-on-surface-variant">Admin Console</p>
</div>
<nav className="mt-4 px-4 space-y-2">
{/* Active: Orders (for this screen's context) */}
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="font-label-md text-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">storefront</span>
<span className="font-label-md text-label-md">Sellers</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">inventory_2</span>
<span className="font-label-md text-label-md">Products</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold scale-95 transition-transform duration-150" href="#">
<span className="material-symbols-outlined">shopping_cart</span>
<span className="font-label-md text-label-md">Orders</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">group</span>
<span className="font-label-md text-label-md">Users</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">bar_chart</span>
<span className="font-label-md text-label-md">Reports</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-label-md text-label-md">Settings</span>
</a>
</nav>
</aside>
{/* TopNavBar */}
<header className="fixed top-0 right-0 left-0 md:left-64 h-16 flex justify-between items-center px-8 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
<div className="flex items-center gap-6">
<span className="text-headline-md font-headline-md font-extrabold text-primary md:hidden">AgriMarket Connect</span>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3 text-on-surface-variant">search</span>
<input className="bg-surface-container-low border border-outline-variant rounded-full py-1.5 pl-10 pr-4 w-64 lg:w-96 focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-body-md" placeholder="Search orders, users, or IDs..." type="text" />
</div>
</div>
<div className="flex items-center gap-4">
<button className="p-2 hover:bg-surface-container-high rounded-full transition-colors relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
<span className="material-symbols-outlined">help</span>
</button>
<button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
<span className="material-symbols-outlined">apps</span>
</button>
<div className="h-8 w-px bg-outline-variant mx-2"></div>
<img alt="Administrator Avatar" className="w-10 h-10 rounded-full border-2 border-primary-container object-cover" data-alt="A professional headshot of a middle-aged male administrator in a clean white corporate shirt, set against a blurred office environment with soft window lighting. The style is modern corporate photography, clean and bright, utilizing a high-key light mode aesthetic to emphasize professionalism and clarity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8WAxelTzge71NwxrdbYMqVBZlvXz0KZ-pal92C1uIHogIKdZNjBTSd4Ovv-pSVX6ex7A6QMEttXv1hlIDMD9PJgPTSGmMQZkj6zmdPJQ3SXRFi3TreMdrdCMUcit5-TspG_330q9YlW20TRBILZmq76sAyfSdqaoYE9hRvt5xazPPK9wSMWSryjw6-XLCg7E376lEE1FPklFGtgLe9KpFNIK8FwvbmP-H0Cc9EQ42MUVczgMhlBH-JWTacaM0uL9vjZVoseFf6nI" />
</div>
</header>
{/* Main Content */}
<main className="pt-24 pb-12 px-8 md:ml-64 min-h-screen">
<div className="max-w-7xl mx-auto">
{/* Header Section */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Management Overview</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Real-time control over marketplace transactions and user accounts.</p>
</div>
<div className="flex items-center gap-3">
<button className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-outline text-primary font-bold rounded-lg hover:bg-surface-container transition-all">
<span className="material-symbols-outlined text-base">filter_list</span>
<span className="font-label-md">Advanced Filters</span>
</button>
<button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 transition-all">
<span className="material-symbols-outlined text-base">download</span>
<span className="font-label-md">Export Data</span>
</button>
</div>
</div>
{/* Summary Stats (Bento Style) */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
<div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
<div className="flex justify-between items-start mb-2">
<span className="text-on-surface-variant font-label-md">Total Volume</span>
<span className="text-primary material-symbols-outlined">payments</span>
</div>
<div className="text-2xl font-bold text-on-surface">$1,284,500</div>
<div className="flex items-center gap-1 text-on-secondary-container text-xs font-bold mt-1">
<span className="material-symbols-outlined text-sm">trending_up</span>
<span className="">+12.4% vs last month</span>
</div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
<div className="flex justify-between items-start mb-2">
<span className="text-on-surface-variant font-label-md">Active Orders</span>
<span className="text-primary material-symbols-outlined">local_shipping</span>
</div>
<div className="text-2xl font-bold text-on-surface">342</div>
<div className="text-on-surface-variant text-xs mt-1">86 processing, 256 shipped</div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
<div className="flex justify-between items-start mb-2">
<span className="text-on-surface-variant font-label-md">Total Users</span>
<span className="text-primary material-symbols-outlined">people</span>
</div>
<div className="text-2xl font-bold text-on-surface">15,902</div>
<div className="flex items-center gap-1 text-on-secondary-container text-xs font-bold mt-1">
<span className="material-symbols-outlined text-sm">person_add</span>
<span className="">+420 new this week</span>
</div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
<div className="flex justify-between items-start mb-2">
<span className="text-on-surface-variant font-label-md">Dispute Rate</span>
<span className="text-error material-symbols-outlined">warning</span>
</div>
<div className="text-2xl font-bold text-on-surface">0.82%</div>
<div className="text-on-surface-variant text-xs mt-1">Current SLA: 99.18%</div>
</div>
</div>
{/* Main Tabs Container */}
<div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden min-h-[600px]">
<div className="border-b border-outline-variant flex px-6 overflow-x-auto scrollbar-hide">
<button className="px-6 py-4 font-bold text-primary border-b-2 border-primary transition-all whitespace-nowrap" id="tab-orders" onClick={() => {}}>
                        Marketplace Orders
                    </button>
<button className="px-6 py-4 font-bold text-on-surface-variant border-b-2 border-transparent hover:text-primary transition-all whitespace-nowrap" id="tab-users" onClick={() => {}}>
                        System Users
                    </button>
</div>
{/* Orders Tab Content */}
<div className="p-6 transition-all duration-300" id="content-orders">
<div className="flex items-center justify-between mb-6 flex-wrap gap-4">
<div className="flex items-center gap-2 text-on-surface-variant font-label-md">
<span className="">Showing 1-10 of 342 orders</span>
</div>
<div className="flex items-center gap-4">
<select className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-md text-sm outline-none focus:ring-1 focus:ring-primary">
<option>Status: All</option>
<option>Processing</option>
<option>Shipped</option>
<option>Delivered</option>
<option>Disputed</option>
</select>
<div className="flex border border-outline-variant rounded-lg overflow-hidden">
<button className="p-2 bg-surface-container-high"><span className="material-symbols-outlined">view_list</span></button>
<button className="p-2 hover:bg-surface-container-low"><span className="material-symbols-outlined">grid_view</span></button>
</div>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="text-on-surface-variant font-label-md border-b border-outline-variant">
<th className="pb-4 font-bold">Order ID</th>
<th className="pb-4 font-bold">Customer</th>
<th className="pb-4 font-bold">Status</th>
<th className="pb-4 font-bold">Amount</th>
<th className="pb-4 font-bold">Date</th>
<th className="pb-4 font-bold">Tracking</th>
<th className="pb-4"></th>
</tr>
</thead>
<tbody className="text-body-md">
<tr className="group hover:bg-surface-container-low transition-colors">
<td className="py-5 font-bold text-primary">#AM-9821</td>
<td className="py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs">RS</div>
<span className="">Robert Smith</span>
</div>
</td>
<td className="py-5">
<span className="status-pill bg-blue-100 text-blue-700">Processing</span>
</td>
<td className="py-5 font-bold">$12,450.00</td>
<td className="py-5 text-on-surface-variant">Oct 24, 2023</td>
<td className="py-5 text-on-surface-variant font-mono text-sm">N/A</td>
<td className="py-5 text-right">
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary">more_vert</button>
</td>
</tr>
<tr className="group hover:bg-surface-container-low transition-colors border-t border-outline-variant">
<td className="py-5 font-bold text-primary">#AM-9819</td>
<td className="py-5">
<div className="flex items-center gap-3">
<img alt="User" className="w-8 h-8 rounded-full object-cover" data-alt="A detailed portrait of a female buyer in a soft natural light setting, wearing professional casual attire. The image is crisp with a shallow depth of field, set against a background of agricultural textures like natural wood and soft-green plants, maintaining a clean and trustworthy marketplace vibe." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCMJftnDA3UEWr74H0srlK0ZVlKZyrrqCh7noXfmPlhjGl76oHCZpcA1YtyR-ggD4RZ-QjsPF4vuzvrnUbZUpaFyO9uTfCGChm4jzuGpu7np7JbOA3xCCBEtw3m_kE_R8Uw3n0potLjZaAhQLC40OpVA1V12UYDGnlQwZoRejzmOQtNL6GaV8ZLHw3sjk9bflgLke8yZ8puZKwPLKTTlYASvwRNkJMn5rlN8TZg6iJStfSblQifiT15vWBE5rZAtu7ffHpJEQmL4A" />
<span className="">Eleanor Rigby</span>
</div>
</td>
<td className="py-5">
<span className="status-pill bg-green-100 text-green-700">Shipped</span>
</td>
<td className="py-5 font-bold">$8,200.50</td>
<td className="py-5 text-on-surface-variant">Oct 23, 2023</td>
<td className="py-5 text-on-surface-variant font-mono text-sm">UPS-728192A</td>
<td className="py-5 text-right">
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary">more_vert</button>
</td>
</tr>
<tr className="group hover:bg-surface-container-low transition-colors border-t border-outline-variant">
<td className="py-5 font-bold text-primary">#AM-9818</td>
<td className="py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-primary-fixed-dim flex items-center justify-center text-on-primary-fixed-variant font-bold text-xs">JM</div>
<span className="">James Miller</span>
</div>
</td>
<td className="py-5">
<span className="status-pill bg-orange-100 text-orange-700">Disputed</span>
</td>
<td className="py-5 font-bold">$450.00</td>
<td className="py-5 text-on-surface-variant">Oct 22, 2023</td>
<td className="py-5 text-on-surface-variant font-mono text-sm">FEDEX-91023</td>
<td className="py-5 text-right">
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary">more_vert</button>
</td>
</tr>
<tr className="group hover:bg-surface-container-low transition-colors border-t border-outline-variant">
<td className="py-5 font-bold text-primary">#AM-9815</td>
<td className="py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold text-xs">TH</div>
<span className="">Tanya Harrison</span>
</div>
</td>
<td className="py-5">
<span className="status-pill bg-gray-100 text-gray-700">Delivered</span>
</td>
<td className="py-5 font-bold">$2,140.00</td>
<td className="py-5 text-on-surface-variant">Oct 21, 2023</td>
<td className="py-5 text-on-surface-variant font-mono text-sm">DHL-6672321</td>
<td className="py-5 text-right">
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary">more_vert</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{/* Users Tab Content (Hidden by Default) */}
<div className="p-6 transition-all duration-300 hidden" id="content-users">
<div className="flex items-center justify-between mb-6 flex-wrap gap-4">
<div className="flex items-center gap-4">
<button className="px-4 py-1.5 bg-primary text-on-primary rounded-full text-sm font-bold">All Users</button>
<button className="px-4 py-1.5 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high rounded-full text-sm font-medium transition-all">Sellers Only</button>
<button className="px-4 py-1.5 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high rounded-full text-sm font-medium transition-all">Buyers Only</button>
</div>
<div className="flex items-center gap-4">
<select className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-md text-sm outline-none focus:ring-1 focus:ring-primary">
<option>Status: All</option>
<option>Active</option>
<option>Suspended</option>
<option>Flagged</option>
</select>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
{/* User Card 1 */}
<div className="bg-surface border border-outline-variant rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-4">
<img alt="User" className="w-12 h-12 rounded-full object-cover" data-alt="A portrait of a male seller in his late 30s, standing in a brightly lit, modern rural warehouse with blurred organic produce in the background. The lighting is warm and golden, evoking growth and agricultural trust. The style is professional and high-fidelity, aligning with a premium B2B SaaS aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG__pLnUw7TaJAiwkTJlc1XD5gcYaVVnfjukCftCOdHrVBe9MdmTFX0yhgdk65GyJjbXljCjKazPLCmxdGVIvFmGMZlCbwwSG1u2yfDSyZmFhMybBlKZn9A3SSEiZr__9QMSk0hTUUeaEla0IzEjZXbVduJkLzAIpWwuuj7Oa-clr3F2B-p97VjGbO2CXj973Q0y-jcVftFgeAkCbSvJTsvKYYjIuJPwfa9ssOMzH6PcwUQDFsMsEVJbmShhKwiZiecoVe1J8J3oI" />
<span className="status-pill bg-green-100 text-green-700">Active</span>
</div>
<div className="mb-4">
<h4 className="font-bold text-on-surface">Green Pastures Coop</h4>
<p className="text-on-surface-variant text-sm">Verified Seller • 142 Orders</p>
</div>
<div className="flex items-center justify-between py-3 border-t border-outline-variant">
<div className="text-xs text-on-surface-variant">Last Active: 2h ago</div>
<div className="flex items-center gap-1 text-on-tertiary-fixed-variant">
<span className="material-symbols-outlined text-sm" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="font-bold">4.9</span>
</div>
</div>
<button className="w-full py-2 bg-surface-container text-on-surface font-bold rounded-lg group-hover:bg-primary group-hover:text-on-primary transition-all">View Details</button>
</div>
{/* User Card 2 */}
<div className="bg-surface border border-outline-variant rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-4">
<div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container font-bold">MK</div>
<span className="status-pill bg-red-100 text-red-700">Suspended</span>
</div>
<div className="mb-4">
<h4 className="font-bold text-on-surface">Mark Kestler</h4>
<p className="text-on-surface-variant text-sm">Buyer • 0 Orders</p>
</div>
<div className="flex items-center justify-between py-3 border-t border-outline-variant">
<div className="text-xs text-on-surface-variant">Flagged: Policy Violation</div>
<div className="flex items-center gap-1 text-on-surface-variant">
<span className="material-symbols-outlined text-sm">star</span>
<span className="font-bold">N/A</span>
</div>
</div>
<button className="w-full py-2 bg-surface-container text-on-surface font-bold rounded-lg group-hover:bg-primary group-hover:text-on-primary transition-all">Review Case</button>
</div>
{/* User Card 3 */}
<div className="bg-surface border border-outline-variant rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-4">
<img alt="User" className="w-12 h-12 rounded-full object-cover" data-alt="A crisp, high-resolution portrait of a young female professional in a bright, minimalist setting. She is wearing a soft-toned green shirt that complements the brand's primary colors. The lighting is diffused and professional, creating an approachable yet authoritative presence for a marketplace buyer persona." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkPCjXMHXo896F39QL_2-i_VdcZXtkoFhrZDlQiXTD-jLA6z7lL5QtWbtYoy_f5t_2nNo-tNskup4hsaECfC2NV-AlOVBV7zyuVULX9i-mB67-98f_scsUW_PeI8yNdsfyKYYtsS-EyFc_UZMOO52l6Eqxm0qSbBfaQCSYTsZrKxxkxRu7gFZ5Q-f1Y0j1F5uOCuZDpWnfSHI8Sq5jEyu8Hwunyt3Kf7n1YgojINuifGJmZWzJv2oKrd4Wuifq-iqzrhyzW_5dvjE" />
<span className="status-pill bg-orange-100 text-orange-700">Flagged</span>
</div>
<div className="mb-4">
<h4 className="font-bold text-on-surface">Sarah Jennings</h4>
<p className="text-on-surface-variant text-sm">Frequent Buyer • 89 Orders</p>
</div>
<div className="flex items-center justify-between py-3 border-t border-outline-variant">
<div className="text-xs text-on-surface-variant">Last Active: 1d ago</div>
<div className="flex items-center gap-1 text-on-tertiary-fixed-variant">
<span className="material-symbols-outlined text-sm" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="font-bold">4.7</span>
</div>
</div>
<button className="w-full py-2 bg-surface-container text-on-surface font-bold rounded-lg group-hover:bg-primary group-hover:text-on-primary transition-all">View History</button>
</div>
</div>
</div>
</div>
</div>
</main>
{/* Contextual FAB (Only for main overview) */}
<button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
<span className="material-symbols-outlined text-3xl">add</span>
</button>




    </>
  );
};

export default UserOrderManagementAdminPanel;
