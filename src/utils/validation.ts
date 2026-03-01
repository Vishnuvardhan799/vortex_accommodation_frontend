/**
 * Validation utilities for Vortex 2026 Accommodation System
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validate date range
 */
export const validateDateRange = (fromDate: string, toDate: string): boolean => {
  return fromDate <= toDate;
};

/**
 * Validate required field
 */
export const validateRequired = (value: string | undefined | null): boolean => {
  return value !== undefined && value !== null && value.trim().length > 0;
};

/**
 * Get email validation error message
 */
export const getEmailErrorMessage = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }
  if (!validateEmail(email)) {
    return 'Invalid email format';
  }
  return null;
};

/**
 * Get date range validation error message
 */
export const getDateRangeErrorMessage = (fromDate: string, toDate: string): string | null => {
  if (!fromDate || !toDate) {
    return 'Both dates are required';
  }
  if (!validateDateRange(fromDate, toDate)) {
    return 'From date must be before or equal to To date';
  }
  return null;
};
