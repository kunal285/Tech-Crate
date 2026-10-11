# Tech Crate — AI Agent Guidelines & Instructions

> **Project**: Tech Crate (Electronics, Hardware, DIY Kits & Microcontrollers E-Commerce Platform)  
> **Mobile Architecture**: React Native CLI (JavaScript)  
> **Backend Service**: Node.js / Express / MongoDB (Hosted on Render: `https://tech-crate.onrender.com/api`)  
> **Target Audience**: Students, Makers, Engineers, Roboticists & Hardware Builders across India  

---

## 1. What NOT to Do (STRICT DON'Ts)

### 🚫 Design & Theme Violations
- **DO NOT CHANGE EXISTING COLORS OR COLOR CODES**: Strictly preserve the established brand palette:
  - Brand Primary Navy: `#032762`
  - Secondary Blues: `#034697`, `#2563EB`, `#0262B8`
  - Accent / Action Orange: `#F97316`
  - Accent Cyans: `#02C9CC`, `#03E0E4`, `#06B6D4`
  - Background: `#F8FAFC`
  - Surface / Cards: `#FFFFFF`
  - Slate Borders: `#E2E8F0`, `#CBD5E1`
  - Text Primary: `#0F172A`, Text Secondary: `#475569`, `#64748B`
- **DO NOT introduce unapproved color themes**, dark mode overrides, or random color tokens that deviate from `mobile/src/theme/colors.js`.
- **DO NOT copy external brand styles** (such as Flipkart, Amazon, etc.). Respect the unique maker/engineering identity of Tech Crate.

### 🚫 Data & Content Integrity
- **DO NOT INVENT DUMMY / MOCK DATA**:
  - Never hardcode fake user identities (e.g., placeholder names like "Rahul Sharma" / "Kunal Sharma", fake emails, or fake phone numbers).
  - Never fabricate fake college/branch data (e.g., "BITS Pilani • Computer Science") if the user has not set it.
  - Never add fake gamified tiers/points (e.g., "Silver Maker • 450 Pts").
  - Never hardcode fake balances or gift cards (e.g., "Balance: ₹250" or fake voucher redemption).
  - Never add fake community reviews or fake Q&As.
  - **Always bind directly to actual store and model data** (`user`, `orders`, `products`, `wishlist`, `cart`). If a value is absent, omit the element or use a graceful generic fallback like `"Maker"`.
- **DO NOT ADD UNAPPROVED MARKETING SECTIONS**:
  - Do not create fabricated sections such as "Discover & Partner", fake campus ambassador programs (e.g., "Earn 8% commission"), or fake supplier recruitment without explicit backend schemas and user requests.

### 🚫 Architecture & Connectivity
- **DO NOT CHANGE THE DEFAULT BACKEND URL AWAY FROM RENDER**:
  - Always use `https://tech-crate.onrender.com/api` as the default backend across `mobile/src/constants/index.js`, `imageUtils.js`, and `.env`.
  - Do not revert `API_BASE_URL` to `localhost:5000` or `10.0.2.2:5000` for default execution.
- **DO NOT REBUILD SCREENS FROM SCRATCH**:
  - Improve existing screens incrementally. Refactor code while preserving working routes, stores, services, and hooks.
- **DO NOT BREAK NAVIGATION OR EXISTING FLOWS**:
  - Never delete existing routes from `CustomerNavigator.js`, `SellerNavigator.js`, or `AdminNavigator.js`.
  - Preserve functional links between Home, Search, Categories, Project Hub, Cart, Checkout, Order Tracking, and Account.
- **DO NOT INSTALL UNNECESSARY HEAVY DEPENDENCIES**:
  - Reuse the rich existing libraries already installed: `lucide-react-native`, `zustand`, `axios`, `react-native-safe-area-context`, `@react-navigation`, `@react-native-async-storage/async-storage`.

---

## 2. What TO Do (Mandatory DOs)

### ✅ Visual Quality & Modern UX
- **Establish Strong Visual Hierarchy**:
  - Make primary actions obvious with bold contrast (`Colors.primary`).
  - Use structured typography (`Typography`) with balanced font sizes, line heights, and weights.
- **Ensure Balanced Spacing & Consistency**:
  - Standardize padding, margins, and gaps using the `Spacing` tokens (`xs`, `sm`, `md`, `base`, `lg`, `xl`).
  - Use consistent card corner radii (`BorderRadius.md`, `BorderRadius.lg`).
- **Improve Touch Targets & Feedback**:
  - Add appropriate `hitSlop` on small buttons (e.g., delete icons, back arrows, badges).
  - Use responsive `activeOpacity={0.8}` or `activeOpacity={0.85}` for all interactive `TouchableOpacity` components.
- **Safe Area Handling**:
  - Always account for Android navigation bars and iOS home indicators using `useSafeAreaInsets()` or `<SafeAreaView edges={...}>`.

### ✅ Component Architecture & Data Handling
- **Graceful States Everywhere**:
  - Provide skeleton loaders or clean `ActivityIndicator` spinners during network requests.
  - Provide actionable empty states (e.g., "No orders yet" with a "Browse Products" button).
  - Provide user-friendly error alerts without crashing the application.
- **Respect Centralized Store Architecture**:
  - State management uses **Zustand**:
    - `useAuthStore`: Authenticated user, tokens, and role.
    - `useCartStore`: Cart items, quantities, coupon logic, totals.
    - `useWishlistStore`: Saved products, toggle wishlist.
    - `useProductStore`: Product catalog, trending, search, categories.
    - `useProjectStore`: DIY project kits, BOM components, schematics.
- **Local Storage Synchronization**:
  - Use `@react-native-async-storage/async-storage` for device-level persistence (e.g., saved shipping addresses in `@user_addresses`, language preference, push settings).

### ✅ Verification & Quality Assurance
- **Verify Syntax Before Reporting**:
  - Run `node -c <file_path>` on any modified JavaScript files to ensure zero syntax or parser errors.
- **Run the Automated Test Suite**:
  - Run `npm test -- --watchAll=false` in the `mobile` directory to confirm the component tree renders correctly.
- **Preserve Functional Code Comments**:
  - Retain existing developer notes, integration details, and documentation comments.

---

## 3. Screen-by-Screen Reference Guidelines

| Screen | Key Requirements |
| :--- | :--- |
| **Home Screen** | Highlight verified hardware, poster banner carousel, categories, trending hardware, and DIY project kits. |
| **Search & Categories** | Support dynamic route params (`categoryId`, `query`), sort pills (Featured, Price, Rating), active filter badge, and catalog browsing on empty query. |
| **Product Detail** | High-res image carousel, technical specifications table, pinout notes, stock indicator, and sticky Add-to-Cart / Buy-Now action bar. |
| **Project Details / Kits** | Interactive Bill of Materials (BOM) checklist, circuit schematics, firmware code viewer, and direct kit purchase action. |
| **Cart & Checkout** | Item quantity adjustment, promo coupon calculation, saved address selector pills, UPI (GPay/PhonePe) intent, Razorpay modal, and COD support. |
| **Order Confirmation & Tracking** | Celebratory checkmark, masked Order ID, copyable logistics AWB, 5-stage shipment timeline (Placed → Inspected → Dispatched → Out for Delivery → Delivered). |
| **My Account / Profile** | Real user profile details only, 2x2 quick action matrix (Orders, Addresses, Wishlist, Project Hub), address manager, language selection, security settings, FAQs, and logout. |

---

## 4. Quick Checklist for AI Agents

Before submitting any code changes, verify:
- [ ] Are all colors exactly matching the existing brand palette?
- [ ] Is all data real (zero dummy names, colleges, fake balances, or fake perks)?
- [ ] Is the default backend pointing to `https://tech-crate.onrender.com/api`?
- [ ] Does `node -c <modified_files>` pass with 0 errors?
- [ ] Does `npm test -- --watchAll=false` pass in the `mobile` workspace?
- [ ] Are all navigation routes and user flows preserved intact?
