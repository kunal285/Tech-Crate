import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import {Package, Cpu, Sparkles} from 'lucide-react-native';
import {Colors, Typography, Spacing} from '../../theme';
import useAuthStore from '../../store/authStore';

const {width, height} = Dimensions.get('window');

const SplashScreen = ({navigation, onFinish}) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isInitialized = useAuthStore(state => state.isInitialized);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo in
    const anim = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }),
    ]);
    anim.start(({finished} = {}) => {
      if (finished && typeof Animated !== 'undefined' && Animated.timing) {
        Animated.timing(taglineAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    });

    // Navigate after delay
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else if (navigation && typeof navigation.replace === 'function') {
        navigation.replace('Login');
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (anim && typeof anim.stop === 'function') {
        anim.stop();
      }
    };
  }, [isInitialized, isAuthenticated, fadeAnim, scaleAnim, taglineAnim, navigation, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark || '#0F172A'} />

      {/* Background gradient effect */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      {/* Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
        ]}>
        <View style={styles.logoImageWrapper}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.logoText}>Tech Crate</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, {opacity: taglineAnim}]}>
        Engineering Electronics & Project Kits
      </Animated.Text>

      {/* Core concept */}
      <Animated.View style={[styles.conceptRow, {opacity: taglineAnim}]}>
        {['Discover', '→', 'Learn', '→', 'Build', '→', 'Order'].map(
          (text, i) => (
            <Text
              key={i}
              style={[
                styles.conceptText,
                text === '→' && styles.arrow,
              ]}>
              {text}
            </Text>
          ),
        )}
      </Animated.View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: Colors.primaryLight,
    top: -width * 0.3,
    right: -width * 0.2,
    opacity: 0.3,
  },
  bgCircle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: Colors.primaryAccent,
    bottom: -width * 0.2,
    left: -width * 0.1,
    opacity: 0.2,
  },
  bgCircle3: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: Colors.secondary,
    bottom: height * 0.2,
    right: -width * 0.1,
    opacity: 0.15,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoImageWrapper: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
    shadowColor: Colors.primaryAccent || '#3B82F6',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoImg: {
    width: 100,
    height: 100,
  },
  logoText: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.white,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: Typography.fontSize.md,
    color: Colors.white + 'CC',
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    letterSpacing: Typography.letterSpacing.wide,
  },
  conceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  conceptText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.white + 'AA',
    fontWeight: Typography.fontWeight.semibold,
  },
  arrow: {
    color: Colors.secondary,
    fontSize: Typography.fontSize.base,
  },
  bottom: {
    position: 'absolute',
    bottom: Spacing['3xl'],
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white + '40',
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.secondary,
  },
});

export default SplashScreen;
