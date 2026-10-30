import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const AdminDashboardAgriMarketConnect = () => {
  const navigate = useNavigate();
  const [pendingProducts, setPendingProducts] = useState([]);
  const [approvedProducts, setApprovedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved'
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchAllProducts = async () => {
    try {
      // Fetch pending products
      const pendingQ = query(collection(db, 'products'), where('status', '==', 'Pending'));
      const pendingSnap = await getDocs(pendingQ);
      const pending = [];
      pendingSnap.forEach((d) => pending.push({ id: d.id, ...d.data() }));
      setPendingProducts(pending);

      // Fetch approved products
      const approvedQ = query(collection(db, 'products'), where('status', '==', 'Approved'));
      const approvedSnap = await getDocs(approvedQ);
      const approved = [];
      approvedSnap.forEach((d) => approved.push({ id: d.id, ...d.data() }));
      setApprovedProducts(approved);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      await updateDoc(doc(db, 'products', productId), { status: 'Approved' });
      const approved = pendingProducts.find(p => p.id === productId);
      setPendingProducts(pendingProducts.filter(p => p.id !== productId));
      if (approved) setApprovedProducts(prev => [...prev, { ...approved, status: 'Approved' }]);
      showToast('✅ Product approved and is now live!');
    } catch (error) {
      console.error('Error approving product:', error);
      showToast('❌ Failed to approve product.');
    }
  };

  const handleReject = async (productId) => {
    try {
      await updateDoc(doc(db, 'products', productId), { status: 'Rejected' });
      setPendingProducts(pendingProducts.filter(p => p.id !== productId));
      showToast('Product rejected.');
    } catch (error) {
      console.error('Error rejecting product:', error);
      showToast('❌ Failed to reject product.');
    }
  };

  const handleRemoveListing = async (productId) => {
    if (!window.confirm('Remove this product from the marketplace? It will no longer be visible to buyers.')) return;
    try {
      await updateDoc(doc(db, 'products', productId), { status: 'Removed' });
      setApprovedProducts(approvedProducts.filter(p => p.id !== productId));
      showToast('🗑️ Product listing removed from marketplace.');
    } catch (error) {
      console.error('Error removing product:', error);
      showToast('❌ Failed to remove listing.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Permanently delete this product? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      setApprovedProducts(approvedProducts.filter(p => p.id !== productId));
      showToast('🗑️ Product permanently deleted.');
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('❌ Failed to delete product.');
    }
  };

  const handleLogout = () => {
    signOut(auth);
    navigate('/login');
  };

  const ProductRow = ({ product, isPending }) => (
    <tr className="hover:bg-surface-container-low transition-colors">
      <td className="px-md py-4">
        <div className="flex items-center gap-3">
          <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded object-cover border border-outline-variant" />
          <div>
            <span className="font-body-md font-medium block">{product.name}</span>
            <span className="text-xs text-on-surface-variant line-clamp-1 w-48" title={product.description}>{product.description}</span>
          </div>
        </div>
      </td>
      <td className="px-md py-4 text-on-surface-variant">{product.sellerName || '—'}</td>
      <td className="px-md py-4">
        <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs">{product.category || '—'}</span>
      </td>
      <td className="px-md py-4 text-on-surface-variant">
        ₹{product.price} / {product.stock} units
      </td>
      <td className="px-md py-4 text-right">
        <div className="flex justify-end gap-2">
          {isPending ? (
            <>
              <button onClick={() => handleApprove(product.id)} className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 transition-all">
                Approve
              </button>
              <button onClick={() => handleReject(product.id)} className="px-4 py-1.5 bg-error text-white rounded-lg text-xs font-bold hover:bg-error/80 transition-all">
                Reject
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleRemoveListing(product.id)} className="px-4 py-1.5 bg-surface-container-high text-on-surface rounded-lg text-xs font-bold hover:bg-tertiary-container transition-all border border-outline-variant">
                Remove Listing
              </button>
              <button onClick={() => handleDeleteProduct(product.id)} className="px-4 py-1.5 bg-error text-white rounded-lg text-xs font-bold hover:bg-error/80 transition-all">
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] bg-white border border-outline-variant shadow-xl rounded-xl px-5 py-3 text-sm font-semibold animate-fade-in">
          {toast}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full z-40 w-64 bg-surface border-r border-outline-variant shadow-sm flex flex-col">
        <div className="p-6">
          <h1 className="text-title-lg font-headline-md font-bold text-primary">ExVeg</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">Admin Console</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'pending' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined">pending_actions</span>
            <span className="font-label-md">Pending Approvals</span>
            {pendingProducts.length > 0 && (
              <span className="ml-auto bg-error text-white text-xs font-black px-1.5 py-0.5 rounded-full">{pendingProducts.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'approved' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-label-md">Live Listings</span>
            <span className="ml-auto bg-primary-container text-on-primary-container text-xs font-black px-1.5 py-0.5 rounded-full">{approvedProducts.length}</span>
          </button>
        </nav>
        <div className="p-4 border-t border-outline-variant">
          <div onClick={handleLogout} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer text-error">
            <span className="material-symbols-outlined">logout</span>
            <p className="font-label-md font-bold">Logout</p>
          </div>
        </div>
      </aside>

      {/* Top Bar */}
      <header className="fixed top-0 right-0 left-64 h-16 flex justify-between items-center px-8 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <h2 className="font-headline-md text-headline-md text-on-surface">Admin Dashboard</h2>
        <div className="flex items-center gap-md">
          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-body-md focus:ring-2 focus:ring-primary transition-all" placeholder="Search products..." type="text" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 mt-16 p-8 min-h-screen">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-lg">
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm">
            <p className="text-on-surface-variant font-label-md">Total Revenue</p>
            <p className="font-headline-md text-headline-md mt-1">₹12,45,800</p>
          </div>
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm">
            <p className="text-on-surface-variant font-label-md">Active Sellers</p>
            <p className="font-headline-md text-headline-md mt-1">450</p>
          </div>
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm">
            <div className="flex justify-between items-start mb-sm">
              <div className="p-2 bg-tertiary-container text-on-tertiary-container rounded-lg">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              {pendingProducts.length > 0 && <span className="text-tertiary font-label-md bg-tertiary-fixed px-2 py-1 rounded-full">Urgent</span>}
            </div>
            <p className="text-on-surface-variant font-label-md">Pending Products</p>
            <p className="font-headline-md text-headline-md mt-1">{pendingProducts.length}</p>
          </div>
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm">
            <p className="text-on-surface-variant font-label-md">Live Products</p>
            <p className="font-headline-md text-headline-md mt-1">{approvedProducts.length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-md flex items-center justify-between border-b border-outline-variant">
            <div>
              <h3 className="font-title-lg text-on-surface">
                {activeTab === 'pending' ? 'Pending Product Approvals' : 'Live Product Listings'}
              </h3>
              <p className="text-sm text-on-surface-variant">
                {activeTab === 'pending'
                  ? 'Review and verify new products submitted by sellers'
                  : 'Manage approved products — remove or delete listings'
                }
              </p>
            </div>
            <button onClick={fetchAllProducts} className="text-primary hover:underline text-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">refresh</span> Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center gap-3 text-on-surface-variant">
              <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              Loading products...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-md py-4">Product Name</th>
                    <th className="px-md py-4">Seller</th>
                    <th className="px-md py-4">Category</th>
                    <th className="px-md py-4">Price / Stock</th>
                    <th className="px-md py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {activeTab === 'pending' && (
                    <>
                      {pendingProducts.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-md py-8 text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl block mb-2">check_circle</span>
                            No pending products to approve.
                          </td>
                        </tr>
                      )}
                      {pendingProducts.map(product => (
                        <ProductRow key={product.id} product={product} isPending={true} />
                      ))}
                    </>
                  )}
                  {activeTab === 'approved' && (
                    <>
                      {approvedProducts.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-md py-8 text-center text-on-surface-variant">
                            No approved products yet.
                          </td>
                        </tr>
                      )}
                      {approvedProducts.map(product => (
                        <ProductRow key={product.id} product={product} isPending={false} />
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminDashboardAgriMarketConnect;
