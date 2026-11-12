import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useSelector } from 'react-redux';
import { useAuthState } from '../hooks/useAuthState';
import LanguageSwitcher from '../components/LanguageSwitcher';

const MainLayout = () => {
  const { user, role } = useAuthState();
  const [headerSearch, setHeaderSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const handleLogout = async () => {
    await signOut(auth);
    setMobileMenuOpen(false);
    navigate('/');
  };

  // After login, Analytics / Profile badge directs user to their role-specific dashboard
  const dashboardLink =
    role === 'Admin'
      ? '/admin-dashboard'
      : role === 'Seller'
        ? '/seller-dashboard'
        : role === 'Buyer'
          ? '/buyer-dashboard'
          : '/analytics';

  const analyticsLink = user ? dashboardLink : '/analytics';

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    const q = headerSearch.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterMsg('Subscribed! Thank you for joining ExVeg updates.');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterMsg(''), 4000);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col overflow-x-hidden">
      {/* Top Promo / Trust Bar (BeejDukan-inspired) */}
      <div className="bg-[#143d23] text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined text-amber-400 text-[15px]">eco</span>
            <span>India&apos;s Trusted Agricultural Marketplace • Lab-Tested Seeds &amp; Verified Sellers</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-emerald-100">
            <Link to="/products" className="hover:text-amber-300 transition-colors font-semibold">Shop Marketplace</Link>
            <span>•</span>
            <Link to="/register" className="hover:text-amber-300 transition-colors font-semibold">Become a Seller</Link>
          </div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-outline-variant/60 w-full sticky top-0 shadow-sm z-50">
        <nav className="flex justify-between items-center w-full px-4 md:px-margin-desktop py-3 max-w-7xl mx-auto gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#166534] to-[#2e7d32] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
              </div>
              <div>
                <span className="font-headline-md text-xl font-extrabold text-[#166534] tracking-tight block leading-none">ExVeg</span>
                <span className="text-[10px] font-medium text-on-surface-variant tracking-wide">Let&apos;s grow smarter together</span>
              </div>
            </Link>
          </div>

          {/* Search Pill (Desktop) */}
          <form onSubmit={handleHeaderSearch} className="hidden lg:flex items-center flex-1 max-w-sm bg-[#f4f7f2] border border-outline-variant rounded-full pl-4 pr-1.5 py-1 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">search</span>
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Search seeds, tools, categories..."
              className="w-full bg-transparent text-sm text-on-surface focus:outline-none placeholder:text-on-surface-variant/70"
            />
            <button type="submit" className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-[#14532d] transition-colors">
              Search
            </button>
          </form>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-5 text-sm">
            <Link
              to="/products"
              className={`font-semibold pb-1 transition-colors duration-200 ${isActive('/products') ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Marketplace
            </Link>
            <Link
              to="/nursery"
              className={`font-semibold pb-1 transition-colors duration-200 ${isActive('/nursery') ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Nursery
            </Link>
            <Link
              to="/tools"
              className={`font-semibold pb-1 transition-colors duration-200 ${isActive('/tools') ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Tools
            </Link>
            <Link
              to={analyticsLink}
              className={`font-semibold pb-1 transition-colors duration-200 ${isActive('/analytics') || isActive('/buyer-dashboard') ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Analytics
            </Link>
            {role === 'Admin' && (
              <Link to="/admin-dashboard" className="text-primary font-bold flex items-center gap-1 bg-secondary-container/70 px-3 py-1.5 rounded-full hover:bg-secondary-container transition-colors text-xs">
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                Admin Dashboard
              </Link>
            )}
            {role === 'Seller' && (
              <Link to="/seller-dashboard" className="text-primary font-bold flex items-center gap-1 bg-secondary-container/70 px-3 py-1.5 rounded-full hover:bg-secondary-container transition-colors text-xs">
                <span className="material-symbols-outlined text-sm">storefront</span>
                Vendor Portal
              </Link>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Hindi / English Toggle + Indian Languages Dropdown */}
            <div className="hidden sm:flex items-center">
              <LanguageSwitcher compact />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <Link to="/notifications" className="p-2 rounded-full hover:bg-surface-container transition-colors" title="Notifications">
                <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors text-[22px]" data-icon="notifications">notifications</span>
              </Link>
              {user ? (
                <div className="flex items-center gap-2 bg-[#f4f7f2] border border-outline-variant/60 px-2.5 py-1 rounded-full">
                  <Link to={dashboardLink} className="text-xs font-bold text-primary flex items-center gap-1.5">
                    {role && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold uppercase">{role}</span>}
                    <span className="hidden sm:inline max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                  </Link>
                  <span onClick={handleLogout} title="Sign Out" className="material-symbols-outlined text-on-surface-variant hover:text-error cursor-pointer transition-colors text-[18px]" data-icon="logout">logout</span>
                </div>
              ) : (
                <Link to="/login" className="p-2 rounded-full hover:bg-surface-container transition-colors" title="Sign In">
                  <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors text-[22px]" data-icon="account_circle">account_circle</span>
                </Link>
              )}
              {/* Cart with badge */}
              <Link to="/cart" className="relative p-2 rounded-full hover:bg-surface-container transition-colors" title="Cart">
                <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors text-[22px]" data-icon="shopping_cart">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-amber-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none shadow">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
            {!user && (
              <Link to="/register" className="hidden sm:inline-block bg-gradient-to-r from-[#166534] to-[#15803d] text-white px-5 py-2 rounded-full text-sm font-bold hover:shadow-md hover:scale-[0.98] transition-all text-center">
                Register
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg border border-outline-variant text-on-surface"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-outline-variant bg-white px-4 py-4 space-y-3">
            <div className="sm:hidden pb-2 border-b border-outline-variant/40 flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant">Language:</span>
              <LanguageSwitcher />
            </div>
            <form onSubmit={handleHeaderSearch} className="flex items-center bg-[#f4f7f2] border border-outline-variant rounded-full pl-3 pr-1 py-1">
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search products or categories..."
                className="w-full bg-transparent text-sm focus:outline-none"
              />
              <button type="submit" className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">Go</button>
            </form>
            <div className="flex flex-col gap-2 text-sm font-semibold">
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-primary">Marketplace</Link>
              <Link to="/nursery" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-primary">Nursery</Link>
              <Link to="/tools" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-primary">Tools</Link>
              <Link to={analyticsLink} onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-primary">Analytics</Link>
              {role === 'Admin' && (
                <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)} className="py-1.5 text-primary font-bold">Admin Dashboard</Link>
              )}
              {role === 'Seller' && (
                <Link to="/seller-dashboard" onClick={() => setMobileMenuOpen(false)} className="py-1.5 text-primary font-bold">Vendor Portal</Link>
              )}
              {!user && (
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="py-2 bg-primary text-white text-center rounded-lg font-bold">Register</Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* Footer (BeejDukan-inspired rich deep forest green footer) */}
      <footer className="bg-gradient-to-b from-[#165b33] to-[#0f3f22] text-emerald-50 font-body-md text-body-md w-full mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 md:px-margin-desktop py-14 max-w-7xl mx-auto">
          <div className="col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-300 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
              </div>
              <span className="font-headline-lg text-2xl font-extrabold text-white block">ExVeg</span>
            </div>
            <p className="text-emerald-100/85 text-sm leading-relaxed mb-6">
              Cultivating growth through technology. Connecting the heart of farming with the pulse of modern retail.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-emerald-200">
              <span className="bg-white/10 px-3 py-1 rounded-full">✓ Verified Sellers</span>
              <span className="bg-white/10 px-3 py-1 rounded-full">✓ Pan-India</span>
            </div>
          </div>
          <div>
            <h4 className="font-title-lg text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/80">
              <li><Link to="/products" className="hover:text-amber-300 transition-colors">About Us</Link></li>
              <li><Link to="/register" className="hover:text-amber-300 transition-colors">Seller Hub</Link></li>
              <li><Link to="/nursery" className="hover:text-amber-300 transition-colors">Sustainability</Link></li>
              <li><Link to="/tools" className="hover:text-amber-300 transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-title-lg text-white font-bold mb-4">Legal &amp; Support</h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/80">
              <li><Link to="#" className="hover:text-amber-300 transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-amber-300 transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-amber-300 transition-colors">Contact Support</Link></li>
              <li><Link to="#" className="hover:text-amber-300 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-title-lg text-white font-bold mb-4">Newsletter</h4>
            <p className="font-label-sm text-emerald-100/80 mb-4 leading-relaxed">
              Join our mailing list for weekly gardening tips and exclusive vendor deals.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col gap-2.5">
              <input
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="bg-white/95 text-on-surface border border-white/20 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Enter your email"
                type="email"
              />
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-[#142218] py-2.5 rounded-xl font-bold text-sm transition-colors shadow">
                Subscribe
              </button>
              {newsletterMsg && <p className="text-xs text-amber-300 font-semibold">{newsletterMsg}</p>}
            </form>
          </div>
        </div>
        <div className="px-6 md:px-margin-desktop py-5 border-t border-white/15 bg-black/15 text-center text-emerald-100/80 font-label-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} ExVeg. All rights reserved.</span>
            <span className="text-xs text-emerald-200/80">✓ Tested Seeds &nbsp;•&nbsp; ✓ Verified Sellers &nbsp;•&nbsp; ✓ Expert Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
