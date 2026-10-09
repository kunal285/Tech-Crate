# Tech Crate — Quality Assurance & Testing Checklist

This checklist defines all required verification tests across the Tech Crate ecosystem.

---

## 1. Product Deletion & Archival Consistency
- [ ] **Soft-Deletion Test**:
  1. Call `DELETE /api/products/:id` on a product.
  2. Verify response confirms archival (`isArchived: true`).
  3. Call `GET /api/products` (public/customer endpoint). Verify the product is omitted.
  4. Call `GET /api/products?includeArchived=true` as admin. Verify the product is visible with the `Archived` badge.
  5. Restart backend server (`node server.js`). Verify the deleted/archived product does NOT reappear.
- [ ] **Order Reference Integrity**:
  1. Create an order containing a product.
  2. Archive or delete the product.
  3. Fetch the order details via `GET /api/orders/:id`. Verify historical details (title, price, quantity) remain fully intact without crash or null errors.

---

## 2. Product Media & Specifications
- [ ] **Image Upload Verification**:
  1. Upload image via `POST /api/upload/image`. Verify Cloudinary returns an HTTPS URL.
  2. Verify MIME type and magic-bytes check reject non-image file uploads.
  3. Verify the uploaded image appears properly in admin, website, and mobile app.
- [ ] **Missing/Broken Image Fallback**:
  1. Test product with an empty or broken image URL.
  2. Verify the website, mobile app, and admin render high-quality fallback maker component graphics without crashing.
- [ ] **Full Hardware Specifications**:
  1. Create product with `operatingVoltage`, `pinCount`, `interface`, `dimensions`, `weight`, and `datasheetUrl`.
  2. Verify all specifications persist in MongoDB and display accurately on the website and mobile product screens.

---

## 3. Checkout, Pricing & Cart Integrity
- [ ] Server-side price enforcement (modifying client payload price does not alter server price).
- [ ] Stock availability check and atomic decrement on order confirmation.
- [ ] Coupon percentage calculation and threshold verification.
- [ ] Payment webhook signature verification.

---

## 4. Cross-Platform Connectivity
- [ ] Backend (:5000) accessible from Website (:3000) without CORS errors.
- [ ] Backend (:5000) accessible from Admin (:5173) without CORS errors.
- [ ] Backend (:5000) accessible from Android Emulator via `http://10.0.2.2:5000`.
