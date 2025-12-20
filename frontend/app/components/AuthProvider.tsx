"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
 import { API_BASE_URL } from '@/lib/config';

type AppUserRole = 'buyer' | 'artist' | 'admin';

interface AppUserDoc {
  _id: string;
  email: string;
  name: string;
  role: AppUserRole;
  artistProfile?: any | null;
}

interface AuthContextValue {
  user: User | null;
  appUser: AppUserDoc | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/me?firebaseUID=${firebaseUser.uid}`);
          if (res.ok) {
            const data = await res.json();
            setAppUser(data.user);
          } else {
            setAppUser(null);
          }
        } catch {
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
