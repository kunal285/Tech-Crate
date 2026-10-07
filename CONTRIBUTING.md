# Contributing to Tech Crate (TechCrate)

Thank you for your interest in contributing to **Tech Crate**! We welcome contributions from engineers, students, open-source developers, and designers.

---

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before contributing.

---

## 🚀 Getting Started

1. **Fork the Repository**: Create a personal copy of the repository on GitHub.
2. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/Project-kart.git
   cd Project-kart
   ```
3. **Install Dependencies**:
   ```bash
   # Backend
   cd backend && npm install

   # Admin Panel
   cd ../admin && npm install

   # Mobile App
   cd ../mobile && npm install
   ```
4. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## 🛠️ Development Guidelines

- Follow existing coding style documented in [`docs/DEVELOPMENT/CODE_STYLE.md`](./docs/DEVELOPMENT/CODE_STYLE.md).
- Use **ES6+ JavaScript / JSX / TSX**.
- Ensure all input endpoints pass Zod schema validation.
- Do not commit sensitive environment credentials or API keys (`.env` files are git-ignored).

---

## 🧪 Testing Requirements

Before opening a Pull Request, run the automated test suite:

```bash
# Backend Security & Full E-Commerce Audit Suite
cd backend
npm test

# Mobile App Jest Suite
cd ../mobile
npm test
```

Ensure all tests pass cleanly.

---

## 📬 Submitting a Pull Request (PR)

1. Commit your changes with conventional commit messages (e.g. `feat: add coupon discount logic`, `fix: resolve Metro bundle caching error`).
2. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Open a Pull Request against the `main` branch.
4. Describe your changes clearly in the PR template.

---

## ❓ Need Help?

For bug reports or feature suggestions, please open a GitHub Issue or consult [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md).
