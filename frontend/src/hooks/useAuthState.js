import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * Custom hook that tracks Firebase auth state AND fetches the user's role
 * from Firestore so ProtectedRoute can do role-based access control.
 */
export const useAuthState = () => {
  const [user, setUser] = useState(undefined); // undefined = still loading
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            setRole(snap.data().role); // 'Buyer' | 'Seller' | 'Admin'
          } else {
            // Fallback: check if email matches hardcoded admin
            setRole(firebaseUser.email === 'sumit2325888@gmail.com' ? 'Admin' : 'Buyer');
          }
        } catch {
          // If Firestore is unreachable, use email-based fallback
          setRole(firebaseUser.email === 'sumit2325888@gmail.com' ? 'Admin' : 'Buyer');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, role, loading };
};
