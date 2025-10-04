/**
 * Utility functions for formatting pension-related data
 * Provides currency formatting, number formatting, and display utilities
 */

/**
 * Formats a number as Polish currency
 * @param {number} amount - The amount to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const {
    locale = 'pl-PL',
    currency = 'PLN',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;

  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 zł';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${amount.toLocaleString('pl-PL')} zł`;
  }
};

/**
 * Formats a number with Polish locale separators
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  return number.toLocaleString('pl-PL');
};

/**
 * Formats a percentage value
 * @param {number} value - The percentage value (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Gets animation duration based on user preferences
 * @param {number} baseDuration - Base duration in milliseconds
 * @returns {number} Adjusted duration
 */
export const getAnimationDuration = (baseDuration) => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReducedMotion ? 0 : baseDuration;
};

/**
 * Formats a large number with appropriate units (K, M, etc.)
 * @param {number} number - The number to format
 * @returns {string} Formatted number with units
 */
export const formatLargeNumber = (number) => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }
  
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  
  return number.toString();
};