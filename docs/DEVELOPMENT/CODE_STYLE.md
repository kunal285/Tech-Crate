# Coding Standards & Conventions

This document specifies coding style rules, naming conventions, and best practices observed across **Tech Crate**.

---

## 🎨 JavaScript & React Conventions

1. **File Naming**:
   - Backend controllers, models, routes: `camelCase.js` (e.g. `authController.js`, `posterRoutes.js`).
   - React / React Native Components & Screens: `PascalCase.jsx` / `PascalCase.js` (e.g. `ProductDetailScreen.js`, `PosterCarousel.js`).
   - Service files & Utilities: `camelCase.js` (e.g. `authService.js`, `cryptoUtils.js`).

2. **Asynchronous Code**:
   - Always use `async/await` rather than raw promises (`.then()`).
   - Express controllers must be wrapped in `try/catch` blocks or use `asyncHandler` middleware to delegate errors to `errorMiddleware.js`.

3. **State Management**:
   - Use **Zustand** stores for global state (Auth, Cart, Poster, Product). Keep component local UI states (modal visibility, form inputs) inside React `useState`.

4. **Comments & JSDoc**:
   - Annotate Express routes with `@desc`, `@route`, and `@access` headers:
   ```javascript
   // @desc   Verify OTP and issue JWT access session
   // @route  POST /api/auth/verify-otp
   // @access Public
   ```
