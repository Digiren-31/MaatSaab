import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 🔍 DEBUG: Starting Firebase initialization
console.log('🔥 FIREBASE INIT: Starting Firebase configuration...');
console.log('🌍 FIREBASE INIT: Current URL:', window.location.href);
console.log('🌍 FIREBASE INIT: Current domain:', window.location.hostname);
console.log('🌍 FIREBASE INIT: Current port:', window.location.port);

// Debug environment variables
console.log('🔍 FIREBASE INIT: Environment Variables Check:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '✗ Missing',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing',
});

// Debug actual values (masked for security)
console.log('🔍 FIREBASE INIT: Config values (masked):', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 20) + '...',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

const firebaseConfig: Record<string, any> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
};

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ FIREBASE INIT: Missing required Firebase configuration. Please check your .env.local file.');
  console.error('❌ FIREBASE INIT: Missing:', {
    apiKey: !firebaseConfig.apiKey,
    authDomain: !firebaseConfig.authDomain,
    projectId: !firebaseConfig.projectId,
  });
} else {
  console.log('✅ FIREBASE INIT: Required config present');
}

console.log('🔍 FIREBASE INIT: Adding optional config...');
if (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) {
  firebaseConfig.storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  console.log('✅ FIREBASE INIT: Storage bucket added');
}
if (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) {
  firebaseConfig.messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  console.log('✅ FIREBASE INIT: Messaging sender ID added');
}
if (import.meta.env.VITE_FIREBASE_APP_ID) {
  firebaseConfig.appId = import.meta.env.VITE_FIREBASE_APP_ID;
  console.log('✅ FIREBASE INIT: App ID added');
}
if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
  firebaseConfig.measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
  console.log('✅ FIREBASE INIT: Measurement ID added');
}

console.log('🔥 FIREBASE INIT: Final config (masked):', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey?.substring(0, 20) + '...',
});

console.log('🚀 FIREBASE INIT: Initializing Firebase app...');
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
console.log('✅ FIREBASE INIT: Firebase app initialized:', app.name);

console.log('🔧 FIREBASE INIT: Initializing Firebase services...');
export const auth = getAuth(app);
console.log('✅ FIREBASE INIT: Auth service initialized');

export const db = getFirestore(app);
console.log('✅ FIREBASE INIT: Firestore service initialized');

export const storage = getStorage(app);
console.log('✅ FIREBASE INIT: Storage service initialized');

console.log('🔍 FIREBASE INIT: Creating Google Auth Provider...');
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider for better UX
console.log('⚙️ FIREBASE INIT: Configuring Google Auth Provider...');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
console.log('✅ FIREBASE INIT: Google Auth Provider configured');

console.log('🌐 FIREBASE INIT: Using production Firebase services');
console.log('📊 FIREBASE INIT: Project ID:', firebaseConfig.projectId);
console.log('🏁 FIREBASE INIT: Firebase initialization complete!');
console.log('==========================================');
