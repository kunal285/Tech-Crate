// TechCrate Shared Design System Tokens
// Synchronized 1:1 with React Native Mobile App (mobile/src/theme/colors.js & typography.js)

export const BRAND = {
  navy: '#032762',          // Mobile BRAND.primaryNavy (Top App Bar, headings, stat values, AI banner)
  primaryNavy: '#032762',   // Top App Bar, headings, stat values, AI banner
  secondaryBlue: '#034697', // Sub-banners, bot circles
  blue: '#0262B8',          // Secondary interactive blue
  primary: '#2563EB',       // Main CTA buttons, links, price highlights
  primaryDark: '#1D4ED8',   // Button active/hover state
  primaryLight: '#DBEAFE',  // Light blue tint
  secondary: '#7C3AED',     // Purple category accent / project kits
  orange: '#F97316',        // Mobile BRAND.accentOrange (Badges, active states)
  accentOrange: '#F97316',  // Discount badges (% OFF), notification badge pills, carousel active dots
  cyan: '#02C9CC',          // Carousel CTA button, bot border
  brightCyan: '#03E0E4',
  darkNavy: '#061A3A',
  white: '#FFFFFF',
  background: '#F8FAFC',    // Mobile app main canvas background
  backgroundSecondary: '#F1F5F9', // Icon button circle backgrounds, subtle separators
  surface: '#FFFFFF',       // Card and dialog backgrounds
  card: '#FFFFFF',
};

export const COLORS = {
  ...BRAND,
  textPrimary: '#0F172A',   // Slate 900
  textSecondary: '#475569', // Slate 600
  textTertiary: '#64748B',  // Slate 500
  textMuted: '#94A3B8',     // Slate 400
  textDisabled: '#CBD5E1',  // Slate 300

  border: '#E2E8F0',        // Standard card border
  borderLight: '#F1F5F9',   // Light dividers
  divider: '#E5E7EB',

  success: '#16A34A',
  successBackground: '#DCFCE7',

  warning: '#F59E0B',
  warningBackground: '#FEF3C7',

  error: '#DC2626',
  errorBackground: '#FEE2E2',

  star: '#F59E0B',
  starEmpty: '#E2E8F0',
};

export const BORDER_RADIUS = {
  xs: '4px',
  sm: '8px',
  base: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
};

export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  lg: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
};

export default { BRAND, COLORS, BORDER_RADIUS, SHADOWS };
