# Tech Crate — Customer Mobile App (React Native)

> **Cross-Platform Native Customer Mobile Application**  
> Built with Bare React Native CLI (0.87), React 19, React Navigation v7, Zustand, and Razorpay Native SDK.

---

## 1. Overview & Capabilities

The Tech Crate mobile app provides a fast, native shopping experience for makers and hobbyists on mobile devices, with primary optimization for Android devices and cross-platform iOS support.

### Key Capabilities
* **Native Performance**: Built with React Native CLI (bare workflow, no Expo runtime restrictions).
* **Smooth Navigation**: Stack and bottom-tab navigation via `@react-navigation/native` v7 and `react-native-screens`.
* **State Management**: Lightweight, fast state handling using `zustand` and persistent local caching via `@react-native-async-storage/async-storage`.
* **Native Razorpay Checkout**: Direct hardware and UPI app intents (Google Pay, PhonePe, Paytm, BHIM) using `react-native-razorpay`.
* **Authentication**: Email/Password JWT auth with persistent session storage and optional Google Sign-in integration (`@react-native-google-signin/google-signin`).
* **Hardware & UI Features**: Linear gradients, custom vector icons, modal sheets, and toast notifications.

---

## 2. Directory Structure

```
mobile/
├── android/            # Native Android project (Gradle, manifest, resources)
├── ios/                # Native iOS project (Xcode project, Podfile)
├── src/
│   ├── components/     # Native UI components (ProductCard, CartItem, CustomButton)
│   ├── constants/      # App colors, fonts, layout constants, API config
│   ├── navigation/     # AppNavigators (AuthStack, AppTabs, RootNavigator)
│   ├── screens/        # Native mobile screens
│   │   ├── auth/       # Login, Register, Forgot Password
│   │   ├── home/       # Hero banner, category carousels, best sellers
│   │   ├── catalog/    # Product list, filters, search bar
│   │   ├── product/    # Product details, image gallery, specs, buy button
│   │   ├── cart/       # Native cart view with quantity selectors
│   │   ├── checkout/   # Shipping address selector & payment choice
│   │   ├── orders/     # Order history & active shipment tracking
│   │   └── profile/    # User settings, saved addresses, help desk
│   ├── services/       # Axios API client (interceptors, token attachment)
│   └── store/          # Zustand state stores (useAuthStore, useCartStore)
├── index.js            # App entry point registered with AppRegistry
├── metro.config.js     # Metro bundler configuration
└── package.json        # Dependencies & native scripts
```

---

## 3. Prerequisites & Development Setup

### System Prerequisites
1. **Node.js**: v18.x or v20.x LTS
2. **Java Development Kit (JDK)**: JDK 17 (recommended: Microsoft OpenJDK 17 or Temurin 17)
3. **Android Studio**:
   * Android SDK (API Level 34 or 35)
   * Android SDK Platform-Tools
   * Android Virtual Device (AVD Emulator) or a physical Android phone with USB Debugging enabled

### Environment Variables on Windows
Ensure the following are configured in your Windows System Environment Variables:
* `JAVA_HOME`: `C:\Program Files\Eclipse Adoptium\jdk-17...`
* `ANDROID_HOME`: `C:\Users\<username>\AppData\Local\Android\Sdk`
* Add `%ANDROID_HOME%\platform-tools` to your `PATH`.

Verify device detection in terminal:
```bash
adb devices
```

---

## 4. Connecting the App to Local Backend

When testing locally, the mobile app cannot reach `localhost:5000` because "localhost" on the phone/emulator refers to the mobile device itself.

### Option A: Android Emulator
Use the Android loopback address:
* API Base URL: `http://10.0.2.2:5000/api/v1`

### Option B: Physical Android Device via ADB Reverse
Connect your phone via USB with USB debugging enabled, then run:
```bash
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8081 tcp:8081
```
Now the app on your physical device can communicate directly with `http://localhost:5000/api/v1`!

### Option C: Physical Device via Wi-Fi LAN
Set the API URL to your computer's local network IP:
* Example: `http://192.168.1.15:5000/api/v1`

---

## 5. Development & Build Commands

```bash
# Navigate to mobile directory
cd mobile

# Install JavaScript dependencies
npm install

# Start Metro Bundler (in Terminal 1)
npm run start
# Or if port 8081 is busy:
npm run start:8082

# Build & Run on Connected Android Device or Emulator (in Terminal 2)
npm run android

# Bundle Android JS offline assets into APK
npm run bundle:android

# Generate Debug APK
npm run build:debug

# Generate Release Production APK
npm run build:android
# Result output: android/app/build/outputs/apk/release/app-release.apk

# Generate Android App Bundle (.aab) for Google Play Store upload
npm run build:bundle
```

---

## 6. Native Razorpay Configuration

The mobile app integrates `react-native-razorpay`. In the checkout screen, payment is initialized natively:

```javascript
import RazorpayCheckout from 'react-native-razorpay';

const options = {
  description: 'Tech Crate Order',
  image: 'https://your-domain.com/logo.png',
  currency: 'INR',
  key: RAZORPAY_KEY_ID,
  amount: order.amount, // in paise
  name: 'Tech Crate',
  order_id: backendOrderId,
  prefill: {
    email: user.email,
    contact: user.phone,
    name: user.name,
  },
  theme: { color: '#2563EB' }
};

RazorpayCheckout.open(options).then((data) => {
  // Submit data.razorpay_payment_id, data.razorpay_order_id, data.razorpay_signature to backend
}).catch((error) => {
  // Handle payment dismissal or failure
});
```
