/**
 * Ensure a number is between a given range
 *
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(value, max));
};


/**
 * Rounds a number to a number of decimal places
 *
 * @param {number} value - The number to round
 * @param {number} decimalPlaces - Number of decimal places to round to
 */
export const round = (value, decimalPlaces = 2) => {
  const pow = Math.pow(10, decimalPlaces);
  return Math.round(value * pow) / pow;
};


/**
 * Determines if a HMTLElement is an input element
 *
 * @param {HTMLElement} element - The element to test.
 */
export const isInputElement = element => {
  return 'form' in element;
};
