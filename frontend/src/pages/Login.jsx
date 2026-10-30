import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'Buyer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      console.log('Login successful');
      if (formData.role === 'Admin') {
        if (formData.email !== 'sumit2325888@gmail.com') {
           setError('Unauthorized: You are not an admin.');
           auth.signOut();
           setLoading(false);
           return;
        }
        navigate('/admin-dashboard');
      } else if (formData.role === 'Seller') {
        navigate('/seller-dashboard');
      } else {
        navigate('/products'); // Route Buyer to Marketplace
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] p-4">
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-lg border border-outline-variant/30 w-full max-w-[32rem]">
        <h2 className="text-3xl font-display-lg text-center text-primary mb-6">Welcome Back</h2>
        {error && <div className="bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-sm font-label-md">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Login as</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
            >
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-primary/90 transition shadow-md mt-4 disabled:opacity-50">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-on-surface-variant">
          Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
