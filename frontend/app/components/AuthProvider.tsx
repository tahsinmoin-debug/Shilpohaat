"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';

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
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = async (firebaseUser: User) => {
    try {
      console.log('Fetching user data for:', firebaseUser.uid);
      const res = await fetch(
        `http://localhost:5000/api/auth/me?firebaseUID=${firebaseUser.uid}`
      );
      
      console.log('API response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('API response data:', data);
        
        if (data.success && data.user) {
          setAppUser(data.user);
          console.log('✅ User loaded:', data.user);
        } else {
          console.warn('❌ API returned success but no user');
          setAppUser(null);
        }
      } else {
        const errorText = await res.text();
        console.error('❌ API error:', res.status, errorText);
        setAppUser(null);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setAppUser(null);
    }
  };

  const refetchUser = async () => {
    if (user) {
      await fetchAppUser(user);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email || 'No user');
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchAppUser(firebaseUser);
      } else {
        setAppUser(null);
      }
      
      setLoading(false);
    });
    
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setAppUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};