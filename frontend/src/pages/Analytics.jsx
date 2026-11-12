import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from '../hooks/useAuthState';

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, iconBg = 'bg-primary-fixed', iconColor = 'text-primary' }) => (
  <div className="bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
    <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <span className={`material-symbols-outlined ${iconColor} text-2xl`}>{icon}</span>
    </div>
    <div>
      <p className="text-on-surface-variant font-label-md text-xs uppercase tracking-wide">{label}</p>
      <p className="font-headline-md text-2xl font-extrabold text-[#143d23] mt-0.5">{value}</p>
      {sub && <p className="text-xs text-on-surface-variant mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Category Bar Chart ─────────────────────────────────────────────────────────
const CategoryBar = ({ label, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-sm text-on-surface-variant truncate">{label}</span>
      <div className="flex-1 bg-surface-container-high rounded-full h-2.5 overflow-hidden">
        <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold text-on-surface w-8 text-right">{count}</span>
    </div>
  );
};

// ── Seller Analytics ───────────────────────────────────────────────────────────
const SellerAnalytics = ({ uid }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const productsSnap = await getDocs(
          query(collection(db, 'products'), where('sellerId', '==', uid))
        );
        const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const nurserySnap = await getDocs(
          query(collection(db, 'nursery'), where('sellerId', '==', uid))
        );
        const nursery = nurserySnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const toolsSnap = await getDocs(
          query(collection(db, 'tools'), where('sellerId', '==', uid))
        );
        const tools = toolsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const all = [...products, ...nursery, ...tools];
        const pending = all.filter(p => p.status === 'Pending').length;
        const approved = all.filter(p => p.status === 'Approved').length;
        const totalInventory = all.reduce((s, p) => s + (p.stock || 0), 0);

        // Orders
        const ordersSnap = await getDocs(
          query(collection(db, 'orders'), where('sellerId', '==', uid))
        );
        const orders = ordersSnap.docs.map(d => d.data());
        const totalOrders = orders.length;
        const revenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

        // Category breakdown
        const catMap = {};
        all.forEach(p => {
          const c = p.category || 'Other';
          catMap[c] = (catMap[c] || 0) + 1;
        });

        setData({ total: all.length, pending, approved, totalInventory, totalOrders, revenue, catMap });
      } catch (err) {
        console.error('Error fetching seller analytics:', err);
      }
      setLoading(false);
    };
    fetch();
  }, [uid]);

  if (loading) return <div className="py-20 flex items-center justify-center gap-3 text-on-surface-variant"><div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /> Loading analytics...</div>;
  if (!data) return <div className="py-10 text-center text-on-surface-variant">Could not load analytics data.</div>;

  const catEntries = Object.entries(data.catMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        <StatCard icon="inventory_2" label="Total Products Listed" value={data.total} />
        <StatCard icon="pending_actions" label="Pending Approval" value={data.pending} iconBg="bg-tertiary-fixed" iconColor="text-tertiary" />
        <StatCard icon="check_circle" label="Approved & Live" value={data.approved} iconBg="bg-secondary-container" iconColor="text-secondary" />
        <StatCard icon="warehouse" label="Total Inventory (units)" value={data.totalInventory.toLocaleString()} />
        <StatCard icon="shopping_bag" label="Total Orders" value={data.totalOrders} />
        <StatCard icon="payments" label="Estimated Revenue" value={`₹${data.revenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} iconBg="bg-primary-container" />
      </div>

      {catEntries.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="font-title-lg text-on-surface mb-md">Product Category Breakdown</h3>
          <div className="space-y-3">
            {catEntries.map(([cat, count]) => (
              <CategoryBar key={cat} label={cat} count={count} total={data.total} />
            ))}
          </div>
        </div>
      )}

      {data.total === 0 && (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl block mb-4">inventory_2</span>
          <p className="font-bold">No products listed yet.</p>
          <p className="text-sm">Start by adding products from the Seller Dashboard, Nursery, or Tools pages.</p>
        </div>
      )}
    </div>
  );
};

// ── Buyer Analytics ────────────────────────────────────────────────────────────
const BuyerAnalytics = ({ uid }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'orders'), where('buyerId', '==', uid))
        );
        const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const total = orders.length;
        const totalSpend = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        const recent = orders
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 5);
        const statuses = {};
        orders.forEach(o => { const s = o.status || 'Placed'; statuses[s] = (statuses[s] || 0) + 1; });
        setData({ total, totalSpend, recent, statuses });
      } catch (err) {
        console.error('Error fetching buyer analytics:', err);
      }
      setLoading(false);
    };
    fetch();
  }, [uid]);

  if (loading) return <div className="py-20 flex items-center justify-center gap-3 text-on-surface-variant"><div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /> Loading analytics...</div>;
  if (!data) return <div className="py-10 text-center text-on-surface-variant">Could not load analytics data.</div>;

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        <StatCard icon="shopping_bag" label="Total Purchases" value={data.total} />
        <StatCard icon="payments" label="Total Spend" value={`₹${data.totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} />
        <StatCard icon="local_shipping" label="Orders in Transit" value={data.statuses['Shipped'] || 0} iconBg="bg-secondary-container" iconColor="text-secondary" />
      </div>

      {/* Order Status Summary */}
      {Object.keys(data.statuses).length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="font-title-lg text-on-surface mb-md">Order Status Summary</h3>
          <div className="space-y-3">
            {Object.entries(data.statuses).map(([status, count]) => (
              <CategoryBar key={status} label={status} count={count} total={data.total} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {data.recent.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="font-title-lg text-on-surface mb-md">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase">
                <tr>
                  <th className="px-md py-3">Order ID</th>
                  <th className="px-md py-3">Date</th>
                  <th className="px-md py-3">Amount</th>
                  <th className="px-md py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {data.recent.map(order => (
                  <tr key={order.id} className="hover:bg-surface-container-low">
                    <td className="px-md py-3 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                    <td className="px-md py-3 text-sm text-on-surface-variant">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-md py-3 font-bold">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-md py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{order.status || 'Placed'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.total === 0 && (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl block mb-4">shopping_bag</span>
          <p className="font-bold">No orders yet.</p>
          <p className="text-sm">Browse the marketplace and place your first order to see analytics here.</p>
        </div>
      )}
    </div>
  );
};

// ── Admin Analytics ────────────────────────────────────────────────────────────
const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [
          productsSnap, nurserySnap, toolsSnap,
          usersSnap, ordersSnap
        ] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'nursery')),
          getDocs(collection(db, 'tools')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'orders')),
        ]);

        const products = productsSnap.docs.map(d => d.data());
        const nursery = nurserySnap.docs.map(d => d.data());
        const tools = toolsSnap.docs.map(d => d.data());
        const all = [...products, ...nursery, ...tools];

        const users = usersSnap.docs.map(d => d.data());
        const sellers = users.filter(u => u.role === 'Seller').length;
        const buyers = users.filter(u => u.role === 'Buyer').length;

        const orders = ordersSnap.docs.map(d => d.data());
        const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

        const catMap = {};
        all.forEach(p => { const c = p.category || 'Other'; catMap[c] = (catMap[c] || 0) + 1; });

        setData({
          totalProducts: all.length,
          pendingProducts: all.filter(p => p.status === 'Pending').length,
          approvedProducts: all.filter(p => p.status === 'Approved').length,
          totalUsers: users.length,
          sellers,
          buyers,
          totalOrders: orders.length,
          totalRevenue,
          catMap,
        });
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="py-20 flex items-center justify-center gap-3 text-on-surface-variant"><div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /> Loading platform analytics...</div>;
  if (!data) return <div className="py-10 text-center text-on-surface-variant">Could not load analytics data.</div>;

  const catEntries = Object.entries(data.catMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatCard icon="inventory_2" label="Total Products" value={data.totalProducts} />
        <StatCard icon="pending_actions" label="Pending Approvals" value={data.pendingProducts} iconBg="bg-tertiary-fixed" iconColor="text-tertiary" sub="Needs admin review" />
        <StatCard icon="check_circle" label="Live Listings" value={data.approvedProducts} iconBg="bg-secondary-container" iconColor="text-secondary" />
        <StatCard icon="people" label="Total Users" value={data.totalUsers} />
        <StatCard icon="storefront" label="Active Sellers" value={data.sellers} />
        <StatCard icon="person" label="Registered Buyers" value={data.buyers} />
        <StatCard icon="shopping_bag" label="Total Orders" value={data.totalOrders} />
        <StatCard icon="payments" label="Platform Revenue" value={`₹${data.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} iconBg="bg-primary-container" />
      </div>

      {catEntries.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="font-title-lg text-on-surface mb-md">Category Distribution (All Listings)</h3>
          <div className="space-y-3">
            {catEntries.map(([cat, count]) => (
              <CategoryBar key={cat} label={cat} count={count} total={data.totalProducts} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Analytics Page ────────────────────────────────────────────────────────
const Analytics = () => {
  const { user, role, loading: authLoading } = useAuthState();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white border border-outline-variant/40 rounded-2xl shadow-sm p-10 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-primary-fixed rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-primary text-4xl">analytics</span>
          </div>
          <h1 className="text-3xl font-headline-lg font-extrabold text-[#143d23] mb-3">Analytics Dashboard</h1>
          <p className="text-on-surface-variant text-center">
            Please <Link to="/login" className="text-primary font-bold hover:underline">sign in</Link> to view your personalised analytics.
          </p>
        </div>
      </div>
    );
  }

  const roleLabel = role === 'Admin' ? 'Platform Overview' : role === 'Seller' ? 'Seller Analytics' : 'Buyer Analytics';
  const roleIcon = role === 'Admin' ? 'admin_panel_settings' : role === 'Seller' ? 'storefront' : 'person';

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-margin-desktop py-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#143d23] to-[#166534] text-white rounded-2xl p-6 mb-8 flex items-center gap-4 shadow-md">
        <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-amber-300 text-3xl">{roleIcon}</span>
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">{role || 'User'} Dashboard</span>
          <h1 className="font-headline-md text-2xl md:text-3xl font-extrabold">Analytics Dashboard</h1>
          <p className="text-emerald-100 text-sm">{roleLabel} — live data from ExVeg</p>
        </div>
      </div>

      {/* Role-based content */}
      {role === 'Admin' && <AdminAnalytics />}
      {role === 'Seller' && <SellerAnalytics uid={user.uid} />}
      {role === 'Buyer' && <BuyerAnalytics uid={user.uid} />}
    </div>
  );
};

export default Analytics;
