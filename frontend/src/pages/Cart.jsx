import axios from 'axios';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice';
import { useToast } from '../context/ToastContext';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getApiBaseUrl } from '../utils/api';

const Cart = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    buyerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    deliveryDate: '',
    notes: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemsLabel = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Build cart summary string for email (including product + seller details)
  const buildCartSummary = () =>
    cartItems.map((item) =>
      `- ${item.name} (Seller: ${item.sellerName || 'Verified Seller'}${item.sellerEmail ? ` <${item.sellerEmail}>` : ''}) x${item.quantity} @ ₹${item.price.toFixed(2)} = ₹${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      showToast({ message: 'Your cart is empty!', type: 'error' });
      return;
    }
    if (!auth.currentUser) {
      const msg = 'Please log in to your account before placing an order.';
      setStatus({ type: 'error', message: msg });
      showToast({ message: msg, type: 'error' });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const sellerIds = [...new Set(cartItems.map((item) => item.sellerId).filter(Boolean))];
      const primarySellerName = [...new Set(cartItems.map((i) => i.sellerName).filter(Boolean))].join(', ') || 'Verified Seller';
      const sellerEmails = [...new Set(cartItems.map((i) => i.sellerEmail).filter(Boolean))];
      const primarySellerEmail = sellerEmails[0] || '';

      // 1. Write order directly to Firestore so buyer/seller/admin orders always work
      const orderData = {
        buyerId: auth.currentUser.uid,
        buyerName: form.buyerName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        deliveryDate: form.deliveryDate,
        notes: form.notes,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl || '',
          category: item.category || '',
          sellerId: item.sellerId || '',
          sellerName: item.sellerName || 'Verified Seller',
          sellerEmail: item.sellerEmail || '',
        })),
        totalAmount: parseFloat(subtotal.toFixed(2)),
        itemCount: itemsLabel,
        sellerId: cartItems[0]?.sellerId || 'unknown',
        sellerIds,
        sellerEmail: primarySellerEmail,
        sellerName: primarySellerName,
        status: 'Placed',
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setPlacedOrderId(docRef.id);

      // 2. Notify backend email service (works locally via :5000 and on Vercel via /api/checkout)
      try {
        await axios.post(`${getApiBaseUrl()}/api/checkout`, {
          orderId: docRef.id,
          buyerName: form.buyerName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          deliveryDate: form.deliveryDate,
          notes: form.notes,
          items: orderData.items,
          cartSummary: buildCartSummary(),
          totalAmount: subtotal.toFixed(2),
          itemCount: itemsLabel,
          sellerName: primarySellerName,
          sellerEmail: primarySellerEmail,
          sellerEmails,
          adminEmail: 'exvegcompany@gmail.com',
        }, { timeout: 8000 });
      } catch (backendErr) {
        console.info('Backend email notification note:', backendErr.message);
      }

      showToast({ message: 'Order placed successfully!', type: 'success' });
      dispatch(clearCart());
      setOrderPlaced(true);
    } catch (error) {
      console.error('Order creation error:', error);
      const msg = error.code === 'permission-denied'
        ? 'Unable to save order: Firestore permissions denied. Please ensure firestore.rules are published.'
        : (error.message || 'Unable to submit checkout. Please try again.');
      setStatus({ type: 'error', message: msg });
      showToast({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty cart state
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-primary-fixed flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-5xl">shopping_cart</span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface">Your cart is empty</h2>
        <p className="text-on-surface-variant text-body-md text-center max-w-[28rem]">Browse our marketplace and add products to your cart to get started.</p>
        <Link to="/products" className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
          Shop Now
        </Link>
      </div>
    );
  }

  // Order success state
  if (orderPlaced) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-bounce mx-auto">
          <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Order Placed Successfully!</h2>
        {placedOrderId && (
          <p className="font-mono text-sm bg-surface-container px-3 py-1.5 rounded-lg inline-block text-on-surface-variant">
            Order Reference: <strong className="text-primary">{placedOrderId}</strong>
          </p>
        )}
        <p className="text-on-surface-variant text-body-md max-w-[28rem] mx-auto">
          Thank you for your order, <strong>{form.buyerName}</strong>. A confirmation has been registered to <strong>{form.email}</strong> and the seller has been notified.
        </p>
        <div className="flex gap-4 mt-2 justify-center">
          <Link to="/products" className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
            Continue Shopping
          </Link>
          <Link to="/analytics" className="border border-outline px-6 py-3 rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed">
          <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Your Cart</h1>
          <p className="text-on-surface-variant text-sm">{itemsLabel} item{itemsLabel !== 1 ? 's' : ''} · ₹{subtotal.toFixed(2)} total</p>
        </div>
        <button
          onClick={() => { dispatch(clearCart()); showToast({ message: 'Cart cleared.', type: 'info' }); }}
          className="ml-auto text-sm text-error hover:underline font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* Left: Cart Items + Checkout Form */}
        <div className="space-y-6">
          {/* Cart Items List */}
          <div className="rounded-2xl border border-outline-variant bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low">
              <h2 className="font-title-lg text-on-surface font-bold">Items in Cart</h2>
            </div>
            <ul className="divide-y divide-outline-variant">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-outline-variant" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-on-surface text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-on-surface-variant text-xs">{item.sellerName}</p>
                    <p className="text-primary font-bold text-sm mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  {/* Qty controls */}
                  <div className="flex items-center gap-1 border border-outline rounded-lg overflow-hidden">
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                      className="p-1.5 hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                      className="p-1.5 hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                  <button
                    onClick={() => { dispatch(removeFromCart(item.id)); showToast({ message: `${item.name} removed`, type: 'info' }); }}
                    className="p-1.5 text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Checkout Form */}
          <div className="rounded-2xl border border-outline-variant bg-white shadow-sm p-6">
            <h2 className="font-title-lg text-on-surface font-bold mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              Delivery Details
            </h2>
            <form id="checkout-form" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-on-surface">
                  Full Name *
                  <input name="buyerName" value={form.buyerName} onChange={handleChange} required className="rounded-lg border border-outline-variant px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="John Doe" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-on-surface">
                  Email *
                  <input type="email" name="email" value={form.email} onChange={handleChange} required className="rounded-lg border border-outline-variant px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="john@example.com" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-on-surface">
                  Phone *
                  <input name="phone" value={form.phone} onChange={handleChange} required className="rounded-lg border border-outline-variant px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="+91 98765 43210" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-on-surface">
                  Preferred Delivery Date *
                  <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} className="rounded-lg border border-outline-variant px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-on-surface md:col-span-2">
                  Delivery Address *
                  <textarea name="address" value={form.address} onChange={handleChange} required rows="2" className="rounded-lg border border-outline-variant px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="House no., Street, Landmark" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-on-surface">
                  City *
                  <input name="city" value={form.city} onChange={handleChange} required className="rounded-lg border border-outline-variant px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-on-surface">
                  State *
                  <input name="state" value={form.state} onChange={handleChange} required className="rounded-lg border border-outline-variant px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-on-surface">
                  Pincode *
                  <input name="pincode" value={form.pincode} onChange={handleChange} required className="rounded-lg border border-outline-variant px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-on-surface">
                  Delivery Notes
                  <input name="notes" value={form.notes} onChange={handleChange} className="rounded-lg border border-outline-variant px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Gate code, landmarks, fragile…" />
                </label>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-low shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-on-surface mb-5">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-on-surface-variant">
                  <span className="line-clamp-1 max-w-[60%]">{item.name} <span className="text-xs">×{item.quantity}</span></span>
                  <span className="font-semibold text-on-surface">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-outline-variant pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">₹{subtotal.toFixed(2)}</span>
            </div>

            {status.message && (
              <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${status.type === 'success' ? 'border-primary/30 bg-primary-container text-on-primary-container' : 'border-error/30 bg-error-container text-on-error-container'}`}>
                {status.message}
              </div>
            )}

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting || cartItems.length === 0}
              className="mt-6 w-full rounded-xl bg-primary px-5 py-4 font-bold text-white hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">{isSubmitting ? 'hourglass_empty' : 'send'}</span>
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>

            <p className="mt-3 text-xs text-center text-on-surface-variant">
              Order confirmation & seller notification sent via email.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                Seller notified via email
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary">admin_panel_settings</span>
                Admin receives order copy
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary">local_shipping</span>
                Buyer gets delivery info
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
