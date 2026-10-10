import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Text, Platform } from 'react-native';
import { Cpu, Image as ImageIcon } from 'lucide-react-native';
import { Colors } from '../../theme';
import { getImageUrl } from '../../utils/imageUtils';

/**
 * LazyImage / SafeImage - Unified lazy loading image component with
 * skeleton shimmer pulse, smooth progressive fade-in, and error fallback.
 */
const LazyImage = ({
  source,
  style,
  resizeMode = 'cover',
  placeholderIcon: PlaceholderIcon = Cpu,
  placeholderText = 'Tech Crate',
  containerStyle,
  fadeDuration = 280,
  showSkeleton = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Animation values for fade-in and pulsing skeleton
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const skeletonOpacity = useRef(new Animated.Value(0.35)).current;

  // Resolve source (supports string URL, { uri: ... }, or local require(...) assets)
  let resolvedUri = null;
  let isLocalAsset = false;

  if (typeof source === 'number') {
    isLocalAsset = true;
  } else {
    resolvedUri = getImageUrl(source);
  }

  // Reset state when source changes
  useEffect(() => {
    setLoading(true);
    setError(false);
    imageOpacity.setValue(0);
  }, [resolvedUri, source, imageOpacity]);

  // Pulsing skeleton animation loop while loading
  useEffect(() => {
    let animationLoop;
    if (loading && showSkeleton) {
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonOpacity, {
            toValue: 0.85,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonOpacity, {
            toValue: 0.35,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      );
      animationLoop.start();
    }
    return () => {
      if (animationLoop) animationLoop.stop();
    };
  }, [loading, showSkeleton, skeletonOpacity]);

  const handleLoadSuccess = () => {
    setLoading(false);
    setError(false);
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // Fallback view on error or missing image
  if ((!isLocalAsset && !resolvedUri) || error) {
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

  // Build image source object with caching policy for remote URIs
  const imageSource = isLocalAsset
    ? source
    : {
        uri: resolvedUri,
        cache: 'force-cache',
      };

  return (
    <View style={[styles.imageWrapper, style, containerStyle]}>
      {/* Animated Pulsing Skeleton Layer */}
      {loading && showSkeleton && (
        <Animated.View
          style={[
            styles.skeletonLayer,
            StyleSheet.absoluteFillObject,
            { opacity: skeletonOpacity },
          ]}
        />
      )}

      {/* Progressive Fade-in Image */}
      <Animated.Image
        source={imageSource}
        style={[
          styles.image,
          style,
          {
            opacity: imageOpacity,
          },
        ]}
        resizeMode={resizeMode}
        onLoad={handleLoadSuccess}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.backgroundSecondary || '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  skeletonLayer: {
    backgroundColor: '#CBD5E1',
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    backgroundColor: Colors.backgroundSecondary || '#F1F5F9',
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

export const SafeImage = LazyImage;
export { LazyImage };
export default LazyImage;
