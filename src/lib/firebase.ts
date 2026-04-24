import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  Firestore,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

function isConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your_api_key_here' &&
    firebaseConfig.projectId
  );
}

if (typeof window !== 'undefined') {
  if (isConfigured()) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);

      // Initialize Firestore with built-in persistent cache.
      // This replaces the deprecated enableIndexedDbPersistence() and
      // is fully client-safe — the whole block is already guarded by
      // typeof window !== 'undefined'.
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } else {
      app = getApps()[0];
      db = getFirestore(app);
    }

    auth = getAuth(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
  } else {
    console.warn(
      'Firebase is not configured. Add your credentials to .env.local — see .env.local.example'
    );
  }
}

export { app, auth, db, storage, googleProvider, isConfigured };
