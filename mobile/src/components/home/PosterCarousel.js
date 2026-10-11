import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Image as ImageIcon, ArrowRight } from 'lucide-react-native';
import { Shadows } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_MARGIN = 16;
const BANNER_WIDTH = SCREEN_WIDTH - HORIZONTAL_MARGIN * 2;
// 16:9 Aspect Ratio
const BANNER_HEIGHT = Math.round(BANNER_WIDTH * (9 / 16));
const AUTO_SLIDE_INTERVAL = 4500; // 4.5 seconds

/**
 * Robust Poster Item with loading & error fallbacks, plus custom text & CTA button overlay
 */
const PosterItem = React.memo(({ poster, onPress }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const imgUri = poster?.imageUrl || poster?.image;
  const customText = poster?.customText || '';
  const subtitle = poster?.subtitle || '';
  const badgeText = poster?.badgeText || '';
  const buttonText = poster?.buttonText || '';
  const hasOverlay = Boolean(customText || subtitle || badgeText || buttonText);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress(poster)}
      style={styles.bannerItemWrapper}>
      <View style={styles.bannerCard}>
        {imgUri && !imageError ? (
          <>
            <Image
              source={{ uri: imgUri }}
              style={styles.bannerImage}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            {imageLoading && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="small" color="#02C9CC" />
              </View>
            )}

            {/* Custom Text and CTA Button Overlay */}
            {hasOverlay && (
              <View style={styles.overlayScrim}>
                {badgeText ? (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{badgeText.toUpperCase()}</Text>
                  </View>
                ) : null}

                {customText ? (
                  <Text style={styles.customHeadline} numberOfLines={2}>
                    {customText}
                  </Text>
                ) : null}

                {subtitle ? (
                  <Text style={styles.subtitleText} numberOfLines={1}>
                    {subtitle}
                  </Text>
                ) : null}

                {buttonText ? (
                  <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={() => onPress(poster)}
                    style={styles.ctaButton}>
                    <Text style={styles.ctaButtonText}>{buttonText}</Text>
                    <ArrowRight size={13} color="#061A3A" strokeWidth={2.8} />
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </>
        ) : (
          /* Branded Tech Crate Fallback Placeholder */
          <View style={styles.fallbackContainer}>
            <View style={styles.fallbackCircle}>
              <ImageIcon size={32} color="#02C9CC" />
            </View>
            <Text style={styles.fallbackBrand}>Tech Crate</Text>
            <Text style={styles.fallbackTitle} numberOfLines={1}>
              {customText || poster?.title || 'Exclusive Hardware Offer'}
            </Text>
            {buttonText ? (
              <View style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>{buttonText}</Text>
                <ArrowRight size={13} color="#061A3A" strokeWidth={2.8} />
              </View>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

/**
 * Skeleton Loader matching 16:9 banner dimensions
 */
const BannerSkeleton = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonCard}>
      <ActivityIndicator size="small" color="#034697" />
    </View>
  </View>
);

/**
 * Fully Dynamic Promotional Poster/Banner Carousel
 */
const PosterCarousel = ({ posters = [], isLoading = false, navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const flatListRef = useRef(null);
  const timerRef = useRef(null);

  const count = posters.length;

  /**
   * Centralized Poster Navigation Handler
   * Maps configured linkType, linkValue and buttonLink to real application routes
   */
  const handlePosterPress = useCallback(
    poster => {
      if (!poster) return;
      const { linkType, linkValue, buttonLink } = poster;

      try {
        // If buttonLink has explicit URL override
        if (buttonLink && (buttonLink.startsWith('http://') || buttonLink.startsWith('https://'))) {
          Linking.openURL(buttonLink).catch(err =>
            console.warn('[Poster Link Open Error]', err),
          );
          return;
        }

        // Target can be buttonLink (if set) or fallback to linkValue
        const targetValue = (buttonLink || linkValue || '').trim();

        switch (linkType) {
          case 'product':
            if (targetValue) {
              navigation.navigate('ProductDetail', {
                productId: targetValue,
                product: { _id: targetValue },
              });
            }
            break;

          case 'category':
            if (targetValue) {
              navigation.navigate('Category', {
                categoryId: targetValue,
                categoryName:
                  targetValue.charAt(0).toUpperCase() + targetValue.slice(1),
              });
            }
            break;

          case 'project':
            if (targetValue) {
              navigation.navigate('ProjectKitDetail', {
                kitId: targetValue,
                projectId: targetValue,
                id: targetValue,
                kit: { _id: targetValue },
                project: { _id: targetValue },
              });
            } else {
              navigation.navigate('Projects');
            }
            break;

          case 'search':
            navigation.navigate('Search', {
              screen: 'SearchMain',
              params: targetValue ? { query: targetValue } : {},
            });
            break;

          case 'screen':
            if (targetValue) {
              navigation.navigate(targetValue);
            }
            break;

          case 'url':
            if (targetValue && (targetValue.startsWith('http://') || targetValue.startsWith('https://'))) {
              Linking.openURL(targetValue).catch(err =>
                console.warn('[Poster Link Open Error]', err),
              );
            }
            break;

          case 'none':
          default:
            if (buttonLink && (buttonLink.startsWith('http://') || buttonLink.startsWith('https://'))) {
              Linking.openURL(buttonLink).catch(err =>
                console.warn('[Poster Link Open Error]', err),
              );
            }
            break;
        }
      } catch (navErr) {
        console.warn('[Poster Navigation Error]', navErr);
      }
    },
    [navigation],
  );

  /**
   * Auto-slide controller
   */
  useEffect(() => {
    // Only auto-slide if there are 2 or more posters and user is not currently dragging
    if (count <= 1 || isInteracting) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % count;
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({
            offset: nextIndex * BANNER_WIDTH,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [count, isInteracting]);

  /**
   * Handle scroll calculation for pagination dots
   */
  const handleScroll = useCallback(event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    if (BANNER_WIDTH > 0) {
      const index = Math.round(offsetX / BANNER_WIDTH);
      if (index >= 0) {
        setActiveIndex(index);
      }
    }
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    setIsInteracting(true);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    setIsInteracting(false);
  }, []);

  const handleMomentumScrollEnd = useCallback(event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    if (BANNER_WIDTH > 0) {
      const index = Math.round(offsetX / BANNER_WIDTH);
      setActiveIndex(index);
    }
    setIsInteracting(false);
  }, []);

  // If loading and no posters yet, show sleek skeleton
  if (isLoading && count === 0) {
    return <BannerSkeleton />;
  }

  // If no active posters, hide carousel completely (0 blank height)
  if (count === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={posters}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}
        snapToAlignment="start"
        bounces={false}
        keyExtractor={(item, index) => item._id || item.id || `poster-${index}`}
        renderItem={({ item }) => (
          <PosterItem poster={item} onPress={handlePosterPress} />
        )}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => ({
          length: BANNER_WIDTH,
          offset: BANNER_WIDTH * index,
          index,
        })}
      />

      {/* Pagination Dots (Hidden if only 1 poster) */}
      {count > 1 && (
        <View style={styles.paginationRow}>
          {posters.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: HORIZONTAL_MARGIN,
    marginTop: 10,
  },
  bannerItemWrapper: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
  bannerCard: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#032762',
    position: 'relative',
    ...Shadows.md,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 39, 98, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#061A3A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fallbackCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(2, 201, 204, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  fallbackBrand: {
    color: '#02C9CC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fallbackTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
    opacity: 0.85,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    transition: 'all 0.2s',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#F97316', // Tech Crate Accent Orange
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
  skeletonContainer: {
    marginHorizontal: HORIZONTAL_MARGIN,
    marginTop: 10,
  },
  skeletonCard: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingTop: 18,
    backgroundColor: 'rgba(3, 39, 98, 0.78)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(2, 201, 204, 0.25)',
    justifyContent: 'flex-end',
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F97316', // Tech Crate Accent Orange
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  customHeadline: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitleText: {
    color: '#E2E8F0',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#02C9CC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    marginTop: 6,
    gap: 4,
    shadowColor: '#02C9CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  ctaButtonText: {
    color: '#061A3A',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default React.memo(PosterCarousel);
