import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { db, auth } from '../firebase';
import {
  collection, query, where, getDocs,
  doc, updateDoc, deleteDoc, addDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { getApiBaseUrl } from '../utils/api';
import LanguageSwitcher from '../components/LanguageSwitcher';

const AdminDashboardAgriMarketConnect = () => {
  const navigate = useNavigate();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'sellers' | 'orders' | 'users'
  const [pendingFilter, setPendingFilter] = useState('all'); // 'all' | 'sellers' | 'products'
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Data States
  const [pendingProducts, setPendingProducts] = useState([]);
  const [approvedProducts, setApprovedProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSellers: 0,
    pendingSellersCount: 0,
    pendingProductsCount: 0,
    liveCount: 0,
    totalUsers: 0,
    totalOrders: 0
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const failedCollections = [];

    const safeGet = async (label, promise) => {
      try {
        return await promise;
      } catch (err) {
        console.warn(`Firestore query skipped/failed for ${label}:`, err.code || err.message);
        failedCollections.push(label);
        return { docs: [] };
      }
    };

    try {
      // 1. Fetch Products from products, nursery, and tools independently
      const [prodPending, prodApproved, nurPending, nurApproved, toolPending, toolApproved, usersSnap, ordersSnap] = await Promise.all([
        safeGet('products (pending)', getDocs(query(collection(db, 'products'), where('status', '==', 'Pending')))),
        safeGet('products (approved)', getDocs(query(collection(db, 'products'), where('status', '==', 'Approved')))),
        safeGet('nursery (pending)', getDocs(query(collection(db, 'nursery'), where('status', '==', 'Pending')))),
        safeGet('nursery (approved)', getDocs(query(collection(db, 'nursery'), where('status', '==', 'Approved')))),
        safeGet('tools (pending)', getDocs(query(collection(db, 'tools'), where('status', '==', 'Pending')))),
        safeGet('tools (approved)', getDocs(query(collection(db, 'tools'), where('status', '==', 'Approved')))),
        safeGet('users', getDocs(collection(db, 'users'))),
        safeGet('orders', getDocs(collection(db, 'orders'))),
      ]);

      const pending = [
        ...prodPending.docs.map(d => ({ id: d.id, collectionName: 'products', typeLabel: 'Marketplace', ...d.data() })),
        ...nurPending.docs.map(d => ({ id: d.id, collectionName: 'nursery', typeLabel: 'Nursery', ...d.data() })),
        ...toolPending.docs.map(d => ({ id: d.id, collectionName: 'tools', typeLabel: 'Tools', ...d.data() }))
      ];

      const approved = [
        ...prodApproved.docs.map(d => ({ id: d.id, collectionName: 'products', typeLabel: 'Marketplace', ...d.data() })),
        ...nurApproved.docs.map(d => ({ id: d.id, collectionName: 'nursery', typeLabel: 'Nursery', ...d.data() })),
        ...toolApproved.docs.map(d => ({ id: d.id, collectionName: 'tools', typeLabel: 'Tools', ...d.data() }))
      ];

      setPendingProducts(pending);
      setApprovedProducts(approved);

      // 2. Process Users & Sellers (safe case-insensitive role match)
      const allUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsersList(allUsers);

      const allSellers = allUsers.filter(u => String(u.role).trim().toLowerCase() === 'seller');
      setSellers(allSellers);

      const pendingSellers = allSellers.filter(
        s => s.status !== 'Approved' && s.status !== 'Rejected' && !s.verified
      );

      // 3. Process Orders
      const allOrders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      allOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOrders(allOrders);

      // 4. Compute Dynamic Stats
      const revenue = allOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      const verifiedSellersCount = allSellers.filter(s => s.status === 'Approved' || s.verified === true).length;

      setStats({
        totalRevenue: revenue,
        activeSellers: verifiedSellersCount,
        pendingSellersCount: pendingSellers.length,
        pendingProductsCount: pending.length,
        liveCount: approved.length,
        totalUsers: allUsers.length,
        totalOrders: allOrders.length
      });

      if (failedCollections.includes('users') || failedCollections.includes('orders')) {
        showToast('⚠️ Firestore permissions denied for users/orders. Please publish firestore.rules in Firebase Console.');
      } else if (failedCollections.length > 0) {
        showToast(`⚠️ Partial load: publish firestore.rules for full access (${failedCollections.join(', ')}).`);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('⚠️ Error connecting to Firestore.');
    }
    setLoading(false);
  };

  // ── SELLER APPROVAL WITH EMAIL NOTIFICATION ─────────────────────────────────
  const handleApproveSeller = async (seller) => {
    try {
      // 1. Update Firestore
      await updateDoc(doc(db, 'users', seller.id), {
        status: 'Approved',
        verified: true,
        approvedAt: new Date().toISOString()
      });

      // 2. Add In-App Notification in Firestore
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: seller.id,
          title: 'Seller Application Approved! 🌿',
          message: 'Congratulations! Your ExVeg vendor application has been approved. You can now access your Vendor Portal and publish listings.',
          type: 'seller_approved',
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch (notifErr) {
        console.warn('In-app notification write warning:', notifErr);
      }

      // 3. Send Email Notification via Backend API
      let emailSent = false;
      if (seller.email) {
        try {
          const res = await axios.post(`${getApiBaseUrl()}/api/notify/seller-approved`, {
            sellerEmail: seller.email,
            sellerName: seller.name || seller.businessName || 'Vendor'
          }, { timeout: 6000 });
          emailSent = Boolean(res.data?.emailSent ?? res.data?.success);
        } catch (mailErr) {
          console.info('Backend email service noted:', mailErr.message);
        }
      }

      // 4. Update UI State
      setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, status: 'Approved', verified: true } : s));
      setStats(prev => ({
        ...prev,
        pendingSellersCount: Math.max(0, prev.pendingSellersCount - 1),
        activeSellers: prev.activeSellers + 1
      }));

      showToast(
        emailSent
          ? `✅ Seller "${seller.name || seller.businessName || 'Vendor'}" approved & email sent!`
          : `✅ Seller "${seller.name || seller.businessName || 'Vendor'}" approved in Firestore!`
      );
    } catch (err) {
      console.error('Seller approve error:', err);
      showToast('❌ Failed to approve seller.');
    }
  };

  const handleRejectSeller = async (seller) => {
    if (!window.confirm(`Reject seller application for "${seller.name || seller.businessName || 'this vendor'}"?`)) return;
    try {
      await updateDoc(doc(db, 'users', seller.id), {
        status: 'Rejected',
        verified: false,
        rejectedAt: new Date().toISOString()
      });
      setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, status: 'Rejected', verified: false } : s));
      setStats(prev => ({
        ...prev,
        pendingSellersCount: Math.max(0, prev.pendingSellersCount - 1)
      }));
      showToast(`Seller marked as Rejected.`);
    } catch (err) {
      console.error('Seller reject error:', err);
      showToast('❌ Failed to reject seller.');
    }
  };

  // ── PRODUCT APPROVAL WITH EMAIL NOTIFICATION ────────────────────────────────
  const handleApproveProduct = async (product) => {
    try {
      // 1. Update Firestore
      await updateDoc(doc(db, product.collectionName || 'products', product.id), {
        status: 'Approved',
        approvedAt: new Date().toISOString()
      });

      // 2. Add In-App Notification in Firestore
      if (product.sellerId) {
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: product.sellerId,
            title: `Product Approved: "${product.name}" 🌿`,
            message: `Your listing for "${product.name}" (₹${product.price}) has been approved and is now live on the marketplace.`,
            type: 'product_approved',
            read: false,
            createdAt: new Date().toISOString()
          });
        } catch (notifErr) {
          console.warn('In-app notification write warning:', notifErr);
        }
      }

      // 3. Send Email Notification via Backend API
      let emailSent = false;
      const recipientEmail =
        product.sellerEmail ||
        sellers.find(s => s.id === product.sellerId)?.email ||
        usersList.find(u => u.id === product.sellerId)?.email;
      if (recipientEmail) {
        try {
          const res = await axios.post(`${getApiBaseUrl()}/api/notify/product-approved`, {
            sellerEmail: recipientEmail,
            sellerName: product.sellerName || 'Vendor',
            productName: product.name,
            price: product.price,
            category: product.category || product.typeLabel || 'General'
          }, { timeout: 6000 });
          emailSent = Boolean(res.data?.emailSent ?? res.data?.success);
        } catch (mailErr) {
          console.info('Backend email service noted:', mailErr.message);
        }
      }

      // 4. Update UI State
      setPendingProducts(prev => prev.filter(p => p.id !== product.id));
      setApprovedProducts(prev => [...prev, { ...product, status: 'Approved' }]);
      setStats(prev => ({
        ...prev,
        pendingProductsCount: Math.max(0, prev.pendingProductsCount - 1),
        liveCount: prev.liveCount + 1
      }));

      showToast(
        emailSent
          ? `✅ Product "${product.name}" approved & seller notified via email!`
          : `✅ Product "${product.name}" approved in Firestore!`
      );
    } catch (error) {
      console.error('Approve product error:', error);
      showToast('❌ Failed to approve product.');
    }
  };

  const handleRejectProduct = async (product) => {
    try {
      await updateDoc(doc(db, product.collectionName || 'products', product.id), { status: 'Rejected' });
      setPendingProducts(prev => prev.filter(p => p.id !== product.id));
      setStats(prev => ({ ...prev, pendingProductsCount: Math.max(0, prev.pendingProductsCount - 1) }));
      showToast(`Product "${product.name}" marked as Rejected.`);
    } catch (error) {
      console.error('Reject product error:', error);
      showToast('❌ Failed to reject product.');
    }
  };

  const handleRemoveProduct = async (product) => {
    if (!window.confirm('Remove this product listing from the marketplace?')) return;
    try {
      await updateDoc(doc(db, product.collectionName || 'products', product.id), { status: 'Removed' });
      setApprovedProducts(prev => prev.filter(p => p.id !== product.id));
      setStats(prev => ({ ...prev, liveCount: Math.max(0, prev.liveCount - 1) }));
      showToast('🗑️ Product removed from marketplace.');
    } catch (error) {
      showToast('❌ Failed to remove listing.');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm('Permanently delete this product document? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, product.collectionName || 'products', product.id));
      setApprovedProducts(prev => prev.filter(p => p.id !== product.id));
      setStats(prev => ({ ...prev, liveCount: Math.max(0, prev.liveCount - 1) }));
      showToast('🗑️ Product permanently deleted.');
    } catch (error) {
      showToast('❌ Failed to delete product.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order status updated to "${newStatus}".`);
    } catch (err) {
      showToast('❌ Failed to update order status.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const adminEmail = auth.currentUser?.email || 'admin@exveg.com';
  const adminInitial = (adminEmail[0] || 'A').toUpperCase();

  const pendingSellersList = sellers.filter(
    s => s.status !== 'Approved' && s.status !== 'Rejected' && !s.verified
  );
  const totalPendingQueue = pendingSellersList.length + pendingProducts.length;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] bg-white border border-outline-variant shadow-xl rounded-xl px-5 py-3 text-sm font-semibold animate-fade-in flex items-center gap-2">
          {toast}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full z-40 w-64 bg-gradient-to-b from-[#143d23] to-[#0f3f22] text-emerald-50 shadow-xl flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="text-xl font-headline-md font-extrabold text-white flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-300 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </span>
            ExVeg
          </Link>
          <p className="font-label-sm text-emerald-200/80 flex items-center gap-1 mt-1.5">
            <span className="material-symbols-outlined text-[14px] text-amber-300">admin_panel_settings</span>
            Admin Console
          </p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'pending' ? 'bg-white/15 text-amber-300 shadow-sm' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">pending_actions</span>
            <span className="font-label-md">Pending Approvals</span>
            {totalPendingQueue > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
                {totalPendingQueue}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'approved' ? 'bg-white/15 text-amber-300 shadow-sm' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-label-md">Live Listings</span>
            <span className="ml-auto bg-white/20 text-white text-xs font-black px-2 py-0.5 rounded-full">{approvedProducts.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('sellers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'sellers' ? 'bg-white/15 text-amber-300 shadow-sm' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">verified_user</span>
            <span className="font-label-md">Sellers ({sellers.length})</span>
            {pendingSellersList.length > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                {pendingSellersList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'orders' ? 'bg-white/15 text-amber-300 shadow-sm' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-label-md">Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'users' ? 'bg-white/15 text-amber-300 shadow-sm' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">people</span>
            <span className="font-label-md">Users ({usersList.length})</span>
          </button>

          <div className="pt-3 border-t border-white/10 space-y-1">
            <Link
              to="/analytics"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-emerald-100/80 hover:bg-white/10 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">bar_chart</span>
              <span className="font-label-md">Platform Analytics</span>
            </Link>
            <Link
              to="/"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-emerald-100/80 hover:bg-white/10 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
              <span className="font-label-md">View Storefront</span>
            </Link>
          </div>
        </nav>

        {/* Dynamic Admin Profile & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-[#143d23] flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0">
              {adminInitial}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate" title={adminEmail}>{adminEmail}</p>
              <span className="text-[10px] uppercase tracking-wider bg-white/15 text-amber-300 px-1.5 py-0.5 rounded font-black">
                Administrator
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-rose-200 hover:bg-rose-500/20 transition-colors text-sm font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header className="fixed top-0 right-0 left-64 h-16 flex justify-between items-center px-6 md:px-8 z-30 bg-white/95 backdrop-blur-md border-b border-outline-variant/60 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-xl font-bold text-[#143d23] capitalize">
            {activeTab === 'pending' && 'Pending Approvals Queue'}
            {activeTab === 'approved' && 'Live Marketplace Listings'}
            {activeTab === 'sellers' && 'All Sellers & Verification'}
            {activeTab === 'orders' && 'Marketplace Orders'}
            {activeTab === 'users' && 'System Users Directory'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          <div className="relative w-56 hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#f4f7f2] border border-outline-variant rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button onClick={fetchAllData} className="text-primary hover:underline text-sm font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
          <Link to="/" className="text-primary text-sm font-bold hover:bg-primary hover:text-white flex items-center gap-1 border border-primary/30 px-3 py-1.5 rounded-full transition-all">
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            Storefront
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ml-64 mt-16 p-8 min-h-screen bg-[#f8faf5]">
        {/* Dynamic KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Total Platform Volume</p>
              <p className="font-headline-md text-headline-md text-primary mt-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">storefront</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Active Sellers</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-headline-md text-headline-md text-on-surface">{stats.activeSellers}</span>
                <span className="text-xs text-on-surface-variant">of {sellers.length} total</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Pending Sellers</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-headline-md text-headline-md text-on-surface">{stats.pendingSellersCount}</span>
                {stats.pendingSellersCount > 0 && (
                  <span className="text-xs bg-error text-white font-bold px-2 py-0.5 rounded-full animate-bounce">
                    Awaiting Action
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Pending Products</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-headline-md text-headline-md text-on-surface">{stats.pendingProductsCount}</span>
                {stats.pendingProductsCount > 0 && (
                  <span className="text-xs bg-error text-white font-bold px-2 py-0.5 rounded-full">
                    Awaiting Action
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-label-md">Synchronizing live data with Firestore...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: PENDING APPROVALS QUEUE (SELLERS + PRODUCTS) */}
              {activeTab === 'pending' && (
                <div>
                  {/* Sub-Tabs Selector */}
                  <div className="border-b border-outline-variant flex px-6 bg-surface-container-low/50">
                    <button
                      onClick={() => setPendingFilter('all')}
                      className={`px-5 py-3.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                        pendingFilter === 'all' ? 'text-primary border-primary bg-surface' : 'text-on-surface-variant border-transparent hover:text-primary'
                      }`}
                    >
                      All Pending ({totalPendingQueue})
                    </button>
                    <button
                      onClick={() => setPendingFilter('sellers')}
                      className={`px-5 py-3.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                        pendingFilter === 'sellers' ? 'text-primary border-primary bg-surface' : 'text-on-surface-variant border-transparent hover:text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      Sellers Awaiting Approval ({pendingSellersList.length})
                    </button>
                    <button
                      onClick={() => setPendingFilter('products')}
                      className={`px-5 py-3.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                        pendingFilter === 'products' ? 'text-primary border-primary bg-surface' : 'text-on-surface-variant border-transparent hover:text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                      Products Awaiting Approval ({pendingProducts.length})
                    </button>
                  </div>

                  {/* Section A: Pending Sellers */}
                  {(pendingFilter === 'all' || pendingFilter === 'sellers') && (
                    <div className="p-6 border-b border-outline-variant/60">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xl">badge</span>
                          <h3 className="font-title-lg font-bold text-on-surface">New Seller Applications</h3>
                          <span className="bg-tertiary text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                            {pendingSellersList.length} pending
                          </span>
                        </div>
                      </div>

                      {pendingSellersList.length === 0 ? (
                        <div className="py-8 text-center text-on-surface-variant bg-surface-container-low/30 rounded-lg">
                          <span className="material-symbols-outlined text-3xl block mb-1 text-primary">check_circle</span>
                          <p className="font-medium text-sm">All seller accounts are currently verified and approved.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-outline-variant rounded-xl">
                          <table className="w-full text-left">
                            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase">
                              <tr>
                                <th className="px-5 py-3.5">Business & Applicant</th>
                                <th className="px-5 py-3.5">Contact Details</th>
                                <th className="px-5 py-3.5">Reference & Tax ID</th>
                                <th className="px-5 py-3.5">Verification Doc</th>
                                <th className="px-5 py-3.5 text-right">Approve / Reject</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                              {pendingSellersList
                                .filter(s => !searchQuery || s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.email?.toLowerCase().includes(searchQuery.toLowerCase()) || s.referenceId?.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(s => (
                                  <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                                    <td className="px-5 py-3.5">
                                      <span className="font-bold text-on-surface block">{s.businessName || s.name || 'Unnamed Farm'}</span>
                                      <span className="text-xs text-on-surface-variant">Owner: {s.name || 'Vendor'}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm">
                                      <p className="text-on-surface font-medium">{s.email}</p>
                                      {s.phone && <p className="text-xs text-on-surface-variant">{s.phone}</p>}
                                    </td>
                                    <td className="px-5 py-3.5 text-xs">
                                      {s.referenceId && <p className="font-mono text-primary font-bold">{s.referenceId}</p>}
                                      {s.panNumber && <p className="text-on-surface-variant">PAN: {s.panNumber}</p>}
                                      {s.gstNumber && <p className="text-on-surface-variant">GST: {s.gstNumber}</p>}
                                    </td>
                                    <td className="px-5 py-3.5">
                                      {s.documentUrl ? (
                                        <a
                                          href={s.documentUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-lg text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all border border-outline-variant"
                                        >
                                          <span className="material-symbols-outlined text-sm">visibility</span>
                                          View Document
                                        </a>
                                      ) : s.documentName ? (
                                        <span className="text-xs text-on-surface-variant font-mono bg-surface-container px-2 py-1 rounded">
                                          {s.documentName}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-on-surface-variant italic">No file attached</span>
                                      )}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={() => handleApproveSeller(s)}
                                          className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">check</span>
                                          Approve & Send Mail
                                        </button>
                                        <button
                                          onClick={() => handleRejectSeller(s)}
                                          className="px-3 py-1.5 bg-error text-white rounded-lg text-xs font-bold hover:bg-error/80 transition-all"
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
                  )}

                  {/* Section B: Pending Products */}
                  {(pendingFilter === 'all' || pendingFilter === 'products') && (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
                          <h3 className="font-title-lg font-bold text-on-surface">Pending Product Listings</h3>
                          <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                            {pendingProducts.length} pending
                          </span>
                        </div>
                      </div>

                      {pendingProducts.length === 0 ? (
                        <div className="py-8 text-center text-on-surface-variant bg-surface-container-low/30 rounded-lg">
                          <span className="material-symbols-outlined text-3xl block mb-1 text-primary">check_circle</span>
                          <p className="font-medium text-sm">All catalog products have been reviewed and approved.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-outline-variant rounded-xl">
                          <table className="w-full text-left">
                            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase">
                              <tr>
                                <th className="px-5 py-3.5">Product Name</th>
                                <th className="px-5 py-3.5">Channel / Category</th>
                                <th className="px-5 py-3.5">Seller Name</th>
                                <th className="px-5 py-3.5">Price / Stock</th>
                                <th className="px-5 py-3.5 text-right">Approve / Reject</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                              {pendingProducts
                                .filter(p => !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(p => (
                                  <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                                    <td className="px-5 py-3.5">
                                      <div className="flex items-center gap-3">
                                        <img src={p.imageUrl || 'https://via.placeholder.com/80'} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-outline-variant" />
                                        <div>
                                          <span className="font-bold text-on-surface block">{p.name}</span>
                                          <span className="text-xs text-on-surface-variant line-clamp-1">{p.description || p.category}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                      <span className="px-2.5 py-1 bg-surface-container-high rounded-full text-xs font-semibold">
                                        {p.typeLabel} · {p.category || 'General'}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-on-surface-variant font-medium">
                                      {p.sellerName || 'Verified Seller'}
                                    </td>
                                    <td className="px-5 py-3.5 font-bold text-primary">
                                      ₹{p.price} <span className="text-xs font-normal text-on-surface-variant">/ {p.stock} units</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={() => handleApproveProduct(p)}
                                          className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">check</span>
                                          Approve & Send Mail
                                        </button>
                                        <button
                                          onClick={() => handleRejectProduct(p)}
                                          className="px-3 py-1.5 bg-error text-white rounded-lg text-xs font-bold hover:bg-error/80 transition-all"
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
                  )}
                </div>
              )}

              {/* TAB 2: LIVE PRODUCTS */}
              {activeTab === 'approved' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Product Name</th>
                        <th className="px-6 py-4">Channel / Type</th>
                        <th className="px-6 py-4">Seller</th>
                        <th className="px-6 py-4">Price / Stock</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {approvedProducts
                        .filter(p => !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(p => (
                          <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={p.imageUrl || 'https://via.placeholder.com/80'} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-outline-variant" />
                                <div>
                                  <span className="font-bold text-on-surface block">{p.name}</span>
                                  <span className="text-xs text-on-surface-variant line-clamp-1">{p.description}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-surface-container-high rounded-full text-xs font-semibold">
                                {p.typeLabel} · {p.category || 'General'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-on-surface-variant font-medium">
                              {p.sellerName || 'Verified Seller'}
                            </td>
                            <td className="px-6 py-4 font-bold text-primary">
                              ₹{p.price} <span className="text-xs font-normal text-on-surface-variant">/ {p.stock} units</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleRemoveProduct(p)}
                                  className="px-3 py-1.5 bg-surface-container-high text-on-surface rounded-lg text-xs font-bold hover:bg-surface-container transition-all border border-outline-variant"
                                >
                                  Delist
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p)}
                                  className="px-3 py-1.5 bg-error text-white rounded-lg text-xs font-bold hover:bg-error/80 transition-all"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {approvedProducts.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                            No approved live listings found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: ALL SELLERS */}
              {activeTab === 'sellers' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Seller / Farm Name</th>
                        <th className="px-6 py-4">Contact Info</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Verification Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {sellers
                        .filter(s => !searchQuery || s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.email?.toLowerCase().includes(searchQuery.toLowerCase()) || s.businessName?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(s => (
                          <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">
                                  {(s.name?.[0] || s.email?.[0] || 'S').toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-bold text-on-surface block">{s.businessName || s.name || 'Unnamed Seller'}</span>
                                  <span className="text-xs text-on-surface-variant">Owner: {s.name || 'Vendor'}</span>
                                  {s.referenceId && <span className="text-[10px] text-primary block font-mono font-bold">{s.referenceId}</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <p className="text-on-surface">{s.email}</p>
                              {s.phone && <p className="text-xs text-on-surface-variant">{s.phone}</p>}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full">
                                {s.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                s.status === 'Approved' || s.verified
                                  ? 'bg-green-100 text-green-800'
                                  : s.status === 'Rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {s.status === 'Approved' || s.verified ? 'Verified & Active' : s.status || 'Pending Verification'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleApproveSeller(s)}
                                  className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[16px]">check</span>
                                  Verify & Mail
                                </button>
                                <button
                                  onClick={() => handleRejectSeller(s)}
                                  className="px-3 py-1.5 bg-error text-white rounded-lg text-xs font-bold hover:bg-error/80 transition-all"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {sellers.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                            No registered sellers found in the database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 4: ORDERS */}
              {activeTab === 'orders' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Order ID & Date</th>
                        <th className="px-6 py-4">Buyer Details</th>
                        <th className="px-6 py-4">Items / Total</th>
                        <th className="px-6 py-4">Current Status</th>
                        <th className="px-6 py-4 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {orders
                        .filter(o => !searchQuery || o.buyerName?.toLowerCase().includes(searchQuery.toLowerCase()) || o.email?.toLowerCase().includes(searchQuery.toLowerCase()) || o.id?.includes(searchQuery))
                        .map(o => (
                          <tr key={o.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs font-bold text-primary block">{o.id}</span>
                              <span className="text-xs text-on-surface-variant">
                                {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-on-surface block">{o.buyerName || 'Guest Buyer'}</span>
                              <span className="text-xs text-on-surface-variant">{o.email}</span>
                              {o.phone && <span className="text-xs text-on-surface-variant block">{o.phone}</span>}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-headline-md text-primary font-bold block">₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</span>
                              <span className="text-xs text-on-surface-variant">{o.itemCount || o.items?.length || 1} item(s)</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                o.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {o.status || 'Placed'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <select
                                value={o.status || 'Placed'}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-bold text-on-surface focus:ring-primary focus:border-primary"
                              >
                                <option value="Placed">Placed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                            No orders placed yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 5: USERS DIRECTORY */}
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Assigned Role</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4 text-right">Registered On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {usersList
                        .filter(u => !searchQuery || u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(u => (
                          <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-4 font-bold text-on-surface">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-xs">
                                  {(u.name?.[0] || u.email?.[0] || 'U').toUpperCase()}
                                </div>
                                {u.name || 'Unnamed User'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-on-surface-variant text-sm">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                u.role === 'Admin' ? 'bg-primary-container text-on-primary-container' :
                                u.role === 'Seller' ? 'bg-secondary-container text-on-secondary-container' :
                                'bg-surface-container-high text-on-surface'
                              }`}>
                                {u.role || 'Buyer'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-on-surface-variant text-sm">{u.phone || '—'}</td>
                            <td className="px-6 py-4 text-right text-xs text-on-surface-variant">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminDashboardAgriMarketConnect;
