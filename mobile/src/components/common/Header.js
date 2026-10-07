import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import {Colors, Typography, Spacing, Shadows} from '../../theme';

const Header = ({
  title,
  subtitle,
  onBack,
  onBackPress,
  showBack = false,
  rightComponent,
  leftComponent,
  transparent = false,
  dark = false,
  style,
  titleStyle,
}) => {
  const insets = useSafeAreaInsets();
  let navigation = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigation = useNavigation();
  } catch {}

  const handleBack =
    onBack ||
    onBackPress ||
    (showBack
      ? () => {
          if (navigation?.canGoBack?.()) {
            navigation.goBack();
          }
        }
      : null);

  return (
    <View
      style={[
        styles.container,
        transparent ? styles.transparent : styles.solid,
        dark && styles.dark,
        {paddingTop: insets.top + Spacing.sm},
        style,
      ]}>
      <StatusBar
        barStyle={dark || !transparent ? 'light-content' : 'dark-content'}
        backgroundColor={dark ? Colors.primary : Colors.white}
        translucent={transparent}
      />
      <View style={styles.content}>
        {/* Left */}
        <View style={styles.left}>
          {handleBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <ArrowLeft
                size={20}
                color={dark ? Colors.white : Colors.textPrimary}
              />
            </TouchableOpacity>
          )}
          {leftComponent}
        </View>

        {/* Center */}
        <View style={styles.center}>
          {title && (
            <Text
              style={[
                styles.title,
                dark && styles.darkText,
                titleStyle,
              ]}
              numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, dark && styles.darkSubtitle]}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right */}
        <View style={styles.right}>
          {rightComponent}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  solid: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  transparent: {
    backgroundColor: Colors.transparent,
  },
  dark: {
    backgroundColor: Colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 48,
  },
  backButton: {
    padding: Spacing.xs,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.bold,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  darkText: {
    color: Colors.white,
  },
  darkSubtitle: {
    color: Colors.white + 'AA',
  },
});

export default Header;
