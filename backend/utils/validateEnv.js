/**
 * Production Environment Configuration Validator
 * Ensures mandatory production secrets are set and prevents startup with dangerous defaults.
 */

const validateEnv = () => {
  const insecureDefaults = [
    'your_jwt_secret_key_here',
    'secret',
    'TechCrate_jwt_secret_key_2026',
    'replace_me',
    'test_secret',
  ];

  if (process.env.NODE_ENV === 'production') {
    const required = ['JWT_SECRET', 'MONGO_URI'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      console.error(`[FATAL] Missing mandatory production environment variables: ${missing.join(', ')}`);
      process.exit(1);
    }
    if (insecureDefaults.includes(process.env.JWT_SECRET)) {
      console.error('[FATAL] Insecure default JWT_SECRET detected in production environment.');
      process.exit(1);
    }
  } else {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'dev_techcrate_jwt_secret_2026';
    }
  }
};

module.exports = validateEnv;
