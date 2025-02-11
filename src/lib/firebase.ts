import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

// Initialize auth persistence immediately
if (typeof window !== 'undefined') {
  // Set persistent auth state
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Auth persistence set to local');
    })
    .catch((error) => {
      console.error('Error setting auth persistence:', error);
      // Fallback to in-memory persistence if local persistence fails
      setPersistence(auth, inMemoryPersistence).catch(console.error);
    });
}

const db = getFirestore(app);

// Enable offline persistence for Firestore
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
}

// Configure Google Provider with specific client ID
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID || ''
});

// Add only essential OAuth scopes
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');

export { auth, db, googleProvider }; 