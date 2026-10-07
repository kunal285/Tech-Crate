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
    'AIzaSyAQSTtfF5V4jjIL1og2X8MS6q05fGOfoIA',
  authDomain:
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.FIREBASE_AUTH_DOMAIN ||
        process.env.VITE_FIREBASE_AUTH_DOMAIN ||
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)) ||
    'techcrate-2e07a.firebaseapp.com',
  projectId:
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.FIREBASE_PROJECT_ID ||
        process.env.VITE_FIREBASE_PROJECT_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)) ||
    'techcrate-2e07a',
  storageBucket:
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.VITE_FIREBASE_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)) ||
    'techcrate-2e07a.firebasestorage.app',
  messagingSenderId:
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.FIREBASE_MESSAGING_SENDER_ID ||
        process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)) ||
    '645024882086',
  appId:
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.FIREBASE_APP_ID ||
        process.env.VITE_FIREBASE_APP_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID)) ||
    '1:645024882086:android:999ce114bcd742cf114367',
  webClientId:
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.GOOGLE_WEB_CLIENT_ID ||
        process.env.FIREBASE_WEB_CLIENT_ID)) ||
    '645024882086-vdroc7r36kf6po0vjh2hiurvpssfut3c.apps.googleusercontent.com',
};

export const isFirebaseConfigured = () => Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export default firebaseConfig;
