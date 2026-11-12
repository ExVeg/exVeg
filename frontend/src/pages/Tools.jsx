import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import {
  collection, query, where, getDocs,
  addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore';
import { useAuthState } from '../hooks/useAuthState';
import ImageUploader from '../components/ImageUploader';

const TOOLS_CATEGORIES = [
  'All', 'Hand Tools', 'Power Tools', 'Irrigation', 'Sprayers', 'Harvesting Equipment', 'Soil Testing', 'Protective Gear', 'Other'
];

// ── Seller: Add / Edit Tool Modal ──────────────────────────────────────────────
const ToolProductModal = ({ existing, onClose, onSaved, sellerId, sellerName }) => {
  const isEdit = !!existing;
  const [form, setForm] = useState({
    name: existing?.name ?? '',
    category: existing?.category ?? 'Hand Tools',
    price: existing?.price ?? '',
    stock: existing?.stock ?? '',
    description: existing?.description ?? '',
    brand: existing?.brand ?? '',
  });
  const [toolImages, setToolImages] = useState(
    existing?.imageUrl ? [{ url: existing.imageUrl, publicId: existing.imagePublicId || '', isPrimary: true }] : []
  );
  const uploaderRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const finalImages = uploaderRef.current
        ? await uploaderRef.current.uploadPending()
        : toolImages;
      const primaryImg = finalImages.find((img) => img.isPrimary) || finalImages[0];
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        description: form.description.trim(),
        imageUrl: primaryImg?.url || 'https://via.placeholder.com/300?text=Tool',
        imagePublicId: primaryImg?.publicId || '',
        thumbnails: finalImages.filter((img) => !img.isPrimary).map((img) => img.url),
        imagePublicIds: finalImages.map((img) => img.publicId),
        brand: form.brand.trim(),
        type: 'tools',
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
        await updateDoc(doc(db, 'tools', existing.id), payload);
        onSaved({ id: existing.id, ...payload });
      } else {
        const ref = await addDoc(collection(db, 'tools'), payload);
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
        <h3 className="text-xl font-bold mb-4">{isEdit ? 'Edit Tool Listing' : 'Add Tool Listing'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tool / Equipment Name *</label>
            <input required name="name" value={form.name} onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Stainless Steel Spade" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <input
                required
                type="text"
                list="tools-category-options"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                placeholder="Enter or pick category"
              />
              <datalist id="tools-category-options">
                {TOOLS_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Falcon" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹) *</label>
              <input required type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
              <input required type="number" min="0" name="stock" value={form.stock} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product Images</label>
            <ImageUploader
              ref={uploaderRef}
              resourceType="product"
              productId=""
              onImagesChange={setToolImages}
              existingImages={toolImages}
              maxImages={5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea rows="3" name="description" value={form.description} onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="Describe the tool..." />
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

// ── Main Tools Page ────────────────────────────────────────────────────────────
const Tools = () => {
  const { user, role, loading: authLoading } = useAuthState();
  const isSeller = role === 'Seller';

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
        q = query(collection(db, 'tools'), where('sellerId', '==', user.uid));
      } else {
        q = query(collection(db, 'tools'), where('status', '==', 'Approved'));
      }
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setListings(items);
    } catch (err) {
      console.error('Error fetching tools listings:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tool listing? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'tools', id));
      setListings(prev => prev.filter(l => l.id !== id));
      showToast('🗑️ Listing deleted.');
    } catch {
      showToast('❌ Failed to delete listing.');
    }
  };

  const handleSaved = (savedItem) => {
    setListings(prev => {
      const idx = prev.findIndex(l => l.id === savedItem.id);
      if (idx >= 0) { const u = [...prev]; u[idx] = savedItem; return u; }
      return [savedItem, ...prev];
    });
    showToast(editItem ? '✅ Listing updated!' : '✅ Listing submitted for approval!');
  };

  const dynamicCategories = [
    'All',
    ...new Set([
      ...TOOLS_CATEGORIES.filter(c => c !== 'All'),
      ...listings.map(l => l.category).filter(Boolean)
    ])
  ];

  const filtered = listings.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = l.name?.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q) ||
      l.brand?.toLowerCase().includes(q) ||
      l.category?.toLowerCase().includes(q);
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
      <div className="bg-gradient-to-r from-[#143d23] to-[#166534] text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between mb-lg gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-300 text-3xl">handyman</span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Modern Farm Gear</span>
            <h1 className="font-headline-md text-2xl md:text-3xl font-extrabold">Farming Tools & Equipment</h1>
            <p className="text-emerald-100 text-sm">
              {isSeller ? 'Manage your tools and equipment listings' : 'Browse high-quality farming tools from verified sellers'}
            </p>
          </div>
        </div>
        {isSeller && (
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-bold transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Tool Listing
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
            placeholder="Search tools & equipment..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {dynamicCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex items-center justify-center gap-3 text-on-surface-variant">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          Loading tool listings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-on-surface-variant">
          <div className="w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-5xl">handyman</span>
          </div>
          <p className="font-bold text-lg mb-2">
            {listings.length === 0
              ? (isSeller ? "You haven't listed any tools yet." : "No farming tools available yet.")
              : "No tools match your search."}
          </p>
          <p className="text-sm text-on-surface-variant">
            {listings.length === 0 && isSeller
              ? 'Click "Add Tool Listing" to get started.'
              : listings.length === 0
                ? 'Check back soon as sellers add new equipment.'
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
                    src={item.imageUrl || 'https://via.placeholder.com/300?text=Tool'}
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
                  {item.brand && (
                    <p className="text-xs text-primary font-semibold mb-1">{item.brand}</p>
                  )}
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

      {/* Modal */}
      {showModal && (
        <ToolProductModal
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

export default Tools;
