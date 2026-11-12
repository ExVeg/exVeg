import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { addToCart } from '../store/cartSlice';
import { useToast } from '../context/ToastContext';

const BASE_CATEGORIES = [
  { name: 'Seeds & Bulbs', label: 'Seeds', icon: 'potted_plant', bg: 'bg-emerald-50 text-emerald-700' },
  { name: 'Organic Fertilizers', label: 'Fertilizers', icon: 'science', bg: 'bg-lime-50 text-lime-700' },
  { name: 'Pesticides', label: 'Pesticides', icon: 'sanitizer', bg: 'bg-amber-50 text-amber-700' },
  { name: 'Irrigation Tools', label: 'Tools', icon: 'handyman', bg: 'bg-sky-50 text-sky-700' },
  { name: 'Nursery', label: 'Nursery', icon: 'nature_people', bg: 'bg-teal-50 text-teal-700', route: '/nursery' },
  { name: 'Vegetables', label: 'Organic', icon: 'eco', bg: 'bg-green-50 text-green-700' },
  { name: 'Garden Decor', label: 'Garden Decor', icon: 'yard', bg: 'bg-rose-50 text-rose-700' },
];

const FALLBACK_PRODUCTS = [
  {
    id: 'featured-tomato',
    name: 'Premium Heirloom Tomato Seeds',
    sellerName: 'GreenHarvest Co.',
    category: 'Seeds & Bulbs',
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    reviewsCount: 124,
    badge: 'Best Seller',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz_mdZvpBL6MwHUKf4JeArttfhCnWREY0M0XcrDsXQjEyrcIitl85XK4T3PUBTsy-5WwS4vm79lcBiRz0rKzpTTIx4WV7wNHOeOWFP6K-EPDXMc70AiWG4-AKMDlpW52vKzk2ssFs3XXCqpMTfCQIx5i-YwUEK7waMnrDCPkVfEJmvV1o8sYXzRJmcXx-Jnk6tYcMgUlY_ZtTo7ys8UtOu-N3XX4uYr59Gh7LLmB0tm290Bk3q1QhJaEDeGgLyqTx5s9Yv4cRARlg',
  },
  {
    id: 'featured-npk',
    name: 'Balanced NPK Liquid Fertilizer (1L)',
    sellerName: 'AgriTech Pro',
    category: 'Organic Fertilizers',
    price: 499,
    originalPrice: 650,
    rating: 4.9,
    reviewsCount: 86,
    badge: 'In Stock',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkjQEJFigcPLz3dKf4AQgJCVdciJf6VdVd2MiBxrxpm98IS6qkouaHFPTs3z9nPrd92hzzPwJaHepy1glpqqmvAd6zNWKydkaZw63rl_Qo8dbHVv54iJvo0ymtw1kRcN-D3vtG-nTYz3zsQMcT07Cy5mF_eo0wHL2-ecb7avyjblmStIUuAKnGl0tagTUt5zqn9j41Kv-yZ3EyCKtTdZovgTDQGAgy6K4EfopsTUO49gdJCZxYOqnlYfWXkBzGE1bfG9aAQVOG9xY',
  },
  {
    id: 'featured-tools',
    name: 'Ergonomic Stainless Steel Tool Set',
    sellerName: 'IronRoot Tools',
    category: 'Irrigation Tools',
    price: 849,
    originalPrice: 1099,
    rating: 4.7,
    reviewsCount: 310,
    badge: 'Heavy Duty',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCncbba_rQkhzsmurUI-xo02R5_QTOkOSWUB13QdOUDdhzMlcD1IqW_lqOmTZiGmp_IzqEsd7QEnia7kYA6cG2xfrm2PL1tp21h_E_a1BzlDBgUxkUS3BW7FVrRWB4Q4vlAwZHFHYQcnEBWclmZtupB-dyJfiOeQ2UU5Co13Hr07rdTUa-MXwpMVHyI0TNIayvd3-OgigyXAg7SBGRxxTFtkiUWsiXfulBXYAXollayrP1a4D1nYNbs0-nbElUG8W3URk5wVVc6Bi4',
  },
  {
    id: 'featured-lavender',
    name: 'English Lavender Nursery Starter',
    sellerName: 'Bloom Nursery',
    category: 'Nursery',
    price: 349,
    originalPrice: 449,
    rating: 5.0,
    reviewsCount: 45,
    badge: 'Eco-Pack',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyy8CoBx_Ly-2ZaTCy0vRdn4btP9hQoVs8O2gjZ3gzBaR-PrMbMABUQ9bz-D2VNatCAoLdSwW2kr1WfozjvtkpqDSUE2bNYj-MLhsuVtkeJdfVdMzJ4j26oumD-0ZV0KSHcu1UWUMXfnZYLBdpzmM0Fyp1J7rDlGeAeaqGB-L44lp4rfiX4MBwdXkes4j_-ITxjOgc8V9RiA7SPnVRK6BvWDxpCqJbnI549y0uomUQlj1x83w-YGdFplVRsr4uGivbkUaw6IaSrAQ',
  },
];

const Home = () => {
  const [liveProducts, setLiveProducts] = useState([]);
  const catSliderRef = useRef(null);
  const featSliderRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    const fetchProducts = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'products'), where('status', '==', 'Approved')));
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (items.length > 0) setLiveProducts(items);
      } catch {
        // Fallback products remain shown seamlessly
      }
    };
    fetchProducts();

    return () => observer.disconnect();
  }, []);

  const showcaseProducts = liveProducts.length > 0 ? liveProducts : FALLBACK_PRODUCTS;

  // Merge preset category cards with any custom seller categories from Firestore
  const liveCategoryNames = [...new Set(liveProducts.map((p) => p.category?.trim()).filter(Boolean))];
  const mergedCategories = [...BASE_CATEGORIES];
  liveCategoryNames.forEach((catName) => {
    const alreadyExists = mergedCategories.some(
      (c) => c.name.toLowerCase() === catName.toLowerCase() || c.label.toLowerCase() === catName.toLowerCase()
    );
    if (!alreadyExists) {
      mergedCategories.push({
        name: catName,
        label: catName,
        icon: 'category',
        bg: 'bg-emerald-50 text-emerald-700',
      });
    }
  });

  const getCategoryCount = (cat) =>
    liveProducts.filter(
      (p) =>
        p.category?.trim().toLowerCase() === cat.name.toLowerCase() ||
        p.category?.trim().toLowerCase() === cat.label.toLowerCase()
    ).length;

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      quantity: 1,
      sellerId: product.sellerId || '',
      sellerEmail: product.sellerEmail || '',
      sellerName: product.sellerName || 'Verified Seller',
      category: product.category || '',
    }));
    showToast({ message: `"${product.name}" added to cart!`, type: 'success' });
  };

  const scrollTrack = (ref, delta) => {
    if (ref.current) ref.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full min-h-[76vh] flex items-center overflow-hidden bg-[#143d23]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f351e]/95 via-[#144527]/80 to-[#144527]/35 z-10" />
          <img
            className="w-full h-full object-cover"
            alt="Hero background"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF0w-B9ciVIbZgxLtGI_dG0JXZtX4reJ7-EDL3IiATHRi0-9pcJTO56BKMPBdCrg_k6prMMy_jNOTinEQHmmlmwK5IftFGXkQpRj6CdThn5oZVjLZHEoJXbzM51Pe-hplhcVBkjxhIh9k6zjRzp1eblUSfsGKE5GcDGCUfQ9DG0RWI0Wt2FIZfmDXJj-dO1TKYxMWN6ZOs38-7wkGs7C2BahRu8vaQUpdOMxws_b0RrERcF5IqLYLy0Wh3TlQU7BvZcsRj4tKzwIo"
          />
        </div>
        <div className="relative z-20 px-6 md:px-margin-desktop max-w-7xl mx-auto w-full py-16">
          <div className="max-w-3xl reveal">
            <span className="inline-flex items-center gap-1.5 bg-amber-400 text-[#142218] text-xs font-extrabold px-3.5 py-1.5 rounded-full mb-5 shadow-sm">
              <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              India&apos;s Trusted Agri Marketplace • 90%+ Quality Germination
            </span>
            <h1 className="font-display-lg text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Verified Agricultural Products for Farmers &amp; Home Gardeners
            </h1>
            <p className="font-body-lg text-base sm:text-lg text-emerald-100/90 mb-8 max-w-2xl">
              Buy seeds, fertilizers, tools, and gardening essentials directly from trusted sellers. Join a community built on quality and growth.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-amber-400 hover:bg-amber-300 text-[#142218] px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Shop Now
                <span className="material-symbols-outlined text-lg" data-icon="arrow_forward">arrow_forward</span>
              </Link>
              <Link
                to="/register"
                className="border-2 border-white/80 bg-white/10 backdrop-blur-sm text-white px-8 py-3.5 rounded-full font-bold hover:bg-white hover:text-[#166534] transition-all"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
        {/* Floating Asset */}
        <div className="absolute right-margin-desktop bottom-16 hidden xl:block animate-float z-20">
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4 shadow-xl border border-white/50">
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary-container" data-icon="verified_user">verified_user</span>
            </div>
            <div>
              <p className="font-title-lg text-primary font-bold">100% Quality Seeds</p>
              <p className="font-label-sm text-on-surface-variant">Verified by Experts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating 4-Card Trust Bar (BeejDukan-inspired) */}
      <section className="px-4 md:px-margin-desktop max-w-7xl mx-auto -mt-8 relative z-30">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: 'eco', title: '90%+ Quality', sub: 'Lab & Seller Verified' },
            { icon: 'local_shipping', title: 'Fast Hub Delivery', sub: 'Pan-India Shipping' },
            { icon: 'verified', title: 'Tested Listings', sub: 'Admin Approved Catalog' },
            { icon: 'currency_rupee', title: 'Direct Farm Pricing', sub: 'Best Value in ₹' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow-md border border-outline-variant/50 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
              </div>
              <div>
                <p className="font-bold text-sm text-[#142218]">{item.title}</p>
                <p className="text-xs text-on-surface-variant">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Category Slider (BeejDukan-inspired horizontal slider + counts) */}
      <section className="py-12 px-4 md:px-margin-desktop max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 reveal">
          <div>
            <h2 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-[#142218]">Categories</h2>
            <p className="text-sm text-on-surface-variant">Shop by Category</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollTrack(catSliderRef, -300)}
              className="w-9 h-9 rounded-full bg-white border border-outline-variant shadow-xs flex items-center justify-center hover:border-primary text-on-surface-variant"
              aria-label="Scroll categories left"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => scrollTrack(catSliderRef, 300)}
              className="w-9 h-9 rounded-full bg-white border border-outline-variant shadow-xs flex items-center justify-center hover:border-primary text-on-surface-variant"
              aria-label="Scroll categories right"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
            <Link to="/products" className="ml-2 bg-[#166534] text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1 hover:bg-[#14532d] transition-colors">
              View All <span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
            </Link>
          </div>
        </div>

        <div ref={catSliderRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {mergedCategories.map((cat, index) => {
            const count = getCategoryCount(cat);
            return (
              <button
                type="button"
                key={`${cat.name}-${index}`}
                onClick={() => navigate(cat.route || `/products?category=${encodeURIComponent(cat.name)}`)}
                className="min-w-[145px] flex-shrink-0 bg-white rounded-2xl p-4 border border-outline-variant/60 shadow-xs hover:shadow-md hover:border-primary/60 transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <div className={`w-14 h-14 ${cat.bg} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-2xl" data-icon={cat.icon}>{cat.icon}</span>
                </div>
                <span className="font-bold text-sm text-[#142218] group-hover:text-primary transition-colors line-clamp-1">{cat.label}</span>
                <span className="text-[11px] text-on-surface-variant mt-0.5">
                  {count > 0 ? `${count} Product${count > 1 ? 's' : ''}` : 'Explore'}
                </span>
              </button>
            );
          })}

          {/* Special Highlight Card */}
          <Link
            to="/products"
            className="min-w-[155px] flex-shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 bg-white/25 rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-2xl">local_fire_department</span>
            </div>
            <span className="font-extrabold text-sm">Special Offers</span>
            <span className="text-[11px] text-white/90 mt-0.5">Browse All Deals →</span>
          </Link>
        </div>
      </section>

      {/* Dark Forest Green Featured Products Showcase (BeejDukan-inspired) */}
      <section className="bg-[#143d23] py-14 px-4 md:px-margin-desktop text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 reveal">
            <div>
              <span className="inline-flex items-center gap-1 bg-amber-400 text-[#142218] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                ★ Top Picks
              </span>
              <h2 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-white">Featured Products</h2>
              <p className="text-emerald-100/80 text-sm">Hand-picked essentials for your next cultivation.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollTrack(featSliderRef, -320)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Previous featured products"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => scrollTrack(featSliderRef, 320)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Next featured products"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>

          <div ref={featSliderRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {showcaseProducts.slice(0, 8).map((product) => {
              const discountPct =
                product.originalPrice && product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;
              const isLiveFirestore = !String(product.id).startsWith('featured-');

              return (
                <div
                  key={product.id}
                  onClick={() => navigate(isLiveFirestore ? `/products/${product.id}` : '/products')}
                  className="bg-white text-on-surface rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group flex flex-col cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden bg-[#f4f7f2]">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={product.name}
                      src={product.imageUrl}
                    />
                    <span className="absolute top-3 left-3 bg-[#166534] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                      {product.badge || product.category || 'Best Seller'}
                    </span>
                    {discountPct > 0 && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-full shadow">
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-primary text-xs" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      <span className="text-[11px] font-medium text-on-surface-variant truncate">{product.sellerName || 'Verified Seller'}</span>
                    </div>
                    <h3 className="font-title-lg text-[15px] font-bold text-[#142218] mb-1.5 line-clamp-2 min-h-[42px]">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-3">
                      <span className="material-symbols-outlined text-amber-400 text-sm" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-xs font-bold text-[#142218]">{product.rating || 4.8}</span>
                      <span className="text-[11px] text-on-surface-variant">({product.reviewsCount || 0} reviews)</span>
                    </div>
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="font-headline-md text-xl font-extrabold text-[#166534]">₹{Number(product.price).toFixed(0)}</span>
                        {product.originalPrice && (
                          <span className="text-on-surface-variant line-through text-xs">₹{Number(product.originalPrice).toFixed(0)}</span>
                        )}
                        {discountPct > 0 && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">{discountPct}% OFF</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-full bg-[#166534] hover:bg-[#14532d] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-colors active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm" data-icon="add_shopping_cart">add_shopping_cart</span>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-amber-400 hover:text-[#142218] border border-white/30 text-white px-7 py-3 rounded-full font-bold text-sm transition-all"
            >
              Explore All Products
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Home Gardener Special (Preserved existing section with polished styling) */}
      <section className="py-16 px-4 md:px-margin-desktop relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="reveal">
              <span className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-xs font-bold mb-4 inline-block">
                Curated for You
              </span>
              <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold text-[#166534] mb-4">
                Home Gardener Special
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mb-6 leading-relaxed">
                We believe everyone can grow. Discover our exclusive range of small-quantity packs, DIY herb kits, and balcony-friendly tools designed specifically for the urban gardener.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-outline-variant/60 shadow-xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl" data-icon="inventory_2">inventory_2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#142218]">Small-Quantity Packs</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">Perfect for balcony containers and small plots.</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-outline-variant/60 shadow-xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl" data-icon="card_membership">card_membership</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#142218]">DIY Starter Kits</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">Everything you need for your first harvest.</p>
                  </div>
                </div>
              </div>
              <Link
                to="/products"
                className="mt-7 bg-[#166534] hover:bg-[#14532d] text-white px-7 py-3.5 rounded-full font-bold hover:scale-[0.98] transition-all inline-flex items-center gap-2 shadow-md"
              >
                Explore Home Range
                <span className="material-symbols-outlined" data-icon="trending_flat">trending_flat</span>
              </Link>
            </div>
            <div className="relative reveal" style={{ transitionDelay: '200ms' }}>
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white">
                <img
                  className="w-full h-full object-cover"
                  alt="Home gardener"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHlETcK1ON_Q9mnY98IvvjSzwCasjrRDtTLpEN4mhiKIV7lhLR6gpSYJ4TWsJuEqQiCQ28G1N1ijfP5oq_Bch7onEI58RU2_xv748zSnf6Ypqs-nnK2bU22Q2bnYnVLE6CG6TUTdR8kMaX1SwWsWOHyCXo00auZnuvsYLEnaaCMn2BYHvMJuscJ5_4B3UALoNMtajC14YJkmJJq05WaVK4gYksr2fhfo7NdqIIKFhmKRwKmgVaEHtnKVnfbEUtQPrxKvvf80s_g3A"
                />
                <div className="absolute top-4 left-4 glass-card px-3.5 py-2 rounded-xl flex items-center gap-2 animate-float">
                  <div className="bg-primary-fixed p-1 rounded-lg">
                    <span className="material-symbols-outlined text-primary text-sm" data-icon="spa" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                  </div>
                  <span className="text-xs font-bold text-primary">Organic Certification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us (Preserved existing section) */}
      <section className="py-16 px-4 md:px-margin-desktop bg-[#eef3ec]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 reveal">
            <h2 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-[#142218] mb-2">Why Choose ExVeg</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-sm">Building trust in every seed and tool we deliver.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/50 flex flex-col items-center text-center reveal">
              <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-3xl" data-icon="verified_user">verified_user</span>
              </div>
              <h3 className="font-title-lg text-base font-bold text-[#142218] mb-1.5">Verified Sellers</h3>
              <p className="font-body-md text-xs text-on-surface-variant">Every vendor undergoes a strict multi-point verification process for quality assurance.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/50 flex flex-col items-center text-center reveal" style={{ transitionDelay: '100ms' }}>
              <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-3xl" data-icon="lock">lock</span>
              </div>
              <h3 className="font-title-lg text-base font-bold text-[#142218] mb-1.5">Secure Payments</h3>
              <p className="font-body-md text-xs text-on-surface-variant">Enterprise-grade encryption protecting every transaction you make on our platform.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/50 flex flex-col items-center text-center reveal" style={{ transitionDelay: '200ms' }}>
              <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-3xl" data-icon="local_shipping">local_shipping</span>
              </div>
              <h3 className="font-title-lg text-base font-bold text-[#142218] mb-1.5">Fast Delivery</h3>
              <p className="font-body-md text-xs text-on-surface-variant">Regional hub system ensures your agricultural supplies arrive fresh and on time.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/50 flex flex-col items-center text-center reveal" style={{ transitionDelay: '300ms' }}>
              <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-3xl" data-icon="support_agent">support_agent</span>
              </div>
              <h3 className="font-title-lg text-base font-bold text-[#142218] mb-1.5">Expert Support</h3>
              <p className="font-body-md text-xs text-on-surface-variant">Need advice on what to buy? Our agricultural experts are just a chat away.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
