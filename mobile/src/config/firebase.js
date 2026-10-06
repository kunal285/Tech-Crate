import { initializeApp, getApps, getApp } from 'firebase/app';

/**
 * Firebase Client Configuration
 * Uses environment variables or injected constants
 */
export const firebaseConfig = {
  apiKey:
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.FIREBASE_API_KEY ||
        process.env.VITE_FIREBASE_API_KEY ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY)) ||
    '',
  authDomain:
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.FIREBASE_AUTH_DOMAIN ||
        process.env.VITE_FIREBASE_AUTH_DOMAIN ||
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)) ||
    '',
  projectId:
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.FIREBASE_PROJECT_ID ||
        process.env.VITE_FIREBASE_PROJECT_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)) ||
    '',
  storageBucket:
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.VITE_FIREBASE_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)) ||
    '',
  messagingSenderId:
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.FIREBASE_MESSAGING_SENDER_ID ||
        process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)) ||
    '',
  appId:
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.FIREBASE_APP_ID ||
        process.env.VITE_FIREBASE_APP_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID)) ||
    '',
};

// Initialize Firebase App
let app;
if (getApps().length === 0) {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  } else {
    // Lazy placeholder app until credentials provided
    app = null;
  }
} else {
  app = getApp();
}

export const getFirebaseApp = () => app;
export default app;
