# Troubleshooting & Diagnostics Guide

This document provides a matrix of common runtime errors, build issues, Metro bundler resolution steps, and database diagnostic procedures.

---

## 🛠️ Diagnostic Resolution Matrix

```text
Problem: Metro 500 resolveDependency error in React Native
  ↓
Cause: Firebase SDK modular import conflict or cached bundler graph stale state
  ↓
Solution: Reset Metro cache & clean Android build folder
  ↓
Verification: Run `npm start -- --reset-cache` in mobile directory
```

---

## 🔍 Detailed Issues & Solutions

### Issue 1: `Metro 500: Unable to resolve module firebase/app`
- **Cause**: Metro bundler failed to resolve Firebase modular web SDK packages inside React Native environment.
- **Fix**:
  1. Open `mobile/src/config/firebase.js`.
  2. Verify imports use native React Native Firebase packages (`@react-native-firebase/app`, `@react-native-firebase/auth`).
  3. Reset Metro bundler cache:
     ```bash
     cd mobile
     npm start -- --reset-cache
     ```

---

### Issue 2: `MongoServerError: E11000 duplicate key error collection`
- **Cause**: Attempting to insert a user phone or email that already exists in MongoDB.
- **Fix**: Run the cleanup script or modify user details:
  ```bash
  cd backend
  node scripts/liveSeedData.js
  ```

---

### Issue 3: `Admin login returns 403 Forbidden`
- **Cause**: User account role in MongoDB is set to `customer` instead of `admin`.
- **Fix**: Promote account using backend script or admin seed tool:
  ```bash
  cd backend
  npm run seed
  ```

---

### Issue 4: `Android build failed: Command CompileNativeCode failed`
- **Cause**: Stale Gradle cache or missing CMake setup.
- **Fix**:
  ```bash
  cd mobile/android
  ./gradlew clean
  cd ..
  npm run android
  ```
