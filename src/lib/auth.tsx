import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db, googleProvider } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

export type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>; // Google only
  signOutApp: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as any);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, 'users', u.uid);
        const snap = await getDoc(ref);
        const base = {
          uid: u.uid,
          email: u.email ?? null,
          displayName: u.displayName ?? null,
          photoURL: u.photoURL ?? null,
          providerIds: u.providerData.map(p => p.providerId),
          updatedAt: serverTimestamp(),
        };
        if (!snap.exists()) {
          await setDoc(ref, { ...base, createdAt: serverTimestamp() });
        } else {
          await updateDoc(ref, base as any);
        }
      }
      setLoading(false);
    });
  }, []);

  const signIn: AuthCtx['signIn'] = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOutApp = () => signOut(auth);

  const value = useMemo(() => ({ user, loading, signIn, signOutApp }), [user, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
