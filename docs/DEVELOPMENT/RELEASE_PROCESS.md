# Release Process Specification

This document describes the versioning policy, release checklist, and build artifact distribution for **Tech Crate**.

---

## 📦 Release Checklist

1. **Verify Automated Audit Suites**:
   ```bash
   cd backend
   node scripts/test_security_suite.js
   node scripts/test_full_ecommerce_audit.js
   ```
2. **Update Version**:
   - Update `version` field in `backend/package.json`, `admin/package.json`, and `mobile/package.json`.
   - Update `CHANGELOG.md` with release notes under new version heading.
3. **Build Admin Static Bundle**:
   ```bash
   cd admin && npm run build
   ```
4. **Build Mobile Release APK/AAB**:
   ```bash
   cd mobile/android && ./gradlew assembleRelease
   ```
5. **Git Tag & Release Creation**:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0 - Full E-Commerce Platform"
   git push origin v1.0.0
   ```
