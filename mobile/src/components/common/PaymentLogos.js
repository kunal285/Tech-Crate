import React, { useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/**
 * ==============================================================================
 * 🖼️ PAYMENT LOGO CONFIGURATION (Local require() OR Remote HTTP/HTTPS URLs)
 * ==============================================================================
 *
 * You can provide logos in ANY of the following formats:
 * 1. Remote HTTP/HTTPS string URL:  'https://cdn.example.com/logos/gpay.png'
 * 2. Remote URI object:            { uri: 'https://cdn.example.com/logos/gpay.png' }
 * 3. Local require() image:        require('../../assets/images/gpay.png')
 * 4. null / undefined:             Uses built-in pixel-perfect vector SVG icons
 */

// Popular high-resolution external CDN links ready for instant use:
export const EXTERNAL_PAYMENT_LOGOS = {
  gpay: 'https://res.cloudinary.com/dmy7cmuq9/image/upload/v1791451854/ptyr7yadnog4ufzjlofc.png',
  phonepe: 'https://res.cloudinary.com/dmy7cmuq9/image/upload/v1791451854/wkkmojdfbh3odxjizt9y.png',
  paytm: 'https://res.cloudinary.com/dmy7cmuq9/image/upload/v1791451854/c84vddqelm64dudo0pbx.png',
  cred: 'https://res.cloudinary.com/dmy7cmuq9/image/upload/v1791451854/rv4ys8af4xfps9itpcst.png',
  bhim: 'https://res.cloudinary.com/dmy7cmuq9/image/upload/v1791451854/iom5hehtirou4icsrrjr.png',
  amazonpay: 'https://res.cloudinary.com/dmy7cmuq9/image/upload/v1791451857/edtav9gmn85jogm4bmvw.png',
  whatsapp: 'https://res.cloudinary.com/dmy7cmuq9/image/upload/v1791451856/tclmtz0qloaquuf5udbu.png',
  all: 'https://res.cloudinary.com/dmy7cmuq9/image/upload/v1791451855/o5xizciwbbkqoydevjnd.png', // Generic UPI
};

// Active Custom Logos - supports local require() OR external URL strings / { uri: '...' }
export const CUSTOM_PAYMENT_LOGOS = {
  gpay: EXTERNAL_PAYMENT_LOGOS.gpay,
  phonepe: EXTERNAL_PAYMENT_LOGOS.phonepe,
  paytm: EXTERNAL_PAYMENT_LOGOS.paytm,
  cred: EXTERNAL_PAYMENT_LOGOS.cred,
  bhim: EXTERNAL_PAYMENT_LOGOS.bhim,
  amazonpay: EXTERNAL_PAYMENT_LOGOS.amazonpay,
  whatsapp: EXTERNAL_PAYMENT_LOGOS.whatsapp,
  all: EXTERNAL_PAYMENT_LOGOS.all,
};

/**
 * Helper to normalize string URLs or require() into valid React Native Image source
 */
export const resolveImageSource = (source) => {
  if (!source) return null;
  if (typeof source === 'string') {
    return { uri: source.trim() };
  }
  return source;
};

/**
 * Safe Image Component that falls back to vector SVG if remote URL fails or is unavailable
 */
const SafeLogoImage = ({ source, size, fallbackComponent: Fallback }) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const resolvedSource = resolveImageSource(source);

  if (!resolvedSource || loadFailed) {
    return <Fallback size={size} />;
  }

  return (
    <View style={[styles.logoWrap, { width: size, height: size, backgroundColor: '#FFFFFF' }]}>
      <Image
        source={resolvedSource}
        style={{ width: size * 0.85, height: size * 0.85, borderRadius: 8 }}
        resizeMode="contain"
        onError={() => setLoadFailed(true)}
      />
    </View>
  );
};

// ==========================================
// Vector Fallbacks (used if custom image fails or is null)
// ==========================================

export const GPayLogo = ({ size = 36 }) => {
  if (CUSTOM_PAYMENT_LOGOS.gpay) {
    return <SafeLogoImage source={CUSTOM_PAYMENT_LOGOS.gpay} size={size} fallbackComponent={GPayVector} />;
  }
  return <GPayVector size={size} />;
};

const GPayVector = ({ size = 36 }) => (
  <View style={[styles.logoWrap, { width: size, height: size, backgroundColor: '#FFFFFF' }]}>
    <Svg width={size * 0.75} height={size * 0.75} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  </View>
);

export const PhonePeLogo = ({ size = 36 }) => {
  if (CUSTOM_PAYMENT_LOGOS.phonepe) {
    return <SafeLogoImage source={CUSTOM_PAYMENT_LOGOS.phonepe} size={size} fallbackComponent={PhonePeVector} />;
  }
  return <PhonePeVector size={size} />;
};

const PhonePeVector = ({ size = 36 }) => (
  <View style={[styles.logoWrap, { width: size, height: size, backgroundColor: '#5F259F' }]}>
    <Svg width={size * 0.7} height={size * 0.7} viewBox="0 0 40 40">
      <Path fill="#FFFFFF" d="M20 5C11.72 5 5 11.72 5 20s6.72 15 15 15 15-6.72 15-15S28.28 5 20 5zm5.5 17.8c-.8 1.8-2.3 3.1-4.3 3.7v3.5h-2.8v-3.4h-2.1v-2.4h2.1v-5.9h-2.1V16h5.3c2.3 0 4.1 1.4 4.1 3.5 0 1.2-.5 2.3-1.4 3.3.4.3.8.7 1.2 1.2zm-4.3-3.9h-2.8v3.5h2.8c1 0 1.7-.7 1.7-1.7s-.7-1.8-1.7-1.8z" />
    </Svg>
  </View>
);

export const PaytmLogo = ({ size = 36 }) => {
  if (CUSTOM_PAYMENT_LOGOS.paytm) {
    return <SafeLogoImage source={CUSTOM_PAYMENT_LOGOS.paytm} size={size} fallbackComponent={PaytmVector} />;
  }
  return <PaytmVector size={size} />;
};

const PaytmVector = ({ size = 36 }) => (
  <View style={[styles.logoWrap, { width: size, height: size, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' }]}>
    <View style={styles.paytmRow}>
      <Text style={[styles.paytmTextDark, { fontSize: size * 0.3 }]}>pay</Text>
      <Text style={[styles.paytmTextBlue, { fontSize: size * 0.3 }]}>tm</Text>
    </View>
  </View>
);

export const CredLogo = ({ size = 36 }) => {
  if (CUSTOM_PAYMENT_LOGOS.cred) {
    return <SafeLogoImage source={CUSTOM_PAYMENT_LOGOS.cred} size={size} fallbackComponent={CredVector} />;
  }
  return <CredVector size={size} />;
};

const CredVector = ({ size = 36 }) => (
  <View style={[styles.logoWrap, { width: size, height: size, backgroundColor: '#111827' }]}>
    <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 32 32">
      <Path fill="#FFFFFF" d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4zm0 20.8c-4.85 0-8.8-3.95-8.8-8.8s3.95-8.8 8.8-8.8 8.8 3.95 8.8 8.8-3.95 8.8-8.8 8.8z" />
      <Path fill="#FFFFFF" d="M16 11.2a4.8 4.8 0 100 9.6 4.8 4.8 0 000-9.6z" />
    </Svg>
  </View>
);

export const BhimLogo = ({ size = 36 }) => {
  if (CUSTOM_PAYMENT_LOGOS.bhim) {
    return <SafeLogoImage source={CUSTOM_PAYMENT_LOGOS.bhim} size={size} fallbackComponent={BhimVector} />;
  }
  return <BhimVector size={size} />;
};

const BhimVector = ({ size = 36 }) => (
  <View style={[styles.logoWrap, { width: size, height: size, backgroundColor: '#0284C7' }]}>
    <Svg width={size * 0.7} height={size * 0.7} viewBox="0 0 40 40">
      <Path fill="#FF9933" d="M12 10l8-6 8 6-8 6z" />
      <Path fill="#FFFFFF" d="M12 20l8-6 8 6-8 6z" />
      <Path fill="#138808" d="M12 30l8-6 8 6-8 6z" />
    </Svg>
  </View>
);

export const AmazonPayLogo = ({ size = 36 }) => {
  if (CUSTOM_PAYMENT_LOGOS.amazonpay) {
    return <SafeLogoImage source={CUSTOM_PAYMENT_LOGOS.amazonpay} size={size} fallbackComponent={AmazonPayVector} />;
  }
  return <AmazonPayVector size={size} />;
};

const AmazonPayVector = ({ size = 36 }) => (
  <View style={[styles.logoWrap, { width: size, height: size, backgroundColor: '#232F3E' }]}>
    <Svg width={size * 0.75} height={size * 0.75} viewBox="0 0 36 36">
      <Path fill="#FF9900" d="M8 22c5.5 3.5 14.5 3.5 20 0 .5-.3.2-.8-.3-.6-4.8 2.8-13.8 2.8-19.4 0-.5-.3-.8.3-.3.6z" />
      <Path fill="#FF9900" d="M27.5 21.2c-.3-.4-1.8-.2-2.5-.1-.2 0-.3.2-.1.3.9.7 1.8.8 2.4.4.2-.1.3-.4.2-.6z" />
    </Svg>
  </View>
);

export const WhatsAppPayLogo = ({ size = 36 }) => {
  if (CUSTOM_PAYMENT_LOGOS.whatsapp) {
    return <SafeLogoImage source={CUSTOM_PAYMENT_LOGOS.whatsapp} size={size} fallbackComponent={WhatsAppPayVector} />;
  }
  return <WhatsAppPayVector size={size} />;
};

const WhatsAppPayVector = ({ size = 36 }) => (
  <View style={[styles.logoWrap, { width: size, height: size, backgroundColor: '#25D366' }]}>
    <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 32 32">
      <Path fill="#FFFFFF" d="M16 3C8.82 3 3 8.82 3 16c0 2.48.7 4.8 1.92 6.78L3 29l6.42-1.88C11.3 28.24 13.58 29 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm6.46 18.28c-.28.78-1.62 1.48-2.26 1.58-.58.08-1.34.12-3.86-.92-3.22-1.32-5.28-4.6-5.44-4.82-.16-.22-1.3-1.74-1.3-3.32 0-1.58.82-2.36 1.12-2.68.28-.32.62-.4 1.1-.4.18 0 .34 0 .48.02.4.02.6.06.86.68.32.78 1.1 2.68 1.2 2.88.1.2.16.44.02.7-.12.26-.2.42-.38.64-.18.22-.38.48-.54.66-.18.18-.36.38-.16.74.22.36.96 1.58 2.06 2.56 1.42 1.26 2.62 1.66 2.98 1.84.36.18.58.16.8-.1.22-.24.96-1.12 1.22-1.5.26-.38.52-.32.88-.18.36.14 2.28 1.08 2.68 1.28.4.2.66.3.76.46.1.18.1 1.02-.18 1.8z" />
    </Svg>
  </View>
);

export const UpiGenericLogo = ({ size = 36 }) => {
  if (CUSTOM_PAYMENT_LOGOS.all) {
    return <SafeLogoImage source={CUSTOM_PAYMENT_LOGOS.all} size={size} fallbackComponent={UpiGenericVector} />;
  }
  return <UpiGenericVector size={size} />;
};

const UpiGenericVector = ({ size = 36 }) => (
  <View style={[styles.logoWrap, { width: size, height: size, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }]}>
    <Svg width={size * 0.75} height={size * 0.75} viewBox="0 0 40 40">
      <Path fill="#097938" d="M12 8l10 12-10 12h7l10-12L19 8z" />
      <Path fill="#ED7524" d="M22 8l10 12-10 12h7l10-12L29 8z" />
    </Svg>
  </View>
);

/**
 * Main helper: Returns image (external URL or local require) or vector for any given app ID
 */
export const getAppLogo = (appId, size = 40) => {
  const customSource = CUSTOM_PAYMENT_LOGOS[appId];

  if (customSource) {
    switch (appId) {
      case 'gpay':
        return <GPayLogo size={size} />;
      case 'phonepe':
        return <PhonePeLogo size={size} />;
      case 'paytm':
        return <PaytmLogo size={size} />;
      case 'cred':
        return <CredLogo size={size} />;
      case 'bhim':
        return <BhimLogo size={size} />;
      case 'amazonpay':
        return <AmazonPayLogo size={size} />;
      case 'whatsapp':
        return <WhatsAppPayLogo size={size} />;
      case 'all':
      default:
        return <UpiGenericLogo size={size} />;
    }
  }

  // Fallback to built-in vector logos
  switch (appId) {
    case 'gpay':
      return <GPayVector size={size} />;
    case 'phonepe':
      return <PhonePeVector size={size} />;
    case 'paytm':
      return <PaytmVector size={size} />;
    case 'cred':
      return <CredVector size={size} />;
    case 'bhim':
      return <BhimVector size={size} />;
    case 'amazonpay':
      return <AmazonPayVector size={size} />;
    case 'whatsapp':
      return <WhatsAppPayVector size={size} />;
    case 'all':
    default:
      return <UpiGenericVector size={size} />;
  }
};

const styles = StyleSheet.create({
  logoWrap: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  paytmRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paytmTextDark: {
    fontWeight: '900',
    color: '#002E6E',
    letterSpacing: -0.5,
  },
  paytmTextBlue: {
    fontWeight: '900',
    color: '#00BAF2',
    letterSpacing: -0.5,
  },
});

export default {
  CUSTOM_PAYMENT_LOGOS,
  EXTERNAL_PAYMENT_LOGOS,
  resolveImageSource,
  getAppLogo,
  GPayLogo,
  PhonePeLogo,
  PaytmLogo,
  CredLogo,
  BhimLogo,
  AmazonPayLogo,
  WhatsAppPayLogo,
  UpiGenericLogo,
};
