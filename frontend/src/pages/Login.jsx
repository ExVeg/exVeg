import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'Buyer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const resetCooldownRef = useRef(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = credential.user.uid;
      const email = credential.user.email?.toLowerCase() || '';

      // Determine authoritative role from Firestore /users/{uid}
      const isKnownAdminEmail =
        email === 'sumit2325888@gmail.com' ||
        email === 'exvegcompany@gmail.com' ||
        email.startsWith('admin@');

      let userRole = null;
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists() && snap.data().role) {
          const r = String(snap.data().role).trim();
          userRole = r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
        } else {
          userRole = isKnownAdminEmail ? 'Admin' : (formData.role === 'Seller' ? 'Seller' : 'Buyer');
          await setDoc(doc(db, 'users', uid), {
            email: formData.email,
            role: userRole,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (firestoreErr) {
        console.warn('Firestore user fetch note:', firestoreErr);
        userRole = isKnownAdminEmail ? 'Admin' : (formData.role === 'Seller' ? 'Seller' : 'Buyer');
      }

      if (formData.role === 'Admin' && userRole !== 'Admin') {
        setError('This account does not have Administrator privileges.');
        setLoading(false);
        return;
      }

      if (userRole === 'Admin') {
        navigate('/admin-dashboard');
      } else if (userRole === 'Seller') {
        navigate('/seller-dashboard');
      } else {
        navigate('/products');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later or reset your password.');
      } else {
        setError('Login failed: ' + err.message);
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (resetCooldownRef.current) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      setResetError('Please enter a valid email address.');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetMessage('');

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetMessage(
        'If this email is registered, you will receive a password reset link shortly. Please also check your spam folder.'
      );
      resetCooldownRef.current = true;
      setTimeout(() => { resetCooldownRef.current = false; }, 60000); // 60s cooldown
    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        setResetError('Too many requests. Please wait a moment before trying again.');
      } else {
        setResetMessage(
          'If this email is registered, you will receive a password reset link shortly. Please also check your spam folder.'
        );
      }
    }
    setResetLoading(false);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetEmail('');
    setResetMessage('');
    setResetError('');
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-[75vh] px-4 py-10 bg-gradient-to-b from-[#f4f7f2] to-[#f8faf5]">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-outline-variant/40 w-full max-w-[30rem]">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#166534] to-[#2e7d32] flex items-center justify-center shadow-md mb-3">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full mb-2">
              ExVeg Member Portal
            </span>
            <h2 className="text-3xl font-display-lg font-extrabold text-center text-[#143d23]">Welcome Back</h2>
            <p className="text-sm text-on-surface-variant mt-1">Sign in to manage orders, products, and analytics</p>
          </div>
          {error && <div className="bg-error-container text-on-error-container p-3 rounded-xl mb-4 text-sm font-label-md">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-label-md text-on-surface-variant mb-1.5">Login as</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-[#f8faf5] text-on-surface font-body-md"
              >
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block font-label-md text-on-surface-variant mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl bg-[#f8faf5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block font-label-md text-on-surface-variant mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl bg-[#f8faf5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-primary hover:underline font-label-md"
              >
                Forgot Password?
              </button>
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-gradient-to-r from-[#166534] to-[#15803d] text-white font-bold py-3.5 rounded-xl hover:shadow-lg active:scale-[0.99] transition-all mt-4 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 pt-5 border-t border-outline-variant/40 text-center text-sm text-on-surface-variant">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register here</Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeForgotModal}>
          <div
            className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-[28rem] min-w-[300px] p-8 relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-headline-md text-primary">Reset Password</h3>
              <button
                onClick={closeForgotModal}
                className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors"
              >
                close
              </button>
            </div>
            <p className="text-on-surface-variant font-body-md mb-6">
              Enter your registered email address and we'll send you a link to reset your password.
            </p>

            {resetMessage ? (
              <div className="bg-primary/10 border border-primary/30 text-primary rounded-lg p-4 text-sm font-label-md">
                <span className="material-symbols-outlined align-middle mr-1 text-sm">check_circle</span>
                {resetMessage}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {resetError && (
                  <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm font-label-md">
                    {resetError}
                  </div>
                )}
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1">Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-primary/90 transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            )}

            <div className="mt-4 text-center">
              <button onClick={closeForgotModal} className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                Back to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
