import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig: Record<string, any> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
};

if (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) {
  firebaseConfig.storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
}
if (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) {
  firebaseConfig.messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
}
if (import.meta.env.VITE_FIREBASE_APP_ID) {
  firebaseConfig.appId = import.meta.env.VITE_FIREBASE_APP_ID;
}
if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
  firebaseConfig.measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
