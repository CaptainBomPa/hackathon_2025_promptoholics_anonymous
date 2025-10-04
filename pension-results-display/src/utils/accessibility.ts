/**
 * Accessibility utilities for pension results display
 * Provides ARIA labels, screen reader support, and keyboard navigation helpers
 */

import { accessibilityFeatures } from '@/types';

/**
 * Generate ARIA label for currency amount
 */
export const generateCurrencyAriaLabel = (amount: number, description: string): string => {
  const formattedAmount = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  return `${description}: ${formattedAmount}`;
};

/**
 * Generate ARIA label for percentage
 */
export const generatePercentageAriaLabel = (value: number, description: string): string => {
  const formattedPercentage = new Intl.NumberFormat('pl-PL', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
  
  return `${description}: ${formattedPercentage}`;
};

/**
 * Generate ARIA label for comparison
 */
export const generateComparisonAriaLabel = (
  userAmount: number,
  averageAmount: number,
  description: string
): string => {
  const difference = userAmount - averageAmount;
  const percentageDiff = ((difference / averageAmount) * 100);
  
  const comparisonText = difference >= 0 
    ? `wyższa o ${Math.abs(percentageDiff).toFixed(1)}%`
    : `niższa o ${Math.abs(percentageDiff).toFixed(1)}%`;
    
  return `${description}: Twoja emerytura jest ${comparisonText} od średniej`;
};

/**
 * Generate ARIA label for delay benefits
 */
export const generateDelayBenefitsAriaLabel = (
  currentAmount: number,
  delayedAmount: number,
  years: number
): string => {
  const increase = delayedAmount - currentAmount;
  const percentageIncrease = ((increase / currentAmount) * 100).toFixed(1);
  
  const yearText = years === 1 ? 'rok' : years < 5 ? 'lata' : 'lat';
  
  return `Odroczenie emerytury o ${years} ${yearText} zwiększy ją o ${percentageIncrease}%`;
};

/**
 * Generate ARIA live region announcement
 */
export const generateLiveRegionAnnouncement = (message: string): string => {
  return `Aktualizacja wyników: ${message}`;
};

/**
 * Get ARIA label for replacement rate gauge
 */
export const getReplacementRateAriaLabel = (rate: number): string => {
  const description = rate >= 70 
    ? 'bardzo dobra' 
    : rate >= 50 
    ? 'dobra' 
    : rate >= 30 
    ? 'umiarkowana' 
    : 'niska';
    
  return `Stopa zastąpienia: ${rate.toFixed(1)}%, ${description}`;
};

/**
 * Get ARIA label for expectation gap indicator
 */
export const getExpectationGapAriaLabel = (
  expected: number,
  actual: number
): string => {
  const gap = expected - actual;
  
  if (gap <= 0) {
    return 'Twoja prognozowana emerytura przekracza oczekiwania';
  }
  
  const gapPercentage = ((gap / expected) * 100).toFixed(1);
  return `Różnica między oczekiwaną a prognozowaną emeryturą: ${gapPercentage}%`;
};

/**
 * Generate keyboard navigation instructions
 */
export const getKeyboardInstructions = (): string => {
  return 'Użyj klawisza Tab do nawigacji między elementami, Enter lub spacja do aktywacji';
};

/**
 * Generate screen reader description for charts
 */
export const generateChartDescription = (
  chartType: 'bar' | 'gauge' | 'comparison',
  data: any
): string => {
  switch (chartType) {
    case 'bar':
      return `Wykres słupkowy przedstawiający ${data.length} wartości`;
    case 'gauge':
      return `Wskaźnik kołowy pokazujący wartość ${data.value} z maksimum ${data.max}`;
    case 'comparison':
      return `Wykres porównawczy pokazujący różnicę między wartościami`;
    default:
      return 'Wykres z danymi emerytalnymi';
  }
};

/**
 * Get focus management attributes
 */
export const getFocusAttributes = (isInteractive: boolean = true) => {
  if (!isInteractive) {
    return {
      tabIndex: -1,
      'aria-hidden': true,
    };
  }
  
  return {
    tabIndex: 0,
    role: 'button',
  };
};

/**
 * Get ARIA attributes for loading state
 */
export const getLoadingAriaAttributes = () => {
  return {
    'aria-live': 'polite' as const,
    'aria-busy': true,
    'aria-label': 'Ładowanie wyników symulacji',
  };
};

/**
 * Get ARIA attributes for error state
 */
export const getErrorAriaAttributes = (errorMessage: string) => {
  return {
    'aria-live': 'assertive' as const,
    'aria-atomic': true,
    'aria-label': `Błąd: ${errorMessage}`,
    role: 'alert',
  };
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation duration based on user preferences
 */
export const getAnimationDuration = (defaultDuration: number): number => {
  return prefersReducedMotion() ? 0 : defaultDuration;
};