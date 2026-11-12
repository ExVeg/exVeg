import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ImageUploader from '../components/ImageUploader';

const SellerDashboardVendorPortal = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ name: 'Loading...', role: 'Seller' });
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', stock: '' });
  const [productImages, setProductImages] = useState([]); // [{url, publicId, isPrimary}]
  const uploaderRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().name) {
            setUserData(userDoc.data());
          } else {
            // Fallback if document doesn't exist or doesn't have a name
            setUserData({ name: currentUser.displayName || currentUser.email.split('@')[0], role: 'Seller' });
          }
          
          // Fetch actual products for this seller
          const q = query(collection(db, 'products'), where('sellerId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          const productsData = [];
          querySnapshot.forEach((doc) => productsData.push({ id: doc.id, ...doc.data() }));
          setProducts(productsData);

          // Fetch orders for this seller
          try {
            const ordQ = query(collection(db, 'orders'), where('sellerId', '==', currentUser.uid));
            const ordSnap = await getDocs(ordQ);
            const ordersData = ordSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            ordersData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setOrders(ordersData);
          } catch (ordErr) {
            console.warn('Orders fetch note:', ordErr.message);
          }
          
        } catch (error) {
          console.error("Error fetching data:", error);
          setUserData({ name: currentUser.displayName || currentUser.email.split('@')[0], role: 'Seller' });
        }
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      // Auto-upload any locally selected images that haven't been uploaded yet
      const finalImages = uploaderRef.current
        ? await uploaderRef.current.uploadPending()
        : productImages;

      // Resolve image data from Cloudinary uploads
      const primaryImg = finalImages.find((img) => img.isPrimary) || finalImages[0];
      const imageUrl = primaryImg?.url || 'https://via.placeholder.com/300?text=No+Image';
      const imagePublicId = primaryImg?.publicId || '';
      const thumbnails = finalImages
        .filter((img) => !img.isPrimary)
        .map((img) => img.url);
      const imagePublicIds = finalImages.map((img) => img.publicId);

      const docRef = await addDoc(collection(db, 'products'), {
        name: newProduct.name.trim(),
        category: newProduct.category.trim(),
        price: parseFloat(newProduct.price),
        originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : null,
        stock: parseInt(newProduct.stock),
        description: newProduct.description || '',
        imageUrl,
        imagePublicId,
        thumbnails,
        imagePublicIds,
        sellerId: user.uid,
        sellerName: userData.businessName || userData.name || 'Verified Seller',
        sellerEmail: user.email || userData.email || '',
        rating: 0,
        reviewsCount: 0,
        status: 'Pending', // Requires Admin Approval
        createdAt: new Date().toISOString()
      });
      setProducts([...products, {
        id: docRef.id,
        name: newProduct.name,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        imageUrl,
        status: 'Pending'
      }]);
      setShowAddProduct(false);
      setNewProduct({ name: '', price: '', originalPrice: '', category: 'Vegetables', stock: '', description: '' });
      setProductImages([]);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error adding product: ", error);
      setSubmitError(error.message || "Failed to add product. Please try again.");
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { id: 'Dashboard', icon: 'dashboard' },
    { id: 'Inventory', icon: 'inventory_2' },
    { id: 'Orders', icon: 'shopping_bag' },
    { id: 'Analytics', icon: 'bar_chart' },
    { id: 'Settings', icon: 'settings' }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8faf5]">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto flex flex-col h-full w-64 bg-gradient-to-b from-[#143d23] to-[#0f3f22] text-emerald-50 shadow-xl py-md transform transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="px-md mb-lg pb-4 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-300 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
              </span>
              <h1 className="font-headline-md text-xl font-extrabold text-white tracking-tight">Vendor Portal</h1>
            </div>
            <p className="font-label-sm text-label-sm text-emerald-200/80">ExVeg Professional</p>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-emerald-100 hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-sm px-md py-3 rounded-xl transition-all font-label-md text-label-md ${activeTab === item.id ? 'bg-white/15 text-amber-300 font-bold shadow-sm' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.id}</span>
            </button>
          ))}
        </nav>
        <div className="px-md mt-auto pt-md border-t border-white/10 space-y-2">
          <button onClick={() => { setShowAddProduct(true); setMobileSidebarOpen(false); }} className="w-full flex items-center justify-center gap-xs bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-4 rounded-full font-bold text-label-md shadow-md transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            New Product
          </button>
          <div className="pt-4 flex items-center gap-sm">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-amber-300 overflow-hidden">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="font-label-md text-label-md font-bold text-white truncate w-32">{userData.name || user?.email}</p>
              <p className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">Verified Seller</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#f8faf5]">
        {/* TopAppBar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-margin-desktop py-3.5 md:py-4 bg-white/95 backdrop-blur-md border-b border-outline-variant/60 shadow-sm gap-2">
          <div className="flex items-center gap-2 sm:gap-md min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg border border-outline-variant text-[#143d23] flex-shrink-0"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-title-lg text-lg sm:text-xl font-extrabold text-[#143d23] truncate">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-md flex-shrink-0">
            <LanguageSwitcher compact />
            <Link to="/" className="text-primary text-xs sm:text-sm font-bold border border-primary/30 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all whitespace-nowrap">
              <span className="hidden sm:inline">Go to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
            <button className="hidden sm:inline-flex material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">account_circle</button>
          </div>
        </header>

        <div className="p-4 sm:p-6 md:p-margin-desktop space-y-md">
          {activeTab === 'Dashboard' && (
            <>
              {/* Welcome Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#143d23] to-[#166534] p-lg text-white flex flex-col md:flex-row justify-between items-center mb-6 shadow-md">
                <div className="z-10 text-center md:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Seller Workspace</span>
                  <h3 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-white mb-2">Welcome back, {userData.name}!</h3>
                  <p className="font-body-lg text-emerald-100">Manage your inventory and orders from your personal dashboard.</p>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
                  <p className="text-on-surface-variant font-medium">Total Products</p>
                  <p className="text-3xl font-bold text-primary mt-2">{products.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
                  <p className="text-on-surface-variant font-medium">Active Orders</p>
                  <p className="text-3xl font-bold text-primary mt-2">{orders.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
                  <p className="text-on-surface-variant font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    ₹{orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                <div className="p-md border-b border-outline-variant">
                  <h4 className="font-title-lg text-title-lg">Recent Orders</h4>
                </div>
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant">
                    You have no orders yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase">
                        <tr>
                          <th className="px-md py-3">Order ID</th>
                          <th className="px-md py-3">Buyer</th>
                          <th className="px-md py-3">Items</th>
                          <th className="px-md py-3">Amount</th>
                          <th className="px-md py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {orders.slice(0, 10).map((o) => (
                          <tr key={o.id} className="hover:bg-surface-container-low">
                            <td className="px-md py-3 font-mono text-xs">{o.id.slice(0, 8)}...</td>
                            <td className="px-md py-3 text-sm font-medium">{o.buyerName || o.email}</td>
                            <td className="px-md py-3 text-sm">{o.itemCount || o.items?.length || 1}</td>
                            <td className="px-md py-3 font-bold text-primary">₹{Number(o.totalAmount || 0).toFixed(2)}</td>
                            <td className="px-md py-3">
                              <span className="px-2 py-1 rounded text-xs font-bold bg-secondary-container text-on-secondary-container">
                                {o.status || 'Placed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'Inventory' && (
            <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
              <div className="p-md flex justify-between items-center border-b border-outline-variant">
                <h4 className="font-title-lg text-title-lg">Your Products</h4>
                <button onClick={() => setShowAddProduct(true)} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90">Add Product</button>
              </div>
              {products.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">You have not added any products yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase">
                      <tr>
                        <th className="px-md py-4">Name</th>
                        <th className="px-md py-4">Category</th>
                        <th className="px-md py-4">Price</th>
                        <th className="px-md py-4">Stock</th>
                        <th className="px-md py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-surface-container-low">
                          <td className="px-md py-4 font-bold">{p.name}</td>
                          <td className="px-md py-4">{p.category}</td>
                          <td className="px-md py-4 font-semibold text-primary">₹{Number(p.price || 0).toFixed(2)}</td>
                          <td className="px-md py-4">{p.stock} units</td>
                          <td className="px-md py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'Approved' ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-fixed text-on-tertiary-fixed'}`}>{p.status || 'Pending'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Orders' && (
            <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
              <div className="p-md border-b border-outline-variant">
                <h4 className="font-title-lg text-title-lg">Customer Orders</h4>
              </div>
              {orders.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">You have no orders yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase">
                      <tr>
                        <th className="px-md py-4">Order ID</th>
                        <th className="px-md py-4">Buyer</th>
                        <th className="px-md py-4">Delivery</th>
                        <th className="px-md py-4">Amount</th>
                        <th className="px-md py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-surface-container-low">
                          <td className="px-md py-4 font-mono text-xs">{o.id.slice(0, 10)}...</td>
                          <td className="px-md py-4 font-bold">{o.buyerName || o.email}</td>
                          <td className="px-md py-4 text-sm text-on-surface-variant">{o.deliveryDate || 'Standard'}</td>
                          <td className="px-md py-4 font-bold text-primary">₹{Number(o.totalAmount || 0).toFixed(2)}</td>
                          <td className="px-md py-4">
                            <span className="px-2 py-1 rounded text-xs font-bold bg-secondary-container text-on-secondary-container">{o.status || 'Placed'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'Analytics' || activeTab === 'Settings') && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 text-primary">insights</span>
              <p className="font-bold text-lg text-on-surface">{activeTab}</p>
              <p className="text-sm mt-1">
                {activeTab === 'Analytics'
                  ? `You have ${products.length} listed product(s), ${orders.length} order(s), and ₹${orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toLocaleString('en-IN')} total revenue.`
                  : 'Manage your merchant account and verification profile.'}
              </p>
              {activeTab === 'Analytics' && (
                <Link to="/analytics" className="inline-block mt-4 bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90">
                  Open Detailed Analytics
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-[90%] sm:w-[500px] md:w-[600px] shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Organic Tomatoes" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <input
                  required
                  type="text"
                  list="seller-product-categories"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter or choose category (e.g. Seeds & Bulbs, Vegetables, Tools)"
                />
                <datalist id="seller-product-categories">
                  <option value="Seeds & Bulbs" />
                  <option value="Vegetables" />
                  <option value="Fruits" />
                  <option value="Organic Fertilizers" />
                  <option value="Irrigation Tools" />
                  <option value="Pesticides" />
                  <option value="Nursery Plants" />
                  <option value="Tools" />
                  <option value="Garden Decor" />
                  <option value="Herbs" />
                </datalist>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Seeds & Bulbs', 'Vegetables', 'Fruits', 'Organic Fertilizers', 'Irrigation Tools', 'Tools'].map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setNewProduct({ ...newProduct, category: cat })}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        newProduct.category === cat
                          ? 'bg-primary text-white border-primary font-bold'
                          : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sale Price (₹)</label>
                  <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Original Price (₹) (Optional)</label>
                  <input type="number" step="0.01" value={newProduct.originalPrice || ''} onChange={e => setNewProduct({...newProduct, originalPrice: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Amount</label>
                  <input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product Images</label>
                <ImageUploader
                  ref={uploaderRef}
                  resourceType="product"
                  productId=""
                  onImagesChange={setProductImages}
                  existingImages={productImages}
                  maxImages={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea rows="3" value={newProduct.description || ''} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" placeholder="Describe the product..." />
              </div>
              
              {submitError && (
                <div className="bg-error-container text-on-error-container p-3 rounded text-sm font-medium">
                  {submitError}
                </div>
              )}
              
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowAddProduct(false)} disabled={isSubmitting} className="flex-1 py-2 border border-outline rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-primary text-white rounded hover:bg-primary/90 font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      Submitting...
                    </>
                  ) : (
                    'Submit for Approval'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboardVendorPortal;
