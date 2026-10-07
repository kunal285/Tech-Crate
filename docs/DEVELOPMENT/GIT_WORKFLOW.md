# Git & Branch Workflow Guide

This document outlines the Git branching model, commit conventions, and Pull Request procedures for **Tech Crate (TechCrate)**.

---

## 🌿 Branching Model

- **`main`**: Production-ready code branch. Protected branch.
- **`feature/<name>`**: New feature additions (e.g. `feature/poster-carousel-reorder`).
- **`fix/<name>`**: Bug fixes (e.g. `fix/metro-500-cache-reset`).
- **`docs/<name>`**: Documentation updates.

---

## 📝 Commit Conventions

Follow standard conventional commit messages:

```text
<type>: <short summary>

[optional description]
```

**Types**:
- `feat`: New user-facing feature.
- `fix`: Bug fix.
- `docs`: Documentation changes.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `test`: Adding missing tests or refactoring test suites.
- `chore`: Build process or tooling changes.

**Examples**:
```bash
git commit -m "feat: implement CaptchaBox for OTP verification"
git commit -m "fix: resolve Metro 500 resolveDependency error"
git commit -m "docs: add comprehensive Markdown documentation system"
```
