import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

export default function CaptchaBox({ captchaCode, onRefresh }) {
  // Pre-selected vibrant distinct colors for each letter
  const letterColors = ['#2563EB', '#D97706', '#059669', '#DC2626', '#7C3AED', '#DB2777'];

  return (
    <View style={styles.container}>
      <View style={styles.captchaGraphic}>
        {/* Background Security Grid Lines Effect */}
        <View style={styles.gridOverlay}>
          <View style={[styles.strikeLine, { transform: [{ rotate: '-8deg' }] }]} />
          <View style={[styles.strikeLine, { transform: [{ rotate: '12deg' }], top: '55%' }]} />
        </View>

        {/* Captcha Letters */}
        <View style={styles.lettersRow}>
          {captchaCode.split('').map((char, index) => {
            const charColor = letterColors[index % letterColors.length];
            const rotation = (index % 2 === 0 ? 1 : -1) * ((index * 3) % 10);
            return (
              <View
                key={index}
                style={[
                  styles.charBox,
                  { transform: [{ rotate: `${rotation}deg` }] },
                ]}>
                <Text style={[styles.charText, { color: charColor }]}>
                  {char}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={onRefresh}
        activeOpacity={0.7}
        accessibilityLabel="Refresh Captcha Code">
        <RefreshCw size={18} color={Colors.primary} />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 10,
  },
  captchaGraphic: {
    flex: 1,
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  strikeLine: {
    position: 'absolute',
    left: -10,
    right: -10,
    height: 1.5,
    backgroundColor: 'rgba(148, 163, 184, 0.45)',
  },
  lettersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
  },
  charBox: {
    paddingHorizontal: 2,
  },
  charText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 4,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 48,
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  refreshText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
});
