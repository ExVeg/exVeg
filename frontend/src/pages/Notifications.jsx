import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthState } from '../hooks/useAuthState';

const Notifications = () => {
  const { user, loading: authLoading } = useAuthState();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setNotifications(list);
      } catch (err) {
        console.warn('Notifications fetch note:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchNotifications();
    }
  }, [user, authLoading]);

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-primary text-5xl" data-icon="notifications">notifications</span>
        </div>
        <h1 className="text-4xl font-headline-lg text-primary mb-4">Notifications</h1>
        <p className="text-on-surface-variant text-center max-w-lg text-lg">
          {user ? 'You have no new notifications at the moment.' : 'Please sign in to view your notifications.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl">notifications</span>
        </div>
        <div>
          <h1 className="text-2xl font-headline-md text-on-surface font-bold">Notifications</h1>
          <p className="text-sm text-on-surface-variant">Account updates, product approvals, and order alerts</p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.read && markAsRead(n.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              n.read
                ? 'bg-surface-container-lowest border-outline-variant/60'
                : 'bg-primary-container/20 border-primary/40 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-on-surface">{n.title || 'Update'}</h3>
                <p className="text-sm text-on-surface-variant mt-1">{n.message}</p>
                {n.createdAt && (
                  <p className="text-xs text-on-surface-variant/70 mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0" title="Unread" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
