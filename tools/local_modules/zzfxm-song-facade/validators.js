export const validateInRange = (value, min, max, context = 'value') => {
  if (value < min || value > max) {
    throw new Error(`${context} out of range.`);
  }
}
