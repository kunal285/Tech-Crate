import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import {Colors, Typography, Spacing, BorderRadius, Shadows} from '../../theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? Colors.white : Colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Text style={styles.iconLeft}>{icon}</Text>
          )}
          <Text
            style={[
              styles.text,
              styles[`text_${variant}`],
              styles[`text_${size}`],
              isDisabled && styles.textDisabled,
              textStyle,
            ]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Text style={styles.iconRight}>{icon}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullWidth: {width: '100%'},

  // Variants
  primary: {
    backgroundColor: Colors.primary,
    ...Shadows.md,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    ...Shadows.md,
  },
  outline: {
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  outlineSecondary: {
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
  },
  ghost: {
    backgroundColor: Colors.transparent,
  },
  danger: {
    backgroundColor: Colors.error,
  },
  success: {
    backgroundColor: Colors.success,
  },
  light: {
    backgroundColor: Colors.surfaceElevated,
  },

  // Text Variants
  text_primary: {color: Colors.white, fontWeight: Typography.fontWeight.semibold},
  text_secondary: {color: Colors.white, fontWeight: Typography.fontWeight.semibold},
  text_outline: {color: Colors.primary, fontWeight: Typography.fontWeight.semibold},
  text_outlineSecondary: {color: Colors.secondary, fontWeight: Typography.fontWeight.semibold},
  text_ghost: {color: Colors.primary, fontWeight: Typography.fontWeight.semibold},
  text_danger: {color: Colors.white, fontWeight: Typography.fontWeight.semibold},
  text_success: {color: Colors.white, fontWeight: Typography.fontWeight.semibold},
  text_light: {color: Colors.textPrimary, fontWeight: Typography.fontWeight.semibold},

  // Sizes
  sm: {paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, minHeight: 36},
  md: {paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm + 2, minHeight: 44},
  lg: {paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, minHeight: 52},
  xl: {paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.base, minHeight: 56},

  text_sm: {fontSize: Typography.fontSize.sm},
  text_md: {fontSize: Typography.fontSize.base},
  text_lg: {fontSize: Typography.fontSize.md},
  text_xl: {fontSize: Typography.fontSize.lg},

  // States
  disabled: {opacity: 0.5},
  textDisabled: {},

  // Icons
  iconLeft: {marginRight: Spacing.xs, fontSize: Typography.fontSize.base},
  iconRight: {marginLeft: Spacing.xs, fontSize: Typography.fontSize.base},

  // Text base
  text: {
    letterSpacing: Typography.letterSpacing.wide,
  },
});

export default Button;
