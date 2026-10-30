/**
 * ImageKit URL Transformation Utility
 * Automatically transforms ImageKit media URLs to utilize edge WebP/AVIF format,
 * compression, and dynamic resizing.
 */

export const optimizeImage = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url;

  // Do not transform videos, SVG files, or external third-party URLs that aren't ImageKit
  const isVideo = /\.(mp4|webm|mov|mkv|m4v)($|\?)/i.test(url) || url.endsWith('/ik-video.mp4');
  const isSvg = /\.svg($|\?)/i.test(url);
  if (isVideo || isSvg || !url.includes('ik.imagekit.io')) {
    return url;
  }

  // If already contains transformation parameters, keep existing
  if (url.includes('tr=')) {
    return url;
  }

  const { width = 400, quality = 80, format = 'auto' } = options;

  const transforms = [];
  if (width) transforms.push(`w-${width}`);
  if (quality) transforms.push(`q-${quality}`);
  if (format) transforms.push(`f-${format}`);

  if (transforms.length === 0) return url;

  const trString = `tr=${transforms.join(',')}`;
  const separator = url.includes('?') ? '&' : '?';

  return `${url}${separator}${trString}`;
};

/**
 * Thumbnail preset (120px) for avatars and icons
 */
export const getThumbnailUrl = (url) => optimizeImage(url, { width: 120, quality: 80 });

/**
 * Card preset (500px) for creator cards and campaign previews
 */
export const getCardImageUrl = (url) => optimizeImage(url, { width: 500, quality: 80 });

/**
 * Banner preset (1000px) for campaign banners and full profiles
 */
export const getBannerImageUrl = (url) => optimizeImage(url, { width: 1000, quality: 85 });

export default optimizeImage;
