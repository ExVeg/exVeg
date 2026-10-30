import { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [role, setRole] = useState('Buyer');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', mobile: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register attempt:', { role, ...formData });
    // TODO: integrate with backend
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] p-4">
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-lg border border-outline-variant/30 w-full max-w-lg">
        <h2 className="text-3xl font-display-lg text-center text-primary mb-6">Create an Account</h2>
        
        <div className="flex justify-center space-x-4 mb-6">
          <button 
            className={`px-4 py-2 rounded-md font-semibold transition ${role === 'Buyer' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
            onClick={() => setRole('Buyer')}
          >
            Buyer
          </button>
          <button 
            className={`px-4 py-2 rounded-md font-semibold transition ${role === 'Seller' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
            onClick={() => setRole('Seller')}
          >
            Seller
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Full Name {role === 'Seller' && '/ Business Name'}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+91 98765 43210"
            />
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
          
          {role === 'Seller' && (
             <div className="p-4 bg-tertiary-fixed text-on-tertiary-fixed text-sm rounded-lg border border-tertiary-fixed-dim">
               Note: Sellers will need to provide GST and Bank details after initial registration.
             </div>
          )}

          <button type="submit" className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-primary/90 transition shadow-md mt-4">
            Register as {role}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-on-surface-variant">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
