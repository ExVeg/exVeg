import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { addToCart } from '../store/cartSlice';
import { useToast } from '../context/ToastContext';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('relevant');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const sliderRef = useRef(null);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  useEffect(() => {
    const paramCat = searchParams.get('category') || '';
    const paramQ = searchParams.get('q') || '';
    setSelectedCategory(paramCat);
    setSearchQuery(paramQ);
  }, [searchParams]);

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

  const categories = [...new Set(products.map((p) => p.category?.trim()).filter(Boolean))];

  const updateCategoryFilter = (cat) => {
    setSelectedCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat) next.set('category', cat);
    else next.delete('category');
    setSearchParams(next, { replace: true });
  };

  const filtered = products
    .filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.sellerName?.toLowerCase().includes(q);
      const matchesCategory = selectedCategory
        ? (p.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase() ||
           p.category?.trim().toLowerCase().includes(selectedCategory.trim().toLowerCase()))
        : true;
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

  const scrollCategories = (dir) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: dir * 240, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-margin-desktop py-lg flex gap-gutter w-full">
      {/* Sidebar Filters */}
      <aside className="w-64 flex-shrink-0 space-y-md hidden lg:block">
        <div className="bg-white border border-outline-variant/70 p-5 rounded-2xl shadow-sm sticky top-24">
          <div className="flex items-center justify-between mb-md">
            <h2 className="font-title-lg text-title-lg flex items-center gap-2 text-[#142218]">
              <span className="material-symbols-outlined text-primary">filter_list</span> Filters
            </h2>
            <button
              className="text-label-sm text-primary font-bold hover:underline"
              onClick={() => { setSearchQuery(''); setSearchParams({}, { replace: true }); setSelectedCategory(''); }}
            >
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="border-t border-outline-variant/50 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-md font-bold text-[#142218]">Category</span>
              <span className="text-[11px] text-on-surface-variant">{categories.length}</span>
            </div>
            <div className="space-y-2.5">
              <label className="flex items-center justify-between gap-2 text-label-md hover:text-primary cursor-pointer">
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === ''}
                    onChange={() => updateCategoryFilter('')}
                    className="rounded border-outline text-primary focus:ring-primary w-4 h-4 accent-primary"
                  />
                  <span>All Products</span>
                </span>
                <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{products.length}</span>
              </label>
              {categories.map((cat) => {
                const count = products.filter(p => p.category?.trim() === cat).length;
                return (
                  <label key={cat} className="flex items-center justify-between gap-2 text-label-md hover:text-primary cursor-pointer">
                    <span className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => updateCategoryFilter(cat)}
                        className="rounded border-outline text-primary focus:ring-primary w-4 h-4 accent-primary"
                      />
                      <span className="truncate">{cat}</span>
                    </span>
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Product Grid Content */}
      <section className="flex-1 min-w-0">
        {/* Grid Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-7 bg-primary rounded-full inline-block" />
              <h1 className="font-headline-md text-2xl md:text-3xl font-extrabold text-[#142218]">Marketplace</h1>
            </div>
            <p className="text-on-surface-variant text-sm mt-1">
              Showing <strong>{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''}
              {selectedCategory ? ` in "${selectedCategory}"` : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or category..."
                className="w-full sm:w-56 pl-9 pr-4 py-2 rounded-full border border-outline-variant bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {/* Sort */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-full border border-outline-variant shadow-xs">
              <span className="text-xs font-bold text-on-surface-variant">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none p-0 text-sm font-medium focus:ring-0 focus:outline-none"
              >
                <option value="relevant">Most Relevant</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            {/* View toggle */}
            <div className="flex gap-1 border border-outline-variant rounded-full p-1 bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full material-symbols-outlined text-[18px] ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'}`}
              >grid_view</button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-full material-symbols-outlined text-[18px] ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'}`}
              >view_list</button>
            </div>
          </div>
        </div>

        {/* Category Filter Slider Strip */}
        {categories.length > 0 && (
          <div className="relative flex items-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => scrollCategories(-1)}
              className="w-8 h-8 rounded-full bg-white border border-outline-variant shadow-xs flex items-center justify-center hover:border-primary text-on-surface-variant flex-shrink-0"
              aria-label="Scroll categories left"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <div ref={sliderRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
              <button
                type="button"
                onClick={() => updateCategoryFilter('')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === ''
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
                }`}
              >
                All ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => updateCategoryFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => scrollCategories(1)}
              className="w-8 h-8 rounded-full bg-white border border-outline-variant shadow-xs flex items-center justify-center hover:border-primary text-on-surface-variant flex-shrink-0"
              aria-label="Scroll categories right"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        )}

        {/* Grid Items */}
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-3 text-on-surface-variant">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant bg-white rounded-2xl border border-outline-variant/60">
            <span className="material-symbols-outlined text-5xl block mb-4 text-primary/60">search_off</span>
            <p className="font-bold text-lg text-[#142218]">No products found.</p>
            {products.length === 0 && (
              <p className="text-sm mt-2">The marketplace has no approved products yet. Check back soon!</p>
            )}
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => { setSearchQuery(''); updateCategoryFilter(''); }}
                className="mt-4 px-5 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            : 'flex flex-col gap-4'
          }>
            {filtered.map((product) => {
              const discountPct =
                product.originalPrice && product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;

              return (
                <Link key={product.id} to={`/products/${product.id}`} className="block">
                  {viewMode === 'grid' ? (
                    <div className="product-card group relative bg-white border border-outline-variant/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col">
                      <div className="relative h-48 bg-[#f4f7f2] overflow-hidden shrink-0">
                        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={product.name} src={product.imageUrl} />
                        {product.category && (
                          <span className="absolute top-3 left-3 bg-[#143d23]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide shadow-sm">
                            {product.category}
                          </span>
                        )}
                        {discountPct > 0 && (
                          <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-full shadow-sm">
                            {discountPct}% OFF
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-title-lg text-[15px] font-bold text-[#142218] line-clamp-2 mb-1.5 min-h-[42px]">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="flex items-center text-amber-400">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-xs font-bold text-[#142218] ml-0.5">{product.rating || 4.5}</span>
                          </div>
                          <span className="text-on-surface-variant text-[11px]">({product.reviewsCount || 0})</span>
                          <span className="text-outline-variant">•</span>
                          <span className="text-[11px] text-on-surface-variant truncate">{product.sellerName || 'Verified'}</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-3 mt-auto">
                          <span className="text-lg font-extrabold text-[#166534]">₹{Number(product.price).toFixed(0)}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-on-surface-variant line-through">₹{Number(product.originalPrice).toFixed(0)}</span>
                          )}
                          {discountPct > 0 && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">{discountPct}% OFF</span>
                          )}
                        </div>
                        <button
                          className="w-full bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs uppercase tracking-wide py-2.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                          onClick={(e) => handleQuickAdd(e, product)}
                        >
                          <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* List view */
                    <div className="flex gap-4 bg-white border border-outline-variant/60 rounded-2xl p-4 hover:shadow-md transition-all items-center">
                      <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
                          {product.category}
                        </span>
                        <h3 className="font-bold text-[#142218] line-clamp-1 mt-1">{product.name}</h3>
                        <p className="text-on-surface-variant text-sm line-clamp-2 mt-0.5">{product.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[#166534] font-extrabold">₹{Number(product.price).toFixed(2)}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-on-surface-variant line-through">₹{Number(product.originalPrice).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="bg-[#166534] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-[#14532d] transition-all flex-shrink-0 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                        Add to Cart
                      </button>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Products;
