'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isConfigured } from '@/lib/firebase';

export type UserRole = 'mentor' | 'collaborator' | 'client';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  configured: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
  setUserRole: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = typeof window !== 'undefined' && isConfigured();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && db) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          // First-time Google sign-in: create profile with default role
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Trader',
            role: 'mentor',
            photoURL: firebaseUser.photoURL || '',
          };
          await setDoc(docRef, {
            ...newProfile,
            createdAt: new Date().toISOString(),
          });
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase not configured');
    }
    await signInWithRedirect(auth, googleProvider);
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setProfile(null);
  }, []);

  const setUserRole = useCallback(async (role: UserRole) => {
    if (!user || !db || !profile) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, { ...profile, role }, { merge: true });
    setProfile({ ...profile, role });
  }, [user, profile]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    profile,
    loading,
    configured,
    loginWithGoogle,
    logout,
    setUserRole,
  }), [user, profile, loading, configured, loginWithGoogle, logout, setUserRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
