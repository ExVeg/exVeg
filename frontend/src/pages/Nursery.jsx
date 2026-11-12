import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection, query, where, getDocs,
  addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore';
import { useAuthState } from '../hooks/useAuthState';

const NURSERY_CATEGORIES = [
  'All', 'Saplings', 'Flowering Plants', 'Fruit Trees', 'Herbs', 'Succulents & Cacti', 'Indoor Plants', 'Vegetable Seedlings', 'Other'
];

// ── Seller: Add / Edit Product Modal ───────────────────────────────────────────
const NurseryProductModal = ({ existing, onClose, onSaved, sellerId, sellerName }) => {
  const isEdit = !!existing;
  const [form, setForm] = useState({
    name: existing?.name ?? '',
    category: existing?.category ?? 'Saplings',
    price: existing?.price ?? '',
    stock: existing?.stock ?? '',
    description: existing?.description ?? '',
    imageUrl: existing?.imageUrl ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim() || 'https://via.placeholder.com/300?text=Nursery',
        type: 'nursery',
        sellerId,
        sellerName,
        sellerEmail: auth.currentUser?.email || existing?.sellerEmail || '',
        status: isEdit ? (existing.status ?? 'Pending') : 'Pending',
        rating: existing?.rating ?? 0,
        reviewsCount: existing?.reviewsCount ?? 0,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEdit) {
        await updateDoc(doc(db, 'nursery', existing.id), payload);
        onSaved({ id: existing.id, ...payload });
      } else {
        const ref = await addDoc(collection(db, 'nursery'), payload);
        onSaved({ id: ref.id, ...payload });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save listing.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">{isEdit ? 'Edit Nursery Listing' : 'Add Nursery Listing'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Plant / Sapling Name *</label>
            <input required name="name" value={form.name} onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Mango Sapling" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select required name="category" value={form.category} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none">
                {NURSERY_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹) *</label>
              <input required type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
            <input required type="number" min="0" name="stock" value={form.stock} onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea rows="3" name="description" value={form.description} onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="Describe the plant..." />
          </div>
          {error && <div className="bg-error-container text-on-error-container p-3 rounded text-sm">{error}</div>}
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-outline rounded text-on-surface-variant hover:bg-surface-container">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : (isEdit ? 'Update Listing' : 'Submit for Approval')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Nursery Page ──────────────────────────────────────────────────────────
const Nursery = () => {
  const { user, role, loading: authLoading } = useAuthState();
  const isSeller = role === 'Seller';
  const isAdmin = role === 'Admin';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    if (authLoading) return;
    fetchListings();
  }, [authLoading, role, user]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let q;
      if (isSeller && user) {
        // Sellers see their own listings (all statuses)
        q = query(collection(db, 'nursery'), where('sellerId', '==', user.uid));
      } else {
        // Buyers / guests see only approved listings
        q = query(collection(db, 'nursery'), where('status', '==', 'Approved'));
      }
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setListings(items);
    } catch (err) {
      console.error('Error fetching nursery listings:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this nursery listing? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'nursery', id));
      setListings(prev => prev.filter(l => l.id !== id));
      showToast('🗑️ Listing deleted.');
    } catch (err) {
      showToast('❌ Failed to delete listing.');
    }
  };

  const handleSaved = (savedItem) => {
    setListings(prev => {
      const idx = prev.findIndex(l => l.id === savedItem.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedItem;
        return updated;
      }
      return [savedItem, ...prev];
    });
    showToast(editItem ? '✅ Listing updated!' : '✅ Listing submitted for approval!');
  };

  const filtered = listings.filter(l => {
    const matchSearch = l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || l.category === category;
    return matchSearch && matchCat;
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-margin-desktop py-lg">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] bg-white border border-outline-variant shadow-xl rounded-xl px-5 py-3 text-sm font-semibold animate-fade-in">
          {toast}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-lg gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl">nature_people</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface">Nursery</h1>
            <p className="text-on-surface-variant font-body-md">
              {isSeller ? 'Manage your nursery plant listings' : 'Browse quality plants & saplings from verified growers'}
            </p>
          </div>
        </div>
        {isSeller && (
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Nursery Listing
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-lg">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plants & saplings..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {NURSERY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex items-center justify-center gap-3 text-on-surface-variant">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          Loading nursery listings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-on-surface-variant">
          <div className="w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-5xl">nature_people</span>
          </div>
          <p className="font-bold text-lg mb-2">
            {listings.length === 0
              ? (isSeller ? "You haven't listed any nursery plants yet." : "No nursery plants available yet.")
              : "No plants match your search."}
          </p>
          <p className="text-sm text-on-surface-variant">
            {listings.length === 0 && isSeller
              ? 'Click "Add Nursery Listing" to get started.'
              : listings.length === 0
                ? 'Check back soon as sellers add new listings.'
                : 'Try adjusting your filters or search term.'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="mt-4 text-primary hover:underline text-sm">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-on-surface-variant font-body-md mb-md">
            Showing {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
                <div className="relative h-48 bg-surface-container overflow-hidden">
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/300?text=Plant'}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-full">{item.category}</span>
                  </div>
                  {isSeller && (
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        item.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{item.status || 'Pending'}</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-title-lg text-on-surface mb-1 line-clamp-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-on-surface-variant text-sm line-clamp-2 mb-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-label-sm text-on-surface-variant">By {item.sellerName || 'Verified Seller'}</span>
                    <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <span className="font-headline-md text-primary">₹{Number(item.price).toFixed(2)}</span>
                      <span className="text-xs text-on-surface-variant ml-2">{item.stock} in stock</span>
                    </div>
                    {isSeller ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditItem(item); setShowModal(true); }}
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-on-secondary-container transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-error-container text-on-surface-variant hover:text-error transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ) : (
                      <button className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg font-bold hover:bg-primary/90 transition-all">
                        Enquire
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {showModal && (
        <NurseryProductModal
          existing={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSaved={handleSaved}
          sellerId={user?.uid}
          sellerName={user?.displayName || user?.email?.split('@')[0] || 'Seller'}
        />
      )}
    </div>
  );
};

export default Nursery;
