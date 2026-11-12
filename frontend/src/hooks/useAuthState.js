import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * Custom hook that tracks Firebase auth state AND fetches the user's role
 * strictly from their Firestore /users/{uid} profile document.
 * Role values: 'Buyer' | 'Seller' | 'Admin'
 */
export const useAuthState = () => {
  const [user, setUser] = useState(undefined); // undefined = still loading
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const email = firebaseUser.email?.toLowerCase() || '';
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists() && snap.data().role) {
            const r = String(snap.data().role).trim();
            const normalized = r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
            setRole(normalized);
          } else {
            // If user doc doesn't exist yet, check known admin identifier or default
            if (
              email === 'sumit2325888@gmail.com' ||
              email === 'exvegcompany@gmail.com' ||
              email.startsWith('admin@')
            ) {
              setRole('Admin');
              setDoc(doc(db, 'users', firebaseUser.uid), { role: 'Admin', email: firebaseUser.email }, { merge: true }).catch(() => {});
            } else {
              setRole('Buyer');
            }
          }
        } catch {
          // Fallback if offline/network issues
          if (
            email === 'sumit2325888@gmail.com' ||
            email === 'exvegcompany@gmail.com' ||
            email.startsWith('admin@')
          ) {
            setRole('Admin');
          } else {
            setRole('Buyer');
          }
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
