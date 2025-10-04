/**
 * Utility functions for accessibility features in pension results display
 * Provides ARIA labels, screen reader support, and keyboard navigation helpers
 */

/**
 * Generates an accessible currency label for screen readers
 * @param {number} amount - The currency amount
 * @param {string} context - Additional context for the amount
 * @returns {string} Accessible label
 */
export const generateCurrencyAriaLabel = (amount, context = '') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${context}: brak danych o kwocie`;
  }

  const formattedAmount = amount.toLocaleString('pl-PL');
  const contextText = context ? `${context}: ` : '';
  
  return `${contextText}${formattedAmount} złotych miesięcznie`;
};

/**
 * Generates accessible labels for pension comparison
 * @param {number} realAmount - Real pension amount
 * @param {number} adjustedAmount - Adjusted pension amount
 * @returns {Object} Object with accessible labels
 */
export const generateComparisonAriaLabels = (realAmount, adjustedAmount) => {
  const realLabel = generateCurrencyAriaLabel(realAmount, 'Rzeczywista wysokość emerytury');
  const adjustedLabel = generateCurrencyAriaLabel(adjustedAmount, 'Urealniona wysokość emerytury');
  
  const difference = adjustedAmount - realAmount;
  const differenceText = difference > 0 
    ? `Urealniona kwota jest wyższa o ${Math.abs(difference).toLocaleString('pl-PL')} złotych`
    : `Urealniona kwota jest niższa o ${Math.abs(difference).toLocaleString('pl-PL')} złotych`;

  return {
    real: realLabel,
    adjusted: adjustedLabel,
    comparison: `Porównanie emerytur: ${realLabel}. ${adjustedLabel}. ${differenceText}`,
  };
};

/**
 * Creates accessible announcement for dynamic content changes
 * @param {string} message - The message to announce
 * @param {string} priority - Priority level ('polite' or 'assertive')
 * @returns {void}
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  document.body.appendChild(announcement);
  announcement.textContent = message;
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Generates keyboard navigation instructions
 * @returns {string} Instructions for keyboard users
 */
export const getKeyboardInstructions = () => {
  return 'Użyj klawisza Tab aby nawigować między elementami, Enter lub spacja aby aktywować przyciski, Escape aby zamknąć okna dialogowe';
};

/**
 * Creates focus trap for modal dialogs
 * @param {HTMLElement} element - The element to trap focus within
 * @returns {Function} Function to remove focus trap
 */
export const createFocusTrap = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  if (firstElement) {
    firstElement.focus();
  }

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Validates color contrast for accessibility
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @returns {Object} Contrast ratio and compliance info
 */
export const checkColorContrast = (foreground, background) => {
  // Simple contrast ratio calculation
  // In a real implementation, you'd use a proper color contrast library
  const getLuminance = (color) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: ratio.toFixed(2),
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
  };
};