import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { getApiBaseUrl } from '../utils/api';
import LanguageSwitcher from '../components/LanguageSwitcher';

const ProductApprovalAdminPanel = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    const safeGet = async (q) => {
      try { return await getDocs(q); } catch { return { docs: [] }; }
    };
    try {
      const [prodSnap, nurSnap, toolSnap] = await Promise.all([
        safeGet(query(collection(db, 'products'), where('status', '==', 'Pending'))),
        safeGet(query(collection(db, 'nursery'), where('status', '==', 'Pending'))),
        safeGet(query(collection(db, 'tools'), where('status', '==', 'Pending'))),
      ]);

      const all = [
        ...prodSnap.docs.map(d => ({ id: d.id, collectionName: 'products', ...d.data() })),
        ...nurSnap.docs.map(d => ({ id: d.id, collectionName: 'nursery', ...d.data() })),
        ...toolSnap.docs.map(d => ({ id: d.id, collectionName: 'tools', ...d.data() })),
      ];
      setProducts(all);
    } catch (err) {
      console.error('Error fetching pending products:', err);
    }
    setLoading(false);
  };

  const handleApprove = async (p) => {
    try {
      await updateDoc(doc(db, p.collectionName, p.id), {
        status: 'Approved',
        approvedAt: new Date().toISOString()
      });

      if (p.sellerId) {
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: p.sellerId,
            title: `Product Approved: "${p.name}" 🌿`,
            message: `Your listing for "${p.name}" (₹${p.price}) has been approved and is now live on the marketplace.`,
            type: 'product_approved',
            read: false,
            createdAt: new Date().toISOString()
          });
        } catch { }
      }

      let emailSent = false;
      if (p.sellerEmail) {
        try {
          const res = await axios.post(`${getApiBaseUrl()}/api/notify/product-approved`, {
            sellerEmail: p.sellerEmail,
            sellerName: p.sellerName || 'Vendor',
            productName: p.name,
            price: p.price,
            category: p.category || 'General'
          }, { timeout: 6000 });
          emailSent = Boolean(res.data?.emailSent ?? res.data?.success);
        } catch { }
      }

      setProducts(prev => prev.filter(item => item.id !== p.id));
      showToast(emailSent ? `✅ "${p.name}" approved & seller emailed!` : `✅ "${p.name}" approved!`);
    } catch {
      showToast('❌ Failed to approve.');
    }
  };

  const handleReject = async (p) => {
    try {
      await updateDoc(doc(db, p.collectionName, p.id), { status: 'Rejected' });
      setProducts(prev => prev.filter(item => item.id !== p.id));
      showToast(`Product "${p.name}" rejected.`);
    } catch {
      showToast('❌ Failed to reject.');
    }
  };

  const adminEmail = auth.currentUser?.email || 'admin@exveg.com';

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] bg-white border border-outline-variant shadow-xl rounded-xl px-5 py-3 text-sm font-semibold animate-fade-in">
          {toast}
        </div>
      )}

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <aside className={`fixed left-0 top-0 h-full z-50 md:z-40 w-64 bg-gradient-to-b from-[#143d23] to-[#0f3f22] text-emerald-50 shadow-xl flex flex-col transform transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <Link to="/" className="text-xl font-headline-md font-extrabold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-300 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
              </span>
              ExVeg
            </Link>
            <p className="font-label-md text-emerald-200/80 mt-1">Admin Console</p>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-emerald-100 hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="px-4 py-4 space-y-1.5 flex-1">
          <Link to="/admin-dashboard" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors rounded-xl">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md">Dashboard</span>
          </Link>
          <Link to="/product-approval" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-white/15 text-amber-300 rounded-xl font-bold shadow-sm">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-md">Product Verification</span>
          </Link>
          <Link to="/seller-verification" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors rounded-xl">
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-label-md">Sellers</span>
          </Link>
          <Link to="/user-order-management" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors rounded-xl">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-label-md">Orders</span>
          </Link>
          <Link to="/analytics" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors rounded-xl">
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="font-label-md">Analytics</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10 bg-black/15">
          <button
            onClick={() => { signOut(auth); navigate('/login'); }}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-rose-200 hover:bg-rose-500/20 text-sm font-bold"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 right-0 left-0 md:left-64 h-16 flex justify-between items-center px-4 md:px-8 z-30 bg-white/95 backdrop-blur-md border-b border-outline-variant/60 shadow-sm gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg border border-outline-variant text-[#143d23] flex-shrink-0"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="font-headline-md text-base sm:text-xl font-bold text-[#143d23] truncate">Product Catalog Moderation</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <LanguageSwitcher compact />
          <span className="text-sm text-on-surface-variant font-medium hidden sm:inline">{adminEmail}</span>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
            {(adminEmail[0] || 'A').toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-0 md:ml-64 pt-20 px-4 sm:px-6 md:px-8 pb-12 min-h-screen bg-[#f8faf5]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Pending Product Catalog Submissions</h2>
              <p className="text-sm text-on-surface-variant">Review seller products, nursery items, and tools before they go live on ExVeg.</p>
            </div>
            <button onClick={fetchPending} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">refresh</span> Refresh
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-on-surface-variant">Loading submissions...</div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl block mb-2 text-primary">task_alt</span>
                <p className="font-bold">No products currently pending verification.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase">
                    <tr>
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Seller</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={p.imageUrl || 'https://via.placeholder.com/80'} alt={p.name} className="w-12 h-12 rounded object-cover border border-outline-variant" />
                            <div>
                              <span className="font-bold text-on-surface block">{p.name}</span>
                              <span className="text-xs text-on-surface-variant line-clamp-1">{p.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{p.category || 'General'}</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{p.sellerName || 'Verified Seller'}</td>
                        <td className="px-6 py-4 font-bold text-primary">₹{p.price}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleApprove(p)}
                              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(p)}
                              className="px-3 py-1.5 bg-error text-white rounded-lg text-xs font-bold hover:bg-error/80"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ProductApprovalAdminPanel;
