import { firebaseConfig } from '../config/firebase';

const IDENTITY_TOOLKIT_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

/**
 * Check if Firebase client has credentials configured
 */
export const isFirebaseConfigured = () => {
  return Boolean(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);
};

/**
 * Format Indian 10-digit phone to international +91 format
 */
export const formatInternationalPhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (phone.startsWith('+')) return phone;
  return `+91${digits.slice(-10)}`;
};

/**
 * Mask mobile number for UI presentation
 */
export const maskPhoneNumber = (phone) => {
  if (!phone) return '******';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 4) {
    return `+91 ******${digits.slice(-4)}`;
  }
  return `******${digits}`;
};

/**
 * User-friendly mapping for Firebase Identity Toolkit errors
 */
const mapFirebaseError = (errorMessage) => {
  if (!errorMessage) return 'Authentication failed. Please try again.';

  if (errorMessage.includes('EMAIL_EXISTS')) {
    return 'Email is already registered. Please login instead.';
  }
  if (
    errorMessage.includes('INVALID_LOGIN_CREDENTIALS') ||
    errorMessage.includes('INVALID_PASSWORD') ||
    errorMessage.includes('EMAIL_NOT_FOUND')
  ) {
    return 'Invalid email or password.';
  }
  if (errorMessage.includes('WEAK_PASSWORD')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (errorMessage.includes('USER_DISABLED')) {
    return 'This account has been disabled. Please contact support.';
  }
  if (errorMessage.includes('INVALID_EMAIL')) {
    return 'Please enter a valid email address.';
  }
  if (errorMessage.includes('OPERATION_NOT_ALLOWED')) {
    return 'Email/Password sign-in is not enabled in Firebase Console.';
  }
  if (errorMessage.includes('INVALID_PHONE_NUMBER')) {
    return 'Enter a valid mobile number.';
  }
  if (errorMessage.includes('TOO_MANY_ATTEMPTS') || errorMessage.includes('QUOTA_EXCEEDED')) {
    return 'Too many attempts. Please try again later.';
  }
  if (errorMessage.includes('INVALID_CODE')) {
    return 'The verification code is incorrect.';
  }
  if (errorMessage.includes('SESSION_EXPIRED')) {
    return 'This verification code has expired. Request a new code.';
  }
  if (errorMessage.includes('INVALID_SESSION_INFO')) {
    return 'Authentication session has expired. Please request a new code.';
  }
  if (errorMessage.includes('BILLING_NOT_ENABLED') || errorMessage.includes('PROJECT_NOT_FOUND')) {
    return 'Firebase Phone Auth: Please add this number under "Phone numbers for testing" in Firebase Console or enable billing.';
  }
  if (errorMessage.includes('CAPTCHA_CHECK_FAILED')) {
    return 'reCAPTCHA check failed. Please try again.';
  }
  if (errorMessage.includes('APP_CHECK')) {
    return 'Firebase App Check token is invalid. Please disable App Check enforcement for Authentication in Firebase Console or configure Play Integrity.';
  }

  return errorMessage.replace(/_/g, ' ').toLowerCase();
};

const firebaseAuthService = {
  isFirebaseConfigured,

  /**
   * Register a new user with Firebase using Email and Password
   * @param {string} email
   * @param {string} password
   * @param {string} displayName
   * @returns {Promise<{success: boolean, uid?: string, idToken?: string, refreshToken?: string, email?: string, message?: string}>}
   */
  createUserWithEmailAndPassword: async (email, password, displayName = '') => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      return {
        success: false,
        message: 'Please provide both email and password.',
      };
    }

    if (!isFirebaseConfigured()) {
      return {
        success: false,
        message: 'Firebase configuration is missing.',
        unconfigured: true,
      };
    }

    try {
      const response = await fetch(
        `${IDENTITY_TOOLKIT_URL}:signUp?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        const errorMsg = data.error?.message || 'Failed to create user in Firebase';
        return {
          success: false,
          message: mapFirebaseError(errorMsg),
          rawError: errorMsg,
        };
      }

      // If displayName is provided, update Firebase user profile
      if (displayName && data.idToken) {
        try {
          await fetch(
            `${IDENTITY_TOOLKIT_URL}:update?key=${firebaseConfig.apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                idToken: data.idToken,
                displayName: displayName.trim(),
                returnSecureToken: true,
              }),
            }
          );
        } catch {
          // Non-critical profile update failure
        }
      }

      return {
        success: true,
        uid: data.localId,
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        email: data.email || cleanEmail,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Unable to create account. Please check your internet connection.',
        error: err.message,
      };
    }
  },

  /**
   * Authenticate user with Firebase using Email and Password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, uid?: string, idToken?: string, refreshToken?: string, email?: string, displayName?: string, message?: string}>}
   */
  signInWithEmailAndPassword: async (email, password) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      return {
        success: false,
        message: 'Please provide both email and password.',
      };
    }

    if (!isFirebaseConfigured()) {
      return {
        success: false,
        message: 'Firebase configuration is missing.',
        unconfigured: true,
      };
    }

    try {
      const response = await fetch(
        `${IDENTITY_TOOLKIT_URL}:signInWithPassword?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        const errorMsg = data.error?.message || 'Authentication failed';
        return {
          success: false,
          message: mapFirebaseError(errorMsg),
          rawError: errorMsg,
        };
      }

      return {
        success: true,
        uid: data.localId,
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        email: data.email || cleanEmail,
        displayName: data.displayName || '',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Unable to login. Please check your internet connection.',
        error: err.message,
      };
    }
  },

  /**
   * Request Firebase to send SMS OTP to recipient phone number
   * @param {string} phoneNumber 10-digit mobile number
   * @returns {Promise<{success: boolean, sessionInfo?: string, maskedPhone?: string, message?: string}>}
   */
  sendPhoneOtp: async (phoneNumber) => {
    const intlPhone = formatInternationalPhone(phoneNumber);
    const cleanDigits = String(phoneNumber).replace(/\D/g, '').slice(-10);

    if (cleanDigits.length !== 10) {
      return {
        success: false,
        message: 'Enter a valid 10-digit mobile number.',
      };
    }

    if (!isFirebaseConfigured()) {
      return {
        success: false,
        message:
          'Firebase client credentials not configured. Please set FIREBASE_API_KEY in mobile environment.',
        unconfigured: true,
      };
    }

    try {
      const response = await fetch(
        `${IDENTITY_TOOLKIT_URL}:sendVerificationCode?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: intlPhone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        const errorMsg = data.error?.message || 'Failed to dispatch Firebase OTP';
        return {
          success: false,
          message: mapFirebaseError(errorMsg),
          rawError: errorMsg,
        };
      }

      return {
        success: true,
        sessionInfo: data.sessionInfo,
        maskedPhone: maskPhoneNumber(phoneNumber),
      };
    } catch (err) {
      return {
        success: false,
        message: 'Network error communicating with Firebase Auth server.',
        error: err.message,
      };
    }
  },

  /**
   * Confirm 6-digit code with Firebase and retrieve verified ID token
   * @param {string} sessionInfo Firebase session string returned from sendVerificationCode
   * @param {string} code 6-digit numeric OTP
   * @returns {Promise<{success: boolean, idToken?: string, uid?: string, message?: string}>}
   */
  verifyOtpAndGetIdToken: async (sessionInfo, code) => {
    const cleanCode = String(code).trim().replace(/\D/g, '');

    if (cleanCode.length !== 6) {
      return {
        success: false,
        message: 'The verification code must be exactly 6 digits.',
      };
    }

    if (!sessionInfo) {
      return {
        success: false,
        message: 'Verification session expired. Please request a new code.',
      };
    }

    if (!isFirebaseConfigured()) {
      return {
        success: false,
        message: 'Firebase client credentials not configured.',
        unconfigured: true,
      };
    }

    try {
      const response = await fetch(
        `${IDENTITY_TOOLKIT_URL}:signInWithPhoneNumber?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionInfo,
            code: cleanCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        const errorMsg = data.error?.message || 'Verification failed';
        return {
          success: false,
          message: mapFirebaseError(errorMsg),
          rawError: errorMsg,
        };
      }

      return {
        success: true,
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        uid: data.localId,
        phoneNumber: data.phoneNumber,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Network error verifying Firebase OTP.',
        error: err.message,
      };
    }
  },
};

export default firebaseAuthService;
