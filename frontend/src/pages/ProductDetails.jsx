import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { addToCart } from '../store/cartSlice';
import { useToast } from '../context/ToastContext';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setProduct(data);
          setActiveImage(data.imageUrl);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity,
      sellerId: product.sellerId || '',
      sellerEmail: product.sellerEmail || '',
      sellerName: product.sellerName || 'Verified Seller',
      category: product.category || '',
    }));
    setAddedToCart(true);
    showToast({ message: `"${product.name}" added to cart!`, type: 'success' });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant">search_off</span>
        <h2 className="font-headline-md text-headline-md text-on-surface">Product not found</h2>
        <Link to="/products" className="text-primary font-semibold hover:underline">← Back to Marketplace</Link>
      </div>
    );
  }

  const thumbnails = [product.imageUrl, ...(product.thumbnails || [])].filter(Boolean).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-base">
        <Link className="hover:text-primary" to="/products">Marketplace</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant">{product.category || 'Product'}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-semibold line-clamp-1">{product.name}</span>
      </nav>

      {/* Product Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-gutter">
          {/* Thumbnails */}
          <div className="order-2 md:order-1 flex md:flex-col gap-sm overflow-x-auto md:overflow-y-auto hide-scrollbar max-h-[600px]">
            {thumbnails.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(src)}
                className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden hover:border-primary transition-colors ${activeImage === src ? 'border-primary shadow-sm' : 'border-outline-variant'}`}
              >
                <img className="w-full h-full object-cover" src={src} alt="thumbnail" />
              </button>
            ))}
          </div>
          {/* Main Preview */}
          <div className="order-1 md:order-2 flex-grow bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm relative">
            <img className="w-full h-full object-cover" src={activeImage} alt={product.name} />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-secondary text-white text-label-sm px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Verified Product
              </span>
              {product.originalPrice && (
                <span className="bg-tertiary text-white text-label-sm px-3 py-1 rounded-full shadow-md">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="mb-gutter">
            <h1 className="font-headline-lg text-headline-lg mb-2 text-on-surface">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center text-[#FFA000]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${star <= Math.round(product.rating || 4) ? 1 : 0}` }}>star</span>
                ))}
                <span className="text-on-surface ml-2 font-semibold">{product.rating || '4.5'}</span>
              </div>
              <span className="text-on-surface-variant text-label-md">({product.reviewsCount || 0} Reviews)</span>
              <span className="text-primary font-bold text-label-md">Verified Seller</span>
            </div>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-bold text-on-surface">₹{Number(product.price).toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-on-surface-variant line-through mb-1">₹{Number(product.originalPrice).toFixed(2)}</span>
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg text-label-sm font-bold mb-1">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-on-surface-variant text-body-md mb-gutter leading-relaxed">{product.description}</p>
            <div className="flex items-center gap-2 mb-gutter">
              <span className="material-symbols-outlined text-secondary">inventory_2</span>
              <span className="text-label-md font-semibold text-secondary">
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Product Controls */}
          <div className="space-y-gutter">
            <div className="flex items-center gap-gutter">
              <div className="flex items-center border border-outline rounded-lg overflow-hidden">
                <button className="p-3 hover:bg-surface-container transition-colors flex items-center justify-center" onClick={decrement}>
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <input className="w-16 text-center border-none focus:ring-0 font-bold bg-transparent" readOnly type="number" value={quantity} />
                <button className="p-3 hover:bg-surface-container transition-colors flex items-center justify-center" onClick={increment}>
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-grow flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all
                  ${addedToCart
                    ? 'bg-secondary text-white scale-95'
                    : 'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="material-symbols-outlined">{addedToCart ? 'check' : 'shopping_cart'}</span>
                {addedToCart ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-lg hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {/* Seller Info Card */}
          <div className="mt-xl p-6 bg-surface-container-low rounded-2xl border border-outline-variant">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">agriculture</span>
                </div>
                <div>
                  <h3 className="font-title-lg text-title-lg">{product.sellerName || 'Verified Seller'}</h3>
                  <p className="text-label-sm text-on-surface-variant">Certified ExVeg Partner</p>
                </div>
              </div>
              <span className="bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase px-2 py-1 rounded tracking-widest">Verified</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg bg-surface">
                <p className="text-label-sm text-on-surface-variant">Rating</p>
                <p className="font-bold text-primary">{product.rating || '4.5'}/5</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-surface">
                <p className="text-label-sm text-on-surface-variant">Category</p>
                <p className="font-bold text-primary text-xs">{product.category || 'General'}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-surface">
                <p className="text-label-sm text-on-surface-variant">Stock</p>
                <p className="font-bold text-primary">{product.stock || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
