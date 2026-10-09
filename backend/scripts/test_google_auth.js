/**
 * Comprehensive Google Authentication Test Suite
 * Tests Google registration, login, token issuance, profile retrieval, and duplicate prevention.
 */
const assert = require('assert');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';

async function runGoogleAuthTests() {
  console.log('================================================================');
  console.log('🔐 TESTING GOOGLE AUTHENTICATION INTEGRATION');
  console.log('================================================================');

  const testEmail = `maker_${Date.now()}@gmail.com`;
  const testName = 'Google Maker';
  const testAvatar = 'https://lh3.googleusercontent.com/a/ACg8ocItemTest';

  // 1. Initial Google Registration / Login via /api/auth/social-auth
  console.log('\n--- 1. Google Account Creation / First Login ---');
  const res1 = await fetch(`${BASE_URL}/api/auth/social-auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'google',
      email: testEmail,
      name: testName,
      photoUrl: testAvatar,
    }),
  });

  const data1 = await res1.json();
  assert.strictEqual(res1.status, 200, `POST /api/auth/social-auth should return 200: ${JSON.stringify(data1)}`);
  assert.strictEqual(data1.success, true, 'Response indicates success');
  assert.ok(data1.token, 'Returns valid JWT accessToken');
  assert.ok(data1.refreshToken, 'Returns valid refreshToken');
  assert.strictEqual(data1.email, testEmail, 'User email matches Google email');
  assert.strictEqual(data1.isEmailVerified, true, 'Google email is marked verified');
  console.log('✅ [PASS] Google registration & session issuance succeeded.');

  // 2. Profile Verification with issued JWT
  console.log('\n--- 2. Profile Retrieval with Google JWT ---');
  const resProfile = await fetch(`${BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${data1.token}` },
  });
  const dataProfile = await resProfile.json();
  assert.strictEqual(resProfile.status, 200, 'Protected profile endpoint returns 200');
  assert.strictEqual(dataProfile.email, testEmail, 'Profile email matches');
  assert.strictEqual(dataProfile.isEmailVerified, true, 'Profile indicates email verified');
  console.log('✅ [PASS] Protected endpoints successfully accept Google JWT.');

  // 3. Repeat Login via /api/auth/google-login (No Duplicate Record)
  console.log('\n--- 3. Repeat Login via /api/auth/google-login ---');
  const res2 = await fetch(`${BASE_URL}/api/auth/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'google',
      email: testEmail,
      name: testName,
    }),
  });

  const data2 = await res2.json();
  assert.strictEqual(res2.status, 200, 'Repeat login returns 200');
  assert.strictEqual(data2._id, data1._id, 'Returns existing user ID without creating duplicate');
  assert.ok(data2.token, 'Issues new fresh session token');
  console.log('✅ [PASS] Repeat Google login recognized existing user without duplicating.');

  console.log('\n================================================================');
  console.log('🎉 ALL GOOGLE AUTHENTICATION TESTS PASSED (3/3)');
  console.log('================================================================\n');
}

runGoogleAuthTests().catch((err) => {
  console.error('❌ Test Failure:', err);
  process.exit(1);
});
