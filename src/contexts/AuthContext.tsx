'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
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

/**
 * Loads or creates the Firestore user profile for the given Firebase user.
 */
async function loadOrCreateProfile(firebaseUser: User): Promise<UserProfile> {
  if (!db) throw new Error('Firestore not initialised');
  const docRef = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
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
  return newProfile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // Global loading gate – stays true until BOTH onAuthStateChanged and
  // getRedirectResult have settled, preventing premature redirects.
  const [loading, setLoading] = useState(true);
  const configured = typeof window !== 'undefined' && isConfigured();

  // Track independent resolution of the two async auth signals.
  const authStateResolved = useRef(false);
  const redirectResolved = useRef(false);

  /**
   * Only flip loading → false once both signals have resolved.
   * Using refs avoids depending on React state batching order.
   */
  const maybeFinishLoading = useCallback(() => {
    if (authStateResolved.current && redirectResolved.current) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // --- 1. Listen for auth-state changes (fires immediately) -----------
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && db) {
        try {
          const p = await loadOrCreateProfile(firebaseUser);
          setProfile(p);
        } catch (err) {
          console.error('[Auth] Failed to load profile:', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      authStateResolved.current = true;
      maybeFinishLoading();
    });

    // --- 2. Wait for any pending redirect result -------------------------
    getRedirectResult(auth)
      .then(async (result) => {
        // If a redirect login just completed, onAuthStateChanged will also
        // fire with the user, but we may reach here first. Handle the
        // profile eagerly so the user sees instant login after redirect.
        if (result?.user && db) {
          setUser(result.user);
          try {
            const p = await loadOrCreateProfile(result.user);
            setProfile(p);
          } catch (err) {
            console.error('[Auth] Failed to load redirect profile:', err);
          }
        }
      })
      .catch((err) => {
        // Redirect errors (e.g. popup closed, network) are non-fatal.
        console.warn('[Auth] getRedirectResult error:', err);
      })
      .finally(() => {
        redirectResolved.current = true;
        maybeFinishLoading();
      });

    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
