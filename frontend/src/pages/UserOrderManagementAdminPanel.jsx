import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const UserOrderManagementAdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'users'
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'users')),
      ]);

      const allOrders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      allOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOrders(allOrders);

      const allUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(allUsers);
    } catch (err) {
      console.error('Error fetching admin orders & users:', err);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order status updated to "${newStatus}".`);
    } catch {
      showToast('❌ Failed to update status.');
    }
  };

  const totalVolume = orders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const adminEmail = auth.currentUser?.email || 'admin@exveg.com';

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] bg-white border border-outline-variant shadow-xl rounded-xl px-5 py-3 text-sm font-semibold animate-fade-in">
          {toast}
        </div>
      )}

      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-outline-variant bg-surface z-40 hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/" className="text-title-lg font-headline-md font-bold text-primary">ExVeg</Link>
          <p className="font-label-md text-on-surface-variant">Admin Console</p>
        </div>
        <nav className="px-4 space-y-1.5 flex-1">
          <Link to="/admin-dashboard" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md">Dashboard</span>
          </Link>
          <Link to="/seller-verification" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg">
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-label-md">Sellers</span>
          </Link>
          <Link to="/user-order-management" className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-label-md">Orders & Users</span>
          </Link>
          <Link to="/analytics" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg">
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="font-label-md">Analytics</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-outline-variant">
          <button
            onClick={() => { signOut(auth); navigate('/login'); }}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-error hover:bg-error-container/30 text-sm font-bold"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 right-0 left-0 md:left-64 h-16 flex justify-between items-center px-8 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <h2 className="font-headline-md text-headline-md text-on-surface">Order & User Operations</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-on-surface-variant font-medium">{adminEmail}</span>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
            {(adminEmail[0] || 'A').toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-8 md:ml-64 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-8">
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-on-surface-variant font-label-md">Total Volume</span>
                <span className="text-primary material-symbols-outlined">payments</span>
              </div>
              <div className="text-2xl font-bold text-on-surface">₹{totalVolume.toLocaleString('en-IN')}</div>
              <p className="text-xs text-on-surface-variant mt-1">Platform cumulative transactions</p>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-on-surface-variant font-label-md">Active Orders</span>
                <span className="text-primary material-symbols-outlined">local_shipping</span>
              </div>
              <div className="text-2xl font-bold text-on-surface">{activeOrdersCount}</div>
              <p className="text-xs text-on-surface-variant mt-1">Orders in processing / transit</p>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-on-surface-variant font-label-md">Total Users</span>
                <span className="text-primary material-symbols-outlined">people</span>
              </div>
              <div className="text-2xl font-bold text-on-surface">{users.length}</div>
              <p className="text-xs text-on-surface-variant mt-1">Registered buyers and sellers</p>
            </div>
          </div>

          {/* Main Tabs Container */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden min-h-[500px]">
            <div className="border-b border-outline-variant flex px-6">
              <button
                className={`px-6 py-4 font-bold border-b-2 transition-all ${
                  activeTab === 'orders' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
                onClick={() => setActiveTab('orders')}
              >
                Marketplace Orders ({orders.length})
              </button>
              <button
                className={`px-6 py-4 font-bold border-b-2 transition-all ${
                  activeTab === 'users' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
                onClick={() => setActiveTab('users')}
              >
                System Users ({users.length})
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center text-on-surface-variant">Loading real-time records...</div>
            ) : (
              <div className="p-6">
                {activeTab === 'orders' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase">
                        <tr>
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Buyer</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Update</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-4 font-mono text-xs font-bold text-primary">{o.id}</td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-on-surface block">{o.buyerName || 'Buyer'}</span>
                              <span className="text-xs text-on-surface-variant">{o.email}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-on-surface">₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                            <td className="px-6 py-4 text-xs text-on-surface-variant">
                              {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                o.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {o.status || 'Placed'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <select
                                value={o.status || 'Placed'}
                                onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                className="bg-surface border border-outline-variant rounded-lg px-2.5 py-1 text-xs font-bold text-on-surface"
                              >
                                <option value="Placed">Placed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr><td colSpan="6" className="py-12 text-center text-on-surface-variant">No orders placed yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase">
                        <tr>
                          <th className="px-6 py-4">User Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Phone</th>
                          <th className="px-6 py-4 text-right">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-4 font-bold text-on-surface">{u.name || 'Unnamed User'}</td>
                            <td className="px-6 py-4 text-sm text-on-surface-variant">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                u.role === 'Admin' ? 'bg-primary-container text-on-primary-container' :
                                u.role === 'Seller' ? 'bg-secondary-container text-on-secondary-container' :
                                'bg-surface-container-high text-on-surface'
                              }`}>
                                {u.role || 'Buyer'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-on-surface-variant">{u.phone || '—'}</td>
                            <td className="px-6 py-4 text-right text-xs text-on-surface-variant">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default UserOrderManagementAdminPanel;
