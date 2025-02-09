import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { ServiceAccount } from 'firebase-admin/app';
import serviceAccount from '../../service-account.json';

// Initialize Firebase Admin
const apps = getApps();

if (!apps.length) {
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

export { adminDb, adminAuth }; 