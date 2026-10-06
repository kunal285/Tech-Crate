import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wrench, ChevronRight } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import SafeImage from '../common/SafeImage';

const ProjectCard = ({ kit, onPress, style }) => {
  if (!kit) return null;

  const title = kit.title || kit.name || 'Project Kit';
  const description = kit.description || kit.subtitle || 'Complete project kit with components';
  const price = kit.price ? `₹${kit.price.toLocaleString()}` : '₹1,499';
  const difficulty = kit.difficulty || 'Beginner';
  const category = kit.category || 'Electronics';

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.88}>
      {/* Image Container with Top Badge */}
      <View style={styles.imageContainer}>
        <SafeImage
          source={kit.images || kit.image || kit.imageUrl}
          style={styles.image}
          resizeMode="cover"
          placeholderIcon={Wrench}
          placeholderText={category}
        />
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{difficulty}</Text>
        </View>
      </View>

      {/* Card Content (Flow Layout, Non-absolute) */}
      <View style={styles.content}>
        <Text style={styles.categoryText} numberOfLines={1}>
          {category}
        </Text>
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.descText} numberOfLines={2}>
          {description}
        </Text>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>Kit Price</Text>
            <Text style={styles.priceText}>{price}</Text>
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.actionBtnText}>View Kit </Text>
              <ChevronRight size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: Colors.white || '#FFFFFF',
    borderRadius: BorderRadius.xl || 16,
    overflow: 'hidden',
    marginRight: Spacing.md || 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: (Colors.border || '#E2E8F0') + '80',
    ...(Shadows.md || {}),
  },
  imageContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
    backgroundColor: Colors.surfaceElevated || '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  difficultyBadge: {
    position: 'absolute',
    top: Spacing.xs || 8,
    left: Spacing.xs || 8,
    backgroundColor: Colors.secondary || '#F97316',
    borderRadius: BorderRadius.xs || 4,
    paddingHorizontal: Spacing.xs || 8,
    paddingVertical: 3,
    zIndex: 2,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    padding: Spacing.sm || 12,
    justifyContent: 'space-between',
    flex: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary || '#F97316',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  titleText: {
    fontSize: Typography.fontSize.base || 15,
    fontWeight: '700',
    color: Colors.textPrimary || '#0F172A',
    marginBottom: 4,
    lineHeight: 20,
  },
  descText: {
    fontSize: Typography.fontSize.xs || 12,
    color: Colors.textSecondary || '#475569',
    lineHeight: 16,
    marginBottom: Spacing.sm || 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs || 8,
    borderTopWidth: 1,
    borderTopColor: (Colors.border || '#E2E8F0') + '60',
  },
  priceLabel: {
    fontSize: 9,
    color: Colors.textMuted || '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  priceText: {
    fontSize: Typography.fontSize.base || 15,
    fontWeight: '800',
    color: Colors.primary || '#1E3A5F',
  },
  actionBtn: {
    backgroundColor: Colors.primary || '#1E3A5F',
    borderRadius: BorderRadius.sm || 8,
    paddingHorizontal: Spacing.sm || 10,
    paddingVertical: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default React.memo(ProjectCard);
