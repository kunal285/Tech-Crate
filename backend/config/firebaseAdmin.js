const admin = require('firebase-admin');

let isInitialized = false;

const getActiveApps = () => {
  if (Array.isArray(admin.apps)) return admin.apps;
  if (typeof admin.getApps === 'function') return admin.getApps();
  return [];
};

/**
 * Initialize Firebase Admin SDK
 */
const initFirebaseAdmin = () => {
  const activeApps = getActiveApps();
  if (isInitialized || activeApps.length > 0) {
    isInitialized = true;
    return admin;
  }

  try {
    // 1. Full JSON Service Account string or file path
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } catch (err) {
        // File path fallback
        serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      isInitialized = true;
      console.log('[Firebase Admin] Successfully initialized via Service Account Key');
      return admin;
    }

    // 2. Individual Environment Credentials
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      isInitialized = true;
      console.log('[Firebase Admin] Successfully initialized via Environment Credentials');
      return admin;
    }

    // 3. Project ID only (GCP / Application Default Credentials)
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      isInitialized = true;
      console.log('[Firebase Admin] Initialized with Project ID');
      return admin;
    }

    console.warn(
      '[Firebase Admin] Note: Credentials not detected. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in backend/.env'
    );
  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', error.message);
  }

  return admin;
};

// Initialize on module load
initFirebaseAdmin();

/**
 * Check if Firebase Admin is configured with credentials
 */
const isFirebaseAdminConfigured = () => {
  return (
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) ||
    Boolean(
      process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
    ) ||
    Boolean(process.env.FIREBASE_PROJECT_ID)
  );
};

/**
 * Verify a Firebase ID Token server-side
 * @param {string} idToken Firebase client ID token
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
const verifyFirebaseIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Firebase ID Token is required and must be a valid string.');
  }

  if (!isFirebaseAdminConfigured() || getActiveApps().length === 0) {
    throw new Error(
      'Firebase Admin credentials not configured on server. Please configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in backend/.env'
    );
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      throw new Error('Firebase ID token has expired. Please authenticate again.');
    }
    if (err.code === 'auth/id-token-revoked') {
      throw new Error('Firebase ID token has been revoked.');
    }
    if (err.code === 'auth/argument-error' || err.code === 'auth/invalid-id-token') {
      throw new Error('Invalid Firebase ID token provided.');
    }
    throw new Error(`Firebase token verification failed: ${err.message}`);
  }
};

module.exports = {
  admin,
  initFirebaseAdmin,
  isFirebaseAdminConfigured,
  verifyFirebaseIdToken,
};
