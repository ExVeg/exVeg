import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { addToCart } from '../store/cartSlice';
import { useToast } from '../context/ToastContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('relevant');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const dispatch = useDispatch();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('status', '==', 'Approved'));
        const querySnapshot = await getDocs(q);
        const productsData = [];
        querySnapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() });
        });
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  const filtered = products
    .filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });

  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      sellerId: product.sellerId || '',
      sellerEmail: product.sellerEmail || '',
      sellerName: product.sellerName || 'Verified Seller',
      category: product.category || '',
    }));
    showToast({ message: `"${product.name}" added to cart!`, type: 'success' });
  };

  return (
    <div className="max-w-7xl mx-auto px-margin-desktop py-lg flex gap-gutter w-full">
      {/* Sidebar Filters */}
      <aside className="w-64 flex-shrink-0 space-y-md hidden lg:block">
        <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm sticky top-24">
          <div className="flex items-center justify-between mb-md">
            <h2 className="font-title-lg text-title-lg flex items-center gap-2">
              <span className="material-symbols-outlined">filter_list</span> Filters
            </h2>
            <button
              className="text-label-sm text-primary hover:underline"
              onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
            >
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="border-b border-outline-variant pb-md mb-md">
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-md font-bold">Category</span>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-label-md hover:text-primary cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ''}
                  onChange={() => setSelectedCategory('')}
                  className="rounded border-outline text-primary focus:ring-primary w-4 h-4"
                />
                All
              </label>
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-3 text-label-md hover:text-primary cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="rounded border-outline text-primary focus:ring-primary w-4 h-4"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Product Grid Content */}
      <section className="flex-1">
        {/* Grid Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-md gap-4">
          <div>
            <h1 className="font-headline-md text-headline-md">Marketplace</h1>
            <p className="text-on-surface-variant text-body-md">Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="pl-9 pr-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {/* Sort */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant">
              <span className="text-label-sm font-bold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none p-0 text-label-md focus:ring-0"
              >
                <option value="relevant">Most Relevant</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            {/* View toggle */}
            <div className="flex gap-1 border border-outline-variant rounded-lg p-1 bg-surface-container">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded material-symbols-outlined ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'}`}
              >grid_view</button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded material-symbols-outlined ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'}`}
              >view_list</button>
            </div>
          </div>
        </div>

        {/* Grid Items */}
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-3 text-on-surface-variant">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl block mb-4">search_off</span>
            <p className="font-bold text-lg">No products found.</p>
            {products.length === 0 && (
              <p className="text-sm mt-2">The marketplace has no approved products yet. Check back soon!</p>
            )}
            {products.length > 0 && searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mt-4 text-primary hover:underline">Clear search</button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter'
            : 'flex flex-col gap-4'
          }>
            {filtered.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className="block">
                {viewMode === 'grid' ? (
                  <div className="product-card group relative bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
                    <div className="relative h-48 bg-surface-container overflow-hidden shrink-0">
                      <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={product.name} src={product.imageUrl} />
                      {product.originalPrice && (
                        <span className="absolute top-3 left-3 bg-tertiary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Sale</span>
                      )}
                      {/* Quick Add overlay */}
                      <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          className="bg-primary text-white font-label-md px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-lg"
                          onClick={(e) => handleQuickAdd(e, product)}
                        >
                          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                          Quick Add
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 text-tertiary mb-1">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-label-sm font-bold">{product.rating}</span>
                          <span className="text-on-surface-variant text-[10px]">({product.reviewsCount || 0})</span>
                        </div>
                      )}
                      <h3 className="font-title-lg text-on-surface line-clamp-2 mb-1 flex-1">{product.name}</h3>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-label-sm text-on-surface-variant">By {product.sellerName || 'Verified Seller'}</span>
                        <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }} title="Verified Seller">verified</span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-auto">
                        <span className="text-headline-md text-primary">₹{Number(product.price).toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-label-sm text-on-surface-variant line-through">₹{Number(product.originalPrice).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* List view */
                  <div className="flex gap-4 bg-white border border-outline-variant rounded-xl p-4 hover:shadow-md transition-all">
                    <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-on-surface line-clamp-1">{product.name}</h3>
                      <p className="text-on-surface-variant text-sm line-clamp-2 mt-1">{product.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-primary font-bold">₹{Number(product.price).toFixed(2)}</span>
                        <span className="text-xs text-on-surface-variant">{product.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="self-center bg-primary text-white px-4 py-2 rounded-lg font-label-md hover:bg-primary/90 transition-all flex-shrink-0"
                    >
                      Add to Cart
                    </button>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Products;
