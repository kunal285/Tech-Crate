import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Cpu } from 'lucide-react-native';
import { Colors } from '../../theme';
import { getImageUrl } from '../../utils/imageUtils';

const SafeImage = ({
  source,
  style,
  resizeMode = 'cover',
  placeholderIcon: PlaceholderIcon = Cpu,
  placeholderText = 'Tech Crate',
  containerStyle,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const resolvedUri = getImageUrl(source);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [resolvedUri]);

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  if (!resolvedUri || error) {
    return (
      <View style={[styles.placeholderContainer, style, containerStyle]}>
        {typeof PlaceholderIcon === 'function' || typeof PlaceholderIcon === 'object' ? (
          <PlaceholderIcon size={24} color={Colors.textMuted || '#94A3B8'} />
        ) : (
          <Text style={styles.placeholderIcon}>{PlaceholderIcon}</Text>
        )}
        <Text style={styles.placeholderText} numberOfLines={1}>
          {placeholderText}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.imageWrapper, style, containerStyle]}>
      <Image
        source={{ uri: resolvedUri }}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      {loading && (
        <View style={[styles.loadingOverlay, StyleSheet.absoluteFillObject]}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.surfaceElevated || '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    backgroundColor: 'rgba(241, 245, 249, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    backgroundColor: Colors.surfaceElevated || '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: (Colors.border || '#E2E8F0') + '60',
  },
  placeholderIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted || '#94A3B8',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default SafeImage;
