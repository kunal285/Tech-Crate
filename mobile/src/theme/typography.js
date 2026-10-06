import {Platform, Dimensions} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive scaling
const guidelineBaseWidth = 390;
const scale = size => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const verticalScale = size => (SCREEN_HEIGHT / 844) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const Typography = {
  // Font Families
  fontFamily: {
    regular: Platform.select({android: 'Roboto', ios: 'System'}),
    medium: Platform.select({android: 'Roboto-Medium', ios: 'System'}),
    bold: Platform.select({android: 'Roboto-Bold', ios: 'System'}),
    light: Platform.select({android: 'Roboto-Light', ios: 'System'}),
  },

  // Font Sizes
  fontSize: {
    xs: moderateScale(11),
    sm: moderateScale(13),
    base: moderateScale(15),
    md: moderateScale(16),
    lg: moderateScale(18),
    xl: moderateScale(20),
    '2xl': moderateScale(24),
    '3xl': moderateScale(28),
    '4xl': moderateScale(32),
    '5xl': moderateScale(38),
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },

  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

const Spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  base: moderateScale(16),
  lg: moderateScale(20),
  xl: moderateScale(24),
  '2xl': moderateScale(32),
  '3xl': moderateScale(40),
  '4xl': moderateScale(48),
  '5xl': moderateScale(64),
};

const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  base: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export {
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  scale,
  verticalScale,
  moderateScale,
};
