/**
 * Automated Verification Suite for Firebase Phone Authentication & Admin Isolation
 * Tests:
 * 1. Missing Token / Malformed Request Guard
 * 2. Unconfigured / Missing Server Credentials Guard (No Fake Authentication)
 * 3. Strict Admin Isolation (Admin cannot authenticate via Customer/Student Phone Auth)
 * 4. Client-side Role Tampering Protection (No escalation to Admin)
 * 5. Customer & Student Account Creation & phoneVerified Flag
 * 6. Session Invalidation on Logout
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const SecurityLog = require('../models/SecurityLog');
const { hashToken } = require('../utils/cryptoUtils');

let mongoServer;

async function setupTestDb() {
  console.log('Connecting to Mongo test database...');
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('Connected to in-memory test database');
}

async function teardownTestDb() {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  console.log('Disconnected from test database\n');
}

async function runTestSuite() {
  console.log('--- STARTING FIREBASE PHONE AUTH VERIFICATION SUITE ---\n');
  await setupTestDb();

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Missing Token / Bad Request Guard
    // ------------------------------------------------------------------------
    console.log('[TEST 1] Verifying Missing Token Guard...');
    const reqWithoutToken = { body: {} };
    let test1Passed = false;
    const resMock1 = {
      status: (code) => ({
        json: (data) => {
          if (code === 400 && data.success === false) {
            test1Passed = true;
          }
        },
      }),
    };

    const { firebaseLogin } = require('../controllers/firebaseAuthController');
    await firebaseLogin(reqWithoutToken, resMock1);

    if (test1Passed) {
      console.log('Passed: Rejected request missing Firebase ID token with 400');
    } else {
      throw new Error('Failed: Expected 400 when ID token is missing');
    }

    // ------------------------------------------------------------------------
    // TEST 2: Unconfigured Credentials Guard (Never fakes auth)
    // ------------------------------------------------------------------------
    console.log('\n[TEST 2] Verifying Firebase Admin Credentials Guard...');
    const { verifyFirebaseIdToken } = require('../config/firebaseAdmin');
    let test2Passed = false;
    try {
      await verifyFirebaseIdToken('dummy-unverified-token');
    } catch (err) {
      if (err.message.includes('Firebase') || err.message.includes('credentials') || err.message.includes('token')) {
        test2Passed = true;
      }
    }

    if (test2Passed) {
      console.log('Passed: Verification properly guards against unverified tokens');
    } else {
      throw new Error('Failed: Did not reject unconfigured / invalid token');
    }

    // ------------------------------------------------------------------------
    // TEST 3: Strict Admin Isolation Guard
    // ------------------------------------------------------------------------
    console.log('\n[TEST 3] Verifying Strict Admin Isolation Guard...');
    // Create an Admin user in DB
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@TechCrate.com',
      phone: '9999999999',
      role: 'admin',
      password: 'SuperSecretAdminPassword123!',
      isPhoneVerified: true,
    });

    // Simulate verified token payload belonging to this Admin phone number
    const fakeAdminDecoded = {
      uid: 'firebase_admin_uid_123',
      phone_number: '+919999999999',
    };

    // Mock verifyFirebaseIdToken for this isolation unit test
    const firebaseAdminModule = require('../config/firebaseAdmin');
    const originalVerify = firebaseAdminModule.verifyFirebaseIdToken;
    firebaseAdminModule.verifyFirebaseIdToken = async () => fakeAdminDecoded;

    let adminBlocked = false;
    let blockStatusCode = 0;
    const resMockAdmin = {
      status: (code) => {
        blockStatusCode = code;
        return {
          json: (data) => {
            if (code === 403 && data.success === false) {
              adminBlocked = true;
            }
          },
        };
      },
    };

    await firebaseLogin({ body: { idToken: 'valid-admin-token' }, ip: '127.0.0.1', headers: {} }, resMockAdmin);

    if (adminBlocked && blockStatusCode === 403) {
      console.log('Passed: Admin account blocked from Customer/Student Phone Auth (HTTP 403 Forbidden)');
    } else {
      throw new Error(`Failed: Admin was not blocked! Status code: ${blockStatusCode}`);
    }

    // ------------------------------------------------------------------------
    // TEST 4: Client Role Tampering Protection
    // ------------------------------------------------------------------------
    console.log('\n[TEST 4] Verifying Role Tampering Protection...');
    const fakeStudentDecoded = {
      uid: 'firebase_student_uid_456',
      phone_number: '+918888888888',
    };
    firebaseAdminModule.verifyFirebaseIdToken = async () => fakeStudentDecoded;

    let createdUserRole = null;
    const resMockStudent = {
      status: (code) => ({
        json: (data) => {
          if (data.user) createdUserRole = data.user.role;
        },
      }),
      json: (data) => {
        if (data.user) createdUserRole = data.user.role;
      },
    };

    // Client maliciously attempts to send accountType: 'admin'
    await firebaseLogin(
      {
        body: {
          idToken: 'valid-student-token',
          accountType: 'admin', // Malicious attempt to escalate
          name: 'Hacker Student',
        },
        ip: '127.0.0.1',
        headers: {},
      },
      resMockStudent
    );

    if (createdUserRole !== 'admin') {
      console.log(`Passed: Role escalation blocked. Role set to: '${createdUserRole}' (Never admin)`);
    } else {
      throw new Error('Failed: Role escalation succeeded! User became admin.');
    }

    // ------------------------------------------------------------------------
    // TEST 5: Customer & Student Phone Verification Flag
    // ------------------------------------------------------------------------
    console.log('\n[TEST 5] Verifying Phone Verification Flag & Student Details...');
    const studentDbRecord = await User.findOne({ phone: '8888888888' });
    if (studentDbRecord && studentDbRecord.isPhoneVerified === true && studentDbRecord.firebaseUid === 'firebase_student_uid_456') {
      console.log('Passed: Account created with isPhoneVerified=true and unique firebaseUid');
    } else {
      throw new Error('Failed: Student record missing verified phone flag or firebaseUid');
    }

    // ------------------------------------------------------------------------
    // TEST 6: Session Invalidation on Logout
    // ------------------------------------------------------------------------
    console.log('\n[TEST 6] Verifying Session Revocation on Logout...');
    const rawRefreshToken = 'sample_refresh_token_firebase_test_123';
    const tokenHash = hashToken(rawRefreshToken);
    await RefreshToken.create({
      user: studentDbRecord._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const { logoutUser } = require('../controllers/authController');
    const resMockLogout = {
      json: (data) => { },
    };

    await logoutUser(
      {
        body: { refreshToken: rawRefreshToken },
        user: studentDbRecord,
        headers: {},
        ip: '127.0.0.1',
      },
      resMockLogout
    );

    const activeSessions = await RefreshToken.find({
      user: studentDbRecord._id,
      isRevoked: false,
    });

    if (activeSessions.length === 0) {
      console.log('Passed: Refresh token session revoked and cleared upon logout');
    } else {
      throw new Error('Failed: Active non-revoked session still exists after logout');
    }

    // Restore mocked module
    firebaseAdminModule.verifyFirebaseIdToken = originalVerify;

    console.log('\nALL 6 FIREBASE AUTHENTICATION & SECURITY TESTS PASSED SUCCESSFULLY!\n');
  } finally {
    await teardownTestDb();
  }
}

runTestSuite().catch((err) => {
  console.error('\nTest Suite Failed:', err.message);
  process.exit(1);
});
