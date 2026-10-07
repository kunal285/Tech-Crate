import { Linking, TurboModuleRegistry } from 'react-native';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase';

const IDENTITY_TOOLKIT_IDP_URL =
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp';

/**
 * Check if the native Google Sign-In TurboModule is linked in the compiled APK.
 * This prevents TurboModuleRegistry.getEnforcing crashes when the JS bundle reloads
 * before the native binary is recompiled.
 */
export const isNativeGoogleSignInAvailable = () => {
  return Boolean(
    TurboModuleRegistry.get('RNGoogleSignin') ||
    TurboModuleRegistry.get('RNGoogleSignInCGen')
  );
};

let googleSigninModule = null;
let statusCodes = null;

const loadGoogleSignIn = () => {
  if (googleSigninModule) return googleSigninModule;
  if (!isNativeGoogleSignInAvailable()) {
    return null;
  }
  try {
    const pkg = require('@react-native-google-signin/google-signin');
    googleSigninModule = pkg.GoogleSignin;
    statusCodes = pkg.statusCodes;
    return googleSigninModule;
  } catch (err) {
    console.warn('[GoogleSignin Load Error]', err.message);
    return null;
  }
};

const configureGoogle = (GoogleSignin) => {
  if (!GoogleSignin) return;
  try {
    const config = {
      scopes: ['email', 'profile'],
      offlineAccess: false,
    };
    if (firebaseConfig.webClientId) {
      config.webClientId = firebaseConfig.webClientId;
    }
    GoogleSignin.configure(config);
    isGoogleConfigured = true;
  } catch (err) {
    console.warn('[GoogleSignin Config Error]', err.message);
  }
};

const socialAuthService = {
  /**
   * Directly triggers the native Android Google Account Chooser.
   * If Firebase Authentication is configured, exchanges Google credentials with Firebase.
   */
  signInWithGoogle: async () => {
    const GoogleSignin = loadGoogleSignIn();

    if (!GoogleSignin) {
      return {
        success: false,
        message:
          'Native Google Sign-In module is not compiled into the current running APK. Please rebuild the app with "npm run android".',
        needsRebuild: true,
      };
    }

    try {
      configureGoogle(GoogleSignin);

      // Verify Google Play Services is available
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Clear cached session so user gets account chooser
      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore if not signed in
      }

      // 1. Native Google Sign-In account selection
      const response = await GoogleSignin.signIn();

      const user = response?.data?.user || response?.user;
      const idToken = response?.data?.idToken || response?.idToken;

      if (!user || !user.email) {
        throw new Error('No Google account was selected.');
      }

      let profileData = {
        provider: 'google',
        email: user.email,
        name: user.name || user.givenName || 'Google User',
        photoUrl: user.photo || null,
        idToken,
      };

      // 2. Authenticate with Firebase Authentication if available and idToken is present
      if (idToken && isFirebaseConfigured()) {
        try {
          const fbResponse = await fetch(
            `${IDENTITY_TOOLKIT_IDP_URL}?key=${firebaseConfig.apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                postBody: `id_token=${idToken}&providerId=google.com`,
                requestUri: 'http://localhost',
                returnSecureToken: true,
                returnIdpCredential: true,
              }),
            }
          );

          if (fbResponse.ok) {
            const fbData = await fbResponse.json();
            profileData = {
              provider: 'google',
              email: fbData.email || profileData.email,
              name: fbData.displayName || profileData.name,
              photoUrl: fbData.photoUrl || profileData.photoUrl,
              idToken: fbData.idToken || profileData.idToken,
              firebaseUid: fbData.localId,
            };
          }
        } catch (fbErr) {
          console.warn('[Firebase Google IdP Exchange]', fbErr.message);
        }
      }

      return {
        success: true,
        account: profileData,
      };
    } catch (error) {
      if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return {
          success: false,
          cancelled: true,
        };
      }
      if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
        return {
          success: false,
          message: 'Google Sign-In is already in progress.',
        };
      }
      if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          message: 'Google Play Services is not available or outdated.',
        };
      }

      const isDeveloperError =
        (statusCodes && error.code === statusCodes.DEVELOPER_ERROR) ||
        (error.message && error.message.includes('DEVELOPER_ERROR'));

      if (isDeveloperError) {
        return {
          success: false,
          message:
            'Google Sign-In configuration error (DEVELOPER_ERROR). Please ensure your debug SHA-1 fingerprint is added to Firebase Console and webClientId is configured.',
          error,
        };
      }

      return {
        success: false,
        message: error.message || 'Google Sign-In failed.',
        error,
      };
    }
  },

  /**
   * Facebook Sign-In handler
   */
  signInWithFacebook: async () => {
    try {
      const fbOAuthUrl =
        'https://www.facebook.com/v19.0/dialog/oauth?client_id=TechCrate&redirect_uri=TechCrate://oauth&response_type=token&scope=email,public_profile';

      const supported = await Linking.canOpenURL(fbOAuthUrl).catch(() => false);
      if (supported) {
        await Linking.openURL(fbOAuthUrl);
        return {
          success: false,
          inProgress: true,
          message: 'Opening Facebook authentication on device...',
        };
      }
      return {
        success: false,
        message: 'Facebook sign-in is not supported on this device.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Facebook authentication failed.',
      };
    }
  },
};

export default socialAuthService;
