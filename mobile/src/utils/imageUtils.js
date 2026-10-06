import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants';

// Determine backend base server URL without /api suffix
export const getBaseServerUrl = () => {
  if (API_BASE_URL) {
    const cleanUrl = API_BASE_URL.replace(/\/api\/?$/, '');
    if (cleanUrl) return cleanUrl;
  }
  // Fallback for Android emulator vs iOS/web
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
};

/**
 * Extracts a valid remote URL or returns null if invalid.
 * Supports string, array of strings/objects, or product/project objects.
 */
export const getImageUrl = (imageSource) => {
  if (!imageSource) return null;

  let rawUrl = null;

  // Case 1: Object passed (e.g., product or project kit)
  if (typeof imageSource === 'object' && !Array.isArray(imageSource)) {
    // Check array fields first
    const arrayCandidates = [imageSource.images, imageSource.image_urls, imageSource.gallery];
    for (const arr of arrayCandidates) {
      if (Array.isArray(arr) && arr.length > 0) {
        rawUrl = typeof arr[0] === 'string' ? arr[0] : arr[0]?.url || arr[0]?.uri;
        if (rawUrl) break;
      }
    }

    // Check single string fields if array fields yielded nothing
    if (!rawUrl) {
      rawUrl =
        imageSource.image ||
        imageSource.imageUrl ||
        imageSource.image_url ||
        imageSource.thumbnail ||
        imageSource.thumbnailUrl ||
        imageSource.url ||
        imageSource.uri;
    }
  }
  // Case 2: Array passed
  else if (Array.isArray(imageSource)) {
    if (imageSource.length > 0) {
      const first = imageSource[0];
      rawUrl = typeof first === 'string' ? first : first?.url || first?.uri;
    }
  }
  // Case 3: Direct string passed
  else if (typeof imageSource === 'string') {
    rawUrl = imageSource;
  }

  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return null;
  }

  const trimmed = rawUrl.trim();

  // Return full HTTP/HTTPS or data URIs directly
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Handle relative paths (e.g. /uploads/product1.png or uploads/product1.png)
  const baseUrl = getBaseServerUrl();
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${path}`;
};
