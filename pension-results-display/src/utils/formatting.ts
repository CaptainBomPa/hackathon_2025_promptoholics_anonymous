/**
 * Formatting utilities for pension results display
 * Handles currency, percentage, and date formatting for Polish locale
 */

/**
 * Format currency amount in Polish locale
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format currency amount with decimal places
 */
export const formatCurrencyDetailed = (amount: number): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format percentage with proper decimal places
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Format large numbers with thousand separators
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pl-PL').format(value);
};

/**
 * Format date in Polish locale
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format year only
 */
export const formatYear = (year: number): string => {
  return year.toString();
};

/**
 * Format amount difference with sign
 */
export const formatAmountDifference = (amount: number): string => {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${formatCurrency(amount)}`;
};

/**
 * Format percentage difference with sign
 */
export const formatPercentageDifference = (value: number, decimals: number = 1): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatPercentage(value, decimals)}`;
};

/**
 * Get readable description for replacement rate
 */
export const getReplacementRateDescription = (rate: number): string => {
  if (rate >= 70) {
    return 'Bardzo dobra stopa zastąpienia';
  } else if (rate >= 50) {
    return 'Dobra stopa zastąpienia';
  } else if (rate >= 30) {
    return 'Umiarkowana stopa zastąpienia';
  } else {
    return 'Niska stopa zastąpienia';
  }
};

/**
 * Get color for replacement rate based on value
 */
export const getReplacementRateColor = (rate: number): 'success' | 'warning' | 'error' => {
  if (rate >= 50) {
    return 'success';
  } else if (rate >= 30) {
    return 'warning';
  } else {
    return 'error';
  }
};

/**
 * Format work years needed message
 */
export const formatWorkYearsMessage = (years: number): string => {
  if (years <= 0) {
    return 'Twoja prognozowana emerytura przekracza oczekiwania!';
  } else if (years === 1) {
    return `Musisz pracować o ${years} rok dłużej, aby osiągnąć oczekiwaną emeryturę.`;
  } else if (years < 5) {
    return `Musisz pracować o ${years} lata dłużej, aby osiągnąć oczekiwaną emeryturę.`;
  } else {
    return `Musisz pracować o ${years} lat dłużej, aby osiągnąć oczekiwaną emeryturę.`;
  }
};

/**
 * Format sick leave impact message
 */
export const formatSickLeaveImpact = (impactAmount: number): string => {
  if (impactAmount === 0) {
    return 'Okresy chorobowe nie wpływają na wysokość Twojej emerytury.';
  } else {
    return `Okresy chorobowe obniżają Twoją emeryturę o ${formatCurrency(Math.abs(impactAmount))} miesięcznie.`;
  }
};