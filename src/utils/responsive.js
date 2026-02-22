import { Dimensions, Platform } from 'react-native';

// Get dimensions dynamically
const getDimensions = () => Dimensions.get('window');

// Device type detection - call dynamically
export const isTablet = () => {
  const { width } = getDimensions();
  return width >= 768;
};

// Also export as static for backward compatibility (calculated at module load)
const { width: initialWidth } = getDimensions();
export const isTabletStatic = initialWidth >= 768;
export const isLargeTabletStatic = initialWidth >= 1024;

export const isIPad = () => {
  return Platform.OS === 'ios' && isTablet();
};

export const isLargeTablet = () => {
  const { width } = getDimensions();
  return width >= 1024; // iPad Pro 12.9"
};

export const isSmallDevice = () => {
  const { width } = getDimensions();
  return width < 360;
};

// Responsive dimensions
export const getResponsiveWidth = () => {
  const { width } = getDimensions();
  if (isLargeTablet()) {
    // For very large tablets, limit max width for better readability
    return Math.min(width, 900);
  }
  if (isTablet()) {
    return Math.min(width, 800);
  }
  return width;
};

// Responsive padding
export const getHorizontalPadding = () => {
  if (isLargeTablet()) return 32;
  if (isTablet()) return 24;
  return 16;
};

// Responsive font sizes
export const getFontSize = (mobile, tablet, largeTablet) => {
  if (isLargeTablet()) return largeTablet;
  if (isTablet()) return tablet;
  return mobile;
};

// Responsive spacing
export const getSpacing = (mobile, tablet, largeTablet) => {
  if (isLargeTablet()) return largeTablet;
  if (isTablet()) return tablet;
  return mobile;
};

// Max width for content containers
export const getMaxContentWidth = () => {
  if (isLargeTablet()) return 900;
  if (isTablet()) return 800;
  return '100%';
};

// Card width for grid layouts
export const getCardWidth = (columns = 1, gap = 16) => {
  const containerWidth = getResponsiveWidth();
  const padding = getHorizontalPadding() * 2;
  const totalGap = gap * (columns - 1);
  return (containerWidth - padding - totalGap) / columns;
};

// Get current dimensions
export const getWidth = () => getDimensions().width;
export const getHeight = () => getDimensions().height;

export default {
  isTablet,
  isIPad,
  isLargeTablet,
  isSmallDevice,
  getWidth,
  getHeight,
  getResponsiveWidth,
  getHorizontalPadding,
  getFontSize,
  getSpacing,
  getMaxContentWidth,
  getCardWidth,
};

