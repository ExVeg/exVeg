import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useSelector } from 'react-redux';

const MainLayout = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const cartCount = useSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const snap = await getDoc(doc(db, 'users', currentUser.uid));
          if (snap.exists()) {
            setRole(snap.data().role ?? 'Buyer');
          } else {
            setRole('Buyer');
          }
        } catch {
          setRole('Buyer');
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const dashboardLink = role === 'Admin' ? '/admin-dashboard' : role === 'Seller' ? '/seller-dashboard' : '/products';

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-surface/80 backdrop-blur-md dark:bg-surface-container/80 font-title-lg text-title-lg w-full sticky top-0 shadow-sm z-50">
        <nav className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-base">
            <Link to="/" className="font-headline-md text-headline-md font-black text-primary">ExVeg</Link>
          </div>
          <div className="hidden md:flex items-center gap-lg">
            <Link to="/products" className="text-primary font-bold border-b-2 border-primary pb-1">Marketplace</Link>
            <Link to="/nursery" className="text-on-surface-variant hover:text-primary transition-colors duration-200">Nursery</Link>
            <Link to="/tools" className="text-on-surface-variant hover:text-primary transition-colors duration-200">Tools</Link>
            <Link to="/analytics" className="text-on-surface-variant hover:text-primary transition-colors duration-200">Analytics</Link>
            {role === 'Admin' && (
              <Link to="/admin-dashboard" className="text-primary font-bold flex items-center gap-1 hover:text-primary/80 transition-colors">
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                Admin Dashboard
              </Link>
            )}
            {role === 'Seller' && (
              <Link to="/seller-dashboard" className="text-primary font-bold flex items-center gap-1 hover:text-primary/80 transition-colors">
                <span className="material-symbols-outlined text-sm">storefront</span>
                Vendor Portal
              </Link>
            )}
          </div>
          <div className="flex items-center gap-md">
            <div className="hidden md:flex items-center gap-sm">
              <Link to="/notifications">
                <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors" data-icon="notifications">notifications</span>
              </Link>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to={dashboardLink} className="text-sm font-bold text-primary flex items-center gap-1">
                    {role && <span className="text-[10px] bg-primary-container text-on-primary-container px-1.5 py-0.5 rounded font-bold uppercase">{role}</span>}
                    {user.email.split('@')[0]}
                  </Link>
                  <span onClick={handleLogout} className="material-symbols-outlined text-on-surface-variant hover:text-error cursor-pointer transition-colors" data-icon="logout">logout</span>
                </div>
              ) : (
                <Link to="/login">
                  <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors" data-icon="account_circle">account_circle</span>
                </Link>
              )}
              {/* Cart with badge */}
              <Link to="/cart" className="relative">
                <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors" data-icon="shopping_cart">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
            {!user && (
              <Link to="/register" className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:scale-95 transition-transform duration-150 inline-block text-center">
                Register
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest dark:bg-inverse-surface font-body-md text-body-md border-t border-outline-variant w-full mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-desktop py-xl max-w-7xl mx-auto">
          <div className="col-span-1 md:col-span-1">
            <span className="font-headline-lg text-headline-lg text-primary block mb-md">ExVeg</span>
            <p className="text-on-surface-variant mb-lg">Cultivating growth through technology. Connecting the heart of farming with the pulse of modern retail.</p>
          </div>
          <div>
            <h4 className="font-title-lg text-on-surface mb-md">Quick Links</h4>
            <ul className="space-y-sm text-on-surface-variant">
              <li><Link to="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Seller Hub</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Sustainability</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-title-lg text-on-surface mb-md">Legal &amp; Support</h4>
            <ul className="space-y-sm text-on-surface-variant">
              <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-title-lg text-on-surface mb-md">Newsletter</h4>
            <p className="font-label-sm text-on-surface-variant mb-md">Join our mailing list for weekly gardening tips and exclusive vendor deals.</p>
            <div className="flex flex-col gap-sm">
              <input className="bg-white border border-outline px-md py-2 rounded-lg focus:outline-none focus:border-primary" placeholder="Enter your email" type="email" />
              <button className="bg-primary text-on-primary py-2 rounded-lg font-bold">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="px-margin-desktop py-md border-t border-outline-variant/30 text-center text-on-surface-variant font-label-sm">
          © {new Date().getFullYear()} ExVeg. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
