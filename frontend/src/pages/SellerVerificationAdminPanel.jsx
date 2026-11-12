import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { getApiBaseUrl } from '../utils/api';

const SellerVerificationAdminPanel = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const allSellers = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => String(u.role).trim().toLowerCase() === 'seller');
      setSellers(allSellers);
    } catch (err) {
      console.error('Fetch sellers error:', err);
      showToast('⚠️ Failed to fetch sellers from Firestore.');
    }
    setLoading(false);
  };

  const handleApprove = async (seller) => {
    const sellerName = seller.name || seller.businessName || 'Merchant';
    try {
      await updateDoc(doc(db, 'users', seller.id), {
        status: 'Approved',
        verified: true,
        verifiedAt: new Date().toISOString()
      });
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: seller.id,
          title: 'Seller Application Approved! 🌿',
          message: 'Congratulations! Your ExVeg vendor application has been approved. You can now access your Vendor Portal and publish listings.',
          type: 'seller_approved',
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch { }

      let emailSent = false;
      if (seller.email) {
        try {
          const res = await axios.post(`${getApiBaseUrl()}/api/notify/seller-approved`, {
            sellerEmail: seller.email,
            sellerName
          }, { timeout: 6000 });
          emailSent = Boolean(res.data?.emailSent ?? res.data?.success);
        } catch { }
      }

      setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, status: 'Approved', verified: true } : s));
      showToast(emailSent ? `✅ Seller "${sellerName}" approved & emailed!` : `✅ Seller "${sellerName}" approved!`);
    } catch {
      showToast('❌ Failed to approve seller.');
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject seller application for "${name || 'this vendor'}"?`)) return;
    try {
      await updateDoc(doc(db, 'users', id), {
        status: 'Rejected',
        verified: false,
        rejectedAt: new Date().toISOString()
      });
      setSellers(prev => prev.map(s => s.id === id ? { ...s, status: 'Rejected', verified: false } : s));
      showToast(`Seller "${name || 'Merchant'}" rejected.`);
    } catch {
      showToast('❌ Failed to reject seller.');
    }
  };

  const totalPending = sellers.filter(s => s.status !== 'Approved' && s.status !== 'Rejected' && !s.verified).length;
  const totalApproved = sellers.filter(s => s.status === 'Approved' || s.verified).length;
  const totalRejected = sellers.filter(s => s.status === 'Rejected').length;

  const filtered = sellers.filter(s => {
    if (statusFilter === 'Pending') return s.status !== 'Approved' && s.status !== 'Rejected' && !s.verified;
    if (statusFilter === 'Approved') return s.status === 'Approved' || s.verified;
    if (statusFilter === 'Rejected') return s.status === 'Rejected';
    return true;
  });

  const adminEmail = auth.currentUser?.email || 'admin@exveg.com';

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] bg-white border border-outline-variant shadow-xl rounded-xl px-5 py-3 text-sm font-semibold animate-fade-in">
          {toast}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full z-40 w-64 border-r border-outline-variant bg-surface shadow-sm flex flex-col">
        <div className="p-6">
          <Link to="/" className="text-title-lg font-headline-md font-bold text-primary">ExVeg</Link>
          <p className="text-on-surface-variant font-label-sm">Admin Console</p>
        </div>
        <nav className="px-4 space-y-1.5 flex-1">
          <Link to="/admin-dashboard" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md">Dashboard</span>
          </Link>
          <Link to="/seller-verification" className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold">
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-label-md">Sellers</span>
          </Link>
          <Link to="/user-order-management" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-label-md">Orders</span>
          </Link>
          <Link to="/analytics" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg">
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="font-label-md">Analytics</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-outline-variant">
          <button
            onClick={() => { signOut(auth); navigate('/login'); }}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-error hover:bg-error-container/30 text-sm font-bold"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header className="fixed top-0 right-0 left-64 h-16 flex justify-between items-center px-8 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <h2 className="font-headline-md text-headline-md text-on-surface">Seller Verification</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-on-surface-variant font-medium">{adminEmail}</span>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
            {(adminEmail[0] || 'A').toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 pt-20 px-8 pb-12 min-h-screen bg-background">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-8">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant uppercase">Pending Review</p>
              <h3 className="font-headline-md text-headline-md">{totalPending}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant uppercase">Approved Sellers</p>
              <h3 className="font-headline-md text-headline-md">{totalApproved}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">report</span>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant uppercase">Flagged / Rejected</p>
              <h3 className="font-headline-md text-headline-md">{totalRejected}</h3>
            </div>
          </div>
        </div>

        {/* Sellers Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-on-surface-variant">Filter Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-sm font-medium"
              >
                <option value="All">All ({sellers.length})</option>
                <option value="Pending">Pending ({totalPending})</option>
                <option value="Approved">Approved ({totalApproved})</option>
                <option value="Rejected">Rejected ({totalRejected})</option>
              </select>
            </div>
            <button onClick={fetchSellers} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">refresh</span> Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-on-surface-variant">Loading seller accounts...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant">No seller applications match this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase">
                  <tr>
                    <th className="px-6 py-4">Seller / Business</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Verification Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4 font-bold text-on-surface">
                        {s.name || s.businessName || 'Unnamed Merchant'}
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{s.email}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{s.phone || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.status === 'Approved' || s.verified
                          ? 'bg-green-100 text-green-800'
                          : s.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {s.status === 'Approved' || s.verified ? 'Approved & Verified' : s.status || 'Pending Review'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(s)}
                            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(s.id, s.name)}
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
      </main>
    </>
  );
};

export default SellerVerificationAdminPanel;
